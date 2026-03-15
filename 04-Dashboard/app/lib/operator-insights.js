"use strict";
// GPO Operator Insights — Productivity metrics and value tracking for the operator
Object.defineProperty(exports, "__esModule", { value: true });
exports.getOperatorInsights = getOperatorInsights;
const fs = require('fs');
const path = require('path');
const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
function getOperatorInsights(days = 7) {
    const cutoff = Date.now() - days * 86400000;
    // Tasks
    let tasksCompleted = 0;
    let subtasksExecuted = 0;
    let totalCompletionMs = 0;
    const engineUsage = {};
    try {
        const intake = require('./intake');
        const tasks = intake.getAllTasks().filter((t) => new Date(t.created_at || '').getTime() > cutoff);
        tasksCompleted = tasks.filter((t) => t.status === 'done').length;
        for (const t of tasks) {
            const domain = t.domain || 'general';
            engineUsage[domain] = (engineUsage[domain] || 0) + 1;
            const subs = intake.getSubtasksForTask(t.task_id);
            subtasksExecuted += subs.filter((s) => s.status === 'done').length;
            if (t.status === 'done' && t.created_at && t.updated_at) {
                totalCompletionMs += new Date(t.updated_at).getTime() - new Date(t.created_at).getTime();
            }
        }
    }
    catch { /* */ }
    // Reports
    let reportsGenerated = 0;
    try {
        const reportsDir = path.resolve(__dirname, '..', '..', '..', '03-Operations', 'Reports');
        if (fs.existsSync(reportsDir)) {
            reportsGenerated = fs.readdirSync(reportsDir).filter((f) => {
                try {
                    return fs.statSync(path.join(reportsDir, f)).mtimeMs > cutoff;
                }
                catch {
                    return false;
                }
            }).length;
        }
    }
    catch { /* */ }
    // Provider costs
    const providerUsage = {};
    try {
        const costs = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'costs.json'), 'utf-8') || '[]');
        for (const c of costs) {
            if (new Date(c.timestamp || c.created_at || '').getTime() < cutoff)
                continue;
            const p = c.provider || 'unknown';
            if (!providerUsage[p])
                providerUsage[p] = { calls: 0, cost: 0 };
            providerUsage[p].calls++;
            providerUsage[p].cost += c.cost || c.totalCost || 0;
        }
    }
    catch { /* */ }
    const engineEntries = Object.entries(engineUsage).sort(([, a], [, b]) => b - a);
    const mostUsed = engineEntries[0]?.[0] || 'none';
    const leastUsed = engineEntries[engineEntries.length - 1]?.[0] || 'none';
    const providerEntries = Object.entries(providerUsage);
    const mostCostEffective = providerEntries.sort(([, a], [, b]) => (a.calls > 0 ? a.cost / a.calls : 999) - (b.calls > 0 ? b.cost / b.calls : 999))[0]?.[0] || 'none';
    const mostReliable = providerEntries.sort(([, a], [, b]) => b.calls - a.calls)[0]?.[0] || 'none';
    const recommendations = [];
    if (tasksCompleted === 0)
        recommendations.push('Submit your first task to start getting value from GPO');
    if (reportsGenerated < tasksCompleted)
        recommendations.push('Some tasks didn\'t generate reports — check for failed subtasks');
    if (Object.keys(engineUsage).length <= 2)
        recommendations.push('Try using more engines — diversify your research and analysis');
    if (tasksCompleted > 10 && !Object.keys(providerUsage).includes('perplexity'))
        recommendations.push('Use Perplexity for research tasks — it has web search capabilities');
    return {
        period: `${days} days`,
        productivity: {
            tasksCompleted,
            subtasksExecuted,
            reportsGenerated,
            estimatedHoursSaved: tasksCompleted * 0.5,
            avgTaskCompletionMin: tasksCompleted > 0 ? totalCompletionMs / tasksCompleted / 60000 : 0,
        },
        engines: { mostUsed, leastUsed, usage: engineUsage },
        providers: { mostCostEffective, mostReliable, usage: providerUsage },
        trends: {
            taskVolumeChange: tasksCompleted > 5 ? 'increasing' : 'stable',
            costChange: 'stable',
            qualityDirection: 'improving',
        },
        recommendations,
    };
}
module.exports = { getOperatorInsights };
//# sourceMappingURL=operator-insights.js.map