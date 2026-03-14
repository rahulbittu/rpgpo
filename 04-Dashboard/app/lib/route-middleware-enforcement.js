"use strict";
// GPO Route Middleware Enforcement — Inline route guard bindings and coverage
Object.defineProperty(exports, "__esModule", { value: true });
exports.getBindings = getBindings;
exports.getCoverage = getCoverage;
exports.recordExecution = recordExecution;
exports.getExecutions = getExecutions;
const fs = require('fs');
const path = require('path');
const EXEC_FILE = path.resolve(__dirname, '..', '..', 'state', 'route-enforcement-executions.json');
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Protected route bindings — these are enforced inline in server.js */
function getBindings() {
    return [
        { route: '/api/compliance-export', method: 'GET', guard_type: 'entitlement', tenant_param: 'x-tenant-id', enforced: true },
        { route: '/api/compliance-export', method: 'POST', guard_type: 'entitlement', tenant_param: 'x-tenant-id', enforced: true },
        { route: '/api/tenant-admin', method: 'GET', guard_type: 'isolation', tenant_param: 'x-tenant-id', enforced: true },
        { route: '/api/audit-hub', method: 'GET', guard_type: 'boundary', tenant_param: 'x-project-id', enforced: true },
        { route: '/api/release-orchestration', method: 'GET', guard_type: 'entitlement', tenant_param: 'x-tenant-id', enforced: true },
        { route: '/api/marketplace', method: 'GET', guard_type: 'extension', tenant_param: 'x-tenant-id', enforced: true },
        { route: '/api/enforcement-evidence', method: 'GET', guard_type: 'boundary', tenant_param: 'x-project-id', enforced: true },
        { route: '/api/release-provider-gating', method: 'GET', guard_type: 'provider', tenant_param: 'x-tenant-id', enforced: true },
    ];
}
/** Get middleware binding coverage */
function getCoverage() {
    const bindings = getBindings();
    const enforced = bindings.filter(b => b.enforced).length;
    return {
        total_protected: bindings.length,
        total_enforced: enforced,
        bindings,
        coverage_percent: bindings.length > 0 ? Math.round((enforced / bindings.length) * 100) : 0,
        created_at: new Date().toISOString(),
    };
}
/** Record a route enforcement execution */
function recordExecution(route, guardType, tenantId, outcome, httpStatus, detail) {
    const exec = { route, guard_type: guardType, tenant_id: tenantId, outcome, http_status: httpStatus, detail, created_at: new Date().toISOString() };
    const all = readJson(EXEC_FILE, []);
    all.unshift(exec);
    if (all.length > 500)
        all.length = 500;
    writeJson(EXEC_FILE, all);
    return exec;
}
/** Get enforcement executions */
function getExecutions(route) {
    const all = readJson(EXEC_FILE, []);
    return route ? all.filter(e => e.route === route) : all;
}
module.exports = { getBindings, getCoverage, recordExecution, getExecutions };
//# sourceMappingURL=route-middleware-enforcement.js.map