// Contract: EscalationRule + EscalationEvent
// Location: app/lib/types.ts
// Module: app/lib/escalation-governance.ts

export interface EscalationRule {
  rule_id: string;                            // Unique ID (er_*)
  trigger: EscalationTrigger;                 // What condition fires this rule
  action: EscalationAction;                   // What to do when fired
  threshold?: number;                         // Numeric threshold (e.g., confidence %)
  scope_level: 'operator' | 'engine' | 'project' | 'global';
  scope_id: string;
  enabled: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface EscalationEvent {
  event_id: string;                           // Unique ID (ee_*)
  rule_id: string;                            // Which rule fired
  trigger: EscalationTrigger;
  action: EscalationAction;
  graph_id?: string;                          // Context
  node_id?: string;
  detail: string;                             // Human-readable explanation
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

export type EscalationTrigger =
  | 'low_confidence' | 'review_conflict' | 'handoff_quality'
  | 'privacy_risk' | 'mission_conflict' | 'documentation_gap'
  | 'provider_mismatch' | 'retry_exhaustion' | 'promotion_attempt';

export type EscalationAction =
  | 'notify_operator' | 'require_operator_approval' | 'board_reopen'
  | 'require_second_provider_review' | 'pause_execution' | 'downgrade_to_advisory';
