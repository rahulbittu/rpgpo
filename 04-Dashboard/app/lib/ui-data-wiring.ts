// GPO UI Data Wiring — Identify and report wiring gaps between backend and UI

import type { UIWiringGap } from './types';

/** Identify all wiring gaps */
export function getWiringGaps(area?: string): UIWiringGap[] {
  const gaps: UIWiringGap[] = [
    // Productization surfaces — API-only
    { area: 'productization', surface: 'skill_packs', gap_type: 'no_navigation', description: 'Skill packs have full API but no UI panel', fix: 'Add skill packs section to admin tab' },
    { area: 'productization', surface: 'engine_templates', gap_type: 'no_navigation', description: 'Engine templates have full API but no UI panel', fix: 'Add templates section to admin tab' },
    { area: 'productization', surface: 'marketplace', gap_type: 'no_navigation', description: 'Marketplace has full API but no UI panel', fix: 'Add marketplace section to admin tab' },
    { area: 'productization', surface: 'extensions', gap_type: 'no_navigation', description: 'Extensions have full API but no UI panel', fix: 'Add extensions section to admin tab' },
    { area: 'productization', surface: 'integrations', gap_type: 'no_navigation', description: 'Integrations have full API but no UI panel', fix: 'Add integrations section to admin tab' },

    // Collaboration
    { area: 'collaboration', surface: 'collaboration_sessions', gap_type: 'summary_only', description: 'Collaboration sessions show as count in releases tab, no detail drilldown', fix: 'Add session detail with proposals/votes/dissent' },

    // Partial wiring
    { area: 'governance', surface: 'gov_runtime', gap_type: 'summary_only', description: 'Runtime governance shows summary only, no per-node detail', fix: 'Add per-graph/node drilldown' },
    { area: 'governance', surface: 'gov_override_ops', gap_type: 'no_action', description: 'Override ops shows counts but no inline approve/reject actions', fix: 'Add action buttons to pending overrides' },
    { area: 'audit', surface: 'audit_hub', gap_type: 'no_detail', description: 'Audit hub shows recent items but no search or detail drilldown', fix: 'Add search input and item detail expansion' },
    { area: 'releases', surface: 'releases_workspace', gap_type: 'no_action', description: 'Release workspace shows plans but no approve/execute/verify actions', fix: 'Add action buttons on release plans' },

    // Loading states
    { area: 'all', surface: 'all_panels', gap_type: 'no_empty_state', description: 'Most panels lack explicit loading indicators', fix: 'Add loading spinners to async panel loads' },
  ];

  return area ? gaps.filter(g => g.area === area) : gaps;
}

module.exports = { getWiringGaps };
