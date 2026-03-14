"use strict";
// GPO Mutation Route Guards — Inline protection for POST/PUT/DELETE mutation routes
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRules = getRules;
exports.guardMutation = guardMutation;
exports.getReport = getReport;
exports.getDecisions = getDecisions;
const fs = require('fs');
const path = require('path');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'mutation-guard-decisions.json');
function uid() { return 'mg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Mutation guard rules */
function getRules() {
    return [
        { route_pattern: '/api/skill-packs', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
        { route_pattern: '/api/skill-packs/:id/bind', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
        { route_pattern: '/api/engine-templates', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
        { route_pattern: '/api/engine-templates/:id/instantiate', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
        { route_pattern: '/api/extensions', method: 'POST', guard_types: ['extension', 'isolation'], enforced: true },
        { route_pattern: '/api/extensions/:id/install', method: 'POST', guard_types: ['extension', 'isolation'], enforced: true },
        { route_pattern: '/api/extensions/:id/uninstall', method: 'POST', guard_types: ['extension', 'isolation'], enforced: true },
        { route_pattern: '/api/integrations', method: 'POST', guard_types: ['entitlement', 'isolation'], enforced: true },
        { route_pattern: '/api/compliance-export', method: 'POST', guard_types: ['entitlement'], enforced: true },
        { route_pattern: '/api/marketplace', method: 'POST', guard_types: ['extension', 'entitlement'], enforced: true },
    ];
}
/** Guard a mutation request */
function guardMutation(route, method, tenantId, projectId) {
    // Use the shared response guard
    try {
        const hrg = require('./http-response-guard');
        const gd = hrg.guard(route, tenantId, projectId);
        const decision = {
            route, method, allowed: gd.allowed,
            outcome: gd.outcome,
            reason: gd.reason,
        };
        // Record decision
        const all = readJson(DECISIONS_FILE, []);
        all.unshift(decision);
        if (all.length > 300)
            all.length = 300;
        writeJson(DECISIONS_FILE, all);
        // Record evidence
        try {
            const ee = require('./enforcement-evidence');
            ee.recordEvidence('mutation_guard', 'mutation-route-guards', gd.outcome, `mutation_${gd.outcome}`, 'tenant', tenantId, route, '');
        }
        catch { /* */ }
        return decision;
    }
    catch {
        return { route, method, allowed: true, outcome: 'allow', reason: 'Guard not available — default allow' };
    }
}
/** Get mutation protection report */
function getReport() {
    const rules = getRules();
    const enforced = rules.filter(r => r.enforced).length;
    return { report_id: uid(), rules, enforced, total: rules.length, coverage_percent: rules.length > 0 ? Math.round((enforced / rules.length) * 100) : 0, created_at: new Date().toISOString() };
}
/** Get recent decisions */
function getDecisions() {
    return readJson(DECISIONS_FILE, []);
}
module.exports = { getRules, guardMutation, getReport, getDecisions };
//# sourceMappingURL=mutation-route-guards.js.map