// GPO Domain-Specific Engine Templates — Reusable engine configurations

import type { EngineTemplate, TemplateInstantiationRecord, Domain } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const TEMPLATES_FILE = path.resolve(__dirname, '..', '..', 'state', 'engine-templates.json');
const INSTANTIATIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'template-instantiations.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

function defaultTemplates(): EngineTemplate[] {
  return [
    { template_id: 'et_startup', name: 'Startup', domain_type: 'startup', description: 'Product-building engine for startup projects', version: 1, mission_defaults: { velocity: 'high', risk_tolerance: 'medium' }, default_projects: ['MVP', 'Growth'], recommended_skill_packs: [], provider_strategy: { primary: 'claude', critique: 'gemini' }, governance_defaults: { review_strictness: 'balanced' }, approval_defaults: { auto_green: true }, docs_starters: ['architecture.md', 'api-guide.md'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { template_id: 'et_research', name: 'Research', domain_type: 'research', description: 'Research and analysis engine', version: 1, mission_defaults: { depth: 'high', sources: 'verified' }, default_projects: ['Literature Review', 'Analysis'], recommended_skill_packs: [], provider_strategy: { primary: 'perplexity', synthesis: 'openai' }, governance_defaults: { review_strictness: 'strict' }, approval_defaults: { auto_green: false }, docs_starters: ['methodology.md'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { template_id: 'et_creative', name: 'Creative Writing', domain_type: 'creative', description: 'Creative writing and screenwriting engine', version: 1, mission_defaults: { voice: 'original', iteration: 'high' }, default_projects: ['Draft', 'Review'], recommended_skill_packs: [], provider_strategy: { primary: 'claude', feedback: 'openai' }, governance_defaults: { review_strictness: 'permissive' }, approval_defaults: { auto_green: true }, docs_starters: ['style-guide.md'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    { template_id: 'et_ops', name: 'Operations', domain_type: 'operations', description: 'Personal/business operations engine', version: 1, mission_defaults: { efficiency: 'high' }, default_projects: ['Automation', 'Review'], recommended_skill_packs: [], provider_strategy: { primary: 'openai' }, governance_defaults: { review_strictness: 'balanced' }, approval_defaults: { auto_green: true }, docs_starters: ['runbook.md'], created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  ];
}

function ensureDefaults(): EngineTemplate[] {
  let templates = readJson<EngineTemplate[]>(TEMPLATES_FILE, []);
  if (templates.length === 0) { templates = defaultTemplates(); writeJson(TEMPLATES_FILE, templates); }
  return templates;
}

export function getTemplates(): EngineTemplate[] { return ensureDefaults(); }
export function getTemplate(templateId: string): EngineTemplate | null { return ensureDefaults().find(t => t.template_id === templateId) || null; }

export function createTemplate(opts: Omit<EngineTemplate, 'template_id' | 'version' | 'created_at' | 'updated_at'>): EngineTemplate {
  const templates = ensureDefaults();
  const t: EngineTemplate = { ...opts, template_id: uid('et'), version: 1, created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
  templates.unshift(t);
  writeJson(TEMPLATES_FILE, templates);
  return t;
}

export function instantiate(templateId: string, tenantId: string, engineId: string, domain: Domain): TemplateInstantiationRecord | null {
  const template = getTemplate(templateId);
  if (!template) return null;
  const records = readJson<TemplateInstantiationRecord[]>(INSTANTIATIONS_FILE, []);
  const record: TemplateInstantiationRecord = { instantiation_id: uid('ti'), template_id: templateId, tenant_id: tenantId, engine_id: engineId, domain, created_at: new Date().toISOString() };
  records.unshift(record);
  if (records.length > 100) records.length = 100;
  writeJson(INSTANTIATIONS_FILE, records);
  return record;
}

export function getInstantiations(): TemplateInstantiationRecord[] { return readJson<TemplateInstantiationRecord[]>(INSTANTIATIONS_FILE, []); }

module.exports = { getTemplates, getTemplate, createTemplate, instantiate, getInstantiations };
