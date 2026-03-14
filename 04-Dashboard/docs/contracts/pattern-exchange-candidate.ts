// Contract: PatternExchangeCandidate
export interface PatternExchangeCandidate {
  candidate_id: string;
  source_project: string;
  source_domain: string;
  candidate_type: string;
  title: string;
  content: string;
  redacted_content: string;
  artifact_ref: string;
  status: 'pending' | 'approved' | 'rejected' | 'promoted';
  target_scope: 'project_private' | 'engine_shared' | 'operator_global';
  created_at: string;
}
