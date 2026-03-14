"use strict";
// GPO Promotion Control — Evaluates dev→beta and beta→prod promotion
// Uses dossier, readiness, simulation, docs, escalation, enforcement, overrides.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPolicies = getPolicies;
exports.createPolicy = createPolicy;
exports.evaluatePromotion = evaluatePromotion;
exports.executePromotion = executePromotion;
exports.getDecisionsForDossier = getDecisionsForDossier;
const fs = require('fs');
const path = require('path');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'promotion-decisions.json');
const POLICIES_FILE = path.resolve(__dirname, '..', '..', 'state', 'promotion-policies.json');
function uid() { return 'pc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Default Promotion Policies
// ═══════════════════════════════════════════
function defaultPolicies() {
    return [
        {
            policy_id: 'pp_beta', target_lane: 'beta',
            min_readiness_score: 40, require_all_reviews_passed: false,
            require_documentation_complete: false, require_no_open_escalations: false,
            allow_override: true, enabled: true,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        },
        {
            policy_id: 'pp_prod', target_lane: 'prod',
            min_readiness_score: 75, require_all_reviews_passed: true,
            require_documentation_complete: true, require_no_open_escalations: true,
            allow_override: false, enabled: true,
            created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        },
    ];
}
function getPolicies() {
    const stored = readJson(POLICIES_FILE, []);
    return stored.length > 0 ? stored : defaultPolicies();
}
function createPolicy(opts) {
    const policies = getPolicies();
    const policy = { ...opts, policy_id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    policies.unshift(policy);
    writeJson(POLICIES_FILE, policies);
    return policy;
}
// ═══════════════════════════════════════════
// Promotion Evaluation
// ═══════════════════════════════════════════
/** Evaluate whether a dossier can be promoted to a target lane */
function evaluatePromotion(dossierId, targetLane) {
    const blockers = [];
    const overridesUsed = [];
    let readinessScore;
    let enforcementLevel = 'allow';
    // Get policy for target lane
    const policy = getPolicies().find(p => p.target_lane === targetLane && p.enabled);
    // Get dossier
    let dossier = null;
    try {
        const pd = require('./promotion-dossiers');
        dossier = pd.getDossier(dossierId);
    }
    catch { /* */ }
    if (!dossier) {
        blockers.push('Dossier not found');
        return makeDecision(dossierId, targetLane, 'blocked', 'hard_block', undefined, blockers, []);
    }
    if (dossier.recommendation === 'rework') {
        blockers.push('Dossier recommendation is rework — cannot promote');
        return makeDecision(dossierId, targetLane, 'blocked', 'hard_block', undefined, blockers, []);
    }
    // Run enforcement engine
    const enfAction = targetLane === 'prod' ? 'promote_to_prod' : 'promote_to_beta';
    try {
        const ee = require('./enforcement-engine');
        const decision = ee.evaluate('dossier', dossierId, enfAction, targetLane);
        enforcementLevel = decision.level;
        if (decision.level === 'hard_block') {
            blockers.push(...decision.blockers);
        }
        else if (decision.level === 'soft_block' || decision.level === 'override_required') {
            // Check if overrides exist
            try {
                const ol = require('./override-ledger');
                const overrides = ol.getApprovedOverrides('dossier', dossierId, enfAction);
                if (overrides.length > 0) {
                    overridesUsed.push(...overrides.map(o => o.override_id));
                }
                else if (policy && !policy.allow_override) {
                    blockers.push(...decision.blockers);
                }
                else {
                    blockers.push(...decision.blockers.map(b => b + ' (override available)'));
                }
            }
            catch {
                blockers.push(...decision.blockers);
            }
        }
    }
    catch { /* */ }
    // Check readiness score
    try {
        const rr = require('./release-readiness');
        const scores = rr.getScoresForEntity('dossier', dossierId);
        if (scores.length > 0) {
            readinessScore = scores[0].overall_score;
            if (policy && readinessScore < policy.min_readiness_score) {
                blockers.push(`Readiness ${readinessScore}% below minimum ${policy.min_readiness_score}%`);
            }
        }
    }
    catch { /* */ }
    // Determine result
    let result = 'allowed';
    if (blockers.length > 0) {
        if (enforcementLevel === 'hard_block' || (policy && !policy.allow_override)) {
            result = 'blocked';
        }
        else if (overridesUsed.length > 0) {
            result = 'allowed_with_override';
        }
        else {
            result = 'blocked';
        }
    }
    return makeDecision(dossierId, targetLane, result, enforcementLevel, readinessScore, blockers, overridesUsed);
}
function makeDecision(dossierId, targetLane, result, enforcementLevel, readinessScore, blockers, overridesUsed) {
    const decision = {
        decision_id: uid(),
        dossier_id: dossierId,
        target_lane: targetLane,
        result,
        enforcement_level: enforcementLevel,
        readiness_score: readinessScore,
        blockers,
        overrides_used: overridesUsed,
        decided_at: new Date().toISOString(),
    };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 200)
        decisions.length = 200;
    writeJson(DECISIONS_FILE, decisions);
    return decision;
}
/** Execute promotion if evaluation allows it */
function executePromotion(dossierId, targetLane) {
    const decision = evaluatePromotion(dossierId, targetLane);
    if (decision.result === 'allowed' || decision.result === 'allowed_with_override') {
        try {
            const pd = require('./promotion-dossiers');
            const promoted = pd.promoteDossier(dossierId);
            return { decision, promoted: !!promoted };
        }
        catch {
            return { decision, promoted: false };
        }
    }
    return { decision, promoted: false };
}
function getDecisionsForDossier(dossierId) {
    return readJson(DECISIONS_FILE, []).filter(d => d.dossier_id === dossierId);
}
module.exports = {
    getPolicies, createPolicy,
    evaluatePromotion, executePromotion,
    getDecisionsForDossier,
};
//# sourceMappingURL=promotion-control.js.map