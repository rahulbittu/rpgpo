// GPO Alert Routing — Route real alerts to operator-visible destinations

import type { AlertRoutingDecision, SLOBreachRecord } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const ROUTING_FILE = path.resolve(__dirname, '..', '..', 'state', 'alert-routing.json');
const BREACHES_FILE = path.resolve(__dirname, '..', '..', 'state', 'slo-breaches.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Route an alert to the appropriate operator destination */
export function routeAlert(category: string, severity: AlertRoutingDecision['severity'], detail: string): AlertRoutingDecision {
  // Determine target
  let target: AlertRoutingDecision['target'] = 'admin_workspace';
  if (category === 'stuck_approval' || category === 'stuck_escalation') target = 'escalation_inbox';
  else if (category === 'slo_breach' || category === 'execution_failure') target = 'admin_workspace';
  else if (category === 'security_finding') target = 'escalation_inbox';
  else if (severity === 'critical') target = 'operator_home';

  // Dedupe check
  const existing = readJson<AlertRoutingDecision[]>(ROUTING_FILE, []);
  const recent = existing.find(a => a.category === category && a.detail === detail && (Date.now() - new Date(a.created_at).getTime()) < 3600000);
  const deduped = !!recent;

  const decision: AlertRoutingDecision = {
    alert_id: uid('ar'), category, severity, target, detail,
    delivered: !deduped, deduped, created_at: new Date().toISOString(),
  };

  existing.unshift(decision);
  if (existing.length > 200) existing.length = 200;
  writeJson(ROUTING_FILE, existing);

  // If not deduped, actually create the target item
  if (!deduped) {
    try {
      if (target === 'escalation_inbox') {
        const ei = require('./escalation-inbox') as { createItem(o: Record<string, unknown>): unknown };
        ei.createItem({ source_type: 'alert', source_id: decision.alert_id, title: `Alert: ${category}`, detail, severity });
      }
    } catch { /* */ }
  }

  return decision;
}

/** Record an SLO breach */
export function recordBreach(sloId: string, sloName: string, target: number, actual: number, unit: string): SLOBreachRecord {
  const severity = Math.abs(actual - target) > target * 0.3 ? 'critical' : 'warning';
  const breach: SLOBreachRecord = {
    breach_id: uid('sb'), slo_id: sloId, slo_name: sloName,
    target, actual, unit, severity,
    routed_to: 'admin_workspace', created_at: new Date().toISOString(),
  };

  const breaches = readJson<SLOBreachRecord[]>(BREACHES_FILE, []);
  breaches.unshift(breach);
  if (breaches.length > 100) breaches.length = 100;
  writeJson(BREACHES_FILE, breaches);

  // Route alert
  routeAlert('slo_breach', severity as any, `${sloName}: ${actual} vs target ${target} ${unit}`);

  return breach;
}

/** Run alert routing check — scan for conditions that need alerts */
export function runAlertCheck(): AlertRoutingDecision[] {
  const decisions: AlertRoutingDecision[] = [];

  // Check SLO breaches
  try {
    const slo = require('./slo-sla') as { getStatuses(): Array<{ slo_id: string; name: string; target: number; current: number; unit: string; met: boolean }> };
    for (const s of slo.getStatuses().filter(s => !s.met)) {
      const breach = recordBreach(s.slo_id, s.name, s.target, s.current, s.unit);
      decisions.push(routeAlert('slo_breach', breach.severity as any, `${s.name} breached`));
    }
  } catch { /* */ }

  // Check stuck approvals
  try {
    const aw = require('./approval-workspace') as { getSummary(): { overdue: number } };
    const s = aw.getSummary();
    if (s.overdue > 0) decisions.push(routeAlert('stuck_approval', 'warning', `${s.overdue} overdue approval(s)`));
  } catch { /* */ }

  // Check reliability incidents
  try {
    const rg = require('./reliability-governance') as { getIncidents(): Array<{ resolved: boolean; severity: string }> };
    const active = rg.getIncidents().filter(i => !i.resolved);
    if (active.length >= 3) decisions.push(routeAlert('execution_failure', 'critical', `${active.length} active reliability incidents`));
  } catch { /* */ }

  return decisions;
}

export function getRoutingHistory(): AlertRoutingDecision[] { return readJson<AlertRoutingDecision[]>(ROUTING_FILE, []); }
export function getBreaches(): SLOBreachRecord[] { return readJson<SLOBreachRecord[]>(BREACHES_FILE, []); }

module.exports = { routeAlert, recordBreach, runAlertCheck, getRoutingHistory, getBreaches };
