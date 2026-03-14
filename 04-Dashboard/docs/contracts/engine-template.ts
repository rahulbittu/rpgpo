// Contract: EngineTemplate
export interface EngineTemplate {
  template_id: string;
  name: string;
  domain_type: string;
  description: string;
  version: number;
  mission_defaults: Record<string, unknown>;
  default_projects: string[];
  recommended_skill_packs: string[];
  provider_strategy: Record<string, unknown>;
  governance_defaults: Record<string, unknown>;
  approval_defaults: Record<string, unknown>;
  docs_starters: string[];
  created_at: string;
  updated_at: string;
}
