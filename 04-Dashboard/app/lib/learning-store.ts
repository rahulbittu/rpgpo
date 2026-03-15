// GPO Persistent Learning Store — Cross-session learning with file-backed persistence

import type { ProviderPerfRecord, ProviderPerfSample, ProviderContextKey, EwmaStats, KnowledgeEntry, LearningStoreMeta } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const STORE_DIR = path.resolve(__dirname, '..', '..', 'state', 'learning');
const PROVIDER_FILE = path.join(STORE_DIR, 'provider-perf.json');
const KNOWLEDGE_FILE = path.join(STORE_DIR, 'knowledge.json');
const META_FILE = path.join(STORE_DIR, 'meta.json');

const EWMA_ALPHA = 0.2;
const MAX_SAMPLES = 30;
const MAX_KNOWLEDGE = 500;

function ensureDir(): void {
  if (!fs.existsSync(STORE_DIR)) fs.mkdirSync(STORE_DIR, { recursive: true });
}

function readJson<T>(f: string, fb: T): T {
  try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; }
}

function writeJson(f: string, d: unknown): void {
  ensureDir();
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
}

function contextKeyHash(key: ProviderContextKey, providerId: string): string {
  return crypto.createHash('sha256').update(`${key.engineId}:${key.taskKind}:${key.contractName}:${providerId}`).digest('hex').slice(0, 16);
}

// ── Provider Performance Learning ──

let _providerRecords: Map<string, ProviderPerfRecord> = new Map();
let _loaded = false;

function loadProviderRecords(): void {
  if (_loaded) return;
  const records = readJson<ProviderPerfRecord[]>(PROVIDER_FILE, []);
  _providerRecords = new Map();
  for (const r of records) {
    const hash = contextKeyHash(r.key, r.providerId);
    _providerRecords.set(hash, r);
  }
  _loaded = true;
}

function saveProviderRecords(): void {
  writeJson(PROVIDER_FILE, Array.from(_providerRecords.values()));
  updateMeta();
}

export function recordProviderSample(key: ProviderContextKey, sample: ProviderPerfSample): void {
  loadProviderRecords();
  const hash = contextKeyHash(key, sample.providerId);

  let record = _providerRecords.get(hash);
  if (!record) {
    record = {
      key,
      providerId: sample.providerId,
      ewma: { n: 0, lastTimestamp: 0, latencyMsEwma: 0, successRateEwma: 0.5, qualityEwma: 0.5, costPerTokenEwma: 0 },
      lastSamples: [],
    };
    _providerRecords.set(hash, record);
  }

  // Update EWMA
  const e = record.ewma;
  const alpha = EWMA_ALPHA;
  e.latencyMsEwma = alpha * sample.latencyMs + (1 - alpha) * e.latencyMsEwma;
  e.successRateEwma = alpha * (sample.success ? 1 : 0) + (1 - alpha) * e.successRateEwma;
  e.qualityEwma = alpha * sample.qualityScore + (1 - alpha) * e.qualityEwma;
  const totalTokens = (sample.inputTokens || 0) + (sample.outputTokens || 0);
  if (totalTokens > 0) {
    e.costPerTokenEwma = alpha * (sample.totalCostUsd / totalTokens) + (1 - alpha) * e.costPerTokenEwma;
  }
  e.n++;
  e.lastTimestamp = sample.timestamp;

  // Ring buffer
  record.lastSamples.push(sample);
  if (record.lastSamples.length > MAX_SAMPLES) {
    record.lastSamples = record.lastSamples.slice(-MAX_SAMPLES);
  }

  saveProviderRecords();
}

export function getProviderPerf(key: ProviderContextKey, providerId: string): ProviderPerfRecord | null {
  loadProviderRecords();
  return _providerRecords.get(contextKeyHash(key, providerId)) || null;
}

export function getBestProvider(key: ProviderContextKey): { providerId: string; score: number } | null {
  loadProviderRecords();
  let best: { providerId: string; score: number } | null = null;

  for (const record of _providerRecords.values()) {
    if (record.key.engineId !== key.engineId || record.key.contractName !== key.contractName) continue;
    if (record.ewma.n < 3) continue; // need minimum samples

    const score = record.ewma.successRateEwma * 0.5 + record.ewma.qualityEwma * 0.3 + (1 / Math.max(0.01, record.ewma.latencyMsEwma / 5000)) * 0.2;
    if (!best || score > best.score) {
      best = { providerId: record.providerId, score };
    }
  }

  return best;
}

export function getAllProviderPerf(): ProviderPerfRecord[] {
  loadProviderRecords();
  return Array.from(_providerRecords.values());
}

// ── Knowledge Base ──

let _knowledge: KnowledgeEntry[] = [];
let _knowledgeLoaded = false;

function loadKnowledge(): void {
  if (_knowledgeLoaded) return;
  _knowledge = readJson<KnowledgeEntry[]>(KNOWLEDGE_FILE, []);
  _knowledgeLoaded = true;
}

function saveKnowledge(): void {
  if (_knowledge.length > MAX_KNOWLEDGE) _knowledge = _knowledge.slice(-MAX_KNOWLEDGE);
  writeJson(KNOWLEDGE_FILE, _knowledge);
  updateMeta();
}

export function addKnowledgeEntry(entry: KnowledgeEntry): string {
  loadKnowledge();
  if (!entry.id) {
    entry.id = 'kb_' + Date.now().toString(36) + '_' + crypto.randomBytes(3).toString('hex');
  }
  _knowledge.push(entry);
  saveKnowledge();
  return entry.id;
}

export function searchKnowledge(query: { engineId?: string; contractName?: string; tags?: string[]; text?: string }): KnowledgeEntry[] {
  loadKnowledge();
  return _knowledge.filter(e => {
    if (query.engineId && e.engineId !== query.engineId) return false;
    if (query.contractName && e.contractName !== query.contractName) return false;
    if (query.tags?.length && !query.tags.some(t => e.domainTags.includes(t))) return false;
    if (query.text) {
      const lower = query.text.toLowerCase();
      const searchable = [e.title, ...e.insights, ...e.promptTips].join(' ').toLowerCase();
      if (!searchable.includes(lower)) return false;
    }
    return true;
  }).sort((a, b) => b.createdAt - a.createdAt);
}

export function getAllKnowledge(): KnowledgeEntry[] {
  loadKnowledge();
  return [..._knowledge];
}

// ── Meta ──

function updateMeta(): void {
  const meta: LearningStoreMeta = {
    version: 'v1',
    createdAt: readJson<LearningStoreMeta>(META_FILE, { createdAt: Date.now() } as any).createdAt,
    updatedAt: Date.now(),
    recordCounts: {
      providerPerf: _providerRecords.size,
      knowledgeEntries: _knowledge.length,
    },
  };
  writeJson(META_FILE, meta);
}

export function getLearningMeta(): LearningStoreMeta {
  return readJson<LearningStoreMeta>(META_FILE, {
    version: 'v1', createdAt: Date.now(), updatedAt: Date.now(),
    recordCounts: { providerPerf: 0, knowledgeEntries: 0 },
  });
}

export function resetLearning(): void {
  _providerRecords = new Map();
  _knowledge = [];
  _loaded = false;
  _knowledgeLoaded = false;
  try { fs.unlinkSync(PROVIDER_FILE); } catch { /* */ }
  try { fs.unlinkSync(KNOWLEDGE_FILE); } catch { /* */ }
  try { fs.unlinkSync(META_FILE); } catch { /* */ }
}

module.exports = {
  recordProviderSample, getProviderPerf, getBestProvider, getAllProviderPerf,
  addKnowledgeEntry, searchKnowledge, getAllKnowledge,
  getLearningMeta, resetLearning,
};
