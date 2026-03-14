// Contract: UsageMeter + BillingEvent
export interface UsageMeter {
  meter_id: string;
  tenant_id: string;
  meter_type: string;
  amount: number;
  period: string;
  created_at: string;
}

export interface BillingEvent {
  event_id: string;
  tenant_id: string;
  event_type: 'charge' | 'credit' | 'usage_recorded' | 'plan_change';
  amount: number;
  detail: string;
  created_at: string;
}
