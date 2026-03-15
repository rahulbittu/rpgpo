// Tests: Part 67 — Structured Output: schema-encoder, structured-output parser, field-populator, config
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ══════════════════════════════════════════
// Config Loader
// ══════════════════════════════════════════

describe('config/ai-io', () => {
  const cfg = require('../lib/config/ai-io');

  it('loads config with defaults', () => {
    cfg.clearConfigCache();
    const c = cfg.loadContractAwareConfig();
    assert.equal(c.enabled, true);
    assert.equal(c.acceptNonStrict, true);
    assert.equal(c.maxParseAttempts, 3);
    assert.equal(c.maxResponseBytes, 400000);
    assert.equal(c.sentinel.start, '<gpo_json>');
    assert.equal(c.sentinel.end, '</gpo_json>');
  });

  it('has provider modes for known providers', () => {
    const c = cfg.loadContractAwareConfig();
    assert.equal(c.providerModes.openai, 'native-json');
    assert.equal(c.providerModes.perplexity, 'prompt-sentinel');
    assert.equal(c.providerModes.gemini, 'mime-json');
  });

  it('returns frozen config', () => {
    const c = cfg.loadContractAwareConfig();
    assert.ok(Object.isFrozen(c));
  });

  it('caches config across calls', () => {
    cfg.clearConfigCache();
    const a = cfg.loadContractAwareConfig();
    const b = cfg.loadContractAwareConfig();
    assert.equal(a, b); // same reference
  });
});

// ══════════════════════════════════════════
// Schema Encoder
// ══════════════════════════════════════════

describe('contracts/schema-encoder', () => {
  const se = require('../lib/contracts/schema-encoder');

  it('encodes newsroom contract to schema', () => {
    const schema = se.encodeContractToSchema('newsroom');
    assert.equal(schema.contractId, 'contract_newsroom');
    assert.equal(schema.version, 'v1');
    assert.ok(schema.schemaHash.length > 0);
    assert.ok(schema.jsonSchema.properties.rankedItems);
    assert.ok(schema.jsonSchema.properties.title);
    assert.equal(schema.jsonSchema.type, 'object');
    assert.equal(schema.jsonSchema.$schema, 'http://json-schema.org/draft-07/schema#');
  });

  it('encodes shopping contract with items and comparisonKeys', () => {
    const schema = se.encodeContractToSchema('shopping');
    assert.ok(schema.jsonSchema.properties.items);
    assert.ok(schema.jsonSchema.properties.comparisonKeys);
    assert.equal(schema.jsonSchema.properties.items.type, 'array');
  });

  it('encodes code_change contract for startup engine', () => {
    const schema = se.encodeContractToSchema('startup');
    assert.ok(schema.jsonSchema.properties.diffs);
    assert.equal(schema.jsonSchema.properties.diffs.type, 'array');
  });

  it('falls back to document for unknown engines', () => {
    const schema = se.encodeContractToSchema('nonexistent_engine');
    assert.ok(schema.jsonSchema.properties.sections);
    assert.equal(schema.contractId, 'contract_nonexistent_engine');
  });

  it('produces stable hash for same engine', () => {
    const a = se.encodeContractToSchema('newsroom');
    const b = se.encodeContractToSchema('newsroom');
    assert.equal(a.schemaHash, b.schemaHash);
  });

  it('produces different hash for different engines', () => {
    const a = se.encodeContractToSchema('newsroom');
    const b = se.encodeContractToSchema('shopping');
    assert.notEqual(a.schemaHash, b.schemaHash);
  });

  it('includes schemaSummary', () => {
    const schema = se.encodeContractToSchema('newsroom');
    assert.ok(schema.schemaSummary.length > 0);
    assert.ok(schema.schemaSummary.includes('rankedItems'));
  });

  it('sets additionalProperties to false', () => {
    const schema = se.encodeContractToSchema('newsroom');
    assert.equal(schema.jsonSchema.additionalProperties, false);
  });

  it('canonicalize is deterministic', () => {
    const a = se.canonicalize({ b: 2, a: 1, c: [3, { e: 5, d: 4 }] });
    const b = se.canonicalize({ c: [3, { d: 4, e: 5 }], a: 1, b: 2 });
    assert.equal(a, b);
  });

  it('stableHash is deterministic', () => {
    assert.equal(se.stableHash('test'), se.stableHash('test'));
    assert.notEqual(se.stableHash('test'), se.stableHash('test2'));
  });

  it('encodes all known engines without error', () => {
    const engines = ['newsroom', 'shopping', 'startup', 'legal', 'screenwriting', 'music',
      'calendar', 'chief_of_staff', 'career', 'health', 'finance', 'travel', 'research', 'home', 'communications'];
    for (const e of engines) {
      const schema = se.encodeContractToSchema(e);
      assert.ok(schema.contractId, `Failed for ${e}`);
      assert.ok(schema.schemaHash, `No hash for ${e}`);
      assert.ok(Object.keys(schema.jsonSchema.properties).length > 0, `No properties for ${e}`);
    }
  });
});

// ══════════════════════════════════════════
// Structured Output Parser
// ══════════════════════════════════════════

describe('ai/structured-output', () => {
  const so = require('../lib/ai/structured-output');
  const se = require('../lib/contracts/schema-encoder');
  const cfgMod = require('../lib/config/ai-io');

  function getSchema() { return se.encodeContractToSchema('newsroom'); }
  function getCfg() { return { ...cfgMod.loadContractAwareConfig() }; }

  // -- native-json mode --
  describe('native-json mode', () => {
    it('parses valid JSON directly', () => {
      const result = so.parseStructured(
        '{"rankedItems":[{"headline":"h","summary":"s"}],"title":"t"}',
        'native-json', getSchema(), getCfg()
      );
      assert.equal(result.ok, true);
      assert.equal(result.value.title, 't');
      assert.equal(result.value.rankedItems.length, 1);
    });

    it('fails on non-JSON', () => {
      const result = so.parseStructured('not json', 'native-json', getSchema(), { ...getCfg(), acceptNonStrict: false });
      assert.equal(result.ok, false);
      assert.ok(result.errors.length > 0);
    });

    it('uses fenced fallback when acceptNonStrict', () => {
      const result = so.parseStructured(
        'Here is the JSON:\n```json\n{"rankedItems":[],"title":"x"}\n```',
        'native-json', getSchema(), getCfg()
      );
      assert.equal(result.ok, true);
      assert.equal(result.value.title, 'x');
    });

    it('uses balanced braces fallback', () => {
      const result = so.parseStructured(
        'Result: {"rankedItems":[],"title":"y"} done.',
        'native-json', getSchema(), getCfg()
      );
      assert.equal(result.ok, true);
      assert.equal(result.value.title, 'y');
    });
  });

  // -- prompt-sentinel mode --
  describe('prompt-sentinel mode', () => {
    it('extracts between sentinels', () => {
      const result = so.parseStructured(
        'Here:\n<gpo_json>\n{"rankedItems":[],"title":"t"}\n</gpo_json>\nDone.',
        'prompt-sentinel', getSchema(), getCfg()
      );
      assert.equal(result.ok, true);
      assert.equal(result.value.title, 't');
    });

    it('fails when sentinels missing', () => {
      const result = so.parseStructured(
        '{"rankedItems":[],"title":"t"}',
        'prompt-sentinel', getSchema(), { ...getCfg(), acceptNonStrict: false }
      );
      assert.equal(result.ok, false);
      assert.ok(result.errors.some(e => e.includes('Sentinel markers not found')));
    });

    it('falls back to braces when sentinels missing and acceptNonStrict', () => {
      const result = so.parseStructured(
        'The result is {"rankedItems":[],"title":"t"}',
        'prompt-sentinel', getSchema(), getCfg()
      );
      assert.equal(result.ok, true);
    });
  });

  // -- mime-json mode --
  describe('mime-json mode', () => {
    it('parses like native-json', () => {
      const result = so.parseStructured(
        '{"rankedItems":[],"title":"x"}',
        'mime-json', getSchema(), getCfg()
      );
      assert.equal(result.ok, true);
    });
  });

  // -- validation --
  describe('validation', () => {
    it('reports missing required fields', () => {
      const result = so.parseStructured(
        '{"title":"x"}',
        'native-json', getSchema(), getCfg()
      );
      assert.equal(result.ok, true); // parse succeeds but with validation errors
      assert.ok(result.errors.some(e => e.includes('Missing required field')));
    });

    it('reports type mismatches', () => {
      const result = so.parseStructured(
        '{"rankedItems":"not an array","title":"x"}',
        'native-json', getSchema(), getCfg()
      );
      assert.equal(result.ok, true);
      assert.ok(result.errors.some(e => e.includes('should be array')));
    });
  });

  // -- size cap --
  describe('size cap', () => {
    it('rejects oversized responses', () => {
      const huge = '{"title":"' + 'x'.repeat(500000) + '"}';
      const result = so.parseStructured(huge, 'native-json', getSchema(), getCfg());
      assert.equal(result.ok, false);
      assert.ok(result.errors.some(e => e.includes('maxResponseBytes')));
    });
  });

  // -- canonicalize --
  describe('canonicalize', () => {
    it('sorts object keys', () => {
      const result = so.canonicalize({ b: 2, a: 1 });
      assert.deepEqual(Object.keys(result), ['a', 'b']);
    });

    it('handles nested objects', () => {
      const result = so.canonicalize({ z: { b: 2, a: 1 }, a: 1 });
      assert.deepEqual(Object.keys(result), ['a', 'z']);
      assert.deepEqual(Object.keys(result.z), ['a', 'b']);
    });

    it('preserves arrays', () => {
      const result = so.canonicalize([3, 1, 2]);
      assert.deepEqual(result, [3, 1, 2]);
    });

    it('handles primitives', () => {
      assert.equal(so.canonicalize(null), null);
      assert.equal(so.canonicalize(42), 42);
      assert.equal(so.canonicalize('s'), 's');
    });
  });
});

// ══════════════════════════════════════════
// Field Populator
// ══════════════════════════════════════════

describe('merge/field-populator', () => {
  const fp = require('../lib/merge/field-populator');

  function makeDeliverable() {
    return { kind: 'newsroom', engineId: 'newsroom', title: '', generatedAt: '', rankedItems: [] };
  }

  function makeParsed(value) {
    return {
      ok: true,
      value,
      errors: [],
      raw: JSON.stringify(value),
      usedMode: 'native-json',
      schema: { contractId: 'test', version: 'v1', schemaHash: 'h', jsonSchema: {}, schemaSummary: '' },
      promptId: 'p1',
      attempts: 1,
    };
  }

  it('populates fields from parsed extraction', () => {
    const d = makeDeliverable();
    const parsed = makeParsed({ rankedItems: [{ headline: 'h', summary: 's' }], title: 'News' });
    const result = fp.populateDeliverableFromStructured({ deliverable: d, parsed });
    assert.ok(result.updatedFields.includes('rankedItems'));
    assert.ok(result.updatedFields.includes('title'));
    assert.equal(d.title, 'News');
    assert.equal(d.rankedItems.length, 1);
  });

  it('skips immutable fields (kind, engineId)', () => {
    const d = makeDeliverable();
    const parsed = makeParsed({ kind: 'shopping', engineId: 'other', title: 'Test' });
    const result = fp.populateDeliverableFromStructured({ deliverable: d, parsed });
    assert.ok(result.skippedFields.includes('kind'));
    assert.ok(result.skippedFields.includes('engineId'));
    assert.equal(d.kind, 'newsroom'); // unchanged
  });

  it('rejects type mismatches (array field gets non-array)', () => {
    const d = makeDeliverable();
    const parsed = makeParsed({ rankedItems: 'not an array', title: 'T' });
    const result = fp.populateDeliverableFromStructured({ deliverable: d, parsed });
    assert.ok(result.rejectedFields.includes('rankedItems'));
    assert.equal(d.rankedItems.length, 0); // unchanged
  });

  it('records diffs for updated fields', () => {
    const d = makeDeliverable();
    d.title = 'Old';
    const parsed = makeParsed({ title: 'New' });
    const result = fp.populateDeliverableFromStructured({ deliverable: d, parsed });
    assert.ok(result.diffs.title);
    assert.equal(result.diffs.title.before, 'Old');
    assert.equal(result.diffs.title.after, 'New');
  });

  it('handles empty parsed value gracefully', () => {
    const d = makeDeliverable();
    const parsed = makeParsed(null);
    parsed.ok = false;
    const result = fp.populateDeliverableFromStructured({ deliverable: d, parsed });
    assert.equal(result.updatedFields.length, 0);
  });

  it('respects merge policy replace strategy', () => {
    const d = makeDeliverable();
    d.title = 'Old';
    const parsed = makeParsed({ title: 'New' });
    const result = fp.populateDeliverableFromStructured({
      deliverable: d, parsed,
      mergePolicy: { variant: 'newsroom', fieldStrategies: { title: 'replace' } },
    });
    assert.equal(d.title, 'New');
  });

  it('respects merge policy append strategy for arrays', () => {
    const d = makeDeliverable();
    d.rankedItems = [{ headline: 'existing' }];
    const parsed = makeParsed({ rankedItems: [{ headline: 'new' }] });
    const result = fp.populateDeliverableFromStructured({
      deliverable: d, parsed,
      mergePolicy: { variant: 'newsroom', fieldStrategies: { rankedItems: 'append' } },
    });
    assert.equal(d.rankedItems.length, 2);
    assert.equal(d.rankedItems[0].headline, 'existing');
    assert.equal(d.rankedItems[1].headline, 'new');
  });

  it('respects union_dedupe strategy', () => {
    const d = makeDeliverable();
    d.rankedItems = [{ headline: 'a' }];
    const parsed = makeParsed({ rankedItems: [{ headline: 'a' }, { headline: 'b' }] });
    const result = fp.populateDeliverableFromStructured({
      deliverable: d, parsed,
      mergePolicy: { variant: 'newsroom', fieldStrategies: { rankedItems: 'union_dedupe' } },
    });
    assert.equal(d.rankedItems.length, 2);
  });

  it('updates generatedAt timestamp', () => {
    const d = makeDeliverable();
    const old = d.generatedAt;
    const parsed = makeParsed({ title: 'T' });
    fp.populateDeliverableFromStructured({ deliverable: d, parsed });
    assert.notEqual(d.generatedAt, old);
  });
});

// ══════════════════════════════════════════
// Prompt Builder
// ══════════════════════════════════════════

describe('prompt/contract-aware', () => {
  const pa = require('../lib/prompt/contract-aware');

  it('builds prompt for subtask execution', () => {
    const { envelope, schema } = pa.buildContractAwarePrompt({
      provider: 'openai',
      taskKind: 'subtask-execution',
      taskDescription: 'Find top news stories',
      engineId: 'newsroom',
    });
    assert.equal(envelope.mode, 'native-json');
    assert.ok(envelope.promptId.length > 0);
    assert.ok(envelope.system.includes('worker'));
    assert.ok(envelope.instructions.includes('JSON Schema'));
    assert.ok(envelope.instructions.includes('rankedItems'));
    assert.equal(schema.contractId, 'contract_newsroom');
  });

  it('builds prompt for board deliberation', () => {
    const { envelope } = pa.buildContractAwarePrompt({
      provider: 'openai',
      taskKind: 'board-deliberation',
      taskDescription: 'Evaluate news strategy',
      engineId: 'newsroom',
    });
    assert.ok(envelope.system.includes('Board'));
  });

  it('uses sentinel mode for perplexity', () => {
    const { envelope } = pa.buildContractAwarePrompt({
      provider: 'perplexity',
      taskKind: 'subtask-execution',
      taskDescription: 'Research',
      engineId: 'research',
    });
    assert.equal(envelope.mode, 'prompt-sentinel');
    assert.ok(envelope.instructions.includes('<gpo_json>'));
  });

  it('uses mime-json mode for gemini', () => {
    const { envelope } = pa.buildContractAwarePrompt({
      provider: 'gemini',
      taskKind: 'subtask-execution',
      taskDescription: 'Analyze',
      engineId: 'finance',
    });
    assert.equal(envelope.mode, 'mime-json');
  });

  it('includes prior context when provided', () => {
    const { envelope } = pa.buildContractAwarePrompt({
      provider: 'openai',
      taskKind: 'subtask-execution',
      taskDescription: 'task',
      engineId: 'newsroom',
      priorContext: 'Previous results included X',
    });
    assert.ok(envelope.user.includes('Previous results included X'));
  });

  it('includes field policies when provided', () => {
    const { envelope } = pa.buildContractAwarePrompt({
      provider: 'openai',
      taskKind: 'subtask-execution',
      taskDescription: 'task',
      engineId: 'newsroom',
      fieldPolicies: { rankedItems: 'union_dedupe', title: 'replace' },
    });
    assert.ok(envelope.instructions.includes('Field policy constraints'));
    assert.ok(envelope.instructions.includes('union_dedupe'));
  });

  it('produces stable promptId for same inputs', () => {
    const args = {
      provider: 'openai', taskKind: 'subtask-execution',
      taskDescription: 'task', engineId: 'newsroom',
    };
    const a = pa.buildContractAwarePrompt(args);
    const b = pa.buildContractAwarePrompt(args);
    assert.equal(a.envelope.promptId, b.envelope.promptId);
  });
});

// ══════════════════════════════════════════
// Evidence System
// ══════════════════════════════════════════

describe('evidence/structured + reader', () => {
  const ev = require('../lib/evidence/structured');
  const reader = require('../lib/evidence/reader');
  const fs = require('fs');
  const path = require('path');

  const EVIDENCE_BASE = path.resolve(__dirname, '..', '..', 'state', 'evidence');
  const TEST_DLV = 'test_unit_dlv_001';
  const TEST_TASK = 'test_unit_task_001';

  // Cleanup after tests
  function cleanup() {
    const dir = path.join(EVIDENCE_BASE, TEST_DLV);
    try { fs.rmSync(dir, { recursive: true }); } catch { /* */ }
  }

  it('records evidence file', () => {
    cleanup();
    ev.recordStructuredEvidence({
      deliverableId: TEST_DLV,
      taskId: TEST_TASK,
      schema: { contractId: 'c1', version: 'v1', schemaHash: 'h1', schemaSummary: 'test', jsonSchema: {} },
      envelope: { promptId: 'p1', mode: 'native-json', system: 'sys', user: 'usr', instructions: 'instr' },
      extraction: { ok: true, raw: '{}', usedMode: 'native-json', schema: {}, promptId: 'p1', attempts: 1, value: { title: 'x' } },
      mapping: { updatedFields: ['title'], skippedFields: [], rejectedFields: [], diffs: {} },
    });

    const dir = path.join(EVIDENCE_BASE, TEST_DLV, TEST_TASK);
    const files = fs.readdirSync(dir).filter(f => f.startsWith('structured-'));
    assert.ok(files.length > 0, 'Evidence file created');
    cleanup();
  });

  it('reads latest evidence', () => {
    cleanup();
    ev.recordStructuredEvidence({
      deliverableId: TEST_DLV, taskId: TEST_TASK,
      schema: { contractId: 'c1', version: 'v1', schemaHash: 'h1', schemaSummary: 'test', jsonSchema: {} },
      envelope: { promptId: 'p1', mode: 'native-json', system: 's', user: 'u', instructions: 'i' },
      extraction: { ok: true, raw: '{}', usedMode: 'native-json', schema: {}, promptId: 'p1', attempts: 1, value: { title: 'latest' } },
    });

    const latest = reader.getLatestEvidence(TEST_DLV);
    assert.ok(latest);
    assert.equal(latest.extraction.ok, true);
    cleanup();
  });

  it('reads task-specific evidence', () => {
    cleanup();
    ev.recordStructuredEvidence({
      deliverableId: TEST_DLV, taskId: TEST_TASK,
      schema: { contractId: 'c1', version: 'v1', schemaHash: 'h1', schemaSummary: 'test', jsonSchema: {} },
      envelope: { promptId: 'p1', mode: 'native-json', system: 's', user: 'u', instructions: 'i' },
      extraction: { ok: false, raw: 'bad', usedMode: 'native-json', schema: {}, promptId: 'p1', attempts: 1, errors: ['parse fail'] },
    });

    const entries = reader.getTaskEvidence(TEST_DLV, TEST_TASK);
    assert.ok(entries.length > 0);
    assert.equal(entries[0].extraction.ok, false);
    cleanup();
  });

  it('returns null for missing deliverable', () => {
    const latest = reader.getLatestEvidence('nonexistent_dlv_999');
    assert.equal(latest, null);
  });

  it('returns empty array for missing task evidence', () => {
    const entries = reader.getTaskEvidence('nonexistent_dlv_999', 'nonexistent_task');
    assert.equal(entries.length, 0);
  });

  it('redacts prompt content in evidence (only lengths stored)', () => {
    cleanup();
    ev.recordStructuredEvidence({
      deliverableId: TEST_DLV, taskId: TEST_TASK,
      schema: { contractId: 'c1', version: 'v1', schemaHash: 'h1', schemaSummary: 'test', jsonSchema: {} },
      envelope: { promptId: 'p1', mode: 'native-json', system: 'SECRET SYSTEM PROMPT', user: 'SECRET USER DATA', instructions: 'SECRET INSTRUCTIONS' },
      extraction: { ok: true, raw: '{}', usedMode: 'native-json', schema: {}, promptId: 'p1', attempts: 1, value: {} },
    });

    const latest = reader.getLatestEvidence(TEST_DLV);
    assert.ok(latest);
    // Prompt content should not be stored — only lengths
    assert.ok(!JSON.stringify(latest).includes('SECRET SYSTEM PROMPT'));
    assert.ok(!JSON.stringify(latest).includes('SECRET USER DATA'));
    assert.ok(latest.prompt.systemLength > 0);
    assert.ok(latest.prompt.userLength > 0);
    cleanup();
  });
});
