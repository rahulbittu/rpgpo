// GPO Governed Autonomy Engine
// Decides what can auto-continue and what must stop for the operator.
// Enforces budget, privacy, provider, and policy restrictions.
// Every stop has a typed reason. Every resume has a clear path.

import type {
  Subtask, IntakeTask, Domain, Provider, RiskLevel,
  Blocker, BlockerReason, ContinuationDecision, PreExecutionCheck,
  BudgetCheck, PrivacyPolicy,
} from './types';

const costs = require('./costs') as { checkBudget(provider: string): BudgetCheck };
const instanceMod = require('./instance') as {
  isProviderAllowed(provider: Provider): boolean;
  isMissionIsolated(domain: Domain): boolean;
  isCapabilityEnabled(capId: string): boolean;
  getPrivacyPolicy(): PrivacyPolicy;
};

function uid(): string {
  return 'blk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ═══════════════════════════════════════════
// Pre-Execution Checks — run before any subtask starts
// ═══════════════════════════════════════════

/** Check if a subtask can safely execute. Returns all blockers. */
export function checkBeforeExecution(subtask: Subtask, task: IntakeTask): PreExecutionCheck {
  const blockers: Blocker[] = [];
  const warnings: string[] = [];
  const domain = subtask.domain as Domain;
  const model = subtask.assigned_model as Provider;

  // 1. Provider availability
  if (model !== 'claude' && !instanceMod.isProviderAllowed(model)) {
    blockers.push(createBlocker(
      'provider_unavailable',
      `Provider "${model}" is not enabled for this instance`,
      `The subtask "${subtask.title}" requires ${model}, which is not in the allowed providers list.`,
      domain, task.task_id, subtask.subtask_id,
      'Enable provider in instance settings', 'Enable Provider', 'high'
    ));
  }

  // 2. Privacy/isolation check
  if (model !== 'claude' && instanceMod.isMissionIsolated(domain)) {
    blockers.push(createBlocker(
      'privacy_restricted',
      `Mission "${domain}" is isolated — cannot send data to ${model}`,
      `Privacy policy restricts sending ${domain} data to external providers.`,
      domain, task.task_id, subtask.subtask_id,
      'Use Claude (local) or remove isolation', 'Review Privacy', 'high'
    ));
  }

  // 3. Budget check (for paid providers)
  if (model !== 'claude') {
    const budgetCheck = costs.checkBudget(model);
    if (!budgetCheck.ok) {
      blockers.push(createBlocker(
        'budget_exceeded',
        `Budget exceeded for ${model}: $${budgetCheck.todayCost?.toFixed(2)} / $${budgetCheck.limit?.toFixed(2)}`,
        `Daily spend limit reached. ${budgetCheck.reason || ''}`,
        domain, task.task_id, subtask.subtask_id,
        'Increase budget limit or wait until tomorrow', 'Adjust Budget', 'medium'
      ));
    }
  }

  // 4. Capability check
  const stageToCapability: Record<string, string> = {
    implement: 'coding', build: 'coding', code: 'coding',
    research: 'research', audit: 'research',
    strategy: 'deliberation', decide: 'deliberation',
    report: 'report-generation', review: 'approval-handling',
    locate_files: 'repo-grounding',
  };
  const requiredCap = stageToCapability[subtask.stage];
  if (requiredCap && !instanceMod.isCapabilityEnabled(requiredCap)) {
    blockers.push(createBlocker(
      'policy_blocked',
      `Capability "${requiredCap}" is not enabled`,
      `This subtask requires the "${requiredCap}" capability which is disabled for this instance.`,
      domain, task.task_id, subtask.subtask_id,
      'Enable capability in instance settings', 'Enable Capability', 'medium'
    ));
  }

  // 5. Risk-based approval requirement
  if (subtask.risk_level === 'red') {
    blockers.push(createBlocker(
      'approval_required',
      `Red-risk subtask requires explicit approval`,
      `"${subtask.title}" is classified as red risk and cannot auto-execute.`,
      domain, task.task_id, subtask.subtask_id,
      'Review and approve this subtask', 'Approve', 'high'
    ));
  }
  if (subtask.risk_level === 'yellow' && subtask.approval_required) {
    blockers.push(createBlocker(
      'approval_required',
      `Yellow-risk subtask flagged for approval`,
      `"${subtask.title}" is flagged as requiring operator approval before execution.`,
      domain, task.task_id, subtask.subtask_id,
      'Review and approve this subtask', 'Approve', 'medium'
    ));
  }

  // Warnings (non-blocking)
  if (model === 'claude' && subtask.stage === 'implement') {
    warnings.push('Builder execution — will stop for code review after completion');
  }

  return {
    can_execute: blockers.length === 0,
    blockers,
    warnings,
  };
}

// ═══════════════════════════════════════════
// Continuation Decisions
// ═══════════════════════════════════════════

/** Decide what happens after a subtask completes */
export function decideContinuation(
  completedSubtask: Subtask,
  nextReady: Subtask[],
  parentTask: IntakeTask
): ContinuationDecision {
  if (!nextReady.length) {
    return { action: 'continue', reason: 'No more subtasks to queue', next_subtask_ids: [] };
  }

  const canContinue: string[] = [];
  const mustStop: Blocker[] = [];

  for (const next of nextReady) {
    const check = checkBeforeExecution(next, parentTask);
    if (check.can_execute) {
      // Green subtasks auto-continue; yellow/red stop
      if (next.risk_level === 'green' && !next.approval_required) {
        canContinue.push(next.subtask_id);
      } else {
        mustStop.push(createBlocker(
          'approval_required',
          `"${next.title}" needs approval before execution`,
          `Risk: ${next.risk_level}. Stage: ${next.stage}.`,
          next.domain as Domain, parentTask.task_id, next.subtask_id,
          'Approve this subtask', 'Approve', next.risk_level === 'red' ? 'high' : 'medium'
        ));
      }
    } else {
      mustStop.push(...check.blockers);
    }
  }

  if (canContinue.length > 0 && mustStop.length === 0) {
    return {
      action: 'continue',
      reason: `Auto-continuing ${canContinue.length} green subtask(s)`,
      next_subtask_ids: canContinue,
    };
  }

  if (canContinue.length > 0 && mustStop.length > 0) {
    return {
      action: 'continue',
      reason: `Auto-continuing ${canContinue.length} subtask(s); ${mustStop.length} need approval`,
      next_subtask_ids: canContinue,
      blocker: mustStop[0],
    };
  }

  return {
    action: 'stop',
    reason: mustStop[0]?.description || 'Blocked — operator action required',
    blocker: mustStop[0],
    next_subtask_ids: [],
  };
}

// ═══════════════════════════════════════════
// Blocker Management
// ═══════════════════════════════════════════

function createBlocker(
  reason: BlockerReason, title: string, description: string,
  domain: Domain, taskId?: string, subtaskId?: string,
  resumeAction?: string, resumeLabel?: string,
  severity: Blocker['severity'] = 'medium'
): Blocker {
  return {
    id: uid(),
    reason, title, description, domain,
    task_id: taskId, subtask_id: subtaskId,
    resume_action: resumeAction || 'Resolve blocker',
    resume_label: resumeLabel || 'Resume',
    created_at: new Date().toISOString(),
    severity,
  };
}

/** Classify a subtask's current state into a blocker (if applicable) */
export function subtaskToBlocker(subtask: Subtask, parentTitle: string): Blocker | null {
  const domain = subtask.domain as Domain;

  if (subtask.status === 'waiting_approval' && subtask.builder_outcome === 'code_applied') {
    return createBlocker(
      'code_review_required',
      `Code review: ${subtask.title}`,
      `${subtask.files_changed?.length || 0} file(s) changed. Review and approve or reject.`,
      domain, subtask.parent_task_id, subtask.subtask_id,
      'Review code changes', 'Review', 'high'
    );
  }

  if (subtask.status === 'builder_fallback') {
    return createBlocker(
      'builder_fallback',
      `Builder fallback: ${subtask.title}`,
      `Claude CLI could not execute. Manual session required or re-run.`,
      domain, subtask.parent_task_id, subtask.subtask_id,
      'Re-run builder or confirm manual execution', 'Re-run', 'high'
    );
  }

  if (subtask.status === 'waiting_approval') {
    return createBlocker(
      'approval_required',
      `Approval needed: ${subtask.title}`,
      `Stage: ${subtask.stage}, Risk: ${subtask.risk_level}`,
      domain, subtask.parent_task_id, subtask.subtask_id,
      'Approve this subtask', 'Approve', subtask.risk_level === 'red' ? 'high' : 'medium'
    );
  }

  if (subtask.status === 'waiting_human') {
    return createBlocker(
      'manual_action_required',
      `Manual action: ${subtask.title}`,
      `This subtask requires a manual step from the operator.`,
      domain, subtask.parent_task_id, subtask.subtask_id,
      'Complete manual action and confirm', 'Done', 'medium'
    );
  }

  return null;
}

/** Get all current blockers across all active tasks */
export function getAllBlockers(): Blocker[] {
  const intakeMod = require('./intake') as {
    getAllTasks(): IntakeTask[];
    getSubtasksForTask(taskId: string): Subtask[];
  };

  const blockers: Blocker[] = [];
  const tasks = intakeMod.getAllTasks();

  for (const task of tasks) {
    if (['done', 'failed', 'canceled'].includes(task.status)) continue;

    // Task-level blockers
    if (task.status === 'planned') {
      blockers.push(createBlocker(
        'approval_required',
        `Plan needs approval: ${task.title.slice(0, 60)}`,
        `Board deliberation complete. Review plan and approve to start execution.`,
        task.domain as Domain, task.task_id, undefined,
        'Review and approve plan', 'Approve Plan', 'medium'
      ));
    }

    if (task.status === 'intake') {
      blockers.push(createBlocker(
        'manual_action_required',
        `New task needs deliberation: ${task.title.slice(0, 60)}`,
        `Task submitted but not yet sent to the Board.`,
        task.domain as Domain, task.task_id, undefined,
        'Send to Board for deliberation', 'Deliberate', 'low'
      ));
    }

    // Subtask-level blockers
    const subtasks = intakeMod.getSubtasksForTask(task.task_id);
    for (const st of subtasks) {
      const blocker = subtaskToBlocker(st, task.title);
      if (blocker) blockers.push(blocker);
    }
  }

  // Sort by severity
  const severityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
  blockers.sort((a, b) => (severityOrder[a.severity] ?? 4) - (severityOrder[b.severity] ?? 4));

  return blockers;
}

module.exports = {
  checkBeforeExecution,
  decideContinuation,
  subtaskToBlocker,
  getAllBlockers,
};
