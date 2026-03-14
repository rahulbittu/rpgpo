// Contract: ReliabilityIncident + ReliabilitySnapshot
export interface ReliabilityIncident {
  incident_id: string;
  subsystem: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  detail: string;
  affected_scope: string;
  remediation: string;
  resolved: boolean;
  created_at: string;
}

export interface ReliabilitySnapshot {
  subsystem: string;
  status: 'healthy' | 'watch' | 'degraded' | 'critical';
  success_rate: number;
  incident_count: number;
  details: string;
}
