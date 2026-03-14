// Contract: EscalationInboxItem
export interface EscalationInboxItem {
  item_id: string;
  source_type: string;
  source_id: string;
  title: string;
  detail: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'new' | 'triaged' | 'in_review' | 'delegated' | 'resolved' | 'dismissed';
  owner?: string;
  domain?: string;
  project_id?: string;
  thread: Array<{ actor: string; action: string; notes: string; created_at: string }>;
  created_at: string;
  updated_at: string;
}
