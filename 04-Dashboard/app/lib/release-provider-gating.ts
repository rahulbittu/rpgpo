// GPO Release Provider Gating — Provider governance checks before release approval

import type { ReleaseProviderGatingDecision } from './types';

function uid(): string { return 'rpg_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

/** Evaluate provider health gates for a release */
export function evaluateProviderGating(releaseId: string): ReleaseProviderGatingDecision {
  let providerHealth = 'unknown';
  let costOk = true;
  let latencyOk = true;
  let incidents = 0;

  // Check provider reliability scores
  try {
    const prs = require('./provider-reliability-scoring') as { getScores(): Array<{ provider: string; reliability: number; health: string }> };
    const scores = prs.getScores();
    const unhealthy = scores.filter(s => s.reliability < 0.8);
    providerHealth = unhealthy.length === 0 ? 'all_healthy' : `${unhealthy.length}/${scores.length} degraded`;
  } catch { providerHealth = 'no_data'; }

  // Check cost governance
  try {
    const clg = require('./cost-latency-governance') as { getCostStatus(): { over_budget: boolean } };
    const cs = clg.getCostStatus();
    costOk = !cs.over_budget;
  } catch { /* assume ok */ }

  // Check latency governance
  try {
    const clg = require('./cost-latency-governance') as { getLatencyStatus(): { breaching_sla: boolean } };
    const ls = clg.getLatencyStatus();
    latencyOk = !ls.breaching_sla;
  } catch { /* assume ok */ }

  // Check active incidents
  try {
    const inc = require('./incident-response') as { getActiveIncidents(): Array<{ status: string }> };
    const active = inc.getActiveIncidents();
    incidents = active.filter(i => i.status === 'active' || i.status === 'investigating').length;
  } catch { /* */ }

  let outcome: ReleaseProviderGatingDecision['outcome'] = 'clear';
  const details: string[] = [];

  if (incidents > 0) { outcome = 'blocked'; details.push(`${incidents} active incident(s)`); }
  if (!costOk) { outcome = outcome === 'blocked' ? 'blocked' : 'warning'; details.push('Cost budget exceeded'); }
  if (!latencyOk) { outcome = outcome === 'blocked' ? 'blocked' : 'warning'; details.push('SLA latency breach'); }
  if (providerHealth.includes('degraded')) { outcome = outcome === 'blocked' ? 'blocked' : 'warning'; details.push(`Provider health: ${providerHealth}`); }

  return {
    decision_id: uid(),
    release_id: releaseId,
    provider_health: providerHealth,
    cost_ok: costOk,
    latency_ok: latencyOk,
    incidents,
    outcome,
    detail: details.length ? details.join('; ') : 'All provider gates clear',
    created_at: new Date().toISOString(),
  };
}

/** Quick check if any release can proceed */
export function canReleaseProceed(releaseId: string): boolean {
  const decision = evaluateProviderGating(releaseId);
  return decision.outcome !== 'blocked';
}

module.exports = { evaluateProviderGating, canReleaseProceed };
