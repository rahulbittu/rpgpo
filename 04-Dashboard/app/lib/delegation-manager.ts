// GPO Delegation Manager — Optional human delegation for approvals/escalations

import type { DelegationRule, ApprovalSourceType, MissionStatementLevel, Lane } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RULES_FILE = path.resolve(__dirname, '..', '..', 'state', 'delegation-rules.json');

function uid(): string { return 'dl_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Create a delegation rule */
export function createRule(opts: {
  approval_type: ApprovalSourceType;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  delegated_to: string;
  fallback_to?: string;
  lane?: Lane;
  expires_at?: string;
}): DelegationRule {
  const rules = readJson<DelegationRule[]>(RULES_FILE, []);
  const rule: DelegationRule = {
    rule_id: uid(),
    approval_type: opts.approval_type,
    scope_level: opts.scope_level,
    scope_id: opts.scope_id,
    lane: opts.lane,
    delegated_to: opts.delegated_to,
    fallback_to: opts.fallback_to || 'operator',
    expires_at: opts.expires_at,
    enabled: true,
    created_at: new Date().toISOString(),
  };
  rules.unshift(rule);
  writeJson(RULES_FILE, rules);
  return rule;
}

export function getAllRules(): DelegationRule[] { return readJson<DelegationRule[]>(RULES_FILE, []); }

export function toggleRule(ruleId: string): DelegationRule | null {
  const rules = getAllRules();
  const idx = rules.findIndex(r => r.rule_id === ruleId);
  if (idx === -1) return null;
  rules[idx].enabled = !rules[idx].enabled;
  writeJson(RULES_FILE, rules);
  return rules[idx];
}

/** Find a delegation target for an approval type and scope */
export function findDelegate(approvalType: ApprovalSourceType, scopeLevel: string, scopeId: string, lane?: Lane): string | null {
  const now = new Date().toISOString();
  const rules = getAllRules().filter(r =>
    r.enabled && r.approval_type === approvalType &&
    (r.scope_level === scopeLevel && r.scope_id === scopeId || r.scope_level === 'global') &&
    (!r.lane || r.lane === lane) &&
    (!r.expires_at || r.expires_at > now)
  );
  return rules.length > 0 ? rules[0].delegated_to : null;
}

module.exports = { createRule, getAllRules, toggleRule, findDelegate };
