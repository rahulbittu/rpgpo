"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const COSTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'costs.json');
const SETTINGS_FILE = path.resolve(__dirname, '..', '..', 'state', 'cost-settings.json');
const PRICING = {
    'gpt-4o': { input: 2.50, output: 10.00 },
    'gpt-4o-mini': { input: 0.15, output: 0.60 },
    'sonar': { input: 1.00, output: 1.00 },
    'sonar-pro': { input: 3.00, output: 15.00 },
    'gemini-2.5-flash-lite': { input: 0.00, output: 0.00 },
    'gemini-2.5-flash': { input: 0.15, output: 0.60 },
    'gemini-2.0-flash': { input: 0.10, output: 0.40 },
};
function toNum(v) {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
}
function ensureFile(file, defaultVal) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(file))
        fs.writeFileSync(file, JSON.stringify(defaultVal, null, 2));
}
function readLedger() {
    ensureFile(COSTS_FILE, []);
    try {
        return JSON.parse(fs.readFileSync(COSTS_FILE, 'utf-8'));
    }
    catch {
        return [];
    }
}
function writeLedger(entries) {
    ensureFile(COSTS_FILE, []);
    if (entries.length > 2000)
        entries = entries.slice(-2000);
    fs.writeFileSync(COSTS_FILE, JSON.stringify(entries, null, 2));
}
function recordCost(entry) {
    const entries = readLedger();
    const record = {
        ts: new Date().toISOString(),
        date: new Date().toISOString().slice(0, 10),
        provider: entry.provider || 'unknown',
        model: entry.model || 'unknown',
        inputTokens: toNum(entry.inputTokens),
        outputTokens: toNum(entry.outputTokens),
        totalTokens: toNum(entry.totalTokens),
        cost: toNum(entry.cost != null ? entry.cost : estimateCost(entry.model, entry.inputTokens, entry.outputTokens)),
        taskId: entry.taskId || undefined,
        taskType: entry.taskType || undefined,
        role: entry.role || undefined,
        boardRunId: entry.boardRunId || undefined,
        intakeTaskId: entry.intakeTaskId || undefined,
        subtaskId: entry.subtaskId || undefined,
        domain: entry.domain || undefined,
    };
    entries.push(record);
    writeLedger(entries);
    return record;
}
function estimateCost(model, inputTokens, outputTokens) {
    if (!model)
        return 0;
    const p = PRICING[model];
    if (!p)
        return 0;
    return ((inputTokens || 0) / 1000000 * p.input) + ((outputTokens || 0) / 1000000 * p.output);
}
function getCosts(opts = {}) {
    let entries = readLedger();
    if (opts.since)
        entries = entries.filter(e => e.ts >= opts.since);
    if (opts.date)
        entries = entries.filter(e => e.date === opts.date);
    if (opts.provider)
        entries = entries.filter(e => e.provider === opts.provider);
    if (opts.taskType)
        entries = entries.filter(e => e.taskType === opts.taskType);
    if (opts.boardRunId)
        entries = entries.filter(e => e.boardRunId === opts.boardRunId);
    return entries;
}
function getSummary() {
    const today = new Date().toISOString().slice(0, 10);
    const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
    const all = readLedger();
    const todayEntries = all.filter(e => e.date === today);
    const weekEntries = all.filter(e => e.ts >= weekAgo);
    const sumCost = (arr) => arr.reduce((s, e) => s + toNum(e.cost), 0);
    const sumTokens = (arr) => arr.reduce((s, e) => s + toNum(e.totalTokens), 0);
    const byProvider = {};
    for (const e of weekEntries) {
        if (!byProvider[e.provider])
            byProvider[e.provider] = { cost: 0, tokens: 0, calls: 0 };
        byProvider[e.provider].cost += toNum(e.cost);
        byProvider[e.provider].tokens += toNum(e.totalTokens);
        byProvider[e.provider].calls += 1;
    }
    const byModel = {};
    for (const e of weekEntries) {
        if (!byModel[e.model])
            byModel[e.model] = { cost: 0, tokens: 0, calls: 0 };
        byModel[e.model].cost += toNum(e.cost);
        byModel[e.model].tokens += toNum(e.totalTokens);
        byModel[e.model].calls += 1;
    }
    const byDay = {};
    for (const e of weekEntries) {
        if (!byDay[e.date])
            byDay[e.date] = { cost: 0, tokens: 0, calls: 0 };
        byDay[e.date].cost += toNum(e.cost);
        byDay[e.date].tokens += toNum(e.totalTokens);
        byDay[e.date].calls += 1;
    }
    const boardEntries = all.filter(e => e.taskType === 'board-run');
    let lastBoardRun = null;
    if (boardEntries.length) {
        const lastId = boardEntries[boardEntries.length - 1].boardRunId;
        if (lastId) {
            const runEntries = all.filter(e => e.boardRunId === lastId);
            lastBoardRun = { id: lastId, cost: sumCost(runEntries), tokens: sumTokens(runEntries), calls: runEntries.length };
        }
    }
    return {
        today: { cost: sumCost(todayEntries), tokens: sumTokens(todayEntries), calls: todayEntries.length },
        week: { cost: sumCost(weekEntries), tokens: sumTokens(weekEntries), calls: weekEntries.length },
        lastBoardRun,
        byProvider,
        byModel,
        byDay,
        totalEntries: all.length,
    };
}
function getSettings() {
    ensureFile(SETTINGS_FILE, {
        geminiModel: 'gemini-2.5-flash-lite',
        geminibudgetLimit: null,
        warningThreshold: null,
        disableAfterThreshold: false,
    });
    try {
        return JSON.parse(fs.readFileSync(SETTINGS_FILE, 'utf-8'));
    }
    catch {
        return { geminiModel: 'gemini-2.5-flash-lite', geminibudgetLimit: null, warningThreshold: null, disableAfterThreshold: false, builderTimeoutMinutes: 10 };
    }
}
function updateSettings(updates) {
    const current = getSettings();
    const merged = { ...current, ...updates };
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(merged, null, 2));
    return merged;
}
function checkBudget(provider) {
    const settings = getSettings();
    if (provider !== 'gemini')
        return { ok: true };
    if (!settings.geminibudgetLimit)
        return { ok: true };
    const today = new Date().toISOString().slice(0, 10);
    const todayEntries = readLedger().filter(e => e.date === today && e.provider === 'gemini');
    const todayCost = todayEntries.reduce((s, e) => s + toNum(e.cost), 0);
    const over = todayCost >= settings.geminibudgetLimit;
    if (over && settings.disableAfterThreshold) {
        return { ok: false, reason: 'budget_exceeded', todayCost, limit: settings.geminibudgetLimit };
    }
    return { ok: true, todayCost, limit: settings.geminibudgetLimit };
}
module.exports = {
    PRICING, toNum, recordCost, estimateCost, getCosts, getSummary,
    getSettings, updateSettings, checkBudget,
};
//# sourceMappingURL=costs.js.map