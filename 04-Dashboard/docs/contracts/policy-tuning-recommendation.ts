// Contract: PolicyTuningRecommendation + TuningDecision
// Location: app/lib/types.ts
// Module: app/lib/policy-tuning.ts

export type TuningAction = 'tighten' | 'loosen' | 'add' | 'deprecate' | 'rescope';
export type TuningTarget = 'operator_policy' | 'autonomy_budget' | 'escalation_rule' | 'documentation_requirement' | 'promotion_policy' | 'enforcement_rule' | 'provider_fit';

export interface PolicyTuningRecommendation {
  rec_id: string;
  target: TuningTarget;
  action: TuningAction;
  scope_level: string;
  scope_id: string;
  title: string;
  rationale: string;
  expected_impact: string;
  risk: 'low' | 'medium' | 'high';
  evidence_ids: string[];
  evidence_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  created_at: string;
}

export interface TuningDecision {
  decision_id: string;
  rec_id: string;
  action: 'approve' | 'reject' | 'apply';
  decided_by: string;
  notes: string;
  decided_at: string;
}
