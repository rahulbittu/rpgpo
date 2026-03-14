// GPO Operator Workflow Completion — Assess and report workflow usability

import type { WorkflowCompletionState, WorkflowCompletionReport } from './types';

function uid(): string { return 'wc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** Get completion state for all key workflows — Part 49 updated assessment */
export function getCompletionReport(): WorkflowCompletionReport {
  const workflows: WorkflowCompletionState[] = [
    // Fully usable (Parts 43-44 + Part 49 improvements)
    { workflow_id: 'wf_approve', name: 'Approval review & decision', status: 'usable', has_ui_entry: true, has_actions: true, has_feedback: true, has_refresh: true, detail: 'Full approve/reject/evidence in audit tab' },
    { workflow_id: 'wf_escalation', name: 'Escalation triage & resolve', status: 'usable', has_ui_entry: true, has_actions: true, has_feedback: true, has_refresh: true, detail: 'Full triage/resolve in audit tab' },
    { workflow_id: 'wf_override', name: 'Override review', status: 'usable', has_ui_entry: true, has_actions: true, has_feedback: true, has_refresh: true, detail: 'Approve/reject in governance tab' },
    { workflow_id: 'wf_release', name: 'Release progression', status: 'usable', has_ui_entry: true, has_actions: true, has_feedback: true, has_refresh: true, detail: 'Approve/execute/verify buttons in releases tab' },
    { workflow_id: 'wf_provider', name: 'Provider health inspection', status: 'usable', has_ui_entry: true, has_actions: false, has_feedback: true, has_refresh: true, detail: 'Provider cards + governance health in providers tab' },
    { workflow_id: 'wf_security', name: 'Security posture inspection', status: 'usable', has_ui_entry: true, has_actions: false, has_feedback: true, has_refresh: true, detail: 'Security posture, findings, checklist in admin tab' },
    { workflow_id: 'wf_cos', name: 'Chief of Staff brief', status: 'usable', has_ui_entry: true, has_actions: false, has_feedback: true, has_refresh: true, detail: 'CoS brief on home tab' },
    { workflow_id: 'wf_tenant', name: 'Tenant admin', status: 'usable', has_ui_entry: true, has_actions: false, has_feedback: true, has_refresh: true, detail: 'Tenant profile + entitlements in admin tab' },

    // Now usable via Part 49 UI wiring
    { workflow_id: 'wf_rollback', name: 'Rollback create & execute', status: 'usable', has_ui_entry: true, has_actions: true, has_feedback: true, has_refresh: true, detail: 'Part 49: rollback button added to releases tab' },
    { workflow_id: 'wf_skill_bind', name: 'Skill pack bind', status: 'usable', has_ui_entry: true, has_actions: true, has_feedback: true, has_refresh: true, detail: 'Part 49: bind button added to admin skill packs section' },
    { workflow_id: 'wf_template_inst', name: 'Template instantiate', status: 'usable', has_ui_entry: true, has_actions: true, has_feedback: true, has_refresh: true, detail: 'Part 49: instantiate button added to admin templates section' },
    { workflow_id: 'wf_ext_install', name: 'Extension install', status: 'usable', has_ui_entry: true, has_actions: true, has_feedback: true, has_refresh: true, detail: 'Part 49: install button added to admin extensions section' },

    // Part 52: Now fully usable — audit evidence drilldown wired with enforcement evidence + protected path results
    { workflow_id: 'wf_audit_drill', name: 'Audit traceability drilldown', status: 'usable', has_ui_entry: true, has_actions: true, has_feedback: true, has_refresh: true, detail: 'Audit items visible, enforcement evidence drilldown in governance tab, protected path results linkable' },
  ];

  const usable = workflows.filter(w => w.status === 'usable').length;
  const partial = workflows.filter(w => w.status === 'partially_usable').length;
  const blocked = workflows.filter(w => w.status === 'blocked' || w.status === 'broken').length;

  return { report_id: uid(), workflows, usable, partial, blocked, total: workflows.length, created_at: new Date().toISOString() };
}

module.exports = { getCompletionReport };
