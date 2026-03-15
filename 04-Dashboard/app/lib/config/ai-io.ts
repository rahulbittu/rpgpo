// GPO Contract-Aware AI I/O Config — Loader and validator

import type { GPO_ContractAwareConfig } from '../types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const CONFIG_FILE = path.resolve(__dirname, '..', '..', '..', 'state', 'config', 'ai-io.json');

const DEFAULTS: GPO_ContractAwareConfig = {
  enabled: true,
  acceptNonStrict: true,
  maxParseAttempts: 3,
  maxResponseBytes: 400000,
  providerModes: {
    openai: 'native-json',
    anthropic: 'native-json',
    perplexity: 'prompt-sentinel',
    gemini: 'mime-json',
  },
  sentinel: { start: '<gpo_json>', end: '</gpo_json>' },
  boardStructuredEnabled: true,
  workerStructuredEnabled: true,
  providerRouting: 'capability-preferred',
  backoffMs: 250,
  backoffMultiplier: 1.7,
  backoffJitter: 0.2,
  exposeStatusToOperator: true,
  allowManualRetry: false,
};

let _cached: GPO_ContractAwareConfig | null = null;

export function loadContractAwareConfig(): GPO_ContractAwareConfig {
  if (_cached) return _cached;
  let raw: Partial<GPO_ContractAwareConfig> = {};
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      raw = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));
    }
  } catch { /* use defaults */ }

  const cfg: GPO_ContractAwareConfig = {
    enabled: raw.enabled ?? DEFAULTS.enabled,
    acceptNonStrict: raw.acceptNonStrict ?? DEFAULTS.acceptNonStrict,
    maxParseAttempts: raw.maxParseAttempts ?? DEFAULTS.maxParseAttempts,
    maxResponseBytes: raw.maxResponseBytes ?? DEFAULTS.maxResponseBytes,
    providerModes: { ...DEFAULTS.providerModes, ...(raw.providerModes || {}) },
    sentinel: { ...DEFAULTS.sentinel, ...(raw.sentinel || {}) },
    boardStructuredEnabled: raw.boardStructuredEnabled ?? DEFAULTS.boardStructuredEnabled,
    workerStructuredEnabled: raw.workerStructuredEnabled ?? DEFAULTS.workerStructuredEnabled,
    providerRouting: raw.providerRouting ?? DEFAULTS.providerRouting,
    backoffMs: raw.backoffMs ?? DEFAULTS.backoffMs,
    backoffMultiplier: raw.backoffMultiplier ?? DEFAULTS.backoffMultiplier,
    backoffJitter: raw.backoffJitter ?? DEFAULTS.backoffJitter,
    exposeStatusToOperator: raw.exposeStatusToOperator ?? DEFAULTS.exposeStatusToOperator,
    allowManualRetry: raw.allowManualRetry ?? DEFAULTS.allowManualRetry,
  };

  _cached = Object.freeze(cfg) as GPO_ContractAwareConfig;
  return _cached;
}

export function clearConfigCache(): void {
  _cached = null;
}

module.exports = { loadContractAwareConfig, clearConfigCache };
