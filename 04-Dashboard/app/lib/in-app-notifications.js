"use strict";
// GPO In-App Notifications — Part 73: Operator notification engine with persistence
Object.defineProperty(exports, "__esModule", { value: true });
exports.emitNotification = emitNotification;
exports.listNotifications = listNotifications;
exports.ackNotifications = ackNotifications;
exports.markRead = markRead;
exports.getBadgeCounts = getBadgeCounts;
exports.resetForTest = resetForTest;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const STATE_FILE = path.resolve(__dirname, '..', '..', 'state', 'in-app-notifications.json');
const MAX_NOTIFICATIONS = 2000;
let _notifications = [];
let _loaded = false;
const _recentKeys = new Map();
function load() {
    if (_loaded)
        return;
    try {
        if (fs.existsSync(STATE_FILE))
            _notifications = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
    }
    catch {
        _notifications = [];
    }
    _loaded = true;
}
function save() {
    if (_notifications.length > MAX_NOTIFICATIONS)
        _notifications = _notifications.slice(-MAX_NOTIFICATIONS);
    try {
        const dir = path.dirname(STATE_FILE);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(STATE_FILE, JSON.stringify(_notifications, null, 2));
    }
    catch { /* non-fatal */ }
}
function emitNotification(input) {
    load();
    const dedupKey = `${input.type}:${input.title}`;
    const lastEmit = _recentKeys.get(dedupKey);
    if (lastEmit && Date.now() - lastEmit < 60000)
        return '';
    _recentKeys.set(dedupKey, Date.now());
    const hash = crypto.createHash('sha256').update(`${input.type}:${input.title}:${input.message}`).digest('hex').slice(0, 8);
    const id = `notif_${Date.now().toString(36)}_${hash}`;
    _notifications.push({
        id, type: input.type, severity: input.severity,
        title: input.title, message: input.message.slice(0, 500),
        createdAt: Date.now(), actions: input.actions,
    });
    save();
    return id;
}
function listNotifications(since, limit) {
    load();
    let results = [..._notifications];
    if (since)
        results = results.filter(n => n.createdAt >= since);
    results.sort((a, b) => b.createdAt - a.createdAt);
    return results.slice(0, Math.min(limit || 50, 100));
}
function ackNotifications(ids) {
    load();
    const acked = [];
    for (const id of ids) {
        const n = _notifications.find(n => n.id === id);
        if (n && !n.acknowledgedAt) {
            n.acknowledgedAt = Date.now();
            acked.push(id);
        }
    }
    if (acked.length)
        save();
    return { acknowledged: acked };
}
function markRead(ids) {
    load();
    const read = [];
    for (const id of ids) {
        const n = _notifications.find(n => n.id === id);
        if (n && !n.readAt) {
            n.readAt = Date.now();
            read.push(id);
        }
    }
    if (read.length)
        save();
    return { read };
}
function getBadgeCounts() {
    load();
    const unread = _notifications.filter(n => !n.readAt).length;
    let unackedAlerts = 0;
    try {
        const alerts = require('./structured-io-alerts');
        unackedAlerts = alerts.listActiveAlerts().length;
    }
    catch { /* */ }
    let pendingApprovals = 0;
    try {
        const cos = require('./chief-of-staff');
        if (cos.getDeliverableApprovalRequests) {
            pendingApprovals = cos.getDeliverableApprovalRequests().filter((r) => r.status === 'pending').length;
        }
    }
    catch { /* */ }
    return { unread: Math.min(unread, 99), unackedAlerts, pendingApprovals };
}
function resetForTest() {
    _notifications = [];
    _loaded = true;
    _recentKeys.clear();
}
module.exports = { emitNotification, listNotifications, ackNotifications, markRead, getBadgeCounts, resetForTest };
//# sourceMappingURL=in-app-notifications.js.map