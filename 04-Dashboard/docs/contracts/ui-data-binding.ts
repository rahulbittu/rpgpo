// Contract: UIWiringGap
export interface UIWiringGap {
  area: string;
  surface: string;
  gap_type: 'no_data' | 'no_navigation' | 'no_detail' | 'no_action' | 'summary_only' | 'no_empty_state';
  description: string;
  fix: string;
}
