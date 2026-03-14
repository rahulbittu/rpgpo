// Contract: DeploymentReadinessReport
export interface DeploymentReadinessReport {
  report_id: string;
  scope_type: string;
  scope_id: string;
  overall_score: number;
  dimensions: Array<{ dimension: string; score: number; max_score: number; status: string; details: string }>;
  blockers: string[];
  warnings: string[];
  risks: Array<{ category: string; severity: string; description: string }>;
  recommended_fixes: string[];
  created_at: string;
}
