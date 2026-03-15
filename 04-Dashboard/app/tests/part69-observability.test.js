// Tests: Part 69 — Structured I/O Observability + Metrics + Provider Learning + Evidence Lifecycle
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ══════════════════════════════════════════
// Metrics Ingestion and Snapshots
// ══════════════════════════════════════════

describe('structured-io-metrics', () => {
  const m = require('../lib/structured-io-metrics');

  function makeEvent(overrides) {
    return {
      id: 'e_' + Math.random().toString(36).slice(2, 6),
      taskId: 't1', subtaskId: null, deliverableId: null,
      schemaId: 'contract_newsroom', phase: 'execute', providerKey: 'openai',
      capability: 'native-json', attempt: 1,
      startedAt: Date.now() - 300, endedAt: Date.now(),
      latencyMs: 250, outcome: 'success', retryCount: 0,
      inputTokens: 500, outputTokens: 200, costUsd: 0.01,
      ...overrides,
    };
  }

  it('records events and produces snapshot', () => {
    m.initStructuredIoMetrics();
    for (let i = 0; i < 10; i++) m.recordStructuredIoEvent(makeEvent());
    const snap = m.getCurrentSnapshot(60);
    assert.equal(snap.totalCalls, 10);
    assert.equal(snap.successRate, 1.0);
    assert.ok(snap.avgLatencyMs > 0);
  });

  it('computes correct success rate with mixed outcomes', () => {
    m.initStructuredIoMetrics();
    for (let i = 0; i < 8; i++) m.recordStructuredIoEvent(makeEvent({ outcome: 'success' }));
    for (let i = 0; i < 2; i++) m.recordStructuredIoEvent(makeEvent({ outcome: 'parse_failure' }));
    const snap = m.getCurrentSnapshot(60);
    assert.equal(snap.totalCalls, 10);
    assert.equal(snap.successRate, 0.8);
    assert.equal(snap.parseFailureRate, 0.2);
  });

  it('computes latency percentiles', () => {
    m.initStructuredIoMetrics();
    const latencies = [10, 20, 30, 40, 50, 60, 70, 80, 90, 100];
    for (const l of latencies) m.recordStructuredIoEvent(makeEvent({ latencyMs: l }));
    const snap = m.getCurrentSnapshot(60);
    assert.ok(snap.p50LatencyMs >= 40 && snap.p50LatencyMs <= 60);
    assert.ok(snap.p95LatencyMs >= 90);
  });

  it('groups by provider', () => {
    m.initStructuredIoMetrics();
    m.recordStructuredIoEvent(makeEvent({ providerKey: 'openai' }));
    m.recordStructuredIoEvent(makeEvent({ providerKey: 'gemini' }));
    m.recordStructuredIoEvent(makeEvent({ providerKey: 'openai' }));
    const snap = m.getCurrentSnapshot(60);
    assert.equal(Object.keys(snap.byProvider).length, 2);
    assert.equal(snap.byProvider.openai.totalCalls, 2);
    assert.equal(snap.byProvider.gemini.totalCalls, 1);
  });

  it('groups by schema', () => {
    m.initStructuredIoMetrics();
    m.recordStructuredIoEvent(makeEvent({ schemaId: 'contract_newsroom' }));
    m.recordStructuredIoEvent(makeEvent({ schemaId: 'contract_shopping' }));
    const snap = m.getCurrentSnapshot(60);
    assert.equal(Object.keys(snap.bySchema).length, 2);
  });

  it('generates latency histogram', () => {
    m.initStructuredIoMetrics();
    for (let i = 0; i < 5; i++) m.recordStructuredIoEvent(makeEvent({ latencyMs: 150 }));
    for (let i = 0; i < 3; i++) m.recordStructuredIoEvent(makeEvent({ latencyMs: 1000 }));
    const hist = m.getLatencyHistogram(60);
    assert.ok(hist.bucketsMs.length > 0);
    assert.equal(hist.counts.reduce((a, b) => a + b, 0), 8);
  });

  it('reset clears events', () => {
    m.initStructuredIoMetrics();
    m.recordStructuredIoEvent(makeEvent());
    assert.equal(m.getCurrentSnapshot(60).totalCalls, 1);
    m.resetMetrics('all');
    assert.equal(m.getCurrentSnapshot(60).totalCalls, 0);
  });

  it('returns empty snapshot when no events', () => {
    m.initStructuredIoMetrics();
    const snap = m.getCurrentSnapshot(60);
    assert.equal(snap.totalCalls, 0);
    assert.equal(snap.successRate, 0);
  });

  it('computes total cost', () => {
    m.initStructuredIoMetrics();
    for (let i = 0; i < 5; i++) m.recordStructuredIoEvent(makeEvent({ costUsd: 0.01 }));
    const snap = m.getCurrentSnapshot(60);
    assert.ok(Math.abs(snap.totalCostUsd - 0.05) < 0.001);
  });
});

// ══════════════════════════════════════════
// Cost Tracking
// ══════════════════════════════════════════

describe('structured-io-cost', () => {
  const cost = require('../lib/structured-io-cost');

  it('estimates cost for known provider', () => {
    const c = cost.estimateCostUsd('openai:gpt-4o', 1000, 500);
    assert.ok(c > 0);
    // 1000/1000 * 5.0 + 500/1000 * 15.0 = 5.0 + 7.5 = 12.5
    assert.equal(c, 12.5);
  });

  it('uses default pricing for unknown provider', () => {
    const c = cost.estimateCostUsd('unknown_provider', 1000, 1000);
    // 1000/1000 * 2.0 + 1000/1000 * 6.0 = 8.0
    assert.equal(c, 8);
  });

  it('returns 0 for no tokens', () => {
    const c = cost.estimateCostUsd('openai:gpt-4o', 0, 0);
    assert.equal(c, 0);
  });
});

// ══════════════════════════════════════════
// Provider Learning — EWMA + Circuit Breaker
// ══════════════════════════════════════════

describe('provider-learning', () => {
  const pl = require('../lib/provider-learning');

  it('initializes with default score', () => {
    pl.initProviderLearning();
    assert.equal(pl.getDynamicScore('new_provider'), 0.5);
  });

  it('dynamic score increases with successes', () => {
    pl.initProviderLearning();
    const before = pl.getDynamicScore('openai');
    for (let i = 0; i < 10; i++) {
      pl.updateProviderFromEvent({ providerKey: 'openai', outcome: 'success', latencyMs: 200, costUsd: 0.01 });
    }
    assert.ok(pl.getDynamicScore('openai') > before);
  });

  it('dynamic score decreases with failures', () => {
    pl.initProviderLearning();
    // First build up
    for (let i = 0; i < 5; i++) pl.updateProviderFromEvent({ providerKey: 'openai', outcome: 'success', latencyMs: 200, costUsd: 0.01 });
    const mid = pl.getDynamicScore('openai');
    // Then fail
    for (let i = 0; i < 10; i++) pl.updateProviderFromEvent({ providerKey: 'openai', outcome: 'parse_failure', latencyMs: 5000, costUsd: 0.05 });
    assert.ok(pl.getDynamicScore('openai') < mid);
  });

  it('routing bias is bounded [-0.2, 0.2]', () => {
    pl.initProviderLearning();
    for (let i = 0; i < 20; i++) pl.updateProviderFromEvent({ providerKey: 'openai', outcome: 'success', latencyMs: 100, costUsd: 0.001 });
    const bias = pl.getRoutingBias('openai');
    assert.ok(bias >= -0.2 && bias <= 0.2);
  });

  it('circuit opens after threshold failures', () => {
    pl.initProviderLearning({ weights: { successRate: 0.6, latency: 0.25, cost: 0.15 }, minSamples: 5, decay: 'ewma', alpha: 0.3, circuitBreaker: { failureRateThreshold: 0.5, minimumCalls: 5, sleepWindowMs: 999999 } });
    for (let i = 0; i < 10; i++) pl.updateProviderFromEvent({ providerKey: 'bad_provider', outcome: 'provider_error', latencyMs: 5000, costUsd: 0 });
    assert.equal(pl.isCircuitOpen('bad_provider'), true);
  });

  it('override score works', () => {
    pl.initProviderLearning();
    pl.overrideProviderScore('test_provider', 0.9);
    assert.equal(pl.getDynamicScore('test_provider'), 0.9);
  });

  it('getProviderLearningState returns all providers', () => {
    pl.initProviderLearning();
    pl.updateProviderFromEvent({ providerKey: 'a', outcome: 'success', latencyMs: 100, costUsd: 0.01 });
    pl.updateProviderFromEvent({ providerKey: 'b', outcome: 'success', latencyMs: 200, costUsd: 0.02 });
    const state = pl.getProviderLearningState();
    assert.ok(state.a);
    assert.ok(state.b);
    assert.equal(state.a.totalCalls, 1);
  });
});

// ══════════════════════════════════════════
// Evidence Lifecycle
// ══════════════════════════════════════════

describe('evidence-lifecycle', () => {
  const el = require('../lib/evidence-lifecycle');
  const fs = require('fs');
  const path = require('path');

  it('indexEvidence returns counts', () => {
    const idx = el.indexEvidence();
    assert.ok(typeof idx.totalFiles === 'number');
    assert.ok(typeof idx.totalBytes === 'number');
    assert.ok(idx.byAge);
  });

  it('cleanup runs without error on empty evidence', () => {
    const result = el.runEvidenceCleanup();
    assert.ok(typeof result.deletedCount === 'number');
    assert.ok(typeof result.freedBytes === 'number');
  });
});

// ══════════════════════════════════════════
// Alerts
// ══════════════════════════════════════════

describe('structured-io-alerts', () => {
  const alerts = require('../lib/structured-io-alerts');
  const m = require('../lib/structured-io-metrics');

  it('no alerts when no events', () => {
    alerts.initStructuredIoAlerts();
    m.initStructuredIoMetrics();
    const result = alerts.evaluateAlerts();
    assert.equal(result.length, 0);
  });

  it('fires parse_spike alert when threshold exceeded', () => {
    alerts.initStructuredIoAlerts({ parseFailureRateThreshold: 0.1, providerErrorRateThreshold: 0.3, minCalls: 5, evaluationIntervalMinutes: 5, cooldownMinutes: 0 });
    m.initStructuredIoMetrics();
    // 4 failures out of 5 calls = 80% failure rate
    for (let i = 0; i < 4; i++) {
      m.recordStructuredIoEvent({ id: 'a'+i, taskId: 't', subtaskId: null, deliverableId: null, schemaId: 's', phase: 'execute', providerKey: 'openai', capability: 'native-json', attempt: 1, startedAt: Date.now()-100, endedAt: Date.now(), latencyMs: 200, outcome: 'parse_failure', retryCount: 0 });
    }
    m.recordStructuredIoEvent({ id: 'a4', taskId: 't', subtaskId: null, deliverableId: null, schemaId: 's', phase: 'execute', providerKey: 'openai', capability: 'native-json', attempt: 1, startedAt: Date.now()-100, endedAt: Date.now(), latencyMs: 200, outcome: 'success', retryCount: 0 });

    const result = alerts.evaluateAlerts();
    assert.ok(result.length > 0, 'Should fire alert');
    assert.equal(result[0].kind, 'parse_spike');
  });

  it('acknowledges alert', () => {
    const active = alerts.listActiveAlerts();
    if (active.length > 0) {
      const ok = alerts.acknowledgeAlert(active[0].id, 'test_operator');
      assert.equal(ok, true);
    }
  });

  it('returns false for unknown alert ack', () => {
    assert.equal(alerts.acknowledgeAlert('nonexistent_id', 'test'), false);
  });
});
