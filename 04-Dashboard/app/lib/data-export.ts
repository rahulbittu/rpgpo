// GPO Data Export — Export operator data in various formats

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');

export function exportTasksCSV(): string {
  try {
    const intake = require('./intake') as { getAllTasks(): any[] };
    const tasks = intake.getAllTasks();
    const headers = ['task_id', 'title', 'domain', 'status', 'urgency', 'risk_level', 'created_at', 'updated_at'];
    const rows = tasks.map((t: any) => headers.map(h => JSON.stringify(t[h] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  } catch { return 'Error exporting tasks'; }
}

export function exportCostsCSV(): string {
  try {
    const costs = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'costs.json'), 'utf-8') || '[]');
    const headers = ['provider', 'model', 'cost', 'inputTokens', 'outputTokens', 'totalTokens', 'taskType', 'timestamp'];
    const rows = costs.map((c: any) => headers.map(h => JSON.stringify(c[h] || '')).join(','));
    return [headers.join(','), ...rows].join('\n');
  } catch { return 'Error exporting costs'; }
}

export function exportKnowledgeJSON(): string {
  try {
    const ls = require('./learning-store') as { getAllKnowledge(): any[] };
    return JSON.stringify(ls.getAllKnowledge(), null, 2);
  } catch { return '[]'; }
}

export function exportAnalyticsJSON(): string {
  try {
    const analytics = require('./analytics') as { getAnalyticsSummary(d: number): any };
    return JSON.stringify(analytics.getAnalyticsSummary(30), null, 2);
  } catch { return '{}'; }
}

module.exports = { exportTasksCSV, exportCostsCSV, exportKnowledgeJSON, exportAnalyticsJSON };
