// GPO RBAC — Role-based access control + API key management

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const RBAC_FILE = path.resolve(__dirname, '..', '..', 'state', 'rbac.json');

export type UserRole = 'admin' | 'operator' | 'viewer';

export interface ApiKey {
  id: string;
  name: string;
  keyHash: string;
  prefix: string;
  role: UserRole;
  permissions: string[];
  createdAt: number;
  lastUsedAt?: number;
  expiresAt?: number;
  enabled: boolean;
}

export interface AuditEntry {
  id: string;
  timestamp: number;
  actor: string;
  action: string;
  resource: string;
  result: 'allowed' | 'denied';
  details?: string;
}

interface RbacState {
  apiKeys: ApiKey[];
  auditLog: AuditEntry[];
}

function readState(): RbacState {
  try { if (fs.existsSync(RBAC_FILE)) return JSON.parse(fs.readFileSync(RBAC_FILE, 'utf-8')); } catch { /* */ }
  return { apiKeys: [], auditLog: [] };
}

function writeState(state: RbacState): void {
  const dir = path.dirname(RBAC_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (state.auditLog.length > 1000) state.auditLog = state.auditLog.slice(-500);
  fs.writeFileSync(RBAC_FILE, JSON.stringify(state, null, 2));
}

// ── API Key Management ──

export function createApiKey(name: string, role: UserRole, permissions?: string[]): { key: string; apiKey: ApiKey } {
  const state = readState();
  const rawKey = 'gpo_' + crypto.randomBytes(24).toString('base64url');
  const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
  const apiKey: ApiKey = {
    id: 'key_' + crypto.randomBytes(4).toString('hex'),
    name, keyHash,
    prefix: rawKey.slice(0, 8),
    role,
    permissions: permissions || getDefaultPermissions(role),
    createdAt: Date.now(),
    enabled: true,
  };
  state.apiKeys.push(apiKey);
  writeState(state);
  return { key: rawKey, apiKey };
}

export function validateApiKey(key: string): ApiKey | null {
  if (!key) return null;
  const state = readState();
  const keyHash = crypto.createHash('sha256').update(key).digest('hex');
  const apiKey = state.apiKeys.find(k => k.keyHash === keyHash && k.enabled);
  if (!apiKey) return null;
  if (apiKey.expiresAt && apiKey.expiresAt < Date.now()) return null;
  // Update last used
  apiKey.lastUsedAt = Date.now();
  writeState(state);
  return apiKey;
}

export function listApiKeys(): Array<Omit<ApiKey, 'keyHash'>> {
  return readState().apiKeys.map(k => {
    const { keyHash, ...rest } = k;
    return rest;
  });
}

export function revokeApiKey(id: string): boolean {
  const state = readState();
  const key = state.apiKeys.find(k => k.id === id);
  if (!key) return false;
  key.enabled = false;
  writeState(state);
  return true;
}

// ── Permission Checks ──

export function checkPermission(role: UserRole, action: string): boolean {
  const permissions = getDefaultPermissions(role);
  return permissions.includes(action) || permissions.includes('*');
}

function getDefaultPermissions(role: UserRole): string[] {
  switch (role) {
    case 'admin': return ['*'];
    case 'operator': return ['read', 'write', 'execute', 'approve', 'configure'];
    case 'viewer': return ['read'];
    default: return ['read'];
  }
}

// ── Audit Trail ──

export function recordAudit(actor: string, action: string, resource: string, result: 'allowed' | 'denied', details?: string): void {
  const state = readState();
  state.auditLog.push({
    id: 'aud_' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'),
    timestamp: Date.now(),
    actor, action, resource, result, details,
  });
  writeState(state);
}

export function getAuditLog(limit?: number): AuditEntry[] {
  return readState().auditLog.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit || 50);
}

module.exports = { createApiKey, validateApiKey, listApiKeys, revokeApiKey, checkPermission, recordAudit, getAuditLog };
