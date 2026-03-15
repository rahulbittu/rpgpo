"use strict";
// GPO Backpressure — Policy engine integrating provider health and budgets
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
exports.shouldRejectNewEnqueues = shouldRejectNewEnqueues;
/**
 * Evaluate current provider health and produce backpressure signals.
 */
function evaluate(nowIso) {
    const now = nowIso || new Date().toISOString();
    const signals = [];
    try {
        const pl = require('../provider-learning');
        const state = pl.getProviderLearningState();
        for (const [key, pm] of Object.entries(state)) {
            // Circuit breaker open
            if (pm.circuitOpen) {
                signals.push({
                    provider: key, reason: 'breaker_open', factor: 0.25,
                    observed: { open: true }, ttlMs: 60000, at: now,
                });
            }
            // Low success rate
            if (pm.successRate < 0.7) {
                signals.push({
                    provider: key, reason: 'error_spike', factor: 0.5,
                    observed: { errorRate: 1 - pm.successRate }, ttlMs: 30000, at: now,
                });
            }
        }
    }
    catch { /* provider learning not available */ }
    return signals;
}
/**
 * Check if new enqueues should be rejected based on queue capacity.
 */
function shouldRejectNewEnqueues(queueStats, config) {
    if (queueStats.total >= config.queueCapacity) {
        return { reject: true, reason: 'Queue at capacity', retryAfterSec: 30 };
    }
    return { reject: false };
}
module.exports = { evaluate, shouldRejectNewEnqueues };
//# sourceMappingURL=backpressure.js.map