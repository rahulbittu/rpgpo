"use strict";
// GPO Navigation Consistency — Map and audit navigation paths
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMap = getMap;
exports.getGaps = getGaps;
/** Build the full navigation map */
function getMap() {
    return [
        { tab: 'home', panels: ['chiefOfStaffPanel', 'needsRahulHero', 'currentTaskFocus'], drilldowns: ['task_detail'], actions: ['deliberate', 'approve_plan'], reachable: true },
        { tab: 'intake', panels: ['intakeFormCard', 'intakeDetailPanel', 'executionGraphPanel'], drilldowns: ['task_detail', 'execution_graph'], actions: ['submit_task', 'deliberate', 'create_graph'], reachable: true },
        { tab: 'missions', panels: ['missionStatementsPanel', 'missionSnapshotGrid'], drilldowns: ['mission_detail'], actions: ['edit_mission_statement'], reachable: true },
        { tab: 'memory', panels: ['memoryViewerPanel'], drilldowns: ['document_detail'], actions: ['search', 'expand'], reachable: true },
        { tab: 'dossiers', panels: ['dossiersPanel'], drilldowns: ['dossier_detail'], actions: ['promote', 'simulate'], reachable: true },
        { tab: 'providers', panels: ['providersPanel', 'provGovSummary'], drilldowns: ['provider_detail'], actions: [], reachable: true },
        { tab: 'governance', panels: ['govOpsCards', 'runtimeSummarySlot', 'overrideOpsSlot', 'isolationPatternSlot', 'traceabilitySlot', 'govHealthPanel', 'governancePanel'], drilldowns: ['governance_detail', 'override_detail', 'runtime_block'], actions: ['approve_gate', 'approve_tuning', 'approve_override'], reachable: true },
        { tab: 'audit', panels: ['auditHubPanel', 'policyHistoryPanel'], drilldowns: ['audit_item', 'evidence_chain'], actions: ['approve', 'reject', 'triage', 'resolve'], reachable: true },
        { tab: 'releases', panels: ['releaseWorkspacePanel'], drilldowns: ['release_plan', 'release_execution'], actions: ['approve_plan', 'execute', 'verify'], reachable: true },
        { tab: 'admin', panels: ['adminPanel', 'deploymentReadinessPanel', 'securityPanel'], drilldowns: ['tenant_detail', 'skill_pack', 'template', 'extension', 'integration'], actions: ['deploy_readiness'], reachable: true },
        { tab: 'topranker', panels: ['topranker_content'], drilldowns: ['topranker_detail'], actions: [], reachable: true },
        { tab: 'approvals', panels: ['globalApprovalInbox'], drilldowns: ['subtask_detail'], actions: ['approve_subtask', 'reject', 'revise'], reachable: true },
        { tab: 'costs', panels: ['cost_content'], drilldowns: [], actions: [], reachable: true },
        { tab: 'logs', panels: ['log_content'], drilldowns: [], actions: [], reachable: true },
        { tab: 'controls', panels: ['control_content'], drilldowns: [], actions: [], reachable: true },
        { tab: 'settings', panels: ['settings_content'], drilldowns: [], actions: [], reachable: true },
        { tab: 'channels', panels: ['channel_content'], drilldowns: [], actions: ['send_prompt'], reachable: true },
        { tab: 'tasks', panels: ['task_list'], drilldowns: ['task_detail'], actions: [], reachable: true },
    ];
}
/** Identify navigation gaps */
function getGaps() {
    return [
        { feature: 'Evidence chain drilldown', expected_tab: 'audit', issue: 'Audit shows items but no click-to-drilldown to evidence chain', fix: 'Add evidence chain inline expansion or modal' },
        { feature: 'Runtime block detail', expected_tab: 'governance', issue: 'Runtime summary shows aggregate but no per-block detail', fix: 'Add expandable block list with resolution actions' },
        { feature: 'Collaboration session detail', expected_tab: 'releases', issue: 'Sessions show as list items but no detail expansion', fix: 'Add session detail with proposals/votes/dissent' },
        { feature: 'Skill pack bind action', expected_tab: 'admin', issue: 'Skill packs listed but no bind button', fix: 'Add bind action with scope selector' },
        { feature: 'Extension install action', expected_tab: 'admin', issue: 'Extensions listed but no install button', fix: 'Add install button with tenant scope' },
    ];
}
module.exports = { getMap, getGaps };
//# sourceMappingURL=navigation-consistency.js.map