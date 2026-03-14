// GPO Boundary Enforcement — Block/redact real responses at boundary crossings

import type { BoundaryEnforcementResult, IsolationEnforcementReport } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RESULTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'boundary-enforcement-results.json');

function uid(): string { return 'be_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Evaluate and enforce a boundary crossing */
export function enforce(requestType: string, sourceScope: string, targetScope: string, artifactType: string): BoundaryEnforcementResult {
  let outcome: BoundaryEnforcementResult['outcome'] = 'allowed';
  let reason = 'Same scope or no boundary restriction';

  // Check data boundaries
  try {
    const db = require('./data-boundaries') as { evaluateBoundary(s: string, t: string, a: string): { outcome: string; reason: string } };
    const decision = db.evaluateBoundary(sourceScope, targetScope, artifactType);
    if (decision.outcome === 'deny') { outcome = 'blocked'; reason = decision.reason; }
    else if (decision.outcome === 'redact') { outcome = 'redacted'; reason = decision.reason; }
  } catch { /* boundaries not loaded */ }

  const result: BoundaryEnforcementResult = { result_id: uid(), request_type: requestType, source_scope: sourceScope, target_scope: targetScope, artifact_type: artifactType, outcome, reason, created_at: new Date().toISOString() };
  const results = readJson<BoundaryEnforcementResult[]>(RESULTS_FILE, []);
  results.unshift(result);
  if (results.length > 300) results.length = 300;
  writeJson(RESULTS_FILE, results);

  // Telemetry for blocks
  if (outcome === 'blocked') {
    try { const tw = require('./telemetry-wiring') as { emitTelemetry(c: string, a: string, o: string): void }; tw.emitTelemetry('boundary', 'boundary_blocked', 'blocked'); } catch { /* */ }
  }

  return result;
}

/** Get enforcement report */
export function getReport(): IsolationEnforcementReport {
  const results = readJson<BoundaryEnforcementResult[]>(RESULTS_FILE, []);
  const allowed = results.filter(r => r.outcome === 'allowed').length;
  const blocked = results.filter(r => r.outcome === 'blocked').length;
  const redacted = results.filter(r => r.outcome === 'redacted').length;

  // Count protected routes
  let protectedRoutes = 0;
  let enforcedRoutes = 0;
  try {
    const aee = require('./api-entitlement-enforcement') as { getProtectedRoutes(): Array<{ enforced: boolean }> };
    const routes = aee.getProtectedRoutes();
    protectedRoutes = routes.length;
    enforcedRoutes = routes.filter(r => r.enforced).length;
  } catch { /* */ }

  // Isolation decisions
  let isoDecisions = 0;
  let isoDenied = 0;
  try {
    const tir = require('./tenant-isolation-runtime') as { getDecisions(): Array<{ outcome: string }> };
    const decisions = tir.getDecisions();
    isoDecisions = decisions.length;
    isoDenied = decisions.filter(d => d.outcome === 'deny').length;
  } catch { /* */ }

  const leakRisks: string[] = [];
  if (enforcedRoutes < protectedRoutes) leakRisks.push(`${protectedRoutes - enforcedRoutes} protected routes not enforced`);
  if (blocked === 0 && results.length > 10) leakRisks.push('No boundary blocks detected — may indicate insufficient enforcement');

  return {
    report_id: uid(), total_decisions: isoDecisions + results.length,
    allowed: allowed + (isoDecisions - isoDenied), denied: isoDenied + blocked, redacted,
    protected_routes: protectedRoutes, enforced_routes: enforcedRoutes,
    boundary_blocks: blocked, leak_risks: leakRisks,
    created_at: new Date().toISOString(),
  };
}

export function getResults(projectId?: string): BoundaryEnforcementResult[] {
  const all = readJson<BoundaryEnforcementResult[]>(RESULTS_FILE, []);
  return projectId ? all.filter(r => r.source_scope.includes(projectId) || r.target_scope.includes(projectId)) : all;
}

module.exports = { enforce, getReport, getResults };
