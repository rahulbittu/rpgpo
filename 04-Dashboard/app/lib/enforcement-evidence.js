"use strict";
// GPO Enforcement Evidence — Durable evidence records for live enforcement truth
Object.defineProperty(exports, "__esModule", { value: true });
exports.recordEvidence = recordEvidence;
exports.getEvidence = getEvidence;
exports.getEvidenceByScope = getEvidenceByScope;
exports.toExecutionEvidence = toExecutionEvidence;
exports.getEvidenceSummary = getEvidenceSummary;
const fs = require('fs');
const path = require('path');
const EVIDENCE_FILE = path.resolve(__dirname, '..', '..', 'state', 'enforcement-evidence.json');
function uid() { return 'ee_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Record enforcement evidence from a live middleware execution */
function recordEvidence(area, middlewareRan, decisionMade, responseEffect, scopeType, scopeId, route, linkedPathId = '') {
    const record = {
        record_id: uid(), area, middleware_ran: middlewareRan,
        decision_made: decisionMade, response_effect: responseEffect,
        scope_type: scopeType, scope_id: scopeId, route,
        linked_path_id: linkedPathId, created_at: new Date().toISOString(),
    };
    const all = readJson(EVIDENCE_FILE, []);
    all.unshift(record);
    if (all.length > 500)
        all.length = 500;
    writeJson(EVIDENCE_FILE, all);
    return record;
}
/** Get all enforcement evidence records */
function getEvidence(area) {
    const all = readJson(EVIDENCE_FILE, []);
    return area ? all.filter(r => r.area === area) : all;
}
/** Get evidence for a specific scope */
function getEvidenceByScope(scopeType, scopeId) {
    const all = readJson(EVIDENCE_FILE, []);
    return all.filter(r => r.scope_type === scopeType && r.scope_id === scopeId);
}
/** Convert evidence to middleware execution evidence format */
function toExecutionEvidence(record) {
    return {
        evidence_id: record.record_id, middleware: record.middleware_ran,
        route: record.route, decision: record.decision_made,
        response_effect: record.response_effect,
        scope_type: record.scope_type, scope_id: record.scope_id,
        timestamp: record.created_at,
    };
}
/** Get evidence count by area */
function getEvidenceSummary() {
    const all = readJson(EVIDENCE_FILE, []);
    const byArea = {};
    for (const r of all) {
        if (!byArea[r.area])
            byArea[r.area] = { count: 0, latest: r.created_at };
        byArea[r.area].count++;
    }
    return Object.entries(byArea).map(([area, v]) => ({ area, ...v }));
}
module.exports = { recordEvidence, getEvidence, getEvidenceByScope, toExecutionEvidence, getEvidenceSummary };
//# sourceMappingURL=enforcement-evidence.js.map