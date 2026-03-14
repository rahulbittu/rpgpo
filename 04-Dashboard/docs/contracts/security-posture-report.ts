// Contract: SecurityPostureReport
export interface SecurityPostureReport {
  report_id: string;
  scope_type: string;
  scope_id: string;
  overall: 'strong' | 'acceptable' | 'weak' | 'critical';
  controls: Array<{ control_id: string; name: string; category: string; status: string; details: string }>;
  findings: SecurityFinding[];
  secret_health: { total: number; stale: number; expired: number };
  boundary_health: { violations: number; enforced: boolean };
  created_at: string;
}
