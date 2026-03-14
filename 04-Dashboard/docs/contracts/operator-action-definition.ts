// Contract: OperatorActionDefinition
export interface OperatorActionDefinition {
  action_id: string; area: string; label: string;
  api_endpoint: string; method: 'GET' | 'POST';
  requires_input: boolean; visible_in_ui: boolean;
  entitlement_required?: string;
}
