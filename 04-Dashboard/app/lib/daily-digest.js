"use strict";
// GPO Daily Digest — Auto-generate morning/evening briefings
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateMorningDigest = generateMorningDigest;
exports.generateEveningWrap = generateEveningWrap;
function generateMorningDigest() {
    let digest = `# GPO Morning Digest\n**${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}**\n\n`;
    try {
        const intake = require('./intake');
        const tasks = intake.getAllTasks();
        const yesterday = Date.now() - 86400000;
        const recentDone = tasks.filter((t) => t.status === 'done' && new Date(t.updated_at || '').getTime() > yesterday);
        const active = tasks.filter((t) => !['done', 'failed', 'canceled'].includes(t.status));
        digest += `## Yesterday's Results\n- ${recentDone.length} tasks completed\n`;
        recentDone.slice(0, 5).forEach((t) => { digest += `- ${(t.title || t.raw_request || '').slice(0, 60)}\n`; });
        digest += `\n## Active Today\n- ${active.length} tasks in progress\n`;
        active.forEach((t) => { digest += `- [${t.status}] ${(t.title || '').slice(0, 50)}\n`; });
    }
    catch {
        digest += 'Could not load task data\n';
    }
    try {
        const costs = require('./costs');
        const s = costs.getSummary();
        digest += `\n## Costs\n- Yesterday: $${(s.today?.cost || 0).toFixed(4)} (${s.today?.calls || 0} calls)\n- This week: $${(s.week?.cost || 0).toFixed(4)}\n`;
    }
    catch { /* */ }
    try {
        const se = require('./suggestions-engine');
        const suggestions = se.getSuggestions(3);
        digest += `\n## Suggested Tasks\n`;
        suggestions.forEach((s) => { digest += `- **${s.title}**: ${s.description}\n`; });
    }
    catch { /* */ }
    return digest;
}
function generateEveningWrap() {
    let wrap = `# GPO Evening Wrap\n**${new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}**\n\n`;
    try {
        const intake = require('./intake');
        const today = new Date().toISOString().slice(0, 10);
        const todayTasks = intake.getAllTasks().filter((t) => (t.created_at || '').startsWith(today));
        const done = todayTasks.filter((t) => t.status === 'done');
        wrap += `## Today's Summary\n- ${todayTasks.length} tasks submitted\n- ${done.length} completed\n`;
        done.forEach((t) => { wrap += `- ${(t.title || t.raw_request || '').slice(0, 60)}\n`; });
    }
    catch { /* */ }
    try {
        const analytics = require('./analytics');
        const s = analytics.getAnalyticsSummary(1);
        wrap += `\n## Metrics\n- Success rate: ${(s.tasks?.successRate * 100 || 0).toFixed(0)}%\n- Hours saved: ${s.productivity?.estimatedHoursSaved || 0}\n- Reports: ${s.quality?.reportsGenerated || 0}\n`;
    }
    catch { /* */ }
    return wrap;
}
module.exports = { generateMorningDigest, generateEveningWrap };
