// GPO Tenant Admin — Multi-tenant administration layer

import type { TenantProfile, TenantPlanTier, TenantEnvironment, Domain, Lane } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const TENANTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tenants.json');

function uid(): string { return 'tn_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

const ALL_MODULES = ['governance', 'audit', 'compliance', 'collaboration', 'release', 'provider_governance', 'tenant_admin', 'pattern_exchange', 'approval_workspace', 'memory_viewer'];

function defaultTenant(): TenantProfile {
  return {
    tenant_id: 'rpgpo', name: "Rahul Pitta's GPO", plan: 'pro',
    enabled_engines: ['topranker', 'careeregine', 'founder2founder', 'wealthresearch', 'newsroom', 'screenwriting', 'music', 'personalops', 'general'] as Domain[],
    enabled_modules: ALL_MODULES,
    environment: { lanes_enabled: ['dev', 'beta', 'prod'] as Lane[], storage_root: './state', deployment_target: 'local', auto_refresh_interval_ms: 30000 },
    governance_defaults: { review_strictness: 'balanced', documentation_strictness: 'balanced' },
    isolation_state: 'strict',
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
}

function ensureDefault(): TenantProfile[] {
  let tenants = readJson<TenantProfile[]>(TENANTS_FILE, []);
  if (tenants.length === 0) { tenants = [defaultTenant()]; writeJson(TENANTS_FILE, tenants); }
  return tenants;
}

export function getTenant(tenantId: string): TenantProfile | null {
  return ensureDefault().find(t => t.tenant_id === tenantId) || null;
}

export function getAllTenants(): TenantProfile[] { return ensureDefault(); }

export function createTenant(opts: { name: string; plan?: TenantPlanTier }): TenantProfile {
  const tenants = ensureDefault();
  const t: TenantProfile = {
    ...defaultTenant(), tenant_id: uid(), name: opts.name,
    plan: opts.plan || 'personal', enabled_modules: opts.plan === 'enterprise' ? ALL_MODULES : ALL_MODULES.filter(m => !['tenant_admin', 'compliance'].includes(m)),
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  tenants.unshift(t);
  writeJson(TENANTS_FILE, tenants);
  return t;
}

export function updateTenant(tenantId: string, updates: Partial<TenantProfile>): TenantProfile | null {
  const tenants = ensureDefault();
  const idx = tenants.findIndex(t => t.tenant_id === tenantId);
  if (idx === -1) return null;
  Object.assign(tenants[idx], updates, { updated_at: new Date().toISOString() });
  writeJson(TENANTS_FILE, tenants);
  return tenants[idx];
}

export function isModuleEnabled(tenantId: string, module: string): boolean {
  const t = getTenant(tenantId);
  return t ? t.enabled_modules.includes(module) : false;
}

module.exports = { getTenant, getAllTenants, createTenant, updateTenant, isModuleEnabled };
