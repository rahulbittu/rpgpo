"use strict";
// GPO Context Enrichment — Auto-extract insights from completed tasks into knowledge base
Object.defineProperty(exports, "__esModule", { value: true });
exports.enrichFromCompletedTask = enrichFromCompletedTask;
exports.getRelevantKnowledge = getRelevantKnowledge;
exports.enrichAllPending = enrichAllPending;
const fs = require('fs');
const path = require('path');
const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
/**
 * Extract insights from a completed task and add to the knowledge base.
 */
function enrichFromCompletedTask(taskId) {
    try {
        const intake = require('./intake');
        const task = intake.getTask(taskId);
        if (!task || task.status !== 'done')
            return { added: false };
        const subtasks = intake.getSubtasksForTask(taskId);
        const doneSubs = subtasks.filter((s) => s.status === 'done');
        if (doneSubs.length === 0)
            return { added: false };
        // Extract insights from subtask outputs
        const insights = [];
        const allOutput = doneSubs.map((s) => s.what_done || s.output || '').join('\n');
        // Extract key points (lines starting with **, -, or containing specific patterns)
        const lines = allOutput.split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                insights.push(trimmed.replace(/\*\*/g, '').trim());
            }
            else if (trimmed.startsWith('- ') && trimmed.length > 20 && trimmed.length < 200) {
                insights.push(trimmed.slice(2).trim());
            }
            else if (trimmed.match(/^\d+\.\s/) && trimmed.length > 20) {
                insights.push(trimmed.replace(/^\d+\.\s*/, '').trim());
            }
        }
        // Deduplicate and limit
        const uniqueInsights = [...new Set(insights)].slice(0, 10);
        if (uniqueInsights.length === 0)
            return { added: false };
        // Add to knowledge base
        const ls = require('./learning-store');
        const knowledgeId = ls.addKnowledgeEntry({
            tenantId: 'rpgpo',
            projectId: task.project_id || 'default',
            contractName: task.domain || 'general',
            engineId: task.domain || 'general',
            domainTags: extractTags(task.raw_request || task.title || ''),
            title: (task.title || task.raw_request || '').slice(0, 100),
            insights: uniqueInsights,
            promptTips: [],
            providerRanking: [...new Set(doneSubs.map((s) => s.assigned_model).filter(Boolean))],
            source: { deliverableId: taskId },
            createdAt: Date.now(),
        });
        return { added: true, knowledgeId, insights: uniqueInsights };
    }
    catch (e) {
        console.log(`[context-enrichment] Error enriching task ${taskId}: ${e.message?.slice(0, 80)}`);
        return { added: false };
    }
}
/**
 * Get relevant prior knowledge for a new task deliberation.
 */
function getRelevantKnowledge(request, domain, limit = 3) {
    try {
        const ls = require('./learning-store');
        const results = ls.searchKnowledge({ engineId: domain });
        // Also search by keywords from the request
        const keywords = extractKeywords(request);
        const textResults = keywords.length > 0 ? ls.searchKnowledge({ text: keywords[0] }) : [];
        const combined = [...results, ...textResults];
        const unique = combined.filter((entry, idx) => combined.findIndex(e => e.id === entry.id) === idx);
        if (unique.length === 0)
            return '';
        const relevant = unique.slice(0, limit);
        let context = '\n## Prior Knowledge (from completed tasks)\n';
        for (const entry of relevant) {
            context += `### ${entry.title}\n`;
            for (const insight of (entry.insights || []).slice(0, 3)) {
                context += `- ${insight}\n`;
            }
            if (entry.providerRanking?.length) {
                context += `Best providers: ${entry.providerRanking.join(', ')}\n`;
            }
            context += '\n';
        }
        return context;
    }
    catch {
        return '';
    }
}
/**
 * Run enrichment on all completed tasks that haven't been enriched yet.
 */
function enrichAllPending() {
    try {
        const intake = require('./intake');
        const tasks = intake.getAllTasks().filter((t) => t.status === 'done');
        const ls = require('./learning-store');
        let enriched = 0;
        let skipped = 0;
        for (const task of tasks) {
            // Check if already enriched
            const existing = ls.searchKnowledge({ text: task.task_id });
            if (existing.length > 0) {
                skipped++;
                continue;
            }
            const result = enrichFromCompletedTask(task.task_id);
            if (result.added)
                enriched++;
            else
                skipped++;
        }
        return { enriched, skipped };
    }
    catch {
        return { enriched: 0, skipped: 0 };
    }
}
function extractTags(text) {
    const lower = text.toLowerCase();
    const tags = [];
    const tagWords = ['ai', 'data', 'engineering', 'income', 'passive', 'saas', 'startup', 'career', 'news', 'topranker', 'research', 'analysis', 'strategy', 'plan', 'job', 'market'];
    for (const word of tagWords) {
        if (lower.includes(word))
            tags.push(word);
    }
    return tags.slice(0, 5);
}
function extractKeywords(text) {
    return text.toLowerCase().split(/\s+/)
        .filter(w => w.length > 4)
        .filter(w => !['about', 'these', 'those', 'their', 'would', 'could', 'should', 'which'].includes(w))
        .slice(0, 5);
}
module.exports = { enrichFromCompletedTask, getRelevantKnowledge, enrichAllPending };
