// GPO Mutation Refresh — Define refresh plans for post-mutation UI updates

import type { MutationRefreshResult } from './types';

/** Define refresh plans per area */
const REFRESH_PLANS: Record<string, string[]> = {
  approvals: ['/api/approval-workspace'],
  overrides: ['/api/override-ops', '/api/overrides/pending'],
  escalation: ['/api/escalation-inbox'],
  releases: ['/api/release-workspace-summary', '/api/release-orchestration'],
  governance: ['/api/governance-ops', '/api/runtime-enforcement', '/api/governance-health'],
  admin: ['/api/tenant-admin', '/api/subscription-operations', '/api/deployment-readiness/run'],
  productization: ['/api/skill-packs', '/api/engine-templates', '/api/marketplace', '/api/extensions', '/api/integrations'],
  audit: ['/api/audit-hub', '/api/policy-history'],
};

/** Get refresh plan for an area */
export function getRefreshPlan(area: string): string[] {
  return REFRESH_PLANS[area] || [];
}

/** Record a refresh execution */
export function recordRefresh(area: string): MutationRefreshResult {
  return {
    area,
    panels_refreshed: (REFRESH_PLANS[area] || []).length,
    apis_called: REFRESH_PLANS[area] || [],
    created_at: new Date().toISOString(),
  };
}

/** Get all refresh plans */
export function getAllPlans(): Record<string, string[]> {
  return REFRESH_PLANS;
}

module.exports = { getRefreshPlan, recordRefresh, getAllPlans };
