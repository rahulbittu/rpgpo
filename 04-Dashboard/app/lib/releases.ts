// GPO Release Discipline — Candidates, promotion, blockers, rollback
// Governed: promotion always requires approval. Never auto-promotes.

import type {
  Environment, ReleaseCandidate, PromotionBlocker, PromotionSummary,
  RollbackRecord, Domain,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RELEASES_FILE = path.resolve(__dirname, '..', '..', 'state', 'releases.json');
const ROLLBACKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'rollbacks.json');

function uid(): string { return 'rc_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

function readJson<T>(file: string, fallback: T): T {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : fallback; } catch { return fallback; }
}
function writeJson(file: string, data: unknown): void {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════
// Release Candidates
// ═══════════════════════════════════════════

/** Create a release candidate for promotion */
export function createReleaseCandidate(
  version: string, fromEnv: Environment, toEnv: Environment, summary: string
): ReleaseCandidate {
  // Gather blocker data
  const blockers = gatherPromotionBlockers(fromEnv);

  // Gather changed modules from gitops
  let changedModules: string[] = [];
  let changedFilesCount = 0;
  try {
    const gitops = require('./gitops') as { buildReleaseSummary(): { affected_modules: string[]; changed_files: string[] } };
    const rel = gitops.buildReleaseSummary();
    changedModules = rel.affected_modules;
    changedFilesCount = rel.changed_files.length;
  } catch { /* ignore */ }

  const rc: ReleaseCandidate = {
    id: uid(), version, from_env: fromEnv, to_env: toEnv,
    summary, changed_modules: changedModules,
    changed_files_count: changedFilesCount,
    blockers, ready: blockers.filter(b => b.severity === 'blocking').length === 0,
    created_at: new Date().toISOString(),
  };

  const all = readJson<ReleaseCandidate[]>(RELEASES_FILE, []);
  all.unshift(rc);
  if (all.length > 50) all.length = 50;
  writeJson(RELEASES_FILE, all);

  return rc;
}

/** Get all release candidates */
export function getAllReleaseCandidates(): ReleaseCandidate[] {
  return readJson<ReleaseCandidate[]>(RELEASES_FILE, []);
}

/** Get latest release candidate for a target env */
export function getLatestCandidate(toEnv: Environment): ReleaseCandidate | null {
  const all = readJson<ReleaseCandidate[]>(RELEASES_FILE, []);
  return all.find(rc => rc.to_env === toEnv && !rc.promoted_at) || null;
}

/** Mark a release candidate as promoted */
export function markPromoted(rcId: string): void {
  const all = readJson<ReleaseCandidate[]>(RELEASES_FILE, []);
  const rc = all.find(r => r.id === rcId);
  if (rc) { rc.promoted_at = new Date().toISOString(); writeJson(RELEASES_FILE, all); }
}

// ═══════════════════════════════════════════
// Promotion Blockers
// ═══════════════════════════════════════════

/** Gather all blockers preventing promotion */
export function gatherPromotionBlockers(fromEnv: Environment): PromotionBlocker[] {
  const blockers: PromotionBlocker[] = [];

  // Check for active workflow blockers
  try {
    const autonomy = require('./autonomy') as { getAllBlockers(): Array<{ title: string; severity: string }> };
    const active = autonomy.getAllBlockers();
    if (active.length > 0) {
      blockers.push({
        type: 'active_blocker',
        description: `${active.length} active blocker(s): ${active[0].title.slice(0, 60)}`,
        severity: active.some(b => b.severity === 'critical' || b.severity === 'high') ? 'blocking' : 'warning',
        resolvable_by: 'Resolve workflow blockers',
      });
    }
  } catch { /* ignore */ }

  // Check for pending approvals
  try {
    const intake = require('./intake') as { getAllTasks(): Array<{ status: string; title: string }> };
    const pending = intake.getAllTasks().filter(t => t.status === 'waiting_approval' || t.status === 'planned');
    if (pending.length > 0) {
      blockers.push({
        type: 'pending_approval',
        description: `${pending.length} task(s) awaiting approval`,
        severity: 'warning',
        resolvable_by: 'Review and approve/reject pending tasks',
      });
    }
  } catch { /* ignore */ }

  // Check instance health
  try {
    const prov = require('./provisioning') as { checkInstanceHealth(): { status: string; checks: Array<{ status: string; name: string; detail: string }> } };
    const health = prov.checkInstanceHealth();
    if (health.status === 'error') {
      const failing = health.checks.filter(c => c.status === 'fail');
      blockers.push({
        type: 'missing_config',
        description: `Health check failing: ${failing.map(c => c.name).join(', ')}`,
        severity: 'blocking',
        resolvable_by: 'Fix failing health checks',
      });
    }
  } catch { /* ignore */ }

  return blockers;
}

// ═══════════════════════════════════════════
// Promotion Summary
// ═══════════════════════════════════════════

/** Build a summary of what would be promoted */
export function buildPromotionSummary(fromEnv: Environment, toEnv: Environment): PromotionSummary {
  const envMod = require('./environments') as {
    getEnvConfig(e: Environment): { release_version?: string } | null;
  };

  const fromCfg = envMod.getEnvConfig(fromEnv);
  const toCfg = envMod.getEnvConfig(toEnv);
  const blockers = gatherPromotionBlockers(fromEnv);

  let modulesChanged: string[] = [];
  let releaseNotes = '';
  try {
    const gitops = require('./gitops') as { buildReleaseSummary(): { affected_modules: string[]; affected_missions: string[]; release_note: string } };
    const rel = gitops.buildReleaseSummary();
    modulesChanged = rel.affected_modules;
    releaseNotes = rel.release_note;
  } catch { /* ignore */ }

  // Infer affected missions from modules
  const missionsAffected: string[] = [];
  if (modulesChanged.some(m => m.includes('topranker') || m.includes('rpgpo-missions'))) missionsAffected.push('TopRanker');

  return {
    from_env: fromEnv, to_env: toEnv,
    from_version: fromCfg?.release_version || '0.0.0',
    to_version: toCfg?.release_version || '0.0.0',
    modules_changed: modulesChanged,
    capabilities_changed: [],
    missions_affected: missionsAffected,
    release_notes: releaseNotes,
    blockers,
    ready: blockers.filter(b => b.severity === 'blocking').length === 0,
  };
}

// ═══════════════════════════════════════════
// Rollback
// ═══════════════════════════════════════════

/** Record a rollback */
export function recordRollback(env: Environment, fromVersion: string, toVersion: string, reason: string): RollbackRecord {
  const record: RollbackRecord = {
    id: 'rb_' + Date.now().toString(36),
    env, from_version: fromVersion, to_version: toVersion,
    reason, rolled_back_at: new Date().toISOString(), rolled_back_by: 'operator',
  };

  const all = readJson<RollbackRecord[]>(ROLLBACKS_FILE, []);
  all.unshift(record);
  if (all.length > 20) all.length = 20;
  writeJson(ROLLBACKS_FILE, all);

  return record;
}

/** Get rollback history */
export function getRollbackHistory(): RollbackRecord[] {
  return readJson<RollbackRecord[]>(ROLLBACKS_FILE, []);
}

/** Get release readiness for a target environment */
export function getReleaseReadiness(toEnv: Environment): { ready: boolean; blockers: PromotionBlocker[]; candidate: ReleaseCandidate | null } {
  const fromEnv = toEnv === 'beta' ? 'dev' : toEnv === 'prod' ? 'beta' : null;
  if (!fromEnv) return { ready: false, blockers: [{ type: 'manual_hold', description: 'No promotion path', severity: 'blocking', resolvable_by: 'N/A' }], candidate: null };

  const blockers = gatherPromotionBlockers(fromEnv as Environment);
  const candidate = getLatestCandidate(toEnv);

  return {
    ready: blockers.filter(b => b.severity === 'blocking').length === 0,
    blockers,
    candidate,
  };
}

module.exports = {
  createReleaseCandidate, getAllReleaseCandidates, getLatestCandidate, markPromoted,
  gatherPromotionBlockers, buildPromotionSummary,
  recordRollback, getRollbackHistory, getReleaseReadiness,
};
