// GPO Scheduler Store — Config and state persistence

import type { SchedulerConfig } from '../types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const STATE_DIR = path.resolve(__dirname, '..', '..', '..', 'state', 'scheduler');
const CONFIG_FILE = path.join(STATE_DIR, 'config.json');
const PAUSED_FILE = path.join(STATE_DIR, 'paused.json');

function ensureDir(): void {
  if (!fs.existsSync(STATE_DIR)) fs.mkdirSync(STATE_DIR, { recursive: true });
}

function readJson<T>(f: string, fb: T): T {
  try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; }
}

function writeJson(f: string, d: unknown): void {
  ensureDir();
  fs.writeFileSync(f, JSON.stringify(d, null, 2));
}

const DEFAULT_CONFIG: SchedulerConfig = {
  version: 1,
  featureFlags: { enabled: false, enableFairSharing: true, enableDeadLetter: true, enableDynamicBackpressure: true },
  globalMaxConcurrent: 1,
  defaultTimeoutMs: 180000,
  perProviderMaxConcurrent: { openai: 4, anthropic: 3, google: 3, perplexity: 2 },
  perTenantMaxConcurrent: {},
  perProjectMaxConcurrent: {},
  queueCapacity: 200,
  inFlightLeaseMs: 120000,
  maxAttempts: 4,
  initialRetryDelayMs: 2000,
  maxRetryDelayMs: 45000,
  fairnessWeights: { tenant: {}, project: {} },
};

export function loadConfig(): SchedulerConfig {
  const raw = readJson<Partial<SchedulerConfig>>(CONFIG_FILE, {});
  return { ...DEFAULT_CONFIG, ...raw, featureFlags: { ...DEFAULT_CONFIG.featureFlags, ...(raw.featureFlags || {}) }, fairnessWeights: { ...DEFAULT_CONFIG.fairnessWeights, ...(raw.fairnessWeights || {}) } };
}

export function saveConfig(cfg: SchedulerConfig): void {
  writeJson(CONFIG_FILE, cfg);
}

export function getPaused(): boolean {
  return readJson<{ paused: boolean }>(PAUSED_FILE, { paused: false }).paused;
}

export function setPaused(paused: boolean): void {
  writeJson(PAUSED_FILE, { paused, updatedAt: new Date().toISOString() });
}

module.exports = { loadConfig, saveConfig, getPaused, setPaused };
