"use strict";
// GPO Quality Scorer — Score task outputs for completeness, citations, actionability
Object.defineProperty(exports, "__esModule", { value: true });
exports.scoreTask = scoreTask;
exports.rateTask = rateTask;
exports.getScore = getScore;
exports.getScores = getScores;
exports.getAverageQuality = getAverageQuality;
const fs = require('fs');
const path = require('path');
const SCORES_FILE = path.resolve(__dirname, '..', '..', 'state', 'quality-scores.json');
function readScores() {
    try {
        if (fs.existsSync(SCORES_FILE))
            return JSON.parse(fs.readFileSync(SCORES_FILE, 'utf-8'));
    }
    catch { /* */ }
    return [];
}
function writeScores(scores) {
    if (scores.length > 500)
        scores = scores.slice(-500);
    const dir = path.dirname(SCORES_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(SCORES_FILE, JSON.stringify(scores, null, 2));
}
function scoreTask(taskId) {
    try {
        const intake = require('./intake');
        const task = intake.getTask(taskId);
        const subtasks = intake.getSubtasksForTask(taskId);
        const doneSubs = subtasks.filter((s) => s.status === 'done');
        const allOutput = doneSubs.map((s) => (s.output || s.what_done || '')).join('\n');
        const completeness = scoreCompleteness(task, doneSubs, subtasks);
        const citationDensity = scoreCitations(allOutput);
        const actionability = scoreActionability(allOutput);
        const specificity = scoreSpecificity(allOutput);
        const structureQuality = scoreStructure(allOutput);
        const overall = completeness * 0.25 + citationDensity * 0.2 + actionability * 0.25 + specificity * 0.15 + structureQuality * 0.15;
        const score = {
            taskId, timestamp: Date.now(), overall,
            dimensions: { completeness, citationDensity, actionability, specificity, structureQuality },
            autoScored: true,
        };
        const scores = readScores();
        const existing = scores.findIndex(s => s.taskId === taskId);
        if (existing >= 0)
            scores[existing] = score;
        else
            scores.push(score);
        writeScores(scores);
        // Feed back into learning
        try {
            const ls = require('./learning-store');
            for (const sub of doneSubs) {
                ls.recordProviderSample({ engineId: task.domain || 'general', taskKind: sub.stage || 'subtask', contractName: sub.assigned_role || 'general' }, { timestamp: Date.now(), providerId: sub.assigned_model || 'unknown', latencyMs: 0, inputTokens: 0, outputTokens: 0, totalCostUsd: 0, success: true, qualityScore: overall });
            }
        }
        catch { /* non-fatal */ }
        return score;
    }
    catch {
        return { taskId, timestamp: Date.now(), overall: 0, dimensions: { completeness: 0, citationDensity: 0, actionability: 0, specificity: 0, structureQuality: 0 }, autoScored: true };
    }
}
function rateTask(taskId, rating) {
    const scores = readScores();
    const score = scores.find(s => s.taskId === taskId);
    if (!score)
        return false;
    score.operatorRating = Math.min(5, Math.max(1, rating));
    writeScores(scores);
    return true;
}
function getScore(taskId) {
    return readScores().find(s => s.taskId === taskId) || null;
}
function getScores(limit) {
    return readScores().sort((a, b) => b.timestamp - a.timestamp).slice(0, limit || 50);
}
function getAverageQuality() {
    const scores = readScores();
    if (scores.length === 0)
        return { overall: 0, dimensions: {}, count: 0 };
    const sum = { completeness: 0, citationDensity: 0, actionability: 0, specificity: 0, structureQuality: 0, overall: 0 };
    for (const s of scores) {
        sum.overall += s.overall;
        for (const [k, v] of Object.entries(s.dimensions)) {
            sum[k] = (sum[k] || 0) + v;
        }
    }
    const n = scores.length;
    return {
        overall: sum.overall / n,
        dimensions: { completeness: sum.completeness / n, citationDensity: sum.citationDensity / n, actionability: sum.actionability / n, specificity: sum.specificity / n, structureQuality: sum.structureQuality / n },
        count: n,
    };
}
function scoreCompleteness(task, doneSubs, allSubs) {
    if (allSubs.length === 0)
        return 0;
    return doneSubs.length / allSubs.length;
}
function scoreCitations(text) {
    const urls = (text.match(/https?:\/\/[^\s)]+/g) || []).length;
    const sources = (text.match(/source[s]?:|according to|per |cited|reference/gi) || []).length;
    const score = Math.min(1, (urls + sources) / 5);
    return score;
}
function scoreActionability(text) {
    const actionWords = (text.match(/\b(step|action|implement|create|build|launch|start|set up|configure|install|deploy|submit|apply|register)\b/gi) || []).length;
    const bullets = (text.match(/^[-\d]+\.\s/gm) || []).length;
    return Math.min(1, (actionWords + bullets) / 10);
}
function scoreSpecificity(text) {
    const numbers = (text.match(/\$[\d,.]+|\d+%|\d+[KkMm]\b|\d{4}/g) || []).length;
    const names = (text.match(/[A-Z][a-z]+(?:\s[A-Z][a-z]+)+/g) || []).length;
    return Math.min(1, (numbers + names) / 8);
}
function scoreStructure(text) {
    const headings = (text.match(/^#{1,4}\s/gm) || []).length;
    const sections = (text.match(/\n\n/g) || []).length;
    const lists = (text.match(/^[-*]\s/gm) || []).length;
    return Math.min(1, (headings + sections / 3 + lists / 5) / 5);
}
module.exports = { scoreTask, rateTask, getScore, getScores, getAverageQuality };
