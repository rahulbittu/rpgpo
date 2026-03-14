// Contract: AlertRoutingDecision
export interface AlertRoutingDecision {
  alert_id: string; category: string; severity: 'info' | 'warning' | 'critical';
  target: 'escalation_inbox' | 'approval_workspace' | 'admin_workspace' | 'operator_home';
  detail: string; delivered: boolean; deduped: boolean; created_at: string;
}
