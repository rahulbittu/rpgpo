"use strict";
// GPO Environment Promotion Pipeline — Formalized dev→beta→prod transitions
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
exports.getRequests = getRequests;
exports.getRequest = getRequest;
const fs = require('fs');
const path = require('path');
const REQUESTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'pipeline-requests.json');
function uid() { return 'pp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Evaluate and create a pipeline promotion request */
function evaluate(dossierId, targetLane) {
    const blockers = [];
    const approvalsRequired = ['operator_approval'];
    const approvalsObtained = [];
    let readinessScore;
    let docsComplete = false;
    let exceptionsOpen = 0;
    let domain = 'general';
    let projectId;
    const sourceLane = targetLane === 'prod' ? 'beta' : 'dev';
    // Get dossier context
    try {
        const pd = require('./promotion-dossiers');
        const d = pd.getDossier(dossierId);
        if (d) {
            domain = d.domain;
        }
        if (d?.recommendation === 'rework')
            blockers.push('Dossier recommendation is rework');
    }
    catch { /* */ }
    // Readiness
    try {
        const rr = require('./release-readiness');
        const scores = rr.getScoresForEntity('dossier', dossierId);
        if (scores.length > 0)
            readinessScore = scores[0].overall_score;
    }
    catch { /* */ }
    // Documentation
    try {
        const dg = require('./documentation-governance');
        const check = dg.checkRequirements('promotion', dossierId, targetLane);
        docsComplete = check.met;
        if (!check.met && targetLane === 'prod')
            blockers.push(`Docs missing: ${check.missing.join(', ')}`);
    }
    catch { /* */ }
    // Exceptions
    try {
        const el = require('./exception-lifecycle');
        exceptionsOpen = el.getOpenCases().length;
        if (exceptionsOpen > 0 && targetLane === 'prod')
            blockers.push(`${exceptionsOpen} open exception(s)`);
    }
    catch { /* */ }
    // Approvals
    if (targetLane === 'prod') {
        approvalsRequired.push('documentation_review', 'final_sign_off');
    }
    let status = blockers.length > 0 ? 'blocked' : 'awaiting_approval';
    const request = {
        request_id: uid(), dossier_id: dossierId, source_lane: sourceLane, target_lane: targetLane,
        project_id: projectId, domain, status, blockers,
        approvals_required: approvalsRequired, approvals_obtained: approvalsObtained,
        readiness_score: readinessScore, docs_complete: docsComplete,
        exceptions_open: exceptionsOpen,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    const requests = readJson(REQUESTS_FILE, []);
    requests.unshift(request);
    if (requests.length > 100)
        requests.length = 100;
    writeJson(REQUESTS_FILE, requests);
    return request;
}
function getRequests(projectId) {
    const all = readJson(REQUESTS_FILE, []);
    return projectId ? all.filter(r => r.project_id === projectId) : all;
}
function getRequest(requestId) {
    return readJson(REQUESTS_FILE, []).find(r => r.request_id === requestId) || null;
}
module.exports = { evaluate, getRequests, getRequest };
//# sourceMappingURL=environment-pipeline.js.map