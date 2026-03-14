// Contract: PolicyChangeRecord
export interface PolicyChangeRecord {
  change_id: string;
  target_type: string;
  target_id: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  actor: string;
  reason: string;
  linked_tuning_id?: string;
  created_at: string;
}
