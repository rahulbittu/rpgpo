// GPO Operator Actions — Define actionable controls for each area

import type { OperatorActionDefinition } from './types';

/** Get all defined operator actions */
export function getActions(area?: string): OperatorActionDefinition[] {
  const actions: OperatorActionDefinition[] = [
    // Approvals
    { action_id: 'act_approve', area: 'approvals', label: 'Approve', api_endpoint: '/api/approval-workspace/:id/approve', method: 'POST', requires_input: false, visible_in_ui: true },
    { action_id: 'act_reject', area: 'approvals', label: 'Reject', api_endpoint: '/api/approval-workspace/:id/reject', method: 'POST', requires_input: true, visible_in_ui: true },
    { action_id: 'act_req_evidence', area: 'approvals', label: 'Request Evidence', api_endpoint: '/api/approval-workspace/:id/request-evidence', method: 'POST', requires_input: false, visible_in_ui: true },

    // Overrides
    { action_id: 'act_approve_ovr', area: 'overrides', label: 'Approve Override', api_endpoint: '/api/overrides/:id/approve', method: 'POST', requires_input: false, visible_in_ui: true },
    { action_id: 'act_reject_ovr', area: 'overrides', label: 'Reject Override', api_endpoint: '/api/overrides/:id/reject', method: 'POST', requires_input: false, visible_in_ui: true },
    { action_id: 'act_consume_ovr', area: 'overrides', label: 'Consume Override', api_endpoint: '/api/overrides/:id/consume', method: 'POST', requires_input: true, visible_in_ui: false },

    // Escalation
    { action_id: 'act_triage', area: 'escalation', label: 'Triage', api_endpoint: '/api/escalation-inbox/:id/triage', method: 'POST', requires_input: true, visible_in_ui: false },
    { action_id: 'act_resolve_esc', area: 'escalation', label: 'Resolve', api_endpoint: '/api/escalation-inbox/:id/resolve', method: 'POST', requires_input: true, visible_in_ui: false },

    // Releases
    { action_id: 'act_approve_rel', area: 'releases', label: 'Approve Plan', api_endpoint: '/api/release-orchestration/:id/approve', method: 'POST', requires_input: false, visible_in_ui: false },
    { action_id: 'act_execute_rel', area: 'releases', label: 'Execute Release', api_endpoint: '/api/release-orchestration/:id/execute', method: 'POST', requires_input: false, visible_in_ui: false },
    { action_id: 'act_verify_rel', area: 'releases', label: 'Verify Release', api_endpoint: '/api/release-orchestration/:id/verify', method: 'POST', requires_input: true, visible_in_ui: false },
    { action_id: 'act_rollback', area: 'releases', label: 'Create Rollback', api_endpoint: '/api/rollback-control/plan', method: 'POST', requires_input: true, visible_in_ui: false },

    // Governance
    { action_id: 'act_approve_gate', area: 'governance', label: 'Approve Gate', api_endpoint: '/api/approval-gates/:id/approve', method: 'POST', requires_input: false, visible_in_ui: true },
    { action_id: 'act_resolve_block', area: 'governance', label: 'Resolve Block', api_endpoint: '/api/block-resolutions/:id/resolve', method: 'POST', requires_input: true, visible_in_ui: false },

    // Tuning
    { action_id: 'act_approve_tuning', area: 'governance', label: 'Approve Tuning', api_endpoint: '/api/policy-tuning/recommendations/:id/approve', method: 'POST', requires_input: false, visible_in_ui: true },

    // Skill Packs / Templates
    { action_id: 'act_bind_pack', area: 'productization', label: 'Bind Skill Pack', api_endpoint: '/api/skill-packs/:id/bind', method: 'POST', requires_input: true, visible_in_ui: false },
    { action_id: 'act_instantiate', area: 'productization', label: 'Instantiate Template', api_endpoint: '/api/engine-templates/:id/instantiate', method: 'POST', requires_input: true, visible_in_ui: false },

    // Marketplace
    { action_id: 'act_install_ext', area: 'productization', label: 'Install Extension', api_endpoint: '/api/extensions/:id/install', method: 'POST', requires_input: false, visible_in_ui: false },
    { action_id: 'act_review_listing', area: 'productization', label: 'Review Listing', api_endpoint: '/api/marketplace/:id/review', method: 'POST', requires_input: true, visible_in_ui: false },

    // Audit
    { action_id: 'act_build_package', area: 'audit', label: 'Build Audit Package', api_endpoint: '/api/audit-packages/:type/:id', method: 'GET', requires_input: false, visible_in_ui: false },
    { action_id: 'act_export', area: 'audit', label: 'Export Compliance', api_endpoint: '/api/compliance-export', method: 'POST', requires_input: true, visible_in_ui: false },
  ];

  return area ? actions.filter(a => a.area === area) : actions;
}

/** Summary of action visibility */
export function getActionSummary(): { total: number; visible: number; hidden: number; by_area: Record<string, { total: number; visible: number }> } {
  const actions = getActions();
  const visible = actions.filter(a => a.visible_in_ui).length;
  const byArea: Record<string, { total: number; visible: number }> = {};
  for (const a of actions) {
    if (!byArea[a.area]) byArea[a.area] = { total: 0, visible: 0 };
    byArea[a.area].total++;
    if (a.visible_in_ui) byArea[a.area].visible++;
  }
  return { total: actions.length, visible, hidden: actions.length - visible, by_area: byArea };
}

module.exports = { getActions, getActionSummary };
