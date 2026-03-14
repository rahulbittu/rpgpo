// GPO GitOps Layer — Git state, change summaries, commit/release helpers
// Governed: never auto-pushes or auto-merges. Always stops for approval.

import type { GitState, GitChangedFile, GitCommitSummary, ReleaseSummary } from './types';

const { execSync } = require('child_process') as typeof import('child_process');
const path = require('path') as typeof import('path');
const { RPGPO_ROOT } = require('./files') as { RPGPO_ROOT: string };

// ═══════════════════════════════════════════
// Git State
// ═══════════════════════════════════════════

/** Get current git state for a repo */
export function getGitState(cwd?: string): GitState {
  const dir = cwd || RPGPO_ROOT;

  let branch = 'unknown';
  try { branch = run('git rev-parse --abbrev-ref HEAD', dir).trim(); } catch { /* ignore */ }

  const changedFiles = getChangedFiles(dir);
  const recentCommits = getRecentCommits(dir, 5);

  let hasUnpushed = false;
  try {
    const ahead = run(`git rev-list --count @{u}..HEAD`, dir).trim();
    hasUnpushed = parseInt(ahead) > 0;
  } catch { /* no upstream or error */ }

  return {
    branch,
    clean: changedFiles.length === 0,
    changed_files: changedFiles,
    recent_commits: recentCommits,
    has_unpushed: hasUnpushed,
  };
}

/** Get list of changed files */
function getChangedFiles(cwd: string): GitChangedFile[] {
  const files: GitChangedFile[] = [];

  try {
    // Staged changes
    const staged = run('git diff --name-status --cached', cwd).trim();
    for (const line of staged.split('\n').filter(Boolean)) {
      const [status, ...pathParts] = line.split('\t');
      const filePath = pathParts.join('\t');
      files.push({ path: filePath, status: statusMap(status), staged: true });
    }

    // Unstaged changes
    const unstaged = run('git diff --name-status', cwd).trim();
    for (const line of unstaged.split('\n').filter(Boolean)) {
      const [status, ...pathParts] = line.split('\t');
      const filePath = pathParts.join('\t');
      if (!files.some(f => f.path === filePath)) {
        files.push({ path: filePath, status: statusMap(status), staged: false });
      }
    }

    // Untracked
    const untracked = run('git ls-files --others --exclude-standard', cwd).trim();
    for (const line of untracked.split('\n').filter(Boolean)) {
      if (!files.some(f => f.path === line)) {
        files.push({ path: line, status: 'untracked', staged: false });
      }
    }
  } catch { /* ignore */ }

  return files;
}

/** Get recent commits */
function getRecentCommits(cwd: string, count: number): GitCommitSummary[] {
  try {
    const log = run(`git log --oneline --format="%H|%s|%an|%ai" -${count}`, cwd).trim();
    return log.split('\n').filter(Boolean).map(line => {
      const [hash, message, author, date] = line.split('|');
      return { hash: (hash || '').slice(0, 8), message: message || '', author: author || '', date: date || '' };
    });
  } catch { return []; }
}

function statusMap(s: string): GitChangedFile['status'] {
  if (s === 'A') return 'added';
  if (s === 'D') return 'deleted';
  if (s === 'M') return 'modified';
  return 'modified';
}

// ═══════════════════════════════════════════
// Release Summary Builder
// ═══════════════════════════════════════════

/** Build a release summary from current git state */
export function buildReleaseSummary(cwd?: string): ReleaseSummary {
  const dir = cwd || RPGPO_ROOT;
  const state = getGitState(dir);

  const changedPaths = state.changed_files.map(f => f.path);

  // Classify affected modules
  const modules = new Set<string>();
  const missions = new Set<string>();
  for (const f of changedPaths) {
    if (f.includes('04-Dashboard/app/lib/')) {
      const mod = f.split('lib/')[1]?.replace(/\.(ts|js)$/, '');
      if (mod) modules.add(mod);
    }
    if (f.includes('TopRanker')) missions.add('TopRanker');
    if (f.includes('CareerEngine')) missions.add('CareerEngine');
    if (f.includes('MissionStatus')) missions.add('Missions');
  }

  // Build commit message
  const fileCount = changedPaths.length;
  const modList = Array.from(modules).slice(0, 5).join(', ');
  const commitMessage = modList
    ? `Update ${modList}${modules.size > 5 ? ` (+${modules.size - 5} more)` : ''}`
    : `Update ${fileCount} file(s)`;

  // Build PR body
  const prBody = `## Changes\n- ${fileCount} file(s) changed\n${modList ? `- Modules: ${modList}\n` : ''}${missions.size ? `- Missions: ${Array.from(missions).join(', ')}\n` : ''}\n## Changed Files\n${changedPaths.slice(0, 20).map(f => `- ${f}`).join('\n')}${changedPaths.length > 20 ? `\n- ... and ${changedPaths.length - 20} more` : ''}`;

  const releaseNote = `${commitMessage}. ${fileCount} file(s) across ${modules.size} module(s).`;

  return {
    commit_message: commitMessage,
    pr_title: commitMessage,
    pr_body: prBody,
    release_note: releaseNote,
    changed_files: changedPaths,
    affected_modules: Array.from(modules),
    affected_missions: Array.from(missions),
    requires_approval: true,
  };
}

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

function run(cmd: string, cwd: string): string {
  try {
    return execSync(cmd, { cwd, timeout: 5000, encoding: 'utf-8' });
  } catch {
    return '';
  }
}

module.exports = { getGitState, buildReleaseSummary };
