// GPO Notification & Hook System
// Typed hook points for operator notifications and external agent interaction.
// Dashboard notifications are live. External channels are prepared but not fully shipped.

import type {
  NotificationPayload, NotificationChannel, NotificationEventType,
  AgentHook, ExecutionHandoff, Domain, Blocker,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const HOOKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'agent-hooks.json');

function uid(): string {
  return 'ntf_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ═══════════════════════════════════════════
// Notification Dispatch
// ═══════════════════════════════════════════

type NotificationHandler = (payload: NotificationPayload) => void;
const handlers: Map<NotificationChannel, NotificationHandler> = new Map();

/** Register a handler for a notification channel */
export function registerHandler(channel: NotificationChannel, handler: NotificationHandler): void {
  handlers.set(channel, handler);
}

/** Dispatch a notification to the appropriate channel */
export function notify(payload: NotificationPayload): void {
  const handler = handlers.get(payload.channel);
  if (handler) {
    try { handler(payload); }
    catch (e) { console.log(`[notifications] Handler error for ${payload.channel}: ${(e as Error).message}`); }
  }
  // Always log
  console.log(`[notification] ${payload.severity}: ${payload.title} → ${payload.channel}`);
}

/** Create and dispatch a notification from event data */
export function emitNotification(
  eventType: NotificationEventType,
  title: string,
  body: string,
  opts: { severity?: 'info' | 'warning' | 'critical'; domain?: Domain; task_id?: string; subtask_id?: string; channels?: NotificationChannel[] } = {}
): NotificationPayload[] {
  const channels = opts.channels || getEnabledChannels();
  const payloads: NotificationPayload[] = [];

  for (const channel of channels) {
    const payload: NotificationPayload = {
      id: uid(),
      channel,
      event_type: eventType,
      title,
      body,
      severity: opts.severity || 'info',
      domain: opts.domain,
      task_id: opts.task_id,
      subtask_id: opts.subtask_id,
      created_at: new Date().toISOString(),
    };
    notify(payload);
    payloads.push(payload);
  }

  return payloads;
}

// ═══════════════════════════════════════════
// Convenience emitters for common events
// ═══════════════════════════════════════════

export function notifyApprovalNeeded(blocker: Blocker): void {
  emitNotification('approval_needed', blocker.title, blocker.description, {
    severity: blocker.severity === 'critical' ? 'critical' : 'warning',
    domain: blocker.domain,
    task_id: blocker.task_id,
    subtask_id: blocker.subtask_id,
  });
}

export function notifyTaskDone(taskTitle: string, domain: Domain, taskId: string): void {
  emitNotification('task_done', `Task completed: ${taskTitle}`, `All subtasks finished.`, {
    severity: 'info', domain, task_id: taskId,
  });
}

export function notifyTaskFailed(taskTitle: string, domain: Domain, taskId: string, error: string): void {
  emitNotification('task_failed', `Task failed: ${taskTitle}`, error, {
    severity: 'warning', domain, task_id: taskId,
  });
}

export function notifyBuilderComplete(subtaskTitle: string, filesChanged: number, domain: Domain, subtaskId: string): void {
  emitNotification('builder_complete', `Builder done: ${subtaskTitle}`, `${filesChanged} file(s) changed. Needs review.`, {
    severity: 'info', domain, subtask_id: subtaskId,
  });
}

export function notifyBuilderFallback(subtaskTitle: string, domain: Domain, subtaskId: string): void {
  emitNotification('builder_fallback', `Builder fallback: ${subtaskTitle}`, `Claude CLI could not execute. Manual session required.`, {
    severity: 'warning', domain, subtask_id: subtaskId,
  });
}

export function notifyBudgetWarning(provider: string, todayCost: number, limit: number): void {
  emitNotification('budget_warning', `Budget warning: ${provider}`, `$${todayCost.toFixed(2)} of $${limit.toFixed(2)} daily limit.`, {
    severity: 'warning',
  });
}

export function notifyLoopBlocked(domain: Domain, blockerTitle: string): void {
  emitNotification('loop_blocked', `Loop blocked: ${domain}`, blockerTitle, {
    severity: 'warning', domain,
  });
}

// ═══════════════════════════════════════════
// Channel Configuration
// ═══════════════════════════════════════════

function getEnabledChannels(): NotificationChannel[] {
  try {
    const inst = require('./instance') as { getInstance(): { notification_settings: { channels: NotificationChannel[] } } };
    return inst.getInstance().notification_settings.channels || ['dashboard'];
  } catch {
    return ['dashboard'];
  }
}

// ═══════════════════════════════════════════
// Dashboard Notification Handler (built-in)
// ═══════════════════════════════════════════

// The dashboard handler broadcasts via SSE
registerHandler('dashboard', (payload) => {
  try {
    const events = require('./events') as { broadcast(event: string, data: unknown): void };
    events.broadcast('activity', {
      action: `[${payload.severity}] ${payload.title}`,
      ts: payload.created_at,
    });
  } catch { /* SSE not available */ }
});

// ═══════════════════════════════════════════
// Webhook Handler (prepared, not fully shipped)
// ═══════════════════════════════════════════

registerHandler('webhook', (payload) => {
  try {
    const inst = require('./instance') as { getInstance(): { notification_settings: { webhook_url?: string } } };
    const url = inst.getInstance().notification_settings.webhook_url;
    if (!url) return;

    // Prepared for future use — log for now
    console.log(`[notifications] Webhook prepared (not sent): ${url} → ${payload.title}`);
    // In production: make HTTP POST to url with payload
    // Respects privacy: payload.body is already sanitized by the emitter
  } catch { /* not configured */ }
});

// ═══════════════════════════════════════════
// Agent Hooks — External execution bridge
// ═══════════════════════════════════════════

function readHooks(): AgentHook[] {
  try {
    if (!fs.existsSync(HOOKS_FILE)) return [];
    return JSON.parse(fs.readFileSync(HOOKS_FILE, 'utf-8'));
  } catch { return []; }
}

function writeHooks(hooks: AgentHook[]): void {
  const dir = path.dirname(HOOKS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(HOOKS_FILE, JSON.stringify(hooks, null, 2));
}

/** Register an agent hook for external interaction */
export function registerAgentHook(hook: Omit<AgentHook, 'id' | 'created_at'>): AgentHook {
  const hooks = readHooks();
  const record: AgentHook = {
    ...hook,
    id: 'hook_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    created_at: new Date().toISOString(),
  };
  hooks.push(record);
  writeHooks(hooks);
  return record;
}

/** Get all agent hooks */
export function getAgentHooks(): AgentHook[] {
  return readHooks();
}

/** Get enabled hooks for a specific type */
export function getEnabledHooks(type: 'inbound' | 'outbound'): AgentHook[] {
  return readHooks().filter(h => h.enabled && h.type === type);
}

/** Create an execution handoff (future: send to external agent) */
export function createHandoff(
  subtaskId: string, targetAgent: string, payload: Record<string, unknown>
): ExecutionHandoff {
  const handoff: ExecutionHandoff = {
    id: 'hnd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    subtask_id: subtaskId,
    target_agent: targetAgent,
    payload,
    status: 'pending',
    created_at: new Date().toISOString(),
  };
  console.log(`[notifications] Handoff created: ${handoff.id} → ${targetAgent} (not dispatched — future capability)`);
  return handoff;
}

module.exports = {
  registerHandler,
  notify,
  emitNotification,
  notifyApprovalNeeded,
  notifyTaskDone,
  notifyTaskFailed,
  notifyBuilderComplete,
  notifyBuilderFallback,
  notifyBudgetWarning,
  notifyLoopBlocked,
  registerAgentHook,
  getAgentHooks,
  getEnabledHooks,
  createHandoff,
};
