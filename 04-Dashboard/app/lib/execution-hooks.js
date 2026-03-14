"use strict";
// GPO Execution Hooks — Reusable hook layer between graph transitions and execution
// Supports before_transition hooks that are typed, inspectable, and auditable.
Object.defineProperty(exports, "__esModule", { value: true });
exports.attachHooks = attachHooks;
exports.getHooksForGraph = getHooksForGraph;
exports.executeHooks = executeHooks;
exports.allHooksPass = allHooksPass;
const fs = require('fs');
const path = require('path');
const HOOKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'execution-hooks.json');
function uid() { return 'eh_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
const ALL_TRANSITIONS = [
    'graph_create', 'node_queue', 'node_start', 'node_complete',
    'review_complete', 'dossier_generate', 'promotion_attempt',
];
/** Attach enforcement hooks to a graph for all transition points */
function attachHooks(graphId) {
    const existing = getHooksForGraph(graphId);
    if (existing.length > 0)
        return existing; // already attached
    const hooks = ALL_TRANSITIONS.map(transition => ({
        hook_id: uid(),
        transition,
        graph_id: graphId,
        enabled: true,
        created_at: new Date().toISOString(),
    }));
    const all = readJson(HOOKS_FILE, []);
    all.unshift(...hooks);
    if (all.length > 500)
        all.length = 500;
    writeJson(HOOKS_FILE, all);
    return hooks;
}
/** Get hooks for a graph */
function getHooksForGraph(graphId) {
    return readJson(HOOKS_FILE, []).filter(h => h.graph_id === graphId);
}
/** Execute all enabled hooks for a transition */
function executeHooks(transition, graphId, nodeId) {
    const hooks = getHooksForGraph(graphId).filter(h => h.transition === transition && h.enabled);
    const results = [];
    for (const hook of hooks) {
        try {
            const re = require('./runtime-enforcement');
            const result = re.checkTransition(transition, graphId, nodeId, hook.hook_id);
            results.push(result);
        }
        catch { /* */ }
    }
    // If no hooks are attached, still run a check
    if (hooks.length === 0) {
        try {
            const re = require('./runtime-enforcement');
            results.push(re.checkTransition(transition, graphId, nodeId));
        }
        catch { /* */ }
    }
    return results;
}
/** Check if all hooks pass for a transition */
function allHooksPass(transition, graphId, nodeId) {
    const results = executeHooks(transition, graphId, nodeId);
    return results.every(r => r.outcome === 'proceed' || r.outcome === 'proceed_with_warning');
}
module.exports = {
    attachHooks, getHooksForGraph,
    executeHooks, allHooksPass,
};
//# sourceMappingURL=execution-hooks.js.map