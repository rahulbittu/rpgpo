// GPO Analytics — Productivity metrics, cost efficiency, engine usage, value insights

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');

function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }

export interface AnalyticsPoint { t: string; v: number; }
export interface MetricSeries { key: string; label: string; unit: string; points: AnalyticsPoint[]; }

export interface AnalyticsSummary {
  period: { from: string; to: string };
  tasks: { total: number; completed: number; failed: number; successRate: number };
  cost: { totalUsd: number; avgPerTask: number; byProvider: Record<string, number> };
  engines: { usage: Record<string, number>; topEngine: string };
  productivity: { tasksPerDay: number; avgCompletionMs: number; estimatedHoursSaved: number };
  quality: { avgSubtasksPerTask: number; reportsGenerated: number };
}

export function getAnalyticsSummary(days: number = 7): AnalyticsSummary {
  const now = Date.now();
  const cutoff = now - days * 86400000;

  // Load intake tasks
  const intakeTasks = readJson<any[]>(path.join(STATE_DIR, 'intake-tasks.json'), []);
  const periodTasks = intakeTasks.filter((t: any) => {
    const ts = new Date(t.created_at || '').getTime();
    return ts > cutoff;
  });

  const completed = periodTasks.filter((t: any) => t.status === 'done');
  const failed = periodTasks.filter((t: any) => t.status === 'failed');

  // Load costs
  const costs = readJson<any[]>(path.join(STATE_DIR, 'costs.json'), []);
  const periodCosts = costs.filter((c: any) => {
    const ts = new Date(c.timestamp || c.created_at || '').getTime();
    return ts > cutoff;
  });

  const totalCostUsd = periodCosts.reduce((s: number, c: any) => s + (c.cost || c.totalCost || 0), 0);
  const byProvider: Record<string, number> = {};
  for (const c of periodCosts) {
    const p = c.provider || 'unknown';
    byProvider[p] = (byProvider[p] || 0) + (c.cost || c.totalCost || 0);
  }

  // Engine usage
  const engineUsage: Record<string, number> = {};
  for (const t of periodTasks) {
    const e = t.domain || 'general';
    engineUsage[e] = (engineUsage[e] || 0) + 1;
  }
  const topEngine = Object.entries(engineUsage).sort(([,a], [,b]) => (b as number) - (a as number))[0]?.[0] || 'none';

  // Productivity
  const tasksPerDay = periodTasks.length / Math.max(1, days);
  const completionTimes = completed.map((t: any) => {
    const created = new Date(t.created_at || '').getTime();
    const updated = new Date(t.updated_at || t.created_at || '').getTime();
    return updated - created;
  }).filter((ms: number) => ms > 0 && ms < 86400000);
  const avgCompletionMs = completionTimes.length > 0 ? completionTimes.reduce((s: number, v: number) => s + v, 0) / completionTimes.length : 0;

  // Estimated hours saved (rough: each completed research task saves ~30min of manual work)
  const estimatedHoursSaved = completed.length * 0.5;

  // Quality
  const subtaskCounts = completed.map((t: any) => t.board_deliberation?.subtasks?.length || 0);
  const avgSubtasks = subtaskCounts.length > 0 ? subtaskCounts.reduce((s: number, v: number) => s + v, 0) / subtaskCounts.length : 0;

  // Reports
  const reportsDir = path.resolve(__dirname, '..', '..', '..', '03-Operations', 'Reports');
  let reportsGenerated = 0;
  try {
    if (fs.existsSync(reportsDir)) {
      const reportFiles = fs.readdirSync(reportsDir);
      reportsGenerated = reportFiles.filter((f: string) => {
        try { return fs.statSync(path.join(reportsDir, f)).mtimeMs > cutoff; } catch { return false; }
      }).length;
    }
  } catch { /* */ }

  return {
    period: { from: new Date(cutoff).toISOString(), to: new Date(now).toISOString() },
    tasks: { total: periodTasks.length, completed: completed.length, failed: failed.length, successRate: periodTasks.length > 0 ? completed.length / periodTasks.length : 0 },
    cost: { totalUsd: totalCostUsd, avgPerTask: periodTasks.length > 0 ? totalCostUsd / periodTasks.length : 0, byProvider },
    engines: { usage: engineUsage, topEngine },
    productivity: { tasksPerDay, avgCompletionMs, estimatedHoursSaved },
    quality: { avgSubtasksPerTask: avgSubtasks, reportsGenerated },
  };
}

export function getCostTrend(days: number = 30): MetricSeries {
  const costs = readJson<any[]>(path.join(STATE_DIR, 'costs.json'), []);
  const cutoff = Date.now() - days * 86400000;
  const points: AnalyticsPoint[] = [];

  // Group by day
  const byDay: Record<string, number> = {};
  for (const c of costs) {
    const ts = new Date(c.timestamp || c.created_at || '').getTime();
    if (ts < cutoff) continue;
    const day = new Date(ts).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + (c.cost || c.totalCost || 0);
  }

  for (const [day, cost] of Object.entries(byDay).sort()) {
    points.push({ t: day, v: cost });
  }

  return { key: 'cost.daily', label: 'Daily Cost', unit: 'usd', points };
}

export function getTaskTrend(days: number = 30): MetricSeries {
  const tasks = readJson<any[]>(path.join(STATE_DIR, 'intake-tasks.json'), []);
  const cutoff = Date.now() - days * 86400000;
  const points: AnalyticsPoint[] = [];

  const byDay: Record<string, number> = {};
  for (const t of tasks) {
    const ts = new Date(t.created_at || '').getTime();
    if (ts < cutoff) continue;
    const day = new Date(ts).toISOString().slice(0, 10);
    byDay[day] = (byDay[day] || 0) + 1;
  }

  for (const [day, count] of Object.entries(byDay).sort()) {
    points.push({ t: day, v: count });
  }

  return { key: 'tasks.daily', label: 'Daily Tasks', unit: 'count', points };
}

module.exports = { getAnalyticsSummary, getCostTrend, getTaskTrend };
