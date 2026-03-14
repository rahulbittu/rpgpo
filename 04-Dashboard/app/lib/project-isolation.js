"use strict";
// GPO Cross-Project Governance Isolation
// Enforces project-level isolation for memory, governance, overrides, tuning, execution.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolicy = getPolicy;
exports.getAllPolicies = getAllPolicies;
exports.createPolicy = createPolicy;
exports.evaluateAccess = evaluateAccess;
exports.getViolations = getViolations;
exports.getDecisions = getDecisions;
const fs = require('fs');
const path = require('path');
const POLICIES_FILE = path.resolve(__dirname, '..', '..', 'state', 'isolation-policies.json');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'isolation-decisions.json');
const VIOLATIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'isolation-violations.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Isolation Policies
// ═══════════════════════════════════════════
function getPolicy(projectId) {
    return readJson(POLICIES_FILE, []).find(p => p.project_id === projectId) || null;
}
function getAllPolicies() {
    return readJson(POLICIES_FILE, []);
}
function createPolicy(opts) {
    const policies = getAllPolicies();
    const policy = {
        policy_id: uid('ip'),
        project_id: opts.project_id,
        domain: opts.domain,
        default_access: opts.default_access || 'deny',
        allowed_targets: [],
        denied_targets: [],
        redact_fields: ['remediation_notes', 'raw_request', 'custom_notes'],
        enabled: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    policies.unshift(policy);
    writeJson(POLICIES_FILE, policies);
    return policy;
}
// ═══════════════════════════════════════════
// Access Evaluation
// ═══════════════════════════════════════════
/** Evaluate whether cross-project access should be allowed */
function evaluateAccess(sourceProject, targetProject, artifactType, action = 'read') {
    // Same project = always allow
    if (sourceProject === targetProject) {
        return makeDecision(sourceProject, targetProject, artifactType, action, 'allow', 'Same project');
    }
    // Check source policy
    const sourcePolicy = getPolicy(sourceProject);
    if (sourcePolicy && sourcePolicy.enabled) {
        if (sourcePolicy.denied_targets.includes(targetProject)) {
            recordViolation(sourceProject, targetProject, artifactType, 'Denied by source isolation policy');
            return makeDecision(sourceProject, targetProject, artifactType, action, 'deny', 'Denied by source policy');
        }
        if (sourcePolicy.allowed_targets.includes(targetProject)) {
            return makeDecision(sourceProject, targetProject, artifactType, action, 'allow', 'Allowed by source policy');
        }
    }
    // Check target policy
    const targetPolicy = getPolicy(targetProject);
    if (targetPolicy && targetPolicy.enabled) {
        if (targetPolicy.denied_targets.includes(sourceProject)) {
            recordViolation(sourceProject, targetProject, artifactType, 'Denied by target isolation policy');
            return makeDecision(sourceProject, targetProject, artifactType, action, 'deny', 'Denied by target policy');
        }
    }
    // Default: check artifact type sensitivity
    const sensitiveTypes = ['context', 'exception', 'override'];
    if (sensitiveTypes.includes(artifactType)) {
        return makeDecision(sourceProject, targetProject, artifactType, action, 'allow_redacted', 'Sensitive artifact type — redacted access');
    }
    // Fallback to policy default
    const defaultAccess = sourcePolicy?.default_access || 'deny';
    if (defaultAccess === 'deny') {
        recordViolation(sourceProject, targetProject, artifactType, 'Default deny policy');
    }
    return makeDecision(sourceProject, targetProject, artifactType, action, defaultAccess, 'Default policy');
}
function makeDecision(src, tgt, art, action, outcome, reason) {
    const decision = {
        decision_id: uid('ad'), source_project: src, target_project: tgt,
        artifact_type: art, action, outcome, reason, created_at: new Date().toISOString(),
    };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 300)
        decisions.length = 300;
    writeJson(DECISIONS_FILE, decisions);
    return decision;
}
function recordViolation(src, tgt, art, reason) {
    const violations = readJson(VIOLATIONS_FILE, []);
    violations.unshift({
        violation_id: uid('iv'), source_project: src, target_project: tgt,
        artifact_type: art, reason, severity: 'medium', created_at: new Date().toISOString(),
    });
    if (violations.length > 300)
        violations.length = 300;
    writeJson(VIOLATIONS_FILE, violations);
}
function getViolations(projectId) {
    const all = readJson(VIOLATIONS_FILE, []);
    if (projectId)
        return all.filter(v => v.source_project === projectId || v.target_project === projectId);
    return all;
}
function getDecisions(projectId) {
    const all = readJson(DECISIONS_FILE, []);
    if (projectId)
        return all.filter(d => d.source_project === projectId || d.target_project === projectId);
    return all;
}
module.exports = {
    getPolicy, getAllPolicies, createPolicy,
    evaluateAccess, getViolations, getDecisions,
};
//# sourceMappingURL=project-isolation.js.map