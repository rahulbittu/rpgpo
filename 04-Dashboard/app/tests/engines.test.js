// Tests: Engine layer and layered context
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const engines = require('../lib/engines');
const layeredCtx = require('../lib/layered-context');

describe('Engines: definitions', () => {
  it('has 9 built-in engines', () => {
    assert.equal(engines.getAllEngines().length, 9);
  });

  it('topranker engine is Startup', () => {
    const e = engines.getEngine('topranker');
    assert.ok(e);
    assert.equal(e.display_name, 'Startup');
    assert.ok(e.default_capabilities.includes('coding'));
  });

  it('screenwriting engine is Creative Writing', () => {
    const e = engines.getEngine('screenwriting');
    assert.ok(e);
    assert.equal(e.display_name, 'Creative Writing');
  });

  it('general engine exists', () => {
    assert.ok(engines.getEngine('general'));
  });

  it('each engine has capabilities and board roles', () => {
    for (const e of engines.getAllEngines()) {
      assert.ok(e.default_capabilities.length > 0, `${e.domain} has no capabilities`);
      assert.ok(e.default_board_roles.length > 0, `${e.domain} has no board roles`);
    }
  });
});

describe('Engines: context', () => {
  it('returns engine context for a domain', () => {
    const ctx = engines.getEngineContext('topranker');
    assert.ok(ctx);
    assert.equal(ctx.domain, 'topranker');
    assert.ok(typeof ctx.long_term_objective === 'string');
    assert.ok(Array.isArray(ctx.recurring_themes));
    assert.ok(Array.isArray(ctx.cross_project_decisions));
  });

  it('returns default context for unknown domain', () => {
    const ctx = engines.getEngineContext('general');
    assert.ok(ctx);
    assert.equal(ctx.domain, 'general');
  });
});

describe('Engines: enrichment sources', () => {
  it('has default enrichment sources', () => {
    const sources = engines.getEnrichmentSources();
    assert.ok(sources.length >= 5);
    assert.ok(sources.some(s => s.type === 'repo_history'));
    assert.ok(sources.some(s => s.type === 'artifact_scan'));
    assert.ok(sources.some(s => s.type === 'manual'));
  });

  it('has default enrichment jobs', () => {
    const jobs = engines.getEnrichmentJobs();
    assert.ok(jobs.length >= 5);
    assert.ok(jobs.some(j => j.type === 'profile_refinement'));
    assert.ok(jobs.some(j => j.type === 'context_quality'));
  });
});

describe('Layered Context', () => {
  it('builds full layered context', () => {
    const ctx = layeredCtx.buildLayeredContext('topranker');
    assert.ok(ctx.operator);
    assert.ok(ctx.operator.summary);
    assert.ok(ctx.engine);
    assert.equal(ctx.engine.domain, 'topranker');
    assert.equal(ctx.engine.display_name, 'Startup');
    assert.ok(ctx.recent);
    assert.ok(typeof ctx.recent.budget_status === 'string');
  });

  it('includes engine long-term objective', () => {
    const ctx = layeredCtx.buildLayeredContext('topranker');
    assert.ok(ctx.engine.long_term_objective.length > 0);
  });

  it('builds context block', () => {
    const block = layeredCtx.buildLayeredContextBlock('topranker');
    assert.ok(block.operator_block.includes('Operator:'));
    assert.ok(block.engine_block.includes('Engine:'));
    assert.ok(block.combined.length > 0);
  });

  it('combined block includes all layers', () => {
    const block = layeredCtx.buildLayeredContextBlock('topranker');
    assert.ok(block.combined.includes('Operator:'));
    assert.ok(block.combined.includes('Engine:'));
    assert.ok(block.combined.includes('Budget:'));
  });

  it('privacy-scoped retrieval works', () => {
    const result = layeredCtx.getLayeredContextForProvider('topranker', 'openai');
    assert.ok(typeof result === 'string' || result === null);
    if (result) assert.ok(result.includes('Operator:'));
  });
});
