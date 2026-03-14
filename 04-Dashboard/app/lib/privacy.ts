// GPO Privacy Framework
// Enforces data boundaries, redaction, and isolation rules.
// Privacy is a first-class design layer, not a future note.

import type { PrivacyPolicy, Domain, Provider, DataClassification, AccessClass } from './types';

// ═══════════════════════════════════════════
// Data Classification
// ═══════════════════════════════════════════

const CLASSIFICATIONS: DataClassification[] = [
  {
    class: 'A',
    label: 'Core Safe',
    description: 'Governance, repos, dashboards — safe for all operations',
    allowed_actions: ['read', 'write', 'export', 'send_to_provider'],
  },
  {
    class: 'B',
    label: 'Controlled',
    description: 'Service accounts, approved tools — requires provider allowlist',
    allowed_actions: ['read', 'write', 'send_to_provider'],
  },
  {
    class: 'C',
    label: 'Sensitive',
    description: 'Private threads, personal docs — local only unless explicit',
    allowed_actions: ['read', 'write'],
  },
  {
    class: 'D',
    label: 'Forbidden',
    description: 'Not approved for any automated processing',
    allowed_actions: ['read'],
  },
];

export function getClassification(cls: AccessClass): DataClassification | undefined {
  return CLASSIFICATIONS.find(c => c.class === cls);
}

export function isActionAllowed(cls: AccessClass, action: string): boolean {
  const classification = CLASSIFICATIONS.find(c => c.class === cls);
  return classification ? classification.allowed_actions.includes(action) : false;
}

// ═══════════════════════════════════════════
// Redaction
// ═══════════════════════════════════════════

/** Redact sensitive patterns from text based on privacy policy */
export function redact(text: string, policy: PrivacyPolicy): string {
  let result = text;
  for (const pattern of policy.log_redaction_patterns) {
    try {
      const re = new RegExp(pattern, 'gi');
      result = result.replace(re, '[REDACTED]');
    } catch {
      // Skip invalid patterns
    }
  }
  return result;
}

/** Redact sensitive fields from an object */
export function redactObject<T extends Record<string, unknown>>(obj: T, policy: PrivacyPolicy): T {
  const result = { ...obj };
  for (const field of policy.sensitive_fields) {
    if (field in result) {
      (result as Record<string, unknown>)[field] = '[REDACTED]';
    }
  }
  return result;
}

// ═══════════════════════════════════════════
// Provider Access Control
// ═══════════════════════════════════════════

/** Check if a provider can receive data for a given mission */
export function canSendToProvider(
  provider: Provider,
  domain: Domain,
  policy: PrivacyPolicy
): boolean {
  // Provider must be in allowed list
  if (!policy.allowed_providers.includes(provider)) return false;
  // Mission must not be in isolation list
  if (policy.mission_isolation.includes(domain)) return false;
  return true;
}

/** Check if data can be exported outside the instance */
export function canExport(policy: PrivacyPolicy): boolean {
  return policy.allow_export;
}

/** Check if data can be imported into the instance */
export function canImport(policy: PrivacyPolicy): boolean {
  return policy.allow_import;
}

// ═══════════════════════════════════════════
// Isolation
// ═══════════════════════════════════════════

/** Check if a mission's data must stay isolated (not sent to providers) */
export function isMissionIsolated(domain: Domain, policy: PrivacyPolicy): boolean {
  return policy.mission_isolation.includes(domain);
}

/** Check if the instance is local-only (no external API calls allowed) */
export function isLocalOnly(policy: PrivacyPolicy): boolean {
  return policy.local_only;
}

/** Get the secret storage scope */
export function getSecretScope(policy: PrivacyPolicy): PrivacyPolicy['secret_scope'] {
  return policy.secret_scope;
}

module.exports = {
  getClassification,
  isActionAllowed,
  redact,
  redactObject,
  canSendToProvider,
  canExport,
  canImport,
  isMissionIsolated,
  isLocalOnly,
  getSecretScope,
};
