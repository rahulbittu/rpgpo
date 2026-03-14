// GPO Release Operations — Governed commit/push/promote workflow
// Every destructive action requires approval. Never auto-pushes.

import type {
  CommitPackage, PushCandidate, ReleaseOpsStatus,
  GitState, Environment, PromotionBlocker, ReleaseCandidate,
} from './types';

const { execSync } = require('child_process') as typeof import('child_process');
const { RPGPO_ROOT } = require('./files') as { RPGPO_ROOT: string };

function uid(): string { return 'rop_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function run(cmd: string, cwd?: string): string {
  try { return execSync(cmd, { cwd: cwd || RPGPO_ROOT, timeout: 10000, encoding: 'utf-8' }); }
  catch { return ''; }
}

// ═══════════════════════════════════════════
// Release Operations Status
// ═══════════════════════════════════════════

/** Get the full release operations status */
export function getReleaseOpsStatus(): ReleaseOpsStatus {
  const gitops = require('./gitops') as { getGitState(): GitState };
  const releases = require('./releases') as {
    gatherPromotionBlockers(env: Environment): PromotionBlocker[];
    getLatestCandidate(env: Environment): ReleaseCandidate | null;
  };
  const envMod = require('./environments') as { getCurrentEnv(): Environment };

  const gitState = gitops.getGitState();
  const currentEnv = envMod.getCurrentEnv();
  const blockers = releases.gatherPromotionBlockers(currentEnv);

  // Count pending approvals
  let pendingApprovals = 0;
  try {
    const intake = require('./intake') as { getAllTasks(): Array<{ status: string }> };
    pendingApprovals = intake.getAllTasks().filter(t => t.status === 'waiting_approval' || t.status === 'planned').length;
  } catch { /* ignore */ }

  return {
    git_state: gitState,
    commit_ready: gitState.changed_files.length > 0,
    push_ready: gitState.has_unpushed,
    promote_ready: blockers.filter(b => b.severity === 'blocking').length === 0,
    current_env: currentEnv,
    blockers,
    pending_approvals: pendingApprovals,
    last_commit: gitState.recent_commits[0] || null,
    last_release: releases.getLatestCandidate('beta'),
  };
}

// ═══════════════════════════════════════════
// Commit Package
// ═══════════════════════════════════════════

/** Build a commit package for review (does NOT commit) */
export function buildCommitPackage(message?: string): CommitPackage {
  const gitops = require('./gitops') as { getGitState(): GitState; buildReleaseSummary(): { commit_message: string; affected_modules: string[]; affected_missions: string[] } };
  const state = gitops.getGitState();
  const summary = gitops.buildReleaseSummary();

  return {
    id: uid(),
    message: message || summary.commit_message,
    files: state.changed_files.map(f => f.path),
    modules_affected: summary.affected_modules,
    missions_affected: summary.affected_missions,
    requires_approval: true,
    approved: false,
    created_at: new Date().toISOString(),
  };
}

/** Execute a commit (only after approval — caller must verify) */
export function executeCommit(message: string, files: string[]): { success: boolean; hash: string; error?: string } {
  try {
    // Stage specified files
    for (const f of files) {
      run(`git add "${f}"`);
    }

    // Commit
    const result = run(`git commit -m "${message.replace(/"/g, '\\"')}"`);
    const hashMatch = result.match(/\[[\w/]+ ([a-f0-9]+)\]/);
    const hash = hashMatch ? hashMatch[1] : 'unknown';

    console.log(`[release-ops] Commit executed: ${hash} — ${message.slice(0, 60)}`);
    return { success: true, hash };
  } catch (e: unknown) {
    return { success: false, hash: '', error: (e as Error).message.slice(0, 200) };
  }
}

// ═══════════════════════════════════════════
// Push Candidate
// ═══════════════════════════════════════════

/** Build a push candidate for review (does NOT push) */
export function buildPushCandidate(): PushCandidate {
  const gitops = require('./gitops') as { getGitState(): GitState };
  const state = gitops.getGitState();

  // Get unpushed commits
  let unpushedCommits: Array<{ hash: string; message: string; author: string; date: string }> = [];
  try {
    const log = run('git log --oneline --format="%H|%s|%an|%ai" @{u}..HEAD');
    unpushedCommits = log.trim().split('\n').filter(Boolean).map(line => {
      const [hash, message, author, date] = line.split('|');
      return { hash: (hash || '').slice(0, 8), message: message || '', author: author || '', date: date || '' };
    });
  } catch { /* no upstream */ }

  return {
    id: uid(),
    branch: state.branch,
    commits: unpushedCommits,
    remote: 'origin',
    requires_approval: true,
    approved: false,
    created_at: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════
// Promotion Package
// ═══════════════════════════════════════════

/** Build a full promotion package summary */
export function buildPromotionPackage(fromEnv: Environment, toEnv: Environment): {
  candidate: ReleaseCandidate | null;
  summary: import('./types').PromotionSummary;
  status: ReleaseOpsStatus;
  approval_checklist: string[];
} {
  const releases = require('./releases') as {
    getLatestCandidate(env: Environment): ReleaseCandidate | null;
    buildPromotionSummary(f: Environment, t: Environment): import('./types').PromotionSummary;
  };

  const candidate = releases.getLatestCandidate(toEnv);
  const summary = releases.buildPromotionSummary(fromEnv, toEnv);
  const status = getReleaseOpsStatus();

  const checklist: string[] = [];
  if (!status.git_state.clean) checklist.push('Commit or stash uncommitted changes');
  if (status.pending_approvals > 0) checklist.push(`Resolve ${status.pending_approvals} pending approval(s)`);
  for (const b of summary.blockers) {
    if (b.severity === 'blocking') checklist.push(b.resolvable_by);
  }
  if (!candidate) checklist.push('Create a release candidate first');

  return { candidate, summary, status, approval_checklist: checklist };
}

module.exports = {
  getReleaseOpsStatus,
  buildCommitPackage, executeCommit,
  buildPushCandidate,
  buildPromotionPackage,
};
