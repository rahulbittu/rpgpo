// GPO UI Surface Audit — Inventory and classify all operator UI surfaces

import type { UISurfaceDefinition, UISurfaceAuditResult, UISurfaceStatus } from './types';

function uid(): string { return 'ua_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** Define all known UI surfaces and their wiring state */
function defineSurfaces(): UISurfaceDefinition[] {
  return [
    // Home / CoS
    { surface_id: 'home_cos_brief', area: 'home', tab: 'home', panel: 'chiefOfStaffPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'complete' },
    { surface_id: 'home_needs_operator', area: 'home', tab: 'home', panel: 'needsRahulHero', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: true, has_empty_state: true, has_loading_state: false, status: 'complete' },

    // Intake
    { surface_id: 'intake_form', area: 'intake', tab: 'intake', panel: 'intakeFormCard', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: true, has_empty_state: true, has_loading_state: false, status: 'complete' },
    { surface_id: 'intake_templates', area: 'intake', tab: 'intake', panel: 'missionTemplateGrid', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: false, supports_action: true, has_empty_state: false, has_loading_state: false, status: 'complete' },

    // Missions
    { surface_id: 'missions_statements', area: 'missions', tab: 'missions', panel: 'missionStatementsPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: true, has_empty_state: true, has_loading_state: false, status: 'complete' },

    // Memory
    { surface_id: 'memory_viewer', area: 'memory', tab: 'memory', panel: 'memoryViewerPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'complete' },

    // Dossiers
    { surface_id: 'dossiers_list', area: 'dossiers', tab: 'dossiers', panel: 'dossiersPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'partial' },

    // Providers
    { surface_id: 'providers_cards', area: 'providers', tab: 'providers', panel: 'providersPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'complete' },
    { surface_id: 'providers_gov_summary', area: 'providers', tab: 'providers', panel: 'provGovSummary', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: false, has_loading_state: false, status: 'complete' },

    // Governance
    { surface_id: 'gov_ops_cards', area: 'governance', tab: 'governance', panel: 'govOpsCards', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'complete' },
    { surface_id: 'gov_runtime', area: 'governance', tab: 'governance', panel: 'runtimeSummarySlot', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'partial' },
    { surface_id: 'gov_override_ops', area: 'governance', tab: 'governance', panel: 'overrideOpsSlot', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'partial' },
    { surface_id: 'gov_isolation', area: 'governance', tab: 'governance', panel: 'isolationPatternSlot', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'partial' },
    { surface_id: 'gov_traceability', area: 'governance', tab: 'governance', panel: 'traceabilitySlot', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'partial' },
    { surface_id: 'gov_health', area: 'governance', tab: 'governance', panel: 'govHealthPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: true, has_empty_state: true, has_loading_state: false, status: 'complete' },
    { surface_id: 'gov_policies', area: 'governance', tab: 'governance', panel: 'governancePanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'complete' },

    // Audit
    { surface_id: 'audit_hub', area: 'audit', tab: 'audit', panel: 'auditHubPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'partial' },
    { surface_id: 'audit_policy_history', area: 'audit', tab: 'audit', panel: 'policyHistoryPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'partial' },

    // Releases
    { surface_id: 'releases_workspace', area: 'releases', tab: 'releases', panel: 'releaseWorkspacePanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'partial' },

    // Admin
    { surface_id: 'admin_tenants', area: 'admin', tab: 'admin', panel: 'adminPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'partial' },
    { surface_id: 'admin_deployment', area: 'admin', tab: 'admin', panel: 'deploymentReadinessPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'complete' },
    { surface_id: 'admin_security', area: 'admin', tab: 'admin', panel: 'securityPanel', exists_in_ui: true, visible_in_nav: true, renders_data: true, uses_real_backend: true, supports_action: false, has_empty_state: true, has_loading_state: false, status: 'complete' },

    // Execution Graph (inline on intake detail)
    { surface_id: 'execution_graph', area: 'intake', tab: 'intake', panel: 'executionGraphPanel', exists_in_ui: true, visible_in_nav: false, renders_data: true, uses_real_backend: true, supports_action: true, has_empty_state: true, has_loading_state: false, status: 'complete' },

    // API-only / hidden surfaces
    { surface_id: 'skill_packs', area: 'productization', tab: 'admin', panel: 'none', exists_in_ui: false, visible_in_nav: false, renders_data: false, uses_real_backend: true, supports_action: false, has_empty_state: false, has_loading_state: false, status: 'api_only' },
    { surface_id: 'engine_templates', area: 'productization', tab: 'admin', panel: 'none', exists_in_ui: false, visible_in_nav: false, renders_data: false, uses_real_backend: true, supports_action: false, has_empty_state: false, has_loading_state: false, status: 'api_only' },
    { surface_id: 'marketplace', area: 'productization', tab: 'admin', panel: 'none', exists_in_ui: false, visible_in_nav: false, renders_data: false, uses_real_backend: true, supports_action: false, has_empty_state: false, has_loading_state: false, status: 'api_only' },
    { surface_id: 'extensions', area: 'productization', tab: 'admin', panel: 'none', exists_in_ui: false, visible_in_nav: false, renders_data: false, uses_real_backend: true, supports_action: false, has_empty_state: false, has_loading_state: false, status: 'api_only' },
    { surface_id: 'integrations', area: 'productization', tab: 'admin', panel: 'none', exists_in_ui: false, visible_in_nav: false, renders_data: false, uses_real_backend: true, supports_action: false, has_empty_state: false, has_loading_state: false, status: 'api_only' },
    { surface_id: 'collaboration_detail', area: 'collaboration', tab: 'releases', panel: 'none', exists_in_ui: false, visible_in_nav: false, renders_data: false, uses_real_backend: true, supports_action: false, has_empty_state: false, has_loading_state: false, status: 'api_only' },
  ];
}

/** Run UI surface audit */
export function runAudit(): UISurfaceAuditResult {
  const surfaces = defineSurfaces();
  const complete = surfaces.filter(s => s.status === 'complete').length;
  const partial = surfaces.filter(s => s.status === 'partial').length;
  const empty = surfaces.filter(s => s.status === 'empty').length;
  const dead = surfaces.filter(s => s.status === 'dead').length;
  const apiOnly = surfaces.filter(s => s.status === 'api_only').length;
  const hidden = surfaces.filter(s => s.status === 'hidden').length;

  const topGaps: string[] = [];
  if (apiOnly > 0) topGaps.push(`${apiOnly} surfaces are API-only with no UI rendering`);
  if (partial > 0) topGaps.push(`${partial} surfaces are partially wired`);
  for (const s of surfaces.filter(s => !s.has_loading_state && s.status !== 'api_only')) {
    topGaps.push(`${s.surface_id}: no loading state`);
    if (topGaps.length > 8) break;
  }

  return {
    audit_id: uid(), surfaces, total: surfaces.length,
    complete, partial, empty, dead, api_only: apiOnly, hidden,
    top_gaps: topGaps.slice(0, 10),
    created_at: new Date().toISOString(),
  };
}

/** Get audit by area */
export function getAuditByArea(area: string): UISurfaceDefinition[] {
  return defineSurfaces().filter(s => s.area === area);
}

module.exports = { runAudit, getAuditByArea };
