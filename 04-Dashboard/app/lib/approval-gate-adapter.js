"use strict";
// GPO Approval Gate Adapter — Uniform gate status interface for workflow orchestrator
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRequiredGates = registerRequiredGates;
exports.getGateStatuses = getGateStatuses;
exports.onApprovalDecision = onApprovalDecision;
exports.emitDecision = emitDecision;
const _callbacks = [];
function registerRequiredGates(workflowId, gates) {
    // Store gate requirements — in practice this would persist to approval-gates.ts
    console.log(`[approval-gate-adapter] Registered ${gates.length} gates for workflow ${workflowId}`);
}
function getGateStatuses(workflowId) {
    // Check existing approval gates system
    const statuses = {};
    try {
        const ag = require('./approval-gates');
        if (ag.getGatesForGraph) {
            const gates = ag.getGatesForGraph(workflowId);
            for (const gate of gates || []) {
                statuses[gate.gate_id] = gate.status === 'approved' ? 'open'
                    : gate.status === 'rejected' ? 'blocked'
                        : 'blocked';
            }
        }
    }
    catch { /* */ }
    return statuses;
}
function onApprovalDecision(cb) {
    _callbacks.push(cb);
    return () => {
        const idx = _callbacks.indexOf(cb);
        if (idx >= 0)
            _callbacks.splice(idx, 1);
    };
}
function emitDecision(e) {
    for (const cb of _callbacks) {
        try {
            cb(e);
        }
        catch { /* */ }
    }
}
module.exports = { registerRequiredGates, getGateStatuses, onApprovalDecision, emitDecision };
//# sourceMappingURL=approval-gate-adapter.js.map