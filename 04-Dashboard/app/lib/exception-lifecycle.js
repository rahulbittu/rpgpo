"use strict";
// GPO Exception Lifecycle Management — Unified lifecycle for overrides, blocks, escalations
// Links enforcement decisions, overrides, blocks, and escalation events into cases.
Object.defineProperty(exports, "__esModule", { value: true });
exports.createCase = createCase;
exports.getAllCases = getAllCases;
exports.getCasesForDomain = getCasesForDomain;
exports.getCasesForProject = getCasesForProject;
exports.getCase = getCase;
exports.assignOwner = assignOwner;
exports.updateStatus = updateStatus;
exports.linkOverride = linkOverride;
exports.linkBlock = linkBlock;
exports.getOpenCases = getOpenCases;
const fs = require('fs');
const path = require('path');
const CASES_FILE = path.resolve(__dirname, '..', '..', 'state', 'exception-cases.json');
function uid() { return 'ec_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Create an exception case */
function createCase(opts) {
    const cases = readJson(CASES_FILE, []);
    const c = {
        case_id: uid(),
        source_type: opts.source_type,
        source_id: opts.source_id,
        title: opts.title,
        severity: opts.severity || 'medium',
        stage: 'opened',
        graph_id: opts.graph_id,
        node_id: opts.node_id,
        dossier_id: opts.dossier_id,
        domain: opts.domain,
        project_id: opts.project_id,
        lane: opts.lane,
        linked_override_ids: [],
        linked_block_ids: [],
        linked_escalation_ids: [],
        remediation_notes: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    cases.unshift(c);
    if (cases.length > 300)
        cases.length = 300;
    writeJson(CASES_FILE, cases);
    return c;
}
/** Get all cases */
function getAllCases() { return readJson(CASES_FILE, []); }
function getCasesForDomain(domain) {
    return getAllCases().filter(c => c.domain === domain);
}
function getCasesForProject(projectId) {
    return getAllCases().filter(c => c.project_id === projectId);
}
function getCase(caseId) {
    return getAllCases().find(c => c.case_id === caseId) || null;
}
/** Assign owner to a case */
function assignOwner(caseId, owner) {
    return updateCase(caseId, { owner, stage: 'assigned' });
}
/** Update case status */
function updateStatus(caseId, stage, notes) {
    const updates = { stage };
    if (notes)
        updates.remediation_notes = notes;
    if (stage === 'resolved' || stage === 'closed')
        updates.resolution_outcome = 'fixed';
    return updateCase(caseId, updates);
}
/** Link override to case */
function linkOverride(caseId, overrideId) {
    const c = getCase(caseId);
    if (!c)
        return null;
    if (!c.linked_override_ids.includes(overrideId))
        c.linked_override_ids.push(overrideId);
    return updateCase(caseId, { linked_override_ids: c.linked_override_ids });
}
/** Link block to case */
function linkBlock(caseId, blockId) {
    const c = getCase(caseId);
    if (!c)
        return null;
    if (!c.linked_block_ids.includes(blockId))
        c.linked_block_ids.push(blockId);
    return updateCase(caseId, { linked_block_ids: c.linked_block_ids });
}
function updateCase(caseId, updates) {
    const cases = getAllCases();
    const idx = cases.findIndex(c => c.case_id === caseId);
    if (idx === -1)
        return null;
    Object.assign(cases[idx], updates, { updated_at: new Date().toISOString() });
    writeJson(CASES_FILE, cases);
    return cases[idx];
}
/** Get open cases (not resolved/closed/expired) */
function getOpenCases() {
    const terminal = ['resolved', 'verified', 'closed', 'expired', 'consumed'];
    return getAllCases().filter(c => !terminal.includes(c.stage));
}
module.exports = {
    createCase, getAllCases, getCasesForDomain, getCasesForProject, getCase,
    assignOwner, updateStatus, linkOverride, linkBlock, getOpenCases,
};
//# sourceMappingURL=exception-lifecycle.js.map