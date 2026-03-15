"use strict";
// GPO Scheduler Bridge — Bridge orchestrator to parallel execution engine (Part 70)
Object.defineProperty(exports, "__esModule", { value: true });
exports.schedulePlan = schedulePlan;
exports.holdForApproval = holdForApproval;
exports.requeueStalled = requeueStalled;
function schedulePlan(workflowId, plan, ctx) {
    try {
        const scheduler = require('./scheduler/scheduler');
        const store = require('./state/scheduler-store');
        const cfg = store.loadConfig();
        if (cfg.featureFlags.enabled) {
            scheduler.submitRun(workflowId, plan, ctx);
            return { tasks: plan.length };
        }
    }
    catch { /* scheduler not available */ }
    // Serial fallback: just return the count
    return { tasks: plan.length };
}
function holdForApproval(workflowId, gates) {
    try {
        const scheduler = require('./scheduler/scheduler');
        if (scheduler.isPaused && !scheduler.isPaused()) {
            // Don't pause entire scheduler, just note the hold
            console.log(`[scheduler-bridge] Workflow ${workflowId} holding for approval gates: ${gates.join(', ')}`);
        }
    }
    catch { /* */ }
}
function requeueStalled(workflowId) {
    try {
        const dag = require('./scheduler/dag-runner');
        const run = dag.getRun(workflowId);
        if (run) {
            console.log(`[scheduler-bridge] Requeuing stalled tasks for workflow ${workflowId}`);
        }
    }
    catch { /* */ }
}
module.exports = { schedulePlan, holdForApproval, requeueStalled };
//# sourceMappingURL=scheduler-bridge.js.map