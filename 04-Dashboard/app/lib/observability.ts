// GPO Observability — Telemetry collection and scoped metric queries

import type { TelemetryEvent, TelemetryMetric, Domain, Provider, Lane } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const EVENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'telemetry-events.json');

function uid(): string { return 'te_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Emit a telemetry event */
export function emit(opts: { category: string; action: string; outcome: TelemetryEvent['outcome']; duration_ms?: number; lane?: Lane; domain?: Domain; project_id?: string; provider_id?: Provider }): TelemetryEvent {
  const events = readJson<TelemetryEvent[]>(EVENTS_FILE, []);
  const e: TelemetryEvent = { event_id: uid(), ...opts, created_at: new Date().toISOString() };
  events.unshift(e);
  if (events.length > 2000) events.length = 2000;
  writeJson(EVENTS_FILE, events);
  return e;
}

/** Query telemetry with filters */
export function query(filters?: { domain?: Domain; project_id?: string; provider_id?: Provider; category?: string; lane?: Lane; days?: number }): TelemetryEvent[] {
  let events = readJson<TelemetryEvent[]>(EVENTS_FILE, []);
  if (filters?.domain) events = events.filter(e => e.domain === filters.domain);
  if (filters?.project_id) events = events.filter(e => e.project_id === filters.project_id);
  if (filters?.provider_id) events = events.filter(e => e.provider_id === filters.provider_id);
  if (filters?.category) events = events.filter(e => e.category === filters.category);
  if (filters?.lane) events = events.filter(e => e.lane === filters.lane);
  if (filters?.days) { const cutoff = new Date(Date.now() - (filters.days || 30) * 86400000).toISOString(); events = events.filter(e => e.created_at >= cutoff); }
  return events;
}

/** Compute metrics from telemetry */
export function getMetrics(filters?: Record<string, unknown>): TelemetryMetric[] {
  const events = query(filters as any);
  const total = events.length;
  const successes = events.filter(e => e.outcome === 'success').length;
  const failures = events.filter(e => e.outcome === 'failure').length;
  const blocked = events.filter(e => e.outcome === 'blocked').length;
  const durations = events.filter(e => e.duration_ms).map(e => e.duration_ms!);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((s, d) => s + d, 0) / durations.length) : 0;

  const scope = (filters as any)?.domain || (filters as any)?.project_id || 'global';
  return [
    { metric: 'throughput', value: total, unit: 'events', scope, window: '30d' },
    { metric: 'success_rate', value: total > 0 ? Math.round((successes / total) * 100) : 100, unit: '%', scope, window: '30d' },
    { metric: 'failure_rate', value: total > 0 ? Math.round((failures / total) * 100) : 0, unit: '%', scope, window: '30d' },
    { metric: 'blocked_rate', value: total > 0 ? Math.round((blocked / total) * 100) : 0, unit: '%', scope, window: '30d' },
    { metric: 'avg_duration', value: avgDuration, unit: 'ms', scope, window: '30d' },
  ];
}

module.exports = { emit, query, getMetrics };
