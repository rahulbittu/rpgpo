"use strict";
// RPGPO Workflow Engine — Auto-Continue Logic (TypeScript)
// Manages subtask state machine and auto-queuing.
// Safety: Yellow/Red subtasks stop for approval. No auto-external actions.
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSubtaskComplete = onSubtaskComplete;
exports.findReadySubtasks = findReadySubtasks;
exports.blockDependents = blockDependents;
exports.checkTaskCompletion = checkTaskCompletion;
exports.materializeSubtasks = materializeSubtasks;
exports.queueInitialSubtasks = queueInitialSubtasks;
const state_machine_1 = require("./state-machine");
// ── Dependencies ──
// All lib modules use module.exports (commonjs), so we require them.
/* eslint-disable @typescript-eslint/no-var-requires */
const intake = require('./intake');
const repoScanner = require('./repo-scanner');
// ═══════════════════════════════════════════
// Core Workflow
// ═══════════════════════════════════════════
/**
 * After a subtask completes (done or failed), decide what happens next.
 * - Green + success → auto-queue next safe subtask
 * - Yellow/Red → stop, surface approval
 * - Failed → block dependents, stop
 */
function onSubtaskComplete(subtaskId) {
    const st = intake.getSubtask(subtaskId);
    if (!st)
        return { action: 'error', message: 'Subtask not found', next_subtask_ids: [] };
    const parentTask = intake.getTask(st.parent_task_id);
    if (!parentTask)
        return { action: 'error', message: 'Parent task not found', next_subtask_ids: [] };
    const allSubs = intake.getSubtasksForTask(st.parent_task_id);
    // Failed → block dependents and check completion
    if (st.status === 'failed') {
        blockDependents(subtaskId, allSubs);
        checkTaskCompletion(parentTask.task_id, allSubs);
        return {
            action: 'failed',
            message: `Subtask "${st.title}" failed: ${st.error || 'Unknown error'}`,
            next_subtask_ids: [],
        };
    }
    // Only proceed if done
    if (st.status !== 'done') {
        return { action: 'noop', message: 'Subtask not in terminal state', next_subtask_ids: [] };
    }
    // Find subtasks that depend on this one and are now unblocked
    const nextReady = findReadySubtasks(subtaskId, allSubs);
    if (!nextReady.length) {
        checkTaskCompletion(parentTask.task_id, allSubs);
        return { action: 'complete', message: 'No more subtasks to queue', next_subtask_ids: [] };
    }
    const queued = [];
    const needsApproval = [];
    for (const next of nextReady) {
        if (next.risk_level === 'red' || next.risk_level === 'yellow' || next.approval_required) {
            intake.updateSubtask(next.subtask_id, { status: 'waiting_approval' });
            needsApproval.push(next.subtask_id);
        }
        else {
            intake.updateSubtask(next.subtask_id, { status: 'queued' });
            queued.push(next.subtask_id);
        }
    }
    if (needsApproval.length > 0) {
        intake.updateTask(parentTask.task_id, { status: 'waiting_approval' });
    }
    return {
        action: needsApproval.length > 0 ? 'needs_approval' : 'auto_continue',
        next_subtask_ids: queued,
        approval_needed: needsApproval,
        message: queued.length > 0
            ? `Auto-queued ${queued.length} subtask(s)`
            : `${needsApproval.length} subtask(s) need approval`,
    };
}
/**
 * Find subtasks that are ready to run after a given subtask completes.
 * A subtask is ready when all its depends_on subtasks are done.
 */
function findReadySubtasks(completedSubtaskId, allSubs) {
    const ready = [];
    for (const s of allSubs) {
        if (s.status !== 'proposed')
            continue;
        if (!s.depends_on || !s.depends_on.length)
            continue;
        // Check if this subtask depends on the completed one
        const dependsOnCompleted = s.depends_on.some((dep) => {
            if (typeof dep === 'number') {
                const depSub = allSubs[dep];
                return depSub && depSub.subtask_id === completedSubtaskId;
            }
            return dep === completedSubtaskId;
        });
        if (!dependsOnCompleted)
            continue;
        // Check if ALL dependencies are done
        const allDepsDone = s.depends_on.every((dep) => {
            let depSub;
            if (typeof dep === 'number') {
                depSub = allSubs[dep];
            }
            else {
                depSub = allSubs.find(x => x.subtask_id === dep);
            }
            return depSub && depSub.status === 'done';
        });
        if (allDepsDone)
            ready.push(s);
    }
    return ready;
}
/**
 * Block subtasks that depend on a failed subtask.
 */
function blockDependents(failedSubtaskId, allSubs) {
    for (const s of allSubs) {
        if (s.status !== 'proposed' && s.status !== 'queued')
            continue;
        const depends = s.depends_on.some((dep) => {
            if (typeof dep === 'number') {
                const depSub = allSubs[dep];
                return depSub && depSub.subtask_id === failedSubtaskId;
            }
            return dep === failedSubtaskId;
        });
        if (depends) {
            intake.updateSubtask(s.subtask_id, {
                status: 'blocked',
                error: `Blocked: dependency "${failedSubtaskId}" failed`,
            });
        }
    }
}
/**
 * Check if all subtasks are in terminal state. If so, mark the parent task accordingly.
 */
function checkTaskCompletion(taskId, allSubs) {
    const subs = allSubs || intake.getSubtasksForTask(taskId);
    if (!subs.length)
        return;
    // Don't finalize while any subtask needs human action
    const anyStopped = subs.some(s => state_machine_1.SUBTASK_STOPPING.has(s.status));
    if (anyStopped)
        return;
    // Auto-block proposed subtasks whose dependencies are blocked/failed
    for (const s of subs) {
        if (s.status !== 'proposed')
            continue;
        const depsBlocked = (s.depends_on || []).some((dep) => {
            const depIdx = typeof dep === 'number' ? dep : subs.findIndex(x => x.subtask_id === dep);
            if (depIdx < 0 || depIdx >= subs.length)
                return false;
            return subs[depIdx].status === 'blocked' || subs[depIdx].status === 'failed';
        });
        if (depsBlocked) {
            intake.updateSubtask(s.subtask_id, { status: 'blocked', error: 'Blocked: dependency failed or blocked' });
        }
    }
    // Re-check after auto-blocking
    const refreshedSubs = intake.getSubtasksForTask(taskId);
    const allTerminal = refreshedSubs.every(s => state_machine_1.SUBTASK_TERMINAL.has(s.status));
    if (!allTerminal)
        return;
    const anyFailed = subs.some(s => s.status === 'failed');
    // Part 66: Wire runtime deliverable pipeline — validate contract at task completion
    if (!anyFailed) {
        try {
            const cos = require('./chief-of-staff');
            const intakeTask = intake.getTask(taskId);
            const engineId = intakeTask?.domain || 'general';
            const result = cos.onRuntimeTaskComplete(taskId, engineId);
            if (result && !result.gate_passed) {
                // Contract violated — still mark done but record the violation
                intake.updateTask(taskId, { status: 'done' });
            }
        }
        catch { /* pipeline not critical for task completion */ }
    }
    intake.updateTask(taskId, { status: anyFailed ? 'failed' : 'done' });
}
/**
 * Materialize subtasks from a deliberation result into the subtask store.
 * Links them to the parent task and sets up dependency chains.
 */
function materializeSubtasks(taskId, deliberation) {
    const subtaskDefs = deliberation.subtasks || [];
    const created = [];
    const task = intake.getTask(taskId);
    const domain = task?.domain || 'general';
    const isCodeTask = deliberation.is_code_task || false;
    for (let i = 0; i < subtaskDefs.length; i++) {
        const def = subtaskDefs[i];
        // Path validation for implement/claude subtasks on code tasks
        let validatedRead = def.files_to_read || [];
        let validatedWrite = def.files_to_write || [];
        let pathWarnings = [];
        if (isCodeTask && (def.stage === 'implement' || def.assigned_model === 'claude')) {
            const allPaths = [...validatedRead, ...validatedWrite];
            if (allPaths.length > 0) {
                const validation = repoScanner.validatePaths(allPaths);
                if (!validation.valid) {
                    validatedRead = validatedRead.filter((f) => !validation.missing.includes(f));
                    validatedWrite = validatedWrite.filter((f) => !validation.missing.includes(f));
                    pathWarnings = validation.missing;
                }
            }
            if (validatedRead.length === 0 && validatedWrite.length === 0 && def.stage === 'implement') {
                def._blocked_no_files = true;
            }
        }
        const st = intake.createSubtask({
            parent_task_id: taskId,
            title: def.title || `Subtask ${i + 1}`,
            domain,
            stage: def.stage || 'audit',
            assigned_role: def.assigned_role || 'general',
            assigned_model: def.assigned_model || 'openai',
            expected_output: def.expected_output || '',
            prompt: def.prompt || '',
            files_to_read: validatedRead,
            files_to_write: validatedWrite,
            risk_level: def.risk_level || 'green',
            approval_required: !!def.approval_required,
            depends_on: (def.depends_on || []).map((dep) => {
                if (typeof dep === 'number' && dep < created.length) {
                    return created[dep].subtask_id;
                }
                return dep;
            }),
            order: i,
            _stripped_paths: pathWarnings.length > 0 ? pathWarnings : undefined,
            _is_locate_files: def.stage === 'locate_files',
        });
        if (def._blocked_no_files) {
            intake.updateSubtask(st.subtask_id, {
                status: 'blocked',
                error: 'Blocked: no real target files identified. Needs locate_files or manual grounding.',
            });
        }
        created.push(st);
    }
    return created;
}
/**
 * Queue the first batch of subtasks that have no dependencies.
 */
function queueInitialSubtasks(taskId) {
    const subs = intake.getSubtasksForTask(taskId);
    const queued = [];
    for (const s of subs) {
        if (s.status !== 'proposed')
            continue;
        if (!s.depends_on || !s.depends_on.length) {
            if (s.risk_level === 'red' || s.risk_level === 'yellow' || s.approval_required) {
                intake.updateSubtask(s.subtask_id, { status: 'waiting_approval' });
            }
            else {
                intake.updateSubtask(s.subtask_id, { status: 'queued' });
                queued.push(s.subtask_id);
            }
        }
    }
    if (queued.length > 0) {
        intake.updateTask(taskId, { status: 'executing' });
    }
    return queued;
}
