"use strict";
// GPO Analytics — Productivity metrics, cost efficiency, engine usage, value insights
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsSummary = getAnalyticsSummary;
exports.getCostTrend = getCostTrend;
exports.getTaskTrend = getTaskTrend;
const fs = require('fs');
const path = require('path');
const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function getAnalyticsSummary(days = 7) {
    const now = Date.now();
    const cutoff = now - days * 86400000;
    // Load intake tasks
    const intakeTasks = readJson(path.join(STATE_DIR, 'intake-tasks.json'), []);
    const periodTasks = intakeTasks.filter((t) => {
        const ts = new Date(t.created_at || '').getTime();
        return ts > cutoff;
    });
    const completed = periodTasks.filter((t) => t.status === 'done');
    const failed = periodTasks.filter((t) => t.status === 'failed');
    // Load costs
    const costs = readJson(path.join(STATE_DIR, 'costs.json'), []);
    const periodCosts = costs.filter((c) => {
        const ts = new Date(c.timestamp || c.created_at || '').getTime();
        return ts > cutoff;
    });
    const totalCostUsd = periodCosts.reduce((s, c) => s + (c.cost || c.totalCost || 0), 0);
    const byProvider = {};
    for (const c of periodCosts) {
        const p = c.provider || 'unknown';
        byProvider[p] = (byProvider[p] || 0) + (c.cost || c.totalCost || 0);
    }
    // Engine usage
    const engineUsage = {};
    for (const t of periodTasks) {
        const e = t.domain || 'general';
        engineUsage[e] = (engineUsage[e] || 0) + 1;
    }
    const topEngine = Object.entries(engineUsage).sort(([, a], [, b]) => b - a)[0]?.[0] || 'none';
    // Productivity
    const tasksPerDay = periodTasks.length / Math.max(1, days);
    const completionTimes = completed.map((t) => {
        const created = new Date(t.created_at || '').getTime();
        const updated = new Date(t.updated_at || t.created_at || '').getTime();
        return updated - created;
    }).filter((ms) => ms > 0 && ms < 86400000);
    const avgCompletionMs = completionTimes.length > 0 ? completionTimes.reduce((s, v) => s + v, 0) / completionTimes.length : 0;
    // Estimated hours saved (rough: each completed research task saves ~30min of manual work)
    const estimatedHoursSaved = completed.length * 0.5;
    // Quality
    const subtaskCounts = completed.map((t) => t.board_deliberation?.subtasks?.length || 0);
    const avgSubtasks = subtaskCounts.length > 0 ? subtaskCounts.reduce((s, v) => s + v, 0) / subtaskCounts.length : 0;
    // Reports
    const reportsDir = path.resolve(__dirname, '..', '..', '..', '03-Operations', 'Reports');
    let reportsGenerated = 0;
    try {
        if (fs.existsSync(reportsDir)) {
            const reportFiles = fs.readdirSync(reportsDir);
            reportsGenerated = reportFiles.filter((f) => {
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
    return {
        period: { from: new Date(cutoff).toISOString(), to: new Date(now).toISOString() },
        tasks: { total: periodTasks.length, completed: completed.length, failed: failed.length, successRate: periodTasks.length > 0 ? completed.length / periodTasks.length : 0 },
        cost: { totalUsd: totalCostUsd, avgPerTask: periodTasks.length > 0 ? totalCostUsd / periodTasks.length : 0, byProvider },
        engines: { usage: engineUsage, topEngine },
        productivity: { tasksPerDay, avgCompletionMs, estimatedHoursSaved },
        quality: { avgSubtasksPerTask: avgSubtasks, reportsGenerated },
    };
}
function getCostTrend(days = 30) {
    const costs = readJson(path.join(STATE_DIR, 'costs.json'), []);
    const cutoff = Date.now() - days * 86400000;
    const points = [];
    // Group by day
    const byDay = {};
    for (const c of costs) {
        const ts = new Date(c.timestamp || c.created_at || '').getTime();
        if (ts < cutoff)
            continue;
        const day = new Date(ts).toISOString().slice(0, 10);
        byDay[day] = (byDay[day] || 0) + (c.cost || c.totalCost || 0);
    }
    for (const [day, cost] of Object.entries(byDay).sort()) {
        points.push({ t: day, v: cost });
    }
    return { key: 'cost.daily', label: 'Daily Cost', unit: 'usd', points };
}
function getTaskTrend(days = 30) {
    const tasks = readJson(path.join(STATE_DIR, 'intake-tasks.json'), []);
    const cutoff = Date.now() - days * 86400000;
    const points = [];
    const byDay = {};
    for (const t of tasks) {
        const ts = new Date(t.created_at || '').getTime();
        if (ts < cutoff)
            continue;
        const day = new Date(ts).toISOString().slice(0, 10);
        byDay[day] = (byDay[day] || 0) + 1;
    }
    for (const [day, count] of Object.entries(byDay).sort()) {
        points.push({ t: day, v: count });
    }
    return { key: 'tasks.daily', label: 'Daily Tasks', unit: 'count', points };
}
module.exports = { getAnalyticsSummary, getCostTrend, getTaskTrend };
