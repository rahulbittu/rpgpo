// GPO Secret Governance — Metadata-only secret management, never stores raw values

import type { SecretRecord, SecretScope, SecretAccessDecision, SecretAccessOutcome, SecretUsageEvent, Provider } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const SECRETS_FILE = path.resolve(__dirname, '..', '..', 'state', 'secret-records.json');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'secret-decisions.json');
const USAGE_FILE = path.resolve(__dirname, '..', '..', 'state', 'secret-usage.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Register built-in secrets from environment */
function ensureDefaults(): SecretRecord[] {
  let records = readJson<SecretRecord[]>(SECRETS_FILE, []);
  if (records.length > 0) return records;

  const now = new Date();
  const envSecrets = [
    { name: 'OPENAI_API_KEY', scope: 'provider' as SecretScope, scope_id: 'openai', provider_id: 'openai' as Provider, key_prefix: process.env.OPENAI_API_KEY?.slice(0, 6) || 'none' },
    { name: 'PERPLEXITY_API_KEY', scope: 'provider' as SecretScope, scope_id: 'perplexity', provider_id: 'perplexity' as Provider, key_prefix: process.env.PERPLEXITY_API_KEY?.slice(0, 6) || 'none' },
    { name: 'GEMINI_API_KEY', scope: 'provider' as SecretScope, scope_id: 'gemini', provider_id: 'gemini' as Provider, key_prefix: process.env.GEMINI_API_KEY?.slice(0, 6) || 'none' },
  ];

  records = envSecrets.map(s => ({
    secret_id: uid('sc'), name: s.name, scope: s.scope, scope_id: s.scope_id,
    provider_id: s.provider_id, key_prefix: s.key_prefix,
    created_at: now.toISOString(), age_days: 0, rotation_policy_days: 90,
    status: s.key_prefix === 'none' ? 'expired' : 'active' as SecretRecord['status'],
  }));

  writeJson(SECRETS_FILE, records);
  return records;
}

export function getSecrets(scopeType?: SecretScope, scopeId?: string): SecretRecord[] {
  const all = ensureDefaults();
  if (scopeType && scopeId) return all.filter(s => s.scope === scopeType && s.scope_id === scopeId);
  if (scopeType) return all.filter(s => s.scope === scopeType);
  return all;
}

export function evaluateAccess(secretId: string, actor: string, action: string): SecretAccessDecision {
  let outcome: SecretAccessOutcome = 'deny';
  let reason = 'Default deny';

  const secret = ensureDefaults().find(s => s.secret_id === secretId);
  if (!secret) { reason = 'Secret not found'; }
  else if (actor === 'system' || actor === 'chief_of_staff') { outcome = 'redacted'; reason = 'System access — metadata only'; }
  else if (actor === 'operator') { outcome = 'allow'; reason = 'Operator has full access'; }
  else { outcome = 'deny'; reason = 'Non-authorized actor'; }

  const decision: SecretAccessDecision = { decision_id: uid('sd'), secret_id: secretId, actor, action, outcome, reason, created_at: new Date().toISOString() };
  const decisions = readJson<SecretAccessDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 300) decisions.length = 300;
  writeJson(DECISIONS_FILE, decisions);
  return decision;
}

export function recordUsage(secretId: string, actor: string, action: string): SecretUsageEvent {
  const event: SecretUsageEvent = { event_id: uid('su'), secret_id: secretId, actor, action, created_at: new Date().toISOString() };
  const events = readJson<SecretUsageEvent[]>(USAGE_FILE, []);
  events.unshift(event);
  if (events.length > 500) events.length = 500;
  writeJson(USAGE_FILE, events);
  return event;
}

export function getUsage(): SecretUsageEvent[] { return readJson<SecretUsageEvent[]>(USAGE_FILE, []); }

module.exports = { getSecrets, evaluateAccess, recordUsage, getUsage };
