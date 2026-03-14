// Contract: MeasuredReliabilityReport
export interface MeasuredReliabilityReport {
  report_id: string; scope: string;
  metrics: Array<{ name: string; value: number; unit: string; measured: boolean; window: string }>;
  regressions: Array<{ metric: string; previous: number; current: number; delta: number }>;
  overall_health: 'healthy' | 'watch' | 'degraded' | 'critical';
  created_at: string;
}
