"use strict";
// GPO Policy Simulation — Simulate governance outcomes under different lanes/overrides
// Runs against graphs, dossiers, and releases without side effects.
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSimulation = runSimulation;
exports.getScenario = getScenario;
exports.getResult = getResult;
exports.getResultsForEntity = getResultsForEntity;
exports.getAllResults = getAllResults;
const fs = require('fs');
const path = require('path');
const SCENARIOS_FILE = path.resolve(__dirname, '..', '..', 'state', 'simulation-scenarios.json');
const RESULTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'simulation-results.json');
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
// Simulation Engine
// ═══════════════════════════════════════════
/** Run a governance simulation */
function runSimulation(relatedType, relatedId, lane, overrides = {}) {
    // Save scenario
    const scenario = {
        scenario_id: uid('ss'),
        related_type: relatedType,
        related_id: relatedId,
        lane: overrides.lane || lane,
        overrides,
        created_at: new Date().toISOString(),
    };
    const scenarios = readJson(SCENARIOS_FILE, []);
    scenarios.unshift(scenario);
    if (scenarios.length > 200)
        scenarios.length = 200;
    writeJson(SCENARIOS_FILE, scenarios);
    const effectiveLane = overrides.lane || lane;
    const policyViolations = [];
    const budgetViolations = [];
    const escalationTriggers = [];
    const missingDocs = [];
    const blockedActions = [];
    const warnings = [];
    // 1. Resolve policies (with overrides)
    try {
        const op = require('./operator-policies');
        const policies = op.resolveAllPolicies();
        // Apply policy overrides
        if (overrides.policies) {
            for (const [area, val] of Object.entries(overrides.policies)) {
                policies[area] = { value: val, source: 'simulation_override' };
            }
        }
        // Check for strict policies in permissive lanes
        if (effectiveLane === 'prod' && policies.execution_style?.value === 'permissive') {
            policyViolations.push('Permissive execution style not allowed in prod lane');
        }
        if (effectiveLane === 'prod' && policies.documentation_strictness?.value !== 'strict' && policies.documentation_strictness?.value !== 'enforced') {
            warnings.push('Documentation strictness should be strict/enforced for prod');
        }
    }
    catch { /* */ }
    // 2. Check autonomy budget
    try {
        const ab = require('./autonomy-budgets');
        const budget = ab.resolveBudget(effectiveLane);
        const autoGreen = overrides.auto_execute_green ?? budget.auto_execute_green;
        const autoYellow = overrides.auto_execute_yellow ?? budget.auto_execute_yellow;
        if (effectiveLane === 'prod' && autoGreen) {
            budgetViolations.push('Auto-execute green not allowed in prod');
        }
        if (effectiveLane !== 'dev' && autoYellow) {
            budgetViolations.push('Auto-execute yellow only allowed in dev lane');
        }
        if ((overrides.max_retries ?? budget.max_retries) > 3) {
            warnings.push('Max retries above 3 may cause excessive costs');
        }
    }
    catch { /* */ }
    // 3. Check escalation rules
    try {
        const eg = require('./escalation-governance');
        const rules = eg.getAllRules().filter((r) => r.enabled);
        if (overrides.provider_confidence !== undefined && overrides.provider_confidence < 50) {
            const rule = rules.find((r) => r.trigger === 'low_confidence');
            if (rule)
                escalationTriggers.push(`low_confidence → ${rule.action}: confidence ${overrides.provider_confidence}% < 50%`);
        }
        if (effectiveLane !== 'dev') {
            const promoRule = rules.find((r) => r.trigger === 'promotion_attempt');
            if (promoRule && relatedType === 'dossier') {
                escalationTriggers.push(`promotion_attempt → ${promoRule.action}: promotion in ${effectiveLane}`);
            }
        }
    }
    catch { /* */ }
    // 4. Check documentation
    try {
        const dg = require('./documentation-governance');
        const scopeType = relatedType === 'graph' ? 'execution_graph' : relatedType === 'dossier' ? 'promotion' : 'release';
        // Apply doc overrides
        if (overrides.documentation_missing && overrides.documentation_missing.length > 0) {
            for (const doc of overrides.documentation_missing)
                missingDocs.push(doc);
        }
        else {
            const check = dg.checkRequirements(scopeType, relatedId, effectiveLane);
            if (!check.met) {
                missingDocs.push(...check.missing);
                if (check.blocking)
                    blockedActions.push(`Documentation blocks ${effectiveLane}: ${check.missing.join(', ')}`);
            }
        }
    }
    catch { /* */ }
    // 5. Check review verdicts (override)
    if (overrides.review_verdicts) {
        const fails = Object.entries(overrides.review_verdicts).filter(([, v]) => v === 'fail');
        if (fails.length > 0 && effectiveLane !== 'dev') {
            blockedActions.push(`Failed reviews block ${effectiveLane}: ${fails.map(([k]) => k).join(', ')}`);
        }
        if (fails.length > 0) {
            warnings.push(`${fails.length} review(s) failed`);
        }
    }
    // Determine outcome
    let outcome = 'pass';
    if (blockedActions.length > 0 || policyViolations.length > 0 || budgetViolations.length > 0)
        outcome = 'block';
    else if (warnings.length > 0 || escalationTriggers.length > 0 || missingDocs.length > 0)
        outcome = 'warn';
    const summary = outcome === 'pass'
        ? `Simulation passed for ${effectiveLane} lane`
        : outcome === 'warn'
            ? `Simulation passed with ${warnings.length + escalationTriggers.length} warning(s)`
            : `Simulation blocked: ${[...policyViolations, ...budgetViolations, ...blockedActions].join('; ')}`;
    const result = {
        result_id: uid('sr'),
        scenario_id: scenario.scenario_id,
        related_type: relatedType,
        related_id: relatedId,
        lane: effectiveLane,
        outcome,
        policy_violations: policyViolations,
        budget_violations: budgetViolations,
        escalation_triggers: escalationTriggers,
        missing_docs: missingDocs,
        blocked_actions: blockedActions,
        warnings,
        summary,
        created_at: new Date().toISOString(),
    };
    const results = readJson(RESULTS_FILE, []);
    results.unshift(result);
    if (results.length > 200)
        results.length = 200;
    writeJson(RESULTS_FILE, results);
    return result;
}
// ═══════════════════════════════════════════
// Retrieval
// ═══════════════════════════════════════════
function getScenario(scenarioId) {
    return readJson(SCENARIOS_FILE, []).find(s => s.scenario_id === scenarioId) || null;
}
function getResult(resultId) {
    return readJson(RESULTS_FILE, []).find(r => r.result_id === resultId) || null;
}
function getResultsForEntity(relatedType, relatedId) {
    return readJson(RESULTS_FILE, []).filter(r => r.related_type === relatedType && r.related_id === relatedId);
}
function getAllResults() {
    return readJson(RESULTS_FILE, []);
}
module.exports = {
    runSimulation,
    getScenario, getResult, getResultsForEntity, getAllResults,
};
//# sourceMappingURL=policy-simulation.js.map