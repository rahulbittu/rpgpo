"use strict";
// GPO Provider Learning — Dynamic scoring with EWMA, circuit breaker, routing bias
Object.defineProperty(exports, "__esModule", { value: true });
exports.initProviderLearning = initProviderLearning;
exports.updateProviderFromEvent = updateProviderFromEvent;
exports.getDynamicScore = getDynamicScore;
exports.getRoutingBias = getRoutingBias;
exports.isCircuitOpen = isCircuitOpen;
exports.getProviderLearningState = getProviderLearningState;
exports.overrideProviderScore = overrideProviderScore;
let _config = null;
const _state = new Map();
function getConfig() {
    if (_config)
        return _config;
    try {
        const { loadConfig } = require('./structured-io-metrics');
        const cfg = loadConfig();
        _config = cfg.providerLearning;
        return _config;
    }
    catch { /* */ }
    return { weights: { successRate: 0.6, latency: 0.25, cost: 0.15 }, minSamples: 30, decay: 'ewma', alpha: 0.2, circuitBreaker: { failureRateThreshold: 0.5, minimumCalls: 20, sleepWindowMs: 300000 } };
}
function initProviderLearning(config) {
    if (config)
        _config = config;
    _state.clear();
}
function getOrCreate(providerKey) {
    if (!_state.has(providerKey)) {
        _state.set(providerKey, {
            ewmaSuccess: 0.8, ewmaLatency: 500, ewmaCost: 0.01,
            totalCalls: 0, recentFailures: 0, recentCalls: 0,
            circuitOpen: false, circuitOpenedAt: 0,
            dynamicScore: 0.5, lastUpdated: Date.now(),
        });
    }
    return _state.get(providerKey);
}
function updateProviderFromEvent(event) {
    const cfg = getConfig();
    const s = getOrCreate(event.providerKey);
    const alpha = cfg.alpha;
    const success = event.outcome === 'success' ? 1 : 0;
    // EWMA updates
    s.ewmaSuccess = alpha * success + (1 - alpha) * s.ewmaSuccess;
    s.ewmaLatency = alpha * event.latencyMs + (1 - alpha) * s.ewmaLatency;
    if (event.costUsd !== undefined) {
        s.ewmaCost = alpha * event.costUsd + (1 - alpha) * s.ewmaCost;
    }
    s.totalCalls++;
    s.recentCalls++;
    if (!success)
        s.recentFailures++;
    s.lastUpdated = Date.now();
    // Compute dynamic score
    const w = cfg.weights;
    const latencyNorm = Math.max(0.01, s.ewmaLatency / 5000); // normalize to 5s
    const costNorm = Math.max(0.001, s.ewmaCost / 0.1); // normalize to $0.10
    s.dynamicScore = Math.min(1, Math.max(0, w.successRate * s.ewmaSuccess +
        w.latency * (1 / latencyNorm) +
        w.cost * (1 / costNorm)));
    // Circuit breaker check
    const cb = cfg.circuitBreaker;
    if (s.recentCalls >= cb.minimumCalls) {
        const failRate = s.recentFailures / s.recentCalls;
        if (failRate >= cb.failureRateThreshold && !s.circuitOpen) {
            s.circuitOpen = true;
            s.circuitOpenedAt = Date.now();
        }
    }
    // Auto-close circuit after sleep window (half-open)
    if (s.circuitOpen && Date.now() - s.circuitOpenedAt >= cb.sleepWindowMs) {
        s.circuitOpen = false;
        s.recentFailures = 0;
        s.recentCalls = 0;
    }
}
function getDynamicScore(providerKey) {
    return getOrCreate(providerKey).dynamicScore;
}
function getRoutingBias(providerKey) {
    const s = getOrCreate(providerKey);
    // Bias: -0.2 to +0.2 based on score deviation from 0.5
    return Math.max(-0.2, Math.min(0.2, (s.dynamicScore - 0.5) * 0.4));
}
function isCircuitOpen(providerKey) {
    const s = getOrCreate(providerKey);
    // Check if sleep window elapsed
    if (s.circuitOpen) {
        const cfg = getConfig();
        if (Date.now() - s.circuitOpenedAt >= cfg.circuitBreaker.sleepWindowMs) {
            s.circuitOpen = false;
            s.recentFailures = 0;
            s.recentCalls = 0;
        }
    }
    return s.circuitOpen;
}
function getProviderLearningState() {
    const result = {};
    _state.forEach((s, key) => {
        result[key] = {
            providerKey: key,
            totalCalls: s.totalCalls,
            successRate: s.ewmaSuccess,
            parseFailureRate: 1 - s.ewmaSuccess,
            providerErrorRate: 0,
            avgLatencyMs: s.ewmaLatency,
            p50LatencyMs: s.ewmaLatency,
            p95LatencyMs: s.ewmaLatency * 2,
            p99LatencyMs: s.ewmaLatency * 3,
            avgAttempts: 1,
            totalCostUsd: s.ewmaCost * s.totalCalls,
            dynamicScore: s.dynamicScore,
            samples: s.totalCalls,
            circuitOpen: s.circuitOpen,
            lastUpdated: s.lastUpdated,
        };
    });
    return result;
}
function overrideProviderScore(providerKey, score) {
    const s = getOrCreate(providerKey);
    s.dynamicScore = Math.min(1, Math.max(0, score));
}
module.exports = { initProviderLearning, updateProviderFromEvent, getDynamicScore, getRoutingBias, isCircuitOpen, getProviderLearningState, overrideProviderScore };
//# sourceMappingURL=provider-learning.js.map