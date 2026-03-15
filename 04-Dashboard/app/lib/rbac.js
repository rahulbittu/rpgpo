"use strict";
// GPO RBAC — Role-based access control + API key management
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApiKey = createApiKey;
exports.validateApiKey = validateApiKey;
exports.listApiKeys = listApiKeys;
exports.revokeApiKey = revokeApiKey;
exports.checkPermission = checkPermission;
exports.recordAudit = recordAudit;
exports.getAuditLog = getAuditLog;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const RBAC_FILE = path.resolve(__dirname, '..', '..', 'state', 'rbac.json');
function readState() {
    try {
        if (fs.existsSync(RBAC_FILE))
            return JSON.parse(fs.readFileSync(RBAC_FILE, 'utf-8'));
    }
    catch { /* */ }
    return { apiKeys: [], auditLog: [] };
}
function writeState(state) {
    const dir = path.dirname(RBAC_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    if (state.auditLog.length > 1000)
        state.auditLog = state.auditLog.slice(-500);
    fs.writeFileSync(RBAC_FILE, JSON.stringify(state, null, 2));
}
// ── API Key Management ──
function createApiKey(name, role, permissions) {
    const state = readState();
    const rawKey = 'gpo_' + crypto.randomBytes(24).toString('base64url');
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');
    const apiKey = {
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
function validateApiKey(key) {
    if (!key)
        return null;
    const state = readState();
    const keyHash = crypto.createHash('sha256').update(key).digest('hex');
    const apiKey = state.apiKeys.find(k => k.keyHash === keyHash && k.enabled);
    if (!apiKey)
        return null;
    if (apiKey.expiresAt && apiKey.expiresAt < Date.now())
        return null;
    // Update last used
    apiKey.lastUsedAt = Date.now();
    writeState(state);
    return apiKey;
}
function listApiKeys() {
    return readState().apiKeys.map(k => {
        const { keyHash, ...rest } = k;
        return rest;
    });
}
function revokeApiKey(id) {
    const state = readState();
    const key = state.apiKeys.find(k => k.id === id);
    if (!key)
        return false;
    key.enabled = false;
    writeState(state);
    return true;
}
// ── Permission Checks ──
function checkPermission(role, action) {
    const permissions = getDefaultPermissions(role);
    return permissions.includes(action) || permissions.includes('*');
}
function getDefaultPermissions(role) {
    switch (role) {
        case 'admin': return ['*'];
        case 'operator': return ['read', 'write', 'execute', 'approve', 'configure'];
        case 'viewer': return ['read'];
        default: return ['read'];
    }
}
// ── Audit Trail ──
function recordAudit(actor, action, resource, result, details) {
    const state = readState();
    state.auditLog.push({
        id: 'aud_' + Date.now().toString(36) + crypto.randomBytes(2).toString('hex'),
        timestamp: Date.now(),
        actor, action, resource, result, details,
    });
    writeState(state);
}
function getAuditLog(limit) {
    return readState().auditLog.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit || 50);
}
module.exports = { createApiKey, validateApiKey, listApiKeys, revokeApiKey, checkPermission, recordAudit, getAuditLog };
