"use strict";
// GPO Conversation — Per-task conversation lifecycle and persistence
Object.defineProperty(exports, "__esModule", { value: true });
exports.openConversation = openConversation;
exports.appendMessage = appendMessage;
exports.getConversation = getConversation;
exports.closeConversation = closeConversation;
exports.listConversations = listConversations;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const CONV_DIR = path.resolve(__dirname, '..', '..', 'state', 'task-conversations');
function ensureDir() { if (!fs.existsSync(CONV_DIR))
    fs.mkdirSync(CONV_DIR, { recursive: true }); }
function convFile(taskId) { return path.join(CONV_DIR, `${taskId}.json`); }
function msgId(taskId, content) {
    return 'msg_' + crypto.createHash('sha256').update(`${taskId}:${Date.now()}:${content.slice(0, 50)}`).digest('hex').slice(0, 12);
}
function openConversation(taskId) {
    ensureDir();
    const file = convFile(taskId);
    if (fs.existsSync(file))
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    const thread = {
        taskId,
        openedAt: new Date().toISOString(),
        messages: [],
        status: 'open',
    };
    fs.writeFileSync(file, JSON.stringify(thread, null, 2));
    return thread;
}
function appendMessage(taskId, role, content, meta) {
    const thread = openConversation(taskId);
    const msg = {
        id: msgId(taskId, content),
        taskId,
        createdAt: new Date().toISOString(),
        role,
        content: content.slice(0, 10000),
        contentFormat: content.startsWith('{') ? 'json' : content.includes('#') ? 'markdown' : 'text',
        meta,
    };
    thread.messages.push(msg);
    if (thread.messages.length > 200)
        thread.messages = thread.messages.slice(-150);
    fs.writeFileSync(convFile(taskId), JSON.stringify(thread, null, 2));
    return msg;
}
function getConversation(taskId) {
    const file = convFile(taskId);
    if (!fs.existsSync(file))
        return null;
    try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    catch {
        return null;
    }
}
function closeConversation(taskId) {
    const thread = getConversation(taskId);
    if (!thread)
        return;
    thread.status = 'closed';
    fs.writeFileSync(convFile(taskId), JSON.stringify(thread, null, 2));
}
function listConversations() {
    ensureDir();
    return fs.readdirSync(CONV_DIR)
        .filter((f) => f.endsWith('.json'))
        .map((f) => f.replace('.json', ''));
}
module.exports = { openConversation, appendMessage, getConversation, closeConversation, listConversations };
//# sourceMappingURL=conversation.js.map