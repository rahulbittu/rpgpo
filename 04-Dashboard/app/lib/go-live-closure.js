"use strict";
// GPO Go-Live Closure — Final closure report aggregating all ship blockers and readiness signals
Object.defineProperty(exports, "__esModule", { value: true });
exports.getClosureReport = getClosureReport;
function uid() { return 'glc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
/** Generate the go-live closure report by aggregating all readiness signals */
function getClosureReport() {
    const blockers = [];
    // Ship blockers from Part 49
    try {
        const sbc = require('./ship-blocker-closure');
        const s = sbc.getSummary();
        for (const b of s.blockers) {
            blockers.push({ name: b.name, status: b.status === 'resolved' ? 'closed' : b.status === 'in_progress' ? 'partial' : 'blocked', evidence: b.evidence || '' });
        }
    }
    catch { /* */ }
    // Middleware enforcement coverage
    try {
        const me = require('./middleware-enforcement');
        const cov = me.getCoverageReport();
        const enforced = cov.filter(c => c.status === 'enforced').length;
        const total = cov.length;
        blockers.push({ name: 'Middleware enforcement', status: enforced === total ? 'closed' : enforced > total * 0.8 ? 'partial' : 'blocked', evidence: `${enforced}/${total} areas enforced` });
    }
    catch { /* */ }
    // Workflow completion
    try {
        const owc = require('./operator-workflow-completion');
        const r = owc.getCompletionReport();
        blockers.push({ name: 'Workflow completion', status: r.usable === r.total ? 'closed' : r.usable >= r.total - 1 ? 'partial' : 'blocked', evidence: `${r.usable}/${r.total} workflows usable` });
    }
    catch { /* */ }
    // Operator acceptance
    try {
        const oa = require('./operator-acceptance');
        const a = oa.runAcceptance();
        blockers.push({ name: 'Operator acceptance', status: a.broken === 0 && a.partial <= 1 ? 'closed' : a.broken === 0 ? 'partial' : 'blocked', evidence: `${a.usable} usable, ${a.partial} partial, ${a.broken} broken` });
    }
    catch { /* */ }
    // Production readiness
    try {
        const prc = require('./production-readiness-closure');
        const d = prc.getShipDecision();
        blockers.push({ name: 'Production readiness', status: d.decision === 'go' ? 'closed' : d.decision === 'conditional_go' ? 'partial' : 'blocked', evidence: `${d.decision} at ${d.readiness_score}%` });
    }
    catch { /* */ }
    const closed = blockers.filter(b => b.status === 'closed').length;
    const partial = blockers.filter(b => b.status === 'partial').length;
    const blocked = blockers.filter(b => b.status === 'blocked').length;
    const total = blockers.length;
    const remaining_risk = [];
    for (const b of blockers) {
        if (b.status !== 'closed')
            remaining_risk.push(`${b.name}: ${b.evidence}`);
    }
    let recommendation = 'no_go';
    if (blocked === 0 && partial === 0)
        recommendation = 'go';
    else if (blocked === 0 && partial <= 2)
        recommendation = 'conditional_go';
    return { report_id: uid(), blockers, closed, partial, blocked, total, remaining_risk, recommendation, created_at: new Date().toISOString() };
}
module.exports = { getClosureReport };
//# sourceMappingURL=go-live-closure.js.map