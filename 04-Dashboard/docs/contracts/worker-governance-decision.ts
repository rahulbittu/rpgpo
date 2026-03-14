// Contract: WorkerGovernanceDecision
// Module: app/lib/worker-governance.ts

export interface WorkerGovernanceDecision {
  decision_id: string;
  graph_id: string;
  node_id?: string;
  action: string;
  outcome: 'proceed' | 'proceed_with_warning' | 'block' | 'require_override' | 'pause_for_escalation';
  retry_allowed: boolean;
  max_retries_remaining: number;
  reasons: string[];
  created_at: string;
}
