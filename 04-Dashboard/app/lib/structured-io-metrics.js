"use strict";
// GPO Structured I/O Metrics — Event ingestion, rolling aggregation, histograms, snapshots
Object.defineProperty(exports, "__esModule", { value: true });
exports.initStructuredIoMetrics = initStructuredIoMetrics;
exports.recordStructuredIoEvent = recordStructuredIoEvent;
exports.getCurrentSnapshot = getCurrentSnapshot;
exports.getProviderMetrics = getProviderMetrics;
exports.getSchemaMetrics = getSchemaMetrics;
exports.getLatencyHistogram = getLatencyHistogram;
exports.resetMetrics = resetMetrics;
exports.getEvents = getEvents;
exports.persistSnapshot = persistSnapshot;
const fs = require('fs');
const path = require('path');
const CONFIG_FILE = path.resolve(__dirname, '..', '..', 'state', 'config', 'structured-io.json');
const METRICS_DIR = path.resolve(__dirname, '..', '..', 'state', 'metrics');
let _events = [];
let _config = null;
function loadConfig() {
    if (_config)
        return _config;
    try {
        if (fs.existsSync(CONFIG_FILE)) {
            _config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
            return _config;
        }
    }
    catch { /* */ }
    _config = { metrics: { latencyBucketsMs: [50, 100, 200, 400, 800, 1600, 3200, 6400], aggregationWindowMinutes: 5, retentionHours: 168 }, providerLearning: { weights: { successRate: 0.6, latency: 0.25, cost: 0.15 }, minSamples: 30, decay: 'ewma', alpha: 0.2, circuitBreaker: { failureRateThreshold: 0.5, minimumCalls: 20, sleepWindowMs: 300000 } }, evidence: { ttlDays: 30, cleanupIntervalMinutes: 60, maxBytes: 500000000 }, alerts: { parseFailureRateThreshold: 0.2, providerErrorRateThreshold: 0.3, minCalls: 20, evaluationIntervalMinutes: 5, cooldownMinutes: 30 }, cost: { providerPricing: {}, defaultPricing: { inputPer1k: 2.0, outputPer1k: 6.0 } } };
    return _config;
}
function initStructuredIoMetrics() {
    loadConfig();
    _events = [];
}
function recordStructuredIoEvent(event) {
    _events.push(event);
    // Trim to retention window
    const cfg = loadConfig();
    const cutoff = Date.now() - cfg.metrics.retentionHours * 3600000;
    if (_events.length > 10000) {
        _events = _events.filter(e => e.endedAt > cutoff);
    }
}
function getCurrentSnapshot(windowMinutes) {
    const cfg = loadConfig();
    const windowMs = (windowMinutes || cfg.metrics.aggregationWindowMinutes) * 60000;
    const now = Date.now();
    const windowStart = now - windowMs;
    const events = _events.filter(e => e.endedAt >= windowStart);
    if (events.length === 0) {
        return emptySnapshot(windowStart, now);
    }
    const total = events.length;
    const successes = events.filter(e => e.outcome === 'success').length;
    const parseFailures = events.filter(e => e.outcome === 'parse_failure').length;
    const providerErrors = events.filter(e => e.outcome === 'provider_error').length;
    const latencies = events.map(e => e.latencyMs).sort((a, b) => a - b);
    const retries = events.filter(e => e.retryCount > 0).length;
    const totalCost = events.reduce((s, e) => s + (e.costUsd || 0), 0);
    const byProvider = {};
    const bySchema = {};
    for (const e of events) {
        if (!byProvider[e.providerKey])
            byProvider[e.providerKey] = emptyProviderMetrics(e.providerKey);
        updateProviderMetrics(byProvider[e.providerKey], e);
        if (!bySchema[e.schemaId])
            bySchema[e.schemaId] = { schemaId: e.schemaId, totalCalls: 0, successRate: 0, avgLatencyMs: 0, avgAttempts: 0 };
        updateSchemaMetrics(bySchema[e.schemaId], e);
    }
    // Finalize rates
    for (const pm of Object.values(byProvider))
        finalizeProviderMetrics(pm);
    for (const sm of Object.values(bySchema))
        finalizeSchemaMetrics(sm);
    return {
        windowStart, windowEnd: now, totalCalls: total,
        successRate: successes / total,
        parseFailureRate: parseFailures / total,
        providerErrorRate: providerErrors / total,
        avgLatencyMs: latencies.reduce((s, l) => s + l, 0) / total,
        p50LatencyMs: percentile(latencies, 0.5),
        p95LatencyMs: percentile(latencies, 0.95),
        p99LatencyMs: percentile(latencies, 0.99),
        retryRate: retries / total,
        avgAttempts: events.reduce((s, e) => s + e.attempt, 0) / total,
        totalCostUsd: totalCost,
        byProvider, bySchema,
    };
}
function getProviderMetrics(providerKey, windowMinutes) {
    const snap = getCurrentSnapshot(windowMinutes);
    return snap.byProvider[providerKey] || emptyProviderMetrics(providerKey);
}
function getSchemaMetrics(schemaId, windowMinutes) {
    const snap = getCurrentSnapshot(windowMinutes);
    return snap.bySchema[schemaId] || { schemaId, totalCalls: 0, successRate: 0, avgLatencyMs: 0, avgAttempts: 0 };
}
function getLatencyHistogram(windowMinutes) {
    const cfg = loadConfig();
    const buckets = cfg.metrics.latencyBucketsMs;
    const windowMs = (windowMinutes || cfg.metrics.aggregationWindowMinutes) * 60000;
    const now = Date.now();
    const events = _events.filter(e => e.endedAt >= now - windowMs);
    const counts = new Array(buckets.length + 1).fill(0);
    for (const e of events) {
        let placed = false;
        for (let i = 0; i < buckets.length; i++) {
            if (e.latencyMs <= buckets[i]) {
                counts[i]++;
                placed = true;
                break;
            }
        }
        if (!placed)
            counts[buckets.length]++;
    }
    return { bucketsMs: [...buckets, Infinity], counts };
}
function resetMetrics(scope, key) {
    if (!scope || scope === 'all') {
        _events = [];
        return;
    }
    if (scope === 'provider' && key) {
        _events = _events.filter(e => e.providerKey !== key);
    }
    if (scope === 'schema' && key) {
        _events = _events.filter(e => e.schemaId !== key);
    }
}
function getEvents() { return [..._events]; }
function persistSnapshot() {
    try {
        if (!fs.existsSync(METRICS_DIR))
            fs.mkdirSync(METRICS_DIR, { recursive: true });
        const snap = getCurrentSnapshot();
        const file = path.join(METRICS_DIR, `structured-io-${new Date().toISOString().slice(0, 10)}.jsonl`);
        const line = JSON.stringify({ ...snap, persisted_at: new Date().toISOString() }) + '\n';
        fs.appendFileSync(file, line);
    }
    catch { /* non-fatal */ }
}
// ── Helpers ──
function percentile(sorted, p) {
    if (sorted.length === 0)
        return 0;
    const idx = Math.ceil(sorted.length * p) - 1;
    return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
}
function emptySnapshot(start, end) {
    return { windowStart: start, windowEnd: end, totalCalls: 0, successRate: 0, parseFailureRate: 0, providerErrorRate: 0, avgLatencyMs: 0, p50LatencyMs: 0, p95LatencyMs: 0, p99LatencyMs: 0, retryRate: 0, avgAttempts: 0, totalCostUsd: 0, byProvider: {}, bySchema: {} };
}
function emptyProviderMetrics(key) {
    return { providerKey: key, totalCalls: 0, successRate: 0, parseFailureRate: 0, providerErrorRate: 0, avgLatencyMs: 0, p50LatencyMs: 0, p95LatencyMs: 0, p99LatencyMs: 0, avgAttempts: 0, totalCostUsd: 0, dynamicScore: 0.5, samples: 0, circuitOpen: false, lastUpdated: Date.now() };
}
function updateProviderMetrics(pm, e) {
    pm.totalCalls++;
    pm.samples++;
    pm.totalCostUsd += e.costUsd || 0;
    pm.lastUpdated = e.endedAt;
    pm._successes = (pm._successes || 0) + (e.outcome === 'success' ? 1 : 0);
    pm._parseFailures = (pm._parseFailures || 0) + (e.outcome === 'parse_failure' ? 1 : 0);
    pm._providerErrors = (pm._providerErrors || 0) + (e.outcome === 'provider_error' ? 1 : 0);
    pm._totalLatency = (pm._totalLatency || 0) + e.latencyMs;
    pm._latencies = (pm._latencies || []);
    pm._latencies.push(e.latencyMs);
    pm._totalAttempts = (pm._totalAttempts || 0) + e.attempt;
}
function finalizeProviderMetrics(pm) {
    if (pm.totalCalls === 0)
        return;
    pm.successRate = pm._successes / pm.totalCalls;
    pm.parseFailureRate = pm._parseFailures / pm.totalCalls;
    pm.providerErrorRate = pm._providerErrors / pm.totalCalls;
    pm.avgLatencyMs = pm._totalLatency / pm.totalCalls;
    pm.avgAttempts = pm._totalAttempts / pm.totalCalls;
    const sorted = (pm._latencies || []).sort((a, b) => a - b);
    pm.p50LatencyMs = percentile(sorted, 0.5);
    pm.p95LatencyMs = percentile(sorted, 0.95);
    pm.p99LatencyMs = percentile(sorted, 0.99);
    // Clean up temp fields
    delete pm._successes;
    delete pm._parseFailures;
    delete pm._providerErrors;
    delete pm._totalLatency;
    delete pm._latencies;
    delete pm._totalAttempts;
}
function updateSchemaMetrics(sm, e) {
    sm.totalCalls++;
    sm._successes = (sm._successes || 0) + (e.outcome === 'success' ? 1 : 0);
    sm._totalLatency = (sm._totalLatency || 0) + e.latencyMs;
    sm._totalAttempts = (sm._totalAttempts || 0) + e.attempt;
}
function finalizeSchemaMetrics(sm) {
    if (sm.totalCalls === 0)
        return;
    sm.successRate = sm._successes / sm.totalCalls;
    sm.avgLatencyMs = sm._totalLatency / sm.totalCalls;
    sm.avgAttempts = sm._totalAttempts / sm.totalCalls;
    delete sm._successes;
    delete sm._totalLatency;
    delete sm._totalAttempts;
}
module.exports = { initStructuredIoMetrics, recordStructuredIoEvent, getCurrentSnapshot, getProviderMetrics, getSchemaMetrics, getLatencyHistogram, resetMetrics, getEvents, persistSnapshot, loadConfig };
//# sourceMappingURL=structured-io-metrics.js.map