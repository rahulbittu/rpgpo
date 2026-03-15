"use strict";
// GPO Integration Gateway — Inbound/outbound webhook system with event routing
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSubscription = createSubscription;
exports.listSubscriptions = listSubscriptions;
exports.getSubscription = getSubscription;
exports.deleteSubscription = deleteSubscription;
exports.processInboundEvent = processInboundEvent;
exports.deliverOutbound = deliverOutbound;
exports.listEvents = listEvents;
exports.verifySignature = verifySignature;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const GATEWAY_DIR = path.resolve(__dirname, '..', '..', 'state', 'integrations');
const SUBSCRIPTIONS_FILE = path.join(GATEWAY_DIR, 'subscriptions.json');
const EVENTS_FILE = path.join(GATEWAY_DIR, 'events.json');
const DELIVERIES_FILE = path.join(GATEWAY_DIR, 'deliveries.json');
function ensureDir() { if (!fs.existsSync(GATEWAY_DIR))
    fs.mkdirSync(GATEWAY_DIR, { recursive: true }); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { ensureDir(); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
// ── Subscriptions ──
function createSubscription(data) {
    const subs = readJson(SUBSCRIPTIONS_FILE, []);
    const sub = {
        id: 'wsub_' + crypto.randomBytes(4).toString('hex'),
        name: data.name || 'Untitled',
        type: data.type || 'inbound',
        connector: data.connector || 'generic',
        eventFilter: data.eventFilter,
        action: data.action,
        destination: data.destination,
        secret: data.secret || crypto.randomBytes(16).toString('hex'),
        enabled: data.enabled ?? true,
        createdAt: Date.now(),
    };
    subs.push(sub);
    writeJson(SUBSCRIPTIONS_FILE, subs);
    return sub;
}
function listSubscriptions() {
    return readJson(SUBSCRIPTIONS_FILE, []);
}
function getSubscription(id) {
    return listSubscriptions().find(s => s.id === id) || null;
}
function deleteSubscription(id) {
    const subs = readJson(SUBSCRIPTIONS_FILE, []);
    const idx = subs.findIndex(s => s.id === id);
    if (idx < 0)
        return false;
    subs.splice(idx, 1);
    writeJson(SUBSCRIPTIONS_FILE, subs);
    return true;
}
// ── Inbound Event Processing ──
function processInboundEvent(subscriptionId, payload) {
    const sub = getSubscription(subscriptionId);
    if (!sub || !sub.enabled)
        return { eventId: '' };
    const event = {
        id: 'wevt_' + crypto.randomBytes(4).toString('hex'),
        subscriptionId,
        direction: 'inbound',
        connector: sub.connector,
        eventType: sub.eventFilter || 'generic',
        payload,
        status: 'received',
        createdAt: Date.now(),
    };
    // Process action
    if (sub.action) {
        try {
            if (sub.action.type === 'create_task') {
                const intake = require('./intake');
                const queue = require('./queue');
                const prompt = sub.action.prompt || payload.text || payload.message || JSON.stringify(payload).slice(0, 500);
                const task = intake.createTask({ raw_request: prompt, domain: sub.action.domain || 'general', urgency: 'normal' });
                queue.addTask('deliberate', `Deliberate (webhook): ${task.title}`, { taskId: task.task_id, autoApprove: true });
                event.status = 'processed';
                recordEvent(event);
                return { eventId: event.id, action: 'task_created:' + task.task_id };
            }
        }
        catch (e) {
            event.status = 'failed';
            event.error = e.message?.slice(0, 200);
        }
    }
    event.status = event.status === 'received' ? 'processed' : event.status;
    recordEvent(event);
    return { eventId: event.id };
}
// ── Outbound Delivery ──
function deliverOutbound(subscriptionId, payload) {
    const sub = getSubscription(subscriptionId);
    if (!sub || !sub.enabled || !sub.destination)
        return { deliveryId: '' };
    const event = {
        id: 'wdlv_' + crypto.randomBytes(4).toString('hex'),
        subscriptionId,
        direction: 'outbound',
        connector: sub.connector,
        eventType: 'delivery',
        payload,
        status: 'delivered',
        createdAt: Date.now(),
    };
    // Send to destination
    if (sub.destination.url) {
        try {
            // Fire-and-forget webhook delivery
            const body = JSON.stringify(payload);
            const url = new URL(sub.destination.url);
            const req = https.request({
                hostname: url.hostname,
                path: url.pathname,
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(body), ...(sub.destination.headers || {}) },
            });
            req.on('error', () => { });
            req.write(body);
            req.end();
        }
        catch {
            event.status = 'failed';
        }
    }
    recordEvent(event);
    return { deliveryId: event.id };
}
// ── Event History ──
function recordEvent(event) {
    const events = readJson(EVENTS_FILE, []);
    events.push(event);
    if (events.length > 500)
        events.splice(0, events.length - 300);
    writeJson(EVENTS_FILE, events);
}
function listEvents(limit) {
    return readJson(EVENTS_FILE, []).sort((a, b) => b.createdAt - a.createdAt).slice(0, limit || 50);
}
// ── Verify Webhook Signature ──
function verifySignature(payload, signature, secret) {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    return signature === expected || signature === 'sha256=' + expected;
}
module.exports = { createSubscription, listSubscriptions, getSubscription, deleteSubscription, processInboundEvent, deliverOutbound, listEvents, verifySignature };
//# sourceMappingURL=integration-gateway.js.map