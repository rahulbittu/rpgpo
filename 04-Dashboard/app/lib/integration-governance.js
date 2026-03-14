"use strict";
// GPO External Integrations Governance — Govern connectors to external systems
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIntegrations = getIntegrations;
exports.getIntegration = getIntegration;
exports.createIntegration = createIntegration;
exports.toggleIntegration = toggleIntegration;
exports.evaluateAccess = evaluateAccess;
const fs = require('fs');
const path = require('path');
const INTEGRATIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'integrations.json');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'integration-decisions.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
function defaultIntegrations() {
    return [
        { integration_id: 'int_openai', name: 'OpenAI API', category: 'provider_api', trust_level: 'verified', permissions: ['call_provider'], secret_scope: 'provider:openai', tenant_ids: ['rpgpo'], enabled: true, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { integration_id: 'int_gemini', name: 'Gemini API', category: 'provider_api', trust_level: 'verified', permissions: ['call_provider'], secret_scope: 'provider:gemini', tenant_ids: ['rpgpo'], enabled: true, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { integration_id: 'int_perplexity', name: 'Perplexity API', category: 'provider_api', trust_level: 'verified', permissions: ['call_provider'], secret_scope: 'provider:perplexity', tenant_ids: ['rpgpo'], enabled: true, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { integration_id: 'int_local_fs', name: 'Local Filesystem', category: 'storage', trust_level: 'official', permissions: ['read_context', 'write_state'], secret_scope: 'environment', tenant_ids: ['rpgpo'], enabled: true, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
}
function ensureDefaults() {
    let integrations = readJson(INTEGRATIONS_FILE, []);
    if (integrations.length === 0) {
        integrations = defaultIntegrations();
        writeJson(INTEGRATIONS_FILE, integrations);
    }
    return integrations;
}
function getIntegrations() { return ensureDefaults(); }
function getIntegration(integrationId) { return ensureDefaults().find(i => i.integration_id === integrationId) || null; }
function createIntegration(opts) {
    const integrations = ensureDefaults();
    const i = {
        integration_id: uid('int'), name: opts.name, category: opts.category,
        trust_level: opts.trust_level || 'community', permissions: opts.permissions || [],
        secret_scope: opts.secret_scope || '', tenant_ids: ['rpgpo'],
        enabled: false, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    integrations.unshift(i);
    writeJson(INTEGRATIONS_FILE, integrations);
    return i;
}
function toggleIntegration(integrationId) {
    const integrations = ensureDefaults();
    const idx = integrations.findIndex(i => i.integration_id === integrationId);
    if (idx === -1)
        return null;
    integrations[idx].enabled = !integrations[idx].enabled;
    integrations[idx].updated_at = new Date().toISOString();
    writeJson(INTEGRATIONS_FILE, integrations);
    return integrations[idx];
}
/** Evaluate integration access */
function evaluateAccess(integrationId, tenantId, action = 'use') {
    const integration = getIntegration(integrationId);
    let outcome = 'deny';
    let reason = 'Integration not found';
    if (integration) {
        if (!integration.enabled) {
            outcome = 'deny';
            reason = 'Integration disabled';
        }
        else if (!integration.tenant_ids.includes(tenantId) && !integration.tenant_ids.includes('*')) {
            outcome = 'deny';
            reason = 'Tenant not authorized';
        }
        else if (integration.trust_level === 'untrusted') {
            outcome = 'require_approval';
            reason = 'Untrusted integration requires approval';
        }
        else {
            outcome = 'allow';
            reason = `Authorized: trust=${integration.trust_level}`;
        }
    }
    const decision = { decision_id: uid('ia'), integration_id: integrationId, tenant_id: tenantId, action, outcome, reason, created_at: new Date().toISOString() };
    const decisions = readJson(DECISIONS_FILE, []);
    decisions.unshift(decision);
    if (decisions.length > 300)
        decisions.length = 300;
    writeJson(DECISIONS_FILE, decisions);
    // Increment usage counter
    if (outcome === 'allow' && integration) {
        const integrations = ensureDefaults();
        const idx = integrations.findIndex(i => i.integration_id === integrationId);
        if (idx >= 0) {
            integrations[idx].usage_count++;
            writeJson(INTEGRATIONS_FILE, integrations);
        }
    }
    return decision;
}
module.exports = { getIntegrations, getIntegration, createIntegration, toggleIntegration, evaluateAccess };
//# sourceMappingURL=integration-governance.js.map