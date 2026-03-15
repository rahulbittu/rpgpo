// GPO Metric Aggregator — Combine metrics from all sources
export function getAggregatedMetrics(): Record<string, number> {
  const m: Record<string, number> = {};
  try { const intake = require('./intake') as any; const t = intake.getAllTasks(); m.total_tasks = t.length; m.done_tasks = t.filter((x: any) => x.status === 'done').length; m.failed_tasks = t.filter((x: any) => x.status === 'failed').length; m.success_rate = m.total_tasks > 0 ? m.done_tasks / m.total_tasks : 0; } catch { /* */ }
  try { const ls = require('./learning-store') as any; const meta = ls.getLearningMeta(); m.knowledge_entries = meta.recordCounts?.knowledgeEntries || 0; m.provider_records = meta.recordCounts?.providerPerf || 0; } catch { /* */ }
  try { const et = require('./error-tracker') as any; const stats = et.getErrorStats(); m.unresolved_errors = stats.unresolved || 0; } catch { /* */ }
  try { const costs = require('./costs') as any; const s = costs.getSummary(); m.cost_today = s.today?.cost || 0; m.cost_week = s.week?.cost || 0; m.calls_today = s.today?.calls || 0; } catch { /* */ }
  m.uptime_seconds = process.uptime();
  return m;
}
module.exports = { getAggregatedMetrics };
