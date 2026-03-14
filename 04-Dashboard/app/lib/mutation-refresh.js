"use strict";
// GPO Mutation Refresh — Define refresh plans for post-mutation UI updates
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRefreshPlan = getRefreshPlan;
exports.recordRefresh = recordRefresh;
exports.getAllPlans = getAllPlans;
/** Define refresh plans per area */
const REFRESH_PLANS = {
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
function getRefreshPlan(area) {
    return REFRESH_PLANS[area] || [];
}
/** Record a refresh execution */
function recordRefresh(area) {
    return {
        area,
        panels_refreshed: (REFRESH_PLANS[area] || []).length,
        apis_called: REFRESH_PLANS[area] || [],
        created_at: new Date().toISOString(),
    };
}
/** Get all refresh plans */
function getAllPlans() {
    return REFRESH_PLANS;
}
module.exports = { getRefreshPlan, recordRefresh, getAllPlans };
//# sourceMappingURL=mutation-refresh.js.map