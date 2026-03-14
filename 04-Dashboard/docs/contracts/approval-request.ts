// Contract: ApprovalRequest
export interface ApprovalRequest {
  request_id: string;
  source_type: 'gate' | 'promotion' | 'override' | 'tuning' | 'exception' | 'policy_change';
  source_id: string;
  title: string;
  description: string;
  domain?: string;
  project_id?: string;
  lane?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'approved' | 'rejected' | 'overdue' | 'delegated' | 'blocked';
  delegated_to?: string;
  sla_hours?: number;
  evidence_summary?: string;
  blockers: string[];
  created_at: string;
  updated_at: string;
}
