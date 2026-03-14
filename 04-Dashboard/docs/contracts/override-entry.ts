// Contract: OverrideEntry
// Location: app/lib/types.ts
// Module: app/lib/override-ledger.ts

export type OverrideType = 'promotion_block' | 'documentation_gap' | 'readiness_shortfall' | 'review_failure' | 'escalation_conflict' | 'provider_instability' | 'experimental_dependency';
export type OverrideStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'consumed';

export interface OverrideEntry {
  override_id: string;
  related_type: 'graph' | 'dossier' | 'release';
  related_id: string;
  action: string;
  override_type: OverrideType;
  reason: string;
  notes: string;
  status: OverrideStatus;
  requested_by: string;
  resolved_by?: string;
  resolved_at?: string;
  expires_at?: string;
  remediation_items: string[];
  created_at: string;
}
