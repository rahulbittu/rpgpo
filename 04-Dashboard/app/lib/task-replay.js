"use strict";
// GPO Task Replay — Re-run completed tasks with same or modified parameters
Object.defineProperty(exports, "__esModule", { value: true });
exports.replayTask = replayTask;
function replayTask(taskId, modifications) {
    try {
        const intake = require('./intake');
        const queue = require('./queue');
        const original = intake.getTask(taskId);
        if (!original)
            return null;
        const newTask = intake.createTask({
            raw_request: modifications?.prompt || original.raw_request,
            domain: modifications?.domain || original.domain,
            urgency: modifications?.urgency || original.urgency,
            desired_outcome: original.desired_outcome,
            replay_of: taskId,
        });
        queue.addTask('deliberate', `Deliberate (replay): ${newTask.title}`, { taskId: newTask.task_id, autoApprove: true });
        return { newTaskId: newTask.task_id, message: `Replaying task "${original.title?.slice(0, 40)}" as ${newTask.task_id}` };
    }
    catch {
        return null;
    }
}
module.exports = { replayTask };
