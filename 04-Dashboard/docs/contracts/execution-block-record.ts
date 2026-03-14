// Contract: ExecutionBlockRecord
// Module: app/lib/runtime-enforcement.ts

export interface ExecutionBlockRecord {
  block_id: string;
  graph_id: string;
  node_id?: string;
  transition: string;
  reason: string;
  enforcement_level: string;
  lane: string;
  domain?: string;
  project_id?: string;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
}
