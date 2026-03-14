// GPO Template Runtime Binding — Make instantiated templates configure live engine behavior

import type { RuntimeBindingRecord, Domain } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const BINDINGS_FILE = path.resolve(__dirname, '..', '..', 'state', 'template-runtime-bindings.json');

function uid(): string { return 'trb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Bind a template's defaults into a live engine/project */
export function bind(templateId: string, engineId: string, projectId?: string): RuntimeBindingRecord | null {
  let template: import('./types').EngineTemplate | null = null;
  try {
    const et = require('./engine-templates') as { getTemplate(id: string): import('./types').EngineTemplate | null };
    template = et.getTemplate(templateId);
  } catch { return null; }
  if (!template) return null;

  const bindingsApplied: string[] = [];

  // Apply provider strategy defaults
  if (template.provider_strategy) {
    try {
      const pr = require('./provider-registry') as { upsertFit(o: Record<string, unknown>): unknown };
      for (const [role, provider] of Object.entries(template.provider_strategy)) {
        pr.upsertFit({ provider_id: provider, role, task_kind: 'general', scope_level: 'engine', scope_id: engineId, fit_score: 70, notes: `Template default: ${template.name}` });
        bindingsApplied.push(`provider:${role}=${provider}`);
      }
    } catch { /* */ }
  }

  // Apply governance defaults
  if (template.governance_defaults) {
    try {
      const op = require('./operator-policies') as { createPolicy(o: Record<string, unknown>): unknown };
      for (const [area, value] of Object.entries(template.governance_defaults)) {
        op.createPolicy({ area, value, scope_level: 'engine', scope_id: engineId, rationale: `Template: ${template.name}` });
        bindingsApplied.push(`policy:${area}=${value}`);
      }
    } catch { /* */ }
  }

  // Record binding
  const record: RuntimeBindingRecord = { binding_id: uid(), template_id: templateId, engine_id: engineId, project_id: projectId, bindings_applied: bindingsApplied, created_at: new Date().toISOString() };
  const bindings = readJson<RuntimeBindingRecord[]>(BINDINGS_FILE, []);
  bindings.unshift(record);
  if (bindings.length > 100) bindings.length = 100;
  writeJson(BINDINGS_FILE, bindings);

  // Telemetry
  try { const tw = require('./telemetry-wiring') as { emitTelemetry(c: string, a: string, o: string): void }; tw.emitTelemetry('runtime_activation', 'template_bound', 'success'); } catch { /* */ }

  return record;
}

export function getBindings(engineId?: string): RuntimeBindingRecord[] {
  const all = readJson<RuntimeBindingRecord[]>(BINDINGS_FILE, []);
  return engineId ? all.filter(b => b.engine_id === engineId) : all;
}

module.exports = { bind, getBindings };
