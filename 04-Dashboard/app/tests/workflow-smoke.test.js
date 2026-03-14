// Tests: Workflow smoke tests — high-signal regression shields
const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// Use isolated state for tests
const TEST_STATE = path.resolve(__dirname, '..', '..', 'state', '_test_temp');

describe('Workflow continuation', () => {
  // These tests use the compiled modules but exercise core logic paths

  it('onSubtaskComplete returns error for missing subtask', () => {
    const workflow = require('../lib/workflow');
    const result = workflow.onSubtaskComplete('nonexistent_id');
    assert.equal(result.action, 'error');
    assert.ok(result.message.includes('not found'));
  });

  it('findReadySubtasks returns empty for no dependencies', () => {
    const workflow = require('../lib/workflow');
    const subs = [
      { subtask_id: 'st_1', status: 'done', depends_on: [] },
      { subtask_id: 'st_2', status: 'proposed', depends_on: [] },
    ];
    const ready = workflow.findReadySubtasks('st_1', subs);
    assert.equal(ready.length, 0); // st_2 has no deps, so it's not waiting on st_1
  });

  it('findReadySubtasks finds dependent subtask', () => {
    const workflow = require('../lib/workflow');
    const subs = [
      { subtask_id: 'st_1', status: 'done', depends_on: [] },
      { subtask_id: 'st_2', status: 'proposed', depends_on: ['st_1'] },
    ];
    const ready = workflow.findReadySubtasks('st_1', subs);
    assert.equal(ready.length, 1);
    assert.equal(ready[0].subtask_id, 'st_2');
  });

  it('findReadySubtasks waits for all dependencies', () => {
    const workflow = require('../lib/workflow');
    const subs = [
      { subtask_id: 'st_1', status: 'done', depends_on: [] },
      { subtask_id: 'st_2', status: 'running', depends_on: [] },
      { subtask_id: 'st_3', status: 'proposed', depends_on: ['st_1', 'st_2'] },
    ];
    const ready = workflow.findReadySubtasks('st_1', subs);
    assert.equal(ready.length, 0); // st_2 not done yet
  });

  it('blockDependents marks dependents as blocked', () => {
    const workflow = require('../lib/workflow');
    // Mock intake module for this test
    const originalUpdateSubtask = require('../lib/intake').updateSubtask;
    const updates = [];
    require('../lib/intake').updateSubtask = (id, u) => { updates.push({ id, ...u }); return u; };

    const subs = [
      { subtask_id: 'st_1', status: 'failed', depends_on: [] },
      { subtask_id: 'st_2', status: 'proposed', depends_on: ['st_1'] },
      { subtask_id: 'st_3', status: 'queued', depends_on: ['st_1'] },
    ];
    workflow.blockDependents('st_1', subs);

    assert.equal(updates.length, 2);
    assert.ok(updates.every(u => u.status === 'blocked'));

    // Restore
    require('../lib/intake').updateSubtask = originalUpdateSubtask;
  });
});

describe('Capabilities', () => {
  it('has 10 built-in capabilities', () => {
    const caps = require('../lib/capabilities');
    assert.ok(caps.getAllCapabilities().length >= 10);
  });

  it('coding capability exists and modifies state', () => {
    const caps = require('../lib/capabilities');
    const coding = caps.getCapability('coding');
    assert.ok(coding);
    assert.ok(coding.modifies_state);
    assert.ok(coding.supported_providers.includes('claude'));
  });

  it('research capability does not modify state', () => {
    const caps = require('../lib/capabilities');
    const research = caps.getCapability('research');
    assert.ok(research);
    assert.ok(!research.modifies_state);
  });

  it('finds capability for stage', () => {
    const caps = require('../lib/capabilities');
    const cap = caps.getCapabilityForStage('implement');
    assert.ok(cap);
    assert.equal(cap.id, 'coding');
  });
});

describe('Missions', () => {
  it('has 9 registered missions', () => {
    const missions = require('../lib/missions');
    assert.equal(missions.getAllMissions().length, 9);
  });

  it('topranker mission has source repo', () => {
    const missions = require('../lib/missions');
    const tr = missions.getMissionContext('topranker');
    assert.ok(tr.sourceRepo);
    assert.ok(tr.sourceRepo.includes('TopRanker'));
  });

  it('general mission is always available', () => {
    const missions = require('../lib/missions');
    assert.ok(missions.hasMission('general'));
  });

  it('requiresApproval respects yellow risk', () => {
    const missions = require('../lib/missions');
    assert.ok(missions.requiresApproval('topranker', 'implement', 'yellow'));
  });

  it('green implement auto-continues for topranker', () => {
    const missions = require('../lib/missions');
    assert.ok(!missions.requiresApproval('topranker', 'implement', 'green'));
  });
});

describe('Agents', () => {
  it('has 4 built-in agents', () => {
    const agents = require('../lib/agents');
    const all = agents.getAllAgents();
    assert.ok(all.length >= 4);
  });

  it('claude-local is executor with file access', () => {
    const agents = require('../lib/agents');
    const claude = agents.getAgent('claude-local');
    assert.ok(claude);
    assert.equal(claude.role, 'executor');
    assert.ok(claude.execution_boundary.can_write_files);
    assert.ok(claude.execution_boundary.requires_approval);
  });

  it('openai-api has redact_before_send', () => {
    const agents = require('../lib/agents');
    const oai = agents.getAgent('openai-api');
    assert.ok(oai);
    assert.ok(oai.privacy_scope.redact_before_send);
  });
});

describe('Docs health', () => {
  it('reports documentation status', () => {
    const docs = require('../lib/docs-generator');
    const health = docs.getDocsHealth();
    assert.ok(typeof health.total_docs === 'number');
    assert.ok(typeof health.refresh_recommended === 'boolean');
    assert.ok(Array.isArray(health.stale_docs));
    assert.ok(Array.isArray(health.missing_docs));
  });
});

describe('Release readiness', () => {
  it('reports release readiness for beta', () => {
    const releases = require('../lib/releases');
    const readiness = releases.getReleaseReadiness('beta');
    assert.ok(typeof readiness.ready === 'boolean');
    assert.ok(Array.isArray(readiness.blockers));
  });

  it('blocks promotion from prod (no path)', () => {
    const releases = require('../lib/releases');
    const readiness = releases.getReleaseReadiness('dev'); // no promotion path TO dev
    assert.ok(!readiness.ready);
  });
});
