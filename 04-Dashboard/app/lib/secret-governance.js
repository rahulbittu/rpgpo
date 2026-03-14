"use strict";
// GPO Secret Governance — Metadata-only secret management, never stores raw values
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSecrets = getSecrets;
exports.evaluateAccess = evaluateAccess;
exports.recordUsage = recordUsage;
exports.getUsage = getUsage;
const fs = require('fs');
const path = require('path');
const SECRETS_FILE = path.resolve(__dirname, '..', '..', 'state', 'secret-records.json');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'secret-decisions.json');
const USAGE_FILE = path.resolve(__dirname, '..', '..', 'state', 'secret-usage.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Register built-in secrets from environment */
function ensureDefaults() {
    let records = readJson(SECRETS_FILE, []);
    if (records.length > 0)
        return records;
    const now = new Date();
    const envSecrets = [
        { name: 'OPENAI_API_KEY', scope: 'provider', scope_id: 'openai', provider_id: 'openai', key_prefix: process.env.OPENAI_API_KEY?.slice(0, 6) || 'none' },
        { name: 'PERPLEXITY_API_KEY', scope: 'provider', scope_id: 'perplexity', provider_id: 'perplexity', key_prefix: process.env.PERPLEXITY_API_KEY?.slice(0, 6) || 'none' },
        { name: 'GEMINI_API_KEY', scope: 'provider', scope_id: 'gemini', provider_id: 'gemini', key_prefix: process.env.GEMINI_API_KEY?.slice(0, 6) || 'none' },
    ];
    records = envSecrets.map(s => ({
        secret_id: uid('sc'), name: s.name, scope: s.scope, scope_id: s.scope_id,
        provider_id: s.provider_id, key_prefix: s.key_prefix,
        created_at: now.toISOString(), age_days: 0, rotation_policy_days: 90,
        status: s.key_prefix === 'none' ? 'expired' : 'active',
    }));
    writeJson(SECRETS_FILE, records);
    return records;
}
function getSecrets(scopeType, scopeId) {
    const all = ensureDefaults();
    if (scopeType && scopeId)
        return all.filter(s => s.scope === scopeType && s.scope_id === scopeId);
    if (scopeType)
        return all.filter(s => s.scope === scopeType);
    return all;
}
function evaluateAccess(secretId, actor, action) {
    let outcome = 'deny';
    let reason = 'Default deny';
    const secret = ensureDefaults().find(s => s.secret_id === secretId);
    if (!secret) {
        reason = 'Secret not found';
    }
    else if (actor === 'system' || actor === 'chief_of_staff') {
        outcome = 'redacted';
        reason = 'System access — metadata only';
    }
    else if (actor === 'operator') {
        outcome = 'allow';
        reason = 'Operator has full access';
    }
    else {
        outcome = 'deny';
        reason = 'Non-authorized actor';
    }
    const decision = { decision_id: uid('sd'), secret_id: secretId, actor, action, outcome, reason, created_at: new Date().toISOString() };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 300)
        decisions.length = 300;
    writeJson(DECISIONS_FILE, decisions);
    return decision;
}
function recordUsage(secretId, actor, action) {
    const event = { event_id: uid('su'), secret_id: secretId, actor, action, created_at: new Date().toISOString() };
    const events = readJson(USAGE_FILE, []);
    events.unshift(event);
    if (events.length > 500)
        events.length = 500;
    writeJson(USAGE_FILE, events);
    return event;
}
function getUsage() { return readJson(USAGE_FILE, []); }
module.exports = { getSecrets, evaluateAccess, recordUsage, getUsage };
//# sourceMappingURL=secret-governance.js.map