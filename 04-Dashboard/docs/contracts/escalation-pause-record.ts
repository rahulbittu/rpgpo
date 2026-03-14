// Contract: EscalationPauseRecord
// Module: app/lib/block-resolution.ts

export interface EscalationPauseRecord {
  pause_id: string;
  graph_id: string;
  node_id?: string;
  escalation_event_id: string;
  reason: string;
  status: 'paused' | 'resumed' | 'resolved';
  resumed_at?: string;
  created_at: string;
}
