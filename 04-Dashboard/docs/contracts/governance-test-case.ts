// Contract: GovernanceTestCase
// Location: app/lib/types.ts
// Module: app/lib/governance-testing.ts

export interface GovernanceTestCase {
  test_id: string;              // gt_*
  title: string;
  description: string;
  related_type: 'graph' | 'dossier' | 'release';
  related_id: string;
  scenario: SimulationOverrides;
  expected_outcome: 'pass' | 'warn' | 'block';
  actual_outcome?: 'pass' | 'warn' | 'block';
  passed?: boolean;
  last_run_at?: string;
  created_at: string;           // ISO 8601
}
