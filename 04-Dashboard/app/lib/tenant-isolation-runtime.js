"use strict";
// GPO Tenant Isolation Runtime — Enforce real tenant/project isolation at query time
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluate = evaluate;
exports.filterByTenant = filterByTenant;
exports.filterByProject = filterByProject;
exports.getDecisions = getDecisions;
const fs = require('fs');
const path = require('path');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'tenant-isolation-decisions.json');
function uid() { return 'ti_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Evaluate tenant isolation */
function evaluate(sourceTenant, targetTenant, action = 'read') {
    let outcome = 'deny';
    let reason = 'Cross-tenant access denied by default';
    if (sourceTenant === targetTenant) {
        outcome = 'allow';
        reason = 'Same tenant';
    }
    else if (!targetTenant || targetTenant === '*') {
        outcome = 'deny';
        reason = 'Wildcard/missing tenant target denied';
    }
    const decision = { decision_id: uid(), source_tenant: sourceTenant, target_tenant: targetTenant, action, outcome, reason, created_at: new Date().toISOString() };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 300)
        decisions.length = 300;
    writeJson(DECISIONS_FILE, decisions);
    // Emit telemetry for denials
    if (outcome === 'deny') {
        try {
            const tw = require('./telemetry-wiring');
            tw.emitTelemetry('isolation', 'tenant_access_denied', 'blocked');
        }
        catch { /* */ }
    }
    return decision;
}
/** Filter data array by tenant scope */
function filterByTenant(data, tenantId) {
    return data.filter(item => !item.tenant_id || item.tenant_id === tenantId);
}
/** Filter data by project scope */
function filterByProject(data, projectId) {
    return data.filter(item => !item.project_id || item.project_id === projectId);
}
function getDecisions(tenantId) {
    const all = readJson(DECISIONS_FILE, []);
    return tenantId ? all.filter(d => d.source_tenant === tenantId || d.target_tenant === tenantId) : all;
}
module.exports = { evaluate, filterByTenant, filterByProject, getDecisions };
//# sourceMappingURL=tenant-isolation-runtime.js.map