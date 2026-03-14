// GPO Runtime Enforcement — Connects enforcement engine to real execution points
// Evaluates policies, budgets, escalation, docs, overrides at each transition.

import type {
  HookTransition, HookOutcome, HookExecutionResult, ExecutionBlockRecord,
  RuntimeGovernanceEvent, RuntimeEnforcementSummary,
  EnforcementLevel, Lane, Domain,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RESULTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'hook-results.json');
const BLOCKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'runtime-blocks.json');
const EVENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'runtime-gov-events.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ═══════════════════════════════════════════
// Transition → Enforcement Action Mapping
// ═══════════════════════════════════════════

const TRANSITION_ACTION_MAP: Record<HookTransition, string> = {
  graph_create: 'create_graph',
  node_queue: 'start_execution',
  node_start: 'advance_node',
  node_complete: 'advance_node',
  review_complete: 'complete_review',
  dossier_generate: 'generate_dossier',
  promotion_attempt: 'promote_to_beta',
};

// ═══════════════════════════════════════════
// Runtime Check
// ═══════════════════════════════════════════

/** Execute a runtime enforcement check at a transition point */
export function checkTransition(
  transition: HookTransition,
  graphId: string,
  nodeId?: string,
  hookId?: string
): HookExecutionResult {
  const reasons: string[] = [];
  const warnings: string[] = [];
  const blockers: string[] = [];
  let outcome: HookOutcome = 'proceed';
  let enfLevel: EnforcementLevel = 'allow';

  // Resolve graph context
  let lane: Lane = 'dev';
  let domain: Domain | undefined;
  try {
    const eg = require('./execution-graph') as { getGraph(id: string): import('./types').ExecutionGraph | null };
    const graph = eg.getGraph(graphId);
    if (graph) { lane = graph.lane; domain = graph.domain; }
  } catch { /* */ }

  // Map transition to enforcement action and evaluate
  const enfAction = TRANSITION_ACTION_MAP[transition] || 'advance_node';
  try {
    const ee = require('./enforcement-engine') as {
      evaluate(rt: string, rid: string, a: string, l: string): import('./types').EnforcementDecision;
    };
    const decision = ee.evaluate('graph', graphId, enfAction as any, lane);
    enfLevel = decision.level;

    if (decision.level === 'hard_block') {
      outcome = 'block';
      blockers.push(...decision.blockers);
      reasons.push(...decision.reasons);
    } else if (decision.level === 'soft_block') {
      outcome = 'require_override';
      blockers.push(...decision.blockers);
      reasons.push(...decision.reasons);
    } else if (decision.level === 'override_required') {
      outcome = 'require_override';
      reasons.push(...decision.reasons);
    } else if (decision.level === 'warn') {
      outcome = 'proceed_with_warning';
      warnings.push(...decision.warnings);
      reasons.push(...decision.reasons);
    }
  } catch { /* enforcement not available — allow */ }

  // Check autonomy budget for execution transitions
  if (['node_queue', 'node_start'].includes(transition)) {
    try {
      const ab = require('./autonomy-budgets') as { isActionAllowed(a: string, l: string, d?: string): { allowed: boolean; reason: string } };
      const check = ab.isActionAllowed('execute_green', lane, domain);
      if (!check.allowed && outcome === 'proceed') {
        outcome = 'proceed_with_warning';
        warnings.push(check.reason);
      }
    } catch { /* */ }
  }

  // Check for unresolved escalations on execution transitions
  if (['node_start', 'promotion_attempt'].includes(transition)) {
    try {
      const eg = require('./escalation-governance') as { getEventsForGraph(id: string): import('./types').EscalationEvent[] };
      const events = eg.getEventsForGraph(graphId);
      const unresolved = events.filter((e: any) => !e.resolved);
      const pauseEvents = unresolved.filter((e: any) => e.action === 'pause_execution');
      if (pauseEvents.length > 0) {
        outcome = 'pause_for_escalation';
        blockers.push(`${pauseEvents.length} escalation(s) require pause`);
      }
    } catch { /* */ }
  }

  // Persist result
  const result: HookExecutionResult = {
    result_id: uid('hr'),
    hook_id: hookId || `auto_${transition}`,
    transition,
    graph_id: graphId,
    node_id: nodeId,
    outcome,
    enforcement_level: enfLevel,
    reasons,
    warnings,
    blockers,
    created_at: new Date().toISOString(),
  };

  const results = readJson<HookExecutionResult[]>(RESULTS_FILE, []);
  results.unshift(result);
  if (results.length > 500) results.length = 500;
  writeJson(RESULTS_FILE, results);

  // Record block if blocked
  if (outcome === 'block' || outcome === 'require_override' || outcome === 'pause_for_escalation') {
    const block: ExecutionBlockRecord = {
      block_id: uid('rb'),
      graph_id: graphId,
      node_id: nodeId,
      transition,
      reason: blockers.join('; ') || reasons.join('; '),
      enforcement_level: enfLevel,
      lane,
      domain,
      resolved: false,
      created_at: new Date().toISOString(),
    };
    const blocks = readJson<ExecutionBlockRecord[]>(BLOCKS_FILE, []);
    blocks.unshift(block);
    if (blocks.length > 300) blocks.length = 300;
    writeJson(BLOCKS_FILE, blocks);
  }

  // Record governance event
  const event: RuntimeGovernanceEvent = {
    event_id: uid('re'),
    transition,
    graph_id: graphId,
    node_id: nodeId,
    outcome,
    detail: outcome === 'proceed' ? 'Allowed' : (blockers[0] || warnings[0] || reasons[0] || 'Checked'),
    lane,
    domain,
    created_at: new Date().toISOString(),
  };
  const events = readJson<RuntimeGovernanceEvent[]>(EVENTS_FILE, []);
  events.unshift(event);
  if (events.length > 500) events.length = 500;
  writeJson(EVENTS_FILE, events);

  return result;
}

/** Check if a transition should proceed (convenience wrapper) */
export function shouldProceed(transition: HookTransition, graphId: string, nodeId?: string): boolean {
  const result = checkTransition(transition, graphId, nodeId);
  return result.outcome === 'proceed' || result.outcome === 'proceed_with_warning';
}

// ═══════════════════════════════════════════
// Retrieval
// ═══════════════════════════════════════════

export function getResultsForGraph(graphId: string): HookExecutionResult[] {
  return readJson<HookExecutionResult[]>(RESULTS_FILE, []).filter(r => r.graph_id === graphId);
}

export function getResultsForNode(nodeId: string): HookExecutionResult[] {
  return readJson<HookExecutionResult[]>(RESULTS_FILE, []).filter(r => r.node_id === nodeId);
}

export function getBlocks(opts?: { domain?: Domain; project_id?: string }): ExecutionBlockRecord[] {
  let blocks = readJson<ExecutionBlockRecord[]>(BLOCKS_FILE, []);
  if (opts?.domain) blocks = blocks.filter(b => b.domain === opts.domain);
  if (opts?.project_id) blocks = blocks.filter(b => b.project_id === opts.project_id);
  return blocks;
}

export function getActiveBlocks(): ExecutionBlockRecord[] {
  return readJson<ExecutionBlockRecord[]>(BLOCKS_FILE, []).filter(b => !b.resolved);
}

export function getEvents(): RuntimeGovernanceEvent[] {
  return readJson<RuntimeGovernanceEvent[]>(EVENTS_FILE, []);
}

export function getSummary(): RuntimeEnforcementSummary {
  const events = getEvents();
  const blocks = getActiveBlocks();
  const byTransition: Record<string, number> = {};
  const byLane: Record<string, number> = {};
  let totalWarnings = 0;
  let totalPauses = 0;
  let totalBlocks = 0;

  for (const e of events) {
    byTransition[e.transition] = (byTransition[e.transition] || 0) + 1;
    if (e.lane) byLane[e.lane] = (byLane[e.lane] || 0) + 1;
    if (e.outcome === 'proceed_with_warning') totalWarnings++;
    if (e.outcome === 'pause_for_escalation') totalPauses++;
    if (e.outcome === 'block' || e.outcome === 'require_override') totalBlocks++;
  }

  return {
    total_hooks: events.length,
    total_blocks: totalBlocks,
    total_warnings: totalWarnings,
    total_pauses: totalPauses,
    active_blocks: blocks.length,
    by_transition: byTransition,
    by_lane: byLane,
    created_at: new Date().toISOString(),
  };
}

module.exports = {
  checkTransition, shouldProceed,
  getResultsForGraph, getResultsForNode,
  getBlocks, getActiveBlocks, getEvents, getSummary,
};
