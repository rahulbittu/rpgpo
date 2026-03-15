// GPO Integration Gateway — Inbound/outbound webhook system with event routing

import type { Domain } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');
const https = require('https') as typeof import('https');

const GATEWAY_DIR = path.resolve(__dirname, '..', '..', 'state', 'integrations');
const SUBSCRIPTIONS_FILE = path.join(GATEWAY_DIR, 'subscriptions.json');
const EVENTS_FILE = path.join(GATEWAY_DIR, 'events.json');
const DELIVERIES_FILE = path.join(GATEWAY_DIR, 'deliveries.json');

function ensureDir(): void { if (!fs.existsSync(GATEWAY_DIR)) fs.mkdirSync(GATEWAY_DIR, { recursive: true }); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { ensureDir(); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

// ── Types ──

export interface WebhookSubscription {
  id: string;
  name: string;
  type: 'inbound' | 'outbound';
  connector: 'slack' | 'github' | 'generic' | 'email';
  eventFilter?: string;
  action?: { type: 'create_task' | 'start_workflow' | 'notify'; templateId?: string; domain?: string; prompt?: string };
  destination?: { url?: string; channel?: string; email?: string; headers?: Record<string, string> };
  secret?: string;
  enabled: boolean;
  createdAt: number;
}

export interface WebhookEvent {
  id: string;
  subscriptionId: string;
  direction: 'inbound' | 'outbound';
  connector: string;
  eventType: string;
  payload: Record<string, unknown>;
  status: 'received' | 'processed' | 'failed' | 'delivered' | 'retry';
  error?: string;
  createdAt: number;
}

// ── Subscriptions ──

export function createSubscription(data: Partial<WebhookSubscription>): WebhookSubscription {
  const subs = readJson<WebhookSubscription[]>(SUBSCRIPTIONS_FILE, []);
  const sub: WebhookSubscription = {
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

export function listSubscriptions(): WebhookSubscription[] {
  return readJson<WebhookSubscription[]>(SUBSCRIPTIONS_FILE, []);
}

export function getSubscription(id: string): WebhookSubscription | null {
  return listSubscriptions().find(s => s.id === id) || null;
}

export function deleteSubscription(id: string): boolean {
  const subs = readJson<WebhookSubscription[]>(SUBSCRIPTIONS_FILE, []);
  const idx = subs.findIndex(s => s.id === id);
  if (idx < 0) return false;
  subs.splice(idx, 1);
  writeJson(SUBSCRIPTIONS_FILE, subs);
  return true;
}

// ── Inbound Event Processing ──

export function processInboundEvent(subscriptionId: string, payload: Record<string, unknown>): { eventId: string; action?: string } {
  const sub = getSubscription(subscriptionId);
  if (!sub || !sub.enabled) return { eventId: '' };

  const event: WebhookEvent = {
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
        const intake = require('./intake') as { createTask(body: any): any };
        const queue = require('./queue') as { addTask(type: string, label: string, meta: any): any };
        const prompt = sub.action.prompt || (payload.text as string) || (payload.message as string) || JSON.stringify(payload).slice(0, 500);
        const task = intake.createTask({ raw_request: prompt, domain: sub.action.domain || 'general', urgency: 'normal' });
        queue.addTask('deliberate', `Deliberate (webhook): ${task.title}`, { taskId: task.task_id, autoApprove: true });
        event.status = 'processed';
        recordEvent(event);
        return { eventId: event.id, action: 'task_created:' + task.task_id };
      }
    } catch (e) {
      event.status = 'failed';
      event.error = (e as Error).message?.slice(0, 200);
    }
  }

  event.status = event.status === 'received' ? 'processed' : event.status;
  recordEvent(event);
  return { eventId: event.id };
}

// ── Outbound Delivery ──

export function deliverOutbound(subscriptionId: string, payload: Record<string, unknown>): { deliveryId: string } {
  const sub = getSubscription(subscriptionId);
  if (!sub || !sub.enabled || !sub.destination) return { deliveryId: '' };

  const event: WebhookEvent = {
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
      req.on('error', () => { /* fire and forget */ });
      req.write(body);
      req.end();
    } catch {
      event.status = 'failed';
    }
  }

  recordEvent(event);
  return { deliveryId: event.id };
}

// ── Event History ──

function recordEvent(event: WebhookEvent): void {
  const events = readJson<WebhookEvent[]>(EVENTS_FILE, []);
  events.push(event);
  if (events.length > 500) events.splice(0, events.length - 300);
  writeJson(EVENTS_FILE, events);
}

export function listEvents(limit?: number): WebhookEvent[] {
  return readJson<WebhookEvent[]>(EVENTS_FILE, []).sort((a, b) => b.createdAt - a.createdAt).slice(0, limit || 50);
}

// ── Verify Webhook Signature ──

export function verifySignature(payload: string, signature: string, secret: string): boolean {
  const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  return signature === expected || signature === 'sha256=' + expected;
}

module.exports = { createSubscription, listSubscriptions, getSubscription, deleteSubscription, processInboundEvent, deliverOutbound, listEvents, verifySignature };
