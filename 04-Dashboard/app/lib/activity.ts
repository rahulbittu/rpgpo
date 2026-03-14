// GPO Structured Activity Events
// Typed, consistent event logging for all system operations.
// Actor names come from the instance, not hardcoded.

import type { ActivityEvent, Domain, SubtaskStatus, TaskStatus } from './types';

// Operator name — resolved from instance at load time, defaults to 'operator'
let _operatorName = 'operator';
try {
  const instance = require('./instance') as { getOperatorName(): string };
  _operatorName = instance.getOperatorName();
} catch { /* instance not yet initialized */ }

/** Get the current operator name (lowercase, for actor field) */
function operatorActor(): 'claude' | 'openai' | 'gemini' | 'perplexity' | 'rahul' | 'system' | 'worker' {
  // For now, map to 'rahul' since ActivityEvent actor is a union type.
  // In future, ActivityEvent.actor will become string to support any operator name.
  return 'rahul';
}

// ═══════════════════════════════════════════
// Event Constructors — use these instead of ad-hoc strings
// ═══════════════════════════════════════════

export function taskCreated(taskId: string, title: string, domain: Domain): ActivityEvent {
  return { ts: now(), actor: 'system', action: `Task created: ${title}`, taskId, domain };
}

export function taskDeliberated(taskId: string, title: string, subtaskCount: number): ActivityEvent {
  return { ts: now(), actor: 'system', action: `Deliberation complete: ${title} (${subtaskCount} subtasks)`, result: 'done', taskId };
}

export function planApproved(taskId: string, queuedCount: number): ActivityEvent {
  return { ts: now(), actor: 'rahul', action: `Plan approved, ${queuedCount} subtasks queued`, result: 'queued', taskId };
}

export function subtaskStarted(subtaskId: string, title: string, model: string): ActivityEvent {
  return { ts: now(), actor: inferActor(model), action: `Started: ${title}`, subtaskId };
}

export function subtaskCompleted(subtaskId: string, title: string, model: string, whatDone?: string): ActivityEvent {
  return {
    ts: now(), actor: inferActor(model),
    action: whatDone || `Completed: ${title}`,
    result: 'done', subtaskId,
  };
}

export function subtaskFailed(subtaskId: string, title: string, model: string, error: string): ActivityEvent {
  return {
    ts: now(), actor: inferActor(model),
    action: `Failed: ${title} — ${error.slice(0, 80)}`,
    result: 'failed', subtaskId,
  };
}

export function builderStarted(subtaskId: string, title: string): ActivityEvent {
  return { ts: now(), actor: 'claude', action: `Builder started: ${title}`, subtaskId };
}

export function builderCodeApplied(subtaskId: string, fileCount: number): ActivityEvent {
  return {
    ts: now(), actor: 'claude',
    action: `Code applied: ${fileCount} file(s) changed — waiting for review`,
    result: 'approval', subtaskId,
  };
}

export function builderFallback(subtaskId: string, reason: string): ActivityEvent {
  return { ts: now(), actor: 'claude', action: `Builder fallback: ${reason}`, result: 'failed', subtaskId };
}

export function approvalGranted(subtaskId: string, title: string, nextQueued: string[]): ActivityEvent {
  const nextPart = nextQueued.length > 0 ? ` — queued next: ${nextQueued.join(', ')}` : '';
  return {
    ts: now(), actor: 'rahul',
    action: `Approved: ${title}${nextPart}`,
    result: 'done', subtaskId,
  };
}

export function approvalRejected(subtaskId: string, title: string, reason: string): ActivityEvent {
  return {
    ts: now(), actor: 'rahul',
    action: `Rejected: ${title} — ${reason}`,
    result: 'failed', subtaskId,
  };
}

export function workflowContinued(taskId: string, queuedCount: number): ActivityEvent {
  return {
    ts: now(), actor: 'system',
    action: `Workflow continued: ${queuedCount} subtask(s) queued`,
    result: 'queued', taskId,
  };
}

export function taskCompleted(taskId: string, title: string): ActivityEvent {
  return { ts: now(), actor: 'system', action: `Task completed: ${title}`, result: 'done', taskId };
}

export function taskFailed(taskId: string, title: string): ActivityEvent {
  return { ts: now(), actor: 'system', action: `Task failed: ${title}`, result: 'failed', taskId };
}

export function costRecorded(provider: string, model: string, cost: number): ActivityEvent {
  return { ts: now(), actor: inferActor(provider), action: `Cost: $${cost.toFixed(4)} (${model})` };
}

export function operatorAction(action: string, detail?: string): ActivityEvent {
  return { ts: now(), actor: 'rahul', action, detail };
}

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

function now(): string {
  return new Date().toISOString();
}

type Actor = ActivityEvent['actor'];

function inferActor(modelOrProvider: string): Actor {
  const l = (modelOrProvider || '').toLowerCase();
  if (l === 'claude' || l.includes('claude')) return 'claude';
  if (l === 'openai' || l.includes('gpt')) return 'openai';
  if (l === 'gemini') return 'gemini';
  if (l === 'perplexity' || l === 'sonar') return 'perplexity';
  return 'system';
}
