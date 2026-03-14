// Tests: Privacy policy enforcement
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

const privacy = require('../lib/privacy');

const STRICT_POLICY = {
  local_only: true,
  allowed_providers: ['claude'],
  mission_isolation: ['wealthresearch'],
  log_redaction_patterns: [
    '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
    '\\bsk-[a-zA-Z0-9]{20,}\\b',
  ],
  sensitive_fields: ['api_key', 'password', 'secret'],
  allow_export: false,
  allow_import: false,
  secret_scope: 'env',
  memory_scope: 'instance',
};

const OPEN_POLICY = {
  local_only: false,
  allowed_providers: ['claude', 'openai', 'perplexity', 'gemini'],
  mission_isolation: [],
  log_redaction_patterns: [],
  sensitive_fields: [],
  allow_export: true,
  allow_import: true,
  secret_scope: 'env',
  memory_scope: 'instance',
};

describe('Privacy: canSendToProvider', () => {
  it('allows claude in strict mode', () => {
    assert.ok(privacy.canSendToProvider('claude', 'topranker', STRICT_POLICY));
  });

  it('blocks openai in strict mode', () => {
    assert.ok(!privacy.canSendToProvider('openai', 'topranker', STRICT_POLICY));
  });

  it('allows openai in open mode', () => {
    assert.ok(privacy.canSendToProvider('openai', 'topranker', OPEN_POLICY));
  });

  it('blocks isolated mission even with allowed provider', () => {
    assert.ok(!privacy.canSendToProvider('claude', 'wealthresearch', STRICT_POLICY));
  });

  it('allows non-isolated mission', () => {
    assert.ok(privacy.canSendToProvider('claude', 'topranker', STRICT_POLICY));
  });
});

describe('Privacy: redact', () => {
  it('redacts email addresses', () => {
    const result = privacy.redact('Contact user@example.com for details', STRICT_POLICY);
    assert.ok(!result.includes('user@example.com'));
    assert.ok(result.includes('[REDACTED]'));
  });

  it('redacts API keys', () => {
    const result = privacy.redact('Key: sk-abc123def456ghi789jkl012mno', STRICT_POLICY);
    assert.ok(!result.includes('sk-abc123'));
    assert.ok(result.includes('[REDACTED]'));
  });

  it('does not redact normal text', () => {
    const result = privacy.redact('This is normal text', STRICT_POLICY);
    assert.equal(result, 'This is normal text');
  });

  it('skips redaction with empty patterns', () => {
    const result = privacy.redact('user@example.com', OPEN_POLICY);
    assert.equal(result, 'user@example.com');
  });
});

describe('Privacy: redactObject', () => {
  it('redacts sensitive fields', () => {
    const obj = { name: 'Test', api_key: 'sk-secret123', password: 'hunter2' };
    const result = privacy.redactObject(obj, STRICT_POLICY);
    assert.equal(result.name, 'Test');
    assert.equal(result.api_key, '[REDACTED]');
    assert.equal(result.password, '[REDACTED]');
  });

  it('preserves non-sensitive fields', () => {
    const obj = { title: 'Task', domain: 'topranker' };
    const result = privacy.redactObject(obj, STRICT_POLICY);
    assert.equal(result.title, 'Task');
    assert.equal(result.domain, 'topranker');
  });
});

describe('Privacy: export/import controls', () => {
  it('blocks export in strict mode', () => {
    assert.ok(!privacy.canExport(STRICT_POLICY));
  });

  it('allows export in open mode', () => {
    assert.ok(privacy.canExport(OPEN_POLICY));
  });

  it('blocks import in strict mode', () => {
    assert.ok(!privacy.canImport(STRICT_POLICY));
  });
});

describe('Privacy: access classification', () => {
  it('allows read for all classes', () => {
    assert.ok(privacy.isActionAllowed('A', 'read'));
    assert.ok(privacy.isActionAllowed('D', 'read'));
  });

  it('allows send_to_provider only for A and B', () => {
    assert.ok(privacy.isActionAllowed('A', 'send_to_provider'));
    assert.ok(privacy.isActionAllowed('B', 'send_to_provider'));
    assert.ok(!privacy.isActionAllowed('C', 'send_to_provider'));
    assert.ok(!privacy.isActionAllowed('D', 'send_to_provider'));
  });

  it('blocks export for D', () => {
    assert.ok(!privacy.isActionAllowed('D', 'export'));
  });
});

describe('Privacy: isolation', () => {
  it('detects isolated missions', () => {
    assert.ok(privacy.isMissionIsolated('wealthresearch', STRICT_POLICY));
    assert.ok(!privacy.isMissionIsolated('topranker', STRICT_POLICY));
  });

  it('detects local-only mode', () => {
    assert.ok(privacy.isLocalOnly(STRICT_POLICY));
    assert.ok(!privacy.isLocalOnly(OPEN_POLICY));
  });
});
