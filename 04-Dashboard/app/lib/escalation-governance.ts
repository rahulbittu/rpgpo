// GPO Escalation Governance — Rule-based escalation on system events
// Triggers: low confidence, review conflict, handoff quality, privacy risk, etc.
// Actions: notify, require approval, board reopen, pause, downgrade.

import type {
  EscalationRule, EscalationEvent, EscalationTrigger, EscalationAction,
  Domain, MissionStatementLevel,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RULES_FILE = path.resolve(__dirname, '..', '..', 'state', 'escalation-rules.json');
const EVENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'escalation-events.json');

function uid(prefix: string): string { return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function readJson<T>(file: string, fallback: T): T {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : fallback; } catch { return fallback; }
}
function writeJson(file: string, data: unknown): void {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════
// Default Rules
// ═══════════════════════════════════════════

function defaultRules(): EscalationRule[] {
  return [
    { rule_id: 'er_low_conf', trigger: 'low_confidence', action: 'notify_operator', threshold: 50, scope_level: 'global', scope_id: 'global', enabled: true, description: 'Escalate when confidence drops below 50%', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { rule_id: 'er_review_conflict', trigger: 'review_conflict', action: 'require_second_provider_review', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Require second provider when reviews conflict', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { rule_id: 'er_privacy', trigger: 'privacy_risk', action: 'pause_execution', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Pause execution on privacy risk detection', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { rule_id: 'er_mission', trigger: 'mission_conflict', action: 'notify_operator', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Notify operator when work conflicts with mission', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { rule_id: 'er_doc_gap', trigger: 'documentation_gap', action: 'notify_operator', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Notify when required documentation is missing', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { rule_id: 'er_provider', trigger: 'provider_mismatch', action: 'downgrade_to_advisory', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Downgrade to advisory when provider fit is poor', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { rule_id: 'er_retry', trigger: 'retry_exhaustion', action: 'require_operator_approval', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Require approval when retries exhausted', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { rule_id: 'er_promo', trigger: 'promotion_attempt', action: 'require_operator_approval', scope_level: 'global', scope_id: 'global', enabled: true, description: 'Require approval for promotion attempts', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { rule_id: 'er_handoff', trigger: 'handoff_quality', action: 'notify_operator', threshold: 40, scope_level: 'global', scope_id: 'global', enabled: true, description: 'Notify when handoff confidence is low', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
}

function ensureDefaults(): EscalationRule[] {
  let rules = readJson<EscalationRule[]>(RULES_FILE, []);
  if (rules.length === 0) { rules = defaultRules(); writeJson(RULES_FILE, rules); }
  return rules;
}

// ═══════════════════════════════════════════
// Rule CRUD
// ═══════════════════════════════════════════

export function getAllRules(): EscalationRule[] { return ensureDefaults(); }

export function getRulesForDomain(domain: Domain): EscalationRule[] {
  return ensureDefaults().filter(r =>
    (r.scope_level === 'engine' && r.scope_id === domain) || r.scope_level === 'global'
  );
}

export function getRulesForProject(projectId: string): EscalationRule[] {
  return ensureDefaults().filter(r =>
    (r.scope_level === 'project' && r.scope_id === projectId) || r.scope_level === 'global'
  );
}

export function createRule(opts: Omit<EscalationRule, 'rule_id' | 'created_at' | 'updated_at'>): EscalationRule {
  const rules = ensureDefaults();
  const rule: EscalationRule = { ...opts, rule_id: uid('er'), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  rules.unshift(rule);
  writeJson(RULES_FILE, rules);
  return rule;
}

export function toggleRule(ruleId: string): EscalationRule | null {
  const rules = ensureDefaults();
  const idx = rules.findIndex(r => r.rule_id === ruleId);
  if (idx === -1) return null;
  rules[idx].enabled = !rules[idx].enabled;
  rules[idx].updated_at = new Date().toISOString();
  writeJson(RULES_FILE, rules);
  return rules[idx];
}

// ═══════════════════════════════════════════
// Escalation Evaluation
// ═══════════════════════════════════════════

/** Evaluate all escalation rules against a graph's current state */
export function evaluateEscalation(graphId: string, nodeId?: string): EscalationEvent[] {
  const rules = ensureDefaults().filter(r => r.enabled);
  const fired: EscalationEvent[] = [];

  // Gather graph state
  let graph: import('./types').ExecutionGraph | null = null;
  let nodes: import('./types').ExecutionNode[] = [];
  try {
    const eg = require('./execution-graph') as {
      getGraph(id: string): import('./types').ExecutionGraph | null;
      getNodesForGraph(id: string): import('./types').ExecutionNode[];
    };
    graph = eg.getGraph(graphId);
    nodes = eg.getNodesForGraph(graphId);
  } catch { return []; }
  if (!graph) return [];

  // Gather dossier
  let dossier: import('./types').PromotionDossier | null = null;
  if (graph.dossier_id) {
    try {
      const pd = require('./promotion-dossiers') as { getDossier(id: string): import('./types').PromotionDossier | null };
      dossier = pd.getDossier(graph.dossier_id);
    } catch { /* */ }
  }

  // Gather handoffs
  let handoffs: import('./types').ExecutionHandoffRecord[] = [];
  try {
    const cc = require('./collaboration-contracts') as { getHandoffsForGraph(id: string): import('./types').ExecutionHandoffRecord[] };
    handoffs = cc.getHandoffsForGraph(graphId);
  } catch { /* */ }

  // Gather reviews
  let reviews: import('./types').ReviewContract[] = [];
  try {
    const rc = require('./review-contracts') as { getReviewsForGraph(id: string): import('./types').ReviewContract[] };
    reviews = rc.getReviewsForGraph(graphId);
  } catch { /* */ }

  for (const rule of rules) {
    let shouldFire = false;
    let detail = '';

    switch (rule.trigger) {
      case 'low_confidence':
        if (dossier && dossier.confidence_score < (rule.threshold || 50)) {
          shouldFire = true; detail = `Dossier confidence ${dossier.confidence_score}% < threshold ${rule.threshold || 50}%`;
        }
        break;
      case 'review_conflict': {
        const verdicts = reviews.filter(r => r.verdict).map(r => r.verdict);
        if (verdicts.includes('pass') && verdicts.includes('fail')) {
          shouldFire = true; detail = 'Reviews have conflicting pass/fail verdicts';
        }
        break;
      }
      case 'handoff_quality': {
        const lowConf = handoffs.filter(h => h.confidence < (rule.threshold || 40));
        if (lowConf.length > 0) {
          shouldFire = true; detail = `${lowConf.length} handoff(s) below confidence threshold`;
        }
        break;
      }
      case 'retry_exhaustion': {
        const failedNodes = nodes.filter(n => n.status === 'failed');
        if (failedNodes.length >= 3) {
          shouldFire = true; detail = `${failedNodes.length} nodes failed — retry budget likely exhausted`;
        }
        break;
      }
      case 'provider_mismatch': {
        // Check if any node uses a deprecated provider fit
        try {
          const pr = require('./provider-registry') as { getAllFits(): import('./types').ScopedProviderFit[] };
          const fits = pr.getAllFits();
          for (const node of nodes) {
            const deprecated = fits.find(f => f.state === 'deprecated' && node.assigned_agent.includes(f.provider_id));
            if (deprecated) { shouldFire = true; detail = `Node "${node.title}" uses deprecated provider fit`; break; }
          }
        } catch { /* */ }
        break;
      }
      case 'documentation_gap': {
        try {
          const dg = require('./documentation-governance') as { checkRequirements(st: string, id: string, lane: string): { met: boolean; missing: string[] } };
          const check = dg.checkRequirements('execution_graph', graphId, graph.lane);
          if (!check.met) { shouldFire = true; detail = `Missing docs: ${check.missing.join(', ')}`; }
        } catch { /* */ }
        break;
      }
      case 'promotion_attempt':
        if (dossier && dossier.recommendation === 'promote' && !dossier.promoted_at) {
          shouldFire = true; detail = 'Promotion dossier pending — requires operator approval';
        }
        break;
      default:
        break;
    }

    if (shouldFire) {
      const event: EscalationEvent = {
        event_id: uid('ee'),
        rule_id: rule.rule_id,
        trigger: rule.trigger,
        action: rule.action,
        graph_id: graphId,
        node_id: nodeId,
        detail,
        resolved: false,
        created_at: new Date().toISOString(),
      };
      fired.push(event);
    }
  }

  // Persist events
  if (fired.length > 0) {
    const events = readJson<EscalationEvent[]>(EVENTS_FILE, []);
    events.unshift(...fired);
    if (events.length > 500) events.length = 500;
    writeJson(EVENTS_FILE, events);
  }

  return fired;
}

export function getEventsForGraph(graphId: string): EscalationEvent[] {
  return readJson<EscalationEvent[]>(EVENTS_FILE, []).filter(e => e.graph_id === graphId);
}

export function getAllEvents(): EscalationEvent[] {
  return readJson<EscalationEvent[]>(EVENTS_FILE, []);
}

module.exports = {
  getAllRules, getRulesForDomain, getRulesForProject,
  createRule, toggleRule,
  evaluateEscalation, getEventsForGraph, getAllEvents,
};
