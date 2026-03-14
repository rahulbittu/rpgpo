"use strict";
// GPO API Entitlement Enforcement — Enforce subscription entitlements at route level
Object.defineProperty(exports, "__esModule", { value: true });
exports.getProtectedRoutes = getProtectedRoutes;
exports.evaluate = evaluate;
exports.getDecisions = getDecisions;
const fs = require('fs');
const path = require('path');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'entitlement-decisions.json');
function uid() { return 'ae_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Define protected routes */
function getProtectedRoutes() {
    return [
        { route_pattern: '/api/compliance-export', required_feature: 'compliance', min_plan: 'team', enforced: true },
        { route_pattern: '/api/tenant-admin', required_feature: 'tenant_admin', min_plan: 'team', enforced: true },
        { route_pattern: '/api/collaboration-runtime', required_feature: 'collaboration', min_plan: 'pro', enforced: true },
        { route_pattern: '/api/release-orchestration', required_feature: 'release', min_plan: 'pro', enforced: true },
        { route_pattern: '/api/provider-reliability', required_feature: 'provider_governance', min_plan: 'pro', enforced: true },
        { route_pattern: '/api/marketplace', required_feature: 'governance', min_plan: 'pro', enforced: true },
        { route_pattern: '/api/extensions', required_feature: 'governance', min_plan: 'pro', enforced: true },
        { route_pattern: '/api/integrations', required_feature: 'governance', min_plan: 'pro', enforced: true },
        { route_pattern: '/api/skill-packs', required_feature: 'governance', min_plan: 'pro', enforced: true },
        { route_pattern: '/api/engine-templates', required_feature: 'governance', min_plan: 'pro', enforced: true },
        { route_pattern: '/api/security-hardening', required_feature: 'governance', min_plan: 'pro', enforced: true },
        { route_pattern: '/api/observability', required_feature: 'governance', min_plan: 'pro', enforced: true },
    ];
}
/** Evaluate entitlement for a route */
function evaluate(route, tenantId = 'rpgpo') {
    const rules = getProtectedRoutes();
    const matchingRule = rules.find(r => route.startsWith(r.route_pattern));
    if (!matchingRule) {
        return recordDecision(route, tenantId, '', 'allowed', 'No protection rule for this route');
    }
    // Check entitlement
    try {
        const so = require('./subscription-operations');
        const ents = so.evaluateEntitlements(tenantId, [matchingRule.required_feature]);
        const ent = ents.find(e => e.feature === matchingRule.required_feature);
        if (ent?.entitled) {
            return recordDecision(route, tenantId, matchingRule.required_feature, 'allowed', 'Entitled');
        }
        else {
            // Emit telemetry for denial
            try {
                const tw = require('./telemetry-wiring');
                tw.emitTelemetry('entitlement', 'api_denied', 'blocked');
            }
            catch { /* */ }
            return recordDecision(route, tenantId, matchingRule.required_feature, 'denied_upgrade_required', `Feature "${matchingRule.required_feature}" requires ${matchingRule.min_plan} plan`);
        }
    }
    catch {
        return recordDecision(route, tenantId, matchingRule.required_feature, 'allowed', 'Entitlement check unavailable — defaulting to allow');
    }
}
function recordDecision(route, tenantId, feature, outcome, reason) {
    const decision = { decision_id: uid(), route, tenant_id: tenantId, feature, outcome, reason, created_at: new Date().toISOString() };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 300)
        decisions.length = 300;
    writeJson(DECISIONS_FILE, decisions);
    return decision;
}
function getDecisions(tenantId) {
    const all = readJson(DECISIONS_FILE, []);
    return tenantId ? all.filter(d => d.tenant_id === tenantId) : all;
}
module.exports = { getProtectedRoutes, evaluate, getDecisions };
//# sourceMappingURL=api-entitlement-enforcement.js.map