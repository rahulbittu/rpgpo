// GPO Agent Consensus — Compute consensus from votes, preserve dissent

import type {
  ConsensusDecision, ConsensusLevel, AgentVote, CollaborationDissentRecord,
  Provider, CollaborationRole,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const VOTES_FILE = path.resolve(__dirname, '..', '..', 'state', 'agent-votes.json');
const DISSENT_FILE = path.resolve(__dirname, '..', '..', 'state', 'dissent-records.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Record a vote */
export function recordVote(sessionId: string, proposalId: string, providerId: Provider, vote: 'for' | 'against' | 'abstain', confidence: number = 70, rationale: string = ''): AgentVote {
  const votes = readJson<AgentVote[]>(VOTES_FILE, []);
  const v: AgentVote = {
    vote_id: uid('av'), session_id: sessionId, proposal_id: proposalId,
    provider_id: providerId, vote, confidence, rationale,
    created_at: new Date().toISOString(),
  };
  votes.unshift(v);
  if (votes.length > 500) votes.length = 500;
  writeJson(VOTES_FILE, votes);

  // Update proposal vote counts in session
  try {
    const cr = require('./collaboration-runtime') as { getSession(id: string): import('./types').CollaborationSession | null };
    const session = cr.getSession(sessionId);
    if (session) {
      const prop = session.proposals.find(p => p.proposal_id === proposalId);
      if (prop) {
        if (vote === 'for') prop.votes_for++;
        else if (vote === 'against') prop.votes_against++;
      }
    }
  } catch { /* */ }

  return v;
}

/** Record a dissent */
export function recordDissent(sessionId: string, providerId: Provider, role: CollaborationRole, reason: string, proposalOpposedId: string, alternative?: string): CollaborationDissentRecord {
  const records = readJson<CollaborationDissentRecord[]>(DISSENT_FILE, []);
  const d: CollaborationDissentRecord = {
    dissent_id: uid('ds'), session_id: sessionId, provider_id: providerId,
    role, dissent_reason: reason, proposal_opposed_id: proposalOpposedId,
    alternative_proposal: alternative, created_at: new Date().toISOString(),
  };
  records.unshift(d);
  if (records.length > 300) records.length = 300;
  writeJson(DISSENT_FILE, records);
  return d;
}

/** Compute consensus for a session */
export function computeConsensus(sessionId: string): ConsensusDecision {
  const votes = readJson<AgentVote[]>(VOTES_FILE, []).filter(v => v.session_id === sessionId);
  const totalVotes = votes.length;
  const votesFor = votes.filter(v => v.vote === 'for').length;
  const votesAgainst = votes.filter(v => v.vote === 'against').length;
  const abstentions = votes.filter(v => v.vote === 'abstain').length;

  // Find most-voted proposal
  const proposalVotes: Record<string, number> = {};
  for (const v of votes.filter(v => v.vote === 'for')) {
    proposalVotes[v.proposal_id] = (proposalVotes[v.proposal_id] || 0) + 1;
  }
  const topProposal = Object.entries(proposalVotes).sort((a, b) => b[1] - a[1])[0];

  let level: ConsensusLevel = 'blocked';
  let rationale = 'No votes cast';

  if (totalVotes === 0) {
    level = 'blocked'; rationale = 'No votes cast';
  } else if (votesAgainst === 0 && abstentions === 0) {
    level = 'unanimous'; rationale = 'All agents agree';
  } else if (votesFor > votesAgainst) {
    level = 'majority'; rationale = `${votesFor}/${totalVotes} in favor`;
  } else if (votesFor === votesAgainst) {
    level = 'split'; rationale = 'Evenly split — needs tiebreaker';
  } else {
    level = 'blocked'; rationale = `${votesAgainst}/${totalVotes} against`;
  }

  const consensus: ConsensusDecision = {
    session_id: sessionId, level,
    winning_proposal_id: topProposal?.[0],
    total_votes: totalVotes, votes_for: votesFor,
    votes_against: votesAgainst, abstentions,
    rationale, created_at: new Date().toISOString(),
  };

  // Store consensus in session
  try {
    const cr = require('./collaboration-runtime') as { setConsensus(id: string, c: ConsensusDecision): unknown };
    cr.setConsensus(sessionId, consensus);
  } catch { /* */ }

  return consensus;
}

export function getVotesForSession(sessionId: string): AgentVote[] {
  return readJson<AgentVote[]>(VOTES_FILE, []).filter(v => v.session_id === sessionId);
}

export function getDissentForSession(sessionId: string): CollaborationDissentRecord[] {
  return readJson<CollaborationDissentRecord[]>(DISSENT_FILE, []).filter(d => d.session_id === sessionId);
}

module.exports = { recordVote, recordDissent, computeConsensus, getVotesForSession, getDissentForSession };
