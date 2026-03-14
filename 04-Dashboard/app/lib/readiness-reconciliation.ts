// GPO Readiness Reconciliation — Final ship readiness score combining all signals

import type { ReadinessReconciliationResult } from './types';

function uid(): string { return 'rr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** Reconcile all readiness signals into a final ship decision */
export function reconcile(): ReadinessReconciliationResult {
  let workflowCompletion = 0;
  let middlewareCoverage = 0;
  let blockerClosure = 0;
  let operatorAcceptance = 0;
  let staleContradictionsResolved = 0;

  // Workflow completion percentage
  try {
    const owc = require('./operator-workflow-completion') as { getCompletionReport(): { usable: number; total: number } };
    const r = owc.getCompletionReport();
    workflowCompletion = r.total > 0 ? Math.round((r.usable / r.total) * 100) : 0;
  } catch { /* */ }

  // Middleware coverage percentage — now uses truth report when available
  try {
    const lmw = require('./live-middleware-wiring') as { getTruthReport(): { truth_score: number } };
    const truth = lmw.getTruthReport();
    middlewareCoverage = truth.truth_score;
  } catch {
    try {
      const me = require('./middleware-enforcement') as { getCoverageReport(): Array<{ state: string }> };
      const cov = me.getCoverageReport();
      const enforced = cov.filter(c => c.state === 'enforced').length;
      middlewareCoverage = cov.length > 0 ? Math.round((enforced / cov.length) * 100) : 0;
    } catch { /* */ }
  }

  // Blocker closure percentage
  try {
    const sbc = require('./ship-blocker-closure') as { getSummary(): { blockers: Array<{ status: string }> } };
    const s = sbc.getSummary();
    const resolved = s.blockers.filter(b => b.status === 'resolved').length;
    blockerClosure = s.blockers.length > 0 ? Math.round((resolved / s.blockers.length) * 100) : 0;
  } catch { /* */ }

  // Operator acceptance percentage
  try {
    const oa = require('./operator-acceptance') as { runAcceptance(): { usable: number; checks: Array<unknown> } };
    const a = oa.runAcceptance();
    const total = a.checks.length;
    operatorAcceptance = total > 0 ? Math.round((a.usable / total) * 100) : 0;
  } catch { /* */ }

  // Resolve stale contradictions: check if Part 49 improvements are reflected
  try {
    const glc = require('./go-live-closure') as { getClosureReport(): { blockers: Array<{ name: string; status: string }> } };
    const report = glc.getClosureReport();
    // Count items that moved from partial/blocked to closed since last check
    const closedItems = report.blockers.filter(b => b.status === 'closed');
    staleContradictionsResolved = closedItems.length;
  } catch { /* */ }

  // Weighted reconciled score
  const reconciledScore = Math.round(
    workflowCompletion * 0.25 +
    middlewareCoverage * 0.20 +
    blockerClosure * 0.25 +
    operatorAcceptance * 0.30
  );

  let shipDecision: ReadinessReconciliationResult['ship_decision'] = 'no_go';
  if (reconciledScore >= 95) shipDecision = 'go';
  else if (reconciledScore >= 80) shipDecision = 'conditional_go';

  return {
    report_id: uid(),
    workflow_completion: workflowCompletion,
    middleware_coverage: middlewareCoverage,
    blocker_closure: blockerClosure,
    operator_acceptance: operatorAcceptance,
    reconciled_score: reconciledScore,
    stale_contradictions_resolved: staleContradictionsResolved,
    ship_decision: shipDecision,
    created_at: new Date().toISOString(),
  };
}

module.exports = { reconcile };
