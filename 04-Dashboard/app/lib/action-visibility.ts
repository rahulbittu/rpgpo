// GPO Action Visibility — Track which operator actions are visible with full UI state

import type { VisibleOperatorAction, ActionVisibilityGap } from './types';

/** Get all operator actions with visibility state (Part 43 enhanced) */
export function getVisibleActions(area?: string): VisibleOperatorAction[] {
  const actions: VisibleOperatorAction[] = [
    // Approvals — fully activated
    { action_id: 'act_approve', area: 'approvals', label: 'Approve', api_endpoint: '/api/approval-workspace/:id/approve', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },
    { action_id: 'act_reject', area: 'approvals', label: 'Reject', api_endpoint: '/api/approval-workspace/:id/reject', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },
    { action_id: 'act_req_evidence', area: 'approvals', label: 'Request Evidence', api_endpoint: '/api/approval-workspace/:id/request-evidence', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },

    // Overrides — now visible (Part 43)
    { action_id: 'act_approve_ovr', area: 'overrides', label: 'Approve Override', api_endpoint: '/api/overrides/:id/approve', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },
    { action_id: 'act_reject_ovr', area: 'overrides', label: 'Reject Override', api_endpoint: '/api/overrides/:id/reject', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },

    // Escalation — now visible (Part 43)
    { action_id: 'act_triage', area: 'escalation', label: 'Triage', api_endpoint: '/api/escalation-inbox/:id/triage', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },
    { action_id: 'act_resolve_esc', area: 'escalation', label: 'Resolve', api_endpoint: '/api/escalation-inbox/:id/resolve', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },

    // Releases — now visible (Part 43)
    { action_id: 'act_approve_rel', area: 'releases', label: 'Approve Plan', api_endpoint: '/api/release-orchestration/:id/approve', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },
    { action_id: 'act_execute_rel', area: 'releases', label: 'Execute Release', api_endpoint: '/api/release-orchestration/:id/execute', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },
    { action_id: 'act_verify_rel', area: 'releases', label: 'Verify Release', api_endpoint: '/api/release-orchestration/:id/verify', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },

    // Governance gates/tuning — already visible
    { action_id: 'act_approve_gate', area: 'governance', label: 'Approve Gate', api_endpoint: '/api/approval-gates/:id/approve', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },
    { action_id: 'act_approve_tuning', area: 'governance', label: 'Approve Tuning', api_endpoint: '/api/policy-tuning/recommendations/:id/approve', visible: true, has_loading: true, has_error: true, has_refresh: true, activation: 'full' },

    // Productization — partial (list visible, actions need buttons)
    { action_id: 'act_bind_pack', area: 'productization', label: 'Bind Skill Pack', api_endpoint: '/api/skill-packs/:id/bind', visible: false, has_loading: false, has_error: false, has_refresh: false, activation: 'partial' },
    { action_id: 'act_install_ext', area: 'productization', label: 'Install Extension', api_endpoint: '/api/extensions/:id/install', visible: false, has_loading: false, has_error: false, has_refresh: false, activation: 'partial' },

    // Audit — partial
    { action_id: 'act_build_package', area: 'audit', label: 'Build Audit Package', api_endpoint: '/api/audit-packages/:type/:id', visible: false, has_loading: false, has_error: false, has_refresh: false, activation: 'partial' },
  ];

  return area ? actions.filter(a => a.area === area) : actions;
}

/** Get visibility gaps */
export function getGaps(): ActionVisibilityGap[] {
  return getVisibleActions().filter(a => a.activation !== 'full').map(a => ({
    action_id: a.action_id, area: a.area, label: a.label,
    gap: a.visible ? 'Missing loading/error/refresh' : 'Not visible in UI',
    priority: a.area === 'releases' || a.area === 'escalation' ? 'high' : 'medium',
  }));
}

module.exports = { getVisibleActions, getGaps };
