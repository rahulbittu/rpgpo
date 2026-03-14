// Contract: UXConsistencyReport
export interface UXConsistencyReport {
  report_id: string; navigation_entries: number; navigation_gaps: number;
  refresh_plans: number; drilldowns: number;
  journey_pass: number; journey_partial: number; journey_fail: number;
  overall: 'consistent' | 'partial' | 'inconsistent'; created_at: string;
}
