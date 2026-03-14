// Contract: ProjectIsolationPolicy
export interface ProjectIsolationPolicy {
  policy_id: string;
  project_id: string;
  domain: string;
  default_access: 'allow' | 'deny' | 'allow_redacted' | 'require_operator_approval';
  allowed_targets: string[];
  denied_targets: string[];
  redact_fields: string[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}
