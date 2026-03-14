// Contract: TuningApplicationPlan
// Module: app/lib/tuning-application.ts

export interface TuningApplicationPlan {
  plan_id: string;
  rec_id: string;
  target: string;
  action: string;
  scope: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  change_summary: string;
  risk: 'low' | 'medium' | 'high';
  dry_run: boolean;
  created_at: string;
}
