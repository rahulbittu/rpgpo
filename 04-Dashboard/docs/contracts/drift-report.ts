// Contract: DriftSignal + DriftReport
// Location: app/lib/types.ts
// Module: app/lib/governance-drift.ts

export interface DriftSignal {
  signal_id: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  scope_level: string;
  scope_id: string;
  description: string;
  evidence_count: number;
  first_seen: string;
  last_seen: string;
}

export interface DriftReport {
  report_id: string;
  scope_level: string;
  scope_id: string;
  signals: DriftSignal[];
  summary: string;
  created_at: string;
}
