"use strict";
// GPO HTTP Response Guard — Reusable response guard for protected routes
Object.defineProperty(exports, "__esModule", { value: true });
exports.guard = guard;
exports.redactPayload = redactPayload;
exports.getGuardSummary = getGuardSummary;
/** Guard a route request — returns decision with HTTP semantics */
function guard(route, tenantId, projectId) {
    // 1. Entitlement check
    try {
        const aee = require('./api-entitlement-enforcement');
        const decision = aee.evaluate(route, tenantId);
        if (decision.outcome.startsWith('denied')) {
            recordEvidence(route, tenantId, 'entitlement', 'deny');
            return { allowed: false, status: 403, outcome: 'deny', payload: { error: decision.reason, guard: 'entitlement' }, reason: decision.reason };
        }
    }
    catch { /* entitlement not available — allow */ }
    // 2. Tenant isolation check
    if (tenantId && tenantId !== 'rpgpo' && tenantId !== '') {
        try {
            const me = require('./middleware-enforcement');
            const result = me.enforce(route, tenantId);
            if (!result.allowed) {
                recordEvidence(route, tenantId, 'isolation', 'deny');
                return { allowed: false, status: 403, outcome: 'deny', payload: { error: result.reason, guard: 'isolation' }, reason: result.reason };
            }
        }
        catch { /* */ }
    }
    // 3. Boundary / redaction check for cross-project
    if (projectId && projectId !== '' && projectId !== 'default') {
        try {
            const db = require('./data-boundaries');
            const result = db.evaluateBoundary(`project:${projectId}`, 'project:default', 'context');
            if (result.outcome === 'deny') {
                recordEvidence(route, tenantId, 'boundary', 'deny');
                return { allowed: false, status: 403, outcome: 'deny', payload: { error: result.reason, guard: 'boundary' }, reason: result.reason };
            }
            if (result.outcome === 'redact') {
                recordEvidence(route, tenantId, 'boundary', 'redact');
                return { allowed: true, status: 200, outcome: 'redact', payload: null, reason: result.reason };
            }
        }
        catch { /* */ }
    }
    // 4. Extension permission check
    const extensionRoutes = ['/api/marketplace', '/api/extensions'];
    if (extensionRoutes.some(r => route.startsWith(r))) {
        try {
            const epe = require('./extension-permission-enforcement');
            // Check if requesting as untrusted
            if (tenantId === 'untrusted' || tenantId === 'free_tenant') {
                const result = epe.evaluate('request_ext', 'governance', 'use');
                if (result.outcome.startsWith('denied')) {
                    recordEvidence(route, tenantId, 'extension', 'deny');
                    return { allowed: false, status: 403, outcome: 'deny', payload: { error: result.reason, guard: 'extension' }, reason: result.reason };
                }
            }
        }
        catch { /* */ }
    }
    return { allowed: true, status: 200, outcome: 'allow', payload: null, reason: 'Passed all guards' };
}
/** Apply redaction to a response payload — uses deep redaction when available */
function redactPayload(data, reason, route = '') {
    // Part 56: Use deep field-level redaction
    try {
        const dr = require('./deep-redaction');
        return dr.redactDeep(data, route, reason, ['audit_evidence', 'tenant_data', 'compliance']).data;
    }
    catch { /* fall through to metadata-only */ }
    if (data === null || data === undefined)
        return { redacted: true, reason };
    if (typeof data === 'object' && data !== null) {
        return { ...data, _redacted: true, _redaction_reason: reason };
    }
    return { redacted: true, reason };
}
/** Get guard summary for a route */
function getGuardSummary() {
    try {
        const rme = require('./route-middleware-enforcement');
        const bindings = rme.getBindings();
        const byRoute = {};
        for (const b of bindings) {
            if (!byRoute[b.route])
                byRoute[b.route] = [];
            byRoute[b.route].push(b.guard_type);
        }
        return Object.entries(byRoute).map(([route, guards]) => ({ route, guards }));
    }
    catch {
        return [];
    }
}
function recordEvidence(route, tenantId, guardType, outcome) {
    try {
        const ee = require('./enforcement-evidence');
        ee.recordEvidence('route_guard', `http-response-guard.${guardType}`, outcome, `${outcome}_inline`, 'tenant', tenantId, route, '');
    }
    catch { /* */ }
    try {
        const rme = require('./route-middleware-enforcement');
        rme.recordExecution(route, guardType, tenantId, outcome, outcome === 'deny' ? 403 : 200, `${guardType} guard: ${outcome}`);
    }
    catch { /* */ }
}
module.exports = { guard, redactPayload, getGuardSummary };
//# sourceMappingURL=http-response-guard.js.map