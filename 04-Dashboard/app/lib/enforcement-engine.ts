// GPO Enforcement Engine — Evaluates actions against governance state
// Consumes lane, policies, budgets, escalation, docs, reviews, simulation, readiness.
// Returns allow / warn / soft_block / hard_block / override_required.

import type {
  Lane, SimulationScope, EnforcementAction, EnforcementLevel,
  EnforcementDecision, EnforcementRule, OverrideType,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'enforcement-decisions.json');
const RULES_FILE = path.resolve(__dirname, '..', '..', 'state', 'enforcement-rules.json');

function uid(): string { return 'ed_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Default Rules
// ═══════════════════════════════════════════

function defaultRules(): EnforcementRule[] {
  return [
    { rule_id: 'ef_prod_docs', action: 'promote_to_prod', condition: 'documentation_incomplete', level: 'hard_block', description: 'Prod promotion requires complete documentation', enabled: true },
    { rule_id: 'ef_prod_reviews', action: 'promote_to_prod', condition: 'reviews_not_passed', level: 'hard_block', description: 'Prod promotion requires all reviews passed', enabled: true },
    { rule_id: 'ef_prod_readiness', action: 'promote_to_prod', condition: 'readiness_below_75', level: 'soft_block', description: 'Prod promotion needs readiness score >= 75%', enabled: true },
    { rule_id: 'ef_beta_docs', action: 'promote_to_beta', condition: 'documentation_incomplete', level: 'soft_block', description: 'Beta promotion should have documentation', enabled: true },
    { rule_id: 'ef_beta_readiness', action: 'promote_to_beta', condition: 'readiness_below_50', level: 'warn', description: 'Beta promotion below 50% readiness', enabled: true },
    { rule_id: 'ef_exec_budget', action: 'start_execution', condition: 'budget_exceeded', level: 'soft_block', description: 'Execution blocked when budget exceeded', enabled: true },
    { rule_id: 'ef_exec_escalation', action: 'start_execution', condition: 'unresolved_escalation', level: 'warn', description: 'Warn on execution with unresolved escalations', enabled: true },
    { rule_id: 'ef_release_all', action: 'release', condition: 'not_promoted', level: 'hard_block', description: 'Release requires prior promotion', enabled: true },
    { rule_id: 'ef_dossier_graph', action: 'generate_dossier', condition: 'graph_incomplete', level: 'warn', description: 'Dossier generation on incomplete graph', enabled: true },
  ];
}

export function getRules(): EnforcementRule[] {
  const stored = readJson<EnforcementRule[]>(RULES_FILE, []);
  return stored.length > 0 ? stored : defaultRules();
}

// ═══════════════════════════════════════════
// Enforcement Evaluation
// ═══════════════════════════════════════════

/** Evaluate an action against all governance state */
export function evaluate(
  relatedType: SimulationScope,
  relatedId: string,
  action: EnforcementAction,
  lane: Lane
): EnforcementDecision {
  const reasons: string[] = [];
  const blockers: string[] = [];
  const warnings: string[] = [];
  const requiredOverrides: OverrideType[] = [];
  const triggeredRules: string[] = [];
  let level: EnforcementLevel = 'allow';

  const rules = getRules().filter(r => r.enabled && r.action === action);

  // Check each applicable rule
  for (const rule of rules) {
    let triggered = false;

    switch (rule.condition) {
      case 'documentation_incomplete': {
        try {
          const dg = require('./documentation-governance') as {
            checkRequirements(st: string, id: string, l: string): { met: boolean; missing: string[]; blocking: boolean };
          };
          const scopeType = relatedType === 'graph' ? 'execution_graph' : relatedType === 'dossier' ? 'promotion' : 'release';
          const check = dg.checkRequirements(scopeType, relatedId, lane);
          if (!check.met) { triggered = true; reasons.push(`Missing docs: ${check.missing.join(', ')}`); requiredOverrides.push('documentation_gap'); }
        } catch { /* */ }
        break;
      }
      case 'reviews_not_passed': {
        try {
          const rc = require('./review-contracts') as { getReviewsForGraph(id: string): import('./types').ReviewContract[] };
          const graphId = getGraphId(relatedType, relatedId);
          if (graphId) {
            const reviews = rc.getReviewsForGraph(graphId);
            const failed = reviews.filter(r => r.verdict === 'fail');
            if (failed.length > 0) { triggered = true; reasons.push(`${failed.length} review(s) failed`); requiredOverrides.push('review_failure'); }
            const pending = reviews.filter(r => !r.verdict);
            if (pending.length > 0) { triggered = true; reasons.push(`${pending.length} review(s) pending`); }
          }
        } catch { /* */ }
        break;
      }
      case 'readiness_below_75':
      case 'readiness_below_50': {
        const threshold = rule.condition === 'readiness_below_75' ? 75 : 50;
        try {
          const rr = require('./release-readiness') as {
            getScoresForEntity(rt: string, rid: string): import('./types').ReleaseReadinessScore[];
          };
          const scores = rr.getScoresForEntity(relatedType, relatedId);
          const latest = scores[0];
          if (latest && latest.overall_score < threshold) {
            triggered = true; reasons.push(`Readiness ${latest.overall_score}% < ${threshold}%`);
            requiredOverrides.push('readiness_shortfall');
          } else if (!latest) {
            triggered = true; reasons.push('No readiness score computed');
            requiredOverrides.push('readiness_shortfall');
          }
        } catch { /* */ }
        break;
      }
      case 'budget_exceeded': {
        try {
          const ab = require('./autonomy-budgets') as { isActionAllowed(a: string, l: string): { allowed: boolean; reason: string } };
          const check = ab.isActionAllowed('execute_green', lane);
          if (!check.allowed) { triggered = true; reasons.push(check.reason); }
        } catch { /* */ }
        break;
      }
      case 'unresolved_escalation': {
        try {
          const eg = require('./escalation-governance') as { getEventsForGraph(id: string): import('./types').EscalationEvent[] };
          const graphId = getGraphId(relatedType, relatedId);
          if (graphId) {
            const events = eg.getEventsForGraph(graphId);
            const unresolved = events.filter(e => !e.resolved);
            if (unresolved.length > 0) { triggered = true; reasons.push(`${unresolved.length} unresolved escalation(s)`); requiredOverrides.push('escalation_conflict'); }
          }
        } catch { /* */ }
        break;
      }
      case 'graph_incomplete': {
        try {
          const egMod = require('./execution-graph') as {
            getGraph(id: string): import('./types').ExecutionGraph | null;
            isGraphComplete(id: string): { complete: boolean };
          };
          const graphId = getGraphId(relatedType, relatedId);
          if (graphId) {
            const check = egMod.isGraphComplete(graphId);
            if (!check.complete) { triggered = true; reasons.push('Graph not yet complete'); }
          }
        } catch { /* */ }
        break;
      }
      case 'not_promoted': {
        try {
          const pd = require('./promotion-dossiers') as { getDossier(id: string): import('./types').PromotionDossier | null };
          const dossier = pd.getDossier(relatedId);
          if (!dossier || !dossier.promoted_at) { triggered = true; reasons.push('Not yet promoted via dossier'); requiredOverrides.push('promotion_block'); }
        } catch { /* */ }
        break;
      }
    }

    if (triggered) {
      triggeredRules.push(rule.rule_id);
      if (rule.level === 'hard_block') { blockers.push(rule.description); if (level !== 'hard_block') level = 'hard_block'; }
      else if (rule.level === 'soft_block') { blockers.push(rule.description); if (level === 'allow' || level === 'warn') level = 'soft_block'; }
      else if (rule.level === 'override_required') { blockers.push(rule.description); if (level === 'allow' || level === 'warn') level = 'override_required'; }
      else if (rule.level === 'warn') { warnings.push(rule.description); if (level === 'allow') level = 'warn'; }
    }
  }

  // Check for approved overrides that clear soft blocks
  if (level === 'soft_block' || level === 'override_required') {
    try {
      const ol = require('./override-ledger') as {
        getApprovedOverrides(rt: string, rid: string, a: string): import('./types').OverrideEntry[];
      };
      const overrides = ol.getApprovedOverrides(relatedType, relatedId, action);
      const coveredTypes = new Set(overrides.map(o => o.override_type));
      const uncoveredOverrides = requiredOverrides.filter(t => !coveredTypes.has(t));
      if (uncoveredOverrides.length === 0) {
        level = 'allow';
        reasons.push('Cleared by approved overrides');
      }
    } catch { /* */ }
  }

  const decision: EnforcementDecision = {
    decision_id: uid(),
    related_type: relatedType,
    related_id: relatedId,
    action,
    lane,
    level,
    reasons,
    blockers,
    warnings,
    required_override_types: requiredOverrides,
    triggered_rule_ids: triggeredRules,
    created_at: new Date().toISOString(),
  };

  const decisions = readJson<EnforcementDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 300) decisions.length = 300;
  writeJson(DECISIONS_FILE, decisions);

  return decision;
}

function getGraphId(relatedType: SimulationScope, relatedId: string): string | null {
  if (relatedType === 'graph') return relatedId;
  if (relatedType === 'dossier') {
    try {
      const pd = require('./promotion-dossiers') as { getDossier(id: string): import('./types').PromotionDossier | null };
      const d = pd.getDossier(relatedId);
      return d?.graph_id || null;
    } catch { return null; }
  }
  return null;
}

export function getDecisionsForEntity(relatedType: SimulationScope, relatedId: string): EnforcementDecision[] {
  return readJson<EnforcementDecision[]>(DECISIONS_FILE, []).filter(d => d.related_type === relatedType && d.related_id === relatedId);
}

export function getDecision(decisionId: string): EnforcementDecision | null {
  return readJson<EnforcementDecision[]>(DECISIONS_FILE, []).find(d => d.decision_id === decisionId) || null;
}

module.exports = {
  getRules, evaluate,
  getDecisionsForEntity, getDecision,
};
