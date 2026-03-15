// GPO Task Replay — Re-run completed tasks with same or modified parameters

export function replayTask(taskId: string, modifications?: { prompt?: string; domain?: string; urgency?: string }): { newTaskId: string; message: string } | null {
  try {
    const intake = require('./intake') as { getTask(id: string): any; createTask(data: any): any };
    const queue = require('./queue') as { addTask(type: string, label: string, meta: any): any };

    const original = intake.getTask(taskId);
    if (!original) return null;

    const newTask = intake.createTask({
      raw_request: modifications?.prompt || original.raw_request,
      domain: modifications?.domain || original.domain,
      urgency: modifications?.urgency || original.urgency,
      desired_outcome: original.desired_outcome,
      replay_of: taskId,
    });

    queue.addTask('deliberate', `Deliberate (replay): ${newTask.title}`, { taskId: newTask.task_id, autoApprove: true });

    return { newTaskId: newTask.task_id, message: `Replaying task "${original.title?.slice(0, 40)}" as ${newTask.task_id}` };
  } catch { return null; }
}

module.exports = { replayTask };
