// Contract: EvidenceNode + EvidenceEdge + LineageSummary
export interface EvidenceNode {
  node_id: string;
  artifact_id: string;
  artifact_type: string;
  title: string;
}

export interface EvidenceEdge {
  edge_id: string;
  source_id: string;
  target_id: string;
  relation: 'produced_by' | 'contributed_to' | 'blocked_by' | 'cleared_by' | 'influenced' | 'superseded';
  notes: string;
  created_at: string;
}

export interface LineageSummary {
  artifact_id: string;
  upstream: Array<{ id: string; type: string; relation: string }>;
  downstream: Array<{ id: string; type: string; relation: string }>;
}
