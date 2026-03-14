// Contract: ProviderReliabilitySnapshot
export interface ProviderReliabilitySnapshot {
  snapshot_id: string;
  provider_id: string;
  health: 'healthy' | 'watch' | 'degraded' | 'unstable';
  success_rate: number;
  metrics: { success_count: number; failure_count: number; retry_count: number; override_linked_count: number; escalation_linked_count: number; incident_count: number };
  window_days: number;
  created_at: string;
}
