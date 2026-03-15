"use strict";
// GPO Structured I/O Cost — Per-call, per-provider, per-task cost tracking
Object.defineProperty(exports, "__esModule", { value: true });
exports.initStructuredIoCost = initStructuredIoCost;
exports.estimateCostUsd = estimateCostUsd;
exports.recordCost = recordCost;
exports.getCostSummary = getCostSummary;
let _config = null;
function initStructuredIoCost(costConfig) {
    _config = costConfig;
}
function getConfig() {
    if (_config)
        return _config;
    try {
        const { loadConfig } = require('./structured-io-metrics');
        const cfg = loadConfig();
        _config = cfg.cost;
        return _config;
    }
    catch { /* */ }
    return { providerPricing: {}, defaultPricing: { inputPer1k: 2.0, outputPer1k: 6.0 } };
}
/**
 * Estimate cost in USD for a structured I/O call.
 */
function estimateCostUsd(providerKey, inputTokens, outputTokens) {
    const cfg = getConfig();
    const pricing = cfg.providerPricing[providerKey] || cfg.defaultPricing;
    const inCost = ((inputTokens || 0) / 1000) * pricing.inputPer1k;
    const outCost = ((outputTokens || 0) / 1000) * pricing.outputPer1k;
    return Math.round((inCost + outCost) * 1000000) / 1000000; // 6 decimal precision
}
/** Per-task cost accumulator */
const _taskCosts = new Map();
function recordCost(event) {
    if (!event.costUsd && (event.inputTokens || event.outputTokens)) {
        event.costUsd = estimateCostUsd(event.providerKey, event.inputTokens, event.outputTokens);
    }
    if (event.taskId && event.costUsd) {
        _taskCosts.set(event.taskId, (_taskCosts.get(event.taskId) || 0) + event.costUsd);
    }
}
function getCostSummary(windowMinutes) {
    try {
        const metrics = require('./structured-io-metrics');
        const snap = metrics.getCurrentSnapshot(windowMinutes);
        const byProvider = {};
        for (const [k, pm] of Object.entries(snap.byProvider)) {
            byProvider[k] = pm.totalCostUsd || 0;
        }
        const byTask = {};
        _taskCosts.forEach((v, k) => { byTask[k] = v; });
        return { totalUsd: snap.totalCostUsd, byProvider, byTask };
    }
    catch {
        return { totalUsd: 0, byProvider: {}, byTask: {} };
    }
}
module.exports = { initStructuredIoCost, estimateCostUsd, recordCost, getCostSummary };
//# sourceMappingURL=structured-io-cost.js.map