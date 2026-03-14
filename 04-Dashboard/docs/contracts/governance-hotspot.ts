// Contract: GovernanceHotspot + GovernanceOpsView
// Module: app/lib/governance-ops.ts

export interface GovernanceHotspot {
  scope: string;
  category: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'rising' | 'stable' | 'falling';
  detail: string;
}

export interface GovernanceOpsView {
  health: GovernanceHealthSnapshot;
  hotspots: GovernanceHotspot[];
  pending_resolutions: number;
  pending_tuning: number;
  pending_overrides: number;
  unresolved_escalations: number;
  trends: GovernanceTrendPoint[];
  watchlist: GovernanceWatchlistEntry[];
}
