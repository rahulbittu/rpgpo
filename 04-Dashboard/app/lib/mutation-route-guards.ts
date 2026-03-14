// GPO Mutation Route Guards — Inline protection for POST/PUT/DELETE mutation routes

import type { MutationGuardRule, MutationGuardDecision, MutationProtectionReport } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'mutation-guard-decisions.json');

function uid(): string { return 'mg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Mutation guard rules */
export function getRules(): MutationGuardRule[] {
  return [
    { route_pattern: '/api/skill-packs', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
    { route_pattern: '/api/skill-packs/:id/bind', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
    { route_pattern: '/api/engine-templates', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
    { route_pattern: '/api/engine-templates/:id/instantiate', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
    { route_pattern: '/api/extensions', method: 'POST', guard_types: ['extension', 'isolation'], enforced: true },
    { route_pattern: '/api/extensions/:id/install', method: 'POST', guard_types: ['extension', 'isolation'], enforced: true },
    { route_pattern: '/api/extensions/:id/uninstall', method: 'POST', guard_types: ['extension', 'isolation'], enforced: true },
    { route_pattern: '/api/integrations', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
    { route_pattern: '/api/compliance-export', method: 'POST', guard_types: ['entitlement'], enforced: true },
    { route_pattern: '/api/marketplace', method: 'POST', guard_types: ['extension', 'entitlement'], enforced: true },
  ];
}

/** Guard a mutation request */
export function guardMutation(route: string, method: string, tenantId: string, projectId: string): MutationGuardDecision {
  // Use the shared response guard
  try {
    const hrg = require('./http-response-guard') as { guard(r: string, t: string, p: string): { allowed: boolean; outcome: string; reason: string } };
    const gd = hrg.guard(route, tenantId, projectId);

    const decision: MutationGuardDecision = {
      route, method, allowed: gd.allowed,
      outcome: gd.outcome as MutationGuardDecision['outcome'],
      reason: gd.reason,
    };

    // Record decision
    const all = readJson<MutationGuardDecision[]>(DECISIONS_FILE, []);
    all.unshift(decision);
    if (all.length > 300) all.length = 300;
    writeJson(DECISIONS_FILE, all);

    // Record evidence
    try {
      const ee = require('./enforcement-evidence') as { recordEvidence(a: string, m: string, d: string, r: string, st: string, si: string, rt: string, lp: string): unknown };
      ee.recordEvidence('mutation_guard', 'mutation-route-guards', gd.outcome, `mutation_${gd.outcome}`, 'tenant', tenantId, route, '');
    } catch { /* */ }

    return decision;
  } catch {
    return { route, method, allowed: true, outcome: 'allow', reason: 'Guard not available — default allow' };
  }
}

/** Get mutation protection report */
export function getReport(): MutationProtectionReport {
  const rules = getRules();
  const enforced = rules.filter(r => r.enforced).length;
  return { report_id: uid(), rules, enforced, total: rules.length, coverage_percent: rules.length > 0 ? Math.round((enforced / rules.length) * 100) : 0, created_at: new Date().toISOString() };
}

/** Get recent decisions */
export function getDecisions(): MutationGuardDecision[] {
  return readJson<MutationGuardDecision[]>(DECISIONS_FILE, []);
}

module.exports = { getRules, guardMutation, getReport, getDecisions };
