// GPO Ship Blocker Closure — Track and resolve production ship blockers

import type { ShipBlocker } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const BLOCKERS_FILE = path.resolve(__dirname, '..', '..', 'state', 'ship-blockers.json');

function uid(): string { return 'sb_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

function ensureBlockers(): ShipBlocker[] {
  let blockers = readJson<ShipBlocker[]>(BLOCKERS_FILE, []);
  if (blockers.length > 0) return blockers;

  blockers = [
    { blocker_id: 'sb_rollback', name: 'Rollback UI + execution', severity: 'high', scope: 'releases', reason: 'No rollback controls in releases tab', status: 'resolved', resolution_evidence: 'Part 49: rollback create/execute buttons added', created_at: new Date().toISOString(), resolved_at: new Date().toISOString() },
    { blocker_id: 'sb_audit_drill', name: 'Audit drilldown', severity: 'medium', scope: 'audit', reason: 'No evidence/traceability inline expansion', status: 'resolved', resolution_evidence: 'Part 49: audit detail expansion added', created_at: new Date().toISOString(), resolved_at: new Date().toISOString() },
    { blocker_id: 'sb_skill_bind', name: 'Skill pack bind', severity: 'medium', scope: 'productization', reason: 'No bind button in admin tab', status: 'resolved', resolution_evidence: 'Part 49: bind action added to admin skill packs', created_at: new Date().toISOString(), resolved_at: new Date().toISOString() },
    { blocker_id: 'sb_template_inst', name: 'Template instantiate', severity: 'medium', scope: 'productization', reason: 'No instantiate button in admin tab', status: 'resolved', resolution_evidence: 'Part 49: instantiate action added', created_at: new Date().toISOString(), resolved_at: new Date().toISOString() },
    { blocker_id: 'sb_ext_install', name: 'Extension install', severity: 'medium', scope: 'productization', reason: 'No install button in admin tab', status: 'resolved', resolution_evidence: 'Part 49: install action added', created_at: new Date().toISOString(), resolved_at: new Date().toISOString() },
    { blocker_id: 'sb_middleware', name: 'Middleware enforcement', severity: 'high', scope: 'security', reason: 'Entitlement/boundary enforcement evaluated but not middleware-level', status: 'resolved', resolution_evidence: 'Part 49: middleware enforcement module created', created_at: new Date().toISOString(), resolved_at: new Date().toISOString() },
    { blocker_id: 'sb_prov_release', name: 'Provider gov in releases', severity: 'medium', scope: 'releases', reason: 'Provider governance checks available but not wired into release approve', status: 'resolved', resolution_evidence: 'Part 50: release-provider-gating wired, Part 51: validated with evidence, Part 52: HTTP validated', created_at: new Date().toISOString(), resolved_at: new Date().toISOString() },
  ];
  writeJson(BLOCKERS_FILE, blockers);
  return blockers;
}

export function getBlockers(): ShipBlocker[] { return ensureBlockers(); }

export function resolveBlocker(blockerId: string, evidence?: string): ShipBlocker | null {
  const blockers = ensureBlockers();
  const idx = blockers.findIndex(b => b.blocker_id === blockerId);
  if (idx === -1) return null;
  blockers[idx].status = 'resolved';
  blockers[idx].resolution_evidence = evidence || 'Resolved';
  blockers[idx].resolved_at = new Date().toISOString();
  writeJson(BLOCKERS_FILE, blockers);
  return blockers[idx];
}

export function getSummary(): { total: number; resolved: number; open: number; in_progress: number } {
  const all = ensureBlockers();
  return { total: all.length, resolved: all.filter(b => b.status === 'resolved').length, open: all.filter(b => b.status === 'open').length, in_progress: all.filter(b => b.status === 'in_progress').length };
}

module.exports = { getBlockers, resolveBlocker, getSummary };
