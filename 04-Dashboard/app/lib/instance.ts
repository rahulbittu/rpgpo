// GPO Instance Model
// A GPO instance represents one private office for one operator.
// RPGPO is the first and default instance.
// All instance-scoped data (tasks, costs, memory, settings) is isolated here.

import type {
  GPOInstance,
  PrivacyPolicy,
  InstanceProviderSettings,
  NotificationSettings,
  LocalSettings,
  BudgetSettings,
  Domain,
  Provider,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

// ═══════════════════════════════════════════
// Instance Storage
// ═══════════════════════════════════════════

const INSTANCE_FILE = path.resolve(__dirname, '..', '..', 'state', 'instance.json');

function ensureFile(): void {
  const dir = path.dirname(INSTANCE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(INSTANCE_FILE)) {
    fs.writeFileSync(INSTANCE_FILE, JSON.stringify(createDefaultInstance(), null, 2));
  }
}

function readInstance(): GPOInstance {
  ensureFile();
  try {
    return JSON.parse(fs.readFileSync(INSTANCE_FILE, 'utf-8'));
  } catch {
    return createDefaultInstance();
  }
}

function writeInstance(instance: GPOInstance): void {
  ensureFile();
  instance.updated_at = new Date().toISOString();
  fs.writeFileSync(INSTANCE_FILE, JSON.stringify(instance, null, 2));
}

// ═══════════════════════════════════════════
// Default Instance — RPGPO (Rahul Pitta's GPO)
// ═══════════════════════════════════════════

function createDefaultInstance(): GPOInstance {
  return {
    instance_id: 'rpgpo',
    instance_name: 'RPGPO',
    operator_name: 'Rahul',
    enabled_missions: [
      'topranker', 'careeregine', 'founder2founder', 'wealthresearch',
      'newsroom', 'screenwriting', 'music', 'personalops', 'general',
    ],
    enabled_capabilities: [
      'coding', 'research', 'deliberation', 'repo-grounding',
      'approval-handling', 'builder-execution', 'cost-tracking',
    ],
    provider_settings: {
      claude: { enabled: true, mode: 'local' },
      openai: { enabled: true, model: 'gpt-4o' },
      perplexity: { enabled: true, model: 'sonar' },
      gemini: { enabled: true, model: 'gemini-2.5-flash-lite' },
    },
    repo_mappings: {
      topranker: '02-Projects/TopRanker/source-repo',
      careeregine: '02-Projects/CareerEngine',
      founder2founder: '',
      wealthresearch: '',
      newsroom: '',
      screenwriting: '',
      music: '',
      personalops: '',
      general: '',
    },
    policy: createDefaultPolicy(),
    budget: {
      geminiModel: 'gemini-2.5-flash-lite',
      geminibudgetLimit: null,
      warningThreshold: null,
      disableAfterThreshold: false,
      builderTimeoutMinutes: 10,
    },
    notification_settings: {
      enabled: true,
      channels: ['dashboard'],
      notify_on: ['approval_needed', 'task_done', 'task_failed', 'builder_complete'],
    },
    local_settings: {
      storage_root: path.resolve(__dirname, '..', '..', 'state'),
      offline_capable: true,
      auto_refresh_interval_ms: 3000,
      builder_timeout_minutes: 10,
      operator_mode_default: false,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function createDefaultPolicy(): PrivacyPolicy {
  return {
    local_only: false,
    allowed_providers: ['claude', 'openai', 'perplexity', 'gemini'],
    mission_isolation: [],
    log_redaction_patterns: [
      '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',  // emails
      '\\bsk-[a-zA-Z0-9]{20,}\\b',                                   // API keys
    ],
    sensitive_fields: ['api_key', 'password', 'secret', 'token'],
    allow_export: true,
    allow_import: true,
    secret_scope: 'env',
    memory_scope: 'instance',
  };
}

// ═══════════════════════════════════════════
// Public API
// ═══════════════════════════════════════════

/** Get the current GPO instance */
export function getInstance(): GPOInstance {
  return readInstance();
}

/** Update the current instance */
export function updateInstance(updates: Partial<GPOInstance>): GPOInstance {
  const current = readInstance();
  const updated = { ...current, ...updates };
  writeInstance(updated);
  return updated;
}

/** Get the operator name for display */
export function getOperatorName(): string {
  return readInstance().operator_name;
}

/** Get the instance ID */
export function getInstanceId(): string {
  return readInstance().instance_id;
}

/** Check if a mission is enabled for this instance */
export function isMissionEnabled(domain: Domain): boolean {
  return readInstance().enabled_missions.includes(domain);
}

/** Check if a capability is enabled for this instance */
export function isCapabilityEnabled(capabilityId: string): boolean {
  return readInstance().enabled_capabilities.includes(capabilityId);
}

/** Check if a provider is allowed by privacy policy */
export function isProviderAllowed(provider: Provider): boolean {
  const instance = readInstance();
  return instance.policy.allowed_providers.includes(provider);
}

/** Check if a mission requires data isolation */
export function isMissionIsolated(domain: Domain): boolean {
  return readInstance().policy.mission_isolation.includes(domain);
}

/** Get the repo path for a domain */
export function getRepoPath(domain: Domain): string {
  return readInstance().repo_mappings[domain] || '';
}

/** Get the privacy policy */
export function getPrivacyPolicy(): PrivacyPolicy {
  return readInstance().policy;
}

/** Update privacy policy */
export function updatePrivacyPolicy(updates: Partial<PrivacyPolicy>): PrivacyPolicy {
  const instance = readInstance();
  const updated = { ...instance.policy, ...updates };
  writeInstance({ ...instance, policy: updated });
  return updated;
}

/** Get storage root for this instance */
export function getStorageRoot(): string {
  return readInstance().local_settings.storage_root;
}

/** Get the plan tier for this instance */
export function getPlanTier(): string {
  const inst = readInstance();
  return (inst as GPOInstance & { plan?: string }).plan || 'pro';
}

/** Set the plan tier */
export function setPlanTier(tier: string): void {
  const inst = readInstance();
  (inst as GPOInstance & { plan?: string }).plan = tier;
  writeInstance(inst);
}

module.exports = {
  getInstance,
  updateInstance,
  getOperatorName,
  getInstanceId,
  isMissionEnabled,
  isCapabilityEnabled,
  isProviderAllowed,
  isMissionIsolated,
  getRepoPath,
  getPrivacyPolicy,
  updatePrivacyPolicy,
  getStorageRoot,
  getPlanTier,
  setPlanTier,
};
