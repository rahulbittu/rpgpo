"use strict";
// GPO DAG Runner — Convert execution graph to queue items, manage ready set transitions
Object.defineProperty(exports, "__esModule", { value: true });
exports.seedRun = seedRun;
exports.onNodeComplete = onNodeComplete;
exports.runProgress = runProgress;
exports.getRun = getRun;
exports.cancelRun = cancelRun;
const { queueItemId } = require('./ids');
const _runs = new Map();
/**
 * Seed a run from an execution graph.
 * Creates QueueItems for each node with deps and ready flags.
 */
function seedRun(runId, nodes, ctx) {
    const run = { nodes: new Map(), completed: new Set() };
    const items = [];
    for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const nodeId = node.id || node.node_id || `node_${i}`;
        const deps = (node.depends_on || []).map(d => typeof d === 'number' ? `node_${d}` : String(d));
        const provider = ctx.providerHints?.[nodeId] || node.assigned_model || 'openai';
        const item = {
            id: queueItemId(runId, nodeId),
            key: { runId, nodeId },
            projectId: ctx.projectId,
            tenantId: ctx.tenantId,
            provider,
            priority: ctx.priorityDefault || 'normal',
            enqueuedAt: new Date().toISOString(),
            attempts: [],
            status: 'queued',
            payloadRef: { contractId: runId, subtaskSpecRef: nodeId },
            deps,
            dependents: [],
            ready: deps.length === 0,
        };
        run.nodes.set(nodeId, item);
        items.push(item);
    }
    // Compute dependents
    for (const item of items) {
        for (const depId of item.deps) {
            const dep = run.nodes.get(depId);
            if (dep)
                dep.dependents.push(item.key.nodeId);
        }
    }
    _runs.set(runId, run);
    return items;
}
/**
 * Called when a node completes. Unlocks dependents.
 */
function onNodeComplete(runId, nodeId) {
    const run = _runs.get(runId);
    if (!run)
        return [];
    run.completed.add(nodeId);
    const node = run.nodes.get(nodeId);
    if (!node)
        return [];
    const unlockedIds = [];
    for (const depId of node.dependents) {
        const dependent = run.nodes.get(depId);
        if (!dependent)
            continue;
        const allDepsComplete = dependent.deps.every(d => run.completed.has(d));
        if (allDepsComplete && !dependent.ready) {
            dependent.ready = true;
            unlockedIds.push(depId);
        }
    }
    return unlockedIds;
}
/**
 * Get progress for a run.
 */
function runProgress(runId) {
    const run = _runs.get(runId);
    if (!run)
        return null;
    const nodes = Array.from(run.nodes.values());
    return {
        graphNodes: nodes.length,
        completed: run.completed.size,
        blocked: nodes.filter(n => !n.ready && n.status === 'queued').length,
        ready: nodes.filter(n => n.ready && n.status === 'queued').length,
        failed: nodes.filter(n => n.status === 'dead_letter' || n.status === 'canceled').length,
        startedAt: nodes[0]?.enqueuedAt || new Date().toISOString(),
    };
}
function getRun(runId) {
    return _runs.get(runId)?.nodes || null;
}
function cancelRun(runId) {
    const run = _runs.get(runId);
    if (!run)
        return [];
    const canceled = [];
    for (const [nodeId, item] of run.nodes) {
        if (item.status === 'queued' || item.status === 'in_flight') {
            item.status = 'canceled';
            canceled.push(nodeId);
        }
    }
    return canceled;
}
module.exports = { seedRun, onNodeComplete, runProgress, getRun, cancelRun };
//# sourceMappingURL=dag-runner.js.map