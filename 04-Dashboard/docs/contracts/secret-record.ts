// Contract: SecretRecord (metadata only — never stores raw values)
export interface SecretRecord {
  secret_id: string;
  name: string;
  scope: 'tenant' | 'environment' | 'engine' | 'project' | 'provider';
  scope_id: string;
  provider_id?: string;
  key_prefix: string; // first 6 chars only
  created_at: string;
  rotated_at?: string;
  expires_at?: string;
  age_days: number;
  rotation_policy_days: number;
  status: 'active' | 'stale' | 'expired' | 'rotated';
}
