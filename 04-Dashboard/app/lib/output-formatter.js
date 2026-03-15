"use strict";
// GPO Output Formatter — Transform raw task outputs into polished formats
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatAsExecutiveBrief = formatAsExecutiveBrief;
exports.formatAsSlackMessage = formatAsSlackMessage;
exports.formatAsJSON = formatAsJSON;
function formatAsExecutiveBrief(taskId) {
    try {
        const intake = require('./intake');
        const task = intake.getTask(taskId);
        if (!task)
            return 'Task not found';
        const subtasks = intake.getSubtasksForTask(taskId);
        const done = subtasks.filter((s) => s.status === 'done');
        let brief = `# Executive Brief\n\n`;
        brief += `**Task:** ${task.title || task.raw_request}\n`;
        brief += `**Engine:** ${task.domain}\n`;
        brief += `**Status:** ${task.status}\n`;
        brief += `**Subtasks:** ${done.length}/${subtasks.length} completed\n\n`;
        if (task.board_deliberation) {
            brief += `## Objective\n${task.board_deliberation.interpreted_objective}\n\n`;
            brief += `## Strategy\n${task.board_deliberation.recommended_strategy}\n\n`;
        }
        brief += `## Key Findings\n`;
        for (const s of done) {
            brief += `\n### ${s.title}\n${(s.what_done || s.output || '').slice(0, 500)}\n`;
        }
        return brief;
    }
    catch {
        return 'Error formatting output';
    }
}
function formatAsSlackMessage(taskId) {
    try {
        const intake = require('./intake');
        const task = intake.getTask(taskId);
        if (!task)
            return { text: 'Task not found' };
        return {
            text: `GPO Task Complete: ${task.title || task.raw_request}\nStatus: ${task.status}\nEngine: ${task.domain}`,
        };
    }
    catch {
        return { text: 'Error' };
    }
}
function formatAsJSON(taskId) {
    try {
        const intake = require('./intake');
        const task = intake.getTask(taskId);
        if (!task)
            return null;
        const subtasks = intake.getSubtasksForTask(taskId);
        return {
            task: { id: task.task_id, title: task.title, domain: task.domain, status: task.status },
            deliberation: task.board_deliberation ? { objective: task.board_deliberation.interpreted_objective, strategy: task.board_deliberation.recommended_strategy, risk: task.board_deliberation.risk_level } : null,
            subtasks: subtasks.map((s) => ({ title: s.title, status: s.status, model: s.assigned_model, output: (s.what_done || '').slice(0, 200) })),
        };
    }
    catch {
        return null;
    }
}
module.exports = { formatAsExecutiveBrief, formatAsSlackMessage, formatAsJSON };
//# sourceMappingURL=output-formatter.js.map