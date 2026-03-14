// Contract: UIReadinessReport
export interface UIReadinessReport {
  report_id: string;
  overall_score: number;
  area_scores: Record<string, { score: number; max: number; status: string }>;
  blocking_gaps: string[];
  e2e_checks: Array<{ flow: string; status: 'pass' | 'partial' | 'fail'; detail: string }>;
  created_at: string;
}
