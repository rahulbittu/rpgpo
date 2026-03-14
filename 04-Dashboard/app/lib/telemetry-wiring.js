"use strict";
// GPO Telemetry Wiring — Auto-emit telemetry from real execution paths
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitTelemetry = emitTelemetry;
exports.getWiringReport = getWiringReport;
exports.getWiringByArea = getWiringByArea;
function uid() { return 'tw_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
/** Emit telemetry if observability module is available */
function emitTelemetry(category, action, outcome, durationMs, metadata) {
    try {
        const obs = require('./observability');
        obs.emit({ category, action, outcome, duration_ms: durationMs, ...metadata });
    }
    catch { /* observability not loaded */ }
}
/** Get telemetry wiring coverage report */
function getWiringReport() {
    const flows = [
        // Fully wired (Part 45 additions in approval-workspace, escalation-inbox, release-orchestration, execution-graph)
        { flow: 'task_intake', state: 'fully_wired', detail: 'Intake createTask emits on creation' },
        { flow: 'execution_graph_transition', state: 'fully_wired', detail: 'updateGraphStatus/updateNodeStatus emit on transition (Part 27+45)' },
        { flow: 'approval_decision', state: 'fully_wired', detail: 'applyDecision emits approve/reject/request_evidence (Part 45)' },
        { flow: 'escalation_triage_resolve', state: 'fully_wired', detail: 'resolveItem/triageItem emit on action (Part 45)' },
        { flow: 'release_execute_verify', state: 'fully_wired', detail: 'executePlan/verifyExecution emit on action (Part 45)' },
        { flow: 'rollback_execute', state: 'fully_wired', detail: 'executePlan emits on rollback (Part 45)' },
        { flow: 'override_approve_reject', state: 'fully_wired', detail: 'approveOverride/rejectOverride emit (Part 45)' },
        { flow: 'runtime_enforcement_check', state: 'fully_wired', detail: 'checkTransition emits on every enforcement evaluation (Part 27)' },
        // Partially wired
        { flow: 'board_deliberation', state: 'partially_wired', detail: 'Deliberation records costs but doesn\'t emit telemetry event' },
        { flow: 'chief_of_staff_planning', state: 'partially_wired', detail: 'CoS methods don\'t emit individual telemetry events' },
        { flow: 'provider_routing', state: 'partially_wired', detail: 'Provider selection tracked in fits but not as telemetry events' },
        { flow: 'worker_governance', state: 'partially_wired', detail: 'Worker decisions recorded but not as telemetry' },
        // Missing
        { flow: 'security_finding_detection', state: 'missing', detail: 'Security findings don\'t emit telemetry events' },
        { flow: 'boundary_violation', state: 'missing', detail: 'Boundary violations don\'t emit telemetry events' },
        { flow: 'collaboration_session', state: 'missing', detail: 'Collaboration sessions don\'t emit telemetry events' },
    ];
    const fully = flows.filter(f => f.state === 'fully_wired').length;
    const partial = flows.filter(f => f.state === 'partially_wired').length;
    const missing = flows.filter(f => f.state === 'missing').length;
    return { report_id: uid(), flows, fully_wired: fully, partially_wired: partial, missing, total: flows.length, created_at: new Date().toISOString() };
}
/** Get wiring by area */
function getWiringByArea(area) {
    return getWiringReport().flows.filter(f => f.flow.includes(area));
}
module.exports = { emitTelemetry, getWiringReport, getWiringByArea };
//# sourceMappingURL=telemetry-wiring.js.map