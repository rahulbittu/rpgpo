// Contract: DataBoundaryPolicy + BoundaryViolationRecord
export interface DataBoundaryPolicy {
  policy_id: string;
  source_scope: string;
  target_scope: string;
  artifact_type: string;
  outcome: 'allow' | 'deny' | 'redact' | 'require_approval';
  enabled: boolean;
  created_at: string;
}

export interface BoundaryViolationRecord {
  violation_id: string;
  source_scope: string;
  target_scope: string;
  artifact_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detail: string;
  created_at: string;
}
