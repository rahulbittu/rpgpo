// Contract: DelegationRule
export interface DelegationRule {
  rule_id: string;
  approval_type: string;
  scope_level: string;
  scope_id: string;
  lane?: string;
  delegated_to: string;
  fallback_to: string;
  expires_at?: string;
  enabled: boolean;
  created_at: string;
}
