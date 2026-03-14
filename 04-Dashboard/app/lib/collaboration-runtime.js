"use strict";
// GPO Multi-Agent Collaboration Runtime — Structured agent-to-agent sessions
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSession = createSession;
exports.addProposal = addProposal;
exports.addTurn = addTurn;
exports.setStatus = setStatus;
exports.setConsensus = setConsensus;
exports.getSession = getSession;
exports.getSessions = getSessions;
const fs = require('fs');
const path = require('path');
const SESSIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'collaboration-sessions.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Create a collaboration session */
function createSession(opts) {
    const sessions = readJson(SESSIONS_FILE, []);
    const session = {
        session_id: uid('cs'), scope_type: opts.scope_type, scope_id: opts.scope_id,
        domain: opts.domain, project_id: opts.project_id,
        participants: opts.participants, protocol_type: opts.protocol_type,
        status: 'open', turns: [], proposals: [],
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    sessions.unshift(session);
    if (sessions.length > 200)
        sessions.length = 200;
    writeJson(SESSIONS_FILE, sessions);
    return session;
}
/** Add a proposal to a session */
function addProposal(sessionId, providerId, role, content, confidence, rationale) {
    const sessions = readJson(SESSIONS_FILE, []);
    const idx = sessions.findIndex(s => s.session_id === sessionId);
    if (idx === -1)
        return null;
    const proposal = {
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
function addTurn(sessionId, providerId, role, action, content, confidence = 70) {
    const sessions = readJson(SESSIONS_FILE, []);
    const idx = sessions.findIndex(s => s.session_id === sessionId);
    if (idx === -1)
        return null;
    const turn = {
        turn_id: uid('ct'), provider_id: providerId, role, action,
        content, confidence, created_at: new Date().toISOString(),
    };
    sessions[idx].turns.push(turn);
    sessions[idx].updated_at = new Date().toISOString();
    writeJson(SESSIONS_FILE, sessions);
    return turn;
}
function updateSession(sessionId, updates) {
    const sessions = readJson(SESSIONS_FILE, []);
    const idx = sessions.findIndex(s => s.session_id === sessionId);
    if (idx === -1)
        return null;
    Object.assign(sessions[idx], updates, { updated_at: new Date().toISOString() });
    writeJson(SESSIONS_FILE, sessions);
    return sessions[idx];
}
function setStatus(sessionId, status) {
    return updateSession(sessionId, { status });
}
function setConsensus(sessionId, consensus) {
    return updateSession(sessionId, { consensus, status: consensus?.level === 'blocked' ? 'unresolved' : 'consensus_reached' });
}
function getSession(sessionId) {
    return readJson(SESSIONS_FILE, []).find(s => s.session_id === sessionId) || null;
}
function getSessions(projectId) {
    const all = readJson(SESSIONS_FILE, []);
    return projectId ? all.filter(s => s.project_id === projectId) : all;
}
module.exports = { createSession, addProposal, addTurn, setStatus, setConsensus, getSession, getSessions };
//# sourceMappingURL=collaboration-runtime.js.map