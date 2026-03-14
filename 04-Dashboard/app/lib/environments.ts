// GPO Environment Lanes — dev / beta / prod
// Each environment has isolated state, config, and promotion lifecycle.
// Promotion is explicit and approval-gated. Never auto-promotes.

import type {
  Environment, EnvironmentConfig, EnvironmentStatus,
  PromotionRequest, PromotionResult, GPOInstance,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const ENV_FILE = path.resolve(__dirname, '..', '..', 'state', 'environments.json');
const STATE_ROOT = path.resolve(__dirname, '..', '..', 'state');

function readEnvs(): Record<string, EnvironmentConfig> {
  try {
    if (!fs.existsSync(ENV_FILE)) return {};
    return JSON.parse(fs.readFileSync(ENV_FILE, 'utf-8'));
  } catch { return {}; }
}

function writeEnvs(envs: Record<string, EnvironmentConfig>): void {
  const dir = path.dirname(ENV_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(ENV_FILE, JSON.stringify(envs, null, 2));
}

// ═══════════════════════════════════════════
// Bootstrap — ensure default environments exist
// ═══════════════════════════════════════════

function ensureDefaults(): void {
  const envs = readEnvs();
  let changed = false;

  if (!envs.dev) {
    envs.dev = {
      env: 'dev', instance_id: 'rpgpo', state_root: STATE_ROOT,
      active: true, release_version: '0.9.0-dev',
      config_overrides: {},
    };
    changed = true;
  }
  if (!envs.beta) {
    envs.beta = {
      env: 'beta', instance_id: 'rpgpo', state_root: path.join(STATE_ROOT, 'env-beta'),
      active: false, release_version: '0.0.0',
      config_overrides: {},
    };
    changed = true;
  }
  if (!envs.prod) {
    envs.prod = {
      env: 'prod', instance_id: 'rpgpo', state_root: path.join(STATE_ROOT, 'env-prod'),
      active: false, release_version: '0.0.0',
      config_overrides: {},
    };
    changed = true;
  }
  if (changed) writeEnvs(envs);
}

ensureDefaults();

// ═══════════════════════════════════════════
// Environment Access
// ═══════════════════════════════════════════

/** Get current active environment */
export function getCurrentEnv(): Environment {
  const envs = readEnvs();
  for (const [key, cfg] of Object.entries(envs)) {
    if (cfg.active) return key as Environment;
  }
  return 'dev';
}

/** Get environment config */
export function getEnvConfig(env: Environment): EnvironmentConfig | null {
  return readEnvs()[env] || null;
}

/** Get all environment statuses */
export function getAllEnvStatuses(): EnvironmentStatus[] {
  const envs = readEnvs();
  return (['dev', 'beta', 'prod'] as Environment[]).map(env => {
    const cfg = envs[env];
    return {
      env,
      active: cfg?.active || false,
      release_version: cfg?.release_version || '0.0.0',
      last_promoted: cfg?.promoted_at || null,
      state_root: cfg?.state_root || '',
      instance_id: cfg?.instance_id || 'rpgpo',
    };
  });
}

/** Set the active environment */
export function setActiveEnv(env: Environment): void {
  const envs = readEnvs();
  for (const key of Object.keys(envs)) {
    envs[key].active = key === env;
  }
  writeEnvs(envs);
  console.log(`[environments] Active environment set to: ${env}`);
}

/** Update environment config */
export function updateEnvConfig(env: Environment, updates: Partial<EnvironmentConfig>): EnvironmentConfig {
  const envs = readEnvs();
  if (!envs[env]) {
    envs[env] = {
      env, instance_id: 'rpgpo', state_root: path.join(STATE_ROOT, `env-${env}`),
      active: false, config_overrides: {},
    };
  }
  Object.assign(envs[env], updates);
  writeEnvs(envs);
  return envs[env];
}

// ═══════════════════════════════════════════
// Promotion
// ═══════════════════════════════════════════

const PROMOTION_PATH: Record<Environment, Environment | null> = {
  dev: 'beta',
  beta: 'prod',
  prod: null,
};

/** Validate a promotion request */
export function validatePromotion(req: PromotionRequest): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (PROMOTION_PATH[req.from_env] !== req.to_env) {
    errors.push(`Cannot promote from ${req.from_env} to ${req.to_env}. Path is dev → beta → prod.`);
  }
  if (!req.release_version) errors.push('Release version is required');
  if (!req.release_notes) errors.push('Release notes are required');

  const envs = readEnvs();
  const fromCfg = envs[req.from_env];
  if (!fromCfg) errors.push(`Source environment "${req.from_env}" not configured`);

  return { valid: errors.length === 0, errors };
}

/** Execute a promotion (governed — always requires prior approval) */
export function promote(req: PromotionRequest): PromotionResult {
  const validation = validatePromotion(req);
  if (!validation.valid) {
    return {
      success: false, from_env: req.from_env, to_env: req.to_env,
      release_version: req.release_version, errors: validation.errors, warnings: [],
    };
  }

  const envs = readEnvs();
  const warnings: string[] = [];

  // Create target env state directory if needed
  const targetRoot = envs[req.to_env]?.state_root || path.join(STATE_ROOT, `env-${req.to_env}`);
  if (!fs.existsSync(targetRoot)) {
    fs.mkdirSync(targetRoot, { recursive: true });
    warnings.push(`Created state directory: ${targetRoot}`);
  }

  // Update target environment
  envs[req.to_env] = {
    ...envs[req.to_env],
    env: req.to_env,
    instance_id: envs[req.from_env]?.instance_id || 'rpgpo',
    state_root: targetRoot,
    active: false,
    promoted_from: req.from_env,
    promoted_at: new Date().toISOString(),
    release_version: req.release_version,
    release_notes: req.release_notes,
    config_overrides: envs[req.to_env]?.config_overrides || {},
  };

  writeEnvs(envs);

  console.log(`[environments] Promoted ${req.from_env} → ${req.to_env} (v${req.release_version})`);

  return {
    success: true, from_env: req.from_env, to_env: req.to_env,
    release_version: req.release_version, errors: [], warnings,
    promoted_at: envs[req.to_env].promoted_at,
  };
}

/** Get what changed between two environments */
export function getChangesBetween(from: Environment, to: Environment): string[] {
  const envs = readEnvs();
  const fromVersion = envs[from]?.release_version || '0.0.0';
  const toVersion = envs[to]?.release_version || '0.0.0';

  // In a full implementation, this would diff git tags or state snapshots.
  // For now, return metadata about the version gap.
  return [
    `From: ${from} v${fromVersion}`,
    `To: ${to} v${toVersion}`,
    `Promoted at: ${envs[to]?.promoted_at || 'never'}`,
  ];
}

module.exports = {
  getCurrentEnv, getEnvConfig, getAllEnvStatuses, setActiveEnv, updateEnvConfig,
  validatePromotion, promote, getChangesBetween,
};
