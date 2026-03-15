// GPO Workflow Types — Part 71: End-to-End Workflow Orchestration + Autopilot

export type WorkflowId = string;

export type WorkflowStage =
  | 'intake_received'
  | 'deliberation_planned'
  | 'scheduled'
  | 'executing'
  | 'merging'
  | 'validating'
  | 'awaiting_approval'
  | 'approved'
  | 'release_candidate_prepared'
  | 'released'
  | 'paused'
  | 'blocked'
  | 'failed'
  | 'cancelled';

export type WorkflowTransitionTrigger =
  | 'intake_enqueued'
  | 'deliberation_completed'
  | 'plan_committed'
  | 'tasks_scheduled'
  | 'task_batch_started'
  | 'task_batch_completed'
  | 'merge_completed'
  | 'validation_passed'
  | 'gate_blocked'
  | 'approval_granted'
  | 'approval_rejected'
  | 'release_candidate_assembled'
  | 'release_promoted'
  | 'pause_requested'
  | 'resume_requested'
  | 'cancel_requested'
  | 'failure_detected'
  | 'system_recover';

export type GateStatus = 'open' | 'blocked' | 'escalated';

export interface AutopilotPolicy {
  enabled: boolean;
  scope: 'tenant' | 'project' | 'workflow';
  max_auto_promotions_per_day?: number;
  gates_allowed: string[];
  require_human_for: string[];
  budget_guardrails: {
    max_tokens_per_workflow?: number;
    max_cost_usd?: number;
    max_parallelism?: number;
  };
}

export interface TimelineEntry {
  at: string;
  from?: WorkflowStage;
  to: WorkflowStage;
  trigger: WorkflowTransitionTrigger;
  by: 'system' | 'operator' | 'autopilot';
  evidenceId?: string;
  note?: string;
}

export interface WorkflowInstance {
  id: WorkflowId;
  tenantId: string;
  projectId: string;
  intakeRef: { intakeId: string; source: 'api' | 'ui' | 'file' };
  state: WorkflowStage;
  autopilot: AutopilotPolicy;
  createdAt: string;
  updatedAt: string;
  retries: { count: number; lastAt?: string };
  counters: {
    tasksScheduled: number;
    tasksCompleted: number;
    merges: number;
    validations: number;
    autoAdvances: number;
  };
  approvals: {
    gateId: string;
    status: GateStatus;
    decidedBy?: string;
    decidedAt?: string;
    reason?: string;
  }[];
  deliverableRefs: { id: string; version: string; contract: string }[];
  releaseRef?: {
    candidateId?: string;
    releaseId?: string;
    status?: 'pending' | 'released' | 'failed';
  };
  timeline: TimelineEntry[];
  flags: {
    paused: boolean;
    blockedReason?: string;
    circuitOpen?: boolean;
  };
  idempotencyKeys: string[];
}

export const DEFAULT_AUTOPILOT: AutopilotPolicy = {
  enabled: false,
  scope: 'workflow',
  max_auto_promotions_per_day: 3,
  gates_allowed: [],
  require_human_for: [],
  budget_guardrails: {},
};

// Transition map: [currentStage][trigger] → nextStage
export const TRANSITIONS: Record<string, Record<string, WorkflowStage>> = {
  intake_received: { deliberation_completed: 'deliberation_planned' },
  deliberation_planned: { plan_committed: 'scheduled' },
  scheduled: { tasks_scheduled: 'executing', task_batch_started: 'executing' },
  executing: { task_batch_completed: 'merging', failure_detected: 'failed' },
  merging: { merge_completed: 'validating' },
  validating: { validation_passed: 'approved', gate_blocked: 'awaiting_approval' },
  awaiting_approval: { approval_granted: 'approved', approval_rejected: 'failed' },
  approved: { release_candidate_assembled: 'release_candidate_prepared' },
  release_candidate_prepared: { release_promoted: 'released', failure_detected: 'failed' },
};

module.exports = {
  DEFAULT_AUTOPILOT,
  TRANSITIONS,
};
