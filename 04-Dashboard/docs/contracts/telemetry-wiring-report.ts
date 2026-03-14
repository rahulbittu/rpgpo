// Contract: TelemetryWiringReport
export interface TelemetryWiringReport {
  report_id: string;
  flows: Array<{ flow: string; state: 'fully_wired' | 'partially_wired' | 'missing'; detail: string }>;
  fully_wired: number; partially_wired: number; missing: number; total: number;
  created_at: string;
}
