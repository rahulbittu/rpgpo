// Contract: AutonomyBudget
// Location: app/lib/types.ts
// Module: app/lib/autonomy-budgets.ts

export interface AutonomyBudget {
  budget_id: string;                          // Unique ID (ab_*)
  scope_level: 'operator' | 'engine' | 'project' | 'global';
  scope_id: string;
  lane: 'dev' | 'beta' | 'prod';
  allowed_actions: string[];                  // What the system can do
  blocked_actions: string[];                  // What the system cannot do
  required_escalations: string[];             // What must be escalated
  auto_execute_green: boolean;                // Auto-run green risk tasks
  auto_execute_yellow: boolean;               // Auto-run yellow risk tasks
  auto_promote_experimental: boolean;         // Auto-promote experimental fits
  auto_learn_from_evidence: boolean;          // Update fits from evidence
  max_retries: number;                        // Max retry attempts
  max_daily_cost_usd: number;                 // Daily cost cap
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
