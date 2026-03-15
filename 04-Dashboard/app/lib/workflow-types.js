"use strict";
// GPO Workflow Types — Part 71: End-to-End Workflow Orchestration + Autopilot
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSITIONS = exports.DEFAULT_AUTOPILOT = void 0;
exports.DEFAULT_AUTOPILOT = {
    enabled: false,
    scope: 'workflow',
    max_auto_promotions_per_day: 3,
    gates_allowed: [],
    require_human_for: [],
    budget_guardrails: {},
};
// Transition map: [currentStage][trigger] → nextStage
exports.TRANSITIONS = {
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
    DEFAULT_AUTOPILOT: exports.DEFAULT_AUTOPILOT,
    TRANSITIONS: exports.TRANSITIONS,
};
//# sourceMappingURL=workflow-types.js.map