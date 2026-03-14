// RPGPO State Machine — Validated transitions for tasks and subtasks
// All state changes flow through here. No more scattered string checks.

import type { TaskStatus, SubtaskStatus } from './types';

// ═══════════════════════════════════════════
// Task State Machine
// ═══════════════════════════════════════════

const TASK_TRANSITIONS: Record<TaskStatus, TaskStatus[]> = {
  intake:           ['deliberating', 'canceled'],
  deliberating:     ['planned', 'failed'],
  planned:          ['executing', 'canceled'],
  executing:        ['waiting_approval', 'waiting_human', 'blocked', 'done', 'failed'],
  waiting_approval: ['executing', 'done', 'failed', 'canceled'],
  waiting_human:    ['executing', 'done', 'failed', 'canceled'],
  blocked:          ['executing', 'failed', 'canceled'],
  done:             [], // terminal
  failed:           ['intake'], // allow retry
  canceled:         ['intake'], // allow re-submit
};

/** All terminal task states */
export const TASK_TERMINAL: ReadonlySet<TaskStatus> = new Set(['done', 'failed', 'canceled']);

/** Task states that require human action */
export const TASK_NEEDS_HUMAN: ReadonlySet<TaskStatus> = new Set([
  'waiting_approval', 'waiting_human', 'planned', 'intake',
]);

/** Check if a task state transition is valid */
export function isValidTaskTransition(from: TaskStatus, to: TaskStatus): boolean {
  const allowed = TASK_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/** Assert a task transition is valid, throw if not */
export function assertTaskTransition(from: TaskStatus, to: TaskStatus, taskId?: string): void {
  if (!isValidTaskTransition(from, to)) {
    throw new Error(
      `Invalid task transition: ${from} → ${to}` +
      (taskId ? ` (task ${taskId})` : '')
    );
  }
}

// ═══════════════════════════════════════════
// Subtask State Machine
// ═══════════════════════════════════════════

const SUBTASK_TRANSITIONS: Record<SubtaskStatus, SubtaskStatus[]> = {
  proposed:          ['queued', 'waiting_approval', 'blocked', 'canceled'],
  queued:            ['running', 'builder_running', 'blocked', 'canceled'],
  running:           ['done', 'failed', 'waiting_approval', 'blocked'],
  builder_running:   ['waiting_approval', 'builder_fallback', 'done', 'failed', 'blocked'],
  waiting_approval:  ['done', 'queued', 'failed', 'canceled'], // done = approved, queued = re-run
  builder_fallback:  ['done', 'queued', 'failed', 'canceled'], // done = manual confirmed
  waiting_human:     ['done', 'failed', 'canceled'],
  blocked:           ['queued', 'proposed', 'canceled'],
  done:              [], // terminal
  failed:            ['queued', 'proposed'], // allow retry
  canceled:          ['proposed'], // allow re-plan
};

/** All terminal subtask states */
export const SUBTASK_TERMINAL: ReadonlySet<SubtaskStatus> = new Set(['done', 'failed', 'blocked', 'canceled']);

/** Subtask states where work has stopped and needs human action */
export const SUBTASK_STOPPING: ReadonlySet<SubtaskStatus> = new Set([
  'builder_running', 'builder_fallback', 'waiting_approval', 'waiting_human',
]);

/** Subtask states that count as "completed work" (not needing re-execution on approval) */
export const SUBTASK_COMPLETED_WORK: ReadonlySet<SubtaskStatus> = new Set([
  'waiting_approval', 'builder_fallback', 'waiting_human',
]);

/** Subtask states that are approvable */
export const SUBTASK_APPROVABLE: ReadonlySet<SubtaskStatus> = new Set([
  'waiting_approval', 'builder_fallback', 'waiting_human',
]);

/** Check if a subtask state transition is valid */
export function isValidSubtaskTransition(from: SubtaskStatus, to: SubtaskStatus): boolean {
  const allowed = SUBTASK_TRANSITIONS[from];
  return allowed ? allowed.includes(to) : false;
}

/** Assert a subtask transition is valid, throw if not */
export function assertSubtaskTransition(from: SubtaskStatus, to: SubtaskStatus, subtaskId?: string): void {
  if (!isValidSubtaskTransition(from, to)) {
    throw new Error(
      `Invalid subtask transition: ${from} → ${to}` +
      (subtaskId ? ` (subtask ${subtaskId})` : '')
    );
  }
}

// ═══════════════════════════════════════════
// Transition helpers
// ═══════════════════════════════════════════

/** Is this subtask in a state where the builder already ran? */
export function hasBuilderResult(status: SubtaskStatus): boolean {
  return status === 'waiting_approval' || status === 'builder_fallback';
}

/** Is this subtask actively executing? */
export function isActive(status: SubtaskStatus): boolean {
  return status === 'running' || status === 'builder_running' || status === 'queued';
}

/** Can this subtask be approved? */
export function isApprovable(status: SubtaskStatus): boolean {
  return SUBTASK_APPROVABLE.has(status);
}

/** Is this a final state for a subtask? */
export function isTerminal(status: SubtaskStatus): boolean {
  return SUBTASK_TERMINAL.has(status);
}

/** Does this task need operator input? */
export function taskNeedsHuman(status: TaskStatus): boolean {
  return TASK_NEEDS_HUMAN.has(status);
}
