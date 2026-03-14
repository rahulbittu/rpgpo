// Contract: SharedPattern
export interface SharedPattern {
  pattern_id: string;
  candidate_id: string;
  pattern_type: string;
  title: string;
  content: string;
  scope: 'project_private' | 'engine_shared' | 'operator_global';
  source_domain: string;
  uses: number;
  state: 'experimental' | 'promoted' | 'deprecated';
  created_at: string;
  updated_at: string;
}
