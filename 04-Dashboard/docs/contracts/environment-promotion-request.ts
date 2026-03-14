// Contract: EnvironmentPromotionRequest
export interface EnvironmentPromotionRequest {
  request_id: string;
  dossier_id: string;
  source_lane: string;
  target_lane: string;
  project_id?: string;
  domain: string;
  status: 'draft' | 'awaiting_approval' | 'approved' | 'executing' | 'verified' | 'blocked' | 'rolled_back' | 'completed';
  blockers: string[];
  approvals_required: string[];
  approvals_obtained: string[];
  readiness_score?: number;
  docs_complete: boolean;
  exceptions_open: number;
  created_at: string;
  updated_at: string;
}
