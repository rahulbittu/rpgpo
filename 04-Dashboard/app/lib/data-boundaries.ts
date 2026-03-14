// GPO Data Boundary Controls — Enforce tenant and project data boundaries

import type { DataBoundaryPolicy, BoundaryAccessDecision, BoundaryAccessOutcome, BoundaryViolationRecord } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const POLICIES_FILE = path.resolve(__dirname, '..', '..', 'state', 'data-boundary-policies.json');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'boundary-decisions.json');
const VIOLATIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'boundary-violations-db.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

function defaultPolicies(): DataBoundaryPolicy[] {
  return [
    { policy_id: 'bp_cross_tenant', source_scope: 'tenant:*', target_scope: 'tenant:*', artifact_type: '*', outcome: 'deny', enabled: true, created_at: new Date().toISOString() },
    { policy_id: 'bp_cross_project', source_scope: 'project:*', target_scope: 'project:*', artifact_type: 'context', outcome: 'redact', enabled: true, created_at: new Date().toISOString() },
    { policy_id: 'bp_cross_project_api', source_scope: 'project:*', target_scope: 'project:*', artifact_type: '*', outcome: 'deny', enabled: true, created_at: new Date().toISOString() },
    { policy_id: 'bp_export', source_scope: 'tenant:*', target_scope: 'external', artifact_type: 'compliance_export', outcome: 'redact', enabled: true, created_at: new Date().toISOString() },
    { policy_id: 'bp_collab', source_scope: 'project:*', target_scope: 'project:*', artifact_type: 'collaboration', outcome: 'redact', enabled: true, created_at: new Date().toISOString() },
  ];
}

export function getPolicies(): DataBoundaryPolicy[] {
  const stored = readJson<DataBoundaryPolicy[]>(POLICIES_FILE, []);
  return stored.length > 0 ? stored : defaultPolicies();
}

/** Evaluate a data boundary access decision */
export function evaluateBoundary(sourceScope: string, targetScope: string, artifactType: string, action: string = 'read'): BoundaryAccessDecision {
  const policies = getPolicies();
  let outcome: BoundaryAccessOutcome = 'allow';
  let reason = 'No boundary restriction';

  // Same scope = always allow
  if (sourceScope === targetScope) {
    outcome = 'allow'; reason = 'Same scope';
  } else {
    // Check policies — prefer specific artifact matches over wildcards
    const enabled = policies.filter(pp => pp.enabled);
    // First pass: exact artifact match
    for (const p of enabled) {
      if (p.artifact_type === '*') continue;
      const srcMatch = p.source_scope === sourceScope || (p.source_scope.endsWith(':*') && sourceScope.startsWith(p.source_scope.split(':')[0]));
      const tgtMatch = p.target_scope === targetScope || (p.target_scope.endsWith(':*') && targetScope.startsWith(p.target_scope.split(':')[0]));
      if (srcMatch && tgtMatch && p.artifact_type === artifactType) {
        outcome = p.outcome;
        reason = `Matched policy ${p.policy_id}: ${p.source_scope} → ${p.target_scope} (artifact: ${p.artifact_type})`;
        break;
      }
    }
    // Second pass: wildcard artifact if no specific match found
    if (outcome === 'allow' && reason === 'No boundary restriction') {
      for (const p of enabled) {
        const srcMatch = p.source_scope === sourceScope || (p.source_scope.endsWith(':*') && sourceScope.startsWith(p.source_scope.split(':')[0]));
        const tgtMatch = p.target_scope === targetScope || (p.target_scope.endsWith(':*') && targetScope.startsWith(p.target_scope.split(':')[0]));
        const artMatch = p.artifact_type === '*';
        if (srcMatch && tgtMatch && artMatch) {
          outcome = p.outcome;
          reason = `Matched policy ${p.policy_id}: ${p.source_scope} → ${p.target_scope}`;
          break;
        }
      }
    }
  }

  const decision: BoundaryAccessDecision = { decision_id: uid('bd'), source_scope: sourceScope, target_scope: targetScope, artifact_type: artifactType, action, outcome, reason, created_at: new Date().toISOString() };
  const decisions = readJson<BoundaryAccessDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 300) decisions.length = 300;
  writeJson(DECISIONS_FILE, decisions);

  // Record violation if denied
  if (outcome === 'deny') {
    recordViolation(sourceScope, targetScope, artifactType, 'high', reason);
  }

  return decision;
}

export function recordViolation(sourceScope: string, targetScope: string, artifactType: string, severity: BoundaryViolationRecord['severity'] = 'medium', detail: string = ''): BoundaryViolationRecord {
  const violations = readJson<BoundaryViolationRecord[]>(VIOLATIONS_FILE, []);
  const v: BoundaryViolationRecord = { violation_id: uid('bv'), source_scope: sourceScope, target_scope: targetScope, artifact_type: artifactType, severity, detail, created_at: new Date().toISOString() };
  violations.unshift(v);
  if (violations.length > 300) violations.length = 300;
  writeJson(VIOLATIONS_FILE, violations);
  return v;
}

export function getViolations(): BoundaryViolationRecord[] { return readJson<BoundaryViolationRecord[]>(VIOLATIONS_FILE, []); }

module.exports = { getPolicies, evaluateBoundary, recordViolation, getViolations };
