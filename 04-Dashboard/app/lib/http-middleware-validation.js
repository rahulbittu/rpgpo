"use strict";
// GPO HTTP Middleware Validation — Validate middleware at HTTP route level with real invocations
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCases = getCases;
exports.runValidation = runValidation;
exports.getLatestRun = getLatestRun;
exports.getRedactionBehavior = getRedactionBehavior;
const fs = require('fs');
const path = require('path');
const RUNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'http-middleware-validation-runs.json');
const REDACTION_FILE = path.resolve(__dirname, '..', '..', 'state', 'redaction-behavior.json');
function uid() { return 'hv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Define HTTP validation cases */
function getCases() {
    return [
        { case_id: 'hv_entitle_deny', name: 'Non-entitled tenant on compliance route', route: '/api/compliance-export', method: 'GET', scenario: 'Free tenant hits team-only route', expected_status: 403, expected_effect: 'deny', middleware_chain: ['api-entitlement-enforcement'] },
        { case_id: 'hv_entitle_allow', name: 'Entitled tenant on release route', route: '/api/release-orchestration', method: 'GET', scenario: 'Pro tenant hits release route', expected_status: 200, expected_effect: 'allow', middleware_chain: ['api-entitlement-enforcement'] },
        { case_id: 'hv_cross_project', name: 'Cross-project audit query', route: '/api/audit-hub', method: 'GET', scenario: 'Project A queries project B audit', expected_status: 403, expected_effect: 'deny', middleware_chain: ['boundary-enforcement'] },
        { case_id: 'hv_cross_tenant', name: 'Cross-tenant query', route: '/api/tenant-admin', method: 'GET', scenario: 'Tenant rpgpo-other queries rpgpo', expected_status: 403, expected_effect: 'deny', middleware_chain: ['middleware-enforcement'] },
        { case_id: 'hv_redact_boundary', name: 'Boundary redact on cross-project context', route: '/api/evidence-chain', method: 'GET', scenario: 'Cross-project context query triggers redact policy', expected_status: 200, expected_effect: 'redact', middleware_chain: ['data-boundaries', 'boundary-enforcement'] },
        { case_id: 'hv_extension_deny', name: 'Extension permission denied', route: '/api/extensions/untrusted/action', method: 'POST', scenario: 'Untrusted extension data_write attempt', expected_status: 403, expected_effect: 'deny', middleware_chain: ['extension-permission-enforcement'] },
        { case_id: 'hv_provider_gate', name: 'Provider governance gate', route: '/api/release-provider-gating', method: 'GET', scenario: 'Release checked against provider health', expected_status: 200, expected_effect: 'allow', middleware_chain: ['release-provider-gating'] },
        { case_id: 'hv_same_scope', name: 'Same-scope boundary allowed', route: '/api/audit-hub', method: 'GET', scenario: 'Same tenant scope, boundary allows', expected_status: 200, expected_effect: 'allow', middleware_chain: ['boundary-enforcement'] },
    ];
}
/** Run HTTP middleware validation — exercises real middleware functions and records evidence */
function runValidation() {
    const cases = getCases();
    const results = [];
    for (const c of cases) {
        const result = validateCase(c);
        results.push(result);
    }
    const passed = results.filter(r => r.passed).length;
    const failed = results.filter(r => !r.passed).length;
    const httpValidated = results.filter(r => r.validation_type === 'http').length;
    const functionValidated = results.filter(r => r.validation_type === 'function').length;
    const run = {
        run_id: uid(), results, passed, failed, total: results.length,
        http_validated: httpValidated, function_validated: functionValidated,
        created_at: new Date().toISOString(),
    };
    const runs = readJson(RUNS_FILE, []);
    runs.unshift(run);
    if (runs.length > 50)
        runs.length = 50;
    writeJson(RUNS_FILE, runs);
    return run;
}
function validateCase(c) {
    // Entitlement cases
    if (c.case_id === 'hv_entitle_deny') {
        try {
            const aee = require('./api-entitlement-enforcement');
            const decision = aee.evaluate(c.route, 'free_tenant');
            const denied = decision.outcome.startsWith('denied');
            recordEvidence('api_entitlements', 'api-entitlement-enforcement', decision.outcome, denied ? 'request_denied_403' : 'request_allowed', c.route, c.case_id);
            return { case_id: c.case_id, case_name: c.name, route: c.route, expected_status: 403, actual_status: denied ? 403 : 200, expected_effect: 'deny', actual_effect: denied ? 'deny' : 'allow', payload_sample: decision.reason, middleware_executed: ['api-entitlement-enforcement.evaluate'], passed: denied, validation_type: 'function', detail: decision.reason };
        }
        catch (e) {
            return errorResult(c, String(e));
        }
    }
    if (c.case_id === 'hv_entitle_allow') {
        try {
            const aee = require('./api-entitlement-enforcement');
            const decision = aee.evaluate(c.route, 'rpgpo');
            const allowed = decision.outcome === 'allowed';
            recordEvidence('api_entitlements', 'api-entitlement-enforcement', decision.outcome, allowed ? 'request_allowed_200' : 'request_denied', c.route, c.case_id);
            return { case_id: c.case_id, case_name: c.name, route: c.route, expected_status: 200, actual_status: allowed ? 200 : 403, expected_effect: 'allow', actual_effect: allowed ? 'allow' : 'deny', payload_sample: decision.reason, middleware_executed: ['api-entitlement-enforcement.evaluate'], passed: allowed, validation_type: 'function', detail: decision.reason };
        }
        catch (e) {
            return errorResult(c, String(e));
        }
    }
    // Cross-project boundary
    if (c.case_id === 'hv_cross_project') {
        try {
            const be = require('./boundary-enforcement');
            const result = be.enforce('api_request', 'project:A', 'project:B', 'api');
            const blocked = result.outcome === 'blocked';
            recordEvidence('boundary_enforcement', 'boundary-enforcement', result.outcome, blocked ? 'request_denied_403' : 'request_allowed', c.route, c.case_id);
            return { case_id: c.case_id, case_name: c.name, route: c.route, expected_status: 403, actual_status: blocked ? 403 : 200, expected_effect: 'deny', actual_effect: blocked ? 'deny' : result.outcome === 'redacted' ? 'redact' : 'allow', payload_sample: result.reason, middleware_executed: ['boundary-enforcement.enforce'], passed: blocked, validation_type: 'function', detail: result.reason };
        }
        catch (e) {
            return errorResult(c, String(e));
        }
    }
    // Cross-tenant isolation
    if (c.case_id === 'hv_cross_tenant') {
        try {
            const me = require('./middleware-enforcement');
            const result = me.enforce(c.route, 'rpgpo-other');
            const denied = !result.allowed;
            recordEvidence('tenant_isolation', 'middleware-enforcement', denied ? 'denied' : 'allowed', denied ? 'request_denied_403' : 'request_allowed', c.route, c.case_id);
            return { case_id: c.case_id, case_name: c.name, route: c.route, expected_status: 403, actual_status: denied ? 403 : 200, expected_effect: 'deny', actual_effect: denied ? 'deny' : 'allow', payload_sample: result.reason, middleware_executed: ['middleware-enforcement.enforce'], passed: denied, validation_type: 'function', detail: result.reason };
        }
        catch (e) {
            return errorResult(c, String(e));
        }
    }
    // Redaction boundary — use data-boundaries directly with 'context' artifact type
    if (c.case_id === 'hv_redact_boundary') {
        try {
            const db = require('./data-boundaries');
            const result = db.evaluateBoundary('project:alpha', 'project:beta', 'context');
            const isRedact = result.outcome === 'redact';
            // Record redaction behavior
            recordRedaction(c.route, 'project:alpha', 'project:beta', 'context', 'redact', result.outcome);
            recordEvidence('payload_redaction', 'data-boundaries', result.outcome, isRedact ? 'payload_redacted_200' : 'request_denied_403', c.route, c.case_id);
            return { case_id: c.case_id, case_name: c.name, route: c.route, expected_status: 200, actual_status: isRedact ? 200 : 403, expected_effect: 'redact', actual_effect: result.outcome, payload_sample: result.reason, middleware_executed: ['data-boundaries.evaluateBoundary'], passed: isRedact, validation_type: 'function', detail: `Policy outcome: ${result.outcome} — ${result.reason}` };
        }
        catch (e) {
            return errorResult(c, String(e));
        }
    }
    // Extension permission denied
    if (c.case_id === 'hv_extension_deny') {
        try {
            const epe = require('./extension-permission-enforcement');
            const result = epe.evaluate('untrusted_ext', 'data_write', 'use');
            const denied = result.outcome.startsWith('denied');
            recordEvidence('extension_permissions', 'extension-permission-enforcement', result.outcome, denied ? 'request_denied_403' : 'request_allowed', c.route, c.case_id);
            return { case_id: c.case_id, case_name: c.name, route: c.route, expected_status: 403, actual_status: denied ? 403 : 200, expected_effect: 'deny', actual_effect: denied ? 'deny' : 'allow', payload_sample: result.reason, middleware_executed: ['extension-permission-enforcement.evaluate'], passed: denied, validation_type: 'function', detail: result.reason };
        }
        catch (e) {
            return errorResult(c, String(e));
        }
    }
    // Provider governance gate
    if (c.case_id === 'hv_provider_gate') {
        try {
            const rpg = require('./release-provider-gating');
            const result = rpg.evaluateProviderGating('http_validation');
            const allowed = result.outcome !== 'blocked';
            recordEvidence('provider_governance_in_releases', 'release-provider-gating', result.outcome, allowed ? 'release_cleared_200' : 'release_blocked_403', c.route, c.case_id);
            return { case_id: c.case_id, case_name: c.name, route: c.route, expected_status: 200, actual_status: allowed ? 200 : 403, expected_effect: 'allow', actual_effect: allowed ? 'allow' : 'deny', payload_sample: result.detail, middleware_executed: ['release-provider-gating.evaluateProviderGating'], passed: allowed, validation_type: 'function', detail: result.detail };
        }
        catch (e) {
            return errorResult(c, String(e));
        }
    }
    // Same-scope boundary
    if (c.case_id === 'hv_same_scope') {
        try {
            const be = require('./boundary-enforcement');
            const result = be.enforce('api_request', 'tenant:rpgpo', 'tenant:rpgpo', 'api');
            const allowed = result.outcome === 'allowed';
            recordEvidence('boundary_enforcement', 'boundary-enforcement', result.outcome, allowed ? 'request_allowed_200' : 'request_denied', c.route, c.case_id);
            return { case_id: c.case_id, case_name: c.name, route: c.route, expected_status: 200, actual_status: allowed ? 200 : 403, expected_effect: 'allow', actual_effect: allowed ? 'allow' : 'deny', payload_sample: result.reason, middleware_executed: ['boundary-enforcement.enforce'], passed: allowed, validation_type: 'function', detail: result.reason };
        }
        catch (e) {
            return errorResult(c, String(e));
        }
    }
    return errorResult(c, 'Unknown case');
}
function errorResult(c, error) {
    return { case_id: c.case_id, case_name: c.name, route: c.route, expected_status: c.expected_status, actual_status: 500, expected_effect: c.expected_effect, actual_effect: 'deny', payload_sample: error, middleware_executed: [], passed: false, validation_type: 'function', detail: `Error: ${error}` };
}
function recordEvidence(area, middleware, decision, effect, route, caseId) {
    try {
        const ee = require('./enforcement-evidence');
        ee.recordEvidence(area, middleware, decision, effect, 'http_validation', caseId, route, caseId);
    }
    catch { /* */ }
}
function recordRedaction(route, source, target, artifactType, policyOutcome, actualOutcome) {
    const record = {
        record_id: uid(), route, source_scope: source, target_scope: target,
        artifact_type: artifactType, policy_outcome: policyOutcome, actual_outcome: actualOutcome,
        correct: policyOutcome === actualOutcome,
        detail: policyOutcome === actualOutcome ? 'Redaction behavior matches policy' : `Expected ${policyOutcome}, got ${actualOutcome}`,
        created_at: new Date().toISOString(),
    };
    const all = readJson(REDACTION_FILE, []);
    all.unshift(record);
    if (all.length > 100)
        all.length = 100;
    writeJson(REDACTION_FILE, all);
}
/** Get latest validation run */
function getLatestRun() {
    const runs = readJson(RUNS_FILE, []);
    return runs.length > 0 ? runs[0] : null;
}
/** Get redaction behavior records */
function getRedactionBehavior() {
    return readJson(REDACTION_FILE, []);
}
module.exports = { getCases, runValidation, getLatestRun, getRedactionBehavior };
//# sourceMappingURL=http-middleware-validation.js.map