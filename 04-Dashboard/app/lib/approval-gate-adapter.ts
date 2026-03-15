// GPO Approval Gate Adapter — Uniform gate status interface for workflow orchestrator

import type { GateStatus } from './workflow-types';

const _callbacks: Array<(e: { workflowId: string; gateId: string; decision: 'approve' | 'reject'; by: string; at: string; reason?: string }) => void> = [];

export function registerRequiredGates(workflowId: string, gates: Array<{ gateId: string; type: string; blocking: boolean }>): void {
  // Store gate requirements — in practice this would persist to approval-gates.ts
  console.log(`[approval-gate-adapter] Registered ${gates.length} gates for workflow ${workflowId}`);
}

export function getGateStatuses(workflowId: string): Record<string, GateStatus> {
  // Check existing approval gates system
  const statuses: Record<string, GateStatus> = {};
  try {
    const ag = require('./approval-gates') as { getGatesForGraph?(id: string): any[] };
    if (ag.getGatesForGraph) {
      const gates = ag.getGatesForGraph(workflowId);
      for (const gate of gates || []) {
        statuses[gate.gate_id] = gate.status === 'approved' ? 'open'
          : gate.status === 'rejected' ? 'blocked'
          : 'blocked';
      }
    }
  } catch { /* */ }
  return statuses;
}

export function onApprovalDecision(cb: (e: { workflowId: string; gateId: string; decision: 'approve' | 'reject'; by: string; at: string; reason?: string }) => void): () => void {
  _callbacks.push(cb);
  return () => {
    const idx = _callbacks.indexOf(cb);
    if (idx >= 0) _callbacks.splice(idx, 1);
  };
}

export function emitDecision(e: { workflowId: string; gateId: string; decision: 'approve' | 'reject'; by: string; at: string; reason?: string }): void {
  for (const cb of _callbacks) {
    try { cb(e); } catch { /* */ }
  }
}

module.exports = { registerRequiredGates, getGateStatuses, onApprovalDecision, emitDecision };
