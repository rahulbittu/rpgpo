// GPO External Integrations Governance — Govern connectors to external systems

import type { IntegrationConnector, IntegrationAccessDecision, ExtensionTrustLevel, ExtensionPermission } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const INTEGRATIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'integrations.json');
const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'integration-decisions.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

function defaultIntegrations(): IntegrationConnector[] {
  return [
    { integration_id: 'int_openai', name: 'OpenAI API', category: 'provider_api', trust_level: 'verified', permissions: ['call_provider'], secret_scope: 'provider:openai', tenant_ids: ['rpgpo'], enabled: true, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { integration_id: 'int_gemini', name: 'Gemini API', category: 'provider_api', trust_level: 'verified', permissions: ['call_provider'], secret_scope: 'provider:gemini', tenant_ids: ['rpgpo'], enabled: true, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { integration_id: 'int_perplexity', name: 'Perplexity API', category: 'provider_api', trust_level: 'verified', permissions: ['call_provider'], secret_scope: 'provider:perplexity', tenant_ids: ['rpgpo'], enabled: true, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { integration_id: 'int_local_fs', name: 'Local Filesystem', category: 'storage', trust_level: 'official', permissions: ['read_context', 'write_state'], secret_scope: 'environment', tenant_ids: ['rpgpo'], enabled: true, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
}

function ensureDefaults(): IntegrationConnector[] {
  let integrations = readJson<IntegrationConnector[]>(INTEGRATIONS_FILE, []);
  if (integrations.length === 0) { integrations = defaultIntegrations(); writeJson(INTEGRATIONS_FILE, integrations); }
  return integrations;
}

export function getIntegrations(): IntegrationConnector[] { return ensureDefaults(); }
export function getIntegration(integrationId: string): IntegrationConnector | null { return ensureDefaults().find(i => i.integration_id === integrationId) || null; }

export function createIntegration(opts: { name: string; category: IntegrationConnector['category']; trust_level?: ExtensionTrustLevel; permissions?: ExtensionPermission[]; secret_scope?: string }): IntegrationConnector {
  const integrations = ensureDefaults();
  const i: IntegrationConnector = {
    integration_id: uid('int'), name: opts.name, category: opts.category,
    trust_level: opts.trust_level || 'community', permissions: opts.permissions || [],
    secret_scope: opts.secret_scope || '', tenant_ids: ['rpgpo'],
    enabled: false, usage_count: 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  integrations.unshift(i);
  writeJson(INTEGRATIONS_FILE, integrations);
  return i;
}

export function toggleIntegration(integrationId: string): IntegrationConnector | null {
  const integrations = ensureDefaults();
  const idx = integrations.findIndex(i => i.integration_id === integrationId);
  if (idx === -1) return null;
  integrations[idx].enabled = !integrations[idx].enabled;
  integrations[idx].updated_at = new Date().toISOString();
  writeJson(INTEGRATIONS_FILE, integrations);
  return integrations[idx];
}

/** Evaluate integration access */
export function evaluateAccess(integrationId: string, tenantId: string, action: string = 'use'): IntegrationAccessDecision {
  const integration = getIntegration(integrationId);
  let outcome: IntegrationAccessDecision['outcome'] = 'deny';
  let reason = 'Integration not found';

  if (integration) {
    if (!integration.enabled) { outcome = 'deny'; reason = 'Integration disabled'; }
    else if (!integration.tenant_ids.includes(tenantId) && !integration.tenant_ids.includes('*')) { outcome = 'deny'; reason = 'Tenant not authorized'; }
    else if (integration.trust_level === 'untrusted') { outcome = 'require_approval'; reason = 'Untrusted integration requires approval'; }
    else { outcome = 'allow'; reason = `Authorized: trust=${integration.trust_level}`; }
  }

  const decision: IntegrationAccessDecision = { decision_id: uid('ia'), integration_id: integrationId, tenant_id: tenantId, action, outcome, reason, created_at: new Date().toISOString() };
  const decisions = readJson<IntegrationAccessDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 300) decisions.length = 300;
  writeJson(DECISIONS_FILE, decisions);

  // Increment usage counter
  if (outcome === 'allow' && integration) {
    const integrations = ensureDefaults();
    const idx = integrations.findIndex(i => i.integration_id === integrationId);
    if (idx >= 0) { integrations[idx].usage_count++; writeJson(INTEGRATIONS_FILE, integrations); }
  }

  return decision;
}

module.exports = { getIntegrations, getIntegration, createIntegration, toggleIntegration, evaluateAccess };
