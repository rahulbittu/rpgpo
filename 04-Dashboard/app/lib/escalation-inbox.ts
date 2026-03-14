// GPO Escalation Inbox — Unified inbox for escalation events requiring human attention

import type {
  EscalationInboxItem, EscalationThreadEntry, InboxItemStatus, Domain,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const INBOX_FILE = path.resolve(__dirname, '..', '..', 'state', 'escalation-inbox.json');

function uid(): string { return 'ei_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Create an inbox item */
export function createItem(opts: {
  source_type: string;
  source_id: string;
  title: string;
  detail: string;
  severity?: EscalationInboxItem['severity'];
  domain?: Domain;
  project_id?: string;
}): EscalationInboxItem {
  const inbox = readJson<EscalationInboxItem[]>(INBOX_FILE, []);
  const item: EscalationInboxItem = {
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
  if (inbox.length > 300) inbox.length = 300;
  writeJson(INBOX_FILE, inbox);
  return item;
}

/** Get inbox items with optional filters */
export function getInbox(filters?: { status?: InboxItemStatus; domain?: Domain }): EscalationInboxItem[] {
  let all = readJson<EscalationInboxItem[]>(INBOX_FILE, []);
  if (filters?.status) all = all.filter(i => i.status === filters.status);
  if (filters?.domain) all = all.filter(i => i.domain === filters.domain);
  return all;
}

export function getNew(): EscalationInboxItem[] { return getInbox({ status: 'new' }); }

export function getItem(itemId: string): EscalationInboxItem | null {
  return readJson<EscalationInboxItem[]>(INBOX_FILE, []).find(i => i.item_id === itemId) || null;
}

function updateItem(itemId: string, status: InboxItemStatus, actor: string, action: string, notes: string = ''): EscalationInboxItem | null {
  const inbox = readJson<EscalationInboxItem[]>(INBOX_FILE, []);
  const idx = inbox.findIndex(i => i.item_id === itemId);
  if (idx === -1) return null;
  inbox[idx].status = status;
  inbox[idx].updated_at = new Date().toISOString();
  inbox[idx].thread.push({ actor, action, notes, created_at: new Date().toISOString() });
  writeJson(INBOX_FILE, inbox);
  // Part 45: Auto-emit telemetry
  try { const tw = require('./telemetry-wiring') as { emitTelemetry(c: string, a: string, o: string): void }; tw.emitTelemetry('escalation_workflow', `escalation_${action}`, 'success'); } catch { /* */ }
  return inbox[idx];
}

export function triageItem(itemId: string, notes: string = ''): EscalationInboxItem | null {
  return updateItem(itemId, 'triaged', 'operator', 'triaged', notes);
}

export function resolveItem(itemId: string, notes: string = ''): EscalationInboxItem | null {
  return updateItem(itemId, 'resolved', 'operator', 'resolved', notes);
}

export function delegateItem(itemId: string, delegateTo: string, notes: string = ''): EscalationInboxItem | null {
  const item = updateItem(itemId, 'delegated', 'operator', 'delegated', `Delegated to ${delegateTo}. ${notes}`);
  if (item) item.owner = delegateTo;
  if (item) {
    const inbox = readJson<EscalationInboxItem[]>(INBOX_FILE, []);
    const idx = inbox.findIndex(i => i.item_id === itemId);
    if (idx >= 0) { inbox[idx].owner = delegateTo; writeJson(INBOX_FILE, inbox); }
  }
  return item;
}

export function dismissItem(itemId: string, notes: string = ''): EscalationInboxItem | null {
  return updateItem(itemId, 'dismissed', 'operator', 'dismissed', notes);
}

module.exports = { createItem, getInbox, getNew, getItem, triageItem, resolveItem, delegateItem, dismissItem };
