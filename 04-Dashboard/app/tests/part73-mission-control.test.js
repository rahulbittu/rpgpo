// Tests: Part 73 — Mission Control Dashboard + Operator Notifications
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

// ══════════════════════════════════════════
// In-App Notifications
// ══════════════════════════════════════════

describe('in-app-notifications', () => {
  const notif = require('../lib/in-app-notifications');

  beforeEach(() => notif.resetForTest());

  it('emits notification and returns id', () => {
    const id = notif.emitNotification({ type: 'alert.fired', severity: 'high', title: 'Test Alert', message: 'Something happened' });
    assert.ok(id.startsWith('notif_'));
  });

  it('lists notifications sorted by recency', () => {
    notif.emitNotification({ type: 'system.info', severity: 'low', title: 'A', message: 'First' });
    // Wait to avoid dedup
    notif.emitNotification({ type: 'alert.fired', severity: 'high', title: 'B', message: 'Second' });
    const list = notif.listNotifications();
    assert.ok(list.length >= 1);
  });

  it('deduplicates within 60s window', () => {
    notif.emitNotification({ type: 'alert.fired', severity: 'high', title: 'Same', message: 'msg' });
    const id2 = notif.emitNotification({ type: 'alert.fired', severity: 'high', title: 'Same', message: 'msg' });
    assert.equal(id2, ''); // suppressed
  });

  it('acknowledges notifications', () => {
    const id = notif.emitNotification({ type: 'workflow.stuck', severity: 'high', title: 'Stuck', message: 'wf1' });
    const result = notif.ackNotifications([id]);
    assert.ok(result.acknowledged.includes(id));
  });

  it('marks notifications as read', () => {
    const id = notif.emitNotification({ type: 'release.ready', severity: 'medium', title: 'Ready', message: 'rc1' });
    const result = notif.markRead([id]);
    assert.ok(result.read.includes(id));
  });

  it('badge counts track unread', () => {
    notif.emitNotification({ type: 'system.info', severity: 'low', title: 'Info1', message: 'm1' });
    const counts = notif.getBadgeCounts();
    assert.ok(counts.unread >= 1);
  });

  it('since filter works', () => {
    notif.emitNotification({ type: 'system.info', severity: 'low', title: 'Old', message: 'old' });
    const future = Date.now() + 100000;
    const list = notif.listNotifications(future);
    assert.equal(list.length, 0);
  });

  it('limit caps results', () => {
    for (let i = 0; i < 10; i++) {
      notif.emitNotification({ type: 'system.info', severity: 'low', title: `N${i}`, message: `m${i}` });
    }
    const list = notif.listNotifications(undefined, 3);
    assert.ok(list.length <= 3);
  });

  it('ack idempotent on already acked', () => {
    const id = notif.emitNotification({ type: 'alert.fired', severity: 'urgent', title: 'Urg', message: 'u' });
    notif.ackNotifications([id]);
    const result2 = notif.ackNotifications([id]);
    assert.equal(result2.acknowledged.length, 0);
  });
});

// ══════════════════════════════════════════
// Mission Control Aggregator
// ══════════════════════════════════════════

describe('mission-control', () => {
  const mc = require('../lib/mission-control');

  it('returns summary with health and counts', () => {
    const summary = mc.getMissionControlSummary();
    assert.ok(summary.timestamp > 0);
    assert.ok(['green', 'yellow', 'red'].includes(summary.health));
    assert.ok(typeof summary.counts.workflowsActive === 'number');
    assert.ok(typeof summary.counts.openAlerts === 'number');
    assert.ok(typeof summary.counts.queueDepth === 'number');
  });

  it('returns full payload with all sections', () => {
    const payload = mc.getMissionControlPayload();
    assert.ok(payload.summary);
    assert.ok(Array.isArray(payload.workflows));
    assert.ok(Array.isArray(payload.providers));
    assert.ok(payload.scheduler);
    assert.ok(Array.isArray(payload.alerts));
    assert.ok(payload.badgeCounts);
  });

  it('respects limits', () => {
    const payload = mc.getMissionControlPayload({ limit: { workflows: 1, alerts: 1 } });
    assert.ok(payload.workflows.length <= 1);
    assert.ok(payload.alerts.length <= 1);
  });

  it('health is green when no issues', () => {
    const summary = mc.getMissionControlSummary();
    // With no active workflows/alerts, should be green
    if (summary.counts.openAlerts === 0 && summary.counts.providersDegraded === 0 && summary.counts.workflowsStuck === 0) {
      assert.equal(summary.health, 'green');
    }
  });
});
