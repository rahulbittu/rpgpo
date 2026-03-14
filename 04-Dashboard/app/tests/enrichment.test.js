// Tests: Enrichment runtime
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const enrichment = require('../lib/enrichment-runtime');
const engines = require('../lib/engines');

describe('Enrichment Runtime: job states', () => {
  it('returns states for all jobs', () => {
    const states = enrichment.getAllJobStates();
    assert.ok(states.length >= 5);
    for (const s of states) {
      assert.ok(s.job_id);
      assert.ok(['idle', 'running', 'completed', 'failed', 'skipped'].includes(s.status));
    }
  });

  it('gets a specific job state', () => {
    const state = enrichment.getJobState('ej_profile');
    assert.ok(state);
    assert.equal(state.job_id, 'ej_profile');
  });

  it('returns null for unknown job', () => {
    assert.equal(enrichment.getJobState('nonexistent'), null);
  });
});

describe('Enrichment Runtime: execution', () => {
  it('runs profile refinement job', () => {
    const result = enrichment.runJob({ job_id: 'ej_profile', force: false, dry_run: false });
    assert.equal(result.job_id, 'ej_profile');
    assert.equal(result.status, 'completed');
    assert.ok(result.privacy_check_passed);
    assert.ok(result.result);
    assert.ok(result.duration_ms >= 0);
  });

  it('runs pattern extraction job', () => {
    const result = enrichment.runJob({ job_id: 'ej_patterns', force: false, dry_run: false });
    assert.equal(result.status, 'completed');
    assert.ok(result.result);
  });

  it('runs context quality check', () => {
    const result = enrichment.runJob({ job_id: 'ej_quality', force: false, dry_run: false });
    assert.equal(result.status, 'completed');
  });

  it('runs summary improvement job', () => {
    const result = enrichment.runJob({ job_id: 'ej_summaries', force: false, dry_run: false });
    assert.equal(result.status, 'completed');
  });

  it('dry run does not execute', () => {
    const result = enrichment.runJob({ job_id: 'ej_profile', force: false, dry_run: true });
    assert.equal(result.status, 'idle');
    assert.ok(result.privacy_check_passed);
  });

  it('fails for unknown job', () => {
    const result = enrichment.runJob({ job_id: 'nonexistent', force: false, dry_run: false });
    assert.equal(result.status, 'failed');
    assert.ok(result.error.includes('not found'));
  });
});

describe('Enrichment Runtime: due jobs', () => {
  it('identifies due jobs', () => {
    const due = enrichment.getDueJobs();
    assert.ok(Array.isArray(due));
    // Some jobs should be due (never run before)
  });
});

describe('Engine mappings', () => {
  it('returns display names for all engines', () => {
    const mappings = engines.getEngineMappings();
    assert.ok(mappings.length >= 9);
    assert.ok(mappings.some(m => m.domain === 'topranker' && m.display_name === 'Startup'));
    assert.ok(mappings.some(m => m.domain === 'screenwriting' && m.display_name === 'Creative Writing'));
  });

  it('resolves engine by domain key', () => {
    const e = engines.resolveEngine('topranker');
    assert.ok(e);
    assert.equal(e.display_name, 'Startup');
  });

  it('resolves engine by display name', () => {
    const e = engines.resolveEngine('Startup');
    assert.ok(e);
    assert.equal(e.domain, 'topranker');
  });

  it('returns undefined for unknown engine', () => {
    assert.equal(engines.resolveEngine('nonexistent'), undefined);
  });

  it('getEngineDisplayName works', () => {
    assert.equal(engines.getEngineDisplayName('topranker'), 'Startup');
    assert.equal(engines.getEngineDisplayName('music'), 'Music');
  });
});
