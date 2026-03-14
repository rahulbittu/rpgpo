// Contract: RuntimeCompletionReport
export interface RuntimeCompletionReport {
  report_id: string;
  paths: Array<{ path: string; state: 'fully_enforced' | 'partially_enforced' | 'advisory_only'; detail: string }>;
  fully_enforced: number; partially_enforced: number; advisory_only: number; total: number;
  created_at: string;
}
