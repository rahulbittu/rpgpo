// GPO Protected Path Validation — End-to-end validation of protected paths with real middleware execution

import type { ProtectedPath, ProtectedPathValidationRun, ProtectedPathStepResult, ProtectedPathSummary } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RUNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'protected-path-runs.json');

function uid(): string { return 'pp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Define the 8+ protected paths to validate */
export function getProtectedPaths(): ProtectedPath[] {
  return [
    {
      path_id: 'pp_entitlement_deny',
      name: 'Non-entitled tenant on compliance route',
      description: 'Free-tier tenant hits /api/compliance-export, should be denied',
      route: '/api/compliance-export',
      protection_type: 'entitlement',
      expected_outcome: 'deny',
      scenario: 'Tenant with free plan accessing team-only compliance export',
    },
    {
      path_id: 'pp_cross_project_boundary',
      name: 'Cross-project memory/audit query',
      description: 'Tenant queries audit data scoped to a different project',
      route: '/api/audit-hub',
      protection_type: 'boundary',
      expected_outcome: 'deny',
      scenario: 'Source scope project:A querying target scope project:B audit',
    },
    {
      path_id: 'pp_cross_tenant_isolation',
      name: 'Cross-tenant query attempt',
      description: 'Tenant A tries to access tenant B resources',
      route: '/api/tenant-admin',
      protection_type: 'tenant_isolation',
      expected_outcome: 'deny',
      scenario: 'Tenant rpgpo-other querying tenant rpgpo resources',
    },
    {
      path_id: 'pp_boundary_redaction',
      name: 'Cross-project boundary enforcement',
      description: 'Cross-project request where boundary policy enforces deny/redact',
      route: '/api/evidence-chain',
      protection_type: 'boundary',
      expected_outcome: 'deny',
      scenario: 'Cross-project evidence query blocked by boundary enforcement',
    },
    {
      path_id: 'pp_extension_denied',
      name: 'Extension action denied by permission',
      description: 'Untrusted extension attempts privileged action',
      route: '/api/extensions/untrusted/action',
      protection_type: 'extension_permission',
      expected_outcome: 'deny',
      scenario: 'Extension with community trust attempts data_write action',
    },
    {
      path_id: 'pp_provider_gate_release',
      name: 'Release blocked by provider governance',
      description: 'Release approval checked against provider health gate',
      route: '/api/release-provider-gating',
      protection_type: 'provider_gate',
      expected_outcome: 'allow',
      scenario: 'Provider health clear, release allowed to proceed',
    },
    {
      path_id: 'pp_entitlement_allow',
      name: 'Entitled tenant on protected route',
      description: 'Pro-tier tenant hits /api/release-orchestration, should be allowed',
      route: '/api/release-orchestration',
      protection_type: 'entitlement',
      expected_outcome: 'allow',
      scenario: 'Tenant with pro plan accessing release orchestration',
    },
    {
      path_id: 'pp_same_scope_boundary',
      name: 'Same-scope boundary allowed',
      description: 'Request within same tenant/project scope should pass boundary',
      route: '/api/audit-hub',
      protection_type: 'boundary',
      expected_outcome: 'allow',
      scenario: 'Source and target in same tenant:rpgpo scope',
    },
  ];
}

/** Run validation for a single protected path — exercises real middleware */
export function validatePath(pathId: string): ProtectedPathValidationRun {
  const paths = getProtectedPaths();
  const pp = paths.find(p => p.path_id === pathId);
  if (!pp) {
    return { run_id: uid(), path_id: pathId, path_name: 'Unknown', steps: [], overall: 'not_wired', evidence_id: '', created_at: new Date().toISOString() };
  }

  const steps: ProtectedPathStepResult[] = [];
  let evidenceId = '';

  if (pp.protection_type === 'entitlement') {
    // Actually invoke entitlement enforcement
    try {
      const aee = require('./api-entitlement-enforcement') as { evaluate(r: string, t?: string): { outcome: string; reason: string } };
      const tenantId = pp.expected_outcome === 'deny' ? 'free_tenant' : 'rpgpo';
      const decision = aee.evaluate(pp.route, tenantId);
      const observed = decision.outcome.startsWith('denied') ? 'deny' : 'allow';
      steps.push({
        step: 'API entitlement check', middleware_invoked: 'api-entitlement-enforcement.evaluate',
        decision: observed, payload_observed: decision.reason, matched_expectation: observed === pp.expected_outcome,
      });
      // Record evidence
      try {
        const ee = require('./enforcement-evidence') as { recordEvidence(a: string, m: string, d: string, r: string, st: string, si: string, rt: string, lp: string): { record_id: string } };
        const ev = ee.recordEvidence('api_entitlements', 'api-entitlement-enforcement', decision.outcome, observed === 'deny' ? 'request_denied' : 'request_allowed', 'tenant', tenantId, pp.route, pathId);
        evidenceId = ev.record_id;
      } catch { /* */ }
    } catch {
      steps.push({ step: 'API entitlement check', middleware_invoked: 'api-entitlement-enforcement.evaluate', decision: 'error', payload_observed: 'Module not available', matched_expectation: false });
    }
  }

  if (pp.protection_type === 'boundary' || pp.protection_type === 'redaction') {
    try {
      const be = require('./boundary-enforcement') as { enforce(rt: string, ss: string, ts: string, at: string): { outcome: string; reason: string } };
      const sourceScope = pp.expected_outcome === 'deny' ? 'project:A' : 'tenant:rpgpo';
      const targetScope = pp.expected_outcome === 'deny' ? 'project:B' : 'tenant:rpgpo';
      // For redaction test, use cross-project scopes
      const src = pp.protection_type === 'redaction' ? 'project:alpha' : sourceScope;
      const tgt = pp.protection_type === 'redaction' ? 'project:beta' : targetScope;
      const result = be.enforce('api_request', src, tgt, 'api');
      const observed: ProtectedPathStepResult['decision'] = result.outcome === 'blocked' ? 'deny' : result.outcome === 'redacted' ? 'redact' : 'allow';
      steps.push({
        step: 'Boundary enforcement', middleware_invoked: 'boundary-enforcement.enforce',
        decision: observed, payload_observed: result.reason, matched_expectation: observed === pp.expected_outcome,
      });
      // Record evidence
      try {
        const ee = require('./enforcement-evidence') as { recordEvidence(a: string, m: string, d: string, r: string, st: string, si: string, rt: string, lp: string): { record_id: string } };
        const area = pp.protection_type === 'redaction' ? 'payload_redaction' : 'boundary_enforcement';
        const ev = ee.recordEvidence(area, 'boundary-enforcement', result.outcome, `boundary_${result.outcome}`, 'project', src, pp.route, pathId);
        evidenceId = ev.record_id;
      } catch { /* */ }
    } catch {
      steps.push({ step: 'Boundary enforcement', middleware_invoked: 'boundary-enforcement.enforce', decision: 'error', payload_observed: 'Module not available', matched_expectation: false });
    }
  }

  if (pp.protection_type === 'tenant_isolation') {
    // Check via middleware-enforcement which chains entitlement + boundary
    try {
      const me = require('./middleware-enforcement') as { enforce(r: string, t?: string): { allowed: boolean; reason: string } };
      const result = me.enforce(pp.route, 'rpgpo-other');
      const observed: ProtectedPathStepResult['decision'] = result.allowed ? 'allow' : 'deny';
      steps.push({
        step: 'Tenant isolation check', middleware_invoked: 'middleware-enforcement.enforce',
        decision: observed, payload_observed: result.reason, matched_expectation: observed === pp.expected_outcome,
      });
      try {
        const ee = require('./enforcement-evidence') as { recordEvidence(a: string, m: string, d: string, r: string, st: string, si: string, rt: string, lp: string): { record_id: string } };
        const ev = ee.recordEvidence('tenant_isolation', 'middleware-enforcement', result.allowed ? 'allowed' : 'denied', result.allowed ? 'request_allowed' : 'request_denied', 'tenant', 'rpgpo-other', pp.route, pathId);
        evidenceId = ev.record_id;
      } catch { /* */ }
    } catch {
      steps.push({ step: 'Tenant isolation check', middleware_invoked: 'middleware-enforcement.enforce', decision: 'error', payload_observed: 'Module not available', matched_expectation: false });
    }
  }

  if (pp.protection_type === 'extension_permission') {
    try {
      const epe = require('./extension-permission-enforcement') as { evaluate(id: string, p: string, a?: string): { outcome: string; reason: string } };
      const result = epe.evaluate('untrusted_ext', 'data_write', 'use');
      const observed: ProtectedPathStepResult['decision'] = result.outcome.startsWith('denied') ? 'deny' : 'allow';
      steps.push({
        step: 'Extension permission check', middleware_invoked: 'extension-permission-enforcement.evaluate',
        decision: observed, payload_observed: result.reason, matched_expectation: observed === pp.expected_outcome,
      });
      try {
        const ee = require('./enforcement-evidence') as { recordEvidence(a: string, m: string, d: string, r: string, st: string, si: string, rt: string, lp: string): { record_id: string } };
        const ev = ee.recordEvidence('extension_permissions', 'extension-permission-enforcement', result.outcome, `extension_${result.outcome}`, 'extension', 'untrusted_ext', pp.route, pathId);
        evidenceId = ev.record_id;
      } catch { /* */ }
    } catch {
      steps.push({ step: 'Extension permission check', middleware_invoked: 'extension-permission-enforcement.evaluate', decision: 'error', payload_observed: 'Module not available', matched_expectation: false });
    }
  }

  if (pp.protection_type === 'provider_gate') {
    try {
      const rpg = require('./release-provider-gating') as { evaluateProviderGating(id: string): { outcome: string; detail: string } };
      const result = rpg.evaluateProviderGating('validation_probe');
      const observed: ProtectedPathStepResult['decision'] = result.outcome === 'blocked' ? 'deny' : 'allow';
      steps.push({
        step: 'Provider governance gate', middleware_invoked: 'release-provider-gating.evaluateProviderGating',
        decision: observed, payload_observed: result.detail, matched_expectation: observed === pp.expected_outcome,
      });
      try {
        const ee = require('./enforcement-evidence') as { recordEvidence(a: string, m: string, d: string, r: string, st: string, si: string, rt: string, lp: string): { record_id: string } };
        const ev = ee.recordEvidence('provider_governance_in_releases', 'release-provider-gating', result.outcome, `provider_${result.outcome}`, 'release', 'validation_probe', pp.route, pathId);
        evidenceId = ev.record_id;
      } catch { /* */ }
    } catch {
      steps.push({ step: 'Provider governance gate', middleware_invoked: 'release-provider-gating.evaluateProviderGating', decision: 'error', payload_observed: 'Module not available', matched_expectation: false });
    }
  }

  // Classify overall result
  let overall: ProtectedPathValidationRun['overall'] = 'not_wired';
  if (steps.length > 0) {
    const allMatch = steps.every(s => s.matched_expectation);
    const anyMatch = steps.some(s => s.matched_expectation);
    const anyError = steps.some(s => s.decision === 'error');
    if (allMatch && !anyError) overall = 'validated';
    else if (anyMatch) overall = 'partially_validated';
    else overall = 'failed';
  }

  const run: ProtectedPathValidationRun = {
    run_id: uid(), path_id: pathId, path_name: pp.name,
    steps, overall, evidence_id: evidenceId, created_at: new Date().toISOString(),
  };

  // Persist run
  const runs = readJson<ProtectedPathValidationRun[]>(RUNS_FILE, []);
  runs.unshift(run);
  if (runs.length > 200) runs.length = 200;
  writeJson(RUNS_FILE, runs);

  return run;
}

/** Run all protected path validations */
export function validateAll(): ProtectedPathValidationRun[] {
  const paths = getProtectedPaths();
  return paths.map(p => validatePath(p.path_id));
}

/** Get summary of all protected path validation */
export function getSummary(): ProtectedPathSummary {
  const paths = getProtectedPaths();
  const runs = readJson<ProtectedPathValidationRun[]>(RUNS_FILE, []);

  // Get latest run per path
  const latestByPath: Record<string, ProtectedPathValidationRun> = {};
  for (const run of runs) {
    if (!latestByPath[run.path_id]) latestByPath[run.path_id] = run;
  }

  const validationRuns = Object.values(latestByPath);
  const validated = validationRuns.filter(r => r.overall === 'validated').length;
  const partiallyValidated = validationRuns.filter(r => r.overall === 'partially_validated').length;
  const failed = validationRuns.filter(r => r.overall === 'failed').length;
  const notWired = paths.length - validationRuns.length;

  return {
    total_paths: paths.length, validated, partially_validated: partiallyValidated,
    failed, not_wired: notWired, validation_runs: validationRuns,
    created_at: new Date().toISOString(),
  };
}

/** Get all validation runs */
export function getRuns(): ProtectedPathValidationRun[] {
  return readJson<ProtectedPathValidationRun[]>(RUNS_FILE, []);
}

module.exports = { getProtectedPaths, validatePath, validateAll, getSummary, getRuns };
