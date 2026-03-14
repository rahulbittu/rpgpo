// GPO Provider Reliability Scoring — Health classification from governance evidence

import type {
  Provider, Domain, ProviderReliabilitySnapshot, ProviderReliabilityMetric,
  ProviderHealthState, ProviderIncident,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const SNAPSHOTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'provider-reliability.json');
const INCIDENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'provider-incidents.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Compute reliability snapshot for a provider */
export function computeReliability(providerId?: Provider, domain?: Domain, projectId?: string, windowDays: number = 30): ProviderReliabilitySnapshot[] {
  const providers: Provider[] = providerId ? [providerId] : ['claude', 'openai', 'gemini', 'perplexity'];
  const snapshots: ProviderReliabilitySnapshot[] = [];

  for (const pid of providers) {
    const metrics: ProviderReliabilityMetric = { success_count: 0, failure_count: 0, retry_count: 0, override_linked_count: 0, escalation_linked_count: 0, review_failure_correlation: 0, promotion_block_correlation: 0, incident_count: 0 };

    // Gather evidence from provider fits
    try {
      const pr = require('./provider-registry') as { getFitsForProvider(id: string): Array<{ success_runs: number; failure_runs: number; evidence_runs: number }> };
      const fits = pr.getFitsForProvider(pid);
      for (const f of fits) { metrics.success_count += f.success_runs; metrics.failure_count += f.failure_runs; }
    } catch { /* */ }

    // Gather incidents
    const incidents = getIncidentsForProvider(pid);
    metrics.incident_count = incidents.length;

    // Gather override/escalation correlations from exception analytics
    try {
      const ea = require('./exception-analytics') as { aggregate(o?: Record<string, unknown>): import('./types').ExceptionAggregate };
      const agg = ea.aggregate({ provider_id: pid, days: windowDays });
      metrics.override_linked_count = agg.by_category['override'] || 0;
      metrics.escalation_linked_count = agg.by_category['escalation'] || 0;
    } catch { /* */ }

    const total = metrics.success_count + metrics.failure_count;
    const successRate = total > 0 ? Math.round((metrics.success_count / total) * 100) : 100;

    let health: ProviderHealthState = 'healthy';
    if (successRate < 50 || metrics.incident_count >= 3) health = 'unstable';
    else if (successRate < 70 || metrics.incident_count >= 2) health = 'degraded';
    else if (successRate < 85 || metrics.incident_count >= 1) health = 'watch';

    const snapshot: ProviderReliabilitySnapshot = {
      snapshot_id: uid('prs'), provider_id: pid as Provider, health, success_rate: successRate,
      metrics, window_days: windowDays, created_at: new Date().toISOString(),
    };
    snapshots.push(snapshot);
  }

  // Persist
  const existing = readJson<ProviderReliabilitySnapshot[]>(SNAPSHOTS_FILE, []);
  existing.unshift(...snapshots);
  if (existing.length > 200) existing.length = 200;
  writeJson(SNAPSHOTS_FILE, existing);

  return snapshots;
}

/** Record a provider incident */
export function recordIncident(opts: {
  provider_id: Provider;
  incident_type: ProviderIncident['incident_type'];
  severity?: ProviderIncident['severity'];
  detail: string;
  domain?: Domain;
  project_id?: string;
}): ProviderIncident {
  const incidents = readJson<ProviderIncident[]>(INCIDENTS_FILE, []);
  const incident: ProviderIncident = {
    incident_id: uid('pi'), provider_id: opts.provider_id,
    incident_type: opts.incident_type, severity: opts.severity || 'medium',
    detail: opts.detail, domain: opts.domain, project_id: opts.project_id,
    resolved: false, created_at: new Date().toISOString(),
  };
  incidents.unshift(incident);
  if (incidents.length > 200) incidents.length = 200;
  writeJson(INCIDENTS_FILE, incidents);
  return incident;
}

export function getIncidentsForProvider(providerId: Provider): ProviderIncident[] {
  return readJson<ProviderIncident[]>(INCIDENTS_FILE, []).filter(i => i.provider_id === providerId);
}

export function getAllIncidents(): ProviderIncident[] {
  return readJson<ProviderIncident[]>(INCIDENTS_FILE, []);
}

export function getSnapshots(providerId?: Provider): ProviderReliabilitySnapshot[] {
  const all = readJson<ProviderReliabilitySnapshot[]>(SNAPSHOTS_FILE, []);
  return providerId ? all.filter(s => s.provider_id === providerId) : all;
}

module.exports = { computeReliability, recordIncident, getIncidentsForProvider, getAllIncidents, getSnapshots };
