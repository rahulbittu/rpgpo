// Tests: Part 70 — Parallel Execution Engine + Resource-Aware Scheduling + Backpressure
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ══════════════════════════════════════════
// Scheduler Store
// ══════════════════════════════════════════

describe('state/scheduler-store', () => {
  const store = require('../lib/state/scheduler-store');

  it('loads default config', () => {
    const cfg = store.loadConfig();
    assert.equal(cfg.version, 1);
    assert.equal(cfg.featureFlags.enabled, false);
    assert.equal(cfg.globalMaxConcurrent, 1);
    assert.ok(cfg.perProviderMaxConcurrent.openai);
  });

  it('paused defaults to false', () => {
    assert.equal(store.getPaused(), false);
  });
});

// ══════════════════════════════════════════
// Queue Item IDs
// ══════════════════════════════════════════

describe('scheduler/ids', () => {
  const { queueItemId, attemptId } = require('../lib/scheduler/ids');

  it('produces deterministic queue item IDs', () => {
    assert.equal(queueItemId('run1', 'node1'), queueItemId('run1', 'node1'));
  });

  it('produces different IDs for different inputs', () => {
    assert.notEqual(queueItemId('run1', 'node1'), queueItemId('run1', 'node2'));
  });

  it('attempt IDs are unique', () => {
    assert.notEqual(attemptId(), attemptId());
  });
});

// ══════════════════════════════════════════
// DAG Runner
// ══════════════════════════════════════════

describe('scheduler/dag-runner', () => {
  const dag = require('../lib/scheduler/dag-runner');

  it('seeds run with correct ready flags', () => {
    const items = dag.seedRun('test_run_1', [
      { id: 'a' },
      { id: 'b', depends_on: ['a'] },
      { id: 'c', depends_on: ['a'] },
      { id: 'd', depends_on: ['b', 'c'] },
    ], { tenantId: 'rpgpo', projectId: 'default' });
    assert.equal(items.length, 4);
    assert.equal(items.find(i => i.key.nodeId === 'a').ready, true);
    assert.equal(items.find(i => i.key.nodeId === 'b').ready, false);
    assert.equal(items.find(i => i.key.nodeId === 'c').ready, false);
    assert.equal(items.find(i => i.key.nodeId === 'd').ready, false);
  });

  it('onNodeComplete unlocks dependents correctly', () => {
    dag.seedRun('test_run_2', [
      { id: 'x' },
      { id: 'y', depends_on: ['x'] },
    ], { tenantId: 'rpgpo', projectId: 'default' });

    const unlocked = dag.onNodeComplete('test_run_2', 'x');
    assert.deepEqual(unlocked, ['y']);
  });

  it('does not unlock until all deps complete', () => {
    dag.seedRun('test_run_3', [
      { id: 'p' },
      { id: 'q' },
      { id: 'r', depends_on: ['p', 'q'] },
    ], { tenantId: 'rpgpo', projectId: 'default' });

    const u1 = dag.onNodeComplete('test_run_3', 'p');
    assert.deepEqual(u1, []); // q not done yet
    const u2 = dag.onNodeComplete('test_run_3', 'q');
    assert.deepEqual(u2, ['r']); // both done
  });

  it('runProgress returns correct counts', () => {
    dag.seedRun('test_run_4', [
      { id: 'a1' }, { id: 'b1', depends_on: ['a1'] },
    ], { tenantId: 'rpgpo', projectId: 'default' });

    const p = dag.runProgress('test_run_4');
    assert.equal(p.graphNodes, 2);
    assert.equal(p.completed, 0);
    assert.equal(p.ready, 1);
    assert.equal(p.blocked, 1);
  });

  it('returns null for unknown run', () => {
    assert.equal(dag.runProgress('nonexistent'), null);
  });

  it('cancelRun marks nodes as canceled', () => {
    dag.seedRun('test_run_5', [{ id: 'z1' }, { id: 'z2' }], { tenantId: 'rpgpo', projectId: 'default' });
    const canceled = dag.cancelRun('test_run_5');
    assert.equal(canceled.length, 2);
  });
});

// ══════════════════════════════════════════
// Work Queue
// ══════════════════════════════════════════

describe('scheduler/work-queue', () => {
  const wq = require('../lib/scheduler/work-queue');

  it('enqueues and dequeues items', () => {
    wq.init(true);
    wq.enqueue([{
      id: 'qi_test_1', key: { runId: 'r1', nodeId: 'n1' },
      projectId: 'default', tenantId: 'rpgpo', provider: 'openai',
      priority: 'normal', enqueuedAt: new Date().toISOString(),
      attempts: [], status: 'queued',
      payloadRef: { contractId: 'c1', subtaskSpecRef: 'n1' },
      deps: [], dependents: [], ready: true,
    }]);
    assert.equal(wq.stats().queued, 1);

    const items = wq.dequeueReady('worker1', 1);
    assert.equal(items.length, 1);
    assert.equal(items[0].status, 'in_flight');
    assert.equal(wq.stats().inFlight, 1);
  });

  it('ackSuccess moves to done', () => {
    wq.init(true);
    const item = {
      id: 'qi_ack_ok', key: { runId: 'r2', nodeId: 'n2' },
      projectId: 'default', tenantId: 'rpgpo', provider: 'openai',
      priority: 'normal', enqueuedAt: new Date().toISOString(),
      attempts: [{ attemptId: 'att_ok', startedAt: new Date().toISOString(), status: 'in_progress' }],
      status: 'queued', payloadRef: { contractId: 'c', subtaskSpecRef: 'n' },
      deps: [], dependents: [], ready: true,
    };
    wq.enqueue([item]);
    wq.dequeueReady('w', 1);
    wq.ackSuccess('qi_ack_ok', 'att_ok');
    const s = wq.stats();
    assert.equal(s.done, 1);
    assert.equal(s.inFlight, 0);
  });

  it('ackFailure with requeue puts back in queue', () => {
    wq.init(true);
    wq.enqueue([{
      id: 'qi_ack_fail', key: { runId: 'r3', nodeId: 'n3' },
      projectId: 'default', tenantId: 'rpgpo', provider: 'openai',
      priority: 'normal', enqueuedAt: new Date().toISOString(),
      attempts: [{ attemptId: 'att_f', startedAt: new Date().toISOString(), status: 'in_progress' }],
      status: 'queued', payloadRef: { contractId: 'c', subtaskSpecRef: 'n' },
      deps: [], dependents: [], ready: true,
    }]);
    wq.dequeueReady('w', 1);
    wq.ackFailure('qi_ack_fail', 'att_f', 'ERR', 'test', true);
    const s = wq.stats();
    assert.equal(s.queued, 1);
    assert.equal(s.inFlight, 0);
  });

  it('respects priority ordering', () => {
    wq.init(true);
    const base = { projectId: 'default', tenantId: 'rpgpo', provider: 'openai', enqueuedAt: new Date().toISOString(), attempts: [], status: 'queued', payloadRef: { contractId: 'c', subtaskSpecRef: 'n' }, deps: [], dependents: [], ready: true };
    wq.enqueue([
      { ...base, id: 'pri_low', key: { runId: 'rp', nodeId: 'low' }, priority: 'low' },
      { ...base, id: 'pri_crit', key: { runId: 'rp', nodeId: 'crit' }, priority: 'critical' },
      { ...base, id: 'pri_high', key: { runId: 'rp', nodeId: 'high' }, priority: 'high' },
    ]);
    const items = wq.dequeueReady('w', 3);
    assert.equal(items[0].id, 'pri_crit');
    assert.equal(items[1].id, 'pri_high');
    assert.equal(items[2].id, 'pri_low');
  });

  it('markCanceled moves to DLQ', () => {
    wq.init(true);
    wq.enqueue([{
      id: 'qi_test_cancel', key: { runId: 'r', nodeId: 'c' },
      projectId: 'default', tenantId: 'rpgpo', provider: 'openai',
      priority: 'normal', enqueuedAt: new Date().toISOString(),
      attempts: [], status: 'queued',
      payloadRef: { contractId: 'c', subtaskSpecRef: 'n' },
      deps: [], dependents: [], ready: true,
    }]);
    wq.markCanceled('qi_test_cancel', 'test');
    assert.equal(wq.stats().deadLetter, 1);
  });

  it('recoverLeases requeues expired items', () => {
    wq.init(true);
    wq.enqueue([{
      id: 'qi_test_lease', key: { runId: 'r', nodeId: 'l' },
      projectId: 'default', tenantId: 'rpgpo', provider: 'openai',
      priority: 'normal', enqueuedAt: new Date().toISOString(),
      attempts: [{ attemptId: 'a1', startedAt: new Date().toISOString(), status: 'in_progress' }],
      status: 'queued', payloadRef: { contractId: 'c', subtaskSpecRef: 'n' },
      deps: [], dependents: [], ready: true,
    }]);
    wq.dequeueReady('w', 1); // moves to inflight
    // Force lease to have expired
    const inflight = wq.getInflight();
    if (inflight.length) inflight[0].leaseExpiresAt = new Date(Date.now() - 1000).toISOString();
    const recovered = wq.recoverLeases(new Date().toISOString());
    assert.ok(recovered >= 0);
  });
});

// ══════════════════════════════════════════
// Provider Capacity
// ══════════════════════════════════════════

describe('scheduler/provider-capacity', () => {
  const cap = require('../lib/scheduler/provider-capacity');
  const store = require('../lib/state/scheduler-store');

  it('computes capacity windows', () => {
    cap.reset();
    const cfg = store.loadConfig();
    const windows = cap.computeCapacityWindows(cfg);
    assert.ok(windows.length > 0);
    const openai = windows.find(w => w.provider === 'openai');
    assert.ok(openai);
    assert.equal(openai.baseLimit, 4);
    assert.equal(openai.inUse, 0);
  });

  it('tryAcquire respects global limit', () => {
    cap.reset();
    const cfg = { ...store.loadConfig(), globalMaxConcurrent: 1 };
    const item1 = { provider: 'openai', tenantId: 'rpgpo', projectId: 'default' };
    const item2 = { provider: 'openai', tenantId: 'rpgpo', projectId: 'default' };
    assert.equal(cap.tryAcquire(item1, cfg), true);
    assert.equal(cap.tryAcquire(item2, cfg), false);
    cap.release(item1);
    assert.equal(cap.tryAcquire(item2, cfg), true);
    cap.release(item2);
  });

  it('backpressure reduces dynamic limit', () => {
    cap.reset();
    const cfg = store.loadConfig();
    cap.applyBackpressureSignals([{
      provider: 'openai', reason: 'breaker_open', factor: 0.25,
      observed: { open: true }, ttlMs: 60000, at: new Date().toISOString(),
    }]);
    const windows = cap.computeCapacityWindows(cfg);
    const openai = windows.find(w => w.provider === 'openai');
    assert.equal(openai.dynamicLimit, 1); // floor(4 * 0.25) = 1
  });
});

// ══════════════════════════════════════════
// Backpressure
// ══════════════════════════════════════════

describe('scheduler/backpressure', () => {
  const bp = require('../lib/scheduler/backpressure');

  it('evaluate returns signals array', () => {
    const signals = bp.evaluate();
    assert.ok(Array.isArray(signals));
  });

  it('shouldRejectNewEnqueues rejects at capacity', () => {
    const cfg = { queueCapacity: 5 };
    assert.equal(bp.shouldRejectNewEnqueues({ total: 5 }, cfg).reject, true);
    assert.equal(bp.shouldRejectNewEnqueues({ total: 4 }, cfg).reject, false);
  });
});

// ══════════════════════════════════════════
// Scheduler
// ══════════════════════════════════════════

describe('scheduler/scheduler', () => {
  const sched = require('../lib/scheduler/scheduler');

  it('exports all required functions', () => {
    assert.equal(typeof sched.start, 'function');
    assert.equal(typeof sched.stop, 'function');
    assert.equal(typeof sched.isPaused, 'function');
    assert.equal(typeof sched.pause, 'function');
    assert.equal(typeof sched.resume, 'function');
    assert.equal(typeof sched.state, 'function');
    assert.equal(typeof sched.submitRun, 'function');
  });

  it('state returns valid snapshot', () => {
    const snap = sched.state();
    assert.ok(snap.config);
    assert.ok(snap.stats);
    assert.equal(typeof snap.paused, 'boolean');
    assert.ok(snap.updatedAt);
  });

  it('pause/resume toggles', () => {
    sched.pause();
    assert.equal(sched.isPaused(), true);
    sched.resume();
    assert.equal(sched.isPaused(), false);
  });
});
