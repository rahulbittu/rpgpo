"use strict";
// GPO Evidence Linker — Link deliverables to artifacts, subtasks, and traceability
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachEvidence = attachEvidence;
exports.fetchEvidence = fetchEvidence;
exports.getLinkReport = getLinkReport;
exports.autoLinkFromProvenance = autoLinkFromProvenance;
exports.toArtifactRef = toArtifactRef;
const fs = require('fs');
const path = require('path');
const LINKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'evidence-links.json');
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Attach evidence refs to a deliverable version */
function attachEvidence(deliverableId, version, refs) {
    const store = readJson(LINKS_FILE, {});
    if (!store[deliverableId])
        store[deliverableId] = {};
    if (!store[deliverableId][version])
        store[deliverableId][version] = [];
    for (const ref of refs) {
        const exists = store[deliverableId][version].some(r => r.kind === ref.kind && r.ref === ref.ref);
        if (!exists)
            store[deliverableId][version].push(ref);
    }
    writeJson(LINKS_FILE, store);
    // Also record in enforcement evidence for traceability
    try {
        const ee = require('./enforcement-evidence');
        ee.recordEvidence('evidence_link', 'evidence-linker', `linked_${refs.length}_refs`, 'linked', 'deliverable', deliverableId, `v${version}`, '');
    }
    catch { /* */ }
    return store[deliverableId][version];
}
/** Fetch evidence refs for a deliverable version */
function fetchEvidence(deliverableId, version) {
    const store = readJson(LINKS_FILE, {});
    return store[deliverableId]?.[version] || [];
}
/** Get evidence link report for a deliverable */
function getLinkReport(deliverableId, version) {
    const refs = fetchEvidence(deliverableId, version);
    return {
        deliverable_id: deliverableId, version, total_refs: refs.length,
        artifact_refs: refs.filter(r => r.kind === 'artifact').length,
        subtask_refs: refs.filter(r => r.kind === 'subtask').length,
        url_refs: refs.filter(r => r.kind === 'url').length,
    };
}
/** Auto-link evidence from deliverable provenance */
function autoLinkFromProvenance(deliverableId, version, provenance) {
    const refs = [];
    for (const [field, entries] of Object.entries(provenance)) {
        for (const entry of entries) {
            refs.push({ kind: 'subtask', ref: entry.subtaskId, label: `${field} from ${entry.stepType}` });
        }
    }
    return attachEvidence(deliverableId, version, refs);
}
/** Register a deliverable as an artifact in the Artifact Registry */
function toArtifactRef(deliverableId, version) {
    const artifactId = `art_${deliverableId}_v${version}`;
    try {
        const ar = require('./artifact-registry');
        ar.registerArtifact({ artifact_id: artifactId, type: 'deliverable', title: `Deliverable ${deliverableId} v${version}`, retention: 'permanent' });
    }
    catch { /* */ }
    return { artifactId };
}
module.exports = { attachEvidence, fetchEvidence, getLinkReport, autoLinkFromProvenance, toArtifactRef };
//# sourceMappingURL=evidence-linker.js.map