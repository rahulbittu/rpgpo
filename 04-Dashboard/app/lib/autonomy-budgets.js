"use strict";
// GPO Autonomy Budgets — Controls what the system can do without operator intervention
// Scoped at operator/engine/project, lane-aware.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllBudgets = getAllBudgets;
exports.getBudgetsForDomain = getBudgetsForDomain;
exports.getBudgetsForProject = getBudgetsForProject;
exports.createBudget = createBudget;
exports.toggleBudget = toggleBudget;
exports.resolveBudget = resolveBudget;
exports.isActionAllowed = isActionAllowed;
const fs = require('fs');
const path = require('path');
const BUDGETS_FILE = path.resolve(__dirname, '..', '..', 'state', 'autonomy-budgets.json');
function uid() { return 'ab_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readBudgets() {
    try {
        return fs.existsSync(BUDGETS_FILE) ? JSON.parse(fs.readFileSync(BUDGETS_FILE, 'utf-8')) : [];
    }
    catch {
        return [];
    }
}
function writeBudgets(b) {
    const dir = path.dirname(BUDGETS_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(BUDGETS_FILE, JSON.stringify(b, null, 2));
}
// ═══════════════════════════════════════════
// Lane-Aware Defaults
// ═══════════════════════════════════════════
function defaultBudget(lane) {
    switch (lane) {
        case 'dev': return {
            lane, enabled: true,
            allowed_actions: ['execute_green', 'execute_yellow_with_review', 'auto_queue', 'record_evidence', 'create_recipe'],
            blocked_actions: ['execute_red', 'promote_to_prod'],
            required_escalations: ['red_risk'],
            auto_execute_green: true, auto_execute_yellow: false,
            auto_promote_experimental: false, auto_learn_from_evidence: true,
            max_retries: 3, max_daily_cost_usd: 10,
        };
        case 'beta': return {
            lane, enabled: true,
            allowed_actions: ['execute_green', 'record_evidence'],
            blocked_actions: ['execute_red', 'execute_yellow_without_approval', 'auto_promote'],
            required_escalations: ['red_risk', 'yellow_risk', 'privacy_concern'],
            auto_execute_green: true, auto_execute_yellow: false,
            auto_promote_experimental: false, auto_learn_from_evidence: true,
            max_retries: 2, max_daily_cost_usd: 5,
        };
        case 'prod': return {
            lane, enabled: true,
            allowed_actions: ['record_evidence'],
            blocked_actions: ['execute_without_approval', 'auto_promote', 'auto_learn'],
            required_escalations: ['any_risk', 'any_change'],
            auto_execute_green: false, auto_execute_yellow: false,
            auto_promote_experimental: false, auto_learn_from_evidence: false,
            max_retries: 1, max_daily_cost_usd: 2,
        };
    }
}
// ═══════════════════════════════════════════
// CRUD
// ═══════════════════════════════════════════
function getAllBudgets() {
    return readBudgets();
}
function getBudgetsForDomain(domain) {
    return readBudgets().filter(b => (b.scope_level === 'engine' && b.scope_id === domain) || b.scope_level === 'global');
}
function getBudgetsForProject(projectId) {
    return readBudgets().filter(b => (b.scope_level === 'project' && b.scope_id === projectId) || b.scope_level === 'global');
}
function createBudget(opts) {
    const budgets = readBudgets();
    const defaults = defaultBudget(opts.lane);
    const budget = {
        budget_id: uid(),
        ...defaults,
        ...opts,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    budgets.unshift(budget);
    writeBudgets(budgets);
    return budget;
}
function toggleBudget(budgetId) {
    const budgets = readBudgets();
    const idx = budgets.findIndex(b => b.budget_id === budgetId);
    if (idx === -1)
        return null;
    budgets[idx].enabled = !budgets[idx].enabled;
    budgets[idx].updated_at = new Date().toISOString();
    writeBudgets(budgets);
    return budgets[idx];
}
// ═══════════════════════════════════════════
// Budget Resolution
// ═══════════════════════════════════════════
/** Resolve effective autonomy budget for a given context */
function resolveBudget(lane, domain, projectId) {
    const all = readBudgets().filter(b => b.lane === lane && b.enabled);
    // Project > engine > global
    if (projectId) {
        const proj = all.find(b => b.scope_level === 'project' && b.scope_id === projectId);
        if (proj)
            return proj;
    }
    if (domain) {
        const eng = all.find(b => b.scope_level === 'engine' && b.scope_id === domain);
        if (eng)
            return eng;
    }
    const global = all.find(b => b.scope_level === 'global');
    if (global)
        return global;
    // Synthetic default
    const defaults = defaultBudget(lane);
    return {
        budget_id: 'default',
        scope_level: 'global',
        scope_id: 'global',
        ...defaults,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
}
/** Check if a specific action is allowed under the current budget */
function isActionAllowed(action, lane, domain, projectId) {
    const budget = resolveBudget(lane, domain, projectId);
    if (budget.blocked_actions.includes(action)) {
        return { allowed: false, reason: `Action "${action}" is blocked in ${lane} lane` };
    }
    if (budget.allowed_actions.length > 0 && !budget.allowed_actions.includes(action)) {
        return { allowed: false, reason: `Action "${action}" not in allowed list for ${lane} lane` };
    }
    return { allowed: true, reason: 'Allowed by autonomy budget' };
}
module.exports = {
    getAllBudgets, getBudgetsForDomain, getBudgetsForProject,
    createBudget, toggleBudget,
    resolveBudget, isActionAllowed,
};
//# sourceMappingURL=autonomy-budgets.js.map