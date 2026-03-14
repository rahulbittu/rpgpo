"use strict";
// GPO Release Readiness Scoring — Comprehensive readiness assessment
// Scores graphs, dossiers, and releases across 7 categories.
// Returns blockers, warnings, and recommendation: not_ready / conditional / ready.
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = getRules;
exports.computeScore = computeScore;
exports.getScoresForEntity = getScoresForEntity;
exports.getAllScores = getAllScores;
const fs = require('fs');
const path = require('path');
const SCORES_FILE = path.resolve(__dirname, '..', '..', 'state', 'readiness-scores.json');
const RULES_FILE = path.resolve(__dirname, '..', '..', 'state', 'readiness-rules.json');
function uid() { return 'rr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ═══════════════════════════════════════════
// Default Rules
// ═══════════════════════════════════════════
function defaultRules() {
    return [
        { rule_id: 'rr_policy', category: 'policy_compliance', title: 'Operator policies pass simulation', weight: 15, check_fn: 'checkPolicySim', enabled: true },
        { rule_id: 'rr_reviews', category: 'review_health', title: 'All reviews completed with pass/waive', weight: 20, check_fn: 'checkReviews', enabled: true },
        { rule_id: 'rr_docs', category: 'documentation', title: 'Required documentation present', weight: 15, check_fn: 'checkDocs', enabled: true },
        { rule_id: 'rr_escal', category: 'escalation_stability', title: 'No unresolved escalation events', weight: 10, check_fn: 'checkEscalation', enabled: true },
        { rule_id: 'rr_prov', category: 'provider_confidence', title: 'Provider fits above threshold', weight: 10, check_fn: 'checkProviders', enabled: true },
        { rule_id: 'rr_mission', category: 'mission_alignment', title: 'Work aligns with mission statement', weight: 15, check_fn: 'checkMission', enabled: true },
        { rule_id: 'rr_risk', category: 'risk_resolution', title: 'All identified risks addressed', weight: 15, check_fn: 'checkRisks', enabled: true },
    ];
}
function getRules() {
    const stored = readJson(RULES_FILE, []);
    return stored.length > 0 ? stored : defaultRules();
}
// ═══════════════════════════════════════════
// Scoring Engine
// ═══════════════════════════════════════════
/** Compute release readiness score for a graph/dossier/release */
function computeScore(relatedType, relatedId) {
    const rules = getRules().filter(r => r.enabled);
    const categories = {};
    const blockers = [];
    const warnings = [];
    let totalScore = 0;
    let totalMax = 0;
    // Determine lane context
    let lane = 'dev';
    let graphId = relatedId;
    if (relatedType === 'dossier') {
        try {
            const pd = require('./promotion-dossiers');
            const d = pd.getDossier(relatedId);
            if (d) {
                lane = d.lane;
                graphId = d.graph_id;
            }
        }
        catch { /* */ }
    }
    else if (relatedType === 'graph') {
        try {
            const eg = require('./execution-graph');
            const g = eg.getGraph(relatedId);
            if (g)
                lane = g.lane;
        }
        catch { /* */ }
    }
    for (const rule of rules) {
        let score = 0;
        let detail = '';
        switch (rule.check_fn) {
            case 'checkPolicySim': {
                try {
                    const sim = require('./policy-simulation');
                    const r = sim.runSimulation(relatedType, relatedId, lane);
                    if (r.outcome === 'pass') {
                        score = rule.weight;
                        detail = 'Policy simulation passed';
                    }
                    else if (r.outcome === 'warn') {
                        score = Math.round(rule.weight * 0.6);
                        detail = `Warnings: ${r.warnings.join(', ')}`;
                        warnings.push(...r.warnings);
                    }
                    else {
                        score = 0;
                        detail = `Blocked: ${r.blocked_actions.join(', ')}`;
                        blockers.push(...r.blocked_actions);
                    }
                }
                catch {
                    score = Math.round(rule.weight * 0.5);
                    detail = 'Simulation unavailable';
                }
                break;
            }
            case 'checkReviews': {
                try {
                    const rc = require('./review-contracts');
                    const reviews = rc.getReviewsForGraph(graphId);
                    const total = reviews.length || 1;
                    const passed = reviews.filter(r => r.verdict === 'pass' || r.verdict === 'waive').length;
                    const failed = reviews.filter(r => r.verdict === 'fail').length;
                    score = Math.round((passed / total) * rule.weight);
                    detail = `${passed}/${total} reviews passed`;
                    if (failed > 0) {
                        blockers.push(`${failed} review(s) failed`);
                        detail += `, ${failed} failed`;
                    }
                    if (reviews.some(r => !r.verdict))
                        warnings.push('Some reviews pending');
                }
                catch {
                    score = 0;
                    detail = 'Reviews unavailable';
                }
                break;
            }
            case 'checkDocs': {
                try {
                    const dg = require('./documentation-governance');
                    const scopeType = relatedType === 'graph' ? 'execution_graph' : relatedType === 'dossier' ? 'promotion' : 'release';
                    const check = dg.checkRequirements(scopeType, relatedId, lane);
                    if (check.met) {
                        score = rule.weight;
                        detail = 'All docs present';
                    }
                    else {
                        score = 0;
                        detail = `Missing: ${check.missing.join(', ')}`;
                        if (check.blocking)
                            blockers.push(`Docs missing: ${check.missing.join(', ')}`);
                        else
                            warnings.push(`Docs missing: ${check.missing.join(', ')}`);
                    }
                }
                catch {
                    score = Math.round(rule.weight * 0.5);
                    detail = 'Doc check unavailable';
                }
                break;
            }
            case 'checkEscalation': {
                try {
                    const eg = require('./escalation-governance');
                    const events = eg.getEventsForGraph(graphId);
                    const unresolved = events.filter(e => !e.resolved);
                    if (unresolved.length === 0) {
                        score = rule.weight;
                        detail = 'No unresolved escalations';
                    }
                    else {
                        score = 0;
                        detail = `${unresolved.length} unresolved escalation(s)`;
                        warnings.push(`${unresolved.length} unresolved escalation(s)`);
                    }
                }
                catch {
                    score = rule.weight;
                    detail = 'No escalation data';
                }
                break;
            }
            case 'checkProviders': {
                try {
                    const pr = require('./provider-registry');
                    const fits = pr.getAllFits().filter((f) => f.state !== 'deprecated');
                    const avgConf = fits.length > 0 ? fits.reduce((s, f) => s + f.confidence, 0) / fits.length : 50;
                    score = Math.round((Math.min(avgConf, 100) / 100) * rule.weight);
                    detail = `Avg provider confidence: ${Math.round(avgConf)}%`;
                    if (avgConf < 30)
                        warnings.push('Low provider confidence');
                }
                catch {
                    score = Math.round(rule.weight * 0.5);
                    detail = 'Provider data unavailable';
                }
                break;
            }
            case 'checkMission': {
                try {
                    const ms = require('./mission-statements');
                    // Get graph title for alignment check
                    let title = relatedId;
                    try {
                        const eg = require('./execution-graph');
                        const g = eg.getGraph(graphId);
                        if (g)
                            title = g.title;
                    }
                    catch { /* */ }
                    const alignment = ms.checkMissionAlignment(title);
                    if (alignment.aligned) {
                        score = rule.weight;
                        detail = alignment.reason;
                    }
                    else {
                        score = Math.round(rule.weight * 0.3);
                        detail = alignment.reason;
                        warnings.push('Mission alignment concern');
                    }
                }
                catch {
                    score = Math.round(rule.weight * 0.5);
                    detail = 'Mission check unavailable';
                }
                break;
            }
            case 'checkRisks': {
                try {
                    const pd = require('./promotion-dossiers');
                    const dossier = pd.getDossierForGraph(graphId);
                    if (dossier) {
                        const unresolvedRisks = dossier.risks.length + dossier.unresolved_items.length;
                        if (unresolvedRisks === 0) {
                            score = rule.weight;
                            detail = 'All risks resolved';
                        }
                        else {
                            score = Math.max(0, rule.weight - unresolvedRisks * 3);
                            detail = `${unresolvedRisks} unresolved risk(s)/item(s)`;
                            warnings.push(`${unresolvedRisks} unresolved risk(s)`);
                        }
                    }
                    else {
                        score = Math.round(rule.weight * 0.5);
                        detail = 'No dossier available';
                    }
                }
                catch {
                    score = Math.round(rule.weight * 0.5);
                    detail = 'Risk check unavailable';
                }
                break;
            }
        }
        categories[rule.category] = { score, max: rule.weight, details: detail };
        totalScore += score;
        totalMax += rule.weight;
    }
    const pct = totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0;
    let recommendation = 'ready';
    if (blockers.length > 0 || pct < 40)
        recommendation = 'not_ready';
    else if (warnings.length > 0 || pct < 75)
        recommendation = 'conditional';
    const scoreRecord = {
        score_id: uid(),
        related_type: relatedType,
        related_id: relatedId,
        overall_score: pct,
        category_scores: categories,
        blockers,
        warnings,
        recommendation,
        created_at: new Date().toISOString(),
    };
    const scores = readJson(SCORES_FILE, []);
    scores.unshift(scoreRecord);
    if (scores.length > 200)
        scores.length = 200;
    writeJson(SCORES_FILE, scores);
    return scoreRecord;
}
function getScoresForEntity(relatedType, relatedId) {
    return readJson(SCORES_FILE, []).filter(s => s.related_type === relatedType && s.related_id === relatedId);
}
function getAllScores() {
    return readJson(SCORES_FILE, []);
}
module.exports = {
    getRules, computeScore, getScoresForEntity, getAllScores,
};
//# sourceMappingURL=release-readiness.js.map