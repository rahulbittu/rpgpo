// Contract: EvidenceBundle
export interface EvidenceBundle {
  bundle_id: string;
  related_type: string;
  related_id: string;
  nodes: Array<{ node_id: string; artifact_id: string; artifact_type: string; title: string }>;
  edges: Array<{ edge_id: string; source_id: string; target_id: string; relation: string }>;
  summary: string;
  created_at: string;
}
