// Contract: ActivatedWorkflow
export interface ActivatedWorkflow {
  workflow_id: string; name: string; area: string; entry_point: string;
  api_endpoints: string[];
  steps: Array<{ step: string; ui_visible: boolean; api_connected: boolean; state_mutates: boolean; result_visible: boolean }>;
  state: 'not_started' | 'partially_activated' | 'activated' | 'blocked' | 'broken';
  blockers: string[];
}
