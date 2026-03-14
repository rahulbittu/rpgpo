// GPO Tenant Isolation Runtime — Enforce real tenant/project isolation at query time

import type { TenantIsolationDecision } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tenant-isolation-decisions.json');

function uid(): string { return 'ti_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Evaluate tenant isolation */
export function evaluate(sourceTenant: string, targetTenant: string, action: string = 'read'): TenantIsolationDecision {
  let outcome: TenantIsolationDecision['outcome'] = 'deny';
  let reason = 'Cross-tenant access denied by default';

  if (sourceTenant === targetTenant) { outcome = 'allow'; reason = 'Same tenant'; }
  else if (!targetTenant || targetTenant === '*') { outcome = 'deny'; reason = 'Wildcard/missing tenant target denied'; }

  const decision: TenantIsolationDecision = { decision_id: uid(), source_tenant: sourceTenant, target_tenant: targetTenant, action, outcome, reason, created_at: new Date().toISOString() };
  const decisions = readJson<TenantIsolationDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 300) decisions.length = 300;
  writeJson(DECISIONS_FILE, decisions);

  // Emit telemetry for denials
  if (outcome === 'deny') {
    try { const tw = require('./telemetry-wiring') as { emitTelemetry(c: string, a: string, o: string): void }; tw.emitTelemetry('isolation', 'tenant_access_denied', 'blocked'); } catch { /* */ }
  }

  return decision;
}

/** Filter data array by tenant scope */
export function filterByTenant<T extends { tenant_id?: string }>(data: T[], tenantId: string): T[] {
  return data.filter(item => !item.tenant_id || item.tenant_id === tenantId);
}

/** Filter data by project scope */
export function filterByProject<T extends { project_id?: string }>(data: T[], projectId: string): T[] {
  return data.filter(item => !item.project_id || item.project_id === projectId);
}

export function getDecisions(tenantId?: string): TenantIsolationDecision[] {
  const all = readJson<TenantIsolationDecision[]>(DECISIONS_FILE, []);
  return tenantId ? all.filter(d => d.source_tenant === tenantId || d.target_tenant === tenantId) : all;
}

module.exports = { evaluate, filterByTenant, filterByProject, getDecisions };
