// GPO Multi-Agent Collaboration Runtime — Structured agent-to-agent sessions

import type {
  CollaborationSession, CollaborationSessionStatus, CollaborationTurn,
  AgentProposal, CollaborationRole, Provider, Domain,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const SESSIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'collaboration-sessions.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Create a collaboration session */
export function createSession(opts: {
  scope_type: string; scope_id: string;
  participants: Array<{ provider_id: Provider; role: CollaborationRole }>;
  protocol_type: string;
  domain?: Domain; project_id?: string;
}): CollaborationSession {
  const sessions = readJson<CollaborationSession[]>(SESSIONS_FILE, []);
  const session: CollaborationSession = {
    session_id: uid('cs'), scope_type: opts.scope_type, scope_id: opts.scope_id,
    domain: opts.domain, project_id: opts.project_id,
    participants: opts.participants, protocol_type: opts.protocol_type,
    status: 'open', turns: [], proposals: [],
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  sessions.unshift(session);
  if (sessions.length > 200) sessions.length = 200;
  writeJson(SESSIONS_FILE, sessions);
  return session;
}

/** Add a proposal to a session */
export function addProposal(sessionId: string, providerId: Provider, role: CollaborationRole, content: string, confidence: number, rationale: string): AgentProposal | null {
  const sessions = readJson<CollaborationSession[]>(SESSIONS_FILE, []);
  const idx = sessions.findIndex(s => s.session_id === sessionId);
  if (idx === -1) return null;

  const proposal: AgentProposal = {
    proposal_id: uid('ap'), session_id: sessionId, provider_id: providerId,
    role, content, confidence, rationale, votes_for: 0, votes_against: 0,
    created_at: new Date().toISOString(),
  };
  sessions[idx].proposals.push(proposal);
  sessions[idx].turns.push({
    turn_id: uid('ct'), provider_id: providerId, role, action: 'propose',
    content: content.slice(0, 200), confidence, created_at: new Date().toISOString(),
  });
  sessions[idx].updated_at = new Date().toISOString();
  writeJson(SESSIONS_FILE, sessions);
  return proposal;
}

/** Add a turn (critique, revise, agree, dissent, evidence) */
export function addTurn(sessionId: string, providerId: Provider, role: CollaborationRole, action: CollaborationTurn['action'], content: string, confidence: number = 70): CollaborationTurn | null {
  const sessions = readJson<CollaborationSession[]>(SESSIONS_FILE, []);
  const idx = sessions.findIndex(s => s.session_id === sessionId);
  if (idx === -1) return null;

  const turn: CollaborationTurn = {
    turn_id: uid('ct'), provider_id: providerId, role, action,
    content, confidence, created_at: new Date().toISOString(),
  };
  sessions[idx].turns.push(turn);
  sessions[idx].updated_at = new Date().toISOString();
  writeJson(SESSIONS_FILE, sessions);
  return turn;
}

function updateSession(sessionId: string, updates: Partial<CollaborationSession>): CollaborationSession | null {
  const sessions = readJson<CollaborationSession[]>(SESSIONS_FILE, []);
  const idx = sessions.findIndex(s => s.session_id === sessionId);
  if (idx === -1) return null;
  Object.assign(sessions[idx], updates, { updated_at: new Date().toISOString() });
  writeJson(SESSIONS_FILE, sessions);
  return sessions[idx];
}

export function setStatus(sessionId: string, status: CollaborationSessionStatus): CollaborationSession | null {
  return updateSession(sessionId, { status });
}

export function setConsensus(sessionId: string, consensus: CollaborationSession['consensus']): CollaborationSession | null {
  return updateSession(sessionId, { consensus, status: consensus?.level === 'blocked' ? 'unresolved' : 'consensus_reached' });
}

export function getSession(sessionId: string): CollaborationSession | null {
  return readJson<CollaborationSession[]>(SESSIONS_FILE, []).find(s => s.session_id === sessionId) || null;
}

export function getSessions(projectId?: string): CollaborationSession[] {
  const all = readJson<CollaborationSession[]>(SESSIONS_FILE, []);
  return projectId ? all.filter(s => s.project_id === projectId) : all;
}

module.exports = { createSession, addProposal, addTurn, setStatus, setConsensus, getSession, getSessions };
