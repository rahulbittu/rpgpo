// GPO Measured Reliability — Compute reliability from real telemetry events

import type { MeasuredReliabilityReport } from './types';

function uid(): string { return 'mr_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** Compute measured reliability from real telemetry */
export function computeReliability(scope: string = 'platform'): MeasuredReliabilityReport {
  const metrics: Array<{ name: string; value: number; unit: string; measured: boolean; window: string }> = [];
  const regressions: Array<{ metric: string; previous: number; current: number; delta: number }> = [];

  // Query real telemetry
  let events: any[] = [];
  try {
    const obs = require('./observability') as { query(f?: Record<string, unknown>): any[] };
    events = obs.query({ days: 7 });
  } catch { /* */ }

  const total = events.length;
  const successes = events.filter(e => e.outcome === 'success').length;
  const failures = events.filter(e => e.outcome === 'failure').length;
  const blocked = events.filter(e => e.outcome === 'blocked').length;

  // Real measured metrics
  const successRate = total > 0 ? Math.round((successes / total) * 100) : 100;
  const failureRate = total > 0 ? Math.round((failures / total) * 100) : 0;
  const blockRate = total > 0 ? Math.round((blocked / total) * 100) : 0;
  const durations = events.filter(e => e.duration_ms).map(e => e.duration_ms);
  const avgDuration = durations.length > 0 ? Math.round(durations.reduce((s: number, d: number) => s + d, 0) / durations.length) : 0;

  metrics.push(
    { name: 'execution_success_rate', value: successRate, unit: '%', measured: total > 0, window: '7d' },
    { name: 'execution_failure_rate', value: failureRate, unit: '%', measured: total > 0, window: '7d' },
    { name: 'runtime_block_rate', value: blockRate, unit: '%', measured: total > 0, window: '7d' },
    { name: 'avg_action_latency', value: avgDuration, unit: 'ms', measured: durations.length > 0, window: '7d' },
    { name: 'total_events', value: total, unit: 'events', measured: true, window: '7d' },
  );

  // SLO-derived metrics (from existing SLO module)
  try {
    const slo = require('./slo-sla') as { getStatuses(): Array<{ slo_id: string; name: string; current: number; target: number; met: boolean; unit: string }> };
    for (const s of slo.getStatuses()) {
      metrics.push({ name: `slo_${s.slo_id}`, value: s.current, unit: s.unit, measured: true, window: 'current' });
    }
  } catch { /* */ }

  // Approval/escalation metrics
  try {
    const aw = require('./approval-workspace') as { getSummary(): { pending: number; overdue: number } };
    const s = aw.getSummary();
    metrics.push({ name: 'approval_backlog', value: s.pending, unit: 'items', measured: true, window: 'current' });
    metrics.push({ name: 'approvals_overdue', value: s.overdue, unit: 'items', measured: true, window: 'current' });
  } catch { /* */ }

  // Detect regressions (compare to baseline 100%)
  if (successRate < 90) regressions.push({ metric: 'execution_success_rate', previous: 100, current: successRate, delta: successRate - 100 });
  if (blockRate > 10) regressions.push({ metric: 'runtime_block_rate', previous: 0, current: blockRate, delta: blockRate });

  let health: MeasuredReliabilityReport['overall_health'] = 'healthy';
  if (regressions.length >= 2 || successRate < 70) health = 'critical';
  else if (regressions.length >= 1 || successRate < 85) health = 'degraded';
  else if (successRate < 95) health = 'watch';

  return { report_id: uid(), scope, metrics, regressions, overall_health: health, created_at: new Date().toISOString() };
}

module.exports = { computeReliability };
