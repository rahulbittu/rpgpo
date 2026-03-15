// GPO Task Prioritizer — Intelligent task queue ordering for maximum value

export interface PrioritizedTask {
  taskId: string;
  title: string;
  domain: string;
  urgency: string;
  score: number;
  factors: {
    urgencyWeight: number;
    priorityAlignment: number;
    engineCapacity: number;
    costEfficiency: number;
    historicalSuccess: number;
  };
}

export function prioritizeTasks(): PrioritizedTask[] {
  try {
    const intake = require('./intake') as { getAllTasks(): any[] };
    const tasks = intake.getAllTasks().filter((t: any) => !['done', 'failed', 'canceled'].includes(t.status));

    if (tasks.length === 0) return [];

    const prioritized: PrioritizedTask[] = tasks.map((t: any) => {
      const urgencyWeight = getUrgencyWeight(t.urgency);
      const priorityAlignment = getPriorityAlignment(t.domain);
      const engineCapacity = getEngineCapacity(t.domain);
      const costEfficiency = getCostEfficiency(t.domain);
      const historicalSuccess = getHistoricalSuccess(t.domain);

      const score = urgencyWeight * 0.3 + priorityAlignment * 0.25 + engineCapacity * 0.15 + costEfficiency * 0.15 + historicalSuccess * 0.15;

      return {
        taskId: t.task_id,
        title: (t.title || t.raw_request || '').slice(0, 80),
        domain: t.domain || 'general',
        urgency: t.urgency || 'normal',
        score,
        factors: { urgencyWeight, priorityAlignment, engineCapacity, costEfficiency, historicalSuccess },
      };
    });

    return prioritized.sort((a, b) => b.score - a.score);
  } catch { return []; }
}

function getUrgencyWeight(urgency: string): number {
  switch (urgency) {
    case 'critical': return 1.0;
    case 'high': return 0.8;
    case 'normal': return 0.5;
    case 'low': return 0.2;
    default: return 0.5;
  }
}

function getPriorityAlignment(domain: string): number {
  const highPriority = ['topranker', 'wealthresearch', 'newsroom', 'career', 'careeregine', 'research'];
  const medium = ['chief_of_staff', 'finance', 'communications'];
  if (highPriority.includes(domain)) return 0.9;
  if (medium.includes(domain)) return 0.6;
  return 0.4;
}

function getEngineCapacity(domain: string): number {
  // All engines have capacity in current setup
  return 0.8;
}

function getCostEfficiency(domain: string): number {
  // Research tasks via Perplexity are cheapest
  const cheap = ['newsroom', 'research'];
  const medium = ['wealthresearch', 'career', 'careeregine'];
  if (cheap.includes(domain)) return 0.9;
  if (medium.includes(domain)) return 0.7;
  return 0.5;
}

function getHistoricalSuccess(domain: string): number {
  try {
    const intake = require('./intake') as { getAllTasks(): any[] };
    const domainTasks = intake.getAllTasks().filter((t: any) => t.domain === domain);
    const done = domainTasks.filter((t: any) => t.status === 'done').length;
    if (domainTasks.length < 3) return 0.5;
    return done / domainTasks.length;
  } catch { return 0.5; }
}

module.exports = { prioritizeTasks };
