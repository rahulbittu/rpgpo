"use strict";
// GPO Escalation Inbox — Unified inbox for escalation events requiring human attention
Object.defineProperty(exports, "__esModule", { value: true });
exports.createItem = createItem;
exports.getInbox = getInbox;
exports.getNew = getNew;
exports.getItem = getItem;
exports.triageItem = triageItem;
exports.resolveItem = resolveItem;
exports.delegateItem = delegateItem;
exports.dismissItem = dismissItem;
const fs = require('fs');
const path = require('path');
const INBOX_FILE = path.resolve(__dirname, '..', '..', 'state', 'escalation-inbox.json');
function uid() { return 'ei_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Create an inbox item */
function createItem(opts) {
    const inbox = readJson(INBOX_FILE, []);
    const item = {
        item_id: uid(),
        source_type: opts.source_type,
        source_id: opts.source_id,
        title: opts.title,
        detail: opts.detail,
        severity: opts.severity || 'medium',
        status: 'new',
        domain: opts.domain,
        project_id: opts.project_id,
        thread: [{ actor: 'system', action: 'created', notes: opts.detail, created_at: new Date().toISOString() }],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };
    inbox.unshift(item);
    if (inbox.length > 300)
        inbox.length = 300;
    writeJson(INBOX_FILE, inbox);
    return item;
}
/** Get inbox items with optional filters */
function getInbox(filters) {
    let all = readJson(INBOX_FILE, []);
    if (filters?.status)
        all = all.filter(i => i.status === filters.status);
    if (filters?.domain)
        all = all.filter(i => i.domain === filters.domain);
    return all;
}
function getNew() { return getInbox({ status: 'new' }); }
function getItem(itemId) {
    return readJson(INBOX_FILE, []).find(i => i.item_id === itemId) || null;
}
function updateItem(itemId, status, actor, action, notes = '') {
    const inbox = readJson(INBOX_FILE, []);
    const idx = inbox.findIndex(i => i.item_id === itemId);
    if (idx === -1)
        return null;
    inbox[idx].status = status;
    inbox[idx].updated_at = new Date().toISOString();
    inbox[idx].thread.push({ actor, action, notes, created_at: new Date().toISOString() });
    writeJson(INBOX_FILE, inbox);
    // Part 45: Auto-emit telemetry
    try {
        const tw = require('./telemetry-wiring');
        tw.emitTelemetry('escalation_workflow', `escalation_${action}`, 'success');
    }
    catch { /* */ }
    return inbox[idx];
}
function triageItem(itemId, notes = '') {
    return updateItem(itemId, 'triaged', 'operator', 'triaged', notes);
}
function resolveItem(itemId, notes = '') {
    return updateItem(itemId, 'resolved', 'operator', 'resolved', notes);
}
function delegateItem(itemId, delegateTo, notes = '') {
    const item = updateItem(itemId, 'delegated', 'operator', 'delegated', `Delegated to ${delegateTo}. ${notes}`);
    if (item)
        item.owner = delegateTo;
    if (item) {
        const inbox = readJson(INBOX_FILE, []);
        const idx = inbox.findIndex(i => i.item_id === itemId);
        if (idx >= 0) {
            inbox[idx].owner = delegateTo;
            writeJson(INBOX_FILE, inbox);
        }
    }
    return item;
}
function dismissItem(itemId, notes = '') {
    return updateItem(itemId, 'dismissed', 'operator', 'dismissed', notes);
}
module.exports = { createItem, getInbox, getNew, getItem, triageItem, resolveItem, delegateItem, dismissItem };
//# sourceMappingURL=escalation-inbox.js.map