"use strict";
// RPGPO State Machine — Validated transitions for tasks and subtasks
// All state changes flow through here. No more scattered string checks.
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBTASK_APPROVABLE = exports.SUBTASK_COMPLETED_WORK = exports.SUBTASK_STOPPING = exports.SUBTASK_TERMINAL = exports.TASK_NEEDS_HUMAN = exports.TASK_TERMINAL = void 0;
exports.isValidTaskTransition = isValidTaskTransition;
exports.assertTaskTransition = assertTaskTransition;
exports.isValidSubtaskTransition = isValidSubtaskTransition;
exports.assertSubtaskTransition = assertSubtaskTransition;
exports.hasBuilderResult = hasBuilderResult;
exports.isActive = isActive;
exports.isApprovable = isApprovable;
exports.isTerminal = isTerminal;
exports.taskNeedsHuman = taskNeedsHuman;
// ═══════════════════════════════════════════
// Task State Machine
// ═══════════════════════════════════════════
const TASK_TRANSITIONS = {
    intake: ['deliberating', 'canceled'],
    deliberating: ['planned', 'failed'],
    planned: ['executing', 'canceled'],
    executing: ['waiting_approval', 'waiting_human', 'blocked', 'done', 'failed'],
    waiting_approval: ['executing', 'done', 'failed', 'canceled'],
    waiting_human: ['executing', 'done', 'failed', 'canceled'],
    blocked: ['executing', 'failed', 'canceled'],
    done: [], // terminal
    failed: ['intake'], // allow retry
    canceled: ['intake'], // allow re-submit
};
/** All terminal task states */
exports.TASK_TERMINAL = new Set(['done', 'failed', 'canceled']);
/** Task states that require human action */
exports.TASK_NEEDS_HUMAN = new Set([
    'waiting_approval', 'waiting_human', 'planned', 'intake',
]);
/** Check if a task state transition is valid */
function isValidTaskTransition(from, to) {
    const allowed = TASK_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
}
/** Assert a task transition is valid, throw if not */
function assertTaskTransition(from, to, taskId) {
    if (!isValidTaskTransition(from, to)) {
        throw new Error(`Invalid task transition: ${from} → ${to}` +
            (taskId ? ` (task ${taskId})` : ''));
    }
}
// ═══════════════════════════════════════════
// Subtask State Machine
// ═══════════════════════════════════════════
const SUBTASK_TRANSITIONS = {
    proposed: ['queued', 'waiting_approval', 'blocked', 'canceled'],
    queued: ['running', 'builder_running', 'blocked', 'canceled'],
    running: ['done', 'failed', 'waiting_approval', 'blocked'],
    builder_running: ['waiting_approval', 'builder_fallback', 'done', 'failed', 'blocked'],
    waiting_approval: ['done', 'queued', 'failed', 'canceled'], // done = approved, queued = re-run
    builder_fallback: ['done', 'queued', 'failed', 'canceled'], // done = manual confirmed
    waiting_human: ['done', 'failed', 'canceled'],
    blocked: ['queued', 'proposed', 'canceled'],
    done: [], // terminal
    failed: ['queued', 'proposed'], // allow retry
    canceled: ['proposed'], // allow re-plan
};
/** All terminal subtask states */
exports.SUBTASK_TERMINAL = new Set(['done', 'failed', 'blocked', 'canceled']);
/** Subtask states where work has stopped and needs human action */
exports.SUBTASK_STOPPING = new Set([
    'builder_running', 'builder_fallback', 'waiting_approval', 'waiting_human',
]);
/** Subtask states that count as "completed work" (not needing re-execution on approval) */
exports.SUBTASK_COMPLETED_WORK = new Set([
    'waiting_approval', 'builder_fallback', 'waiting_human',
]);
/** Subtask states that are approvable */
exports.SUBTASK_APPROVABLE = new Set([
    'waiting_approval', 'builder_fallback', 'waiting_human',
]);
/** Check if a subtask state transition is valid */
function isValidSubtaskTransition(from, to) {
    const allowed = SUBTASK_TRANSITIONS[from];
    return allowed ? allowed.includes(to) : false;
}
/** Assert a subtask transition is valid, throw if not */
function assertSubtaskTransition(from, to, subtaskId) {
    if (!isValidSubtaskTransition(from, to)) {
        throw new Error(`Invalid subtask transition: ${from} → ${to}` +
            (subtaskId ? ` (subtask ${subtaskId})` : ''));
    }
}
// ═══════════════════════════════════════════
// Transition helpers
// ═══════════════════════════════════════════
/** Is this subtask in a state where the builder already ran? */
function hasBuilderResult(status) {
    return status === 'waiting_approval' || status === 'builder_fallback';
}
/** Is this subtask actively executing? */
function isActive(status) {
    return status === 'running' || status === 'builder_running' || status === 'queued';
}
/** Can this subtask be approved? */
function isApprovable(status) {
    return exports.SUBTASK_APPROVABLE.has(status);
}
/** Is this a final state for a subtask? */
function isTerminal(status) {
    return exports.SUBTASK_TERMINAL.has(status);
}
/** Does this task need operator input? */
function taskNeedsHuman(status) {
    return exports.TASK_NEEDS_HUMAN.has(status);
}
//# sourceMappingURL=state-machine.js.map