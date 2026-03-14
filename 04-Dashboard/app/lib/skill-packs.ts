// GPO Agent Skill Packs — Reusable governed capability packages

import type { SkillPack, SkillPackState, SkillPackCapability, SkillPackBinding } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const PACKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'skill-packs.json');
const BINDINGS_FILE = path.resolve(__dirname, '..', '..', 'state', 'skill-pack-bindings.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

export function createPack(opts: { name: string; description: string; capabilities?: SkillPackCapability[]; constraints?: string[]; dependencies?: string[]; scope?: string }): SkillPack {
  const packs = readJson<SkillPack[]>(PACKS_FILE, []);
  const pack: SkillPack = {
    pack_id: uid('sp'), name: opts.name, description: opts.description,
    version: 1, state: 'draft',
    capabilities: opts.capabilities || [], constraints: opts.constraints || [],
    dependencies: opts.dependencies || [], scope: (opts.scope || 'global') as any,
    compatibility: [], created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  packs.unshift(pack);
  if (packs.length > 100) packs.length = 100;
  writeJson(PACKS_FILE, packs);
  return pack;
}

export function versionPack(packId: string, changes?: Partial<SkillPack>): SkillPack | null {
  const packs = readJson<SkillPack[]>(PACKS_FILE, []);
  const idx = packs.findIndex(p => p.pack_id === packId);
  if (idx === -1) return null;
  packs[idx].version++;
  if (changes) Object.assign(packs[idx], changes);
  packs[idx].updated_at = new Date().toISOString();
  writeJson(PACKS_FILE, packs);
  return packs[idx];
}

export function bindPack(packId: string, scopeType: string, scopeId: string): SkillPackBinding {
  const bindings = readJson<SkillPackBinding[]>(BINDINGS_FILE, []);
  const binding: SkillPackBinding = { binding_id: uid('sb'), pack_id: packId, scope_type: scopeType, scope_id: scopeId, active: true, created_at: new Date().toISOString() };
  bindings.unshift(binding);
  if (bindings.length > 200) bindings.length = 200;
  writeJson(BINDINGS_FILE, bindings);
  return binding;
}

export function getPacks(): SkillPack[] { return readJson<SkillPack[]>(PACKS_FILE, []); }
export function getPack(packId: string): SkillPack | null { return getPacks().find(p => p.pack_id === packId) || null; }
export function getBindings(): SkillPackBinding[] { return readJson<SkillPackBinding[]>(BINDINGS_FILE, []); }
export function getBindingsForScope(scopeType: string, scopeId: string): SkillPackBinding[] {
  return getBindings().filter(b => b.scope_type === scopeType && b.scope_id === scopeId && b.active);
}

module.exports = { createPack, versionPack, bindPack, getPacks, getPack, getBindings, getBindingsForScope };
