// GPO Task Estimator — Predict task duration and cost before execution

export interface TaskEstimate {
  estimatedDurationMs: number;
  estimatedCostUsd: number;
  estimatedSubtasks: number;
  confidence: number;
  basedOn: number;
}

export function estimateTask(domain: string, promptLength: number): TaskEstimate {
  try {
    const intake = require('./intake') as { getAllTasks(): any[]; getSubtasksForTask(id: string): any[] };
    const tasks = intake.getAllTasks().filter((t: any) => t.domain === domain && t.status === 'done');

    if (tasks.length < 2) {
      return { estimatedDurationMs: 120000, estimatedCostUsd: 0.02, estimatedSubtasks: 4, confidence: 0.2, basedOn: 0 };
    }

    const durations = tasks.map((t: any) => {
      const created = new Date(t.created_at || '').getTime();
      const updated = new Date(t.updated_at || t.created_at || '').getTime();
      return updated - created;
    }).filter(d => d > 0 && d < 3600000);

    const subtaskCounts = tasks.map((t: any) => intake.getSubtasksForTask(t.task_id).length);

    const avgDuration = durations.length > 0 ? durations.reduce((s, d) => s + d, 0) / durations.length : 120000;
    const avgSubtasks = subtaskCounts.length > 0 ? subtaskCounts.reduce((s, c) => s + c, 0) / subtaskCounts.length : 4;

    // Estimate cost based on prompt length and subtask count
    const costPerSubtask = 0.005; // ~$0.005 per subtask
    const estimatedCost = avgSubtasks * costPerSubtask;

    const confidence = Math.min(1, tasks.length / 10);

    return {
      estimatedDurationMs: Math.round(avgDuration),
      estimatedCostUsd: Math.round(estimatedCost * 10000) / 10000,
      estimatedSubtasks: Math.round(avgSubtasks),
      confidence,
      basedOn: tasks.length,
    };
  } catch {
    return { estimatedDurationMs: 120000, estimatedCostUsd: 0.02, estimatedSubtasks: 4, confidence: 0.1, basedOn: 0 };
  }
}

module.exports = { estimateTask };
