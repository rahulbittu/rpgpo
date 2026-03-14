// Contract: TuningApplicationResult
// Module: app/lib/tuning-application.ts

export interface TuningApplicationResult {
  result_id: string;
  plan_id: string;
  rec_id: string;
  applied: boolean;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  change_summary: string;
  approver: string;
  evidence_ids: string[];
  rollback_id?: string;
  created_at: string;
}
