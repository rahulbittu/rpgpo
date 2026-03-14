// Contract: CapabilityCompositionPlan
export interface CapabilityCompositionPlan {
  plan_id: string;
  engine_id: string;
  project_id?: string;
  active_capabilities: Array<{ name: string; source: string; stable: boolean }>;
  blocked_capabilities: Array<{ name: string; reason: string }>;
  template_source?: string;
  skill_pack_sources: string[];
  override_count: number;
  created_at: string;
}
