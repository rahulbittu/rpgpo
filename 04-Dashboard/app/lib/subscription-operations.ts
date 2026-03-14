// GPO Subscription Operations — Entitlements, usage metering, billing events

import type { SubscriptionRecord, SubscriptionEntitlement, UsageMeter, BillingEvent, TenantPlanTier } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const SUBS_FILE = path.resolve(__dirname, '..', '..', 'state', 'subscriptions.json');
const METERS_FILE = path.resolve(__dirname, '..', '..', 'state', 'usage-meters.json');
const BILLING_FILE = path.resolve(__dirname, '..', '..', 'state', 'billing-events.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

const PLAN_ENTITLEMENTS: Record<TenantPlanTier, string[]> = {
  personal: ['governance', 'memory_viewer', 'approval_workspace'],
  pro: ['governance', 'audit', 'memory_viewer', 'approval_workspace', 'collaboration', 'release', 'provider_governance', 'pattern_exchange'],
  team: ['governance', 'audit', 'compliance', 'memory_viewer', 'approval_workspace', 'collaboration', 'release', 'provider_governance', 'pattern_exchange', 'tenant_admin'],
  enterprise: ['governance', 'audit', 'compliance', 'memory_viewer', 'approval_workspace', 'collaboration', 'release', 'provider_governance', 'pattern_exchange', 'tenant_admin'],
};

export function getSubscription(tenantId: string): SubscriptionRecord | null {
  return readJson<SubscriptionRecord[]>(SUBS_FILE, []).find(s => s.tenant_id === tenantId) || null;
}

export function evaluateEntitlements(tenantId: string, features: string[]): SubscriptionEntitlement[] {
  let plan: TenantPlanTier = 'pro';
  try { const ta = require('./tenant-admin') as { getTenant(id: string): { plan: TenantPlanTier } | null }; const t = ta.getTenant(tenantId); if (t) plan = t.plan; } catch { /* */ }
  const entitled = PLAN_ENTITLEMENTS[plan] || [];
  return features.map(f => ({ feature: f, entitled: entitled.includes(f) }));
}

export function recordUsage(tenantId: string, meterType: string, amount: number): UsageMeter {
  const meters = readJson<UsageMeter[]>(METERS_FILE, []);
  const m: UsageMeter = { meter_id: uid('um'), tenant_id: tenantId, meter_type: meterType, amount, period: new Date().toISOString().slice(0, 7), created_at: new Date().toISOString() };
  meters.unshift(m);
  if (meters.length > 500) meters.length = 500;
  writeJson(METERS_FILE, meters);
  return m;
}

export function getUsageMeters(tenantId: string): UsageMeter[] {
  return readJson<UsageMeter[]>(METERS_FILE, []).filter(m => m.tenant_id === tenantId);
}

export function recordBillingEvent(tenantId: string, eventType: BillingEvent['event_type'], amount: number, detail: string): BillingEvent {
  const events = readJson<BillingEvent[]>(BILLING_FILE, []);
  const e: BillingEvent = { event_id: uid('be'), tenant_id: tenantId, event_type: eventType, amount, detail, created_at: new Date().toISOString() };
  events.unshift(e);
  if (events.length > 500) events.length = 500;
  writeJson(BILLING_FILE, events);
  return e;
}

export function getBillingEvents(tenantId: string): BillingEvent[] {
  return readJson<BillingEvent[]>(BILLING_FILE, []).filter(e => e.tenant_id === tenantId);
}

module.exports = { getSubscription, evaluateEntitlements, recordUsage, getUsageMeters, recordBillingEvent, getBillingEvents };
