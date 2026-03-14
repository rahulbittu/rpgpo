// GPO UX Polish — Assess and report UX consistency across operator surfaces

import type { UXConsistencyReport, DrilldownDefinition, OperatorJourney } from './types';

function uid(): string { return 'ux_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** Define available drilldowns */
export function getDrilldowns(): DrilldownDefinition[] {
  return [
    { area: 'releases', entity_type: 'release_plan', panel: 'releaseWorkspacePanel', shows_state: true, shows_evidence: false, shows_actions: true, shows_history: true },
    { area: 'approvals', entity_type: 'approval_request', panel: 'auditHubPanel', shows_state: true, shows_evidence: false, shows_actions: true, shows_history: false },
    { area: 'escalation', entity_type: 'escalation_item', panel: 'auditHubPanel', shows_state: true, shows_evidence: false, shows_actions: true, shows_history: false },
    { area: 'governance', entity_type: 'governance_health', panel: 'govHealthPanel', shows_state: true, shows_evidence: false, shows_actions: true, shows_history: true },
    { area: 'providers', entity_type: 'provider_profile', panel: 'providersPanel', shows_state: true, shows_evidence: false, shows_actions: false, shows_history: true },
    { area: 'admin', entity_type: 'tenant_profile', panel: 'adminPanel', shows_state: true, shows_evidence: false, shows_actions: false, shows_history: false },
    { area: 'admin', entity_type: 'security_posture', panel: 'securityPanel', shows_state: true, shows_evidence: true, shows_actions: false, shows_history: false },
    { area: 'productization', entity_type: 'skill_pack', panel: 'securityPanel', shows_state: true, shows_evidence: false, shows_actions: false, shows_history: false },
    { area: 'productization', entity_type: 'engine_template', panel: 'securityPanel', shows_state: true, shows_evidence: false, shows_actions: false, shows_history: false },
    { area: 'productization', entity_type: 'marketplace_listing', panel: 'securityPanel', shows_state: true, shows_evidence: false, shows_actions: false, shows_history: false },
  ];
}

/** Define operator journeys */
export function getJourneys(): OperatorJourney[] {
  return [
    { journey_id: 'j_approve', name: 'Approve an item', steps: [
      { step: 'Navigate to audit tab', discoverable: true, actionable: true, has_feedback: true, has_refresh: true },
      { step: 'Find pending approval', discoverable: true, actionable: true, has_feedback: true, has_refresh: true },
      { step: 'Click approve/reject', discoverable: true, actionable: true, has_feedback: true, has_refresh: true },
    ], overall: 'pass' },
    { journey_id: 'j_escalation', name: 'Triage an escalation', steps: [
      { step: 'Navigate to audit tab', discoverable: true, actionable: true, has_feedback: true, has_refresh: true },
      { step: 'Find escalation item', discoverable: true, actionable: true, has_feedback: true, has_refresh: true },
      { step: 'Click triage/resolve', discoverable: true, actionable: true, has_feedback: true, has_refresh: true },
    ], overall: 'pass' },
    { journey_id: 'j_release', name: 'Execute a release step', steps: [
      { step: 'Navigate to releases tab', discoverable: true, actionable: true, has_feedback: true, has_refresh: true },
      { step: 'Find release plan', discoverable: true, actionable: true, has_feedback: true, has_refresh: true },
      { step: 'Click approve/execute/verify', discoverable: true, actionable: true, has_feedback: true, has_refresh: true },
    ], overall: 'pass' },
    { journey_id: 'j_audit', name: 'Inspect audit traceability', steps: [
      { step: 'Navigate to audit tab', discoverable: true, actionable: true, has_feedback: true, has_refresh: false },
      { step: 'View recent artifacts/ledger', discoverable: true, actionable: false, has_feedback: true, has_refresh: false },
      { step: 'Drilldown to evidence', discoverable: false, actionable: false, has_feedback: false, has_refresh: false },
    ], overall: 'partial' },
    { journey_id: 'j_runtime', name: 'Inspect runtime block', steps: [
      { step: 'Navigate to governance tab', discoverable: true, actionable: true, has_feedback: true, has_refresh: false },
      { step: 'View runtime summary', discoverable: true, actionable: false, has_feedback: true, has_refresh: false },
      { step: 'Drilldown to specific block', discoverable: false, actionable: false, has_feedback: false, has_refresh: false },
    ], overall: 'partial' },
    { journey_id: 'j_skill_pack', name: 'Bind a skill pack', steps: [
      { step: 'Navigate to admin tab', discoverable: true, actionable: true, has_feedback: true, has_refresh: false },
      { step: 'Find skill packs section', discoverable: true, actionable: false, has_feedback: true, has_refresh: false },
      { step: 'Click bind action', discoverable: false, actionable: false, has_feedback: false, has_refresh: false },
    ], overall: 'partial' },
    { journey_id: 'j_extension', name: 'Install an extension', steps: [
      { step: 'Navigate to admin tab', discoverable: true, actionable: true, has_feedback: true, has_refresh: false },
      { step: 'Find extensions section', discoverable: true, actionable: false, has_feedback: true, has_refresh: false },
      { step: 'Click install action', discoverable: false, actionable: false, has_feedback: false, has_refresh: false },
    ], overall: 'partial' },
  ];
}

/** Compute UX consistency report */
export function getConsistencyReport(): UXConsistencyReport {
  const journeys = getJourneys();
  const pass = journeys.filter(j => j.overall === 'pass').length;
  const partial = journeys.filter(j => j.overall === 'partial').length;
  const fail = journeys.filter(j => j.overall === 'fail').length;

  let navGaps = 0;
  try { const nc = require('./navigation-consistency') as { getGaps(): any[] }; navGaps = nc.getGaps().length; } catch { /* */ }

  let navEntries = 0;
  try { const nc = require('./navigation-consistency') as { getMap(): any[] }; navEntries = nc.getMap().length; } catch { /* */ }

  const drilldowns = getDrilldowns().length;
  let refreshPlans = 0;
  try { const tr = require('./targeted-refresh') as { getPlans(): any[] }; refreshPlans = tr.getPlans().length; } catch { /* */ }

  const overall = fail > 0 ? 'inconsistent' : partial > 2 ? 'partial' : 'consistent';

  return { report_id: uid(), navigation_entries: navEntries, navigation_gaps: navGaps, refresh_plans: refreshPlans, drilldowns, journey_pass: pass, journey_partial: partial, journey_fail: fail, overall, created_at: new Date().toISOString() };
}

module.exports = { getDrilldowns, getJourneys, getConsistencyReport };
