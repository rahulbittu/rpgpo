"use strict";
// GPO Domain-Specific Engine Templates — Reusable engine configurations
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTemplates = getTemplates;
exports.getTemplate = getTemplate;
exports.createTemplate = createTemplate;
exports.instantiate = instantiate;
exports.getInstantiations = getInstantiations;
const fs = require('fs');
const path = require('path');
const TEMPLATES_FILE = path.resolve(__dirname, '..', '..', 'state', 'engine-templates.json');
const INSTANTIATIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'template-instantiations.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
function defaultTemplates() {
    return [
        { template_id: 'et_startup', name: 'Startup', domain_type: 'startup', description: 'Product-building engine for startup projects', version: 1, mission_defaults: { velocity: 'high', risk_tolerance: 'medium' }, default_projects: ['MVP', 'Growth'], recommended_skill_packs: [], provider_strategy: { primary: 'claude', critique: 'gemini' }, governance_defaults: { review_strictness: 'balanced' }, approval_defaults: { auto_green: true }, docs_starters: ['architecture.md', 'api-guide.md'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { template_id: 'et_research', name: 'Research', domain_type: 'research', description: 'Research and analysis engine', version: 1, mission_defaults: { depth: 'high', sources: 'verified' }, default_projects: ['Literature Review', 'Analysis'], recommended_skill_packs: [], provider_strategy: { primary: 'perplexity', synthesis: 'openai' }, governance_defaults: { review_strictness: 'strict' }, approval_defaults: { auto_green: false }, docs_starters: ['methodology.md'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { template_id: 'et_creative', name: 'Creative Writing', domain_type: 'creative', description: 'Creative writing and screenwriting engine', version: 1, mission_defaults: { voice: 'original', iteration: 'high' }, default_projects: ['Draft', 'Review'], recommended_skill_packs: [], provider_strategy: { primary: 'claude', feedback: 'openai' }, governance_defaults: { review_strictness: 'permissive' }, approval_defaults: { auto_green: true }, docs_starters: ['style-guide.md'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        { template_id: 'et_ops', name: 'Operations', domain_type: 'operations', description: 'Personal/business operations engine', version: 1, mission_defaults: { efficiency: 'high' }, default_projects: ['Automation', 'Review'], recommended_skill_packs: [], provider_strategy: { primary: 'openai' }, governance_defaults: { review_strictness: 'balanced' }, approval_defaults: { auto_green: true }, docs_starters: ['runbook.md'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    ];
}
function ensureDefaults() {
    let templates = readJson(TEMPLATES_FILE, []);
    if (templates.length === 0) {
        templates = defaultTemplates();
        writeJson(TEMPLATES_FILE, templates);
    }
    return templates;
}
function getTemplates() { return ensureDefaults(); }
function getTemplate(templateId) { return ensureDefaults().find(t => t.template_id === templateId) || null; }
function createTemplate(opts) {
    const templates = ensureDefaults();
    const t = { ...opts, template_id: uid('et'), version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
    templates.unshift(t);
    writeJson(TEMPLATES_FILE, templates);
    return t;
}
function instantiate(templateId, tenantId, engineId, domain) {
    const template = getTemplate(templateId);
    if (!template)
        return null;
    const records = readJson(INSTANTIATIONS_FILE, []);
    const record = { instantiation_id: uid('ti'), template_id: templateId, tenant_id: tenantId, engine_id: engineId, domain, created_at: new Date().toISOString() };
    records.unshift(record);
    if (records.length > 100)
        records.length = 100;
    writeJson(INSTANTIATIONS_FILE, records);
    return record;
}
function getInstantiations() { return readJson(INSTANTIATIONS_FILE, []); }
module.exports = { getTemplates, getTemplate, createTemplate, instantiate, getInstantiations };
//# sourceMappingURL=engine-templates.js.map