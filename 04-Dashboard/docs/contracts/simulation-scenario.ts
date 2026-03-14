// Contract: SimulationScenario
// Location: app/lib/types.ts
// Module: app/lib/policy-simulation.ts

export type SimulationScope = 'graph' | 'dossier' | 'release';

export interface SimulationOverrides {
  lane?: 'dev' | 'beta' | 'prod';
  policies?: Partial<Record<string, string>>;
  auto_execute_green?: boolean;
  auto_execute_yellow?: boolean;
  max_retries?: number;
  documentation_present?: string[];
  documentation_missing?: string[];
  review_verdicts?: Record<string, 'pass' | 'fail' | 'waive'>;
  provider_confidence?: number;
}

export interface SimulationScenario {
  scenario_id: string;          // ss_*
  related_type: SimulationScope;
  related_id: string;
  lane: 'dev' | 'beta' | 'prod';
  overrides: SimulationOverrides;
  created_at: string;           // ISO 8601
}
