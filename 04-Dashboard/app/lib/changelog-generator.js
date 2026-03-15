"use strict";
// GPO Changelog Generator — Auto-generate changelog from task history
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateChangelog = generateChangelog;
const fs = require('fs');
const path = require('path');
function generateChangelog(days = 7) {
    let changelog = `# GPO Activity Report\n\nGenerated: ${new Date().toISOString()}\nPeriod: Last ${days} days\n\n`;
    const cutoff = Date.now() - days * 86400000;
    try {
        const intake = require('./intake');
        const tasks = intake.getAllTasks().filter((t) => new Date(t.created_at || '').getTime() > cutoff);
        const done = tasks.filter((t) => t.status === 'done');
        const failed = tasks.filter((t) => t.status === 'failed');
        changelog += `## Summary\n- ${tasks.length} tasks submitted\n- ${done.length} completed successfully\n- ${failed.length} failed\n- ${(done.length / Math.max(1, tasks.length) * 100).toFixed(0)}% success rate\n\n`;
        // Group by domain
        const byDomain = {};
        for (const t of done) {
            const d = t.domain || 'general';
            if (!byDomain[d])
                byDomain[d] = [];
            byDomain[d].push(t);
        }
        changelog += `## Completed Tasks by Engine\n\n`;
        for (const [domain, domainTasks] of Object.entries(byDomain).sort(([, a], [, b]) => b.length - a.length)) {
            changelog += `### ${domain} (${domainTasks.length})\n`;
            for (const t of domainTasks) {
                const objective = t.board_deliberation?.interpreted_objective || t.title || '';
                changelog += `- ${objective.slice(0, 100)}\n`;
            }
            changelog += '\n';
        }
        if (failed.length > 0) {
            changelog += `## Failed Tasks\n`;
            for (const t of failed) {
                changelog += `- ${(t.title || t.raw_request || '').slice(0, 80)} (${t.domain})\n`;
            }
            changelog += '\n';
        }
    }
    catch {
        changelog += 'Error generating task summary\n';
    }
    // Cost summary
    try {
        const analytics = require('./analytics');
        const summary = analytics.getAnalyticsSummary(days);
        changelog += `## Costs\n- Total: $${summary.cost.totalUsd.toFixed(4)}\n- Average per task: $${summary.cost.avgPerTask.toFixed(4)}\n`;
        for (const [provider, cost] of Object.entries(summary.cost.byProvider)) {
            changelog += `- ${provider}: $${cost.toFixed(4)}\n`;
        }
        changelog += '\n';
    }
    catch { /* */ }
    return changelog;
}
module.exports = { generateChangelog };
