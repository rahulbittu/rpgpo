// Tests: Part 72 — TopRanker Engine Deep Integration
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

// ══════════════════════════════════════════
// TopRanker Contracts
// ══════════════════════════════════════════

describe('TopRanker contracts', () => {
  const tc = require('../../lib/contracts/topranker.contracts');

  it('returns 4 contracts', () => {
    const contracts = tc.getTopRankerContracts();
    assert.equal(contracts.length, 4);
  });

  it('has leaderboard contract with correct schema', () => {
    const contracts = tc.getTopRankerContracts();
    const lb = contracts.find(c => c.id === 'topranker.leaderboard.v1');
    assert.ok(lb);
    assert.ok(lb.schema.properties.entries);
    assert.equal(lb.schema.properties.entries.type, 'array');
  });

  it('validates good leaderboard payload', () => {
    const result = tc.validateTopRankerPayload('topranker.leaderboard.v1', {
      entries: [{ businessId: 'b1', name: 'Test', rank: 1, score: 90, rationale: 'good' }],
    });
    assert.equal(result.valid, true);
  });

  it('rejects leaderboard missing entries', () => {
    const result = tc.validateTopRankerPayload('topranker.leaderboard.v1', {});
    assert.equal(result.valid, false);
    assert.ok(result.errors.some(e => e.path === 'entries'));
  });

  it('validates good scorecard payload', () => {
    const result = tc.validateTopRankerPayload('topranker.scorecard.v1', {
      scorecards: [{ businessId: 'b1', name: 'Test' }],
    });
    assert.equal(result.valid, true);
  });

  it('validates good review aggregation payload', () => {
    const result = tc.validateTopRankerPayload('topranker.review-aggregation.v1', {
      aggregations: [{ businessId: 'b1' }],
    });
    assert.equal(result.valid, true);
  });

  it('rejects unknown contract', () => {
    const result = tc.validateTopRankerPayload('unknown.contract', {});
    assert.equal(result.valid, false);
  });

  it('validates sample leaderboard file', () => {
    const sample = JSON.parse(fs.readFileSync(
      path.resolve(__dirname, '..', '..', 'state', 'samples', 'topranker', 'sample-leaderboard.json'), 'utf-8'
    ));
    const result = tc.validateTopRankerPayload('topranker.leaderboard.v1', sample);
    assert.equal(result.valid, true);
    assert.equal(sample.entries.length, 3);
  });
});

// ══════════════════════════════════════════
// TopRanker Engine
// ══════════════════════════════════════════

describe('TopRanker engine', () => {
  const engine = require('../../lib/engines/topranker-engine');

  it('has correct key and name', () => {
    assert.equal(engine.key, 'topranker');
    assert.equal(engine.name, 'TopRanker Engine');
  });

  it('returns 3 templates', () => {
    const templates = engine.getTemplates();
    assert.equal(templates.length, 3);
    assert.ok(templates.find(t => t.id === 'topranker.weekly-leaderboard'));
  });

  it('builds prompt for weekly leaderboard', () => {
    const prompt = engine.buildPrompt('topranker.weekly-leaderboard', { category: 'Coffee', city: 'Austin', windowDays: 7 });
    assert.ok(prompt.system.includes('TopRanker'));
    assert.ok(prompt.user.includes('Coffee'));
    assert.ok(prompt.user.includes('Austin'));
    assert.equal(prompt.schemaId, 'topranker.leaderboard.v1');
  });

  it('builds prompt for scorecards', () => {
    const prompt = engine.buildPrompt('topranker.scorecards', { businessIds: ['b1', 'b2'], city: 'Austin', category: 'Coffee' });
    assert.equal(prompt.schemaId, 'topranker.scorecard.v1');
  });

  it('builds prompt for review aggregation', () => {
    const prompt = engine.buildPrompt('topranker.review-aggregation', { businessId: 'b1', period: { from: '2026-01-01', to: '2026-03-01' } });
    assert.equal(prompt.schemaId, 'topranker.review-aggregation.v1');
  });

  it('merge deduplicates by businessId', () => {
    const existing = [{ businessId: 'b1', name: 'A', rank: 1, confidence: 0.9 }];
    const incoming = [{ businessId: 'b1', name: 'A', rank: 1, confidence: 0.95 }, { businessId: 'b2', name: 'B', rank: 2, confidence: 0.8 }];
    const merged = engine.merge(existing, incoming);
    assert.equal(merged.length, 2);
    assert.equal(merged.find(e => e.businessId === 'b1').confidence, 0.95); // higher confidence wins
  });

  it('merge sorts by rank', () => {
    const items = [{ businessId: 'b2', rank: 2, confidence: 0.8 }, { businessId: 'b1', rank: 1, confidence: 0.9 }];
    const merged = engine.merge([], items);
    assert.equal(merged[0].businessId, 'b1');
  });

  it('computes deterministic deliverable ID', () => {
    const id1 = engine.computeDeliverableId('topranker.weekly-leaderboard', { category: 'Coffee', city: 'Austin' });
    const id2 = engine.computeDeliverableId('topranker.weekly-leaderboard', { category: 'Coffee', city: 'Austin' });
    assert.equal(id1, id2);
    assert.ok(id1.startsWith('dlv_topranker_'));
  });

  it('different inputs produce different IDs', () => {
    const id1 = engine.computeDeliverableId('topranker.weekly-leaderboard', { category: 'Coffee', city: 'Austin' });
    const id2 = engine.computeDeliverableId('topranker.weekly-leaderboard', { category: 'Pizza', city: 'Austin' });
    assert.notEqual(id1, id2);
  });
});

// ══════════════════════════════════════════
// TopRanker Repo Adapter
// ══════════════════════════════════════════

describe('TopRanker repo adapter', () => {
  const adapter = require('../../lib/integrations/topranker-repo-adapter');

  it('detects repo existence', () => {
    const result = adapter.detectTopRankerRepo();
    // May or may not exist depending on environment
    assert.ok(typeof result.exists === 'boolean');
  });

  it('prepares env with redactions', () => {
    const { env, redactions } = adapter.prepareTopRankerEnv({ dryRun: true });
    assert.ok(env.GPO_DRY_RUN === 'true');
    assert.ok(redactions.includes('POSTGRES_URL'));
    assert.ok(redactions.includes('DATABASE_URL'));
  });

  it('dry run build produces artifacts', async () => {
    const result = await adapter.runTopRankerBuild({ dryRun: true, steps: ['install', 'build:server'] });
    assert.equal(result.ok, true);
    assert.ok(result.artifacts.length > 0);
    assert.ok(result.artifacts[0].checksumSha256.length > 0);
    assert.ok(result.logsPath);
  });

  it('dry run artifact has valid structure', async () => {
    const result = await adapter.runTopRankerBuild({ dryRun: true });
    const art = result.artifacts[0];
    assert.ok(art.artifactId);
    assert.equal(art.platform, 'server');
    assert.ok(art.filePath);
    assert.ok(art.sizeBytes > 0);
    assert.ok(art.createdAt);
  });
});
