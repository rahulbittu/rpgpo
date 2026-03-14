// GPO Operator Preference Policies
// Scoped at operator/engine/project. Precedence: project > engine > operator > global defaults.
// Controls execution style, review strictness, documentation, provider overrides, etc.

import type {
  Domain, OperatorPreferencePolicy, PolicyArea, PolicyValue,
  MissionStatementLevel,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const POLICIES_FILE = path.resolve(__dirname, '..', '..', 'state', 'operator-policies.json');

function uid(): string { return 'op_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function readPolicies(): OperatorPreferencePolicy[] {
  try { return fs.existsSync(POLICIES_FILE) ? JSON.parse(fs.readFileSync(POLICIES_FILE, 'utf-8')) : []; } catch { return []; }
}

function writePolicies(p: OperatorPreferencePolicy[]): void {
  const dir = path.dirname(POLICIES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(POLICIES_FILE, JSON.stringify(p, null, 2));
}

// ═══════════════════════════════════════════
// Defaults
// ═══════════════════════════════════════════

const GLOBAL_DEFAULTS: Record<PolicyArea, PolicyValue> = {
  execution_style: 'balanced',
  review_strictness: 'balanced',
  documentation_strictness: 'balanced',
  provider_override_mode: 'advisory',
  interruption_mode: 'balanced',
  learning_promotion_mode: 'advisory',
  board_recheck_bias: 'balanced',
};

// ═══════════════════════════════════════════
// CRUD
// ═══════════════════════════════════════════

export function getAllPolicies(): OperatorPreferencePolicy[] {
  return readPolicies();
}

export function getPoliciesForDomain(domain: Domain): OperatorPreferencePolicy[] {
  return readPolicies().filter(p =>
    (p.scope_level === 'engine' && p.scope_id === domain) || p.scope_level === 'global'
  );
}

export function getPoliciesForProject(projectId: string): OperatorPreferencePolicy[] {
  return readPolicies().filter(p =>
    (p.scope_level === 'project' && p.scope_id === projectId) || p.scope_level === 'global'
  );
}

export function createPolicy(opts: {
  area: PolicyArea;
  value: PolicyValue;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  rationale?: string;
}): OperatorPreferencePolicy {
  const policies = readPolicies();
  const policy: OperatorPreferencePolicy = {
    policy_id: uid(),
    area: opts.area,
    value: opts.value,
    scope_level: opts.scope_level,
    scope_id: opts.scope_id,
    enabled: true,
    rationale: opts.rationale || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
  policies.unshift(policy);
  writePolicies(policies);
  return policy;
}

export function togglePolicy(policyId: string): OperatorPreferencePolicy | null {
  const policies = readPolicies();
  const idx = policies.findIndex(p => p.policy_id === policyId);
  if (idx === -1) return null;
  policies[idx].enabled = !policies[idx].enabled;
  policies[idx].updated_at = new Date().toISOString();
  writePolicies(policies);
  return policies[idx];
}

// ═══════════════════════════════════════════
// Policy Resolution — cascading precedence
// ═══════════════════════════════════════════

/** Resolve effective policy for a given area, respecting scope precedence */
export function resolvePolicy(
  area: PolicyArea,
  domain?: Domain,
  projectId?: string
): { value: PolicyValue; source: string } {
  const all = readPolicies().filter(p => p.area === area && p.enabled);

  // Project > engine > operator > global defaults
  if (projectId) {
    const proj = all.find(p => p.scope_level === 'project' && p.scope_id === projectId);
    if (proj) return { value: proj.value, source: `project:${projectId}` };
  }
  if (domain) {
    const eng = all.find(p => p.scope_level === 'engine' && p.scope_id === domain);
    if (eng) return { value: eng.value, source: `engine:${domain}` };
  }
  const op = all.find(p => p.scope_level === 'operator');
  if (op) return { value: op.value, source: 'operator' };

  const global = all.find(p => p.scope_level === 'global');
  if (global) return { value: global.value, source: 'global' };

  return { value: GLOBAL_DEFAULTS[area], source: 'default' };
}

/** Resolve all effective policies for a scope */
export function resolveAllPolicies(domain?: Domain, projectId?: string): Record<PolicyArea, { value: PolicyValue; source: string }> {
  const areas: PolicyArea[] = [
    'execution_style', 'review_strictness', 'documentation_strictness',
    'provider_override_mode', 'interruption_mode', 'learning_promotion_mode',
    'board_recheck_bias',
  ];
  const result: Record<string, { value: PolicyValue; source: string }> = {};
  for (const area of areas) {
    result[area] = resolvePolicy(area, domain, projectId);
  }
  return result as Record<PolicyArea, { value: PolicyValue; source: string }>;
}

module.exports = {
  getAllPolicies, getPoliciesForDomain, getPoliciesForProject,
  createPolicy, togglePolicy,
  resolvePolicy, resolveAllPolicies,
};
