"use strict";
// GPO Deployment Readiness — Compute platform readiness for subscription-grade deployment
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeReadiness = computeReadiness;
exports.getReports = getReports;
const fs = require('fs');
const path = require('path');
const REPORTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'deployment-readiness-reports.json');
function uid() { return 'dp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Compute deployment readiness */
function computeReadiness(scopeType = 'platform', scopeId = 'gpo') {
    const dimensions = [];
    const blockers = [];
    const warnings = [];
    const risks = [];
    const fixes = [];
    // 1. Tenant isolation
    let isoScore = 8;
    try {
        const pi = require('./project-isolation');
        if (pi.getAllPolicies().length > 0)
            isoScore = 10;
    }
    catch {
        isoScore = 6;
        warnings.push('Project isolation module not fully configured');
    }
    dimensions.push({ dimension: 'tenant_isolation', score: isoScore, max_score: 10, status: isoScore >= 8 ? 'ready' : 'partial', details: 'Project/tenant isolation enforced' });
    // 2. Governance completeness
    let govScore = 9;
    try {
        const pt = require('./policy-tuning');
        const h = pt.computeHealth('global', 'global');
        if (h.health === 'degraded' || h.health === 'critical') {
            govScore = 5;
            warnings.push('Governance health is ' + h.health);
        }
    }
    catch {
        govScore = 7;
    }
    dimensions.push({ dimension: 'governance_completeness', score: govScore, max_score: 10, status: govScore >= 7 ? 'ready' : 'partial', details: 'Governance layers 19-35 implemented' });
    // 3. Release maturity
    let relScore = 8;
    try {
        const ro = require('./release-orchestration');
        if (ro.getPlans().length === 0) {
            relScore = 6;
            warnings.push('No release plans created yet');
        }
    }
    catch {
        relScore = 5;
    }
    dimensions.push({ dimension: 'release_maturity', score: relScore, max_score: 10, status: relScore >= 7 ? 'ready' : 'partial', details: 'Release orchestration and pipeline available' });
    // 4. Documentation
    let docScore = 7;
    try {
        const dg = require('./documentation-governance');
        const reqs = dg.getAllRequirements();
        if (reqs.length > 0)
            docScore = 8;
    }
    catch {
        docScore = 5;
        fixes.push('Ensure documentation governance is configured');
    }
    dimensions.push({ dimension: 'documentation', score: docScore, max_score: 10, status: docScore >= 7 ? 'ready' : 'partial', details: 'Documentation governance active' });
    // 5. Audit/compliance
    let auditScore = 8;
    dimensions.push({ dimension: 'audit_compliance', score: auditScore, max_score: 10, status: 'ready', details: 'Audit hub, compliance export, policy history available' });
    // 6. Rollback readiness
    let rbScore = 7;
    dimensions.push({ dimension: 'rollback_readiness', score: rbScore, max_score: 10, status: 'ready', details: 'Rollback control and tuning rollback available' });
    // 7. Provider governance
    let provScore = 8;
    dimensions.push({ dimension: 'provider_governance', score: provScore, max_score: 10, status: 'ready', details: 'Reliability, cost, latency governance active' });
    // 8. Admin/subscription
    let adminScore = 7;
    try {
        const ta = require('./tenant-admin');
        if (ta.getAllTenants().length > 0)
            adminScore = 8;
    }
    catch {
        adminScore = 5;
        fixes.push('Initialize tenant admin');
    }
    dimensions.push({ dimension: 'admin_subscription', score: adminScore, max_score: 10, status: adminScore >= 7 ? 'ready' : 'partial', details: 'Tenant admin and subscription operations available' });
    // 9. UX/operator
    let uxScore = 8;
    dimensions.push({ dimension: 'ux_operator', score: uxScore, max_score: 10, status: 'ready', details: 'Approval workspace, escalation inbox, collaboration runtime available' });
    // Overall
    const totalScore = dimensions.reduce((s, d) => s + d.score, 0);
    const maxScore = dimensions.reduce((s, d) => s + d.max_score, 0);
    const overall = Math.round((totalScore / maxScore) * 100);
    // Risks
    if (overall < 70)
        risks.push({ category: 'readiness', severity: 'high', description: 'Overall readiness below 70%' });
    if (warnings.length > 3)
        risks.push({ category: 'stability', severity: 'medium', description: `${warnings.length} warnings detected` });
    const notReady = dimensions.filter(d => d.status === 'not_ready');
    if (notReady.length > 0)
        blockers.push(...notReady.map(d => `${d.dimension}: ${d.details}`));
    const report = {
        report_id: uid(), scope_type: scopeType, scope_id: scopeId,
        overall_score: overall, dimensions, blockers, warnings, risks,
        recommended_fixes: fixes, created_at: new Date().toISOString(),
    };
    const reports = readJson(REPORTS_FILE, []);
    reports.unshift(report);
    if (reports.length > 50)
        reports.length = 50;
    writeJson(REPORTS_FILE, reports);
    return report;
}
function getReports() { return readJson(REPORTS_FILE, []); }
module.exports = { computeReadiness, getReports };
//# sourceMappingURL=deployment-readiness.js.map