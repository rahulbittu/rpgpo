// Contract: PolicyVersion
export interface PolicyVersion {
  version_id: string;
  target_type: string;
  target_id: string;
  version: number;
  state: Record<string, unknown>;
  effective_from: string;
  superseded_at?: string;
}
