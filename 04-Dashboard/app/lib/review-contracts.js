"use strict";
// GPO Review Contracts — Checklist-based evaluations for execution graphs
// Review types: architecture, mission_alignment, privacy_policy, quality,
//               provider_disagreement, release_readiness
Object.defineProperty(exports, "__esModule", { value: true });
exports.createReview = createReview;
exports.attachDefaultReviews = attachDefaultReviews;
exports.getReviewsForGraph = getReviewsForGraph;
exports.getReview = getReview;
exports.getPendingReviews = getPendingReviews;
exports.completeReview = completeReview;
exports.autoPassReview = autoPassReview;
exports.areAllReviewsComplete = areAllReviewsComplete;
exports.getReviewSummary = getReviewSummary;
const fs = require('fs');
const path = require('path');
const REVIEWS_FILE = path.resolve(__dirname, '..', '..', 'state', 'review-contracts.json');
function uid() {
    return 'rc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function itemId() {
    return 'ci_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function readReviews() {
    try {
        if (!fs.existsSync(REVIEWS_FILE))
            return [];
        return JSON.parse(fs.readFileSync(REVIEWS_FILE, 'utf-8'));
    }
    catch {
        return [];
    }
}
function writeReviews(reviews) {
    const dir = path.dirname(REVIEWS_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    if (reviews.length > 500)
        reviews.length = 500;
    fs.writeFileSync(REVIEWS_FILE, JSON.stringify(reviews, null, 2));
}
// ═══════════════════════════════════════════
// Default Checklists per Review Type
// ═══════════════════════════════════════════
function buildChecklist(reviewType) {
    const items = [];
    switch (reviewType) {
        case 'architecture':
            items.push('Changes follow existing patterns and conventions', 'No unnecessary abstractions or premature generalizations', 'Module boundaries are respected', 'State management is consistent', 'Error handling is appropriate');
            break;
        case 'mission_alignment':
            items.push('Work directly supports stated mission objectives', 'No scope creep beyond original task', 'Outputs match expected outcome from deliberation', 'Success criteria from mission statement are addressed');
            break;
        case 'privacy_policy':
            items.push('No sensitive data sent to unauthorized providers', 'Mission isolation rules respected', 'Redaction patterns applied where needed', 'No secrets or credentials in code/output', 'Data stays within instance scope');
            break;
        case 'quality':
            items.push('Output meets expected quality standard', 'No regressions introduced', 'Tests pass (where applicable)', 'Code is readable and maintainable', 'Performance is acceptable');
            break;
        case 'provider_disagreement':
            items.push('Disagreement between agents is clearly documented', 'Operator has enough context to make a decision', 'Alternative approaches are presented', 'Risk of each approach is assessed');
            break;
        case 'release_readiness':
            items.push('All subtasks completed successfully', 'All approval gates cleared', 'No unresolved blocking issues', 'Documentation is up to date', 'Rollback plan exists (if applicable)', 'Mission alignment confirmed');
            break;
    }
    return items.map(label => ({
        item_id: itemId(),
        label,
        checked: false,
    }));
}
// ═══════════════════════════════════════════
// Review Contract CRUD
// ═══════════════════════════════════════════
/** Create a review contract for a graph */
function createReview(opts) {
    const reviews = readReviews();
    const review = {
        review_id: uid(),
        graph_id: opts.graph_id,
        review_type: opts.review_type,
        title: opts.title || `${opts.review_type.replace(/_/g, ' ')} review`,
        description: opts.description || `${opts.review_type} review for execution graph`,
        checklist: buildChecklist(opts.review_type),
        created_at: new Date().toISOString(),
    };
    reviews.unshift(review);
    writeReviews(reviews);
    return review;
}
/** Attach default review contracts to a graph based on lane and risk */
function attachDefaultReviews(graphId, lane, riskLevel = 'green', isCodeTask = false) {
    const types = [];
    // Always include mission alignment and quality
    types.push('mission_alignment', 'quality');
    // Privacy review for beta/prod or isolated missions
    if (lane !== 'dev')
        types.push('privacy_policy');
    // Architecture review for code tasks
    if (isCodeTask)
        types.push('architecture');
    // Release readiness for beta/prod
    if (lane === 'beta' || lane === 'prod')
        types.push('release_readiness');
    // Red risk triggers extra reviews
    if (riskLevel === 'red') {
        if (!types.includes('privacy_policy'))
            types.push('privacy_policy');
        if (!types.includes('architecture'))
            types.push('architecture');
    }
    const created = [];
    for (const type of types) {
        created.push(createReview({ graph_id: graphId, review_type: type }));
    }
    // Update graph with review IDs
    try {
        const graphs = require('./execution-graph');
        graphs.updateGraph(graphId, { review_contracts: created.map(r => r.review_id) });
    }
    catch { /* graph module not loaded */ }
    return created;
}
/** Get all reviews for a graph */
function getReviewsForGraph(graphId) {
    return readReviews().filter(r => r.graph_id === graphId);
}
/** Get a specific review */
function getReview(reviewId) {
    return readReviews().find(r => r.review_id === reviewId) || null;
}
/** Get pending (incomplete) reviews for a graph */
function getPendingReviews(graphId) {
    return readReviews().filter(r => r.graph_id === graphId && !r.verdict);
}
// ═══════════════════════════════════════════
// Review Completion
// ═══════════════════════════════════════════
/** Complete a review with checklist updates and verdict */
function completeReview(reviewId, verdict, reviewer = 'operator', notes, checklistUpdates) {
    const reviews = readReviews();
    const idx = reviews.findIndex(r => r.review_id === reviewId);
    if (idx === -1)
        return null;
    // Apply checklist updates
    if (checklistUpdates) {
        for (const update of checklistUpdates) {
            const item = reviews[idx].checklist.find(i => i.item_id === update.item_id);
            if (item) {
                item.checked = update.checked;
                if (update.note)
                    item.note = update.note;
            }
        }
    }
    reviews[idx].verdict = verdict;
    reviews[idx].reviewer = reviewer;
    reviews[idx].review_notes = notes;
    reviews[idx].completed_at = new Date().toISOString();
    writeReviews(reviews);
    return reviews[idx];
}
/** Auto-pass a review (e.g., for dev lane green-risk tasks) */
function autoPassReview(reviewId, reason = 'Auto-passed: low risk, dev lane') {
    const review = getReview(reviewId);
    if (!review)
        return null;
    // Check all items
    const checklistUpdates = review.checklist.map(item => ({
        item_id: item.item_id,
        checked: true,
        note: 'Auto-checked',
    }));
    return completeReview(reviewId, 'pass', 'system', reason, checklistUpdates);
}
/** Check if all reviews for a graph have verdicts */
function areAllReviewsComplete(graphId) {
    return getPendingReviews(graphId).length === 0;
}
/** Get review summary for dossier generation */
function getReviewSummary(graphId) {
    const reviews = getReviewsForGraph(graphId);
    return reviews
        .filter(r => r.verdict)
        .map(r => ({
        review_type: r.review_type,
        verdict: r.verdict,
        summary: r.review_notes || `${r.review_type} review: ${r.verdict}`,
        checklist_passed: r.checklist.filter(i => i.checked).length,
        checklist_total: r.checklist.length,
    }));
}
module.exports = {
    createReview, attachDefaultReviews,
    getReviewsForGraph, getReview, getPendingReviews,
    completeReview, autoPassReview, areAllReviewsComplete,
    getReviewSummary,
};
//# sourceMappingURL=review-contracts.js.map