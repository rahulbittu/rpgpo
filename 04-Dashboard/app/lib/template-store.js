"use strict";
// GPO Template Store — Dynamic task template CRUD with performance tracking
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTemplate = createTemplate;
exports.getTemplate = getTemplate;
exports.listTemplates = listTemplates;
exports.updateTemplate = updateTemplate;
exports.deleteTemplate = deleteTemplate;
exports.recordTemplateRun = recordTemplateRun;
exports.importTemplates = importTemplates;
exports.exportTemplates = exportTemplates;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const STORE_FILE = path.resolve(__dirname, '..', '..', 'state', 'templates.json');
function readStore() {
    try {
        if (fs.existsSync(STORE_FILE))
            return JSON.parse(fs.readFileSync(STORE_FILE, 'utf-8'));
    }
    catch { /* */ }
    return [];
}
function writeStore(templates) {
    const dir = path.dirname(STORE_FILE);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(STORE_FILE, JSON.stringify(templates, null, 2));
}
function createTemplate(data) {
    const templates = readStore();
    const template = {
        id: 'tpl_' + crypto.randomBytes(4).toString('hex'),
        name: data.name || 'Untitled Template',
        description: data.description || '',
        domain: data.domain || 'general',
        urgency: data.urgency || 'normal',
        prompt: data.prompt || '',
        desiredOutcome: data.desiredOutcome || '',
        tags: data.tags || [],
        scope: data.scope || 'private',
        version: 1,
        createdBy: data.createdBy || 'operator',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        metrics: { runs: 0, successRate: 0, avgLatencyMs: 0, avgCostUsd: 0, qualityScore: 0 },
    };
    templates.push(template);
    writeStore(templates);
    return template;
}
function getTemplate(id) {
    return readStore().find(t => t.id === id) || null;
}
function listTemplates(filter) {
    let templates = readStore();
    if (filter?.domain)
        templates = templates.filter(t => t.domain === filter.domain);
    if (filter?.tags?.length)
        templates = templates.filter(t => filter.tags.some(tag => t.tags.includes(tag)));
    if (filter?.scope)
        templates = templates.filter(t => t.scope === filter.scope);
    return templates.sort((a, b) => b.metrics.qualityScore - a.metrics.qualityScore);
}
function updateTemplate(id, updates) {
    const templates = readStore();
    const idx = templates.findIndex(t => t.id === id);
    if (idx < 0)
        return null;
    const template = { ...templates[idx], ...updates, updatedAt: Date.now(), version: templates[idx].version + 1 };
    templates[idx] = template;
    writeStore(templates);
    return template;
}
function deleteTemplate(id) {
    const templates = readStore();
    const idx = templates.findIndex(t => t.id === id);
    if (idx < 0)
        return false;
    templates.splice(idx, 1);
    writeStore(templates);
    return true;
}
function recordTemplateRun(id, success, latencyMs, costUsd) {
    const templates = readStore();
    const template = templates.find(t => t.id === id);
    if (!template)
        return;
    const m = template.metrics;
    const alpha = 0.2;
    m.runs++;
    m.successRate = alpha * (success ? 1 : 0) + (1 - alpha) * m.successRate;
    m.avgLatencyMs = alpha * latencyMs + (1 - alpha) * m.avgLatencyMs;
    m.avgCostUsd = alpha * costUsd + (1 - alpha) * m.avgCostUsd;
    m.qualityScore = m.successRate * 0.7 + (1 / Math.max(0.01, m.avgLatencyMs / 10000)) * 0.3;
    writeStore(templates);
}
function importTemplates(data) {
    const templates = readStore();
    let added = 0;
    for (const t of data) {
        if (!templates.find(x => x.id === t.id)) {
            templates.push({ ...t, createdAt: Date.now(), updatedAt: Date.now() });
            added++;
        }
    }
    writeStore(templates);
    return added;
}
function exportTemplates() {
    return readStore();
}
module.exports = { createTemplate, getTemplate, listTemplates, updateTemplate, deleteTemplate, recordTemplateRun, importTemplates, exportTemplates };
