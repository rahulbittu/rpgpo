"use strict";
// GPO Targeted Refresh — Replace location.reload() with panel-specific re-fetch
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPlans = getPlans;
exports.getPlanForArea = getPlanForArea;
exports.getRefreshCode = getRefreshCode;
/** Define targeted refresh plans per area */
function getPlans() {
    return [
        { area: 'approvals', trigger_actions: ['approve', 'reject', 'request_evidence'], refresh_endpoints: ['/api/approval-workspace'], panel_selectors: ['#auditHubPanel'] },
        { area: 'escalation', trigger_actions: ['triage', 'resolve', 'delegate', 'dismiss'], refresh_endpoints: ['/api/escalation-inbox'], panel_selectors: ['#auditHubPanel'] },
        { area: 'overrides', trigger_actions: ['approve_override', 'reject_override', 'consume'], refresh_endpoints: ['/api/override-ops', '/api/overrides/pending'], panel_selectors: ['#overrideOpsSlot'] },
        { area: 'releases', trigger_actions: ['approve_plan', 'execute', 'verify', 'halt'], refresh_endpoints: ['/api/release-workspace-summary', '/api/release-orchestration'], panel_selectors: ['#releaseWorkspacePanel'] },
        { area: 'rollback', trigger_actions: ['create_rollback', 'execute_rollback'], refresh_endpoints: ['/api/rollback-control/project/default'], panel_selectors: ['#releaseWorkspacePanel'] },
        { area: 'governance', trigger_actions: ['approve_gate', 'approve_tuning', 'resolve_block'], refresh_endpoints: ['/api/governance-ops', '/api/governance-health'], panel_selectors: ['#govHealthPanel', '#governancePanel'] },
        { area: 'admin', trigger_actions: ['update_tenant', 'deploy_readiness'], refresh_endpoints: ['/api/tenant-admin', '/api/deployment-readiness/run'], panel_selectors: ['#adminPanel', '#deploymentReadinessPanel'] },
        { area: 'productization', trigger_actions: ['bind_pack', 'instantiate_template', 'install_extension', 'review_listing'], refresh_endpoints: ['/api/skill-packs', '/api/engine-templates', '/api/marketplace', '/api/extensions', '/api/integrations'], panel_selectors: ['#securityPanel'] },
    ];
}
/** Get plan for a specific area */
function getPlanForArea(area) {
    return getPlans().find(p => p.area === area) || null;
}
/** Generate JS code for targeted refresh */
function getRefreshCode(area) {
    const plan = getPlanForArea(area);
    if (!plan)
        return 'location.reload()';
    const fetches = plan.refresh_endpoints.map(ep => `fetch('${ep}').then(r=>r.json())`).join(',');
    return `Promise.all([${fetches}]).then(()=>{${plan.panel_selectors.map(s => `document.querySelector('${s}')&&switchTab(document.querySelector('[data-tab].active')?.dataset?.tab||'home')`).join(';')}}).catch(()=>location.reload())`;
}
module.exports = { getPlans, getPlanForArea, getRefreshCode };
//# sourceMappingURL=targeted-refresh.js.map