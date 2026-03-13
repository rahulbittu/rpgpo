// RPGPO Workflow Engine — Auto-Continue Logic
// Manages subtask state machine and auto-queuing.
// Safety: Yellow/Red subtasks stop for approval. No auto-external actions.

const intake = require('./intake');
const queue = require('./queue');

/**
 * After a subtask completes (done or failed), decide what happens next.
 * - Green + success → auto-queue next safe subtask
 * - Yellow/Red → stop, surface approval
 * - Failed → create failure card, stop
 * Returns { action, next_subtask_ids, message }
 */
function onSubtaskComplete(subtaskId) {
  const st = intake.getSubtask(subtaskId);
  if (!st) return { action: 'error', message: 'Subtask not found' };

  const parentTask = intake.getTask(st.parent_task_id);
  if (!parentTask) return { action: 'error', message: 'Parent task not found' };

  const allSubs = intake.getSubtasksForTask(st.parent_task_id);

  // If subtask failed, create failure card and stop
  if (st.status === 'failed') {
    intake.updateSubtask(subtaskId, { status: 'failed' });
    // Block any subtask that depends on this one
    blockDependents(subtaskId, allSubs);
    // Check if all subtasks are terminal
    checkTaskCompletion(parentTask.task_id, allSubs);
    return {
      action: 'failed',
      message: `Subtask "${st.title}" failed: ${st.error || 'Unknown error'}`,
      next_subtask_ids: [],
    };
  }

  // Subtask succeeded — find next subtasks
  if (st.status !== 'done') return { action: 'noop', message: 'Subtask not in terminal state' };

  // Find subtasks that depend on this one and are now unblocked
  const nextReady = findReadySubtasks(subtaskId, allSubs);

  if (!nextReady.length) {
    // No more subtasks to run — check if task is complete
    checkTaskCompletion(parentTask.task_id, allSubs);
    return { action: 'complete', message: 'No more subtasks to queue', next_subtask_ids: [] };
  }

  const queued = [];
  const needsApproval = [];

  for (const next of nextReady) {
    if (next.risk_level === 'red' || next.risk_level === 'yellow' || next.approval_required) {
      // Stop for approval
      intake.updateSubtask(next.subtask_id, { status: 'waiting_approval' });
      needsApproval.push(next.subtask_id);
    } else {
      // Green + no approval needed → auto-queue
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
    if (s.status !== 'proposed') continue;
    if (!s.depends_on || !s.depends_on.length) continue;

    // Check if this subtask depends on the completed one (by index or id)
    const dependsOnCompleted = s.depends_on.some(dep => {
      // dep could be an index (number) or a subtask_id (string)
      if (typeof dep === 'number') {
        const depSub = allSubs[dep];
        return depSub && depSub.subtask_id === completedSubtaskId;
      }
      return dep === completedSubtaskId;
    });

    if (!dependsOnCompleted) continue;

    // Check if ALL dependencies are done
    const allDepsDone = s.depends_on.every(dep => {
      let depSub;
      if (typeof dep === 'number') {
        depSub = allSubs[dep];
      } else {
        depSub = allSubs.find(x => x.subtask_id === dep);
      }
      return depSub && depSub.status === 'done';
    });

    if (allDepsDone) ready.push(s);
  }
  return ready;
}

/**
 * Block subtasks that depend on a failed subtask.
 */
function blockDependents(failedSubtaskId, allSubs) {
  for (const s of allSubs) {
    if (s.status !== 'proposed' && s.status !== 'queued') continue;
    const depends = s.depends_on.some(dep => {
      if (typeof dep === 'number') {
        const depSub = allSubs[dep];
        return depSub && depSub.subtask_id === failedSubtaskId;
      }
      return dep === failedSubtaskId;
    });
    if (depends) {
      intake.updateSubtask(s.subtask_id, { status: 'blocked', error: `Blocked: dependency "${failedSubtaskId}" failed` });
    }
  }
}

/**
 * Check if all subtasks are in terminal state (done/failed/blocked/canceled).
 * If so, mark the parent task as done or failed.
 */
function checkTaskCompletion(taskId, allSubs) {
  const subs = allSubs || intake.getSubtasksForTask(taskId);
  if (!subs.length) return;

  // builder_fallback / waiting_human are stop states — not terminal, not auto-continuable
  const terminal = ['done', 'failed', 'blocked', 'canceled'];
  const stopping = ['builder_running', 'builder_fallback', 'waiting_approval', 'waiting_human'];
  const anyStopped = subs.some(s => stopping.includes(s.status));
  if (anyStopped) return; // Don't finalize while any subtask needs human action

  const allTerminal = subs.every(s => terminal.includes(s.status));
  if (!allTerminal) return;

  const anyFailed = subs.some(s => s.status === 'failed');
  intake.updateTask(taskId, { status: anyFailed ? 'failed' : 'done' });
}

/**
 * Materialize subtasks from a deliberation result into the subtask store.
 * Links them to the parent task and sets up dependency chains.
 */
function materializeSubtasks(taskId, deliberation) {
  const subtaskDefs = deliberation.subtasks || [];
  const created = [];

  for (let i = 0; i < subtaskDefs.length; i++) {
    const def = subtaskDefs[i];
    const st = intake.createSubtask({
      parent_task_id: taskId,
      title: def.title || `Subtask ${i + 1}`,
      domain: intake.getTask(taskId)?.domain || 'general',
      stage: def.stage || 'audit',
      assigned_role: def.assigned_role || 'general',
      assigned_model: def.assigned_model || 'openai',
      expected_output: def.expected_output || '',
      prompt: def.prompt || '',
      files_to_read: def.files_to_read || [],
      files_to_write: def.files_to_write || [],
      risk_level: def.risk_level || 'green',
      approval_required: !!def.approval_required,
      depends_on: (def.depends_on || []).map(dep => {
        // Convert index references to subtask_ids
        if (typeof dep === 'number' && dep < created.length) {
          return created[dep].subtask_id;
        }
        return dep;
      }),
      order: i,
    });
    created.push(st);
  }

  return created;
}

/**
 * Queue the first batch of subtasks that have no dependencies.
 * Returns subtask ids that were queued.
 */
function queueInitialSubtasks(taskId) {
  const subs = intake.getSubtasksForTask(taskId);
  const queued = [];

  for (const s of subs) {
    if (s.status !== 'proposed') continue;
    // No dependencies or empty deps → ready to run
    if (!s.depends_on || !s.depends_on.length) {
      if (s.risk_level === 'red' || s.risk_level === 'yellow' || s.approval_required) {
        intake.updateSubtask(s.subtask_id, { status: 'waiting_approval' });
      } else {
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

module.exports = {
  onSubtaskComplete,
  findReadySubtasks,
  blockDependents,
  checkTaskCompletion,
  materializeSubtasks,
  queueInitialSubtasks,
};
