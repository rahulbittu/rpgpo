// GPO Instance Provisioning — Create, validate, export, manage instances
// RPGPO is the first provisioned instance, not a special exception.

import type {
  GPOInstance, ProvisioningRequest, ProvisioningResult,
  InstanceHealth, HealthCheck, InstanceExport,
  ProductAdminSummary, PlanTier, Domain, Provider,
  PrivacyPolicy, BudgetSettings,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const plansMod = require('./plans') as {
  getPlan(tier: PlanTier): import('./types').ProductPlan;
  isCapabilityAllowed(tier: PlanTier, cap: string): boolean;
  isProviderAllowed(tier: PlanTier, provider: Provider): boolean;
};

const instanceMod = require('./instance') as {
  getInstance(): GPOInstance;
  updateInstance(updates: Partial<GPOInstance>): GPOInstance;
  getPrivacyPolicy(): PrivacyPolicy;
};

// ═══════════════════════════════════════════
// Privacy Presets
// ═══════════════════════════════════════════

const PRIVACY_PRESETS: Record<string, Partial<PrivacyPolicy>> = {
  'open': {
    local_only: false,
    allowed_providers: ['claude', 'openai', 'perplexity', 'gemini'],
    mission_isolation: [],
    allow_export: true,
    allow_import: true,
  },
  'balanced': {
    local_only: false,
    allowed_providers: ['claude', 'openai', 'perplexity', 'gemini'],
    mission_isolation: [],
    log_redaction_patterns: [
      '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
      '\\bsk-[a-zA-Z0-9]{20,}\\b',
    ],
    sensitive_fields: ['api_key', 'password', 'secret', 'token'],
    allow_export: true,
    allow_import: true,
    secret_scope: 'env',
    memory_scope: 'instance',
  },
  'strict': {
    local_only: false,
    allowed_providers: ['claude'],
    mission_isolation: [],
    log_redaction_patterns: [
      '\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b',
      '\\bsk-[a-zA-Z0-9]{20,}\\b',
      '\\b\\d{3}[-.]?\\d{3}[-.]?\\d{4}\\b',
    ],
    sensitive_fields: ['api_key', 'password', 'secret', 'token', 'ssn', 'phone'],
    allow_export: false,
    allow_import: false,
    secret_scope: 'env',
    memory_scope: 'instance',
  },
  'local-only': {
    local_only: true,
    allowed_providers: ['claude'],
    mission_isolation: [],
    allow_export: false,
    allow_import: false,
    secret_scope: 'env',
    memory_scope: 'instance',
  },
};

// ═══════════════════════════════════════════
// Provisioning
// ═══════════════════════════════════════════

/** Provision a new GPO instance with defaults */
export function provisionInstance(req: ProvisioningRequest): ProvisioningResult {
  const errors: string[] = [];
  const warnings: string[] = [];
  const plan = plansMod.getPlan(req.plan);

  // Validate
  if (!req.instance_name || req.instance_name.length < 2) {
    errors.push('Instance name must be at least 2 characters');
  }
  if (!req.operator_name || req.operator_name.length < 1) {
    errors.push('Operator name is required');
  }

  // Determine missions
  const missions = req.missions || ['general'];
  if (missions.length > plan.limits.max_missions) {
    warnings.push(`Plan "${plan.name}" allows ${plan.limits.max_missions} missions; ${missions.length} requested — will be limited`);
    missions.length = plan.limits.max_missions;
  }

  // Determine capabilities
  const capabilities = req.capabilities || [...plan.allowed_capabilities];
  const disallowed = capabilities.filter(c => !plansMod.isCapabilityAllowed(req.plan, c));
  if (disallowed.length) {
    warnings.push(`Capabilities not allowed on "${plan.name}" plan: ${disallowed.join(', ')}`);
  }
  const validCapabilities = capabilities.filter(c => plansMod.isCapabilityAllowed(req.plan, c));

  // Privacy preset
  const privacyPreset = PRIVACY_PRESETS[req.privacy_preset || 'balanced'] || PRIVACY_PRESETS['balanced'];
  const policy: PrivacyPolicy = {
    local_only: privacyPreset.local_only || false,
    allowed_providers: (privacyPreset.allowed_providers || ['claude']) as Provider[],
    mission_isolation: (privacyPreset.mission_isolation || []) as Domain[],
    log_redaction_patterns: privacyPreset.log_redaction_patterns || [],
    sensitive_fields: privacyPreset.sensitive_fields || [],
    allow_export: privacyPreset.allow_export !== false,
    allow_import: privacyPreset.allow_import !== false,
    secret_scope: (privacyPreset.secret_scope as PrivacyPolicy['secret_scope']) || 'env',
    memory_scope: 'instance',
  };

  if (errors.length) {
    return { success: false, instance: null, errors, warnings };
  }

  const instanceId = req.instance_name.toLowerCase().replace(/[^a-z0-9]/g, '') || 'gpo';

  const instance: GPOInstance = {
    instance_id: instanceId,
    instance_name: req.instance_name,
    operator_name: req.operator_name,
    enabled_missions: missions as Domain[],
    enabled_capabilities: validCapabilities,
    provider_settings: {
      claude: { enabled: true, mode: 'local' },
      openai: { enabled: plansMod.isProviderAllowed(req.plan, 'openai'), model: 'gpt-4o' },
      perplexity: { enabled: plansMod.isProviderAllowed(req.plan, 'perplexity'), model: 'sonar' },
      gemini: { enabled: plansMod.isProviderAllowed(req.plan, 'gemini'), model: 'gemini-2.5-flash-lite' },
    },
    repo_mappings: {} as GPOInstance['repo_mappings'],
    policy,
    budget: {
      geminiModel: 'gemini-2.5-flash-lite',
      geminibudgetLimit: plan.limits.max_cost_per_day_usd,
      warningThreshold: plan.limits.max_cost_per_day_usd * 0.8,
      disableAfterThreshold: true,
      builderTimeoutMinutes: Math.min(plan.limits.max_builder_minutes_per_day, 10),
    },
    notification_settings: {
      enabled: true,
      channels: ['dashboard'],
      notify_on: ['approval_needed', 'task_done', 'task_failed', 'builder_complete'],
    },
    local_settings: {
      storage_root: '',
      offline_capable: plan.deployment_modes.includes('offline'),
      auto_refresh_interval_ms: 3000,
      builder_timeout_minutes: 10,
      operator_mode_default: true,
    },
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  return { success: true, instance, errors: [], warnings };
}

// ═══════════════════════════════════════════
// Instance Health
// ═══════════════════════════════════════════

/** Run health checks on the current instance */
export function checkInstanceHealth(): InstanceHealth {
  const inst = instanceMod.getInstance();
  const checks: HealthCheck[] = [];

  // Check state directory
  const stateRoot = inst.local_settings.storage_root;
  if (stateRoot && fs.existsSync(stateRoot)) {
    checks.push({ name: 'storage', status: 'pass', detail: 'State directory accessible' });
  } else {
    checks.push({ name: 'storage', status: 'warn', detail: 'State directory not found' });
  }

  // Check required fields
  if (inst.instance_id && inst.operator_name) {
    checks.push({ name: 'identity', status: 'pass', detail: `${inst.instance_name} (${inst.operator_name})` });
  } else {
    checks.push({ name: 'identity', status: 'fail', detail: 'Missing instance_id or operator_name' });
  }

  // Check plan assignment
  const plan = plansMod.getPlan((inst as GPOInstance & { plan?: PlanTier }).plan || 'pro');
  checks.push({ name: 'plan', status: 'pass', detail: `${plan.name} plan` });

  // Check capabilities vs plan
  const disallowedCaps = inst.enabled_capabilities.filter(c => !plansMod.isCapabilityAllowed(plan.id, c));
  if (disallowedCaps.length) {
    checks.push({ name: 'capabilities', status: 'warn', detail: `${disallowedCaps.length} capabilities exceed plan` });
  } else {
    checks.push({ name: 'capabilities', status: 'pass', detail: `${inst.enabled_capabilities.length} capabilities enabled` });
  }

  // Check privacy
  if (inst.policy) {
    checks.push({ name: 'privacy', status: 'pass', detail: `${inst.policy.allowed_providers.length} providers allowed, redaction active` });
  } else {
    checks.push({ name: 'privacy', status: 'fail', detail: 'No privacy policy configured' });
  }

  // Check providers
  let providersReady = 0;
  const providerKeys: Record<string, string | undefined> = {
    openai: process.env.OPENAI_API_KEY,
    perplexity: process.env.PERPLEXITY_API_KEY,
    gemini: process.env.GEMINI_API_KEY,
  };
  for (const [prov, key] of Object.entries(providerKeys)) {
    if (inst.provider_settings[prov]?.enabled) {
      if (key && key !== 'your_key_here' && key.length > 10) {
        providersReady++;
      } else {
        checks.push({ name: `provider-${prov}`, status: 'warn', detail: `${prov} enabled but key missing/placeholder` });
      }
    }
  }
  providersReady++; // Claude is always local
  checks.push({ name: 'providers', status: providersReady >= 2 ? 'pass' : 'warn', detail: `${providersReady} providers ready` });

  // Get blocker count
  let blockerCount = 0;
  try {
    const autonomy = require('./autonomy') as { getAllBlockers(): unknown[] };
    blockerCount = autonomy.getAllBlockers().length;
  } catch { /* ignore */ }

  // Get active loops
  let loopsActive = 0;
  try {
    const loops = require('./loops') as { getLoopSummaries(): Array<{ health: string }> };
    loopsActive = loops.getLoopSummaries().filter(l => l.health === 'active').length;
  } catch { /* ignore */ }

  // Calculate storage size
  let storageMb = 0;
  if (stateRoot && fs.existsSync(stateRoot)) {
    try {
      const files = fs.readdirSync(stateRoot);
      for (const f of files) {
        try { storageMb += fs.statSync(path.join(stateRoot, f)).size; } catch { /* skip */ }
      }
      storageMb = Math.round(storageMb / 1024 / 1024 * 100) / 100;
    } catch { /* ignore */ }
  }

  const hasFail = checks.some(c => c.status === 'fail');
  const hasWarn = checks.some(c => c.status === 'warn');

  return {
    instance_id: inst.instance_id,
    status: hasFail ? 'error' : hasWarn ? 'degraded' : 'healthy',
    checks,
    plan: plan.id,
    missions_active: inst.enabled_missions.length,
    providers_ready: providersReady,
    blockers: blockerCount,
    storage_mb: storageMb,
  };
}

// ═══════════════════════════════════════════
// Admin Summary
// ═══════════════════════════════════════════

/** Build a complete product admin summary for the settings surface */
export function getAdminSummary(): ProductAdminSummary {
  const inst = instanceMod.getInstance();
  const plan = plansMod.getPlan((inst as GPOInstance & { plan?: PlanTier }).plan || 'pro');

  // Capabilities
  let allCaps: Array<{ id: string; name: string }> = [];
  try {
    const capsMod = require('./capabilities') as { getAllCapabilities(): Array<{ id: string; name: string }> };
    allCaps = capsMod.getAllCapabilities();
  } catch { /* ignore */ }

  const capabilities = allCaps.map(c => ({
    id: c.id, name: c.name,
    enabled: inst.enabled_capabilities.includes(c.id),
    allowed: plansMod.isCapabilityAllowed(plan.id, c.id),
  }));

  // Missions
  let allMissions: Array<{ domain: Domain; name: string }> = [];
  try {
    const missionsMod = require('./missions') as { getAllMissions(): Array<{ domain: Domain; name: string }> };
    allMissions = missionsMod.getAllMissions();
  } catch { /* ignore */ }

  const missions = allMissions.map(m => ({
    domain: m.domain, name: m.name,
    enabled: inst.enabled_missions.includes(m.domain),
    allowed: true,
  }));

  // Providers
  const providers = (['claude', 'openai', 'perplexity', 'gemini'] as Provider[]).map(p => ({
    id: p,
    enabled: inst.provider_settings[p]?.enabled || false,
    allowed: plansMod.isProviderAllowed(plan.id, p),
    status: p === 'claude' ? 'local' : (inst.provider_settings[p]?.enabled ? 'configured' : 'disabled'),
  }));

  // Autonomy stats
  let loopsActive = 0, loopsBlocked = 0, totalBlockers = 0;
  try {
    const loops = require('./loops') as { getLoopSummaries(): Array<{ health: string }> };
    const sums = loops.getLoopSummaries();
    loopsActive = sums.filter(l => l.health === 'active').length;
    loopsBlocked = sums.filter(l => l.health === 'blocked').length;
  } catch { /* ignore */ }
  try {
    const autonomy = require('./autonomy') as { getAllBlockers(): unknown[] };
    totalBlockers = autonomy.getAllBlockers().length;
  } catch { /* ignore */ }

  return {
    instance_id: inst.instance_id,
    instance_name: inst.instance_name,
    operator_name: inst.operator_name,
    plan,
    capabilities,
    missions,
    providers,
    privacy: {
      local_only: inst.policy.local_only,
      isolated_missions: inst.policy.mission_isolation as Domain[],
      redaction_active: (inst.policy.log_redaction_patterns || []).length > 0,
      export_allowed: inst.policy.allow_export,
      secret_scope: inst.policy.secret_scope,
    },
    budget: inst.budget,
    autonomy: { loops_active: loopsActive, loops_blocked: loopsBlocked, total_blockers: totalBlockers },
    storage: {
      root: inst.local_settings.storage_root,
      offline_capable: inst.local_settings.offline_capable,
    },
  };
}

// ═══════════════════════════════════════════
// Instance Export / Import
// ═══════════════════════════════════════════

/** Export instance config (privacy-safe — strips redaction patterns and secrets) */
export function exportInstance(): InstanceExport {
  const inst = instanceMod.getInstance();

  // Strip sensitive parts of policy
  const safePolicy = { ...inst.policy };
  delete (safePolicy as Record<string, unknown>).log_redaction_patterns;

  const safeInst = { ...inst, policy: safePolicy };

  // Get context summary (not full context)
  let contextSummary: Record<string, unknown> = {};
  try {
    const ctx = require('./context') as { getOperatorProfile(): Record<string, unknown> };
    contextSummary = { operator: ctx.getOperatorProfile() };
  } catch { /* ignore */ }

  // Get loop state
  let loopState: Record<string, unknown> = {};
  try {
    const loopsPath = path.resolve(__dirname, '..', '..', 'state', 'loops.json');
    if (fs.existsSync(loopsPath)) {
      loopState = JSON.parse(fs.readFileSync(loopsPath, 'utf-8'));
    }
  } catch { /* ignore */ }

  return {
    version: '1.0',
    exported_at: new Date().toISOString(),
    instance: safeInst as InstanceExport['instance'],
    context_summary: contextSummary,
    loop_state: loopState,
  };
}

/** Validate an instance export before import */
export function validateImport(data: unknown): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  if (!data || typeof data !== 'object') return { valid: false, errors: ['Not an object'] };
  const d = data as Record<string, unknown>;
  if (!d.version) errors.push('Missing version');
  if (!d.instance || typeof d.instance !== 'object') errors.push('Missing instance data');
  const inst = d.instance as Record<string, unknown>;
  if (inst && !inst.instance_id) errors.push('Missing instance_id');
  if (inst && !inst.operator_name) errors.push('Missing operator_name');
  return { valid: errors.length === 0, errors };
}

module.exports = {
  provisionInstance,
  checkInstanceHealth,
  getAdminSummary,
  exportInstance,
  validateImport,
  PRIVACY_PRESETS: Object.keys(PRIVACY_PRESETS),
};
