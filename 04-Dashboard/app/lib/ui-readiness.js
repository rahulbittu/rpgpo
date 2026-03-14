"use strict";
// GPO UI Readiness — Compute readiness scoring for operator UI
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeReadiness = computeReadiness;
function uid() { return 'ur_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
/** Compute UI readiness */
function computeReadiness() {
    const areaScores = {};
    // Score each area
    const areas = [
        { name: 'home', score: 9, max: 10, status: 'complete' },
        { name: 'intake', score: 9, max: 10, status: 'complete' },
        { name: 'missions', score: 8, max: 10, status: 'complete' },
        { name: 'memory', score: 8, max: 10, status: 'complete' },
        { name: 'dossiers', score: 7, max: 10, status: 'partial' },
        { name: 'providers', score: 9, max: 10, status: 'complete' },
        { name: 'governance', score: 8, max: 10, status: 'partial' },
        { name: 'audit', score: 6, max: 10, status: 'partial' },
        { name: 'releases', score: 6, max: 10, status: 'partial' },
        { name: 'admin', score: 7, max: 10, status: 'partial' },
        { name: 'productization', score: 3, max: 10, status: 'api_only' },
        { name: 'collaboration', score: 4, max: 10, status: 'summary_only' },
    ];
    for (const a of areas)
        areaScores[a.name] = { score: a.score, max: a.max, status: a.status };
    const totalScore = areas.reduce((s, a) => s + a.score, 0);
    const totalMax = areas.reduce((s, a) => s + a.max, 0);
    const overall = Math.round((totalScore / totalMax) * 100);
    const blockingGaps = [
        'Productization surfaces (skill packs, templates, marketplace, extensions, integrations) have no UI',
        'Collaboration detail view missing — sessions are summary-only',
        'Audit hub lacks search/detail drilldown',
        'Release workspace lacks action buttons (approve/execute/verify)',
    ];
    // E2E checks
    const e2eChecks = [
        { flow: 'Inspect governance issue', status: 'pass', detail: 'Governance tab shows policies, health, drift, tuning, runtime, overrides, isolation, traceability' },
        { flow: 'Review approval item', status: 'partial', detail: 'Approval workspace shows counts in audit tab but no inline detail drilldown' },
        { flow: 'Inspect release candidate', status: 'partial', detail: 'Release workspace shows plans and summary but lacks action buttons' },
        { flow: 'Inspect audit traceability', status: 'partial', detail: 'Audit tab shows recent items and policy history but lacks search' },
        { flow: 'View provider health', status: 'pass', detail: 'Providers tab shows capability cards, fits, recipes, and governance health rows' },
        { flow: 'Inspect security posture', status: 'pass', detail: 'Admin tab shows security posture, findings, checklist, service health, SLO status' },
        { flow: 'View skill pack/template state', status: 'fail', detail: 'No UI surface for skill packs or engine templates — API-only' },
        { flow: 'Inspect marketplace/installability', status: 'fail', detail: 'No UI surface for marketplace, extensions, or integrations — API-only' },
    ];
    return {
        report_id: uid(), overall_score: overall, area_scores: areaScores,
        blocking_gaps: blockingGaps, e2e_checks: e2eChecks,
        created_at: new Date().toISOString(),
    };
}
module.exports = { computeReadiness };
//# sourceMappingURL=ui-readiness.js.map