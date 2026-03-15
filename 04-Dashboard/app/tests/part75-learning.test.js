// Tests: Part 75 — Persistent Learning Store
const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert/strict');

describe('learning-store', () => {
  const ls = require('../lib/learning-store');

  beforeEach(() => ls.resetLearning());

  it('records provider performance samples', () => {
    const key = { engineId: 'newsroom', taskKind: 'research', contractName: 'news' };
    ls.recordProviderSample(key, { timestamp: Date.now(), providerId: 'perplexity', latencyMs: 2000, inputTokens: 500, outputTokens: 300, totalCostUsd: 0.005, success: true, qualityScore: 0.9 });
    const record = ls.getProviderPerf(key, 'perplexity');
    assert.ok(record);
    assert.equal(record.ewma.n, 1);
    assert.ok(record.ewma.successRateEwma > 0);
  });

  it('getBestProvider returns null with too few samples', () => {
    const key = { engineId: 'test', taskKind: 'task', contractName: 'c' };
    ls.recordProviderSample(key, { timestamp: Date.now(), providerId: 'openai', latencyMs: 1000, inputTokens: 100, outputTokens: 100, totalCostUsd: 0.01, success: true, qualityScore: 0.8 });
    assert.equal(ls.getBestProvider(key), null);
  });

  it('getBestProvider returns best after enough samples', () => {
    const key = { engineId: 'test', taskKind: 'task', contractName: 'c' };
    for (let i = 0; i < 5; i++) {
      ls.recordProviderSample(key, { timestamp: Date.now(), providerId: 'openai', latencyMs: 1000, inputTokens: 100, outputTokens: 100, totalCostUsd: 0.01, success: true, qualityScore: 0.9 });
    }
    const best = ls.getBestProvider(key);
    assert.ok(best);
    assert.equal(best.providerId, 'openai');
  });

  it('adds and searches knowledge entries', () => {
    ls.addKnowledgeEntry({ id: '', tenantId: 'rpgpo', projectId: 'default', contractName: 'news', engineId: 'newsroom', domainTags: ['ai'], title: 'AI News Pattern', insights: ['Use Perplexity'], promptTips: [], providerRanking: ['perplexity'], source: { deliverableId: 'd1' }, createdAt: Date.now() });
    const results = ls.searchKnowledge({ engineId: 'newsroom' });
    assert.equal(results.length, 1);
    assert.equal(results[0].title, 'AI News Pattern');
  });

  it('searches by text', () => {
    ls.addKnowledgeEntry({ id: '', tenantId: 'rpgpo', projectId: 'default', contractName: 'c', engineId: 'e', domainTags: [], title: 'How to research jobs', insights: ['Use LinkedIn'], promptTips: [], providerRanking: [], source: { deliverableId: 'd2' }, createdAt: Date.now() });
    assert.equal(ls.searchKnowledge({ text: 'jobs' }).length, 1);
    assert.equal(ls.searchKnowledge({ text: 'nonexistent' }).length, 0);
  });

  it('tracks meta counts', () => {
    ls.recordProviderSample({ engineId: 'e', taskKind: 't', contractName: 'c' }, { timestamp: Date.now(), providerId: 'openai', latencyMs: 100, inputTokens: 10, outputTokens: 10, totalCostUsd: 0.001, success: true, qualityScore: 0.8 });
    ls.addKnowledgeEntry({ id: '', tenantId: 'r', projectId: 'p', contractName: 'c', engineId: 'e', domainTags: [], title: 't', insights: [], promptTips: [], providerRanking: [], source: { deliverableId: 'd' }, createdAt: Date.now() });
    const meta = ls.getLearningMeta();
    assert.equal(meta.recordCounts.providerPerf, 1);
    assert.equal(meta.recordCounts.knowledgeEntries, 1);
  });

  it('reset clears everything', () => {
    ls.recordProviderSample({ engineId: 'e', taskKind: 't', contractName: 'c' }, { timestamp: Date.now(), providerId: 'p', latencyMs: 100, inputTokens: 10, outputTokens: 10, totalCostUsd: 0, success: true, qualityScore: 1 });
    ls.resetLearning();
    assert.equal(ls.getAllProviderPerf().length, 0);
    assert.equal(ls.getAllKnowledge().length, 0);
  });
});
