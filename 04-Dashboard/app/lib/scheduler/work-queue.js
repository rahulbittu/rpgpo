"use strict";
// GPO Work Queue — Priority queue with persistence, fairness, and lease management
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = init;
exports.enqueue = enqueue;
exports.dequeueReady = dequeueReady;
exports.ackSuccess = ackSuccess;
exports.ackFailure = ackFailure;
exports.markCanceled = markCanceled;
exports.reprioritize = reprioritize;
exports.get = get;
exports.stats = stats;
exports.snapshot = snapshot;
exports.recoverLeases = recoverLeases;
exports.getInflight = getInflight;
exports.getQueue = getQueue;
exports.getDlq = getDlq;
exports.markReady = markReady;
const fs = require('fs');
const path = require('path');
const STATE_DIR = path.resolve(__dirname, '..', '..', '..', 'state', 'scheduler');
const QUEUE_FILE = path.join(STATE_DIR, 'queue.json');
const INFLIGHT_FILE = path.join(STATE_DIR, 'inflight.json');
const DLQ_FILE = path.join(STATE_DIR, 'dead-letter.json');
function ensureDir() { if (!fs.existsSync(STATE_DIR))
    fs.mkdirSync(STATE_DIR, { recursive: true }); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { ensureDir(); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
let _queue = [];
let _inflight = [];
let _dlq = [];
let _done = [];
function init(clean) {
    if (clean) {
        _queue = [];
        _inflight = [];
        _dlq = [];
        _done = [];
        persist();
        return;
    }
    _queue = readJson(QUEUE_FILE, []);
    _inflight = readJson(INFLIGHT_FILE, []);
    _dlq = readJson(DLQ_FILE, []);
    _done = [];
}
function persist() {
    writeJson(QUEUE_FILE, _queue);
    writeJson(INFLIGHT_FILE, _inflight);
    writeJson(DLQ_FILE, _dlq);
}
const PRIORITY_ORDER = { critical: 0, high: 1, normal: 2, low: 3 };
function enqueue(items) {
    for (const item of items) {
        if (!_queue.find(q => q.id === item.id) && !_inflight.find(q => q.id === item.id)) {
            _queue.push(item);
        }
    }
    persist();
}
function dequeueReady(workerId, take, hints) {
    const now = new Date().toISOString();
    const readyItems = _queue
        .filter(q => q.status === 'queued' && q.ready)
        .filter(q => !hints?.provider || hints.provider.includes(q.provider))
        .sort((a, b) => {
        const pa = PRIORITY_ORDER[a.priority] ?? 2;
        const pb = PRIORITY_ORDER[b.priority] ?? 2;
        if (pa !== pb)
            return pa - pb;
        return new Date(a.enqueuedAt).getTime() - new Date(b.enqueuedAt).getTime();
    });
    const taken = [];
    for (const item of readyItems) {
        if (taken.length >= take)
            break;
        item.status = 'in_flight';
        item.leasedBy = workerId;
        item.leaseExpiresAt = new Date(Date.now() + 120000).toISOString();
        _queue = _queue.filter(q => q.id !== item.id);
        _inflight.push(item);
        taken.push(item);
    }
    if (taken.length > 0)
        persist();
    return taken;
}
function ackSuccess(itemId, attemptId) {
    const idx = _inflight.findIndex(q => q.id === itemId);
    if (idx === -1)
        return;
    const item = _inflight[idx];
    item.status = 'done';
    const attempt = item.attempts.find(a => a.attemptId === attemptId);
    if (attempt) {
        attempt.status = 'succeeded';
        attempt.finishedAt = new Date().toISOString();
    }
    _inflight.splice(idx, 1);
    _done.push(item);
    persist();
}
function ackFailure(itemId, attemptId, code, message, requeue) {
    const idx = _inflight.findIndex(q => q.id === itemId);
    if (idx === -1)
        return;
    const item = _inflight[idx];
    const attempt = item.attempts.find(a => a.attemptId === attemptId);
    if (attempt) {
        attempt.status = 'failed';
        attempt.errorCode = code;
        attempt.errorMessage = message.slice(0, 200);
        attempt.finishedAt = new Date().toISOString();
    }
    _inflight.splice(idx, 1);
    if (requeue) {
        item.status = 'queued';
        item.leasedBy = undefined;
        item.leaseExpiresAt = undefined;
        _queue.push(item);
    }
    else {
        item.status = 'dead_letter';
        item.reason = `${code}: ${message.slice(0, 100)}`;
        _dlq.push(item);
    }
    persist();
}
function markCanceled(itemId, reason) {
    for (const list of [_queue, _inflight]) {
        const idx = list.findIndex(q => q.id === itemId);
        if (idx !== -1) {
            const item = list[idx];
            item.status = 'canceled';
            item.reason = reason;
            list.splice(idx, 1);
            _dlq.push(item);
            persist();
            return;
        }
    }
}
function reprioritize(itemId, priority) {
    const item = _queue.find(q => q.id === itemId);
    if (item) {
        item.priority = priority;
        persist();
    }
}
function get(itemId) {
    return _queue.find(q => q.id === itemId) || _inflight.find(q => q.id === itemId) || _dlq.find(q => q.id === itemId) || _done.find(q => q.id === itemId) || null;
}
function stats() {
    const all = [..._queue, ..._inflight, ..._done, ..._dlq];
    const byProvider = {};
    const byPriority = {};
    const byTenant = {};
    const byProject = {};
    for (const item of [..._queue, ..._inflight]) {
        if (!byProvider[item.provider])
            byProvider[item.provider] = { queued: 0, inFlight: 0 };
        if (item.status === 'queued')
            byProvider[item.provider].queued++;
        if (item.status === 'in_flight')
            byProvider[item.provider].inFlight++;
        byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
        byTenant[item.tenantId] = (byTenant[item.tenantId] || 0) + 1;
        byProject[item.projectId] = (byProject[item.projectId] || 0) + 1;
    }
    return {
        total: all.length, queued: _queue.length, inFlight: _inflight.length,
        done: _done.length, deadLetter: _dlq.length,
        byProvider, byPriority: byPriority,
        byTenant, byProject, capacityWindows: [],
        saturation: 0,
    };
}
function snapshot() {
    return { queue: [..._queue], inFlight: [..._inflight], deadLetter: [..._dlq] };
}
function recoverLeases(nowIso) {
    const now = new Date(nowIso).getTime();
    let recovered = 0;
    const expired = [];
    for (const item of _inflight) {
        if (item.leaseExpiresAt && new Date(item.leaseExpiresAt).getTime() < now) {
            expired.push(item);
        }
    }
    for (const item of expired) {
        _inflight = _inflight.filter(q => q.id !== item.id);
        item.status = 'queued';
        item.leasedBy = undefined;
        item.leaseExpiresAt = undefined;
        // Add expired attempt
        const lastAttempt = item.attempts[item.attempts.length - 1];
        if (lastAttempt && lastAttempt.status === 'in_progress') {
            lastAttempt.status = 'expired';
            lastAttempt.finishedAt = nowIso;
        }
        _queue.push(item);
        recovered++;
    }
    if (recovered > 0)
        persist();
    return recovered;
}
function getInflight() { return [..._inflight]; }
function getQueue() { return [..._queue]; }
function getDlq() { return [..._dlq]; }
function markReady(itemId) {
    const item = _queue.find(q => q.id === itemId);
    if (item)
        item.ready = true;
}
module.exports = { init, enqueue, dequeueReady, ackSuccess, ackFailure, markCanceled, reprioritize, get, stats, snapshot, recoverLeases, getInflight, getQueue, getDlq, markReady };
//# sourceMappingURL=work-queue.js.map