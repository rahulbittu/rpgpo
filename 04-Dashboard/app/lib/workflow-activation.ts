// GPO Workflow Activation — Define and assess end-to-end operator workflows

import type { ActivatedWorkflow, WorkflowStepState, WorkflowState, WorkflowActivationReport } from './types';

function uid(): string { return 'wa_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function defineWorkflows(): ActivatedWorkflow[] {
  return [
    { workflow_id: 'wf_approval', name: 'Approval Review & Decision', area: 'approvals', entry_point: 'audit tab → approval workspace', api_endpoints: ['/api/approval-workspace', '/api/approval-workspace/:id/approve'], steps: [
      { step: 'View pending approvals', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'Review approval detail', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'Approve/reject/request evidence', ui_visible: true, api_connected: true, state_mutates: true, result_visible: true },
    ], state: 'activated', blockers: [] },

    { workflow_id: 'wf_override', name: 'Override Review & Resolution', area: 'governance', entry_point: 'governance tab → override ops', api_endpoints: ['/api/override-ops', '/api/overrides/:id/approve'], steps: [
      { step: 'View pending overrides', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'Approve/reject override', ui_visible: true, api_connected: true, state_mutates: true, result_visible: true },
      { step: 'Consume override on block clear', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
    ], state: 'partially_activated', blockers: ['Override consume not visible in UI'] },

    { workflow_id: 'wf_escalation', name: 'Escalation Triage & Resolution', area: 'escalation', entry_point: 'audit tab → escalation inbox', api_endpoints: ['/api/escalation-inbox', '/api/escalation-inbox/:id/resolve'], steps: [
      { step: 'View new escalations', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'Triage escalation', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
      { step: 'Resolve escalation', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
    ], state: 'partially_activated', blockers: ['No inline triage/resolve actions in UI'] },

    { workflow_id: 'wf_release_eval', name: 'Release Evaluation & Progression', area: 'releases', entry_point: 'releases tab', api_endpoints: ['/api/release-orchestration/plan', '/api/release-orchestration/:id/approve', '/api/release-orchestration/:id/execute'], steps: [
      { step: 'View release plans', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'Approve release plan', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
      { step: 'Execute release', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
      { step: 'Verify release', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
    ], state: 'partially_activated', blockers: ['No action buttons for approve/execute/verify in releases tab'] },

    { workflow_id: 'wf_rollback', name: 'Rollback Initiation', area: 'releases', entry_point: 'releases tab', api_endpoints: ['/api/rollback-control/plan', '/api/rollback-control/:id/execute'], steps: [
      { step: 'Create rollback plan', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
      { step: 'Execute rollback', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
    ], state: 'partially_activated', blockers: ['No rollback controls in UI'] },

    { workflow_id: 'wf_audit_drill', name: 'Audit Traceability Drilldown', area: 'audit', entry_point: 'audit tab', api_endpoints: ['/api/audit-hub', '/api/evidence-chain/:id', '/api/traceability-ledger'], steps: [
      { step: 'View audit timeline', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'Drilldown to artifact detail', ui_visible: false, api_connected: true, state_mutates: false, result_visible: false },
      { step: 'View evidence chain', ui_visible: false, api_connected: true, state_mutates: false, result_visible: false },
    ], state: 'partially_activated', blockers: ['No detail/evidence drilldown in audit tab'] },

    { workflow_id: 'wf_runtime_block', name: 'Runtime Block Inspection', area: 'governance', entry_point: 'governance tab → runtime summary', api_endpoints: ['/api/runtime-enforcement', '/api/runtime-blocks'], steps: [
      { step: 'View runtime summary', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'Inspect per-graph blocks', ui_visible: false, api_connected: true, state_mutates: false, result_visible: false },
    ], state: 'partially_activated', blockers: ['No per-graph block detail in UI'] },

    { workflow_id: 'wf_skill_pack', name: 'Skill Pack Inspection & Binding', area: 'productization', entry_point: 'admin tab', api_endpoints: ['/api/skill-packs', '/api/skill-packs/:id/bind'], steps: [
      { step: 'View skill packs', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'View pack details', ui_visible: false, api_connected: true, state_mutates: false, result_visible: false },
      { step: 'Bind pack to scope', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
    ], state: 'partially_activated', blockers: ['No detail or bind action in admin tab skill packs section'] },

    { workflow_id: 'wf_marketplace', name: 'Marketplace Install Evaluation', area: 'productization', entry_point: 'admin tab', api_endpoints: ['/api/marketplace', '/api/extensions/:id/install'], steps: [
      { step: 'View marketplace listings', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'Evaluate installability', ui_visible: false, api_connected: true, state_mutates: false, result_visible: false },
      { step: 'Install extension', ui_visible: false, api_connected: true, state_mutates: true, result_visible: false },
    ], state: 'partially_activated', blockers: ['No install action in admin tab'] },

    { workflow_id: 'wf_cos_brief', name: 'Chief of Staff Brief Review', area: 'home', entry_point: 'home tab', api_endpoints: ['/api/chief-of-staff/brief'], steps: [
      { step: 'View CoS brief', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
      { step: 'View next-best-actions', ui_visible: true, api_connected: true, state_mutates: false, result_visible: true },
    ], state: 'activated', blockers: [] },
  ];
}

/** Generate activation report */
export function getReport(): WorkflowActivationReport {
  const workflows = defineWorkflows();
  const activated = workflows.filter(w => w.state === 'activated').length;
  const partial = workflows.filter(w => w.state === 'partially_activated').length;
  const blocked = workflows.filter(w => w.state === 'blocked' || w.state === 'broken').length;
  const topBlockers = [...new Set(workflows.flatMap(w => w.blockers))].slice(0, 5);

  return {
    report_id: uid(), workflows, total: workflows.length,
    activated, partial, blocked, top_blockers: topBlockers,
    created_at: new Date().toISOString(),
  };
}

/** Get workflows by area */
export function getByArea(area: string): ActivatedWorkflow[] {
  return defineWorkflows().filter(w => w.area === area);
}

module.exports = { getReport, getByArea };
