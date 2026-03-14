// GPO Worker Governance — Runtime-level hooks for worker decisions
// Evaluates isActionAllowed and enforcement before work executes.

import type {
  WorkerGovernanceDecision, HookOutcome, Lane, Domain,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const DECISIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'worker-decisions.json');

function uid(): string { return 'wd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Evaluate whether a worker action should proceed */
export function evaluateWorkerAction(
  graphId: string,
  nodeId: string | undefined,
  action: string
): WorkerGovernanceDecision {
  let outcome: HookOutcome = 'proceed';
  const reasons: string[] = [];
  let retryAllowed = true;
  let maxRetries = 3;

  // Get graph context
  let lane: Lane = 'dev';
  let domain: Domain | undefined;
  try {
    const eg = require('./execution-graph') as { getGraph(id: string): import('./types').ExecutionGraph | null };
    const graph = eg.getGraph(graphId);
    if (graph) { lane = graph.lane; domain = graph.domain; }
  } catch { /* */ }

  // Check runtime enforcement
  try {
    const re = require('./runtime-enforcement') as {
      checkTransition(t: string, gid: string, nid?: string): import('./types').HookExecutionResult;
    };
    const transition = action === 'execute_subtask' ? 'node_start' : action === 'execute_builder' ? 'node_start' : 'node_queue';
    const result = re.checkTransition(transition, graphId, nodeId);
    outcome = result.outcome;
    reasons.push(...result.reasons, ...result.warnings, ...result.blockers);
  } catch { /* runtime enforcement not loaded */ }

  // Check autonomy budget for retry limits
  try {
    const ab = require('./autonomy-budgets') as { resolveBudget(l: string, d?: string): import('./types').AutonomyBudget };
    const budget = ab.resolveBudget(lane, domain);
    maxRetries = budget.max_retries;
    if (lane === 'prod') retryAllowed = false;
  } catch { /* */ }

  const decision: WorkerGovernanceDecision = {
    decision_id: uid(),
    graph_id: graphId,
    node_id: nodeId,
    action,
    outcome,
    retry_allowed: retryAllowed && outcome !== 'block',
    max_retries_remaining: maxRetries,
    reasons,
    created_at: new Date().toISOString(),
  };

  const decisions = readJson<WorkerGovernanceDecision[]>(DECISIONS_FILE, []);
  decisions.unshift(decision);
  if (decisions.length > 300) decisions.length = 300;
  writeJson(DECISIONS_FILE, decisions);

  return decision;
}

export function getDecisionsForGraph(graphId: string): WorkerGovernanceDecision[] {
  return readJson<WorkerGovernanceDecision[]>(DECISIONS_FILE, []).filter(d => d.graph_id === graphId);
}

export function getDecisionsForNode(nodeId: string): WorkerGovernanceDecision[] {
  return readJson<WorkerGovernanceDecision[]>(DECISIONS_FILE, []).filter(d => d.node_id === nodeId);
}

export function getAllDecisions(): WorkerGovernanceDecision[] {
  return readJson<WorkerGovernanceDecision[]>(DECISIONS_FILE, []);
}

module.exports = {
  evaluateWorkerAction,
  getDecisionsForGraph, getDecisionsForNode, getAllDecisions,
};
