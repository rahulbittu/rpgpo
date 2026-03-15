"use strict";
// GPO Data Export — Export operator data in various formats
Object.defineProperty(exports, "__esModule", { value: true });
exports.exportTasksCSV = exportTasksCSV;
exports.exportCostsCSV = exportCostsCSV;
exports.exportKnowledgeJSON = exportKnowledgeJSON;
exports.exportAnalyticsJSON = exportAnalyticsJSON;
const fs = require('fs');
const path = require('path');
const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
function exportTasksCSV() {
    try {
        const intake = require('./intake');
        const tasks = intake.getAllTasks();
        const headers = ['task_id', 'title', 'domain', 'status', 'urgency', 'risk_level', 'created_at', 'updated_at'];
        const rows = tasks.map((t) => headers.map(h => JSON.stringify(t[h] || '')).join(','));
        return [headers.join(','), ...rows].join('\n');
    }
    catch {
        return 'Error exporting tasks';
    }
}
function exportCostsCSV() {
    try {
        const costs = JSON.parse(fs.readFileSync(path.join(STATE_DIR, 'costs.json'), 'utf-8') || '[]');
        const headers = ['provider', 'model', 'cost', 'inputTokens', 'outputTokens', 'totalTokens', 'taskType', 'timestamp'];
        const rows = costs.map((c) => headers.map(h => JSON.stringify(c[h] || '')).join(','));
        return [headers.join(','), ...rows].join('\n');
    }
    catch {
        return 'Error exporting costs';
    }
}
function exportKnowledgeJSON() {
    try {
        const ls = require('./learning-store');
        return JSON.stringify(ls.getAllKnowledge(), null, 2);
    }
    catch {
        return '[]';
    }
}
function exportAnalyticsJSON() {
    try {
        const analytics = require('./analytics');
        return JSON.stringify(analytics.getAnalyticsSummary(30), null, 2);
    }
    catch {
        return '{}';
    }
}
module.exports = { exportTasksCSV, exportCostsCSV, exportKnowledgeJSON, exportAnalyticsJSON };
//# sourceMappingURL=data-export.js.map