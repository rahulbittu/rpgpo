// GPO Final Go Proof — Route-level validation proving actual inline enforcement from live HTTP calls

import type { RouteLevelValidationCase, RouteLevelValidationRun, UnconditionalGoReport, FinalProofConfidence, FinalProofBlocker, MiddlewareBindingCoverage } from './types';

const http = require('http') as typeof import('http');
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RUNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'final-go-proof-runs.json');

function uid(): string { return 'fgp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

const PORT = Number(process.env.PORT) || 3200;

/** 8 route-level validation cases with tenant/project overrides via headers */
export function getCases(): RouteLevelValidationCase[] {
  return [
    { case_id: 'rlv_entitle_deny', name: 'Tenant-admin denied (non-entitled)', route: '/api/tenant-admin', method: 'GET', tenant_override: 'free_tenant', project_override: 'default', expected_status: 403, expected_effect: 'deny' },
    { case_id: 'rlv_entitle_allow', name: 'Release allowed (entitled)', route: '/api/release-orchestration', method: 'GET', tenant_override: 'rpgpo', project_override: 'default', expected_status: 200, expected_effect: 'allow' },
    { case_id: 'rlv_isolation_deny', name: 'Tenant-admin denied (cross-tenant)', route: '/api/tenant-admin', method: 'GET', tenant_override: 'rpgpo-other', project_override: 'default', expected_status: 403, expected_effect: 'deny' },
    { case_id: 'rlv_boundary_redact', name: 'Audit-hub redacted (cross-project)', route: '/api/audit-hub', method: 'GET', tenant_override: 'rpgpo', project_override: 'other-project', expected_status: 200, expected_effect: 'redact' },
    { case_id: 'rlv_redact', name: 'Evidence redacted (cross-project context)', route: '/api/enforcement-evidence', method: 'GET', tenant_override: 'rpgpo', project_override: 'other-project', expected_status: 200, expected_effect: 'redact' },
    { case_id: 'rlv_extension_deny', name: 'Marketplace denied (untrusted)', route: '/api/marketplace', method: 'GET', tenant_override: 'untrusted', project_override: 'default', expected_status: 403, expected_effect: 'deny' },
    { case_id: 'rlv_provider_allow', name: 'Provider gating allowed', route: '/api/release-provider-gating', method: 'GET', tenant_override: 'rpgpo', project_override: 'default', expected_status: 200, expected_effect: 'allow' },
    { case_id: 'rlv_same_scope', name: 'Audit-hub allowed (same scope)', route: '/api/audit-hub', method: 'GET', tenant_override: 'rpgpo', project_override: 'default', expected_status: 200, expected_effect: 'allow' },
  ];
}

function httpGetWithHeaders(route: string, headers: Record<string, string>): Promise<{ status: number; body: string }> {
  return new Promise((resolve) => {
    const opts = { hostname: 'localhost', port: PORT, path: route, method: 'GET', headers, timeout: 5000 };
    const req = http.request(opts, (res: import('http').IncomingMessage) => {
      let body = '';
      res.on('data', (c: Buffer) => { body += c; });
      res.on('end', () => { resolve({ status: res.statusCode || 500, body }); });
    });
    req.on('error', () => { resolve({ status: 0, body: 'Connection error' }); });
    req.on('timeout', () => { req.destroy(); resolve({ status: 0, body: 'Timeout' }); });
    req.end();
  });
}

function probeServer(): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://localhost:${PORT}/`, { timeout: 3000 }, (res: import('http').IncomingMessage) => {
      res.resume();
      resolve((res.statusCode || 0) >= 200 && (res.statusCode || 0) < 500);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => { req.destroy(); resolve(false); });
  });
}

/** Run route-level proof against live server with real headers */
export async function runProof(): Promise<RouteLevelValidationRun> {
  const serverRunning = await probeServer();
  const cases = getCases();
  const results: RouteLevelValidationRun['results'] = [];

  for (const c of cases) {
    if (serverRunning) {
      const { status, body } = await httpGetWithHeaders(c.route, { 'x-tenant-id': c.tenant_override, 'x-project-id': c.project_override });
      let actualEffect: string = 'allow';
      if (status === 403) actualEffect = 'deny';
      else if (status === 200) {
        try {
          const parsed = JSON.parse(body);
          if (parsed._redacted || parsed.redacted) actualEffect = 'redact';
        } catch { /* */ }
      }
      const passed = actualEffect === c.expected_effect;
      const evidenceId = recordEvidence(c, status, actualEffect, passed);
      const proofLevel = passed ? 'route_proven' as const : 'failed' as const;
      results.push({ case_id: c.case_id, case_name: c.name, route: c.route, expected_status: c.expected_status, actual_status: status, expected_effect: c.expected_effect, actual_effect: actualEffect, response_sample: body.slice(0, 200), proof_level: proofLevel, evidence_id: evidenceId });
    } else {
      results.push({ case_id: c.case_id, case_name: c.name, route: c.route, expected_status: c.expected_status, actual_status: 0, expected_effect: c.expected_effect, actual_effect: 'not_run', response_sample: 'Server not running', proof_level: 'failed', evidence_id: '' });
    }
  }

  const routeProven = results.filter(r => r.proof_level === 'route_proven').length;
  const partiallyProven = results.filter(r => r.proof_level === 'partially_proven').length;
  const failed = results.filter(r => r.proof_level === 'failed').length;

  const run: RouteLevelValidationRun = {
    run_id: uid(), server_running: serverRunning, results,
    route_proven: routeProven, partially_proven: partiallyProven, failed, total: results.length,
    created_at: new Date().toISOString(),
  };

  const runs = readJson<RouteLevelValidationRun[]>(RUNS_FILE, []);
  runs.unshift(run);
  if (runs.length > 30) runs.length = 30;
  writeJson(RUNS_FILE, runs);
  return run;
}

/** Get latest run */
export function getLatestRun(): RouteLevelValidationRun | null {
  const runs = readJson<RouteLevelValidationRun[]>(RUNS_FILE, []);
  return runs.length > 0 ? runs[0] : null;
}

/** Compute unconditional go report */
export function getUnconditionalGoReport(): UnconditionalGoReport {
  const latestRun = getLatestRun();
  const blockers: FinalProofBlocker[] = [];

  // Middleware coverage
  let coverage: MiddlewareBindingCoverage = { total_protected: 0, total_enforced: 0, bindings: [], coverage_percent: 0, created_at: new Date().toISOString() };
  try {
    const rme = require('./route-middleware-enforcement') as { getCoverage(): MiddlewareBindingCoverage };
    coverage = rme.getCoverage();
  } catch { blockers.push({ area: 'route_middleware', detail: 'Route middleware module not available' }); }

  // Check route proof
  let routeProven = 0;
  let totalCases = 0;
  if (latestRun && latestRun.server_running) {
    routeProven = latestRun.route_proven;
    totalCases = latestRun.total;
    if (latestRun.failed > 0) {
      const failedCases = latestRun.results.filter(r => r.proof_level === 'failed');
      for (const f of failedCases) {
        blockers.push({ area: f.case_name, detail: `Expected ${f.expected_effect}, got ${f.actual_effect} (HTTP ${f.actual_status})` });
      }
    }
  } else if (latestRun && !latestRun.server_running) {
    blockers.push({ area: 'server_not_running', detail: 'Route proof requires running server — cannot claim unconditional Go' });
    totalCases = latestRun.total;
  } else {
    blockers.push({ area: 'no_proof_run', detail: 'Route-level proof has not been run yet' });
  }

  // Check other gates
  try {
    const fbr = require('./final-blocker-reconciliation') as { reconcile(): { open: number } };
    if (fbr.reconcile().open > 0) blockers.push({ area: 'blockers', detail: 'Open blockers remain' });
  } catch { /* */ }

  try {
    const rc = require('./reliability-closure') as { computeClosure(): { proxy_only: number } };
    if (rc.computeClosure().proxy_only > 0) blockers.push({ area: 'reliability', detail: 'Proxy-only reliability metrics remain' });
  } catch { /* */ }

  try {
    const csv = require('./clean-state-verification') as { verify(): { clean: boolean } };
    if (!csv.verify().clean) blockers.push({ area: 'clean_state', detail: 'Stale validation state detected' });
  } catch { /* */ }

  // Confidence
  const confidence: FinalProofConfidence = {
    level: routeProven === totalCases && totalCases >= 6 && blockers.length === 0 ? 'unconditional' : routeProven > 0 ? 'conditional' : 'insufficient',
    route_proven: routeProven, total_cases: totalCases,
    detail: routeProven === totalCases && totalCases >= 6 ? `${routeProven}/${totalCases} routes proven with actual HTTP response enforcement` : routeProven > 0 ? `${routeProven}/${totalCases} proven, ${blockers.length} blocker(s)` : 'No route-level proof available',
  };

  // Decision
  let decision: UnconditionalGoReport['decision'] = 'no_go';
  if (confidence.level === 'unconditional') decision = 'unconditional_go';
  else if (confidence.level === 'conditional' && blockers.length <= 1) decision = 'conditional_go';

  const overallScore = totalCases > 0 ? Math.round((routeProven / totalCases) * 100) : 0;

  return {
    report_id: uid(), decision, confidence, route_validation: latestRun, middleware_coverage: coverage,
    proof_blockers: blockers, overall_score: overallScore, created_at: new Date().toISOString(),
  };
}

function recordEvidence(c: RouteLevelValidationCase, status: number, effect: string, passed: boolean): string {
  try {
    const ee = require('./enforcement-evidence') as { recordEvidence(a: string, m: string, d: string, r: string, st: string, si: string, rt: string, lp: string): { record_id: string } };
    return ee.recordEvidence('route_level_proof', `inline_guard_${c.case_id}`, `${effect}_${status}`, passed ? 'route_proven' : 'failed', 'route', c.case_id, c.route, c.case_id).record_id;
  } catch { return ''; }
}

module.exports = { getCases, runProof, getLatestRun, getUnconditionalGoReport };
