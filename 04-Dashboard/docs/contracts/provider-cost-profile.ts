// Contract: ProviderCostProfile + ProviderCostDecision
export interface ProviderCostProfile {
  provider_id: string;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  cost_tier: 'free' | 'low' | 'medium' | 'high';
  updated_at: string;
}

export interface ProviderCostDecision {
  decision_id: string;
  provider_id: string;
  action: string;
  lane: string;
  estimated_cost: number;
  budget_remaining: number;
  outcome: 'allow' | 'warn' | 'soft_block' | 'hard_block' | 'fallback_required';
  reason: string;
  created_at: string;
}
