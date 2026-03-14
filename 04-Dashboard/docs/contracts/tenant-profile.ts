// Contract: TenantProfile
export interface TenantProfile {
  tenant_id: string;
  name: string;
  plan: 'personal' | 'pro' | 'team' | 'enterprise';
  enabled_engines: string[];
  enabled_modules: string[];
  environment: { lanes_enabled: string[]; storage_root: string; deployment_target: string; auto_refresh_interval_ms: number };
  governance_defaults: Record<string, unknown>;
  isolation_state: 'strict' | 'shared' | 'custom';
  created_at: string;
  updated_at: string;
}
