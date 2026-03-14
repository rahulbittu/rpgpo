// Contract: RuntimeGovernanceEvent
// Module: app/lib/runtime-enforcement.ts

export interface RuntimeGovernanceEvent {
  event_id: string;
  transition: 'graph_create' | 'node_queue' | 'node_start' | 'node_complete' | 'review_complete' | 'dossier_generate' | 'promotion_attempt';
  graph_id: string;
  node_id?: string;
  outcome: 'proceed' | 'proceed_with_warning' | 'block' | 'require_override' | 'pause_for_escalation';
  detail: string;
  lane?: string;
  domain?: string;
  created_at: string;
}
