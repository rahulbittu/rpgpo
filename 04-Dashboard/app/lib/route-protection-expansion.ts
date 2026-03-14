// GPO Route Protection Expansion — Broad coverage beyond ship-critical routes

import type { ExpandedRouteBinding, RouteProtectionExpansionReport, SensitiveRouteCategory, ProtectionCoverageDelta } from './types';

function uid(): string { return 'rpe_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** All protected route bindings — ship-critical + expanded */
export function getExpandedBindings(): ExpandedRouteBinding[] {
  return [
    // Ship-critical (Part 55)
    { route: '/api/compliance-export', method: 'GET', guard_type: 'entitlement', category: 'ship_critical', status: 'fully_guarded' },
    { route: '/api/compliance-export', method: 'POST', guard_type: 'entitlement', category: 'ship_critical', status: 'fully_guarded' },
    { route: '/api/tenant-admin', method: 'GET', guard_type: 'isolation', category: 'ship_critical', status: 'fully_guarded' },
    { route: '/api/audit-hub', method: 'GET', guard_type: 'boundary', category: 'ship_critical', status: 'fully_guarded' },
    { route: '/api/release-orchestration', method: 'GET', guard_type: 'entitlement', category: 'ship_critical', status: 'fully_guarded' },
    { route: '/api/marketplace', method: 'GET', guard_type: 'extension', category: 'ship_critical', status: 'fully_guarded' },
    { route: '/api/enforcement-evidence', method: 'GET', guard_type: 'boundary', category: 'ship_critical', status: 'fully_guarded' },
    { route: '/api/release-provider-gating', method: 'GET', guard_type: 'provider', category: 'ship_critical', status: 'fully_guarded' },

    // Expanded sensitive (Part 56)
    { route: '/api/skill-packs', method: 'GET', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/skill-packs', method: 'POST', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/skill-packs/:id/bind', method: 'POST', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/engine-templates', method: 'GET', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/engine-templates', method: 'POST', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/engine-templates/:id/instantiate', method: 'POST', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/extensions', method: 'GET', guard_type: 'extension', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/extensions', method: 'POST', guard_type: 'extension', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/extensions/:id/install', method: 'POST', guard_type: 'extension', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/extensions/:id/uninstall', method: 'POST', guard_type: 'extension', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/integrations', method: 'GET', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/integrations', method: 'POST', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/security-hardening', method: 'GET', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },
    { route: '/api/observability', method: 'GET', guard_type: 'entitlement', category: 'sensitive_noncritical', status: 'fully_guarded' },

    // Low risk (operational, not gated)
    { route: '/api/data', method: 'GET', guard_type: 'none', category: 'low_risk', status: 'not_applicable' },
    { route: '/api/status', method: 'GET', guard_type: 'none', category: 'low_risk', status: 'not_applicable' },
    { route: '/api/events', method: 'GET', guard_type: 'none', category: 'low_risk', status: 'not_applicable' },
  ];
}

/** Get expansion report */
export function getExpansionReport(): RouteProtectionExpansionReport {
  const bindings = getExpandedBindings();
  const fullyGuarded = bindings.filter(b => b.status === 'fully_guarded').length;
  const partiallyGuarded = bindings.filter(b => b.status === 'partially_guarded').length;
  const notGuarded = bindings.filter(b => b.status === 'not_guarded').length;
  const total = bindings.length;
  const guardable = bindings.filter(b => b.status !== 'not_applicable').length;
  const coveragePercent = guardable > 0 ? Math.round((fullyGuarded / guardable) * 100) : 0;

  const categories: SensitiveRouteCategory[] = [
    { category: 'ship_critical', routes: bindings.filter(b => b.category === 'ship_critical').map(b => b.route), guard_coverage: 100 },
    { category: 'sensitive_noncritical', routes: [...new Set(bindings.filter(b => b.category === 'sensitive_noncritical').map(b => b.route))], guard_coverage: 100 },
    { category: 'low_risk', routes: bindings.filter(b => b.category === 'low_risk').map(b => b.route), guard_coverage: 0 },
  ];

  const delta: ProtectionCoverageDelta = { before: 8, after: fullyGuarded, new_guards: fullyGuarded - 8, detail: `Part 55: 8 guards → Part 56: ${fullyGuarded} guards (+${fullyGuarded - 8} new)` };

  return { report_id: uid(), bindings, fully_guarded: fullyGuarded, partially_guarded: partiallyGuarded, not_guarded: notGuarded, total, coverage_percent: coveragePercent, categories, delta, created_at: new Date().toISOString() };
}

/** Get bindings by category */
export function getByCategory(category: string): ExpandedRouteBinding[] {
  return getExpandedBindings().filter(b => b.category === category);
}

module.exports = { getExpandedBindings, getExpansionReport, getByCategory };
