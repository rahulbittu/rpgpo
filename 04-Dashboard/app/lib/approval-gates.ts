// GPO Approval Gates — Structured gate points in execution graphs
// Gate types: operator, board_recheck, privacy_policy, mission_alignment, release
// Lane-aware defaults: dev lighter, beta medium, prod stricter

import type {
  Domain, Lane, GateType, GateStatus, ApprovalGate, RiskLevel,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const GATES_FILE = path.resolve(__dirname, '..', '..', 'state', 'approval-gates.json');

function uid(): string {
  return 'ag_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function readGates(): ApprovalGate[] {
  try {
    if (!fs.existsSync(GATES_FILE)) return [];
    return JSON.parse(fs.readFileSync(GATES_FILE, 'utf-8'));
  } catch { return []; }
}

function writeGates(gates: ApprovalGate[]): void {
  const dir = path.dirname(GATES_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (gates.length > 500) gates.length = 500;
  fs.writeFileSync(GATES_FILE, JSON.stringify(gates, null, 2));
}

// ═══════════════════════════════════════════
// Lane-Aware Gate Defaults
// ═══════════════════════════════════════════

interface GateTemplate {
  gate_type: GateType;
  title: string;
  description: string;
  blocking: boolean;
}

/** Default gates for dev lane — lighter governance */
const DEV_GATES: GateTemplate[] = [
  { gate_type: 'operator', title: 'Operator Review', description: 'Quick review before execution', blocking: false },
];

/** Default gates for beta lane — medium governance */
const BETA_GATES: GateTemplate[] = [
  { gate_type: 'operator', title: 'Operator Approval', description: 'Operator must approve before promotion', blocking: true },
  { gate_type: 'mission_alignment', title: 'Mission Alignment Check', description: 'Verify work aligns with mission statement', blocking: false },
  { gate_type: 'privacy_policy', title: 'Privacy Review', description: 'Ensure no privacy policy violations', blocking: true },
];

/** Default gates for prod lane — strictest governance */
const PROD_GATES: GateTemplate[] = [
  { gate_type: 'operator', title: 'Operator Final Approval', description: 'Explicit operator sign-off required', blocking: true },
  { gate_type: 'board_recheck', title: 'Board Recheck', description: 'Board must reconfirm recommendation', blocking: true },
  { gate_type: 'mission_alignment', title: 'Mission Alignment Verification', description: 'Full mission alignment review', blocking: true },
  { gate_type: 'privacy_policy', title: 'Privacy Policy Audit', description: 'Complete privacy audit before production', blocking: true },
  { gate_type: 'release', title: 'Release Gate', description: 'Release readiness confirmation', blocking: true },
];

function getDefaultGates(lane: Lane): GateTemplate[] {
  switch (lane) {
    case 'dev': return DEV_GATES;
    case 'beta': return BETA_GATES;
    case 'prod': return PROD_GATES;
    default: return DEV_GATES;
  }
}

/** Additional gates triggered by risk level */
function getRiskGates(riskLevel: RiskLevel, lane: Lane): GateTemplate[] {
  const extra: GateTemplate[] = [];
  if (riskLevel === 'red') {
    extra.push({ gate_type: 'operator', title: 'Red Risk Approval', description: 'High-risk work requires explicit operator approval', blocking: true });
    if (lane !== 'dev') {
      extra.push({ gate_type: 'board_recheck', title: 'Board Recheck (Red Risk)', description: 'Board must reconfirm due to red risk', blocking: true });
    }
  } else if (riskLevel === 'yellow' && lane !== 'dev') {
    extra.push({ gate_type: 'operator', title: 'Yellow Risk Review', description: 'Medium-risk work needs operator review', blocking: lane === 'prod' });
  }
  return extra;
}

// ═══════════════════════════════════════════
// Gate CRUD
// ═══════════════════════════════════════════

/** Create a single approval gate */
export function createGate(opts: {
  graph_id: string;
  node_id?: string;
  gate_type: GateType;
  title: string;
  description: string;
  blocking: boolean;
  lane: Lane;
}): ApprovalGate {
  const gates = readGates();
  const gate: ApprovalGate = {
    gate_id: uid(),
    graph_id: opts.graph_id,
    node_id: opts.node_id,
    gate_type: opts.gate_type,
    title: opts.title,
    description: opts.description,
    blocking: opts.blocking,
    lane: opts.lane,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  gates.unshift(gate);
  writeGates(gates);
  return gate;
}

/** Attach default gates to a graph based on lane and risk */
export function attachDefaultGates(graphId: string, lane: Lane, riskLevel: RiskLevel = 'green'): ApprovalGate[] {
  const templates = [...getDefaultGates(lane), ...getRiskGates(riskLevel, lane)];
  const created: ApprovalGate[] = [];

  // Deduplicate by gate_type + title
  const seen = new Set<string>();
  for (const tmpl of templates) {
    const key = `${tmpl.gate_type}:${tmpl.title}`;
    if (seen.has(key)) continue;
    seen.add(key);

    const gate = createGate({
      graph_id: graphId,
      gate_type: tmpl.gate_type,
      title: tmpl.title,
      description: tmpl.description,
      blocking: tmpl.blocking,
      lane,
    });
    created.push(gate);
  }

  // Update graph with gate IDs
  try {
    const graphs = require('./execution-graph') as { updateGraph(id: string, u: Record<string, unknown>): unknown };
    graphs.updateGraph(graphId, { approval_gates: created.map(g => g.gate_id) });
  } catch { /* graph module not loaded */ }

  return created;
}

/** Get all gates for a graph */
export function getGatesForGraph(graphId: string): ApprovalGate[] {
  return readGates().filter(g => g.graph_id === graphId);
}

/** Get a specific gate */
export function getGate(gateId: string): ApprovalGate | null {
  return readGates().find(g => g.gate_id === gateId) || null;
}

/** Get all pending blocking gates for a graph */
export function getPendingBlockingGates(graphId: string): ApprovalGate[] {
  return readGates().filter(g => g.graph_id === graphId && g.blocking && g.status === 'pending');
}

/** Check if all blocking gates are cleared */
export function areBlockingGatesCleared(graphId: string): boolean {
  return getPendingBlockingGates(graphId).length === 0;
}

// ═══════════════════════════════════════════
// Gate Actions — approve / reject / waive
// ═══════════════════════════════════════════

function resolveGate(gateId: string, status: GateStatus, resolvedBy: string, notes?: string): ApprovalGate | null {
  const gates = readGates();
  const idx = gates.findIndex(g => g.gate_id === gateId);
  if (idx === -1) return null;
  if (gates[idx].status !== 'pending') return null;

  gates[idx].status = status;
  gates[idx].resolved_by = resolvedBy;
  gates[idx].resolved_at = new Date().toISOString();
  if (notes) gates[idx].resolution_notes = notes;
  writeGates(gates);
  return gates[idx];
}

export function approveGate(gateId: string, resolvedBy: string = 'operator', notes?: string): ApprovalGate | null {
  return resolveGate(gateId, 'approved', resolvedBy, notes);
}

export function rejectGate(gateId: string, resolvedBy: string = 'operator', notes?: string): ApprovalGate | null {
  return resolveGate(gateId, 'rejected', resolvedBy, notes);
}

export function waiveGate(gateId: string, resolvedBy: string = 'operator', notes?: string): ApprovalGate | null {
  return resolveGate(gateId, 'waived', resolvedBy, notes);
}

module.exports = {
  createGate, attachDefaultGates,
  getGatesForGraph, getGate, getPendingBlockingGates, areBlockingGatesCleared,
  approveGate, rejectGate, waiveGate,
};
