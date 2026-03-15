// Tests: Part 71 — End-to-End Workflow Orchestration + Autopilot Mode
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const STATE_FILE = path.resolve(__dirname, '..', '..', 'state', 'workflows.json');
const EVIDENCE_DIR = path.resolve(__dirname, '..', '..', 'state', 'evidence', 'orchestrator');

function cleanup() {
  try { fs.unlinkSync(STATE_FILE); } catch {}
  try { fs.rmSync(EVIDENCE_DIR, { recursive: true }); } catch {}
}

// ══════════════════════════════════════════
// Workflow Store
// ══════════════════════════════════════════

describe('workflow-store', () => {
  const ws = require('../lib/workflow-store');

  beforeEach(() => cleanup());

  it('generates unique IDs', () => {
    const a = ws.generateId();
    const b = ws.generateId();
    assert.ok(a.startsWith('wf_'));
    assert.notEqual(a, b);
  });

  it('creates and retrieves workflow', () => {
    const wf = ws.create({ id: 'wf_test_1', tenantId: 'rpgpo', projectId: 'default', state: 'intake_received', timeline: [], idempotencyKeys: [], createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
    const found = ws.get('wf_test_1');
    assert.ok(found);
    assert.equal(found.state, 'intake_received');
  });

  it('list filters by tenant', () => {
    ws.create({ id: 'wf_t1', tenantId: 'a', projectId: 'p', state: 'intake_received', timeline: [], idempotencyKeys: [], createdAt: '', updatedAt: '' });
    ws.create({ id: 'wf_t2', tenantId: 'b', projectId: 'p', state: 'intake_received', timeline: [], idempotencyKeys: [], createdAt: '', updatedAt: '' });
    assert.equal(ws.list({ tenantId: 'a' }).length, 1);
  });

  it('update is idempotent with key', () => {
    ws.create({ id: 'wf_idem', tenantId: 'r', projectId: 'p', state: 'intake_received', timeline: [], idempotencyKeys: ['key1'], createdAt: '', updatedAt: '' });
    const wf = ws.get('wf_idem');
    wf.state = 'executing';
    const u1 = ws.update(wf, { idempotencyKey: 'key1' });
    // When key already seen, update returns the object as-is without persisting the state change
    // The state is 'executing' on the in-memory object but wasn't persisted
    const persisted = ws.get('wf_idem');
    assert.equal(persisted.state, 'intake_received'); // persisted state unchanged
  });

  it('returns null for unknown workflow', () => {
    assert.equal(ws.get('nonexistent'), null);
  });
});

// ══════════════════════════════════════════
// Workflow Orchestrator
// ══════════════════════════════════════════

describe('workflow-orchestrator', () => {
  const orc = require('../lib/workflow-orchestrator');
  const tel = require('../lib/orchestrator-telemetry');

  beforeEach(() => { cleanup(); tel.reset(); orc.init(); });

  it('creates workflow from intake', () => {
    const wf = orc.createFromIntake('intake_001', { tenantId: 'rpgpo', projectId: 'default' });
    assert.ok(wf.id);
    assert.equal(wf.state, 'intake_received');
    assert.equal(wf.timeline.length, 1);
    assert.equal(wf.timeline[0].trigger, 'intake_enqueued');
  });

  it('transitions through full lifecycle', () => {
    const wf = orc.createFromIntake('intake_002', { tenantId: 'rpgpo', projectId: 'default' });

    const wf2 = orc.handleEvent({ type: 'deliberation_completed', workflowId: wf.id });
    assert.equal(wf2.state, 'deliberation_planned');

    const wf3 = orc.handleEvent({ type: 'plan_committed', workflowId: wf.id });
    assert.equal(wf3.state, 'scheduled');

    const wf4 = orc.handleEvent({ type: 'tasks_scheduled', workflowId: wf.id });
    assert.equal(wf4.state, 'executing');

    const wf5 = orc.handleEvent({ type: 'task_batch_completed', workflowId: wf.id });
    assert.equal(wf5.state, 'merging');

    const wf6 = orc.handleEvent({ type: 'merge_completed', workflowId: wf.id });
    assert.equal(wf6.state, 'validating');

    const wf7 = orc.handleEvent({ type: 'validation_passed', workflowId: wf.id });
    assert.equal(wf7.state, 'approved');
  });

  it('pause and resume work', () => {
    const wf = orc.createFromIntake('intake_003', { tenantId: 'rpgpo', projectId: 'default' });
    orc.handleEvent({ type: 'deliberation_completed', workflowId: wf.id });

    const paused = orc.pause(wf.id, 'operator', 'Testing');
    assert.equal(paused.state, 'paused');
    assert.equal(paused.flags.paused, true);

    const resumed = orc.resume(wf.id, 'operator');
    assert.equal(resumed.flags.paused, false);
    assert.notEqual(resumed.state, 'paused');
  });

  it('cancel transitions to cancelled', () => {
    const wf = orc.createFromIntake('intake_004', { tenantId: 'rpgpo', projectId: 'default' });
    const cancelled = orc.cancel(wf.id, 'operator', 'No longer needed');
    assert.equal(cancelled.state, 'cancelled');
  });

  it('failure_detected transitions to failed', () => {
    const wf = orc.createFromIntake('intake_005', { tenantId: 'rpgpo', projectId: 'default' });
    orc.handleEvent({ type: 'deliberation_completed', workflowId: wf.id });
    orc.handleEvent({ type: 'plan_committed', workflowId: wf.id });
    orc.handleEvent({ type: 'tasks_scheduled', workflowId: wf.id });
    const failed = orc.handleEvent({ type: 'failure_detected', workflowId: wf.id, reason: 'Provider down' });
    assert.equal(failed.state, 'failed');
  });

  it('records evidence for transitions', () => {
    const wf = orc.createFromIntake('intake_006', { tenantId: 'rpgpo', projectId: 'default' });
    orc.handleEvent({ type: 'deliberation_completed', workflowId: wf.id });

    const ev = require('../lib/orchestrator-events');
    const evidence = ev.getWorkflowEvidence(wf.id);
    assert.ok(evidence.length >= 2);
  });

  it('records telemetry for transitions', () => {
    orc.createFromIntake('intake_007', { tenantId: 'rpgpo', projectId: 'default' });
    const metrics = tel.getMetrics();
    assert.ok(metrics.counters.total_transitions >= 1);
  });

  it('returns null for unknown workflow', () => {
    assert.equal(orc.handleEvent({ type: 'deliberation_completed', workflowId: 'nonexistent' }), null);
  });

  it('ignores invalid transitions', () => {
    const wf = orc.createFromIntake('intake_008', { tenantId: 'rpgpo', projectId: 'default' });
    // intake_received doesn't have plan_committed transition
    const same = orc.handleEvent({ type: 'plan_committed', workflowId: wf.id });
    assert.equal(same.state, 'intake_received'); // unchanged
  });
});

// ══════════════════════════════════════════
// Autopilot Controller
// ══════════════════════════════════════════

describe('autopilot-controller', () => {
  const ap = require('../lib/autopilot-controller');

  it('default policy has autopilot disabled', () => {
    const policy = ap.getPolicyFor();
    assert.equal(policy.enabled, false);
  });

  it('canAutoAdvance returns false when disabled', () => {
    const policy = ap.getPolicyFor({ enabled: false });
    assert.equal(ap.canAutoAdvance('wf1', policy, 'approved'), false);
  });

  it('canAutoAdvance returns true when enabled for appropriate stages', () => {
    const policy = ap.getPolicyFor({ enabled: true, max_auto_promotions_per_day: 10 });
    assert.equal(ap.canAutoAdvance('wf_auto', policy, 'approved'), true);
  });

  it('enforces daily cap', () => {
    const policy = ap.getPolicyFor({ enabled: true, max_auto_promotions_per_day: 2 });
    ap.recordAutoAdvance('wf_cap');
    ap.recordAutoAdvance('wf_cap');
    assert.equal(ap.canAutoAdvance('wf_cap', policy, 'approved'), false);
  });

  it('canAutoApproveGate respects require_human_for', () => {
    const policy = ap.getPolicyFor({ enabled: true, require_human_for: ['gate_critical'] });
    assert.equal(ap.canAutoApproveGate('gate_critical', policy), false);
    assert.equal(ap.canAutoApproveGate('gate_normal', policy), true);
  });
});

// ══════════════════════════════════════════
// Orchestrator Telemetry
// ══════════════════════════════════════════

describe('orchestrator-telemetry', () => {
  const tel = require('../lib/orchestrator-telemetry');

  it('tracks transitions', () => {
    tel.reset();
    tel.incrementTransition('intake_received', 'deliberation_planned');
    tel.incrementTransition('deliberation_planned', 'scheduled');
    const m = tel.getMetrics();
    assert.equal(m.counters.total_transitions, 2);
  });

  it('records stage durations', () => {
    tel.reset();
    tel.recordStageDuration('executing', 5000);
    tel.recordStageDuration('executing', 3000);
    const m = tel.getMetrics();
    assert.ok(m.stageDurations.executing);
    assert.equal(m.stageDurations.executing.count, 2);
    assert.equal(m.stageDurations.executing.avg, 4000);
  });

  it('tracks auto advances and releases', () => {
    tel.reset();
    tel.incrementAutoAdvance();
    tel.incrementAutoRelease();
    const m = tel.getMetrics();
    assert.equal(m.counters.auto_advances, 1);
    assert.equal(m.counters.auto_releases, 1);
  });
});

// ══════════════════════════════════════════
// Scheduler Bridge
// ══════════════════════════════════════════

describe('scheduler-bridge', () => {
  const sb = require('../lib/scheduler-bridge');

  it('schedulePlan returns task count', () => {
    const result = sb.schedulePlan('wf_test', [{ id: 'a' }, { id: 'b' }], { tenantId: 'rpgpo', projectId: 'default' });
    assert.equal(result.tasks, 2);
  });
});

// ══════════════════════════════════════════
// Release Trigger
// ══════════════════════════════════════════

describe('release-trigger', () => {
  const rt = require('../lib/release-trigger');

  it('assembleReleaseCandidate returns candidate', () => {
    const rc = rt.assembleReleaseCandidate('wf_rc', []);
    assert.ok(rc);
    assert.ok(rc.candidateId);
    assert.equal(rc.status, 'pending');
  });

  it('promoteRelease returns release', () => {
    const r = rt.promoteRelease('rc_test');
    assert.ok(r);
    assert.equal(r.status, 'released');
  });
});

// Cleanup after all tests
cleanup();
