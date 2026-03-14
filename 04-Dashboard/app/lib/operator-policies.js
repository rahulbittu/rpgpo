"use strict";
// GPO Operator Preference Policies
// Scoped at operator/engine/project. Precedence: project > engine > operator > global defaults.
// Controls execution style, review strictness, documentation, provider overrides, etc.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPolicies = getAllPolicies;
exports.getPoliciesForDomain = getPoliciesForDomain;
exports.getPoliciesForProject = getPoliciesForProject;
exports.createPolicy = createPolicy;
exports.togglePolicy = togglePolicy;
exports.resolvePolicy = resolvePolicy;
exports.resolveAllPolicies = resolveAllPolicies;
const fs = require('fs');
const path = require('path');
const POLICIES_FILE = path.resolve(__dirname, '..', '..', 'state', 'operator-policies.json');
function uid() { return 'op_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readPolicies() {
    try {
        return fs.existsSync(POLICIES_FILE) ? JSON.parse(fs.readFileSync(POLICIES_FILE, 'utf-8')) : [];
    }
    catch {
        return [];
    }
}
function writePolicies(p) {
    const dir = path.dirname(POLICIES_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(POLICIES_FILE, JSON.stringify(p, null, 2));
}
// ═══════════════════════════════════════════
// Defaults
// ═══════════════════════════════════════════
const GLOBAL_DEFAULTS = {
    execution_style: 'balanced',
    review_strictness: 'balanced',
    documentation_strictness: 'balanced',
    provider_override_mode: 'advisory',
    interruption_mode: 'balanced',
    learning_promotion_mode: 'advisory',
    board_recheck_bias: 'balanced',
};
// ═══════════════════════════════════════════
// CRUD
// ═══════════════════════════════════════════
function getAllPolicies() {
    return readPolicies();
}
function getPoliciesForDomain(domain) {
    return readPolicies().filter(p => (p.scope_level === 'engine' && p.scope_id === domain) || p.scope_level === 'global');
}
function getPoliciesForProject(projectId) {
    return readPolicies().filter(p => (p.scope_level === 'project' && p.scope_id === projectId) || p.scope_level === 'global');
}
function createPolicy(opts) {
    const policies = readPolicies();
    const policy = {
        policy_id: uid(),
        area: opts.area,
        value: opts.value,
        scope_level: opts.scope_level,
        scope_id: opts.scope_id,
        enabled: true,
        rationale: opts.rationale || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    policies.unshift(policy);
    writePolicies(policies);
    return policy;
}
function togglePolicy(policyId) {
    const policies = readPolicies();
    const idx = policies.findIndex(p => p.policy_id === policyId);
    if (idx === -1)
        return null;
    policies[idx].enabled = !policies[idx].enabled;
    policies[idx].updated_at = new Date().toISOString();
    writePolicies(policies);
    return policies[idx];
}
// ═══════════════════════════════════════════
// Policy Resolution — cascading precedence
// ═══════════════════════════════════════════
/** Resolve effective policy for a given area, respecting scope precedence */
function resolvePolicy(area, domain, projectId) {
    const all = readPolicies().filter(p => p.area === area && p.enabled);
    // Project > engine > operator > global defaults
    if (projectId) {
        const proj = all.find(p => p.scope_level === 'project' && p.scope_id === projectId);
        if (proj)
            return { value: proj.value, source: `project:${projectId}` };
    }
    if (domain) {
        const eng = all.find(p => p.scope_level === 'engine' && p.scope_id === domain);
        if (eng)
            return { value: eng.value, source: `engine:${domain}` };
    }
    const op = all.find(p => p.scope_level === 'operator');
    if (op)
        return { value: op.value, source: 'operator' };
    const global = all.find(p => p.scope_level === 'global');
    if (global)
        return { value: global.value, source: 'global' };
    return { value: GLOBAL_DEFAULTS[area], source: 'default' };
}
/** Resolve all effective policies for a scope */
function resolveAllPolicies(domain, projectId) {
    const areas = [
        'execution_style', 'review_strictness', 'documentation_strictness',
        'provider_override_mode', 'interruption_mode', 'learning_promotion_mode',
        'board_recheck_bias',
    ];
    const result = {};
    for (const area of areas) {
        result[area] = resolvePolicy(area, domain, projectId);
    }
    return result;
}
module.exports = {
    getAllPolicies, getPoliciesForDomain, getPoliciesForProject,
    createPolicy, togglePolicy,
    resolvePolicy, resolveAllPolicies,
};
//# sourceMappingURL=operator-policies.js.map