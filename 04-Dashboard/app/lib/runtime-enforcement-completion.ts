// GPO Runtime Enforcement Completion — Assess enforcement coverage of operator flows

import type { RuntimeCompletionReport, RuntimeCompletionState } from './types';

function uid(): string { return 'rc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** Compute runtime enforcement completion */
export function getReport(): RuntimeCompletionReport {
  const paths: Array<{ path: string; state: RuntimeCompletionState; detail: string }> = [
    // Fully enforced
    { path: 'graph_create → enforcement check', state: 'fully_enforced', detail: 'Runtime enforcement wired into createGraph (Part 27)' },
    { path: 'node_start → enforcement check', state: 'fully_enforced', detail: 'Runtime enforcement wired into updateNodeStatus (Part 27)' },
    { path: 'graph_executing → enforcement check', state: 'fully_enforced', detail: 'Runtime enforcement wired into updateGraphStatus (Part 27)' },
    { path: 'approval_workspace → approve/reject', state: 'fully_enforced', detail: 'Full UI action + backend mutation + state refresh' },
    { path: 'gate_approve → workflow continue', state: 'fully_enforced', detail: 'Gate approval triggers workflow continuation' },
    { path: 'cos_brief → visible', state: 'fully_enforced', detail: 'Chief of Staff brief renders on home tab' },

    // Partially enforced (Part 43 improvements)
    { path: 'override_approve → consume → block_clear', state: 'partially_enforced', detail: 'Override approval works; consume creates record but block resolution is implicit' },
    { path: 'escalation_triage → resolve → resume', state: 'partially_enforced', detail: 'Triage/resolve work via API; UI actions now visible (Part 43)' },
    { path: 'release_approve → execute → verify', state: 'partially_enforced', detail: 'Full API chain works; UI actions now visible (Part 43)' },
    { path: 'rollback_create → execute', state: 'partially_enforced', detail: 'API works; visibility in releases tab (Part 43)' },
    { path: 'promotion_control → enforcement → override_check', state: 'partially_enforced', detail: 'Enforcement evaluates; override clearing works' },

    // Advisory only
    { path: 'worker_governance → pre-execution check', state: 'advisory_only', detail: 'Worker governance evaluates but worker.js does not call it yet' },
    { path: 'entitlement_enforcement → API gating', state: 'advisory_only', detail: 'Entitlements evaluate but API routes do not enforce' },
    { path: 'secret_rotation → auto-detect', state: 'advisory_only', detail: 'Secret age tracked but no auto-rotation' },
  ];

  const fully = paths.filter(p => p.state === 'fully_enforced').length;
  const partial = paths.filter(p => p.state === 'partially_enforced').length;
  const advisory = paths.filter(p => p.state === 'advisory_only').length;

  return { report_id: uid(), paths, fully_enforced: fully, partially_enforced: partial, advisory_only: advisory, total: paths.length, created_at: new Date().toISOString() };
}

module.exports = { getReport };
