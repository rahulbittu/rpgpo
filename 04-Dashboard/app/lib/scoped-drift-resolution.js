"use strict";
// GPO Scoped Drift Resolution — Explicit resolution objects for governance drift
// Lifecycle: open → approved → applied → verified → closed / rejected
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateResolutions = generateResolutions;
exports.getAllResolutions = getAllResolutions;
exports.getResolutionsForDomain = getResolutionsForDomain;
exports.getResolutionsForProject = getResolutionsForProject;
exports.approveResolution = approveResolution;
exports.rejectResolution = rejectResolution;
exports.verifyResolution = verifyResolution;
exports.closeResolution = closeResolution;
const fs = require('fs');
const path = require('path');
const RESOLUTIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'drift-resolutions.json');
function uid() { return 'sdr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Resolution Generation from Drift
// ═══════════════════════════════════════════
/** Generate resolutions from drift report signals */
function generateResolutions(scopeLevel, scopeId, domain) {
    const created = [];
    // Get drift report
    let signals = [];
    try {
        const gd = require('./governance-drift');
        const report = gd.detectDrift(scopeLevel, scopeId, domain);
        signals = report.signals;
    }
    catch {
        return [];
    }
    const actionMap = {
        repeated_override: ['adjust_enforcement_rule', 'adjust_policy'],
        chronic_sim_warnings: ['adjust_policy', 'adjust_budget'],
        frequent_promotion_blocks: ['adjust_promotion_policy', 'adjust_doc_requirement'],
        provider_mismatch_drift: ['adjust_provider_fit', 'require_review'],
        exception_trend: ['adjust_escalation', 'monitor_only'],
    };
    for (const signal of signals) {
        const actions = actionMap[signal.category] || ['monitor_only'];
        const resolution = {
            resolution_id: uid(),
            scope_level: scopeLevel,
            scope_id: scopeId,
            drift_signal_ids: [signal.signal_id],
            root_cause: signal.description,
            impacted_rules: [],
            proposed_actions: actions,
            risk: signal.severity === 'high' ? 'high' : signal.severity === 'medium' ? 'medium' : 'low',
            urgency: signal.evidence_count >= 5 ? 'high' : signal.evidence_count >= 3 ? 'medium' : 'low',
            evidence_ids: [signal.signal_id],
            owner: 'operator',
            status: 'open',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        };
        created.push(resolution);
    }
    if (created.length > 0) {
        const existing = readJson(RESOLUTIONS_FILE, []);
        existing.unshift(...created);
        if (existing.length > 200)
            existing.length = 200;
        writeJson(RESOLUTIONS_FILE, existing);
    }
    return created;
}
// ═══════════════════════════════════════════
// Resolution CRUD + Lifecycle
// ═══════════════════════════════════════════
function getAllResolutions() { return readJson(RESOLUTIONS_FILE, []); }
function getResolutionsForDomain(domain) {
    return getAllResolutions().filter(r => r.scope_level === 'engine' && r.scope_id === domain || r.scope_level === 'global');
}
function getResolutionsForProject(projectId) {
    return getAllResolutions().filter(r => r.scope_level === 'project' && r.scope_id === projectId || r.scope_level === 'global');
}
function updateStatus(resolutionId, status, notes) {
    const all = getAllResolutions();
    const idx = all.findIndex(r => r.resolution_id === resolutionId);
    if (idx === -1)
        return null;
    all[idx].status = status;
    all[idx].updated_at = new Date().toISOString();
    if (notes)
        all[idx].verification_notes = notes;
    writeJson(RESOLUTIONS_FILE, all);
    return all[idx];
}
function approveResolution(id) { return updateStatus(id, 'approved'); }
function rejectResolution(id) { return updateStatus(id, 'rejected'); }
function verifyResolution(id, notes) { return updateStatus(id, 'verified', notes); }
function closeResolution(id) { return updateStatus(id, 'closed'); }
module.exports = {
    generateResolutions, getAllResolutions,
    getResolutionsForDomain, getResolutionsForProject,
    approveResolution, rejectResolution, verifyResolution, closeResolution,
};
//# sourceMappingURL=scoped-drift-resolution.js.map