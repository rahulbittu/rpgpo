// Contract: RuntimeEnforcementSummary
// Module: app/lib/runtime-enforcement.ts

export interface RuntimeEnforcementSummary {
  total_hooks: number;
  total_blocks: number;
  total_warnings: number;
  total_pauses: number;
  active_blocks: number;
  by_transition: Record<string, number>;
  by_lane: Record<string, number>;
  created_at: string;
}
