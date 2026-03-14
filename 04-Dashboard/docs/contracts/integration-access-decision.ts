// Contract: IntegrationAccessDecision
export interface IntegrationAccessDecision {
  decision_id: string; integration_id: string; tenant_id: string;
  action: string; outcome: 'allow' | 'deny' | 'require_approval';
  reason: string; created_at: string;
}
