// Contract: EnforcementDecision
// Location: app/lib/types.ts
// Module: app/lib/enforcement-engine.ts

export type EnforcementLevel = 'allow' | 'warn' | 'soft_block' | 'hard_block' | 'override_required';
export type EnforcementAction = 'create_graph' | 'start_execution' | 'advance_node' | 'complete_review' | 'generate_dossier' | 'promote_to_beta' | 'promote_to_prod' | 'release';

export interface EnforcementDecision {
  decision_id: string;
  related_type: 'graph' | 'dossier' | 'release';
  related_id: string;
  action: EnforcementAction;
  lane: 'dev' | 'beta' | 'prod';
  level: EnforcementLevel;
  reasons: string[];
  blockers: string[];
  warnings: string[];
  required_override_types: string[];
  triggered_rule_ids: string[];
  created_at: string;
}

export interface EnforcementRule {
  rule_id: string;
  action: EnforcementAction;
  condition: string;
  level: EnforcementLevel;
  description: string;
  enabled: boolean;
}
