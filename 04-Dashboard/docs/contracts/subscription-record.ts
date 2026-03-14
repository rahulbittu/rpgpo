// Contract: SubscriptionRecord + SubscriptionEntitlement
export interface SubscriptionRecord {
  subscription_id: string;
  tenant_id: string;
  plan: string;
  status: 'active' | 'trial' | 'expired' | 'suspended';
  started_at: string;
  expires_at?: string;
}

export interface SubscriptionEntitlement {
  feature: string;
  entitled: boolean;
  limit?: number;
  used?: number;
}
