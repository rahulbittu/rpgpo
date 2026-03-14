"use strict";
// GPO Promotion Dossiers — Generated from completed execution graphs
// Summarizes task, board rationale, chief of staff plan, outputs, reviews,
// risks, alignment, privacy, and produces a promote/hold/rework recommendation.
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateDossier = generateDossier;
exports.getDossier = getDossier;
exports.getAllDossiers = getAllDossiers;
exports.getDossierForGraph = getDossierForGraph;
exports.promoteDossier = promoteDossier;
exports.updateRecommendation = updateRecommendation;
const fs = require('fs');
const path = require('path');
const DOSSIERS_FILE = path.resolve(__dirname, '..', '..', 'state', 'promotion-dossiers.json');
function uid() {
    return 'pd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function readDossiers() {
    try {
        if (!fs.existsSync(DOSSIERS_FILE))
            return [];
        return JSON.parse(fs.readFileSync(DOSSIERS_FILE, 'utf-8'));
    }
    catch {
        return [];
    }
}
function writeDossiers(dossiers) {
    const dir = path.dirname(DOSSIERS_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    if (dossiers.length > 200)
        dossiers.length = 200;
    fs.writeFileSync(DOSSIERS_FILE, JSON.stringify(dossiers, null, 2));
}
// ═══════════════════════════════════════════
// Dossier Generation
// ═══════════════════════════════════════════
/** Generate a promotion dossier from a completed execution graph */
function generateDossier(graphId) {
    let graph;
    let nodes;
    let gatesSummary;
    let reviewResults;
    try {
        const eg = require('./execution-graph');
        graph = eg.getGraph(graphId);
        nodes = eg.getNodesForGraph(graphId);
    }
    catch {
        return null;
    }
    if (!graph)
        return null;
    // Gather gate results
    try {
        const ag = require('./approval-gates');
        const gates = ag.getGatesForGraph(graphId);
        gatesSummary = gates.map(g => `[${g.gate_type}] ${g.title}: ${g.status}${g.resolution_notes ? ' — ' + g.resolution_notes : ''}`);
    }
    catch {
        gatesSummary = [];
    }
    // Gather review results
    try {
        const rc = require('./review-contracts');
        reviewResults = rc.getReviewSummary(graphId);
    }
    catch {
        reviewResults = [];
    }
    // Gather mission alignment
    let missionAlignmentSummary = 'No mission statement available for alignment check';
    try {
        const ms = require('./mission-statements');
        const alignment = ms.checkMissionAlignment(graph.title, graph.domain);
        missionAlignmentSummary = alignment.reason + (alignment.statement_snippet ? ` (Mission: "${alignment.statement_snippet}")` : '');
    }
    catch { /* mission statements not loaded */ }
    // Gather privacy summary
    let privacySummary = 'Instance-scoped, privacy policy enforced';
    try {
        const inst = require('./instance');
        if (inst.isMissionIsolated(graph.domain)) {
            privacySummary = `Mission "${graph.domain}" is isolated — no external data transmission allowed`;
        }
    }
    catch { /* instance not loaded */ }
    // Build outputs summary
    const completedNodes = nodes.filter(n => n.status === 'completed');
    const failedNodes = nodes.filter(n => n.status === 'failed');
    const outputsSummary = completedNodes.length > 0
        ? completedNodes.map(n => `- ${n.title}: ${n.output_summary || 'completed'}`).join('\n')
        : 'No completed outputs';
    // Identify risks and unresolved items
    const risks = [];
    const unresolved = [];
    if (failedNodes.length > 0) {
        risks.push(`${failedNodes.length} node(s) failed: ${failedNodes.map(n => n.title).join(', ')}`);
    }
    const failedReviews = reviewResults.filter(r => r.verdict === 'fail');
    if (failedReviews.length > 0) {
        risks.push(`${failedReviews.length} review(s) failed: ${failedReviews.map(r => r.review_type).join(', ')}`);
    }
    const incompleteReviews = reviewResults.filter(r => r.checklist_passed < r.checklist_total);
    for (const r of incompleteReviews) {
        unresolved.push(`${r.review_type}: ${r.checklist_total - r.checklist_passed}/${r.checklist_total} items unchecked`);
    }
    // Calculate confidence score (0-100)
    let confidence = 100;
    if (failedNodes.length > 0)
        confidence -= failedNodes.length * 15;
    if (failedReviews.length > 0)
        confidence -= failedReviews.length * 20;
    if (unresolved.length > 0)
        confidence -= unresolved.length * 5;
    if (graph.status !== 'completed')
        confidence -= 30;
    confidence = Math.max(0, Math.min(100, confidence));
    // Determine recommendation
    let recommendation = 'promote';
    if (confidence < 40 || failedReviews.length > 0)
        recommendation = 'rework';
    else if (confidence < 70 || failedNodes.length > 0)
        recommendation = 'hold';
    const dossier = {
        dossier_id: uid(),
        graph_id: graphId,
        task_id: graph.task_id,
        domain: graph.domain,
        lane: graph.lane,
        title: `Promotion Dossier: ${graph.title}`,
        task_summary: graph.title,
        board_rationale: graph.board_rationale,
        chief_of_staff_plan: graph.chief_of_staff_plan,
        outputs_summary: outputsSummary,
        review_results: reviewResults,
        risks,
        unresolved_items: unresolved,
        mission_alignment_summary: missionAlignmentSummary,
        privacy_summary: privacySummary,
        confidence_score: confidence,
        recommendation,
        created_at: new Date().toISOString(),
    };
    const dossiers = readDossiers();
    dossiers.unshift(dossier);
    writeDossiers(dossiers);
    // Link dossier back to graph
    try {
        const eg = require('./execution-graph');
        eg.updateGraph(graphId, { dossier_id: dossier.dossier_id });
    }
    catch { /* graph module not loaded */ }
    return dossier;
}
// ═══════════════════════════════════════════
// Dossier CRUD
// ═══════════════════════════════════════════
function getDossier(dossierId) {
    return readDossiers().find(d => d.dossier_id === dossierId) || null;
}
function getAllDossiers() {
    return readDossiers();
}
function getDossierForGraph(graphId) {
    return readDossiers().find(d => d.graph_id === graphId) || null;
}
// ═══════════════════════════════════════════
// Promotion Actions
// ═══════════════════════════════════════════
/** Mark a dossier as promoted */
function promoteDossier(dossierId) {
    const dossiers = readDossiers();
    const idx = dossiers.findIndex(d => d.dossier_id === dossierId);
    if (idx === -1)
        return null;
    if (dossiers[idx].recommendation === 'rework')
        return null; // Cannot promote rework
    dossiers[idx].promoted_at = new Date().toISOString();
    writeDossiers(dossiers);
    return dossiers[idx];
}
/** Update recommendation (e.g., after manual review) */
function updateRecommendation(dossierId, recommendation) {
    const dossiers = readDossiers();
    const idx = dossiers.findIndex(d => d.dossier_id === dossierId);
    if (idx === -1)
        return null;
    dossiers[idx].recommendation = recommendation;
    writeDossiers(dossiers);
    return dossiers[idx];
}
module.exports = {
    generateDossier,
    getDossier, getAllDossiers, getDossierForGraph,
    promoteDossier, updateRecommendation,
};
//# sourceMappingURL=promotion-dossiers.js.map