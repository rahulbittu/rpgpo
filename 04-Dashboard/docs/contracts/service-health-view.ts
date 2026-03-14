// Contract: ServiceHealthView
export interface ServiceHealthView {
  overall: 'healthy' | 'degraded' | 'critical';
  subsystems: ReliabilitySnapshot[];
  slo_statuses: SLOStatus[];
  active_incidents: number;
  active_alerts: number;
  created_at: string;
}
