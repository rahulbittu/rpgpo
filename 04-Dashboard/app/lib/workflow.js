"use strict";
// RPGPO Workflow Engine — Auto-Continue Logic (TypeScript)
// Manages subtask state machine and auto-queuing.
// Safety: Yellow/Red subtasks stop for approval. No auto-external actions.
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.onSubtaskComplete = onSubtaskComplete;
exports.findReadySubtasks = findReadySubtasks;
exports.blockDependents = blockDependents;
exports.checkTaskCompletion = checkTaskCompletion;
exports.materializeSubtasks = materializeSubtasks;
exports.queueInitialSubtasks = queueInitialSubtasks;
var state_machine_1 = require("./state-machine");
// ── Dependencies ──
// All lib modules use module.exports (commonjs), so we require them.
/* eslint-disable @typescript-eslint/no-var-requires */
var intake = require('./intake');
var repoScanner = require('./repo-scanner');
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
    var st = intake.getSubtask(subtaskId);
    if (!st)
        return { action: 'error', message: 'Subtask not found', next_subtask_ids: [] };
    var parentTask = intake.getTask(st.parent_task_id);
    if (!parentTask)
        return { action: 'error', message: 'Parent task not found', next_subtask_ids: [] };
    var allSubs = intake.getSubtasksForTask(st.parent_task_id);
    // Failed → block dependents and check completion
    if (st.status === 'failed') {
        blockDependents(subtaskId, allSubs);
        checkTaskCompletion(parentTask.task_id, allSubs);
        return {
            action: 'failed',
            message: "Subtask \"".concat(st.title, "\" failed: ").concat(st.error || 'Unknown error'),
            next_subtask_ids: [],
        };
    }
    // Only proceed if done
    if (st.status !== 'done') {
        return { action: 'noop', message: 'Subtask not in terminal state', next_subtask_ids: [] };
    }
    // Find subtasks that depend on this one and are now unblocked
    var nextReady = findReadySubtasks(subtaskId, allSubs);
    if (!nextReady.length) {
        checkTaskCompletion(parentTask.task_id, allSubs);
        return { action: 'complete', message: 'No more subtasks to queue', next_subtask_ids: [] };
    }
    var queued = [];
    var needsApproval = [];
    for (var _i = 0, nextReady_1 = nextReady; _i < nextReady_1.length; _i++) {
        var next = nextReady_1[_i];
        // Only require approval for: red risk, explicit approval_required, or code-writing tasks
        // Yellow risk research/analysis tasks should auto-execute to reduce friction
        var isCodeTask = next.stage === 'implement' || next.assigned_model === 'claude';
        var needsHumanApproval = next.risk_level === 'red' || next.approval_required || (next.risk_level === 'yellow' && isCodeTask);
        if (needsHumanApproval) {
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
            ? "Auto-queued ".concat(queued.length, " subtask(s)")
            : "".concat(needsApproval.length, " subtask(s) need approval"),
    };
}
/**
 * Find subtasks that are ready to run after a given subtask completes.
 * A subtask is ready when all its depends_on subtasks are done.
 */
function findReadySubtasks(completedSubtaskId, allSubs) {
    var ready = [];
    for (var _i = 0, allSubs_1 = allSubs; _i < allSubs_1.length; _i++) {
        var s = allSubs_1[_i];
        if (s.status !== 'proposed')
            continue;
        if (!s.depends_on || !s.depends_on.length)
            continue;
        // Check if this subtask depends on the completed one
        var dependsOnCompleted = s.depends_on.some(function (dep) {
            if (typeof dep === 'number') {
                var depSub = allSubs[dep];
                return depSub && depSub.subtask_id === completedSubtaskId;
            }
            return dep === completedSubtaskId;
        });
        if (!dependsOnCompleted)
            continue;
        // Check if ALL dependencies are done
        var allDepsDone = s.depends_on.every(function (dep) {
            var depSub;
            if (typeof dep === 'number') {
                depSub = allSubs[dep];
            }
            else {
                depSub = allSubs.find(function (x) { return x.subtask_id === dep; });
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
    for (var _i = 0, allSubs_2 = allSubs; _i < allSubs_2.length; _i++) {
        var s = allSubs_2[_i];
        if (s.status !== 'proposed' && s.status !== 'queued')
            continue;
        var depends = s.depends_on.some(function (dep) {
            if (typeof dep === 'number') {
                var depSub = allSubs[dep];
                return depSub && depSub.subtask_id === failedSubtaskId;
            }
            return dep === failedSubtaskId;
        });
        if (depends) {
            intake.updateSubtask(s.subtask_id, {
                status: 'blocked',
                error: "Blocked: dependency \"".concat(failedSubtaskId, "\" failed"),
            });
        }
    }
}
/**
 * Check if all subtasks are in terminal state. If so, mark the parent task accordingly.
 */
function checkTaskCompletion(taskId, allSubs) {
    var subs = allSubs || intake.getSubtasksForTask(taskId);
    if (!subs.length)
        return;
    // Don't finalize while any subtask needs human action
    var anyStopped = subs.some(function (s) { return state_machine_1.SUBTASK_STOPPING.has(s.status); });
    if (anyStopped)
        return;
    // Auto-block proposed subtasks whose dependencies are blocked/failed
    for (var _i = 0, subs_1 = subs; _i < subs_1.length; _i++) {
        var s = subs_1[_i];
        if (s.status !== 'proposed')
            continue;
        var depsBlocked = (s.depends_on || []).some(function (dep) {
            var depIdx = typeof dep === 'number' ? dep : subs.findIndex(function (x) { return x.subtask_id === dep; });
            if (depIdx < 0 || depIdx >= subs.length)
                return false;
            return subs[depIdx].status === 'blocked' || subs[depIdx].status === 'failed';
        });
        if (depsBlocked) {
            intake.updateSubtask(s.subtask_id, { status: 'blocked', error: 'Blocked: dependency failed or blocked' });
        }
    }
    // Re-check after auto-blocking
    var refreshedSubs = intake.getSubtasksForTask(taskId);
    var allTerminal = refreshedSubs.every(function (s) { return state_machine_1.SUBTASK_TERMINAL.has(s.status); });
    if (!allTerminal)
        return;
    var anyFailed = subs.some(function (s) { return s.status === 'failed'; });
    // Part 66: Wire runtime deliverable pipeline — validate contract at task completion
    if (!anyFailed) {
        try {
            var cos = require('./chief-of-staff');
            var intakeTask = intake.getTask(taskId);
            var engineId = (intakeTask === null || intakeTask === void 0 ? void 0 : intakeTask.domain) || 'general';
            var result = cos.onRuntimeTaskComplete(taskId, engineId);
            if (result && !result.gate_passed) {
                // Contract violated — still mark done but record the violation
                intake.updateTask(taskId, { status: 'done' });
            }
        }
        catch ( /* pipeline not critical for task completion */_a) { /* pipeline not critical for task completion */ }
    }
    intake.updateTask(taskId, { status: anyFailed ? 'failed' : 'done' });
    // Behavior learning: record task outcome event (live_observed)
    // Verification metrics: score output quality (ECC-inspired eval pattern)
    try {
        var behaviorMod = require('./behavior');
        var intakeTask2 = intake.getTask(taskId);
        // Quality scoring for verification metrics
        var completedSubs = refreshedSubs.filter(function (s) { return s.status === 'done' && s.output; });
        var totalOutputLength = completedSubs.reduce(function (sum, s) { return sum + (s.output || '').length; }, 0);
        var hasStructuredSections = completedSubs.some(function (s) { return (s.output || '').includes('##'); });
        var hasSources = completedSubs.some(function (s) { return /https?:\/\/|Source:|source:/i.test(s.output || ''); });
        var qualityScore = {
            output_length: totalOutputLength,
            has_structure: hasStructuredSections,
            has_sources: hasSources,
            subtask_count: completedSubs.length,
            length_adequate: totalOutputLength > 500,
        };
        if (anyFailed) {
            behaviorMod.recordEvent('output_abandoned', { reason: 'task_failed', source: 'workflow_completion', quality: qualityScore }, { taskId: taskId, engine: intakeTask2 === null || intakeTask2 === void 0 ? void 0 : intakeTask2.domain });
        }
        else {
            behaviorMod.recordEvent('output_accepted', { source: 'workflow_completion', quality: qualityScore }, { taskId: taskId, engine: intakeTask2 === null || intakeTask2 === void 0 ? void 0 : intakeTask2.domain });
        }
    }
    catch ( /* behavior module non-fatal */_b) { /* behavior module non-fatal */ }
    // Proactive delivery: emit notification on task completion so operator sees results
    try {
        var notif = require('./in-app-notifications');
        var intakeTask = intake.getTask(taskId);
        var taskTitle = (intakeTask === null || intakeTask === void 0 ? void 0 : intakeTask.title) || taskId;
        var completedSubs = refreshedSubs.filter(function (s) { return s.status === 'done'; });
        var outputPreview = completedSubs
            .filter(function (s) { return s.output; })
            .map(function (s) { return s.what_done || s.output.slice(0, 100); })
            .slice(0, 3)
            .join(' | ');
        notif.emitNotification({
            type: anyFailed ? 'workflow.failed' : 'workflow.complete',
            severity: anyFailed ? 'high' : 'medium',
            title: anyFailed ? "Task failed: ".concat(taskTitle.slice(0, 60)) : "Task complete: ".concat(taskTitle.slice(0, 60)),
            message: outputPreview.slice(0, 400) || (anyFailed ? 'One or more subtasks failed' : 'All subtasks completed successfully'),
        });
    }
    catch ( /* notification non-fatal */_c) { /* notification non-fatal */ }
    // Save combined deliverable file for easy access
    if (!anyFailed) {
        try {
            var fs = require('fs');
            var path = require('path');
            var intakeTask = intake.getTask(taskId);
            var completedSubs = refreshedSubs.filter(function (s) { return s.status === 'done' && s.output; });
            if (completedSubs.length > 0 && intakeTask) {
                var today = new Date().toISOString().slice(0, 10);
                var safeName = (intakeTask.title || 'task').replace(/[^a-zA-Z0-9-_]/g, '-').slice(0, 40);
                var deliverableContent = __spreadArray([
                    "# ".concat(intakeTask.title),
                    "**Domain:** ".concat(intakeTask.domain, " | **Date:** ").concat(today, " | **Subtasks:** ").concat(completedSubs.length),
                    ''
                ], completedSubs.map(function (s) { return "## ".concat(s.title, "\n").concat(s.output || s.what_done || 'No output'); }), true).join('\n\n');
                var delivDir = path.resolve(__dirname, '..', '..', 'state', 'deliverables');
                if (!fs.existsSync(delivDir))
                    fs.mkdirSync(delivDir, { recursive: true });
                fs.writeFileSync(path.join(delivDir, "".concat(today, "-").concat(safeName, ".md")), deliverableContent);
            }
        }
        catch ( /* deliverable save non-fatal */_d) { /* deliverable save non-fatal */ }
    }
}
/**
 * Materialize subtasks from a deliberation result into the subtask store.
 * Links them to the parent task and sets up dependency chains.
 */
function materializeSubtasks(taskId, deliberation) {
    var subtaskDefs = deliberation.subtasks || [];
    var created = [];
    var task = intake.getTask(taskId);
    var domain = (task === null || task === void 0 ? void 0 : task.domain) || 'general';
    var isCodeTask = deliberation.is_code_task || false;
    var _loop_1 = function (i) {
        var def = subtaskDefs[i];
        // Path validation for implement/claude subtasks on code tasks
        var validatedRead = def.files_to_read || [];
        var validatedWrite = def.files_to_write || [];
        var pathWarnings = [];
        if (isCodeTask && (def.stage === 'implement' || def.assigned_model === 'claude')) {
            var allPaths = __spreadArray(__spreadArray([], validatedRead, true), validatedWrite, true);
            if (allPaths.length > 0) {
                var validation_1 = repoScanner.validatePaths(allPaths);
                if (!validation_1.valid) {
                    validatedRead = validatedRead.filter(function (f) { return !validation_1.missing.includes(f); });
                    validatedWrite = validatedWrite.filter(function (f) { return !validation_1.missing.includes(f); });
                    pathWarnings = validation_1.missing;
                }
            }
            if (validatedRead.length === 0 && validatedWrite.length === 0 && def.stage === 'implement') {
                def._blocked_no_files = true;
            }
        }
        var st = intake.createSubtask({
            parent_task_id: taskId,
            title: def.title || "Subtask ".concat(i + 1),
            domain: domain,
            stage: def.stage || 'audit',
            assigned_role: def.assigned_role || 'general',
            assigned_model: def.assigned_model || 'openai',
            expected_output: def.expected_output || '',
            prompt: def.prompt || '',
            files_to_read: validatedRead,
            files_to_write: validatedWrite,
            risk_level: def.risk_level || 'green',
            approval_required: !!def.approval_required,
            depends_on: (def.depends_on || []).map(function (dep) {
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
    };
    for (var i = 0; i < subtaskDefs.length; i++) {
        _loop_1(i);
    }
    return created;
}
/**
 * Queue the first batch of subtasks that have no dependencies.
 */
function queueInitialSubtasks(taskId) {
    var subs = intake.getSubtasksForTask(taskId);
    var queued = [];
    for (var _i = 0, subs_2 = subs; _i < subs_2.length; _i++) {
        var s = subs_2[_i];
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
