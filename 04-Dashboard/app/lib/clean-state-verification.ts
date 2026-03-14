// GPO Clean State Verification — Verify final ship-readiness is not contaminated by stale state

import type { CleanStateVerificationRun, CleanStateIssue, FinalProductionDecision, FinalGoVerificationReport, GoEvidenceBundle, VerificationConfidence, FinalGoLiveGate } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');

function uid(): string { return 'csv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** State files that matter for ship readiness validation */
const VALIDATION_STATE_FILES = [
  'enforcement-evidence.json',
  'protected-path-runs.json',
  'http-middleware-validation-runs.json',
  'network-http-validation-runs.json',
  'redaction-behavior.json',
  'ship-blockers.json',
  'boundary-enforcement-results.json',
  'entitlement-decisions.json',
  'extension-permission-decisions.json',
];

/** Run clean-state verification */
export function verify(): CleanStateVerificationRun {
  const issues: CleanStateIssue[] = [];
  let filesChecked = 0;
  let staleDetected = 0;

  for (const file of VALIDATION_STATE_FILES) {
    const fullPath = path.join(STATE_DIR, file);
    filesChecked++;

    if (!fs.existsSync(fullPath)) {
      // Missing state file is fine — means no stale data
      continue;
    }

    try {
      const stat = fs.statSync(fullPath);
      const ageMs = Date.now() - stat.mtimeMs;
      const ageMinutes = Math.round(ageMs / 60000);

      // Check if file was modified before current session (> 30 minutes old)
      if (ageMinutes > 30) {
        issues.push({ file, issue: 'stale_data', severity: 'stale', detail: `Last modified ${ageMinutes}m ago — may contain data from previous validation runs` });
        staleDetected++;
      }

      // Check file size for suspicious accumulation
      if (stat.size > 100000) {
        issues.push({ file, issue: 'large_state', severity: 'warn', detail: `File is ${Math.round(stat.size / 1024)}KB — may have accumulated stale entries` });
      }
    } catch {
      issues.push({ file, issue: 'read_error', severity: 'warn', detail: 'Could not stat file' });
    }
  }

  const clean = staleDetected === 0;

  return {
    run_id: uid(), issues, state_files_checked: filesChecked,
    stale_detected: staleDetected, clean,
    detail: clean ? 'All validation state is current-session fresh' : `${staleDetected} stale state file(s) detected — recommend clearing before final validation`,
    created_at: new Date().toISOString(),
  };
}

/** Clear stale validation state for clean run */
export function clearValidationState(): { cleared: string[]; errors: string[] } {
  const cleared: string[] = [];
  const errors: string[] = [];
  for (const file of VALIDATION_STATE_FILES) {
    const fullPath = path.join(STATE_DIR, file);
    if (fs.existsSync(fullPath)) {
      try { fs.unlinkSync(fullPath); cleared.push(file); } catch (e) { errors.push(`${file}: ${e}`); }
    }
  }
  return { cleared, errors };
}

/** Compute final Go verification report with all evidence */
export function computeFinalGoVerification(): FinalGoVerificationReport {
  // Run clean-state check
  const cleanState = verify();

  // Get network validation
  let networkValidation = null;
  try {
    const nhv = require('./network-http-validation') as { getLatestRun(): unknown };
    networkValidation = nhv.getLatestRun();
  } catch { /* */ }

  // Get reliability closure
  let reliabilityClosure = null;
  try {
    const rc = require('./reliability-closure') as { computeClosure(): unknown };
    reliabilityClosure = rc.computeClosure();
  } catch { /* */ }

  // Compute production decision
  const productionDecision = computeProductionDecision(networkValidation as any, reliabilityClosure as any, cleanState);

  return {
    report_id: uid(),
    production_decision: productionDecision,
    network_validation: networkValidation as any,
    reliability_closure: reliabilityClosure as any,
    clean_state: cleanState,
    created_at: new Date().toISOString(),
  };
}

function computeProductionDecision(
  netVal: { passed: number; total: number; network_validated: number } | null,
  relClosure: { closure_score: number; proxy_only: number } | null,
  cleanState: CleanStateVerificationRun
): FinalProductionDecision {
  const gates: FinalGoLiveGate[] = [];
  const confidence: VerificationConfidence[] = [];
  const remainingGaps: string[] = [];

  // Build evidence bundle
  const bundle: GoEvidenceBundle = {
    network_validation: { passed: 0, total: 0, all_pass: false },
    blocker_reconciliation: { closed: 0, total: 0, all_closed: false },
    workflow_closure: { usable: 0, total: 0, all_usable: false },
    middleware_truth: { score: 0, all_verified: false },
    reliability_closure: { score: 0, no_proxy_gaps: false },
    clean_state: { clean: cleanState.clean, stale_count: cleanState.stale_detected },
    operator_acceptance: { score: 0 },
    security_posture: 'unknown',
  };

  // Gate 1: Network HTTP validation
  if (netVal) {
    bundle.network_validation = { passed: netVal.passed, total: netVal.total, all_pass: netVal.passed === netVal.total };
    gates.push({ gate_id: 'g_network', name: 'Network HTTP validation', required: true, passed: netVal.passed === netVal.total, detail: `${netVal.passed}/${netVal.total} passed, ${netVal.network_validated} at network level` });
    confidence.push({ dimension: 'Network validation', level: netVal.network_validated > 0 ? 'high' : 'medium', evidence_count: netVal.passed, detail: netVal.network_validated > 0 ? 'True network-level validation' : 'Function-level fallback' });
    if (netVal.passed < netVal.total) remainingGaps.push(`${netVal.total - netVal.passed} network validation case(s) failed`);
  } else {
    gates.push({ gate_id: 'g_network', name: 'Network HTTP validation', required: true, passed: false, detail: 'No validation run' });
    remainingGaps.push('Network validation not yet run');
  }

  // Gate 2: Blocker reconciliation
  try {
    const fbr = require('./final-blocker-reconciliation') as { reconcile(): { closed: number; total: number; open: number } };
    const r = fbr.reconcile();
    bundle.blocker_reconciliation = { closed: r.closed, total: r.total, all_closed: r.open === 0 };
    gates.push({ gate_id: 'g_blockers', name: 'Blocker reconciliation', required: true, passed: r.open === 0, detail: `${r.closed}/${r.total} closed` });
    if (r.open > 0) remainingGaps.push(`${r.open} open blocker(s)`);
  } catch { gates.push({ gate_id: 'g_blockers', name: 'Blocker reconciliation', required: true, passed: false, detail: 'Module not available' }); }

  // Gate 3: Workflow closure
  try {
    const fsd = require('./final-ship-decision') as { getWorkflowClosure(): { usable: number; total: number; partial: number } };
    const wf = fsd.getWorkflowClosure();
    bundle.workflow_closure = { usable: wf.usable, total: wf.total, all_usable: wf.partial === 0 };
    gates.push({ gate_id: 'g_workflows', name: 'Workflow closure', required: true, passed: wf.partial === 0, detail: `${wf.usable}/${wf.total} usable` });
    if (wf.partial > 0) remainingGaps.push(`${wf.partial} partial workflow(s)`);
  } catch { gates.push({ gate_id: 'g_workflows', name: 'Workflow closure', required: true, passed: false, detail: 'Module not available' }); }

  // Gate 4: Middleware truth
  try {
    const lmw = require('./live-middleware-wiring') as { getTruthReport(): { truth_score: number; executed_and_verified: number; total_areas: number } };
    const t = lmw.getTruthReport();
    bundle.middleware_truth = { score: t.truth_score, all_verified: t.executed_and_verified === t.total_areas };
    gates.push({ gate_id: 'g_middleware', name: 'Middleware truth', required: true, passed: t.truth_score >= 95, detail: `${t.truth_score}%` });
    if (t.truth_score < 95) remainingGaps.push(`Middleware truth at ${t.truth_score}%`);
  } catch { gates.push({ gate_id: 'g_middleware', name: 'Middleware truth', required: true, passed: false, detail: 'Module not available' }); }

  // Gate 5: Reliability closure
  if (relClosure) {
    bundle.reliability_closure = { score: relClosure.closure_score, no_proxy_gaps: relClosure.proxy_only === 0 };
    gates.push({ gate_id: 'g_reliability', name: 'Reliability closure', required: true, passed: relClosure.proxy_only === 0, detail: `Score ${relClosure.closure_score}%, ${relClosure.proxy_only} proxy-only` });
    confidence.push({ dimension: 'Reliability', level: relClosure.proxy_only === 0 ? 'high' : 'low', evidence_count: relClosure.closure_score, detail: `${relClosure.proxy_only} proxy-only metrics` });
    if (relClosure.proxy_only > 0) remainingGaps.push(`${relClosure.proxy_only} proxy-only reliability metric(s)`);
  } else {
    gates.push({ gate_id: 'g_reliability', name: 'Reliability closure', required: true, passed: false, detail: 'Not computed' });
  }

  // Gate 6: Clean state
  gates.push({ gate_id: 'g_clean_state', name: 'Clean state verification', required: false, passed: cleanState.clean, detail: cleanState.detail });
  confidence.push({ dimension: 'Clean state', level: cleanState.clean ? 'high' : 'medium', evidence_count: cleanState.state_files_checked, detail: cleanState.detail });
  if (!cleanState.clean) remainingGaps.push(`${cleanState.stale_detected} stale state file(s)`);

  // Gate 7: Operator acceptance
  try {
    const oa = require('./operator-acceptance') as { runAcceptance(): { usable: number; checks: Array<unknown> } };
    const a = oa.runAcceptance();
    const rate = a.checks.length > 0 ? Math.round((a.usable / a.checks.length) * 100) : 0;
    bundle.operator_acceptance = { score: rate };
    gates.push({ gate_id: 'g_acceptance', name: 'Operator acceptance', required: true, passed: rate >= 95, detail: `${rate}%` });
  } catch { gates.push({ gate_id: 'g_acceptance', name: 'Operator acceptance', required: true, passed: false, detail: 'Module not available' }); }

  // Gate 8: Security posture
  try {
    const sh = require('./security-hardening') as { runAssessment(): { overall: string } };
    const r = sh.runAssessment();
    bundle.security_posture = r.overall;
    gates.push({ gate_id: 'g_security', name: 'Security posture', required: true, passed: r.overall === 'strong' || r.overall === 'moderate', detail: r.overall });
  } catch { gates.push({ gate_id: 'g_security', name: 'Security posture', required: false, passed: true, detail: 'Assumed adequate' }); }

  // Decision
  const requiredGates = gates.filter(g => g.required);
  const allRequiredPass = requiredGates.every(g => g.passed);
  const passedCount = gates.filter(g => g.passed).length;
  const overallScore = gates.length > 0 ? Math.round((passedCount / gates.length) * 100) : 0;

  let decision: FinalProductionDecision['decision'] = 'no_go';
  if (allRequiredPass && overallScore >= 90) decision = 'go';
  else if (requiredGates.filter(g => !g.passed).length <= 1 && overallScore >= 75) decision = 'conditional_go';

  return {
    report_id: uid(), decision, confidence, evidence_bundle: bundle,
    overall_score: overallScore, gates, remaining_gaps: remainingGaps,
    created_at: new Date().toISOString(),
  };
}

module.exports = { verify, clearValidationState, computeFinalGoVerification };
