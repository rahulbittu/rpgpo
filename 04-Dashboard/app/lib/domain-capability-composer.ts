// GPO Domain Capability Composer — Compose final capabilities from templates, packs, overrides

import type { CapabilityCompositionPlan, Domain } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const PLANS_FILE = path.resolve(__dirname, '..', '..', 'state', 'capability-plans.json');

function uid(): string { return 'cp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Compose capabilities for an engine/project */
export function compose(engineId: string, projectId?: string): CapabilityCompositionPlan {
  const active: Array<{ name: string; source: string; stable: boolean }> = [];
  const blocked: Array<{ name: string; reason: string }> = [];
  let templateSource: string | undefined;
  const packSources: string[] = [];
  let overrides = 0;

  // 1. Engine template capabilities
  try {
    const et = require('./engine-templates') as { getInstantiations(): import('./types').TemplateInstantiationRecord[]; getTemplate(id: string): import('./types').EngineTemplate | null };
    const inst = et.getInstantiations().find(i => i.engine_id === engineId);
    if (inst) {
      templateSource = inst.template_id;
      const tmpl = et.getTemplate(inst.template_id);
      if (tmpl) {
        active.push({ name: `template:${tmpl.name}`, source: 'engine_template', stable: true });
        for (const doc of tmpl.docs_starters) active.push({ name: `doc:${doc}`, source: 'engine_template', stable: true });
      }
    }
  } catch { /* */ }

  // 2. Bound skill packs
  try {
    const sp = require('./skill-packs') as {
      getBindingsForScope(st: string, si: string): import('./types').SkillPackBinding[];
      getPack(id: string): import('./types').SkillPack | null;
    };
    const bindings = sp.getBindingsForScope('engine', engineId);
    for (const b of bindings) {
      const pack = sp.getPack(b.pack_id);
      if (pack) {
        packSources.push(pack.pack_id);
        for (const cap of pack.capabilities) {
          active.push({ name: `${cap.type}:${cap.name}`, source: `skill_pack:${pack.name}`, stable: pack.state === 'stable' });
        }
        if (pack.state === 'deprecated') blocked.push({ name: pack.name, reason: 'Skill pack deprecated' });
      }
    }
    // Also check project-level bindings
    if (projectId) {
      const projBindings = sp.getBindingsForScope('project', projectId);
      for (const b of projBindings) {
        const pack = sp.getPack(b.pack_id);
        if (pack) {
          packSources.push(pack.pack_id);
          for (const cap of pack.capabilities) {
            active.push({ name: `${cap.type}:${cap.name}`, source: `skill_pack:${pack.name}(project)`, stable: pack.state === 'stable' });
          }
        }
      }
    }
  } catch { /* */ }

  // 3. Operator policy overrides
  try {
    const op = require('./operator-policies') as { getAllPolicies(): Array<{ area: string; value: string; scope_id: string }> };
    const policies = op.getAllPolicies().filter(p => p.scope_id === engineId || p.scope_id === projectId);
    overrides = policies.length;
    for (const p of policies) {
      active.push({ name: `policy:${p.area}=${p.value}`, source: 'operator_override', stable: true });
    }
  } catch { /* */ }

  // 4. Default platform capabilities (always active)
  active.push(
    { name: 'governance', source: 'platform', stable: true },
    { name: 'audit', source: 'platform', stable: true },
    { name: 'execution_graph', source: 'platform', stable: true },
    { name: 'approval_workspace', source: 'platform', stable: true },
  );

  // 5. Entitlement check
  try {
    const so = require('./subscription-operations') as { evaluateEntitlements(id: string, f: string[]): Array<{ feature: string; entitled: boolean }> };
    const ents = so.evaluateEntitlements('rpgpo', ['compliance', 'tenant_admin']);
    for (const e of ents) {
      if (!e.entitled) blocked.push({ name: e.feature, reason: 'Not entitled by subscription plan' });
    }
  } catch { /* */ }

  const plan: CapabilityCompositionPlan = {
    plan_id: uid(), engine_id: engineId, project_id: projectId,
    active_capabilities: active, blocked_capabilities: blocked,
    template_source: templateSource, skill_pack_sources: packSources,
    override_count: overrides, created_at: new Date().toISOString(),
  };

  const plans = readJson<CapabilityCompositionPlan[]>(PLANS_FILE, []);
  plans.unshift(plan);
  if (plans.length > 50) plans.length = 50;
  writeJson(PLANS_FILE, plans);

  return plan;
}

export function getPlans(engineId?: string): CapabilityCompositionPlan[] {
  const all = readJson<CapabilityCompositionPlan[]>(PLANS_FILE, []);
  return engineId ? all.filter(p => p.engine_id === engineId) : all;
}

module.exports = { compose, getPlans };
