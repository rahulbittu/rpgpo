// GPO Workflow Orchestrator — Core state machine with transitions, events, and integrations

import type {
  WorkflowInstance, WorkflowStage, WorkflowTransitionTrigger,
  TimelineEntry, AutopilotPolicy, GateStatus,
} from './workflow-types';

const workflowStore = require('./workflow-store');
const autopilot = require('./autopilot-controller');
const schedulerBridge = require('./scheduler-bridge');
const approvalAdapter = require('./approval-gate-adapter');
const releaseTrigger = require('./release-trigger');
const orcEvents = require('./orchestrator-events');
const telemetry = require('./orchestrator-telemetry');
const { TRANSITIONS, DEFAULT_AUTOPILOT } = require('./workflow-types');

/**
 * Initialize orchestrator — recover dangling workflows on boot.
 */
export function init(): { recovered: string[]; stale: string[] } {
  const report = workflowStore.recoverDangling();

  // Subscribe to approval decisions
  approvalAdapter.onApprovalDecision((e: any) => {
    try {
      handleEvent({
        type: e.decision === 'approve' ? 'approval_granted' : 'approval_rejected',
        workflowId: e.workflowId,
        gateId: e.gateId,
        by: e.by,
        reason: e.reason,
      });
    } catch { /* non-fatal */ }
  });

  console.log(`[orchestrator] Initialized. Stale: ${report.stale.length}`);
  return report;
}

/**
 * Create a workflow from an intake item.
 */
export function createFromIntake(intakeId: string, options: {
  tenantId: string;
  projectId: string;
  autopilot?: Partial<AutopilotPolicy>;
}): WorkflowInstance {
  const id = workflowStore.generateId();
  const now = new Date().toISOString();

  const instance: WorkflowInstance = {
    id,
    tenantId: options.tenantId,
    projectId: options.projectId,
    intakeRef: { intakeId, source: 'api' },
    state: 'intake_received',
    autopilot: autopilot.getPolicyFor(options.autopilot),
    createdAt: now,
    updatedAt: now,
    retries: { count: 0 },
    counters: { tasksScheduled: 0, tasksCompleted: 0, merges: 0, validations: 0, autoAdvances: 0 },
    approvals: [],
    deliverableRefs: [],
    timeline: [{
      at: now, to: 'intake_received',
      trigger: 'intake_enqueued', by: 'system',
    }],
    flags: { paused: false },
    idempotencyKeys: [],
  };

  const evidenceId = orcEvents.createEvidence({
    kind: 'workflow_event', workflowId: id,
    to: 'intake_received', trigger: 'intake_enqueued', by: 'system',
  });
  instance.timeline[0].evidenceId = evidenceId;

  telemetry.incrementTransition(undefined, 'intake_received');
  return workflowStore.create(instance);
}

/**
 * Handle an orchestrator event — drive state machine transitions.
 */
export function handleEvent(event: { type: string; workflowId: string; [key: string]: any }): WorkflowInstance | null {
  const instance = workflowStore.get(event.workflowId);
  if (!instance) return null;

  const trigger = event.type as WorkflowTransitionTrigger;
  const currentState = instance.state;

  // Check pause
  if (instance.flags.paused && trigger !== 'resume_requested') {
    return instance;
  }

  // Handle special triggers
  if (trigger === 'pause_requested') {
    return transitionTo(instance, 'paused', trigger, event.by || 'operator', event.reason);
  }
  if (trigger === 'resume_requested') {
    instance.flags.paused = false;
    // Resume to previous processing state or intake_received
    const resumeTo = findResumeTarget(instance);
    return transitionTo(instance, resumeTo, trigger, event.by || 'operator', event.reason);
  }
  if (trigger === 'cancel_requested') {
    return transitionTo(instance, 'cancelled', trigger, event.by || 'operator', event.reason);
  }
  if (trigger === 'failure_detected') {
    telemetry.incrementError();
    return transitionTo(instance, 'failed', trigger, 'system', event.reason);
  }

  // Look up transition
  const stateTransitions = TRANSITIONS[currentState];
  if (!stateTransitions || !stateTransitions[trigger]) {
    return instance; // no valid transition
  }

  const nextState = stateTransitions[trigger] as WorkflowStage;
  const by = event.by || 'system';

  const updated = transitionTo(instance, nextState, trigger, by, event.reason);

  // Post-transition actions
  postTransitionActions(updated, nextState, trigger);

  return updated;
}

/**
 * Advance a workflow (operator or autopilot triggered).
 */
export function advance(id: string, reason: string, by: 'system' | 'operator' | 'autopilot'): WorkflowInstance | null {
  const instance = workflowStore.get(id);
  if (!instance) return null;

  // Determine next trigger based on current state
  const triggerMap: Partial<Record<WorkflowStage, WorkflowTransitionTrigger>> = {
    intake_received: 'deliberation_completed',
    deliberation_planned: 'plan_committed',
    scheduled: 'tasks_scheduled',
    executing: 'task_batch_completed',
    merging: 'merge_completed',
    validating: 'validation_passed',
    awaiting_approval: 'approval_granted',
    approved: 'release_candidate_assembled',
    release_candidate_prepared: 'release_promoted',
  };

  const trigger = triggerMap[instance.state];
  if (!trigger) return instance;

  if (by === 'autopilot') {
    const nextState = TRANSITIONS[instance.state]?.[trigger];
    if (!nextState || !autopilot.canAutoAdvance(id, instance.autopilot, nextState)) {
      return instance;
    }
    autopilot.recordAutoAdvance(id);
    telemetry.incrementAutoAdvance();
    instance.counters.autoAdvances++;
  }

  return handleEvent({ type: trigger, workflowId: id, by, reason });
}

export function pause(id: string, by: string, reason?: string): WorkflowInstance | null {
  return handleEvent({ type: 'pause_requested', workflowId: id, by, reason });
}

export function resume(id: string, by: string, reason?: string): WorkflowInstance | null {
  return handleEvent({ type: 'resume_requested', workflowId: id, by, reason });
}

export function cancel(id: string, by: string, reason?: string): WorkflowInstance | null {
  return handleEvent({ type: 'cancel_requested', workflowId: id, by, reason });
}

export function evaluateGates(id: string): { status: GateStatus; blocked: string[]; open: string[] } {
  const instance = workflowStore.get(id);
  if (!instance) return { status: 'blocked', blocked: [], open: [] };

  const gateStatuses = approvalAdapter.getGateStatuses(id);
  const blocked: string[] = [];
  const open: string[] = [];

  for (const [gateId, status] of Object.entries(gateStatuses)) {
    if (status === 'open') open.push(gateId);
    else blocked.push(gateId);
  }

  // Check autopilot auto-approve
  for (const gateId of blocked) {
    if (autopilot.canAutoApproveGate(gateId, instance.autopilot)) {
      open.push(gateId);
      blocked.splice(blocked.indexOf(gateId), 1);
    }
  }

  const overallStatus: GateStatus = blocked.length === 0 ? 'open' : 'blocked';
  return { status: overallStatus, blocked, open };
}

// ── Internal Helpers ──

function transitionTo(instance: WorkflowInstance, to: WorkflowStage, trigger: WorkflowTransitionTrigger, by: string, note?: string): WorkflowInstance {
  const from = instance.state;
  const now = new Date().toISOString();

  // Record stage duration
  if (instance.timeline.length > 0) {
    const lastEntry = instance.timeline[instance.timeline.length - 1];
    const duration = new Date(now).getTime() - new Date(lastEntry.at).getTime();
    telemetry.recordStageDuration(from, duration);
  }

  const evidenceId = orcEvents.createEvidence({
    kind: 'workflow_event', workflowId: instance.id,
    from, to, trigger, by, note,
  });

  const entry: TimelineEntry = { at: now, from, to, trigger, by: by as any, evidenceId, note };
  instance.timeline.push(entry);
  instance.state = to;
  instance.updatedAt = now;

  if (to === 'paused') instance.flags.paused = true;

  telemetry.incrementTransition(from, to);

  const idempotencyKey = `${from}:${to}:${trigger}:${now}`;
  return workflowStore.update(instance, { idempotencyKey });
}

function findResumeTarget(instance: WorkflowInstance): WorkflowStage {
  // Find the last non-paused state
  for (let i = instance.timeline.length - 1; i >= 0; i--) {
    const entry = instance.timeline[i];
    if (entry.to !== 'paused' && entry.to !== 'cancelled' && entry.to !== 'failed') {
      return entry.to;
    }
  }
  return 'intake_received';
}

function postTransitionActions(instance: WorkflowInstance, state: WorkflowStage, _trigger: WorkflowTransitionTrigger): void {
  // Auto-advance logic for autopilot
  if (!instance.autopilot.enabled) return;

  if (state === 'deliberation_planned') {
    // Auto-schedule if autopilot
    if (autopilot.canAutoAdvance(instance.id, instance.autopilot, 'scheduled')) {
      setTimeout(() => advance(instance.id, 'Autopilot auto-schedule', 'autopilot'), 100);
    }
  }

  if (state === 'approved') {
    // Auto-assemble release candidate
    try {
      const rc = releaseTrigger.assembleReleaseCandidate(instance.id, instance.deliverableRefs);
      if (rc) {
        instance.releaseRef = { candidateId: rc.candidateId, status: 'pending' };
        workflowStore.update(instance);
        setTimeout(() => handleEvent({ type: 'release_candidate_assembled', workflowId: instance.id, by: 'system' }), 100);
      }
    } catch { /* */ }
  }

  if (state === 'release_candidate_prepared') {
    // Auto-promote if autopilot allows
    if (autopilot.canAutoAdvance(instance.id, instance.autopilot, 'released')) {
      try {
        const release = releaseTrigger.promoteRelease(instance.releaseRef?.candidateId || '');
        if (release) {
          instance.releaseRef = { ...instance.releaseRef, releaseId: release.releaseId, status: 'released' };
          telemetry.incrementAutoRelease();
          setTimeout(() => handleEvent({ type: 'release_promoted', workflowId: instance.id, by: 'autopilot' }), 100);
        }
      } catch { /* */ }
    }
  }
}

module.exports = { init, createFromIntake, handleEvent, advance, pause, resume, cancel, evaluateGates };
