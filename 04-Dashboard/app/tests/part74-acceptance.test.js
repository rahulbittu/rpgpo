// Tests: Part 74 — Comprehensive Integration Test Suite + Acceptance Harness
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');

function cleanup() {
  try { fs.unlinkSync(path.join(STATE_DIR, 'workflows.json')); } catch {}
  try { fs.rmSync(path.join(STATE_DIR, 'evidence', 'orchestrator'), { recursive: true }); } catch {}
}

// ══════════════════════════════════════════
// Provider Simulator
// ══════════════════════════════════════════

describe('provider-sim', () => {
  const { createProviderSim } = require('../lib/test/provider-sim');

  it('generates deterministic output structure with same seed', async () => {
    const sim1 = createProviderSim({ seed: 42 });
    const sim2 = createProviderSim({ seed: 42 });
    const r1 = await sim1.callProvider('openai', 'topranker.leaderboard.v1', 'test');
    const r2 = await sim2.callProvider('openai', 'topranker.leaderboard.v1', 'test');
    const p1 = JSON.parse(r1.text);
    const p2 = JSON.parse(r2.text);
    // Structure and non-timestamp fields are deterministic
    assert.equal(p1.entries.length, p2.entries.length);
    assert.equal(p1.entries[0].businessId, p2.entries[0].businessId);
    assert.equal(p1.entries[0].score, p2.entries[0].score);
  });

  it('produces valid TopRanker leaderboard JSON', async () => {
    const sim = createProviderSim({ seed: 1 });
    const result = await sim.callProvider('openai', 'topranker.leaderboard.v1', 'test');
    const parsed = JSON.parse(result.text);
    assert.ok(parsed.entries);
    assert.ok(parsed.entries.length > 0);
    assert.ok(parsed.entries[0].businessId);
    assert.ok(parsed.entries[0].name);
    assert.ok(parsed.entries[0].rank);
  });

  it('produces valid scorecard JSON', async () => {
    const sim = createProviderSim({ seed: 2 });
    const result = await sim.callProvider('openai', 'topranker.scorecard.v1', 'test');
    const parsed = JSON.parse(result.text);
    assert.ok(parsed.scorecards);
    assert.ok(parsed.scorecards.length > 0);
  });

  it('simulates errors at configured rate', async () => {
    const sim = createProviderSim({ seed: 100, behavior: { errorRate: 1.0 } });
    await assert.rejects(() => sim.callProvider('openai', 'test', 'test'));
  });

  it('simulates invalid JSON at configured rate', async () => {
    const sim = createProviderSim({ seed: 200, behavior: { invalidJsonRate: 1.0 } });
    const result = await sim.callProvider('openai', 'test', 'test');
    assert.throws(() => JSON.parse(result.text));
  });

  it('tracks call count', async () => {
    const sim = createProviderSim({ seed: 3 });
    assert.equal(sim.getCallCount(), 0);
    await sim.callProvider('openai', 'test', 'test');
    await sim.callProvider('openai', 'test', 'test');
    assert.equal(sim.getCallCount(), 2);
  });

  it('reset restores initial state', async () => {
    const sim = createProviderSim({ seed: 4 });
    await sim.callProvider('openai', 'test', 'test');
    sim.reset();
    assert.equal(sim.getCallCount(), 0);
  });

  it('generates generic output for unknown schema', async () => {
    const sim = createProviderSim({ seed: 5 });
    const result = await sim.callProvider('openai', 'unknown.schema', 'test');
    const parsed = JSON.parse(result.text);
    assert.ok(parsed.sections || parsed.title);
  });
});

// ══════════════════════════════════════════
// Scenario Runner
// ══════════════════════════════════════════

describe('scenario-runner', () => {
  const { runScenario, runAllScenarios } = require('../lib/test/scenario-runner');

  beforeEach(() => cleanup());

  it('runs TopRanker happy path scenario', async () => {
    const result = await runScenario({
      id: 'topranker-happy',
      title: 'TopRanker Weekly Leaderboard',
      seed: 42,
      engine: 'topranker',
      template: 'topranker.weekly-leaderboard',
      input: { category: 'Coffee', city: 'Austin' },
      autopilot: true,
      expectations: { workflowCompletes: true, hasDeliverable: true, deliverableFields: ['entries'] },
    });
    assert.equal(result.passed, true, `Failed: ${result.errors.join(', ')}`);
    assert.ok(result.stagesVisited.length >= 5);
    assert.ok(result.assertions.every(a => a.passed));
    assert.ok(result.duration > 0);
  });

  it('runs general engine scenario', async () => {
    const result = await runScenario({
      id: 'general-happy',
      title: 'General Task',
      seed: 100,
      engine: 'general',
      template: 'general.task',
      input: { description: 'Research AI trends' },
      expectations: { workflowCompletes: true },
    });
    assert.equal(result.passed, true);
  });

  it('runs newsroom engine scenario', async () => {
    const result = await runScenario({
      id: 'newsroom-happy',
      title: 'Newsroom Research',
      seed: 200,
      engine: 'newsroom',
      template: 'newsroom.research',
      input: { topic: 'AI regulation' },
      expectations: { workflowCompletes: true },
    });
    assert.equal(result.passed, true);
  });

  it('records evidence at each transition', async () => {
    const result = await runScenario({
      id: 'evidence-check',
      title: 'Evidence Verification',
      seed: 300,
      engine: 'topranker',
      template: 'topranker.weekly-leaderboard',
      input: { category: 'Pizza', city: 'NYC' },
      expectations: { workflowCompletes: true },
    });
    const evidenceAssertion = result.assertions.find(a => a.check === 'has_evidence');
    assert.ok(evidenceAssertion);
    assert.equal(evidenceAssertion.passed, true);
  });

  it('runAllScenarios executes multiple scenarios', async () => {
    const summary = await runAllScenarios([
      { id: 'multi-1', title: 'Scenario 1', engine: 'general', template: 'task', input: {}, expectations: { workflowCompletes: true } },
      { id: 'multi-2', title: 'Scenario 2', engine: 'topranker', template: 'leaderboard', input: { category: 'Bars' }, expectations: { workflowCompletes: true, hasDeliverable: true } },
    ]);
    assert.equal(summary.total, 2);
    assert.equal(summary.passed, 2);
    assert.equal(summary.failed, 0);
  });

  it('validates deliverable fields', async () => {
    const result = await runScenario({
      id: 'field-check',
      title: 'Field Validation',
      seed: 42,
      engine: 'topranker',
      template: 'topranker.weekly-leaderboard',
      input: { category: 'Tacos', city: 'Austin' },
      expectations: { hasDeliverable: true, deliverableFields: ['entries', 'evidence'] },
    });
    const fieldAssertion = result.assertions.find(a => a.check === 'deliverable_fields');
    assert.ok(fieldAssertion);
    assert.equal(fieldAssertion.passed, true);
  });
});

// Cleanup
cleanup();
