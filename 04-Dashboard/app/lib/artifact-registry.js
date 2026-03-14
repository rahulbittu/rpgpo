"use strict";
// GPO Artifact Registry — Registers all major system artifacts for lookup and lineage
Object.defineProperty(exports, "__esModule", { value: true });
exports.register = register;
exports.getAll = getAll;
exports.getById = getById;
exports.getByType = getByType;
exports.getByDomain = getByDomain;
exports.getByProject = getByProject;
exports.getByGraph = getByGraph;
const fs = require('fs');
const path = require('path');
const REGISTRY_FILE = path.resolve(__dirname, '..', '..', 'state', 'artifact-registry.json');
function uid() { return 'ar_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Register an artifact */
function register(opts) {
    const registry = readJson(REGISTRY_FILE, []);
    // Deduplicate by source_id + type
    const existing = registry.findIndex(a => a.source_id === opts.source_id && a.type === opts.type);
    if (existing >= 0) {
        registry[existing].updated_at = new Date().toISOString();
        registry[existing].title = opts.title;
        writeJson(REGISTRY_FILE, registry);
        return registry[existing];
    }
    const artifact = {
        artifact_id: uid(),
        source_id: opts.source_id,
        type: opts.type,
        scope: { isolation_level: 'project', ...opts.scope },
        related_task_id: opts.related_task_id,
        related_graph_id: opts.related_graph_id,
        related_node_id: opts.related_node_id,
        related_dossier_id: opts.related_dossier_id,
        producer: opts.producer,
        title: opts.title,
        retention: 'active',
        integrity: 'valid',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    registry.unshift(artifact);
    if (registry.length > 1000)
        registry.length = 1000;
    writeJson(REGISTRY_FILE, registry);
    return artifact;
}
/** Get all registered artifacts */
function getAll() { return readJson(REGISTRY_FILE, []); }
/** Get artifact by ID */
function getById(artifactId) {
    return getAll().find(a => a.artifact_id === artifactId || a.source_id === artifactId) || null;
}
/** Get by type */
function getByType(type) {
    return getAll().filter(a => a.type === type);
}
/** Get by domain */
function getByDomain(domain) {
    return getAll().filter(a => a.scope.domain === domain);
}
/** Get by project */
function getByProject(projectId) {
    return getAll().filter(a => a.scope.project_id === projectId);
}
/** Get by related graph */
function getByGraph(graphId) {
    return getAll().filter(a => a.related_graph_id === graphId);
}
module.exports = { register, getAll, getById, getByType, getByDomain, getByProject, getByGraph };
//# sourceMappingURL=artifact-registry.js.map