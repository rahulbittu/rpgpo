"use strict";
// GPO Output Summarizer — Generate concise summaries from task outputs
Object.defineProperty(exports, "__esModule", { value: true });
exports.summarizeTaskOutput = summarizeTaskOutput;
exports.summarizeAllCompleted = summarizeAllCompleted;
function summarizeTaskOutput(taskId) {
    try {
        const intake = require('./intake');
        const task = intake.getTask(taskId);
        if (!task)
            return null;
        const subtasks = intake.getSubtasksForTask(taskId);
        const doneSubs = subtasks.filter((s) => s.status === 'done');
        const allOutput = doneSubs.map((s) => s.what_done || s.output || '').join('\n\n');
        if (!allOutput)
            return { summary: 'No output available', keyPoints: [], reportCount: 0 };
        // Extract key points
        const keyPoints = [];
        const lines = allOutput.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 10) {
                keyPoints.push(trimmed.replace(/\*\*/g, ''));
            }
            else if (trimmed.startsWith('- ') && trimmed.length > 15 && trimmed.length < 200) {
                keyPoints.push(trimmed.slice(2));
            }
        }
        // Build summary
        const objective = task.board_deliberation?.interpreted_objective || task.title || '';
        const subtaskSummaries = doneSubs.map((s) => `${s.title}: ${(s.what_done || '').slice(0, 80)}`).join('; ');
        const summary = `${objective}\n\nCompleted ${doneSubs.length}/${subtasks.length} subtasks. ${subtaskSummaries.slice(0, 300)}`;
        const reportCount = doneSubs.filter((s) => s.report_file).length;
        return { summary: summary.slice(0, 500), keyPoints: [...new Set(keyPoints)].slice(0, 10), reportCount };
    }
    catch {
        return null;
    }
}
function summarizeAllCompleted() {
    try {
        const intake = require('./intake');
        return intake.getAllTasks()
            .filter((t) => t.status === 'done')
            .slice(-10)
            .map((t) => {
            const result = summarizeTaskOutput(t.task_id);
            return {
                taskId: t.task_id,
                title: (t.title || t.raw_request || '').slice(0, 60),
                summary: result?.summary?.slice(0, 200) || 'No summary',
                keyPointCount: result?.keyPoints?.length || 0,
            };
        });
    }
    catch {
        return [];
    }
}
module.exports = { summarizeTaskOutput, summarizeAllCompleted };
//# sourceMappingURL=output-summarizer.js.map