// Contract: OperatorJourney
export interface OperatorJourney {
  journey_id: string; name: string;
  steps: Array<{ step: string; discoverable: boolean; actionable: boolean; has_feedback: boolean; has_refresh: boolean }>;
  overall: 'pass' | 'partial' | 'fail';
}
