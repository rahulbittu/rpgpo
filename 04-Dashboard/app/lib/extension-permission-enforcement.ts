// GPO Extension Permission Enforcement — Enforce extension permissions at runtime

import type { ExtensionPermissionDecision, ExtensionPermission } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'extension-permission-decisions.json');

function uid(): string { return 'ep_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Evaluate an extension's permission for a specific action */
export function evaluate(extensionId: string, permission: ExtensionPermission, action: string = 'use', tenantId: string = 'rpgpo'): ExtensionPermissionDecision {
  let outcome: ExtensionPermissionDecision['outcome'] = 'denied';
  let reason = 'Extension not found';

  try {
    const ef = require('./extension-framework') as { getPackage(id: string): import('./types').ExtensionPackage | null };
    const pkg = ef.getPackage(extensionId);

    if (!pkg) { reason = 'Extension not found'; }
    else if (pkg.state === 'deprecated') { outcome = 'denied'; reason = 'Extension is deprecated'; }
    else if (pkg.state !== 'installed') { outcome = 'denied'; reason = 'Extension not installed'; }
    else if (!pkg.permissions.includes(permission)) { outcome = 'denied'; reason = `Permission "${permission}" not declared by extension`; }
    else {
      // Check trust level
      if (pkg.trust_level === 'untrusted') { outcome = 'denied_trust'; reason = 'Untrusted extension cannot use this permission'; }
      else if (permission === 'access_secrets' && pkg.trust_level !== 'official') { outcome = 'denied_trust'; reason = 'Only official extensions can access secrets'; }
      else if (permission === 'modify_governance' && pkg.trust_level === 'community') { outcome = 'denied_trust'; reason = 'Community extensions cannot modify governance'; }
      else if (permission === 'cross_project') {
        // Check isolation
        try {
          const tir = require('./tenant-isolation-runtime') as { evaluate(s: string, t: string, a?: string): { outcome: string } };
          const isoCheck = tir.evaluate(tenantId, tenantId, 'cross_project');
          outcome = isoCheck.outcome === 'allow' ? 'granted' : 'denied_isolation';
          reason = isoCheck.outcome === 'allow' ? 'Cross-project allowed for same tenant' : 'Isolation policy blocks cross-project';
        } catch { outcome = 'denied_isolation'; reason = 'Isolation check unavailable'; }
      } else {
        outcome = 'granted';
        reason = `Permission "${permission}" granted (trust: ${pkg.trust_level})`;
      }
    }
  } catch { reason = 'Extension framework not available'; }

  const decision: ExtensionPermissionDecision = { decision_id: uid(), extension_id: extensionId, permission, action, outcome, reason, created_at: new Date().toISOString() };
  const decisions = readJson<ExtensionPermissionDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 300) decisions.length = 300;
  writeJson(DECISIONS_FILE, decisions);

  // Telemetry for denials
  if (outcome.startsWith('denied')) {
    try { const tw = require('./telemetry-wiring') as { emitTelemetry(c: string, a: string, o: string): void }; tw.emitTelemetry('extension_runtime', 'permission_denied', 'blocked'); } catch { /* */ }
  }

  return decision;
}

export function getDecisions(extensionId?: string): ExtensionPermissionDecision[] {
  const all = readJson<ExtensionPermissionDecision[]>(DECISIONS_FILE, []);
  return extensionId ? all.filter(d => d.extension_id === extensionId) : all;
}

module.exports = { evaluate, getDecisions };
