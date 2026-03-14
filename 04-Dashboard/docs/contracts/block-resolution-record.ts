// Contract: BlockResolutionRecord
// Module: app/lib/block-resolution.ts

export interface BlockResolutionRecord {
  resolution_id: string;
  block_id: string;
  graph_id: string;
  node_id?: string;
  outcome: 'resolved' | 'unresolved' | 'override_cleared';
  override_id?: string;
  notes: string;
  created_at: string;
}
