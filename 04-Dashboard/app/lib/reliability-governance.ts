// GPO Reliability Governance — Subsystem reliability assessment and incident management

import type { ReliabilityIncident, ReliabilitySnapshot, ServiceHealthView, SLOStatus } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const INCIDENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'reliability-incidents.json');

function uid(): string { return 'ri_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

const SUBSYSTEMS = ['execution_runtime', 'governance_runtime', 'release_pipeline', 'provider_routing', 'approval_workflow', 'audit_compliance'];

/** Compute reliability snapshots for all subsystems */
export function getSnapshots(): ReliabilitySnapshot[] {
  const snapshots: ReliabilitySnapshot[] = [];
  const incidents = getIncidents();

  for (const sub of SUBSYSTEMS) {
    const subIncidents = incidents.filter(i => i.subsystem === sub && !i.resolved);
    let status: ReliabilitySnapshot['status'] = 'healthy';
    if (subIncidents.length >= 3) status = 'critical';
    else if (subIncidents.length >= 2) status = 'degraded';
    else if (subIncidents.length >= 1) status = 'watch';

    // Get telemetry success rate
    let successRate = 100;
    try {
      const obs = require('./observability') as { getMetrics(f?: Record<string, unknown>): import('./types').TelemetryMetric[] };
      const metrics = obs.getMetrics({ category: sub });
      const sr = metrics.find(m => m.metric === 'success_rate');
      if (sr) successRate = sr.value;
    } catch { /* */ }

    if (successRate < 70) status = 'critical';
    else if (successRate < 85) status = status === 'healthy' ? 'watch' : status;

    snapshots.push({ subsystem: sub, status, success_rate: successRate, incident_count: subIncidents.length, details: `${sub}: ${successRate}% success, ${subIncidents.length} incidents` });
  }

  return snapshots;
}

/** Record a reliability incident */
export function recordIncident(opts: { subsystem: string; severity?: ReliabilityIncident['severity']; title: string; detail: string; affected_scope?: string; remediation?: string }): ReliabilityIncident {
  const incidents = readJson<ReliabilityIncident[]>(INCIDENTS_FILE, []);
  const i: ReliabilityIncident = {
    incident_id: uid(), subsystem: opts.subsystem, severity: opts.severity || 'medium',
    title: opts.title, detail: opts.detail, affected_scope: opts.affected_scope || 'platform',
    remediation: opts.remediation || '', resolved: false, created_at: new Date().toISOString(),
  };
  incidents.unshift(i);
  if (incidents.length > 200) incidents.length = 200;
  writeJson(INCIDENTS_FILE, incidents);
  return i;
}

export function getIncidents(): ReliabilityIncident[] { return readJson<ReliabilityIncident[]>(INCIDENTS_FILE, []); }

/** Get unified service health view */
export function getServiceHealth(): ServiceHealthView {
  const subsystems = getSnapshots();
  const sloStatuses = getSLOStatuses();
  const activeIncidents = getIncidents().filter(i => !i.resolved).length;
  const activeAlerts = sloStatuses.filter(s => !s.met).length;

  let overall: ServiceHealthView['overall'] = 'healthy';
  if (subsystems.some(s => s.status === 'critical')) overall = 'critical';
  else if (subsystems.some(s => s.status === 'degraded')) overall = 'degraded';

  return { overall, subsystems, slo_statuses: sloStatuses, active_incidents: activeIncidents, active_alerts: activeAlerts, created_at: new Date().toISOString() };
}

function getSLOStatuses(): SLOStatus[] {
  try { const slo = require('./slo-sla') as { getStatuses(): SLOStatus[] }; return slo.getStatuses(); } catch { return []; }
}

module.exports = { getSnapshots, recordIncident, getIncidents, getServiceHealth };
