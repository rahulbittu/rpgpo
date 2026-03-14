// Contract: CrossProjectAccessDecision
export interface CrossProjectAccessDecision {
  decision_id: string;
  source_project: string;
  target_project: string;
  artifact_type: string;
  action: string;
  outcome: 'allow' | 'deny' | 'allow_redacted' | 'require_operator_approval';
  reason: string;
  created_at: string;
}
