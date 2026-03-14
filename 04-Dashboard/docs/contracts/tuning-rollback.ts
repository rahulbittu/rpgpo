// Contract: TuningRollback
// Module: app/lib/tuning-application.ts

export interface TuningRollback {
  rollback_id: string;
  result_id: string;
  plan_id: string;
  before_state: Record<string, unknown>;
  rolled_back_at?: string;
  status: 'available' | 'executed' | 'expired';
  created_at: string;
}
