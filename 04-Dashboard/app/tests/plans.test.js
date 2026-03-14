// Tests: Product plan enforcement
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const plans = require('../lib/plans');

describe('Plan definitions', () => {
  it('has three plans', () => {
    const all = plans.getAllPlans();
    assert.equal(all.length, 3);
  });

  it('personal plan exists with correct limits', () => {
    const p = plans.getPlan('personal');
    assert.equal(p.name, 'Starter');
    assert.equal(p.limits.max_missions, 3);
    assert.equal(p.limits.max_providers, 2);
  });

  it('pro plan has all providers', () => {
    const p = plans.getPlan('pro');
    assert.equal(p.allowed_providers.length, 4);
    assert.ok(p.allowed_providers.includes('claude'));
    assert.ok(p.allowed_providers.includes('openai'));
  });

  it('team plan supports self-host', () => {
    const p = plans.getPlan('team');
    assert.ok(p.deployment_modes.includes('self-hosted'));
    assert.ok(p.privacy_features.self_host);
  });
});

describe('Plan enforcement', () => {
  it('allows coding capability on pro', () => {
    assert.ok(plans.isCapabilityAllowed('pro', 'coding'));
  });

  it('blocks coding capability on personal', () => {
    assert.ok(!plans.isCapabilityAllowed('personal', 'coding'));
  });

  it('allows research on personal', () => {
    assert.ok(plans.isCapabilityAllowed('personal', 'research'));
  });

  it('allows openai on pro', () => {
    assert.ok(plans.isProviderAllowed('pro', 'openai'));
  });

  it('blocks gemini on personal', () => {
    assert.ok(!plans.isProviderAllowed('personal', 'gemini'));
  });

  it('enforces mission count', () => {
    assert.ok(plans.isMissionCountAllowed('personal', 3));
    assert.ok(!plans.isMissionCountAllowed('personal', 4));
    assert.ok(plans.isMissionCountAllowed('pro', 10));
  });

  it('enforces task count', () => {
    assert.ok(plans.isTaskCountAllowed('personal', 9));
    assert.ok(!plans.isTaskCountAllowed('personal', 10));
  });

  it('enforces subtask count', () => {
    assert.ok(plans.isSubtaskCountAllowed('pro', 8));
    assert.ok(!plans.isSubtaskCountAllowed('pro', 9));
  });

  it('checks feature inclusion', () => {
    assert.ok(plans.isFeatureIncluded('pro', 'builder'));
    assert.ok(!plans.isFeatureIncluded('personal', 'builder'));
    assert.ok(plans.isFeatureIncluded('personal', 'intake'));
  });

  it('checks deployment mode', () => {
    assert.ok(plans.isDeploymentModeAllowed('team', 'self-hosted'));
    assert.ok(!plans.isDeploymentModeAllowed('pro', 'self-hosted'));
    assert.ok(plans.isDeploymentModeAllowed('pro', 'local'));
  });

  it('checks privacy features', () => {
    assert.ok(plans.isPrivacyFeatureAvailable('pro', 'mission_isolation'));
    assert.ok(!plans.isPrivacyFeatureAvailable('personal', 'mission_isolation'));
    assert.ok(plans.isPrivacyFeatureAvailable('personal', 'log_redaction'));
  });
});
