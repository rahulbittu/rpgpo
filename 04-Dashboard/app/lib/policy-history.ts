// GPO Policy History — Version tracking and change records for all policy types

import type {
  PolicyTargetType, PolicyVersion, PolicyChangeRecord, PolicyHistoryView,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const VERSIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'policy-versions.json');
const CHANGES_FILE = path.resolve(__dirname, '..', '..', 'state', 'policy-changes.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Record a policy version snapshot */
export function recordVersion(targetType: PolicyTargetType, targetId: string, state: Record<string, unknown>): PolicyVersion {
  const versions = readJson<PolicyVersion[]>(VERSIONS_FILE, []);

  // Supersede previous version
  const previous = versions.filter(v => v.target_type === targetType && v.target_id === targetId && !v.superseded_at);
  for (const p of previous) p.superseded_at = new Date().toISOString();

  const nextVersion = previous.length > 0 ? Math.max(...previous.map(p => p.version)) + 1 : 1;

  const version: PolicyVersion = {
    version_id: uid('pv'), target_type: targetType, target_id: targetId,
    version: nextVersion, state, effective_from: new Date().toISOString(),
  };

  versions.unshift(version);
  if (versions.length > 500) versions.length = 500;
  writeJson(VERSIONS_FILE, versions);

  return version;
}

/** Record a policy change */
export function recordChange(opts: {
  target_type: PolicyTargetType;
  target_id: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  actor: string;
  reason: string;
  linked_tuning_id?: string;
}): PolicyChangeRecord {
  const changes = readJson<PolicyChangeRecord[]>(CHANGES_FILE, []);
  const change: PolicyChangeRecord = {
    change_id: uid('pc'),
    target_type: opts.target_type,
    target_id: opts.target_id,
    before_state: opts.before_state,
    after_state: opts.after_state,
    actor: opts.actor,
    reason: opts.reason,
    linked_tuning_id: opts.linked_tuning_id,
    created_at: new Date().toISOString(),
  };
  changes.unshift(change);
  if (changes.length > 500) changes.length = 500;
  writeJson(CHANGES_FILE, changes);

  // Also record new version
  recordVersion(opts.target_type, opts.target_id, opts.after_state);

  return change;
}

/** Get all versions */
export function getAllVersions(): PolicyVersion[] {
  return readJson<PolicyVersion[]>(VERSIONS_FILE, []);
}

/** Get versions for a target type */
export function getVersionsForType(targetType: PolicyTargetType): PolicyVersion[] {
  return getAllVersions().filter(v => v.target_type === targetType);
}

/** Get version history for a specific target */
export function getHistory(targetType: PolicyTargetType, targetId: string): PolicyHistoryView {
  const versions = getAllVersions().filter(v => v.target_type === targetType && v.target_id === targetId);
  const changes = readJson<PolicyChangeRecord[]>(CHANGES_FILE, []).filter(c => c.target_type === targetType && c.target_id === targetId);

  return {
    target_type: targetType,
    target_id: targetId,
    current_version: versions.length > 0 ? Math.max(...versions.map(v => v.version)) : 0,
    versions: versions.sort((a, b) => b.version - a.version),
    changes: changes.sort((a, b) => b.created_at.localeCompare(a.created_at)),
  };
}

/** Get diff for a target (latest change) */
export function getDiff(targetType: PolicyTargetType, targetId: string): PolicyChangeRecord | null {
  const changes = readJson<PolicyChangeRecord[]>(CHANGES_FILE, []).filter(c => c.target_type === targetType && c.target_id === targetId);
  return changes[0] || null;
}

/** Get all changes */
export function getAllChanges(): PolicyChangeRecord[] {
  return readJson<PolicyChangeRecord[]>(CHANGES_FILE, []);
}

module.exports = { recordVersion, recordChange, getAllVersions, getVersionsForType, getHistory, getDiff, getAllChanges };
