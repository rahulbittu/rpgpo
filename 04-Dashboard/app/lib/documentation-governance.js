"use strict";
// GPO Documentation Governance — Required docs for architecture parts, graphs, promotions, releases
// Lane-aware blocking: dev warn, beta soft-block, prod hard-block.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllRequirements = getAllRequirements;
exports.createRequirement = createRequirement;
exports.getAllArtifacts = getAllArtifacts;
exports.getArtifactsForScope = getArtifactsForScope;
exports.createArtifact = createArtifact;
exports.checkRequirements = checkRequirements;
const fs = require('fs');
const path = require('path');
const REQS_FILE = path.resolve(__dirname, '..', '..', 'state', 'documentation-requirements.json');
const ARTIFACTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'documentation-artifacts.json');
function uid(prefix) { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(file, fallback) {
    try {
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : fallback;
    }
    catch {
        return fallback;
    }
}
function writeJson(file, data) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
// ═══════════════════════════════════════════
// Default Requirements
// ═══════════════════════════════════════════
function defaultRequirements() {
    return [
        {
            req_id: 'dr_arch', scope_type: 'architecture_part', title: 'Architecture Documentation',
            description: 'Architecture parts must have design doc, contract doc, and runbook',
            required_artifacts: ['architecture_doc', 'contract_doc', 'runbook'],
            lane_behavior: { dev: 'warn', beta: 'soft_block', prod: 'hard_block' },
            enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        },
        {
            req_id: 'dr_graph', scope_type: 'execution_graph', title: 'Execution Graph Documentation',
            description: 'Completed graphs should have summary documentation',
            required_artifacts: ['graph_summary'],
            lane_behavior: { dev: 'warn', beta: 'warn', prod: 'soft_block' },
            enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        },
        {
            req_id: 'dr_promo', scope_type: 'promotion', title: 'Promotion Documentation',
            description: 'Promotions must have dossier and review documentation',
            required_artifacts: ['dossier_doc', 'review_summary'],
            lane_behavior: { dev: 'warn', beta: 'soft_block', prod: 'hard_block' },
            enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        },
        {
            req_id: 'dr_release', scope_type: 'release', title: 'Release Documentation',
            description: 'Releases require changelog, release notes, and rollback plan',
            required_artifacts: ['changelog', 'release_notes', 'rollback_plan'],
            lane_behavior: { dev: 'warn', beta: 'soft_block', prod: 'hard_block' },
            enabled: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        },
    ];
}
function ensureDefaults() {
    let reqs = readJson(REQS_FILE, []);
    if (reqs.length === 0) {
        reqs = defaultRequirements();
        writeJson(REQS_FILE, reqs);
    }
    return reqs;
}
// ═══════════════════════════════════════════
// Requirement CRUD
// ═══════════════════════════════════════════
function getAllRequirements() { return ensureDefaults(); }
function createRequirement(opts) {
    const reqs = ensureDefaults();
    const req = { ...opts, req_id: uid('dr'), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    reqs.unshift(req);
    writeJson(REQS_FILE, reqs);
    return req;
}
// ═══════════════════════════════════════════
// Artifact CRUD
// ═══════════════════════════════════════════
function getAllArtifacts() {
    return readJson(ARTIFACTS_FILE, []);
}
function getArtifactsForScope(scopeType, relatedId) {
    return getAllArtifacts().filter(a => a.scope_type === scopeType && a.related_id === relatedId);
}
function createArtifact(opts) {
    const artifacts = getAllArtifacts();
    const artifact = {
        artifact_id: uid('da'),
        req_id: opts.req_id,
        scope_type: opts.scope_type,
        related_id: opts.related_id,
        title: opts.title,
        path: opts.path,
        status: opts.status || 'complete',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    artifacts.unshift(artifact);
    if (artifacts.length > 500)
        artifacts.length = 500;
    writeJson(ARTIFACTS_FILE, artifacts);
    return artifact;
}
// ═══════════════════════════════════════════
// Documentation Checks
// ═══════════════════════════════════════════
/** Check if documentation requirements are met for a given scope */
function checkRequirements(scopeType, relatedId, lane) {
    const reqs = ensureDefaults().filter(r => r.scope_type === scopeType && r.enabled);
    const artifacts = getArtifactsForScope(scopeType, relatedId);
    const artifactTitles = new Set(artifacts.map(a => a.title.toLowerCase()));
    const missing = [];
    const present = [];
    let worstBlock = 'warn';
    for (const req of reqs) {
        const blockLevel = req.lane_behavior[lane] || 'warn';
        for (const needed of req.required_artifacts) {
            // Check by artifact name match (flexible matching)
            const found = artifacts.some(a => a.title.toLowerCase().includes(needed.toLowerCase().replace(/_/g, ' ')) ||
                a.path.toLowerCase().includes(needed.toLowerCase().replace(/_/g, '-')));
            if (found) {
                present.push(needed);
            }
            else {
                missing.push(needed);
                // Track worst block level
                if (blockLevel === 'hard_block')
                    worstBlock = 'hard_block';
                else if (blockLevel === 'soft_block' && worstBlock !== 'hard_block')
                    worstBlock = 'soft_block';
            }
        }
    }
    return {
        met: missing.length === 0,
        missing,
        present,
        block_level: missing.length > 0 ? worstBlock : 'warn',
        blocking: missing.length > 0 && (worstBlock === 'hard_block' || worstBlock === 'soft_block'),
    };
}
module.exports = {
    getAllRequirements, createRequirement,
    getAllArtifacts, getArtifactsForScope, createArtifact,
    checkRequirements,
};
//# sourceMappingURL=documentation-governance.js.map