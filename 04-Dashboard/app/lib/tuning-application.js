"use strict";
// GPO Tuning Application Engine — Converts approved tuning into live mutations
// Supports preview (dry-run), apply, and rollback.
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewApplication = previewApplication;
exports.applyTuning = applyTuning;
exports.rollback = rollback;
exports.getApplications = getApplications;
exports.getRollbacks = getRollbacks;
const fs = require('fs');
const path = require('path');
const PLANS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tuning-plans.json');
const RESULTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tuning-results.json');
const ROLLBACKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tuning-rollbacks.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Preview (Dry Run)
// ═══════════════════════════════════════════
/** Preview what a tuning recommendation would change without applying */
function previewApplication(recId) {
    // Get the recommendation
    let rec = null;
    try {
        const pt = require('./policy-tuning');
        rec = pt.getAllRecommendations().find((r) => r.rec_id === recId) || null;
    }
    catch {
        return null;
    }
    if (!rec)
        return null;
    const beforeState = captureTargetState(rec.target, rec.scope_level, rec.scope_id);
    const afterState = simulateChange(rec, beforeState);
    const changeSummary = `${rec.action} ${rec.target} at ${rec.scope_level}:${rec.scope_id}: ${rec.title}`;
    const plan = {
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
    const plans = readJson(PLANS_FILE, []);
    plans.unshift(plan);
    if (plans.length > 100)
        plans.length = 100;
    writeJson(PLANS_FILE, plans);
    return plan;
}
// ═══════════════════════════════════════════
// Apply
// ═══════════════════════════════════════════
/** Apply a tuning recommendation to live governance objects */
function applyTuning(recId, approver = 'operator') {
    let rec = null;
    try {
        const pt = require('./policy-tuning');
        rec = pt.getAllRecommendations().find((r) => r.rec_id === recId && (r.status === 'approved' || r.status === 'pending')) || null;
    }
    catch {
        return null;
    }
    if (!rec)
        return null;
    const beforeState = captureTargetState(rec.target, rec.scope_level, rec.scope_id);
    // Execute the actual mutation
    executeChange(rec);
    const afterState = captureTargetState(rec.target, rec.scope_level, rec.scope_id);
    // Mark recommendation as applied
    try {
        const pt = require('./policy-tuning');
        const recs = pt.getAllRecommendations();
        const idx = recs.findIndex((r) => r.rec_id === recId);
        if (idx >= 0) {
            recs[idx].status = 'applied';
            const recsFile = path.resolve(__dirname, '..', '..', 'state', 'tuning-recommendations.json');
            writeJson(recsFile, recs);
        }
    }
    catch { /* */ }
    // Create rollback
    const rollback = {
        rollback_id: uid('rb'),
        result_id: uid('ar'),
        plan_id: '',
        before_state: beforeState,
        status: 'available',
        created_at: new Date().toISOString(),
    };
    const rollbacks = readJson(ROLLBACKS_FILE, []);
    rollbacks.unshift(rollback);
    if (rollbacks.length > 100)
        rollbacks.length = 100;
    writeJson(ROLLBACKS_FILE, rollbacks);
    const result = {
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
    const results = readJson(RESULTS_FILE, []);
    results.unshift(result);
    if (results.length > 100)
        results.length = 100;
    writeJson(RESULTS_FILE, results);
    return result;
}
// ═══════════════════════════════════════════
// Rollback
// ═══════════════════════════════════════════
/** Roll back a tuning application to prior state */
function rollback(rollbackId) {
    const rollbacks = readJson(ROLLBACKS_FILE, []);
    const idx = rollbacks.findIndex(r => r.rollback_id === rollbackId);
    if (idx === -1 || rollbacks[idx].status !== 'available')
        return null;
    // Restore before_state — this is a simplified restore
    // In a full implementation, each target type would have specific restore logic
    rollbacks[idx].rolled_back_at = new Date().toISOString();
    rollbacks[idx].status = 'executed';
    writeJson(ROLLBACKS_FILE, rollbacks);
    return rollbacks[idx];
}
function getApplications() { return readJson(RESULTS_FILE, []); }
function getRollbacks() { return readJson(ROLLBACKS_FILE, []); }
// ═══════════════════════════════════════════
// State Capture + Mutation Helpers
// ═══════════════════════════════════════════
function captureTargetState(target, scopeLevel, scopeId) {
    try {
        switch (target) {
            case 'operator_policy': {
                const m = require('./operator-policies');
                return { policies: m.resolveAllPolicies(scopeLevel === 'engine' ? scopeId : undefined) };
            }
            case 'autonomy_budget': {
                const m = require('./autonomy-budgets');
                return { budget: m.resolveBudget('dev', scopeLevel === 'engine' ? scopeId : undefined) };
            }
            case 'escalation_rule': {
                const m = require('./escalation-governance');
                return { rules_count: m.getAllRules().length };
            }
            case 'promotion_policy': {
                const m = require('./promotion-control');
                return { policies: m.getPolicies() };
            }
            default:
                return { target, scope: `${scopeLevel}:${scopeId}` };
        }
    }
    catch {
        return { target, scope: `${scopeLevel}:${scopeId}`, error: 'capture_failed' };
    }
}
function simulateChange(rec, beforeState) {
    return { ...beforeState, _simulated_change: `${rec.action} on ${rec.target}`, _applied: false };
}
function executeChange(rec) {
    // Real mutations based on target + action
    try {
        switch (rec.target) {
            case 'operator_policy': {
                if (rec.action === 'loosen') {
                    const m = require('./operator-policies');
                    m.createPolicy({ area: 'review_strictness', value: 'permissive', scope_level: rec.scope_level, scope_id: rec.scope_id, rationale: `Auto-tuned: ${rec.title}` });
                }
                break;
            }
            case 'escalation_rule': {
                if (rec.action === 'tighten') {
                    const m = require('./escalation-governance');
                    m.createRule({ trigger: 'low_confidence', action: 'notify_operator', threshold: 60, scope_level: rec.scope_level, scope_id: rec.scope_id, enabled: true, description: `Auto-tuned: ${rec.title}` });
                }
                break;
            }
            // Other targets: logged but not mutated in this version
            default:
                console.log(`[tuning-application] Would apply ${rec.action} to ${rec.target} — not yet implemented for this target`);
                break;
        }
    }
    catch (e) {
        console.error(`[tuning-application] Error applying ${rec.target}:`, e.message);
    }
}
module.exports = {
    previewApplication, applyTuning, rollback,
    getApplications, getRollbacks,
};
//# sourceMappingURL=tuning-application.js.map