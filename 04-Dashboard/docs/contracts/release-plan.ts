// Contract: ReleasePlan
export interface ReleasePlan {
  plan_id: string;
  project_id: string;
  domain: string;
  target_lane: string;
  title: string;
  source_dossier_ids: string[];
  source_graph_ids: string[];
  status: 'draft' | 'approved' | 'executing' | 'verifying' | 'completed' | 'halted' | 'rolled_back';
  checkpoints: Array<{ checkpoint_id: string; title: string; required: boolean; passed: boolean }>;
  created_at: string;
  updated_at: string;
}
