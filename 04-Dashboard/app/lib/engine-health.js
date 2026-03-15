"use strict";
// GPO Engine Health — Track per-engine task success rates and performance
Object.defineProperty(exports, "__esModule", { value: true });
exports.getEngineHealthReport = getEngineHealthReport;
const ENGINE_NAMES = {
    topranker: 'TopRanker', newsroom: 'News & Intelligence', wealthresearch: 'Income & Wealth',
    career: 'Career & Growth', careeregine: 'Career Engine', chief_of_staff: 'Planning & Strategy',
    research: 'Research & Analysis', finance: 'Finance', communications: 'Writing & Comms',
    startup: 'Code & Build', general: 'General',
};
function getEngineHealthReport() {
    try {
        const intake = require('./intake');
        const tasks = intake.getAllTasks();
        const byEngine = {};
        for (const t of tasks) {
            const e = t.domain || 'general';
            if (!byEngine[e])
                byEngine[e] = [];
            byEngine[e].push(t);
        }
        return Object.entries(byEngine).map(([engineId, engineTasks]) => {
            const done = engineTasks.filter(t => t.status === 'done');
            const successRate = engineTasks.length > 0 ? done.length / engineTasks.length : 0;
            const subtaskCounts = done.map(t => intake.getSubtasksForTask(t.task_id).length);
            const avgSubtasks = subtaskCounts.length > 0 ? subtaskCounts.reduce((s, c) => s + c, 0) / subtaskCounts.length : 0;
            const completionTimes = done.map(t => {
                const c = new Date(t.created_at || '').getTime();
                const u = new Date(t.updated_at || '').getTime();
                return u - c;
            }).filter(ms => ms > 0 && ms < 3600000);
            const avgMs = completionTimes.length > 0 ? completionTimes.reduce((s, v) => s + v, 0) / completionTimes.length : 0;
            const providers = new Set();
            for (const t of done.slice(-5)) {
                const subs = intake.getSubtasksForTask(t.task_id);
                subs.forEach((s) => { if (s.assigned_model)
                    providers.add(s.assigned_model); });
            }
            const health = successRate > 0.9 ? 'excellent' : successRate > 0.7 ? 'good' : successRate > 0.5 ? 'fair' : 'poor';
            return {
                engineId, displayName: ENGINE_NAMES[engineId] || engineId,
                totalTasks: engineTasks.length, successRate, avgSubtasks: Math.round(avgSubtasks * 10) / 10,
                avgCompletionMs: Math.round(avgMs),
                topProviders: [...providers].slice(0, 3),
                recentTasks: engineTasks.slice(-3).reverse().map(t => ({ taskId: t.task_id, title: (t.title || '').slice(0, 50), status: t.status })),
                health,
            };
        }).sort((a, b) => b.totalTasks - a.totalTasks);
    }
    catch {
        return [];
    }
}
module.exports = { getEngineHealthReport };
