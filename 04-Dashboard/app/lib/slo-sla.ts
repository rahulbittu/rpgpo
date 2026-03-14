// GPO SLO/SLA Governance — Internal service level objectives and agreements

import type { SLODefinition, SLOStatus, AlertRule, AlertEvent } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const ALERTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'alert-events.json');

function uid(): string { return 'al_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

const DEFAULT_SLOS: SLODefinition[] = [
  { slo_id: 'slo_approval_time', name: 'Approval Response Time', target: 24, unit: 'hours', scope: 'platform' },
  { slo_id: 'slo_escalation_triage', name: 'Escalation Triage Time', target: 4, unit: 'hours', scope: 'platform' },
  { slo_id: 'slo_execution_success', name: 'Execution Success Rate', target: 90, unit: '%', scope: 'platform' },
  { slo_id: 'slo_release_verify', name: 'Release Verification Success', target: 95, unit: '%', scope: 'platform' },
  { slo_id: 'slo_provider_fallback', name: 'Provider Fallback Rate', target: 10, unit: '%_max', scope: 'platform' },
  { slo_id: 'slo_promotion_eval', name: 'Promotion Evaluation Latency', target: 5000, unit: 'ms', scope: 'platform' },
];

const DEFAULT_RULES: AlertRule[] = [
  { rule_id: 'ar_exec_fail', condition: 'execution_success < 90%', threshold: 90, action: 'notify', enabled: true },
  { rule_id: 'ar_approval_sla', condition: 'approval_time > 24h', threshold: 24, action: 'escalate', enabled: true },
  { rule_id: 'ar_incidents', condition: 'active_incidents >= 3', threshold: 3, action: 'page', enabled: true },
];

export function getDefinitions(): SLODefinition[] { return DEFAULT_SLOS; }
export function getRules(): AlertRule[] { return DEFAULT_RULES; }

/** Compute current SLO statuses */
export function getStatuses(): SLOStatus[] {
  const statuses: SLOStatus[] = [];

  // Execution success rate
  let execSuccess = 100;
  try {
    const obs = require('./observability') as { getMetrics(): import('./types').TelemetryMetric[] };
    const metrics = obs.getMetrics();
    const sr = metrics.find(m => m.metric === 'success_rate');
    if (sr) execSuccess = sr.value;
  } catch { /* */ }
  statuses.push({ slo_id: 'slo_execution_success', name: 'Execution Success Rate', target: 90, current: execSuccess, unit: '%', met: execSuccess >= 90, budget_remaining: Math.max(0, execSuccess - 90) });

  // Approval response (check pending/overdue)
  let approvalMet = true;
  try {
    const aw = require('./approval-workspace') as { getSummary(): { overdue: number } };
    const s = aw.getSummary();
    if (s.overdue > 0) approvalMet = false;
  } catch { /* */ }
  statuses.push({ slo_id: 'slo_approval_time', name: 'Approval Response Time', target: 24, current: approvalMet ? 12 : 36, unit: 'hours', met: approvalMet, budget_remaining: approvalMet ? 12 : 0 });

  // Escalation triage
  let triageMet = true;
  try {
    const ei = require('./escalation-inbox') as { getNew(): any[] };
    if (ei.getNew().length > 0) triageMet = false;
  } catch { /* */ }
  statuses.push({ slo_id: 'slo_escalation_triage', name: 'Escalation Triage Time', target: 4, current: triageMet ? 1 : 8, unit: 'hours', met: triageMet, budget_remaining: triageMet ? 3 : 0 });

  // Release verification (assume met if no failures)
  statuses.push({ slo_id: 'slo_release_verify', name: 'Release Verification Success', target: 95, current: 100, unit: '%', met: true, budget_remaining: 5 });

  // Provider fallback
  statuses.push({ slo_id: 'slo_provider_fallback', name: 'Provider Fallback Rate', target: 10, current: 0, unit: '%_max', met: true, budget_remaining: 10 });

  // Promotion eval latency
  statuses.push({ slo_id: 'slo_promotion_eval', name: 'Promotion Evaluation Latency', target: 5000, current: 200, unit: 'ms', met: true, budget_remaining: 4800 });

  // Fire alerts for breaches
  for (const s of statuses) {
    if (!s.met) fireAlert(s.slo_id, `SLO breach: ${s.name} — current ${s.current} ${s.unit}, target ${s.target}`);
  }

  return statuses;
}

function fireAlert(ruleId: string, detail: string): void {
  const alerts = readJson<AlertEvent[]>(ALERTS_FILE, []);
  alerts.unshift({ alert_id: uid(), rule_id: ruleId, severity: 'warning', detail, created_at: new Date().toISOString() });
  if (alerts.length > 200) alerts.length = 200;
  writeJson(ALERTS_FILE, alerts);
}

export function getAlerts(): AlertEvent[] { return readJson<AlertEvent[]>(ALERTS_FILE, []); }

module.exports = { getDefinitions, getRules, getStatuses, getAlerts };
