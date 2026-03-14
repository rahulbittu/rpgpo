// Contract: TraceabilityLedgerEntry
export interface TraceabilityLedgerEntry {
  entry_id: string;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  scope: { lane?: string; domain?: string; project_id?: string; isolation_level: string };
  detail: string;
  linked_artifact_ids: string[];
  created_at: string;
}
