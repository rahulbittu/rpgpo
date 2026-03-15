// Integration Tests: Part 67 — End-to-end structured pipeline, deliberation wiring, API shapes
const { describe, it } = require('node:test');
const assert = require('node:assert/strict');

// ══════════════════════════════════════════
// End-to-end Pipeline: schema → prompt → parse → populate → evidence
// ══════════════════════════════════════════

describe('E2E structured pipeline', () => {
  const se = require('../lib/contracts/schema-encoder');
  const pa = require('../lib/prompt/contract-aware');
  const so = require('../lib/ai/structured-output');
  const fp = require('../lib/merge/field-populator');
  const ev = require('../lib/evidence/structured');
  const reader = require('../lib/evidence/reader');
  const cfgMod = require('../lib/config/ai-io');
  const fs = require('fs');
  const path = require('path');

  const EVIDENCE_BASE = path.resolve(__dirname, '..', '..', 'state', 'evidence');

  function cleanup(dlvId) {
    try { fs.rmSync(path.join(EVIDENCE_BASE, dlvId), { recursive: true }); } catch { /* */ }
  }

  it('full pipeline for newsroom engine with valid JSON', () => {
    const engineId = 'newsroom';
    const provider = 'openai';
    const dlvId = 'e2e_test_newsroom_001';
    const taskId = 'e2e_task_001';
    cleanup(dlvId);

    // Step 1: Build prompt
    const { envelope, schema } = pa.buildContractAwarePrompt({
      provider, taskKind: 'subtask-execution',
      taskDescription: 'Find top 3 news stories about AI regulation',
      engineId,
    });
    assert.equal(envelope.mode, 'native-json');
    assert.ok(schema.jsonSchema.properties.rankedItems);

    // Step 2: Simulate provider response (valid JSON)
    const simulatedResponse = JSON.stringify({
      rankedItems: [
        { rank: 1, headline: 'EU AI Act enters force', summary: 'The EU AI Act is now law.', source: { name: 'Reuters', url: 'https://example.com' } },
        { rank: 2, headline: 'US executive order on AI', summary: 'Biden signs AI order.', source: { name: 'AP', url: 'https://example.com' } },
        { rank: 3, headline: 'China AI governance framework', summary: 'China publishes AI rules.', source: { name: 'BBC', url: 'https://example.com' } },
      ],
      title: 'AI Regulation Roundup',
      summaries: ['EU law', 'US order', 'China rules'],
      source_links: ['https://example.com/1', 'https://example.com/2'],
    });

    // Step 3: Parse
    const cfg = cfgMod.loadContractAwareConfig();
    const parsed = so.parseStructured(simulatedResponse, 'native-json', schema, cfg);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.value.rankedItems.length, 3);
    assert.equal(parsed.value.title, 'AI Regulation Roundup');

    // Step 4: Populate deliverable
    const deliverable = { kind: 'newsroom', engineId: 'newsroom', title: '', generatedAt: '', rankedItems: [] };
    const mapping = fp.populateDeliverableFromStructured({ deliverable, parsed });
    assert.ok(mapping.updatedFields.includes('rankedItems'));
    assert.ok(mapping.updatedFields.includes('title'));
    assert.equal(deliverable.rankedItems.length, 3);
    assert.equal(deliverable.title, 'AI Regulation Roundup');

    // Step 5: Record evidence
    ev.recordStructuredEvidence({
      deliverableId: dlvId, taskId,
      schema, envelope,
      extraction: { ...parsed, tokensIn: 500, tokensOut: 200, durationMs: 1500, promptId: envelope.promptId },
      mapping,
    });

    // Step 6: Read evidence
    const latest = reader.getLatestEvidence(dlvId);
    assert.ok(latest);
    assert.equal(latest.extraction.ok, true);
    assert.equal(latest.extraction.usedMode, 'native-json');
    assert.ok(latest.mapping.updatedFields.includes('rankedItems'));
    assert.equal(latest.schema.schemaHash, schema.schemaHash);

    cleanup(dlvId);
  });

  it('full pipeline with parse failure and fallback evidence', () => {
    const dlvId = 'e2e_test_fail_001';
    const taskId = 'e2e_task_fail_001';
    cleanup(dlvId);

    const { envelope, schema } = pa.buildContractAwarePrompt({
      provider: 'perplexity', taskKind: 'subtask-execution',
      taskDescription: 'Research task', engineId: 'research',
    });

    // Simulate bad response
    const cfg = { ...cfgMod.loadContractAwareConfig(), acceptNonStrict: false };
    const parsed = so.parseStructured(
      'I could not find the information you requested. Please try again later.',
      'prompt-sentinel', schema, cfg
    );
    assert.equal(parsed.ok, false);

    // Evidence still recorded
    ev.recordStructuredEvidence({
      deliverableId: dlvId, taskId,
      schema, envelope,
      extraction: { ...parsed, promptId: envelope.promptId },
    });

    const latest = reader.getLatestEvidence(dlvId);
    assert.ok(latest);
    assert.equal(latest.extraction.ok, false);
    assert.ok(latest.extraction.errors.length > 0);

    cleanup(dlvId);
  });

  it('full pipeline with sentinel mode extraction', () => {
    const dlvId = 'e2e_test_sentinel_001';
    const taskId = 'e2e_task_sentinel_001';
    cleanup(dlvId);

    const { envelope, schema } = pa.buildContractAwarePrompt({
      provider: 'perplexity', taskKind: 'subtask-execution',
      taskDescription: 'Find thesis and evidence', engineId: 'research',
    });
    assert.equal(envelope.mode, 'prompt-sentinel');

    const simulatedResponse = `Based on my research, here are the findings:

<gpo_json>
{
  "thesis": "AI regulation is converging globally",
  "evidence": [{"claim": "EU passed AI Act", "support": "Official EU docs"}],
  "recommendation": "Monitor developments quarterly",
  "title": "AI Regulation Research"
}
</gpo_json>

Hope this helps!`;

    const cfg = cfgMod.loadContractAwareConfig();
    const parsed = so.parseStructured(simulatedResponse, 'prompt-sentinel', schema, cfg);
    assert.equal(parsed.ok, true);
    assert.equal(parsed.value.thesis, 'AI regulation is converging globally');

    ev.recordStructuredEvidence({
      deliverableId: dlvId, taskId, schema, envelope,
      extraction: { ...parsed, promptId: envelope.promptId },
    });

    const entries = reader.getTaskEvidence(dlvId, taskId);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].extraction.ok, true);

    cleanup(dlvId);
  });
});

// ══════════════════════════════════════════
// Deliberation wiring (executeStructuredSubtask exists)
// ══════════════════════════════════════════

describe('deliberation structured wiring', () => {
  const delib = require('../lib/deliberation');

  it('exports executeStructuredSubtask', () => {
    assert.equal(typeof delib.executeStructuredSubtask, 'function');
  });

  it('exports standard deliberate function', () => {
    assert.equal(typeof delib.deliberate, 'function');
  });
});

// ══════════════════════════════════════════
// Runtime pipeline structured argument
// ══════════════════════════════════════════

describe('runtime-deliverable-pipeline structured support', () => {
  const rdp = require('../lib/runtime-deliverable-pipeline');

  it('onSubtaskComplete accepts optional structuredResult param', () => {
    // Function should accept 5 params (taskId, subtaskId, output, engineId, structuredResult?)
    assert.ok(rdp.onSubtaskComplete.length >= 4);
  });
});

// ══════════════════════════════════════════
// Provider mode correctness
// ══════════════════════════════════════════

describe('provider mode selection', () => {
  const pa = require('../lib/prompt/contract-aware');

  const cases = [
    { provider: 'openai', expected: 'native-json' },
    { provider: 'anthropic', expected: 'native-json' },
    { provider: 'gemini', expected: 'mime-json' },
    { provider: 'google', expected: 'mime-json' },
    { provider: 'perplexity', expected: 'prompt-sentinel' },
    { provider: 'unknown_provider', expected: 'prompt-sentinel' },
  ];

  for (const { provider, expected } of cases) {
    it(`${provider} → ${expected}`, () => {
      const { envelope } = pa.buildContractAwarePrompt({
        provider, taskKind: 'subtask-execution',
        taskDescription: 'test', engineId: 'newsroom',
      });
      assert.equal(envelope.mode, expected);
    });
  }
});

// ══════════════════════════════════════════
// Feature flag: disabled path
// ══════════════════════════════════════════

describe('feature flag disabled', () => {
  const se = require('../lib/contracts/schema-encoder');
  const so = require('../lib/ai/structured-output');
  const cfgMod = require('../lib/config/ai-io');

  it('parser still works when called directly regardless of flag', () => {
    // The flag controls the deliberation wiring, not the parser itself
    const schema = se.encodeContractToSchema('newsroom');
    const cfg = { ...cfgMod.loadContractAwareConfig(), enabled: false };
    const result = so.parseStructured('{"rankedItems":[],"title":"t"}', 'native-json', schema, cfg);
    assert.equal(result.ok, true);
  });
});

// ══════════════════════════════════════════
// Cross-engine schema encoding
// ══════════════════════════════════════════

describe('cross-engine schema correctness', () => {
  const se = require('../lib/contracts/schema-encoder');

  const engineFieldMap = {
    newsroom: ['rankedItems'],
    shopping: ['items', 'comparisonKeys'],
    startup: ['diffs'],
    screenwriting: ['artifacts'],
    music: ['artifacts'],
    finance: ['findings'],
    career: ['sections'],
  };

  for (const [engine, expectedFields] of Object.entries(engineFieldMap)) {
    it(`${engine} schema includes required fields: ${expectedFields.join(', ')}`, () => {
      const schema = se.encodeContractToSchema(engine);
      for (const field of expectedFields) {
        assert.ok(schema.jsonSchema.properties[field], `${engine} missing ${field}`);
      }
    });
  }
});
