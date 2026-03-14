// Contract: ExceptionCase
// Module: app/lib/exception-lifecycle.ts

export type ExceptionLifecycleStage = 'opened' | 'triaged' | 'assigned' | 'approved' | 'rejected' | 'in_remediation' | 'resolved' | 'verified' | 'expired' | 'consumed' | 'closed';

export interface ExceptionCase {
  case_id: string;
  source_type: 'enforcement' | 'override' | 'runtime_block' | 'escalation' | 'promotion_block';
  source_id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stage: ExceptionLifecycleStage;
  owner?: string;
  due_date?: string;
  graph_id?: string;
  node_id?: string;
  dossier_id?: string;
  domain?: string;
  project_id?: string;
  lane?: string;
  linked_override_ids: string[];
  linked_block_ids: string[];
  linked_escalation_ids: string[];
  remediation_notes: string;
  resolution_outcome?: 'fixed' | 'accepted' | 'deferred' | 'wont_fix';
  created_at: string;
  updated_at: string;
}
