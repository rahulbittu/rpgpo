// Contract: SecurityFinding
export interface SecurityFinding {
  finding_id: string;
  severity: 'blocker' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  remediation: string;
  affected_scope: string;
  evidence_refs: string[];
  created_at: string;
}
