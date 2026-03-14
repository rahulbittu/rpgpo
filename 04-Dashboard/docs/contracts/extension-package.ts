// Contract: ExtensionPackage + ExtensionInstallRecord
export interface ExtensionPackage {
  extension_id: string; name: string; description: string; version: number;
  trust_level: 'untrusted' | 'community' | 'verified' | 'official';
  permissions: string[]; provides: string[]; dependencies: string[];
  sandbox_policy: 'strict' | 'standard' | 'permissive';
  state: 'draft' | 'published' | 'installed' | 'disabled' | 'deprecated';
  tenant_compatibility: string[]; created_at: string; updated_at: string;
}
export interface ExtensionInstallRecord {
  install_id: string; extension_id: string; tenant_id: string;
  scope_type: string; scope_id: string; installed_at: string; uninstalled_at?: string;
}
