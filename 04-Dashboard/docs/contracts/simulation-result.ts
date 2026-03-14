// Contract: SimulationResult
// Location: app/lib/types.ts
// Module: app/lib/policy-simulation.ts

export interface SimulationResult {
  result_id: string;            // sr_*
  scenario_id: string;
  related_type: 'graph' | 'dossier' | 'release';
  related_id: string;
  lane: 'dev' | 'beta' | 'prod';
  outcome: 'pass' | 'warn' | 'block';
  policy_violations: string[];
  budget_violations: string[];
  escalation_triggers: string[];
  missing_docs: string[];
  blocked_actions: string[];
  warnings: string[];
  summary: string;
  created_at: string;           // ISO 8601
}
