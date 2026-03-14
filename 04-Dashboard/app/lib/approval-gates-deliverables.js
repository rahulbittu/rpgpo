"use strict";
// GPO Deliverable Approval Gates — Propose/approve/reject lifecycle for deliverables
Object.defineProperty(exports, "__esModule", { value: true });
exports.propose = propose;
exports.approve = approve;
exports.reject = reject;
exports.currentStatus = currentStatus;
exports.getRequests = getRequests;
const fs = require('fs');
const path = require('path');
const REQUESTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'deliverable-approval-requests.json');
function uid() { return 'dar_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Propose a deliverable version for approval */
function propose(deliverableId, version) {
    const requests = readJson(REQUESTS_FILE, []);
    // Idempotent: if already pending for same version, return existing
    const existing = requests.find(r => r.deliverable_id === deliverableId && r.version === version && r.status === 'pending');
    if (existing)
        return existing;
    const request = {
        request_id: uid(), deliverable_id: deliverableId, version,
        status: 'pending', requested_at: new Date().toISOString(),
    };
    requests.unshift(request);
    if (requests.length > 300)
        requests.length = 300;
    writeJson(REQUESTS_FILE, requests);
    // Transition deliverable status to proposed
    try {
        const ds = require('./deliverable-store');
        ds.transitionStatus(deliverableId, version, 'proposed', 'system');
    }
    catch { /* */ }
    // Create approval workspace entry
    try {
        const aw = require('./approval-workspace');
        aw.createRequest({ request_id: request.request_id, title: `Approve deliverable ${deliverableId} v${version}`, type: 'deliverable_approval', severity: 'medium', context: { deliverableId, version } });
    }
    catch { /* */ }
    return request;
}
/** Approve a deliverable version */
function approve(deliverableId, version, approver, note) {
    const requests = readJson(REQUESTS_FILE, []);
    const request = requests.find(r => r.deliverable_id === deliverableId && r.version === version && r.status === 'pending');
    if (!request)
        return null;
    request.status = 'approved';
    request.decided_at = new Date().toISOString();
    request.decided_by = approver;
    request.reason = note || 'Approved';
    writeJson(REQUESTS_FILE, requests);
    // Transition deliverable status
    try {
        const ds = require('./deliverable-store');
        ds.transitionStatus(deliverableId, version, 'approved', approver);
    }
    catch { /* */ }
    // Register as artifact
    try {
        const el = require('./evidence-linker');
        el.toArtifactRef(deliverableId, version);
    }
    catch { /* */ }
    return request;
}
/** Reject a deliverable version */
function reject(deliverableId, version, reviewer, reason) {
    const requests = readJson(REQUESTS_FILE, []);
    const request = requests.find(r => r.deliverable_id === deliverableId && r.version === version && r.status === 'pending');
    if (!request)
        return null;
    request.status = 'rejected';
    request.decided_at = new Date().toISOString();
    request.decided_by = reviewer;
    request.reason = reason;
    writeJson(REQUESTS_FILE, requests);
    try {
        const ds = require('./deliverable-store');
        ds.transitionStatus(deliverableId, version, 'rejected', reviewer);
    }
    catch { /* */ }
    return request;
}
/** Get current approval status for a deliverable */
function currentStatus(deliverableId) {
    const requests = readJson(REQUESTS_FILE, []);
    return requests.find(r => r.deliverable_id === deliverableId) || null;
}
/** Get all approval requests */
function getRequests(deliverableId) {
    const requests = readJson(REQUESTS_FILE, []);
    return deliverableId ? requests.filter(r => r.deliverable_id === deliverableId) : requests;
}
module.exports = { propose, approve, reject, currentStatus, getRequests };
//# sourceMappingURL=approval-gates-deliverables.js.map