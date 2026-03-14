// GPO Negotiation Protocols — Define how agents resolve disagreement

import type {
  NegotiationProtocol, NegotiationProtocolType, NegotiationRound,
  NegotiationOutcome, NegotiationOutcomeType,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const PROTOCOLS_FILE = path.resolve(__dirname, '..', '..', 'state', 'negotiation-protocols.json');

function uid(): string { return 'np_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

function defaultProtocols(): NegotiationProtocol[] {
  return [
    { protocol_id: 'np_compare', protocol_type: 'proposal_compare', max_rounds: 1, requires_evidence: false, escalation_on_deadlock: false, created_at: new Date().toISOString() },
    { protocol_id: 'np_critique', protocol_type: 'critique_and_revise', max_rounds: 3, requires_evidence: false, escalation_on_deadlock: true, created_at: new Date().toISOString() },
    { protocol_id: 'np_evidence', protocol_type: 'evidence_challenge', max_rounds: 2, requires_evidence: true, escalation_on_deadlock: true, created_at: new Date().toISOString() },
    { protocol_id: 'np_tiebreak', protocol_type: 'tie_break', max_rounds: 1, requires_evidence: false, escalation_on_deadlock: true, created_at: new Date().toISOString() },
    { protocol_id: 'np_consensus', protocol_type: 'consensus_required', max_rounds: 3, requires_evidence: true, escalation_on_deadlock: true, created_at: new Date().toISOString() },
    { protocol_id: 'np_majority', protocol_type: 'majority_vote', max_rounds: 1, requires_evidence: false, escalation_on_deadlock: false, created_at: new Date().toISOString() },
    { protocol_id: 'np_reopen', protocol_type: 'board_reopen', max_rounds: 1, requires_evidence: true, escalation_on_deadlock: true, created_at: new Date().toISOString() },
  ];
}

export function getProtocols(): NegotiationProtocol[] {
  const stored = readJson<NegotiationProtocol[]>(PROTOCOLS_FILE, []);
  return stored.length > 0 ? stored : defaultProtocols();
}

export function getProtocol(protocolType: NegotiationProtocolType): NegotiationProtocol | null {
  return getProtocols().find(p => p.protocol_type === protocolType) || null;
}

/** Run a negotiation on a session and produce an outcome */
export function runNegotiation(sessionId: string): NegotiationOutcome | null {
  try {
    const cr = require('./collaboration-runtime') as { getSession(id: string): import('./types').CollaborationSession | null; setStatus(id: string, s: string): unknown };
    const session = cr.getSession(sessionId);
    if (!session) return null;

    cr.setStatus(sessionId, 'negotiating');
    const protocol = getProtocol(session.protocol_type as NegotiationProtocolType);
    const proposals = session.proposals;

    let outcomeType: NegotiationOutcomeType = 'unresolved';
    let winningId: string | undefined;
    let reason = 'No proposals to evaluate';

    if (proposals.length === 0) {
      outcomeType = 'unresolved';
      reason = 'No proposals submitted';
    } else if (proposals.length === 1) {
      outcomeType = 'accepted';
      winningId = proposals[0].proposal_id;
      reason = 'Single proposal accepted by default';
    } else {
      // Compare proposals by confidence and votes
      const sorted = [...proposals].sort((a, b) => (b.confidence + b.votes_for) - (a.confidence + a.votes_for));
      const top = sorted[0];
      const second = sorted[1];
      const gap = (top.confidence + top.votes_for) - (second.confidence + second.votes_for);

      if (gap >= 20) {
        outcomeType = 'accepted';
        winningId = top.proposal_id;
        reason = `Proposal "${top.content.slice(0, 40)}" wins by confidence margin ${gap}`;
      } else if (protocol?.escalation_on_deadlock) {
        outcomeType = 'escalate_board';
        reason = `Proposals too close (gap ${gap}) — escalating to Board`;
      } else {
        outcomeType = 'revision_required';
        reason = `Proposals too close (gap ${gap}) — revision needed`;
      }
    }

    const outcome: NegotiationOutcome = {
      session_id: sessionId, protocol_type: session.protocol_type as NegotiationProtocolType,
      rounds_completed: 1, outcome: outcomeType,
      winning_proposal_id: winningId, reason,
      created_at: new Date().toISOString(),
    };

    return outcome;
  } catch { return null; }
}

export function createProtocol(opts: Omit<NegotiationProtocol, 'protocol_id' | 'created_at'>): NegotiationProtocol {
  const protocols = getProtocols();
  const p: NegotiationProtocol = { ...opts, protocol_id: uid(), created_at: new Date().toISOString() };
  protocols.unshift(p);
  writeJson(PROTOCOLS_FILE, protocols);
  return p;
}

module.exports = { getProtocols, getProtocol, runNegotiation, createProtocol };
