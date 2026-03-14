// GPO Security Hardening — Evaluate and report security posture

import type { SecurityControl, SecurityFinding, SecurityPostureReport, HardeningChecklistItem } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const REPORTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'security-reports.json');

function uid(): string { return 'sp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Run security posture assessment */
export function runAssessment(scopeType: string = 'platform', scopeId: string = 'gpo'): SecurityPostureReport {
  const controls: SecurityControl[] = [];
  const findings: SecurityFinding[] = [];

  // Tenant isolation
  controls.push({ control_id: 'c_iso', name: 'Tenant Isolation', category: 'isolation', status: 'implemented', details: 'Project-level isolation with boundary enforcement' });

  // API entitlement
  controls.push({ control_id: 'c_ent', name: 'API Entitlement Checks', category: 'access', status: 'partial', details: 'Entitlement evaluation available but not enforced at API layer' });
  findings.push({ finding_id: uid(), severity: 'medium', category: 'access', title: 'API entitlement enforcement not active', remediation: 'Wire entitlement checks into API route handlers', affected_scope: 'platform', evidence_refs: [], created_at: new Date().toISOString() });

  // Sensitive artifact redaction
  controls.push({ control_id: 'c_red', name: 'Sensitive Artifact Redaction', category: 'privacy', status: 'implemented', details: 'Pattern exchange redaction, shared governance boundaries' });

  // Auditability
  controls.push({ control_id: 'c_aud', name: 'Audit Coverage', category: 'audit', status: 'implemented', details: 'Artifact registry, evidence chain, traceability ledger, audit hub' });

  // Rollback safety
  controls.push({ control_id: 'c_rb', name: 'Rollback Safety', category: 'resilience', status: 'implemented', details: 'Rollback control, tuning rollback available' });

  // Environment separation
  controls.push({ control_id: 'c_env', name: 'Environment Separation', category: 'isolation', status: 'implemented', details: 'Dev/beta/prod lanes with lane-aware governance' });

  // Secret posture
  let secretHealth = { total: 0, stale: 0, expired: 0 };
  try {
    const sg = require('./secret-governance') as { getSecrets(): import('./types').SecretRecord[] };
    const secrets = sg.getSecrets();
    secretHealth.total = secrets.length;
    secretHealth.stale = secrets.filter(s => s.status === 'stale').length;
    secretHealth.expired = secrets.filter(s => s.status === 'expired' || s.key_prefix === 'none').length;
    if (secretHealth.expired > 0) {
      findings.push({ finding_id: uid(), severity: 'high', category: 'secrets', title: `${secretHealth.expired} expired/missing secret(s)`, remediation: 'Configure missing API keys in .env', affected_scope: 'provider', evidence_refs: [], created_at: new Date().toISOString() });
    }
    controls.push({ control_id: 'c_sec', name: 'Secret Governance', category: 'secrets', status: secretHealth.expired > 0 ? 'partial' : 'implemented', details: `${secretHealth.total} secrets tracked, ${secretHealth.expired} expired` });
  } catch {
    controls.push({ control_id: 'c_sec', name: 'Secret Governance', category: 'secrets', status: 'not_implemented', details: 'Module not available' });
  }

  // Runtime enforcement
  controls.push({ control_id: 'c_rte', name: 'Runtime Enforcement', category: 'enforcement', status: 'implemented', details: 'Wired into execution graph transitions' });

  // Approval/escalation visibility
  controls.push({ control_id: 'c_apv', name: 'Approval Visibility', category: 'governance', status: 'implemented', details: 'Approval workspace, escalation inbox active' });

  // Boundary health
  let boundaryHealth = { violations: 0, enforced: true };
  try {
    const pi = require('./project-isolation') as { getViolations(): any[] };
    boundaryHealth.violations = pi.getViolations().length;
  } catch { boundaryHealth.enforced = false; }

  // Overall posture
  const implemented = controls.filter(c => c.status === 'implemented').length;
  const total = controls.length;
  let overall: SecurityPostureReport['overall'] = 'strong';
  if (findings.some(f => f.severity === 'blocker')) overall = 'critical';
  else if (findings.filter(f => f.severity === 'high').length >= 2) overall = 'weak';
  else if (implemented < total * 0.7) overall = 'acceptable';

  const report: SecurityPostureReport = {
    report_id: uid(), scope_type: scopeType, scope_id: scopeId,
    overall, controls, findings, secret_health: secretHealth,
    boundary_health: boundaryHealth, created_at: new Date().toISOString(),
  };

  const reports = readJson<SecurityPostureReport[]>(REPORTS_FILE, []);
  reports.unshift(report);
  if (reports.length > 30) reports.length = 30;
  writeJson(REPORTS_FILE, reports);

  return report;
}

export function getFindings(): SecurityFinding[] {
  const reports = readJson<SecurityPostureReport[]>(REPORTS_FILE, []);
  return reports.length > 0 ? reports[0].findings : [];
}

export function getChecklist(): HardeningChecklistItem[] {
  return [
    { item_id: 'h1', category: 'isolation', title: 'Tenant isolation enforced', completed: true, details: 'Project-level isolation active' },
    { item_id: 'h2', category: 'access', title: 'API entitlement enforcement', completed: false, details: 'Entitlement checks at API layer' },
    { item_id: 'h3', category: 'privacy', title: 'Sensitive data redaction', completed: true, details: 'Pattern exchange + boundary redaction' },
    { item_id: 'h4', category: 'audit', title: 'Full audit trail coverage', completed: true, details: 'Artifact registry + evidence chain + traceability' },
    { item_id: 'h5', category: 'resilience', title: 'Rollback capability', completed: true, details: 'Release + tuning rollback available' },
    { item_id: 'h6', category: 'secrets', title: 'Secret rotation configured', completed: false, details: 'Rotation policies defined but no auto-rotation' },
    { item_id: 'h7', category: 'enforcement', title: 'Runtime enforcement wired', completed: true, details: 'Graph/node transitions enforced' },
    { item_id: 'h8', category: 'governance', title: 'Approval/escalation visible', completed: true, details: 'Workspace + inbox + delegation active' },
    { item_id: 'h9', category: 'boundaries', title: 'Data boundary controls', completed: true, details: 'Cross-project + shared governance boundaries' },
    { item_id: 'h10', category: 'deployment', title: 'Deployment readiness assessed', completed: true, details: '9-dimension readiness scoring available' },
  ];
}

export function getReports(): SecurityPostureReport[] { return readJson<SecurityPostureReport[]>(REPORTS_FILE, []); }

module.exports = { runAssessment, getFindings, getChecklist, getReports };
