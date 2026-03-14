// Contract: VisibleOperatorAction
export interface VisibleOperatorAction {
  action_id: string; area: string; label: string; api_endpoint: string;
  visible: boolean; has_loading: boolean; has_error: boolean; has_refresh: boolean;
  activation: 'full' | 'partial' | 'hidden';
}
