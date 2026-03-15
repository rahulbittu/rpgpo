// GPO Session Manager — Track operator sessions and activity

const crypto = require('crypto') as typeof import('crypto');
const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const SESSIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'sessions.json');

export interface Session {
  id: string;
  startedAt: number;
  lastActiveAt: number;
  tasksSubmitted: number;
  tasksCompleted: number;
  costUsd: number;
  actions: number;
  active: boolean;
}

let _currentSession: Session | null = null;

export function startSession(): Session {
  _currentSession = {
    id: 'sess_' + crypto.randomBytes(4).toString('hex'),
    startedAt: Date.now(),
    lastActiveAt: Date.now(),
    tasksSubmitted: 0,
    tasksCompleted: 0,
    costUsd: 0,
    actions: 0,
    active: true,
  };
  saveSession();
  return _currentSession;
}

export function getCurrentSession(): Session | null {
  if (!_currentSession) {
    const sessions = readSessions();
    _currentSession = sessions.find(s => s.active) || null;
  }
  return _currentSession;
}

export function recordAction(type?: string): void {
  if (!_currentSession) startSession();
  if (_currentSession) {
    _currentSession.actions++;
    _currentSession.lastActiveAt = Date.now();
    saveSession();
  }
}

export function recordTaskSubmit(): void {
  if (!_currentSession) startSession();
  if (_currentSession) { _currentSession.tasksSubmitted++; _currentSession.lastActiveAt = Date.now(); saveSession(); }
}

export function recordTaskComplete(): void {
  if (_currentSession) { _currentSession.tasksCompleted++; _currentSession.lastActiveAt = Date.now(); saveSession(); }
}

export function endSession(): Session | null {
  if (!_currentSession) return null;
  _currentSession.active = false;
  saveSession();
  const ended = _currentSession;
  _currentSession = null;
  return ended;
}

export function getSessionHistory(limit?: number): Session[] {
  return readSessions().sort((a, b) => b.startedAt - a.startedAt).slice(0, limit || 20);
}

function readSessions(): Session[] {
  try { if (fs.existsSync(SESSIONS_FILE)) return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8')); } catch { /* */ }
  return [];
}

function saveSession(): void {
  if (!_currentSession) return;
  const sessions = readSessions();
  const idx = sessions.findIndex(s => s.id === _currentSession!.id);
  if (idx >= 0) sessions[idx] = _currentSession;
  else sessions.push(_currentSession);
  if (sessions.length > 100) sessions.splice(0, sessions.length - 50);
  const dir = path.dirname(SESSIONS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}

module.exports = { startSession, getCurrentSession, recordAction, recordTaskSubmit, recordTaskComplete, endSession, getSessionHistory };
