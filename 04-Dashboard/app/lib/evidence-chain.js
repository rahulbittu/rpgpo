"use strict";
// GPO Evidence Chain — Lineage links between artifacts for decision traceability
Object.defineProperty(exports, "__esModule", { value: true });
exports.link = link;
exports.getEdgesFor = getEdgesFor;
exports.getLineage = getLineage;
exports.buildBundle = buildBundle;
exports.getBundles = getBundles;
const fs = require('fs');
const path = require('path');
const EDGES_FILE = path.resolve(__dirname, '..', '..', 'state', 'evidence-edges.json');
const BUNDLES_FILE = path.resolve(__dirname, '..', '..', 'state', 'evidence-bundles.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Link two artifacts in the evidence chain */
function link(sourceId, targetId, relation, notes = '') {
    const edges = readJson(EDGES_FILE, []);
    const edge = {
        edge_id: uid('ee'), source_id: sourceId, target_id: targetId,
        relation, notes, created_at: new Date().toISOString(),
    };
    edges.unshift(edge);
    if (edges.length > 1000)
        edges.length = 1000;
    writeJson(EDGES_FILE, edges);
    return edge;
}
/** Get all edges for an artifact */
function getEdgesFor(artifactId) {
    const edges = readJson(EDGES_FILE, []);
    return {
        upstream: edges.filter(e => e.target_id === artifactId),
        downstream: edges.filter(e => e.source_id === artifactId),
    };
}
/** Get lineage summary for an artifact */
function getLineage(artifactId) {
    const { upstream, downstream } = getEdgesFor(artifactId);
    // Resolve artifact types from registry
    let getById = null;
    try {
        const ar = require('./artifact-registry');
        getById = ar.getById;
    }
    catch { /* */ }
    return {
        artifact_id: artifactId,
        upstream: upstream.map(e => ({
            id: e.source_id,
            type: getById?.(e.source_id)?.type || 'unknown',
            relation: e.relation,
        })),
        downstream: downstream.map(e => ({
            id: e.target_id,
            type: getById?.(e.target_id)?.type || 'unknown',
            relation: e.relation,
        })),
    };
}
/** Build an evidence bundle for a related entity */
function buildBundle(relatedType, relatedId) {
    const nodes = [];
    const edges = [];
    // Gather artifacts related to this entity
    try {
        const ar = require('./artifact-registry');
        const artifacts = ar.getAll().filter(a => a.related_graph_id === relatedId || a.related_dossier_id === relatedId ||
            a.related_task_id === relatedId || a.source_id === relatedId);
        for (const a of artifacts) {
            nodes.push({ node_id: a.artifact_id, artifact_id: a.artifact_id, artifact_type: a.type, title: a.title });
        }
    }
    catch { /* */ }
    // Gather edges between these nodes
    const nodeIds = new Set(nodes.map(n => n.artifact_id));
    const allEdges = readJson(EDGES_FILE, []);
    for (const e of allEdges) {
        if (nodeIds.has(e.source_id) || nodeIds.has(e.target_id)) {
            edges.push(e);
        }
    }
    const summary = `Evidence bundle for ${relatedType}:${relatedId} — ${nodes.length} artifacts, ${edges.length} links`;
    const bundle = {
        bundle_id: uid('eb'), related_type: relatedType, related_id: relatedId,
        nodes, edges, summary, created_at: new Date().toISOString(),
    };
    const bundles = readJson(BUNDLES_FILE, []);
    bundles.unshift(bundle);
    if (bundles.length > 200)
        bundles.length = 200;
    writeJson(BUNDLES_FILE, bundles);
    return bundle;
}
/** Get bundles for an entity */
function getBundles(relatedType, relatedId) {
    return readJson(BUNDLES_FILE, []).filter(b => b.related_type === relatedType && b.related_id === relatedId);
}
module.exports = { link, getEdgesFor, getLineage, buildBundle, getBundles };
//# sourceMappingURL=evidence-chain.js.map