// GPO Latency Governance — Latency-aware provider routing decisions

import type {
  Provider, Lane, AgentRole, LatencyClass, LatencyDecisionOutcome,
  ProviderLatencyProfile, ProviderLatencyDecision, ProviderGovernanceSummary,
  ProviderRoutingConstraint, ProviderHealthState,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'latency-decisions.json');

function uid(): string { return 'ld_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Built-in Latency Profiles
// ═══════════════════════════════════════════

const LATENCY_PROFILES: ProviderLatencyProfile[] = [
  { provider_id: 'claude', avg_latency_ms: 500, p95_latency_ms: 2000, recent_samples: 0, classification: 'fast', updated_at: new Date().toISOString() },
  { provider_id: 'openai', avg_latency_ms: 1500, p95_latency_ms: 5000, recent_samples: 0, classification: 'acceptable', updated_at: new Date().toISOString() },
  { provider_id: 'gemini', avg_latency_ms: 800, p95_latency_ms: 3000, recent_samples: 0, classification: 'fast', updated_at: new Date().toISOString() },
  { provider_id: 'perplexity', avg_latency_ms: 2000, p95_latency_ms: 8000, recent_samples: 0, classification: 'acceptable', updated_at: new Date().toISOString() },
];

export function getLatencyProfiles(): ProviderLatencyProfile[] { return LATENCY_PROFILES; }

export function getLatencyProfile(providerId: Provider): ProviderLatencyProfile | null {
  return LATENCY_PROFILES.find(p => p.provider_id === providerId) || null;
}

// ═══════════════════════════════════════════
// Latency Thresholds by Lane
// ═══════════════════════════════════════════

function getThreshold(lane: Lane): number {
  switch (lane) {
    case 'dev': return 10000;  // 10s
    case 'beta': return 5000;  // 5s
    case 'prod': return 3000;  // 3s
  }
}

// ═══════════════════════════════════════════
// Latency Evaluation
// ═══════════════════════════════════════════

/** Evaluate latency governance for a provider */
export function evaluateLatency(
  providerId: Provider, role: AgentRole, lane: Lane,
  domain?: string, projectId?: string
): ProviderLatencyDecision {
  const profile = getLatencyProfile(providerId);
  const threshold = getThreshold(lane);
  const currentLatency = profile?.avg_latency_ms || 1000;

  let outcome: LatencyDecisionOutcome = 'proceed';
  let reason = 'Latency within threshold';

  if (currentLatency > threshold * 2) {
    outcome = lane === 'prod' ? 'block' : 'fallback';
    reason = `Latency ${currentLatency}ms exceeds ${threshold * 2}ms (2x threshold for ${lane})`;
  } else if (currentLatency > threshold) {
    outcome = lane === 'prod' ? 'reroute' : 'warn';
    reason = `Latency ${currentLatency}ms exceeds ${threshold}ms threshold for ${lane}`;
  }

  // Local provider (Claude) always fast
  if (providerId === 'claude') {
    outcome = 'proceed';
    reason = 'Local provider — no latency concern';
  }

  const decision: ProviderLatencyDecision = {
    decision_id: uid(), provider_id: providerId, role, lane,
    current_latency_ms: currentLatency, threshold_ms: threshold,
    outcome, reason, created_at: new Date().toISOString(),
  };

  const decisions = readJson<ProviderLatencyDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 300) decisions.length = 300;
  writeJson(DECISIONS_FILE, decisions);

  return decision;
}

export function getLatencyDecisions(providerId?: Provider): ProviderLatencyDecision[] {
  const all = readJson<ProviderLatencyDecision[]>(DECISIONS_FILE, []);
  return providerId ? all.filter(d => d.provider_id === providerId) : all;
}

// ═══════════════════════════════════════════
// Provider Governance Summary
// ═══════════════════════════════════════════

/** Build unified provider governance summary */
export function getGovernanceSummary(): ProviderGovernanceSummary[] {
  const providers: Provider[] = ['claude', 'openai', 'gemini', 'perplexity'];
  const summaries: ProviderGovernanceSummary[] = [];

  for (const pid of providers) {
    let reliability: ProviderHealthState = 'healthy';
    let incidents = 0;
    try {
      const pr = require('./provider-reliability') as { getSnapshots(id?: string): import('./types').ProviderReliabilitySnapshot[]; getIncidentsForProvider(id: string): import('./types').ProviderIncident[] };
      const snaps = pr.getSnapshots(pid);
      if (snaps.length > 0) reliability = snaps[0].health;
      incidents = pr.getIncidentsForProvider(pid).length;
    } catch { /* */ }

    let costTier = 'medium';
    try {
      const cg = require('./cost-governance') as { getCostProfile(id: string): import('./types').ProviderCostProfile | null };
      const cp = cg.getCostProfile(pid);
      if (cp) costTier = cp.cost_tier;
    } catch { /* */ }

    const latProfile = getLatencyProfile(pid);
    const latClass = latProfile?.classification || 'acceptable';

    const routing: ProviderRoutingConstraint = {
      provider_id: pid as Provider,
      reliability_ok: reliability === 'healthy' || reliability === 'watch',
      cost_ok: costTier !== 'high',
      latency_ok: latClass === 'fast' || latClass === 'acceptable',
      overall: 'clear',
    };
    if (!routing.reliability_ok || !routing.cost_ok || !routing.latency_ok) {
      routing.overall = !routing.reliability_ok ? 'blocked' : 'constrained';
      if (!routing.reliability_ok) routing.fallback_provider = 'claude' as Provider;
    }

    summaries.push({
      provider_id: pid as Provider, reliability, cost_tier: costTier,
      latency_class: latClass as import('./types').LatencyClass,
      routing, incidents, created_at: new Date().toISOString(),
    });
  }

  return summaries;
}

module.exports = { getLatencyProfiles, getLatencyProfile, evaluateLatency, getLatencyDecisions, getGovernanceSummary };
