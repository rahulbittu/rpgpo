// GPO Conversation — Per-task conversation lifecycle and persistence

import type { ConversationThread, ConversationMessage, ConversationRole } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const CONV_DIR = path.resolve(__dirname, '..', '..', 'state', 'task-conversations');

function ensureDir(): void { if (!fs.existsSync(CONV_DIR)) fs.mkdirSync(CONV_DIR, { recursive: true }); }

function convFile(taskId: string): string { return path.join(CONV_DIR, `${taskId}.json`); }

function msgId(taskId: string, content: string): string {
  return 'msg_' + crypto.createHash('sha256').update(`${taskId}:${Date.now()}:${content.slice(0, 50)}`).digest('hex').slice(0, 12);
}

export function openConversation(taskId: string): ConversationThread {
  ensureDir();
  const file = convFile(taskId);
  if (fs.existsSync(file)) return JSON.parse(fs.readFileSync(file, 'utf-8'));
  const thread: ConversationThread = {
    taskId,
    openedAt: new Date().toISOString(),
    messages: [],
    status: 'open',
  };
  fs.writeFileSync(file, JSON.stringify(thread, null, 2));
  return thread;
}

export function appendMessage(taskId: string, role: ConversationRole, content: string, meta?: ConversationMessage['meta']): ConversationMessage {
  const thread = openConversation(taskId);
  const msg: ConversationMessage = {
    id: msgId(taskId, content),
    taskId,
    createdAt: new Date().toISOString(),
    role,
    content: content.slice(0, 10000),
    contentFormat: content.startsWith('{') ? 'json' : content.includes('#') ? 'markdown' : 'text',
    meta,
  };
  thread.messages.push(msg);
  if (thread.messages.length > 200) thread.messages = thread.messages.slice(-150);
  fs.writeFileSync(convFile(taskId), JSON.stringify(thread, null, 2));
  return msg;
}

export function getConversation(taskId: string): ConversationThread | null {
  const file = convFile(taskId);
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return null; }
}

export function closeConversation(taskId: string): void {
  const thread = getConversation(taskId);
  if (!thread) return;
  thread.status = 'closed';
  fs.writeFileSync(convFile(taskId), JSON.stringify(thread, null, 2));
}

export function listConversations(): string[] {
  ensureDir();
  return fs.readdirSync(CONV_DIR)
    .filter((f: string) => f.endsWith('.json'))
    .map((f: string) => f.replace('.json', ''));
}

module.exports = { openConversation, appendMessage, getConversation, closeConversation, listConversations };
