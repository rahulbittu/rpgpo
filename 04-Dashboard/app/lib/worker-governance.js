"use strict";
// GPO Worker Governance — Runtime-level hooks for worker decisions
// Evaluates isActionAllowed and enforcement before work executes.
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateWorkerAction = evaluateWorkerAction;
exports.getDecisionsForGraph = getDecisionsForGraph;
exports.getDecisionsForNode = getDecisionsForNode;
exports.getAllDecisions = getAllDecisions;
const fs = require('fs');
const path = require('path');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'worker-decisions.json');
function uid() { return 'wd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Evaluate whether a worker action should proceed */
function evaluateWorkerAction(graphId, nodeId, action) {
    let outcome = 'proceed';
    const reasons = [];
    let retryAllowed = true;
    let maxRetries = 3;
    // Get graph context
    let lane = 'dev';
    let domain;
    try {
        const eg = require('./execution-graph');
        const graph = eg.getGraph(graphId);
        if (graph) {
            lane = graph.lane;
            domain = graph.domain;
        }
    }
    catch { /* */ }
    // Check runtime enforcement
    try {
        const re = require('./runtime-enforcement');
        const transition = action === 'execute_subtask' ? 'node_start' : action === 'execute_builder' ? 'node_start' : 'node_queue';
        const result = re.checkTransition(transition, graphId, nodeId);
        outcome = result.outcome;
        reasons.push(...result.reasons, ...result.warnings, ...result.blockers);
    }
    catch { /* runtime enforcement not loaded */ }
    // Check autonomy budget for retry limits
    try {
        const ab = require('./autonomy-budgets');
        const budget = ab.resolveBudget(lane, domain);
        maxRetries = budget.max_retries;
        if (lane === 'prod')
            retryAllowed = false;
    }
    catch { /* */ }
    const decision = {
        decision_id: uid(),
        graph_id: graphId,
        node_id: nodeId,
        action,
        outcome,
        retry_allowed: retryAllowed && outcome !== 'block',
        max_retries_remaining: maxRetries,
        reasons,
        created_at: new Date().toISOString(),
    };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 300)
        decisions.length = 300;
    writeJson(DECISIONS_FILE, decisions);
    return decision;
}
function getDecisionsForGraph(graphId) {
    return readJson(DECISIONS_FILE, []).filter(d => d.graph_id === graphId);
}
function getDecisionsForNode(nodeId) {
    return readJson(DECISIONS_FILE, []).filter(d => d.node_id === nodeId);
}
function getAllDecisions() {
    return readJson(DECISIONS_FILE, []);
}
module.exports = {
    evaluateWorkerAction,
    getDecisionsForGraph, getDecisionsForNode, getAllDecisions,
};
//# sourceMappingURL=worker-governance.js.map