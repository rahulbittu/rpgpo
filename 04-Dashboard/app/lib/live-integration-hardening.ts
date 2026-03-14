// GPO Live Integration Hardening — Track which capabilities are truly consumed in runtime

import type { LiveIntegrationStatus } from './types';

/** Get live integration status for all areas */
export function getStatus(area?: string): LiveIntegrationStatus[] {
  const statuses: LiveIntegrationStatus[] = [
    // Consumed in runtime (Part 47 confirmed real state changes)
    { area: 'runtime_activation', state: 'consumed_runtime', detail: 'Capability activation creates real provider fits and policies (Part 47)' },
    { area: 'template_binding', state: 'consumed_runtime', detail: 'Template binding creates real provider fits and governance policies (Part 47)' },
    { area: 'extension_permissions', state: 'enforced', detail: 'Extension permissions evaluated with trust-based gating (Part 47)' },
    { area: 'tenant_isolation', state: 'enforced', detail: 'Cross-tenant access denied by default (Part 46)' },
    { area: 'api_entitlements', state: 'enforced', detail: '12 protected routes with plan-based gating (Part 46)' },
    { area: 'boundary_enforcement', state: 'enforced', detail: 'Cross-scope boundaries block/redact at evaluation level (Part 46)' },
    { area: 'runtime_enforcement_graph', state: 'consumed_runtime', detail: 'Graph/node transitions call runtime enforcement (Part 27)' },
    { area: 'telemetry_auto_emit', state: 'consumed_runtime', detail: '8/15 flows auto-emit telemetry events (Part 45)' },

    // Enforced (evaluation exists but not yet middleware-level)
    { area: 'entitlement_middleware', state: 'evaluated', detail: 'Entitlement evaluation exists but HTTP responses not yet intercepted' },
    { area: 'boundary_payload_redaction', state: 'evaluated', detail: 'Boundary decisions evaluate but response fields not yet actually redacted' },
    { area: 'provider_gov_in_releases', state: 'evaluated', detail: 'Provider governance evaluated but not yet consumed by release pipeline' },

    // Design only
    { area: 'worker_governance_enforcement', state: 'design_only', detail: 'Worker governance evaluates but worker.js does not call it' },
    { area: 'per_tenant_storage', state: 'design_only', detail: 'All tenants share ./state directory' },
    { area: 'secret_auto_rotation', state: 'design_only', detail: 'Rotation policies defined but no auto-rotation mechanism' },
  ];

  return area ? statuses.filter(s => s.area === area) : statuses;
}

/** Summary counts */
export function getSummary(): { consumed: number; enforced: number; evaluated: number; design_only: number; total: number } {
  const all = getStatus();
  return {
    consumed: all.filter(s => s.state === 'consumed_runtime').length,
    enforced: all.filter(s => s.state === 'enforced').length,
    evaluated: all.filter(s => s.state === 'evaluated').length,
    design_only: all.filter(s => s.state === 'design_only').length,
    total: all.length,
  };
}

module.exports = { getStatus, getSummary };
