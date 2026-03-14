// Contract: ScopedDriftResolution
// Module: app/lib/scoped-drift-resolution.ts

export type ResolutionAction = 'adjust_policy' | 'adjust_budget' | 'adjust_escalation' | 'adjust_doc_requirement' | 'adjust_promotion_policy' | 'adjust_enforcement_rule' | 'adjust_provider_fit' | 'require_review' | 'require_board_recheck' | 'monitor_only';
export type ResolutionStatus = 'open' | 'approved' | 'applied' | 'verified' | 'closed' | 'rejected';

export interface ScopedDriftResolution {
  resolution_id: string;
  scope_level: string;
  scope_id: string;
  drift_signal_ids: string[];
  root_cause: string;
  impacted_rules: string[];
  proposed_actions: ResolutionAction[];
  risk: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  evidence_ids: string[];
  owner: string;
  status: ResolutionStatus;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}
