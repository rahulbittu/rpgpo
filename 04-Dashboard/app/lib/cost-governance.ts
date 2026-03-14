// GPO Cost Governance — Budget-aware provider routing decisions

import type {
  Provider, Lane, Domain, ProviderCostProfile, ProviderCostDecision,
  CostDecisionOutcome, ProviderBudgetWindow,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'cost-decisions.json');

function uid(): string { return 'cd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Built-in Cost Profiles
// ═══════════════════════════════════════════

const COST_PROFILES: ProviderCostProfile[] = [
  { provider_id: 'claude', cost_per_1k_input: 0, cost_per_1k_output: 0, cost_tier: 'free', updated_at: new Date().toISOString() },
  { provider_id: 'openai', cost_per_1k_input: 2.5, cost_per_1k_output: 10, cost_tier: 'medium', updated_at: new Date().toISOString() },
  { provider_id: 'gemini', cost_per_1k_input: 0.1, cost_per_1k_output: 0.4, cost_tier: 'low', updated_at: new Date().toISOString() },
  { provider_id: 'perplexity', cost_per_1k_input: 1, cost_per_1k_output: 5, cost_tier: 'low', updated_at: new Date().toISOString() },
];

export function getCostProfiles(): ProviderCostProfile[] { return COST_PROFILES; }

export function getCostProfile(providerId: Provider): ProviderCostProfile | null {
  return COST_PROFILES.find(p => p.provider_id === providerId) || null;
}

// ═══════════════════════════════════════════
// Budget Windows
// ═══════════════════════════════════════════

function getBudgetWindow(lane: Lane, domain?: Domain): ProviderBudgetWindow {
  // Get budget from autonomy budgets
  let dailyLimit = 10;
  try {
    const ab = require('./autonomy-budgets') as { resolveBudget(l: string, d?: string): import('./types').AutonomyBudget };
    const budget = ab.resolveBudget(lane, domain);
    dailyLimit = budget.max_daily_cost_usd;
  } catch { /* */ }

  // Get today's spend from costs module
  let spentToday = 0;
  try {
    const costs = require('./costs') as { getSummary(): { today: number } };
    const summary = costs.getSummary();
    spentToday = summary.today || 0;
  } catch { /* */ }

  return {
    window_id: `bw_${lane}_${domain || 'global'}`,
    lane, domain, daily_limit: dailyLimit, spent_today: spentToday,
    period_start: new Date().toISOString().slice(0, 10),
  };
}

// ═══════════════════════════════════════════
// Cost Evaluation
// ═══════════════════════════════════════════

/** Evaluate cost governance for a provider action */
export function evaluateCost(
  providerId: Provider, action: string, lane: Lane,
  domain?: Domain, projectId?: string, estimatedCost: number = 0.01
): ProviderCostDecision {
  const profile = getCostProfile(providerId);
  const window = getBudgetWindow(lane, domain);
  const remaining = window.daily_limit - window.spent_today;

  let outcome: CostDecisionOutcome = 'allow';
  let reason = 'Within budget';

  if (remaining <= 0) {
    outcome = lane === 'prod' ? 'hard_block' : 'soft_block';
    reason = `Daily budget exhausted: $${window.spent_today.toFixed(2)} / $${window.daily_limit}`;
  } else if (remaining < estimatedCost * 2) {
    outcome = 'warn';
    reason = `Budget low: $${remaining.toFixed(2)} remaining`;
  } else if (profile && profile.cost_tier === 'high' && lane === 'prod') {
    outcome = 'warn';
    reason = `High-cost provider in prod lane`;
  }

  // Free providers always allow
  if (profile && profile.cost_tier === 'free') {
    outcome = 'allow';
    reason = 'Free provider — no cost concern';
  }

  const decision: ProviderCostDecision = {
    decision_id: uid(), provider_id: providerId, action, lane,
    estimated_cost: estimatedCost, budget_remaining: remaining,
    outcome, reason, created_at: new Date().toISOString(),
  };

  const decisions = readJson<ProviderCostDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 300) decisions.length = 300;
  writeJson(DECISIONS_FILE, decisions);

  return decision;
}

export function getCostDecisions(domain?: Domain): ProviderCostDecision[] {
  const all = readJson<ProviderCostDecision[]>(DECISIONS_FILE, []);
  return domain ? all.filter(d => d.lane) : all; // simplified; domain filtering would need to be added to decision
}

module.exports = { getCostProfiles, getCostProfile, evaluateCost, getCostDecisions };
