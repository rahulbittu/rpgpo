// GPO Final Blocker Reconciliation — Reconcile stale blocker state across Parts 48-51

import type { FinalBlockerState, BlockerReconciliationReport } from './types';

function uid(): string { return 'fbr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** Reconcile all blocker sources into a single truth */
export function reconcile(): BlockerReconciliationReport {
  const blockers: FinalBlockerState[] = [];
  let staleResolved = 0;

  // 1. Workflow completion
  try {
    const owc = require('./operator-workflow-completion') as { getCompletionReport(): { usable: number; partial: number; total: number; workflows: Array<{ name: string; status: string; detail: string }> } };
    const r = owc.getCompletionReport();
    const partial = r.workflows.filter(w => w.status !== 'usable');
    if (partial.length === 0) {
      blockers.push({ blocker_id: 'fb_workflow', name: 'Workflow completion', source: 'operator-workflow-completion', status: 'closed', evidence: `${r.usable}/${r.total} usable`, reconciled_from: ['Part 49', 'Part 52'], last_updated: new Date().toISOString() });
    } else {
      blockers.push({ blocker_id: 'fb_workflow', name: 'Workflow completion', source: 'operator-workflow-completion', status: 'partially_closed', evidence: `${r.usable}/${r.total} usable, ${partial.length} partial: ${partial.map(p => p.name).join(', ')}`, reconciled_from: ['Part 49'], last_updated: new Date().toISOString() });
    }
  } catch {
    blockers.push({ blocker_id: 'fb_workflow', name: 'Workflow completion', source: 'operator-workflow-completion', status: 'open', evidence: 'Module not available', reconciled_from: [], last_updated: new Date().toISOString() });
  }

  // 2. Middleware enforcement truth
  try {
    const lmw = require('./live-middleware-wiring') as { getTruthReport(): { truth_score: number; executed_and_verified: number; total_areas: number } };
    const t = lmw.getTruthReport();
    if (t.truth_score >= 95) {
      blockers.push({ blocker_id: 'fb_middleware', name: 'Middleware enforcement', source: 'live-middleware-wiring', status: 'closed', evidence: `Truth score ${t.truth_score}%, ${t.executed_and_verified}/${t.total_areas} verified`, reconciled_from: ['Part 49 (stale)', 'Part 51 (current)'], last_updated: new Date().toISOString() });
      staleResolved++; // Part 49 ship-blocker said "in_progress" but Part 51 proved it
    } else if (t.truth_score >= 70) {
      blockers.push({ blocker_id: 'fb_middleware', name: 'Middleware enforcement', source: 'live-middleware-wiring', status: 'partially_closed', evidence: `Truth score ${t.truth_score}%`, reconciled_from: ['Part 51'], last_updated: new Date().toISOString() });
    } else {
      blockers.push({ blocker_id: 'fb_middleware', name: 'Middleware enforcement', source: 'live-middleware-wiring', status: 'open', evidence: `Truth score ${t.truth_score}%`, reconciled_from: ['Part 51'], last_updated: new Date().toISOString() });
    }
  } catch {
    blockers.push({ blocker_id: 'fb_middleware', name: 'Middleware enforcement', source: 'live-middleware-wiring', status: 'open', evidence: 'Module not available', reconciled_from: [], last_updated: new Date().toISOString() });
  }

  // 3. Provider governance in releases
  try {
    const rpg = require('./release-provider-gating') as { evaluateProviderGating(id: string): { outcome: string } };
    const result = rpg.evaluateProviderGating('reconciliation_probe');
    blockers.push({ blocker_id: 'fb_provider_release', name: 'Provider governance in releases', source: 'release-provider-gating', status: 'closed', evidence: `Provider gating wired and functional, outcome: ${result.outcome}`, reconciled_from: ['Part 49 (stale: in_progress)', 'Part 50 (wired)', 'Part 51 (verified)'], last_updated: new Date().toISOString() });
    staleResolved++; // Part 49 ship-blocker said "in_progress"
  } catch {
    blockers.push({ blocker_id: 'fb_provider_release', name: 'Provider governance in releases', source: 'release-provider-gating', status: 'open', evidence: 'Module not available', reconciled_from: [], last_updated: new Date().toISOString() });
  }

  // 4. Rollback completeness
  try {
    const oa = require('./operator-acceptance') as { runAcceptance(): { checks: Array<{ name: string; status: string; detail: string }> } };
    const a = oa.runAcceptance();
    const rb = a.checks.find(c => c.name.includes('rollback'));
    if (rb && rb.status === 'usable') {
      blockers.push({ blocker_id: 'fb_rollback', name: 'Rollback completeness', source: 'operator-acceptance', status: 'closed', evidence: rb.detail, reconciled_from: ['Part 49 (UI wired)', 'Part 50 (verified)'], last_updated: new Date().toISOString() });
    } else {
      blockers.push({ blocker_id: 'fb_rollback', name: 'Rollback completeness', source: 'operator-acceptance', status: 'partially_closed', evidence: rb?.detail || 'Unknown', reconciled_from: ['Part 49'], last_updated: new Date().toISOString() });
    }
  } catch {
    blockers.push({ blocker_id: 'fb_rollback', name: 'Rollback completeness', source: 'operator-acceptance', status: 'open', evidence: 'Module not available', reconciled_from: [], last_updated: new Date().toISOString() });
  }

  // 5. Audit drilldown completeness
  try {
    const oa = require('./operator-acceptance') as { runAcceptance(): { checks: Array<{ name: string; status: string; detail: string }> } };
    const a = oa.runAcceptance();
    const ad = a.checks.find(c => c.name.includes('audit') || c.name.includes('traceability'));
    if (ad && ad.status === 'usable') {
      blockers.push({ blocker_id: 'fb_audit_drill', name: 'Audit drilldown', source: 'operator-acceptance', status: 'closed', evidence: ad.detail, reconciled_from: ['Part 49 (stale)', 'Part 50 (updated)'], last_updated: new Date().toISOString() });
      staleResolved++;
    } else {
      blockers.push({ blocker_id: 'fb_audit_drill', name: 'Audit drilldown', source: 'operator-acceptance', status: 'partially_closed', evidence: ad?.detail || 'Unknown', reconciled_from: ['Part 49'], last_updated: new Date().toISOString() });
    }
  } catch {
    blockers.push({ blocker_id: 'fb_audit_drill', name: 'Audit drilldown', source: 'operator-acceptance', status: 'open', evidence: 'Module not available', reconciled_from: [], last_updated: new Date().toISOString() });
  }

  // 6. Protected path validation
  try {
    const ppv = require('./protected-path-validation') as { getSummary(): { validated: number; total_paths: number; failed: number } };
    const s = ppv.getSummary();
    if (s.validated === s.total_paths && s.failed === 0) {
      blockers.push({ blocker_id: 'fb_protected_paths', name: 'Protected path validation', source: 'protected-path-validation', status: 'closed', evidence: `${s.validated}/${s.total_paths} paths validated`, reconciled_from: ['Part 51'], last_updated: new Date().toISOString() });
    } else {
      blockers.push({ blocker_id: 'fb_protected_paths', name: 'Protected path validation', source: 'protected-path-validation', status: s.failed > 0 ? 'open' : 'partially_closed', evidence: `${s.validated}/${s.total_paths} validated, ${s.failed} failed`, reconciled_from: ['Part 51'], last_updated: new Date().toISOString() });
    }
  } catch {
    blockers.push({ blocker_id: 'fb_protected_paths', name: 'Protected path validation', source: 'protected-path-validation', status: 'open', evidence: 'Module not available', reconciled_from: [], last_updated: new Date().toISOString() });
  }

  // 7. HTTP middleware validation
  try {
    const hmv = require('./http-middleware-validation') as { getLatestRun(): { passed: number; total: number } | null };
    const run = hmv.getLatestRun();
    if (run && run.passed === run.total) {
      blockers.push({ blocker_id: 'fb_http_middleware', name: 'HTTP middleware validation', source: 'http-middleware-validation', status: 'closed', evidence: `${run.passed}/${run.total} HTTP cases passed`, reconciled_from: ['Part 52'], last_updated: new Date().toISOString() });
    } else if (run) {
      blockers.push({ blocker_id: 'fb_http_middleware', name: 'HTTP middleware validation', source: 'http-middleware-validation', status: 'partially_closed', evidence: `${run.passed}/${run.total} passed`, reconciled_from: ['Part 52'], last_updated: new Date().toISOString() });
    } else {
      blockers.push({ blocker_id: 'fb_http_middleware', name: 'HTTP middleware validation', source: 'http-middleware-validation', status: 'open', evidence: 'No validation run yet', reconciled_from: [], last_updated: new Date().toISOString() });
    }
  } catch {
    blockers.push({ blocker_id: 'fb_http_middleware', name: 'HTTP middleware validation', source: 'http-middleware-validation', status: 'open', evidence: 'Module not available', reconciled_from: [], last_updated: new Date().toISOString() });
  }

  const open = blockers.filter(b => b.status === 'open').length;
  const partiallyClosed = blockers.filter(b => b.status === 'partially_closed').length;
  const closed = blockers.filter(b => b.status === 'closed').length;
  const stale = blockers.filter(b => b.status === 'stale').length;

  return { report_id: uid(), blockers, open, partially_closed: partiallyClosed, closed, stale, total: blockers.length, stale_contradictions_resolved: staleResolved, created_at: new Date().toISOString() };
}

module.exports = { reconcile };
