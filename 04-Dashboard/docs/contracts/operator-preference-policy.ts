// Contract: OperatorPreferencePolicy
// Location: app/lib/types.ts
// Module: app/lib/operator-policies.ts

export interface OperatorPreferencePolicy {
  policy_id: string;                          // Unique ID (op_*)
  area: PolicyArea;                           // Which policy area
  value: PolicyValue;                         // permissive | balanced | strict | off | on | advisory | enforced
  scope_level: 'operator' | 'engine' | 'project' | 'global';
  scope_id: string;                           // Domain key or project ID
  enabled: boolean;
  rationale: string;                          // Why this policy exists
  created_at: string;                         // ISO 8601
  updated_at: string;                         // ISO 8601
}

export type PolicyArea =
  | 'execution_style'           // How aggressively to auto-execute
  | 'review_strictness'         // How thorough reviews must be
  | 'documentation_strictness'  // Documentation requirements enforcement
  | 'provider_override_mode'    // Provider registry binding strength
  | 'interruption_mode'         // When to interrupt the operator
  | 'learning_promotion_mode'   // Auto-promote experimental fits/recipes
  | 'board_recheck_bias';       // Tendency to send back to board

export type PolicyValue = 'permissive' | 'balanced' | 'strict' | 'off' | 'on' | 'advisory' | 'enforced';
