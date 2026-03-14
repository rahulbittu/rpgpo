"use strict";
// GPO Human Approval Workspace — Unified operator-facing approval queue
Object.defineProperty(exports, "__esModule", { value: true });
exports.createRequest = createRequest;
exports.getWorkspace = getWorkspace;
exports.getSummary = getSummary;
exports.applyDecision = applyDecision;
exports.getPending = getPending;
exports.getOverdue = getOverdue;
exports.getDelegated = getDelegated;
const fs = require('fs');
const path = require('path');
const REQUESTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'approval-requests.json');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'approval-decisions-ws.json');
function uid() { return 'aw_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Create an approval request */
function createRequest(opts) {
    const requests = readJson(REQUESTS_FILE, []);
    const req = {
        request_id: uid(),
        source_type: opts.source_type,
        source_id: opts.source_id,
        title: opts.title,
        description: opts.description || '',
        domain: opts.domain,
        project_id: opts.project_id,
        lane: opts.lane,
        severity: opts.severity || 'medium',
        status: 'pending',
        sla_hours: opts.sla_hours || 24,
        evidence_summary: opts.evidence_summary,
        blockers: opts.blockers || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    requests.unshift(req);
    if (requests.length > 500)
        requests.length = 500;
    writeJson(REQUESTS_FILE, requests);
    return req;
}
/** Get workspace view with optional filters */
function getWorkspace(filters) {
    let all = readJson(REQUESTS_FILE, []);
    // Mark overdue
    const now = new Date();
    for (const r of all) {
        if (r.status === 'pending' && r.sla_hours) {
            const age = (now.getTime() - new Date(r.created_at).getTime()) / 3600000;
            if (age > r.sla_hours)
                r.status = 'overdue';
        }
    }
    if (filters?.domain)
        all = all.filter(r => r.domain === filters.domain);
    if (filters?.project_id)
        all = all.filter(r => r.project_id === filters.project_id);
    if (filters?.status)
        all = all.filter(r => r.status === filters.status);
    return all;
}
/** Get workspace summary */
function getSummary() {
    const all = getWorkspace();
    return {
        pending: all.filter(r => r.status === 'pending').length,
        approved: all.filter(r => r.status === 'approved').length,
        rejected: all.filter(r => r.status === 'rejected').length,
        overdue: all.filter(r => r.status === 'overdue').length,
        delegated: all.filter(r => r.status === 'delegated').length,
        blocked: all.filter(r => r.status === 'blocked').length,
        total: all.length,
    };
}
/** Apply an approval decision */
function applyDecision(requestId, decision, notes = '', decidedBy = 'operator') {
    const requests = readJson(REQUESTS_FILE, []);
    const idx = requests.findIndex(r => r.request_id === requestId);
    if (idx === -1)
        return null;
    if (decision === 'approve')
        requests[idx].status = 'approved';
    else if (decision === 'reject')
        requests[idx].status = 'rejected';
    else
        requests[idx].status = 'blocked';
    requests[idx].updated_at = new Date().toISOString();
    writeJson(REQUESTS_FILE, requests);
    const record = {
        decision_id: uid(), request_id: requestId, decision,
        decided_by: decidedBy, notes, created_at: new Date().toISOString(),
    };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(record);
    if (decisions.length > 500)
        decisions.length = 500;
    writeJson(DECISIONS_FILE, decisions);
    // Part 45: Auto-emit telemetry
    try {
        const tw = require('./telemetry-wiring');
        tw.emitTelemetry('approval_workflow', `approval_${decision}`, 'success');
    }
    catch { /* */ }
    return record;
}
function getPending() { return getWorkspace({ status: 'pending' }); }
function getOverdue() { return getWorkspace({ status: 'overdue' }); }
function getDelegated() { return getWorkspace({ status: 'delegated' }); }
module.exports = { createRequest, getWorkspace, getSummary, applyDecision, getPending, getOverdue, getDelegated };
//# sourceMappingURL=approval-workspace.js.map