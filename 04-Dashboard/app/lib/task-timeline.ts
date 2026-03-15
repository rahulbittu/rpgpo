// GPO Task Timeline — Generate chronological timeline of all task events

export interface TimelineEvent {
  timestamp: number;
  type: 'task_created' | 'deliberation' | 'plan_ready' | 'subtask_start' | 'subtask_done' | 'subtask_failed' | 'task_done' | 'task_failed';
  taskId: string;
  title: string;
  detail?: string;
  model?: string;
  domain?: string;
}

export function getTimeline(days: number = 7, limit: number = 100): TimelineEvent[] {
  const events: TimelineEvent[] = [];
  const cutoff = Date.now() - days * 86400000;

  try {
    const intake = require('./intake') as { getAllTasks(): any[]; getSubtasksForTask(id: string): any[] };
    const tasks = intake.getAllTasks().filter((t: any) => new Date(t.created_at || '').getTime() > cutoff);

    for (const t of tasks) {
      const ts = new Date(t.created_at || '').getTime();
      events.push({ timestamp: ts, type: 'task_created', taskId: t.task_id, title: (t.title || t.raw_request || '').slice(0, 60), domain: t.domain });

      if (t.board_deliberation) {
        events.push({ timestamp: ts + 1000, type: 'deliberation', taskId: t.task_id, title: `Board deliberated: ${(t.board_deliberation.interpreted_objective || '').slice(0, 60)}`, detail: t.board_deliberation.risk_level });
        events.push({ timestamp: ts + 2000, type: 'plan_ready', taskId: t.task_id, title: `Plan ready: ${t.board_deliberation.subtasks?.length || 0} subtasks` });
      }

      const subtasks = intake.getSubtasksForTask(t.task_id);
      for (const s of subtasks) {
        if (s.status === 'done') {
          events.push({ timestamp: new Date(s.updated_at || s.created_at || '').getTime(), type: 'subtask_done', taskId: t.task_id, title: s.title?.slice(0, 50), detail: (s.what_done || '').slice(0, 80), model: s.assigned_model });
        } else if (s.status === 'failed') {
          events.push({ timestamp: new Date(s.updated_at || '').getTime(), type: 'subtask_failed', taskId: t.task_id, title: s.title?.slice(0, 50), detail: s.error?.slice(0, 80) });
        }
      }

      if (t.status === 'done') {
        events.push({ timestamp: new Date(t.updated_at || '').getTime(), type: 'task_done', taskId: t.task_id, title: `Completed: ${(t.title || '').slice(0, 50)}` });
      } else if (t.status === 'failed') {
        events.push({ timestamp: new Date(t.updated_at || '').getTime(), type: 'task_failed', taskId: t.task_id, title: `Failed: ${(t.title || '').slice(0, 50)}` });
      }
    }
  } catch { /* */ }

  return events.sort((a, b) => b.timestamp - a.timestamp).slice(0, limit);
}

module.exports = { getTimeline };
