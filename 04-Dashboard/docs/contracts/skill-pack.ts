// Contract: SkillPack + SkillPackBinding
export interface SkillPack {
  pack_id: string;
  name: string;
  description: string;
  version: number;
  state: 'draft' | 'experimental' | 'stable' | 'deprecated';
  capabilities: Array<{ capability_id: string; type: string; name: string; config: Record<string, unknown> }>;
  constraints: string[];
  dependencies: string[];
  scope: string;
  compatibility: string[];
  created_at: string;
  updated_at: string;
}

export interface SkillPackBinding {
  binding_id: string;
  pack_id: string;
  scope_type: string;
  scope_id: string;
  active: boolean;
  created_at: string;
}
