// Contract: E2EFlowRun
export interface E2EFlowRun {
  run_id: string; flow_id: string; flow_name: string;
  steps: Array<{ step: string; status: 'pass' | 'fail' | 'skip'; detail: string }>;
  overall: 'pass' | 'partial' | 'fail';
  created_at: string;
}
