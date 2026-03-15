// GPO Orchestrator Telemetry — Metrics for workflow orchestration

import type { WorkflowStage } from './workflow-types';

const _counters: Record<string, number> = {};
const _stageDurations: Record<string, number[]> = {};

export function incrementTransition(from: WorkflowStage | undefined, to: WorkflowStage): void {
  const key = `transition:${from || 'none'}:${to}`;
  _counters[key] = (_counters[key] || 0) + 1;
  _counters['total_transitions'] = (_counters['total_transitions'] || 0) + 1;
}

export function recordStageDuration(stage: WorkflowStage, durationMs: number): void {
  if (!_stageDurations[stage]) _stageDurations[stage] = [];
  _stageDurations[stage].push(durationMs);
  if (_stageDurations[stage].length > 1000) _stageDurations[stage] = _stageDurations[stage].slice(-500);
}

export function incrementAutoAdvance(): void {
  _counters['auto_advances'] = (_counters['auto_advances'] || 0) + 1;
}

export function incrementAutoRelease(): void {
  _counters['auto_releases'] = (_counters['auto_releases'] || 0) + 1;
}

export function incrementError(): void {
  _counters['errors'] = (_counters['errors'] || 0) + 1;
}

export function getMetrics(): {
  counters: Record<string, number>;
  stageDurations: Record<string, { avg: number; p50: number; p95: number; count: number }>;
} {
  const durations: Record<string, { avg: number; p50: number; p95: number; count: number }> = {};
  for (const [stage, vals] of Object.entries(_stageDurations)) {
    if (vals.length === 0) continue;
    const sorted = [...vals].sort((a, b) => a - b);
    durations[stage] = {
      avg: sorted.reduce((s, v) => s + v, 0) / sorted.length,
      p50: sorted[Math.floor(sorted.length * 0.5)] || 0,
      p95: sorted[Math.floor(sorted.length * 0.95)] || 0,
      count: sorted.length,
    };
  }
  return { counters: { ..._counters }, stageDurations: durations };
}

export function reset(): void {
  for (const key of Object.keys(_counters)) delete _counters[key];
  for (const key of Object.keys(_stageDurations)) delete _stageDurations[key];
}

module.exports = { incrementTransition, recordStageDuration, incrementAutoAdvance, incrementAutoRelease, incrementError, getMetrics, reset };
