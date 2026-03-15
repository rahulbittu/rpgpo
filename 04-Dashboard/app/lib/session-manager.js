"use strict";
// GPO Session Manager — Track operator sessions and activity
Object.defineProperty(exports, "__esModule", { value: true });
exports.startSession = startSession;
exports.getCurrentSession = getCurrentSession;
exports.recordAction = recordAction;
exports.recordTaskSubmit = recordTaskSubmit;
exports.recordTaskComplete = recordTaskComplete;
exports.endSession = endSession;
exports.getSessionHistory = getSessionHistory;
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const SESSIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'sessions.json');
let _currentSession = null;
function startSession() {
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
function getCurrentSession() {
    if (!_currentSession) {
        const sessions = readSessions();
        _currentSession = sessions.find(s => s.active) || null;
    }
    return _currentSession;
}
function recordAction(type) {
    if (!_currentSession)
        startSession();
    if (_currentSession) {
        _currentSession.actions++;
        _currentSession.lastActiveAt = Date.now();
        saveSession();
    }
}
function recordTaskSubmit() {
    if (!_currentSession)
        startSession();
    if (_currentSession) {
        _currentSession.tasksSubmitted++;
        _currentSession.lastActiveAt = Date.now();
        saveSession();
    }
}
function recordTaskComplete() {
    if (_currentSession) {
        _currentSession.tasksCompleted++;
        _currentSession.lastActiveAt = Date.now();
        saveSession();
    }
}
function endSession() {
    if (!_currentSession)
        return null;
    _currentSession.active = false;
    saveSession();
    const ended = _currentSession;
    _currentSession = null;
    return ended;
}
function getSessionHistory(limit) {
    return readSessions().sort((a, b) => b.startedAt - a.startedAt).slice(0, limit || 20);
}
function readSessions() {
    try {
        if (fs.existsSync(SESSIONS_FILE))
            return JSON.parse(fs.readFileSync(SESSIONS_FILE, 'utf-8'));
    }
    catch { /* */ }
    return [];
}
function saveSession() {
    if (!_currentSession)
        return;
    const sessions = readSessions();
    const idx = sessions.findIndex(s => s.id === _currentSession.id);
    if (idx >= 0)
        sessions[idx] = _currentSession;
    else
        sessions.push(_currentSession);
    if (sessions.length > 100)
        sessions.splice(0, sessions.length - 50);
    const dir = path.dirname(SESSIONS_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SESSIONS_FILE, JSON.stringify(sessions, null, 2));
}
module.exports = { startSession, getCurrentSession, recordAction, recordTaskSubmit, recordTaskComplete, endSession, getSessionHistory };
//# sourceMappingURL=session-manager.js.map