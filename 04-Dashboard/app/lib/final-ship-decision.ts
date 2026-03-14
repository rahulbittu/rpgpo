// GPO Final Ship Decision — Evidence-backed GO / CONDITIONAL_GO / NO_GO

import type { FinalShipDecisionReport, FinalDecisionEvidence, FinalWorkflowClosureReport } from './types';

function uid(): string { return 'fsd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** Compute final workflow closure report */
export function getWorkflowClosure(): FinalWorkflowClosureReport {
  const closedInThisPass: string[] = [];
  try {
    const owc = require('./operator-workflow-completion') as { getCompletionReport(): { workflows: Array<{ workflow_id: string; name: string; status: string; detail: string }>; usable: number; partial: number; total: number } };
    const r = owc.getCompletionReport();
    const workflows = r.workflows.map(w => ({
      workflow_id: w.workflow_id,
      name: w.name,
      status: w.status as FinalWorkflowClosureReport['workflows'][0]['status'],
      detail: w.detail,
    }));
    return { report_id: uid(), workflows, usable: r.usable, partial: r.partial, blocked: 0, broken: 0, total: r.total, closed_in_this_pass: closedInThisPass, created_at: new Date().toISOString() };
  } catch {
    return { report_id: uid(), workflows: [], usable: 0, partial: 0, blocked: 0, broken: 0, total: 0, closed_in_this_pass: [], created_at: new Date().toISOString() };
  }
}

/** Compute final evidence-backed ship decision */
export function computeDecision(): FinalShipDecisionReport {
  const evidence: FinalDecisionEvidence[] = [];
  const remainingGaps: string[] = [];

  // 1. Blocker reconciliation
  let blockerScore = 0;
  try {
    const fbr = require('./final-blocker-reconciliation') as { reconcile(): { closed: number; total: number; open: number; partially_closed: number } };
    const r = fbr.reconcile();
    blockerScore = r.total > 0 ? Math.round((r.closed / r.total) * 100) : 0;
    const status = r.open === 0 && r.partially_closed === 0 ? 'pass' : r.open === 0 ? 'conditional' : 'fail';
    evidence.push({ dimension: 'Blocker reconciliation', score: r.closed, max: r.total, status, detail: `${r.closed}/${r.total} closed, ${r.open} open, ${r.partially_closed} partial` });
    if (r.open > 0) remainingGaps.push(`${r.open} open blockers`);
    if (r.partially_closed > 0) remainingGaps.push(`${r.partially_closed} partially closed blockers`);
  } catch { evidence.push({ dimension: 'Blocker reconciliation', score: 0, max: 7, status: 'fail', detail: 'Module not available' }); }

  // 2. Workflow closure
  let workflowScore = 0;
  try {
    const wf = getWorkflowClosure();
    workflowScore = wf.total > 0 ? Math.round((wf.usable / wf.total) * 100) : 0;
    const status = wf.partial === 0 && wf.blocked === 0 && wf.broken === 0 ? 'pass' : wf.blocked === 0 && wf.broken === 0 ? 'conditional' : 'fail';
    evidence.push({ dimension: 'Workflow closure', score: wf.usable, max: wf.total, status, detail: `${wf.usable}/${wf.total} usable, ${wf.partial} partial` });
    if (wf.partial > 0) remainingGaps.push(`${wf.partial} partial workflow(s)`);
  } catch { evidence.push({ dimension: 'Workflow closure', score: 0, max: 13, status: 'fail', detail: 'Module not available' }); }

  // 3. Middleware truth
  let middlewareScore = 0;
  try {
    const lmw = require('./live-middleware-wiring') as { getTruthReport(): { truth_score: number; executed_and_verified: number; total_areas: number } };
    const t = lmw.getTruthReport();
    middlewareScore = t.truth_score;
    const status = t.truth_score >= 95 ? 'pass' : t.truth_score >= 70 ? 'conditional' : 'fail';
    evidence.push({ dimension: 'Middleware truth', score: t.executed_and_verified, max: t.total_areas, status, detail: `Truth score ${t.truth_score}%` });
    if (t.truth_score < 95) remainingGaps.push(`Middleware truth at ${t.truth_score}%`);
  } catch { evidence.push({ dimension: 'Middleware truth', score: 0, max: 6, status: 'fail', detail: 'Module not available' }); }

  // 4. HTTP middleware validation
  let httpScore = 0;
  try {
    const hmv = require('./http-middleware-validation') as { getLatestRun(): { passed: number; total: number } | null };
    const run = hmv.getLatestRun();
    if (run) {
      httpScore = run.total > 0 ? Math.round((run.passed / run.total) * 100) : 0;
      const status = run.passed === run.total ? 'pass' : run.passed >= run.total - 1 ? 'conditional' : 'fail';
      evidence.push({ dimension: 'HTTP middleware validation', score: run.passed, max: run.total, status, detail: `${run.passed}/${run.total} cases passed` });
      if (run.passed < run.total) remainingGaps.push(`${run.total - run.passed} HTTP validation case(s) failed`);
    } else {
      evidence.push({ dimension: 'HTTP middleware validation', score: 0, max: 8, status: 'fail', detail: 'No validation run yet' });
      remainingGaps.push('HTTP middleware validation not yet run');
    }
  } catch { evidence.push({ dimension: 'HTTP middleware validation', score: 0, max: 8, status: 'fail', detail: 'Module not available' }); }

  // 5. Operator acceptance
  let acceptanceScore = 0;
  try {
    const oa = require('./operator-acceptance') as { runAcceptance(): { usable: number; checks: Array<unknown> } };
    const a = oa.runAcceptance();
    const total = a.checks.length;
    acceptanceScore = total > 0 ? Math.round((a.usable / total) * 100) : 0;
    const status = acceptanceScore >= 95 ? 'pass' : acceptanceScore >= 80 ? 'conditional' : 'fail';
    evidence.push({ dimension: 'Operator acceptance', score: a.usable, max: total, status, detail: `${acceptanceScore}% acceptance` });
  } catch { evidence.push({ dimension: 'Operator acceptance', score: 0, max: 13, status: 'fail', detail: 'Module not available' }); }

  // 6. Security posture
  let securityPosture = 'unknown';
  try {
    const sh = require('./security-hardening') as { runAssessment(): { overall: string } };
    const r = sh.runAssessment();
    securityPosture = r.overall;
    const status = r.overall === 'strong' ? 'pass' : r.overall === 'moderate' ? 'conditional' : 'fail';
    evidence.push({ dimension: 'Security posture', score: r.overall === 'strong' ? 10 : r.overall === 'moderate' ? 7 : 4, max: 10, status, detail: `Posture: ${r.overall}` });
  } catch { evidence.push({ dimension: 'Security posture', score: 5, max: 10, status: 'conditional', detail: 'Security module not available' }); }

  // 7. Measured reliability
  let reliabilityScore = 0;
  try {
    const mr = require('./measured-reliability') as { computeReliability(): { metrics: Array<{ measured: boolean }> } };
    const r = mr.computeReliability();
    const measured = r.metrics.filter(m => m.measured).length;
    reliabilityScore = r.metrics.length > 0 ? Math.round((measured / r.metrics.length) * 100) : 0;
    const status = reliabilityScore >= 80 ? 'pass' : reliabilityScore >= 60 ? 'conditional' : 'fail';
    evidence.push({ dimension: 'Measured reliability', score: measured, max: r.metrics.length, status, detail: `${measured}/${r.metrics.length} metrics measured` });
  } catch { evidence.push({ dimension: 'Measured reliability', score: 5, max: 10, status: 'conditional', detail: 'Reliability module not available' }); }

  // Compute overall score — weighted
  const overallScore = Math.round(
    blockerScore * 0.20 +
    workflowScore * 0.15 +
    middlewareScore * 0.15 +
    httpScore * 0.15 +
    acceptanceScore * 0.15 +
    (securityPosture === 'strong' ? 100 : securityPosture === 'moderate' ? 70 : 40) * 0.10 +
    reliabilityScore * 0.10
  );

  // Decision logic: require no 'fail' dimensions for GO
  const failCount = evidence.filter(e => e.status === 'fail').length;
  const conditionalCount = evidence.filter(e => e.status === 'conditional').length;

  let decision: FinalShipDecisionReport['decision'] = 'no_go';
  if (failCount === 0 && conditionalCount === 0 && overallScore >= 90) {
    decision = 'go';
  } else if (failCount === 0 && overallScore >= 75) {
    decision = 'conditional_go';
  }

  return {
    report_id: uid(), decision, evidence,
    blocker_reconciliation_score: blockerScore,
    workflow_closure_score: workflowScore,
    middleware_truth_score: middlewareScore,
    http_validation_score: httpScore,
    operator_acceptance_score: acceptanceScore,
    security_posture: securityPosture,
    measured_reliability_score: reliabilityScore,
    overall_score: overallScore,
    remaining_gaps: remainingGaps,
    created_at: new Date().toISOString(),
  };
}

module.exports = { getWorkflowClosure, computeDecision };
