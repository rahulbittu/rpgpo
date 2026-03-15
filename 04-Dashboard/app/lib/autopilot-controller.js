"use strict";
// GPO Autopilot Controller — Policy evaluation and auto-advance logic
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolicyFor = getPolicyFor;
exports.canAutoAdvance = canAutoAdvance;
exports.recordAutoAdvance = recordAutoAdvance;
exports.canAutoApproveGate = canAutoApproveGate;
const fs = require('fs');
const path = require('path');
const FLAGS_FILE = path.resolve(__dirname, '..', '..', 'state', 'config', 'feature-flags.json');
const _dailyCounters = new Map();
function loadFlags() {
    try {
        if (fs.existsSync(FLAGS_FILE))
            return JSON.parse(fs.readFileSync(FLAGS_FILE, 'utf-8'));
    }
    catch { /* */ }
    return { autopilot: { defaultEnabled: false, maxAutoPromotionsPerDayDefault: 3 } };
}
function getPolicyFor(policy) {
    const flags = loadFlags();
    return {
        enabled: policy?.enabled ?? flags.autopilot.defaultEnabled,
        scope: policy?.scope || 'workflow',
        max_auto_promotions_per_day: policy?.max_auto_promotions_per_day ?? flags.autopilot.maxAutoPromotionsPerDayDefault,
        gates_allowed: policy?.gates_allowed || [],
        require_human_for: policy?.require_human_for || [],
        budget_guardrails: policy?.budget_guardrails || {},
    };
}
function canAutoAdvance(workflowId, policy, nextStage) {
    if (!policy.enabled)
        return false;
    // Check daily cap
    const today = new Date().toISOString().slice(0, 10);
    const counter = _dailyCounters.get(workflowId) || { count: 0, date: today };
    if (counter.date !== today) {
        counter.count = 0;
        counter.date = today;
    }
    const maxDaily = policy.max_auto_promotions_per_day ?? 3;
    if (counter.count >= maxDaily)
        return false;
    // Auto-advance only for certain transitions
    const autoAdvanceable = ['approved', 'release_candidate_prepared', 'released'];
    if (!autoAdvanceable.includes(nextStage) && nextStage !== 'deliberation_planned' && nextStage !== 'scheduled' && nextStage !== 'executing') {
        return false;
    }
    return true;
}
function recordAutoAdvance(workflowId) {
    const today = new Date().toISOString().slice(0, 10);
    const counter = _dailyCounters.get(workflowId) || { count: 0, date: today };
    if (counter.date !== today) {
        counter.count = 0;
        counter.date = today;
    }
    counter.count++;
    _dailyCounters.set(workflowId, counter);
}
function canAutoApproveGate(gateId, policy) {
    if (!policy.enabled)
        return false;
    if (policy.require_human_for.includes(gateId))
        return false;
    if (policy.gates_allowed.length > 0 && !policy.gates_allowed.includes(gateId))
        return false;
    return true;
}
module.exports = { getPolicyFor, canAutoAdvance, recordAutoAdvance, canAutoApproveGate };
//# sourceMappingURL=autopilot-controller.js.map