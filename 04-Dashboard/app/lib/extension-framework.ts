// GPO Extension Framework — Governed installable extension packages

import type { ExtensionPackage, ExtensionInstallRecord, ExtensionTrustLevel, ExtensionPermission } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const PACKAGES_FILE = path.resolve(__dirname, '..', '..', 'state', 'extension-packages.json');
const INSTALLS_FILE = path.resolve(__dirname, '..', '..', 'state', 'extension-installs.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

export function createPackage(opts: { name: string; description: string; provides?: string[]; permissions?: ExtensionPermission[]; trust_level?: ExtensionTrustLevel; sandbox_policy?: string }): ExtensionPackage {
  const pkgs = readJson<ExtensionPackage[]>(PACKAGES_FILE, []);
  const pkg: ExtensionPackage = {
    extension_id: uid('ext'), name: opts.name, description: opts.description,
    version: 1, trust_level: opts.trust_level || 'community',
    permissions: opts.permissions || [], provides: opts.provides || [],
    dependencies: [], sandbox_policy: (opts.sandbox_policy || 'standard') as any,
    state: 'draft', tenant_compatibility: ['*'],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  pkgs.unshift(pkg);
  if (pkgs.length > 100) pkgs.length = 100;
  writeJson(PACKAGES_FILE, pkgs);
  return pkg;
}

export function versionPackage(extId: string): ExtensionPackage | null {
  const pkgs = readJson<ExtensionPackage[]>(PACKAGES_FILE, []);
  const idx = pkgs.findIndex(p => p.extension_id === extId);
  if (idx === -1) return null;
  pkgs[idx].version++;
  pkgs[idx].updated_at = new Date().toISOString();
  writeJson(PACKAGES_FILE, pkgs);
  return pkgs[idx];
}

export function evaluateInstall(extId: string, tenantId: string): { allowed: boolean; reasons: string[] } {
  const pkg = getPackage(extId);
  if (!pkg) return { allowed: false, reasons: ['Package not found'] };
  const reasons: string[] = [];
  if (pkg.state === 'deprecated') reasons.push('Package is deprecated');
  if (pkg.trust_level === 'untrusted') reasons.push('Untrusted package');
  if (pkg.permissions.includes('access_secrets')) reasons.push('Requires secret access — review carefully');
  if (pkg.permissions.includes('modify_governance')) reasons.push('Can modify governance — elevated risk');
  return { allowed: reasons.length === 0 || !reasons.some(r => r.includes('deprecated') || r.includes('Untrusted')), reasons };
}

export function installPackage(extId: string, tenantId: string, scopeType: string = 'tenant', scopeId?: string): ExtensionInstallRecord | null {
  const check = evaluateInstall(extId, tenantId);
  if (!check.allowed) return null;
  const installs = readJson<ExtensionInstallRecord[]>(INSTALLS_FILE, []);
  const record: ExtensionInstallRecord = { install_id: uid('ei'), extension_id: extId, tenant_id: tenantId, scope_type: scopeType, scope_id: scopeId || tenantId, installed_at: new Date().toISOString() };
  installs.unshift(record);
  if (installs.length > 200) installs.length = 200;
  writeJson(INSTALLS_FILE, installs);
  // Update package state
  const pkgs = readJson<ExtensionPackage[]>(PACKAGES_FILE, []);
  const idx = pkgs.findIndex(p => p.extension_id === extId);
  if (idx >= 0) { pkgs[idx].state = 'installed'; writeJson(PACKAGES_FILE, pkgs); }
  return record;
}

export function uninstallPackage(extId: string, tenantId: string): boolean {
  const installs = readJson<ExtensionInstallRecord[]>(INSTALLS_FILE, []);
  const idx = installs.findIndex(i => i.extension_id === extId && i.tenant_id === tenantId && !i.uninstalled_at);
  if (idx === -1) return false;
  installs[idx].uninstalled_at = new Date().toISOString();
  writeJson(INSTALLS_FILE, installs);
  return true;
}

export function getPackages(): ExtensionPackage[] { return readJson<ExtensionPackage[]>(PACKAGES_FILE, []); }
export function getPackage(extId: string): ExtensionPackage | null { return getPackages().find(p => p.extension_id === extId) || null; }
export function getInstalls(tenantId?: string): ExtensionInstallRecord[] {
  const all = readJson<ExtensionInstallRecord[]>(INSTALLS_FILE, []);
  return tenantId ? all.filter(i => i.tenant_id === tenantId && !i.uninstalled_at) : all;
}

module.exports = { createPackage, versionPackage, evaluateInstall, installPackage, uninstallPackage, getPackages, getPackage, getInstalls };
