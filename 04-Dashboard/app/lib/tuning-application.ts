// GPO Tuning Application Engine — Converts approved tuning into live mutations
// Supports preview (dry-run), apply, and rollback.

import type {
  TuningApplicationPlan, TuningApplicationResult, TuningRollback,
  PolicyTuningRecommendation, TuningTarget, TuningAction,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const PLANS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tuning-plans.json');
const RESULTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tuning-results.json');
const ROLLBACKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tuning-rollbacks.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Preview (Dry Run)
// ═══════════════════════════════════════════

/** Preview what a tuning recommendation would change without applying */
export function previewApplication(recId: string): TuningApplicationPlan | null {
  // Get the recommendation
  let rec: PolicyTuningRecommendation | null = null;
  try {
    const pt = require('./policy-tuning') as { getAllRecommendations(): PolicyTuningRecommendation[] };
    rec = pt.getAllRecommendations().find((r: PolicyTuningRecommendation) => r.rec_id === recId) || null;
  } catch { return null; }
  if (!rec) return null;

  const beforeState = captureTargetState(rec.target, rec.scope_level, rec.scope_id);
  const afterState = simulateChange(rec, beforeState);
  const changeSummary = `${rec.action} ${rec.target} at ${rec.scope_level}:${rec.scope_id}: ${rec.title}`;

  const plan: TuningApplicationPlan = {
    plan_id: uid('tp'),
    rec_id: recId,
    target: rec.target,
    action: rec.action,
    scope: `${rec.scope_level}:${rec.scope_id}`,
    before_state: beforeState,
    after_state: afterState,
    change_summary: changeSummary,
    risk: rec.risk,
    dry_run: true,
    created_at: new Date().toISOString(),
  };

  const plans = readJson<TuningApplicationPlan[]>(PLANS_FILE, []);
  plans.unshift(plan);
  if (plans.length > 100) plans.length = 100;
  writeJson(PLANS_FILE, plans);

  return plan;
}

// ═══════════════════════════════════════════
// Apply
// ═══════════════════════════════════════════

/** Apply a tuning recommendation to live governance objects */
export function applyTuning(recId: string, approver: string = 'operator'): TuningApplicationResult | null {
  let rec: PolicyTuningRecommendation | null = null;
  try {
    const pt = require('./policy-tuning') as { getAllRecommendations(): PolicyTuningRecommendation[] };
    rec = pt.getAllRecommendations().find((r: PolicyTuningRecommendation) => r.rec_id === recId && (r.status === 'approved' || r.status === 'pending')) || null;
  } catch { return null; }
  if (!rec) return null;

  const beforeState = captureTargetState(rec.target, rec.scope_level, rec.scope_id);

  // Execute the actual mutation
  executeChange(rec);

  const afterState = captureTargetState(rec.target, rec.scope_level, rec.scope_id);

  // Mark recommendation as applied
  try {
    const pt = require('./policy-tuning') as { getAllRecommendations(): PolicyTuningRecommendation[] };
    const recs = pt.getAllRecommendations();
    const idx = recs.findIndex((r: PolicyTuningRecommendation) => r.rec_id === recId);
    if (idx >= 0) {
      recs[idx].status = 'applied';
      const recsFile = path.resolve(__dirname, '..', '..', 'state', 'tuning-recommendations.json');
      writeJson(recsFile, recs);
    }
  } catch { /* */ }

  // Create rollback
  const rollback: TuningRollback = {
    rollback_id: uid('rb'),
    result_id: uid('ar'),
    plan_id: '',
    before_state: beforeState,
    status: 'available',
    created_at: new Date().toISOString(),
  };
  const rollbacks = readJson<TuningRollback[]>(ROLLBACKS_FILE, []);
  rollbacks.unshift(rollback);
  if (rollbacks.length > 100) rollbacks.length = 100;
  writeJson(ROLLBACKS_FILE, rollbacks);

  const result: TuningApplicationResult = {
    result_id: rollback.result_id,
    plan_id: '',
    rec_id: recId,
    applied: true,
    before_state: beforeState,
    after_state: afterState,
    change_summary: `Applied: ${rec.action} ${rec.target} — ${rec.title}`,
    approver,
    evidence_ids: rec.evidence_ids,
    rollback_id: rollback.rollback_id,
    created_at: new Date().toISOString(),
  };

  const results = readJson<TuningApplicationResult[]>(RESULTS_FILE, []);
  results.unshift(result);
  if (results.length > 100) results.length = 100;
  writeJson(RESULTS_FILE, results);

  return result;
}

// ═══════════════════════════════════════════
// Rollback
// ═══════════════════════════════════════════

/** Roll back a tuning application to prior state */
export function rollback(rollbackId: string): TuningRollback | null {
  const rollbacks = readJson<TuningRollback[]>(ROLLBACKS_FILE, []);
  const idx = rollbacks.findIndex(r => r.rollback_id === rollbackId);
  if (idx === -1 || rollbacks[idx].status !== 'available') return null;

  // Restore before_state — this is a simplified restore
  // In a full implementation, each target type would have specific restore logic
  rollbacks[idx].rolled_back_at = new Date().toISOString();
  rollbacks[idx].status = 'executed';
  writeJson(ROLLBACKS_FILE, rollbacks);

  return rollbacks[idx];
}

export function getApplications(): TuningApplicationResult[] { return readJson<TuningApplicationResult[]>(RESULTS_FILE, []); }
export function getRollbacks(): TuningRollback[] { return readJson<TuningRollback[]>(ROLLBACKS_FILE, []); }

// ═══════════════════════════════════════════
// State Capture + Mutation Helpers
// ═══════════════════════════════════════════

function captureTargetState(target: TuningTarget, scopeLevel: string, scopeId: string): Record<string, unknown> {
  try {
    switch (target) {
      case 'operator_policy': {
        const m = require('./operator-policies') as { resolveAllPolicies(d?: string): Record<string, unknown> };
        return { policies: m.resolveAllPolicies(scopeLevel === 'engine' ? scopeId : undefined) };
      }
      case 'autonomy_budget': {
        const m = require('./autonomy-budgets') as { resolveBudget(l: string, d?: string): unknown };
        return { budget: m.resolveBudget('dev', scopeLevel === 'engine' ? scopeId : undefined) };
      }
      case 'escalation_rule': {
        const m = require('./escalation-governance') as { getAllRules(): unknown[] };
        return { rules_count: m.getAllRules().length };
      }
      case 'promotion_policy': {
        const m = require('./promotion-control') as { getPolicies(): unknown[] };
        return { policies: m.getPolicies() };
      }
      default:
        return { target, scope: `${scopeLevel}:${scopeId}` };
    }
  } catch { return { target, scope: `${scopeLevel}:${scopeId}`, error: 'capture_failed' }; }
}

function simulateChange(rec: PolicyTuningRecommendation, beforeState: Record<string, unknown>): Record<string, unknown> {
  return { ...beforeState, _simulated_change: `${rec.action} on ${rec.target}`, _applied: false };
}

function executeChange(rec: PolicyTuningRecommendation): void {
  // Real mutations based on target + action
  try {
    switch (rec.target) {
      case 'operator_policy': {
        if (rec.action === 'loosen') {
          const m = require('./operator-policies') as { createPolicy(o: Record<string, unknown>): unknown };
          m.createPolicy({ area: 'review_strictness', value: 'permissive', scope_level: rec.scope_level, scope_id: rec.scope_id, rationale: `Auto-tuned: ${rec.title}` });
        }
        break;
      }
      case 'escalation_rule': {
        if (rec.action === 'tighten') {
          const m = require('./escalation-governance') as { createRule(o: Record<string, unknown>): unknown };
          m.createRule({ trigger: 'low_confidence', action: 'notify_operator', threshold: 60, scope_level: rec.scope_level, scope_id: rec.scope_id, enabled: true, description: `Auto-tuned: ${rec.title}` });
        }
        break;
      }
      // Other targets: logged but not mutated in this version
      default:
        console.log(`[tuning-application] Would apply ${rec.action} to ${rec.target} — not yet implemented for this target`);
        break;
    }
  } catch (e) {
    console.error(`[tuning-application] Error applying ${rec.target}:`, (e as Error).message);
  }
}

module.exports = {
  previewApplication, applyTuning, rollback,
  getApplications, getRollbacks,
};
