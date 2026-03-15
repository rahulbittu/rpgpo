"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAggregatedMetrics = getAggregatedMetrics;
// GPO Metric Aggregator — Combine metrics from all sources
function getAggregatedMetrics() {
    const m = {};
    try {
        const intake = require('./intake');
        const t = intake.getAllTasks();
        m.total_tasks = t.length;
        m.done_tasks = t.filter((x) => x.status === 'done').length;
        m.failed_tasks = t.filter((x) => x.status === 'failed').length;
        m.success_rate = m.total_tasks > 0 ? m.done_tasks / m.total_tasks : 0;
    }
    catch { /* */ }
    try {
        const ls = require('./learning-store');
        const meta = ls.getLearningMeta();
        m.knowledge_entries = meta.recordCounts?.knowledgeEntries || 0;
        m.provider_records = meta.recordCounts?.providerPerf || 0;
    }
    catch { /* */ }
    try {
        const et = require('./error-tracker');
        const stats = et.getErrorStats();
        m.unresolved_errors = stats.unresolved || 0;
    }
    catch { /* */ }
    try {
        const costs = require('./costs');
        const s = costs.getSummary();
        m.cost_today = s.today?.cost || 0;
        m.cost_week = s.week?.cost || 0;
        m.calls_today = s.today?.calls || 0;
    }
    catch { /* */ }
    m.uptime_seconds = process.uptime();
    return m;
}
module.exports = { getAggregatedMetrics };
//# sourceMappingURL=metric-aggregator.js.map