// Tests: Environment lanes and promotion validation
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const env = require('../lib/environments');

describe('Environment lanes', () => {
  it('has dev/beta/prod environments', () => {
    const statuses = env.getAllEnvStatuses();
    assert.equal(statuses.length, 3);
    assert.ok(statuses.some(s => s.env === 'dev'));
    assert.ok(statuses.some(s => s.env === 'beta'));
    assert.ok(statuses.some(s => s.env === 'prod'));
  });

  it('dev is active by default', () => {
    assert.equal(env.getCurrentEnv(), 'dev');
  });

  it('can get env config', () => {
    const cfg = env.getEnvConfig('dev');
    assert.ok(cfg);
    assert.equal(cfg.env, 'dev');
    assert.equal(cfg.instance_id, 'rpgpo');
  });
});

describe('Promotion validation', () => {
  it('allows dev → beta', () => {
    const r = env.validatePromotion({ from_env: 'dev', to_env: 'beta', release_version: '1.0.0', release_notes: 'Test' });
    assert.ok(r.valid);
  });

  it('allows beta → prod', () => {
    const r = env.validatePromotion({ from_env: 'beta', to_env: 'prod', release_version: '1.0.0', release_notes: 'Test' });
    assert.ok(r.valid);
  });

  it('blocks dev → prod (skipping beta)', () => {
    const r = env.validatePromotion({ from_env: 'dev', to_env: 'prod', release_version: '1.0.0', release_notes: 'Test' });
    assert.ok(!r.valid);
    assert.ok(r.errors.some(e => e.includes('Cannot promote')));
  });

  it('blocks prod → dev (reverse)', () => {
    const r = env.validatePromotion({ from_env: 'prod', to_env: 'dev', release_version: '1.0.0', release_notes: 'Test' });
    assert.ok(!r.valid);
  });

  it('requires release version', () => {
    const r = env.validatePromotion({ from_env: 'dev', to_env: 'beta', release_version: '', release_notes: 'Test' });
    assert.ok(!r.valid);
    assert.ok(r.errors.some(e => e.includes('version')));
  });

  it('requires release notes', () => {
    const r = env.validatePromotion({ from_env: 'dev', to_env: 'beta', release_version: '1.0.0', release_notes: '' });
    assert.ok(!r.valid);
    assert.ok(r.errors.some(e => e.includes('notes')));
  });
});
