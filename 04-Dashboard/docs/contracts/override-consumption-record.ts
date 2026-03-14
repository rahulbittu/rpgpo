// Contract: OverrideConsumptionRecord
// Module: app/lib/override-operations.ts

export interface OverrideConsumptionRecord {
  consumption_id: string;
  override_id: string;
  decision_id: string;
  graph_id?: string;
  consumed_at: string;
}
