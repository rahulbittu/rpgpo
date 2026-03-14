// Contract: GovernanceHealthSnapshot
// Location: app/lib/types.ts
// Module: app/lib/policy-tuning.ts

export interface GovernanceHealthSnapshot {
  snapshot_id: string;
  scope_level: string;
  scope_id: string;
  exception_count: number;
  drift_signal_count: number;
  pending_tuning_count: number;
  override_rate: number;       // percentage
  enforcement_block_rate: number; // percentage
  health: 'healthy' | 'drifting' | 'degraded' | 'critical';
  summary: string;
  created_at: string;
}
