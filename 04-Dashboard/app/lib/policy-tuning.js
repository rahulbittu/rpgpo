"use strict";
// GPO Adaptive Policy Tuning — Evidence-backed recommendations to adjust governance
// Generates recommendations from drift signals and exception analytics.
// Never auto-applied — requires explicit operator approval.
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateRecommendations = generateRecommendations;
exports.getAllRecommendations = getAllRecommendations;
exports.getRecommendationsForScope = getRecommendationsForScope;
exports.approveRecommendation = approveRecommendation;
exports.rejectRecommendation = rejectRecommendation;
exports.applyRecommendation = applyRecommendation;
exports.computeHealth = computeHealth;
exports.getHealthSnapshots = getHealthSnapshots;
const fs = require('fs');
const path = require('path');
const RECS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tuning-recommendations.json');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tuning-decisions.json');
const HEALTH_FILE = path.resolve(__dirname, '..', '..', 'state', 'governance-health.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Tuning Recommendation Generation
// ═══════════════════════════════════════════
/** Generate tuning recommendations from drift and exceptions */
function generateRecommendations(scopeLevel, scopeId, domain) {
    const recs = [];
    // Get drift signals
    let signals = [];
    try {
        const gd = require('./governance-drift');
        const report = gd.detectDrift(scopeLevel, scopeId, domain);
        signals = report.signals;
    }
    catch { /* */ }
    // Get exception aggregates
    let exceptions = null;
    try {
        const ea = require('./exception-analytics');
        exceptions = ea.aggregate({ domain, days: 30 });
    }
    catch { /* */ }
    for (const signal of signals) {
        switch (signal.category) {
            case 'repeated_override':
                recs.push(makeRec('loosen', 'enforcement_rule', scopeLevel, scopeId, `Loosen enforcement rule causing repeated overrides`, `Override type used ${signal.evidence_count} times — the rule may be too strict for current workflow`, 'Fewer override requests, faster execution', 'low', [signal.signal_id], signal.evidence_count));
                break;
            case 'chronic_sim_warnings':
                recs.push(makeRec('rescope', 'operator_policy', scopeLevel, scopeId, `Re-scope policies causing chronic simulation warnings`, `${signal.evidence_count} simulation warnings suggest policies don't match current practice`, 'Cleaner simulation results', 'medium', [signal.signal_id], signal.evidence_count));
                break;
            case 'frequent_promotion_blocks':
                recs.push(makeRec('loosen', 'promotion_policy', scopeLevel, scopeId, `Adjust promotion policy thresholds`, `${signal.evidence_count} promotion blocks — thresholds may be too aggressive for current maturity`, 'More promotions can proceed', 'medium', [signal.signal_id], signal.evidence_count));
                break;
            case 'provider_mismatch_drift':
                recs.push(makeRec('rescope', 'provider_fit', scopeLevel, scopeId, `Update provider-role assignments`, `${signal.evidence_count} provider mismatches — some providers may be assigned to roles they don't fit`, 'Better provider selection, fewer failures', 'low', [signal.signal_id], signal.evidence_count));
                break;
            case 'exception_trend':
                recs.push(makeRec('tighten', 'escalation_rule', scopeLevel, scopeId, `Add escalation rule for recurring exceptions`, `Trend detected: ${signal.description}`, 'Earlier detection of governance issues', 'low', [signal.signal_id], signal.evidence_count));
                break;
        }
    }
    // Exception-based recommendations
    if (exceptions) {
        if ((exceptions.by_severity['critical'] || 0) >= 2) {
            recs.push(makeRec('tighten', 'autonomy_budget', scopeLevel, scopeId, 'Reduce autonomy due to critical exceptions', `${exceptions.by_severity['critical']} critical exceptions in ${exceptions.scope}`, 'Fewer uncontrolled failures', 'high', [], exceptions.by_severity['critical']));
        }
        if ((exceptions.by_category['override'] || 0) > 5) {
            recs.push(makeRec('add', 'documentation_requirement', scopeLevel, scopeId, 'Add documentation requirement for frequently overridden areas', `${exceptions.by_category['override']} overrides suggest undocumented decision patterns`, 'Better institutional knowledge capture', 'low', [], exceptions.by_category['override']));
        }
    }
    // Persist
    const existing = readJson(RECS_FILE, []);
    existing.unshift(...recs);
    if (existing.length > 200)
        existing.length = 200;
    writeJson(RECS_FILE, existing);
    return recs;
}
function makeRec(action, target, sl, si, title, rationale, impact, risk, evidenceIds, evidenceCount) {
    return { rec_id: uid('tr'), target, action, scope_level: sl, scope_id: si, title, rationale, expected_impact: impact, risk, evidence_ids: evidenceIds, evidence_count: evidenceCount, status: 'pending', created_at: new Date().toISOString() };
}
// ═══════════════════════════════════════════
// Recommendation CRUD
// ═══════════════════════════════════════════
function getAllRecommendations() { return readJson(RECS_FILE, []); }
function getRecommendationsForScope(domain, projectId) {
    const all = getAllRecommendations();
    if (projectId)
        return all.filter(r => r.scope_level === 'project' && r.scope_id === projectId || r.scope_level === 'global');
    if (domain)
        return all.filter(r => r.scope_level === 'engine' && r.scope_id === domain || r.scope_level === 'global');
    return all;
}
function updateRec(recId, status) {
    const recs = getAllRecommendations();
    const idx = recs.findIndex(r => r.rec_id === recId);
    if (idx === -1)
        return null;
    recs[idx].status = status;
    writeJson(RECS_FILE, recs);
    return recs[idx];
}
function approveRecommendation(recId, decidedBy = 'operator', notes = '') {
    const rec = updateRec(recId, 'approved');
    if (!rec)
        return null;
    return recordDecision(recId, 'approve', decidedBy, notes);
}
function rejectRecommendation(recId, decidedBy = 'operator', notes = '') {
    const rec = updateRec(recId, 'rejected');
    if (!rec)
        return null;
    return recordDecision(recId, 'reject', decidedBy, notes);
}
function applyRecommendation(decisionId) {
    const decisions = readJson(DECISIONS_FILE, []);
    const decision = decisions.find(d => d.decision_id === decisionId);
    if (!decision || decision.action !== 'approve')
        return null;
    updateRec(decision.rec_id, 'applied');
    // Actual policy changes would be applied here in a future hardening pass
    return { ...decision, action: 'apply', decided_at: new Date().toISOString() };
}
function recordDecision(recId, action, decidedBy, notes) {
    const decision = { decision_id: uid('td'), rec_id: recId, action, decided_by: decidedBy, notes, decided_at: new Date().toISOString() };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 300)
        decisions.length = 300;
    writeJson(DECISIONS_FILE, decisions);
    return decision;
}
// ═══════════════════════════════════════════
// Governance Health Snapshot
// ═══════════════════════════════════════════
/** Compute governance health for a scope */
function computeHealth(scopeLevel, scopeId, domain) {
    let exceptionCount = 0;
    let driftSignalCount = 0;
    let pendingTuning = 0;
    let overrideRate = 0;
    let blockRate = 0;
    try {
        const ea = require('./exception-analytics');
        const agg = ea.aggregate({ domain, days: 30 });
        exceptionCount = agg.total;
        overrideRate = agg.total > 0 ? (agg.by_category['override'] || 0) / agg.total : 0;
        blockRate = agg.total > 0 ? (agg.by_category['enforcement_block'] || 0) / agg.total : 0;
    }
    catch { /* */ }
    try {
        const gd = require('./governance-drift');
        const reports = gd.getReports(scopeLevel, scopeId);
        driftSignalCount = reports.reduce((s, r) => s + r.signals.length, 0);
    }
    catch { /* */ }
    pendingTuning = getAllRecommendations().filter(r => r.status === 'pending').length;
    let health = 'healthy';
    if (exceptionCount > 10 || driftSignalCount > 5)
        health = 'critical';
    else if (exceptionCount > 5 || driftSignalCount > 2 || overrideRate > 0.4)
        health = 'degraded';
    else if (exceptionCount > 2 || driftSignalCount > 0)
        health = 'drifting';
    const summary = `${exceptionCount} exceptions, ${driftSignalCount} drift signals, ${pendingTuning} pending tuning recommendations`;
    const snapshot = {
        snapshot_id: uid('gh'),
        scope_level: scopeLevel,
        scope_id: scopeId,
        exception_count: exceptionCount,
        drift_signal_count: driftSignalCount,
        pending_tuning_count: pendingTuning,
        override_rate: Math.round(overrideRate * 100),
        enforcement_block_rate: Math.round(blockRate * 100),
        health,
        summary,
        created_at: new Date().toISOString(),
    };
    const snapshots = readJson(HEALTH_FILE, []);
    snapshots.unshift(snapshot);
    if (snapshots.length > 100)
        snapshots.length = 100;
    writeJson(HEALTH_FILE, snapshots);
    return snapshot;
}
function getHealthSnapshots() { return readJson(HEALTH_FILE, []); }
module.exports = {
    generateRecommendations, getAllRecommendations, getRecommendationsForScope,
    approveRecommendation, rejectRecommendation, applyRecommendation,
    computeHealth, getHealthSnapshots,
};
//# sourceMappingURL=policy-tuning.js.map