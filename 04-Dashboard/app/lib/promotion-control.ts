// GPO Promotion Control — Evaluates dev→beta and beta→prod promotion
// Uses dossier, readiness, simulation, docs, escalation, enforcement, overrides.

import type {
  Lane, PromotionControlResult, PromotionDecision, PromotionPolicy,
  EnforcementLevel,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'promotion-decisions.json');
const POLICIES_FILE = path.resolve(__dirname, '..', '..', 'state', 'promotion-policies.json');

function uid(): string { return 'pc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Default Promotion Policies
// ═══════════════════════════════════════════

function defaultPolicies(): PromotionPolicy[] {
  return [
    {
      policy_id: 'pp_beta', target_lane: 'beta',
      min_readiness_score: 40, require_all_reviews_passed: false,
      require_documentation_complete: false, require_no_open_escalations: false,
      allow_override: true, enabled: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
    {
      policy_id: 'pp_prod', target_lane: 'prod',
      min_readiness_score: 75, require_all_reviews_passed: true,
      require_documentation_complete: true, require_no_open_escalations: true,
      allow_override: false, enabled: true,
      created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    },
  ];
}

export function getPolicies(): PromotionPolicy[] {
  const stored = readJson<PromotionPolicy[]>(POLICIES_FILE, []);
  return stored.length > 0 ? stored : defaultPolicies();
}

export function createPolicy(opts: Omit<PromotionPolicy, 'policy_id' | 'created_at' | 'updated_at'>): PromotionPolicy {
  const policies = getPolicies();
  const policy: PromotionPolicy = { ...opts, policy_id: uid(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  policies.unshift(policy);
  writeJson(POLICIES_FILE, policies);
  return policy;
}

// ═══════════════════════════════════════════
// Promotion Evaluation
// ═══════════════════════════════════════════

/** Evaluate whether a dossier can be promoted to a target lane */
export function evaluatePromotion(dossierId: string, targetLane: Lane): PromotionDecision {
  const blockers: string[] = [];
  const overridesUsed: string[] = [];
  let readinessScore: number | undefined;
  let enforcementLevel: EnforcementLevel = 'allow';

  // Get policy for target lane
  const policy = getPolicies().find(p => p.target_lane === targetLane && p.enabled);

  // Get dossier
  let dossier: import('./types').PromotionDossier | null = null;
  try {
    const pd = require('./promotion-dossiers') as { getDossier(id: string): import('./types').PromotionDossier | null };
    dossier = pd.getDossier(dossierId);
  } catch { /* */ }

  if (!dossier) {
    blockers.push('Dossier not found');
    return makeDecision(dossierId, targetLane, 'blocked', 'hard_block', undefined, blockers, []);
  }

  if (dossier.recommendation === 'rework') {
    blockers.push('Dossier recommendation is rework — cannot promote');
    return makeDecision(dossierId, targetLane, 'blocked', 'hard_block', undefined, blockers, []);
  }

  // Run enforcement engine
  const enfAction = targetLane === 'prod' ? 'promote_to_prod' : 'promote_to_beta';
  try {
    const ee = require('./enforcement-engine') as {
      evaluate(rt: string, rid: string, a: string, l: string): import('./types').EnforcementDecision;
    };
    const decision = ee.evaluate('dossier', dossierId, enfAction as any, targetLane);
    enforcementLevel = decision.level;
    if (decision.level === 'hard_block') {
      blockers.push(...decision.blockers);
    } else if (decision.level === 'soft_block' || decision.level === 'override_required') {
      // Check if overrides exist
      try {
        const ol = require('./override-ledger') as {
          getApprovedOverrides(rt: string, rid: string, a: string): import('./types').OverrideEntry[];
        };
        const overrides = ol.getApprovedOverrides('dossier', dossierId, enfAction);
        if (overrides.length > 0) {
          overridesUsed.push(...overrides.map(o => o.override_id));
        } else if (policy && !policy.allow_override) {
          blockers.push(...decision.blockers);
        } else {
          blockers.push(...decision.blockers.map(b => b + ' (override available)'));
        }
      } catch { blockers.push(...decision.blockers); }
    }
  } catch { /* */ }

  // Check readiness score
  try {
    const rr = require('./release-readiness') as {
      getScoresForEntity(rt: string, rid: string): import('./types').ReleaseReadinessScore[];
    };
    const scores = rr.getScoresForEntity('dossier', dossierId);
    if (scores.length > 0) {
      readinessScore = scores[0].overall_score;
      if (policy && readinessScore < policy.min_readiness_score) {
        blockers.push(`Readiness ${readinessScore}% below minimum ${policy.min_readiness_score}%`);
      }
    }
  } catch { /* */ }

  // Determine result
  let result: PromotionControlResult = 'allowed';
  if (blockers.length > 0) {
    if (enforcementLevel === 'hard_block' || (policy && !policy.allow_override)) {
      result = 'blocked';
    } else if (overridesUsed.length > 0) {
      result = 'allowed_with_override';
    } else {
      result = 'blocked';
    }
  }

  return makeDecision(dossierId, targetLane, result, enforcementLevel, readinessScore, blockers, overridesUsed);
}

function makeDecision(
  dossierId: string, targetLane: Lane, result: PromotionControlResult,
  enforcementLevel: EnforcementLevel, readinessScore: number | undefined,
  blockers: string[], overridesUsed: string[]
): PromotionDecision {
  const decision: PromotionDecision = {
    decision_id: uid(),
    dossier_id: dossierId,
    target_lane: targetLane,
    result,
    enforcement_level: enforcementLevel,
    readiness_score: readinessScore,
    blockers,
    overrides_used: overridesUsed,
    decided_at: new Date().toISOString(),
  };

  const decisions = readJson<PromotionDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 200) decisions.length = 200;
  writeJson(DECISIONS_FILE, decisions);

  return decision;
}

/** Execute promotion if evaluation allows it */
export function executePromotion(dossierId: string, targetLane: Lane): {
  decision: PromotionDecision;
  promoted: boolean;
} {
  const decision = evaluatePromotion(dossierId, targetLane);

  if (decision.result === 'allowed' || decision.result === 'allowed_with_override') {
    try {
      const pd = require('./promotion-dossiers') as { promoteDossier(id: string): import('./types').PromotionDossier | null };
      const promoted = pd.promoteDossier(dossierId);
      return { decision, promoted: !!promoted };
    } catch { return { decision, promoted: false }; }
  }

  return { decision, promoted: false };
}

export function getDecisionsForDossier(dossierId: string): PromotionDecision[] {
  return readJson<PromotionDecision[]>(DECISIONS_FILE, []).filter(d => d.dossier_id === dossierId);
}

module.exports = {
  getPolicies, createPolicy,
  evaluatePromotion, executePromotion,
  getDecisionsForDossier,
};
