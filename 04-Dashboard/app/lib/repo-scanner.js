// RPGPO Repo Scanner — Grounding layer for code tasks
// Scans real project repos and produces structural maps.
// Used by deliberation to prevent placeholder/invented file paths.

const fs = require('fs');
const path = require('path');
const { RPGPO_ROOT } = require('./files');

// Known project source roots (relative to RPGPO_ROOT)
const PROJECT_ROOTS = {
  topranker: '02-Projects/TopRanker/source-repo',
  careeregine: '02-Projects/CareerEngine',
  founder2founder: '02-Projects/Founder2Founder',
  wealthresearch: '02-Projects/WealthResearch',
};

// File extensions that matter for code tasks
const CODE_EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.sql', '.css', '.md']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.expo', '.next', 'android', 'ios', 'screenshots', 'attached_assets', 'assets', 'patches']);

/**
 * Scan a directory tree and return a structured map.
 * Returns { dirs: [...], files: [...], tree: "compact string" }
 */
function scanDir(absRoot, maxDepth = 3) {
  const dirs = [];
  const files = [];

  function walk(dir, depth, relPath) {
    if (depth > maxDepth) return;
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

    for (const e of entries) {
      if (e.name.startsWith('.') && e.name !== '.env.example') continue;
      const full = path.join(dir, e.name);
      const rel = relPath ? relPath + '/' + e.name : e.name;

      if (e.isDirectory()) {
        if (SKIP_DIRS.has(e.name)) continue;
        dirs.push(rel);
        walk(full, depth + 1, rel);
      } else if (e.isFile()) {
        const ext = path.extname(e.name).toLowerCase();
        if (CODE_EXTS.has(ext)) {
          files.push(rel);
        }
      }
    }
  }

  walk(absRoot, 0, '');
  return { dirs, files };
}

/**
 * Build a compact structural map of a project.
 * Groups files by directory for readability.
 * Returns a string suitable for injection into an LLM prompt.
 */
function buildStructuralMap(domain) {
  const projectRelRoot = PROJECT_ROOTS[domain];
  if (!projectRelRoot) return null;

  const absRoot = path.join(RPGPO_ROOT, projectRelRoot);
  if (!fs.existsSync(absRoot)) return null;

  const { dirs, files } = scanDir(absRoot, 3);

  // Group files by top-level directory
  const groups = {};
  for (const f of files) {
    const parts = f.split('/');
    const group = parts.length > 1 ? parts[0] : '(root)';
    if (!groups[group]) groups[group] = [];
    groups[group].push(f);
  }

  // Build compact tree string
  let tree = `Project: ${domain}\n`;
  tree += `Source root: ${projectRelRoot}\n`;
  tree += `Total: ${files.length} code files in ${dirs.length} directories\n\n`;

  // Sort groups by relevance (app, components, lib, server first)
  const priority = ['app', 'components', 'lib', 'server', 'hooks', 'config', 'constants', 'shared', 'types', 'scripts'];
  const sortedGroups = Object.keys(groups).sort((a, b) => {
    const ai = priority.indexOf(a);
    const bi = priority.indexOf(b);
    if (ai !== -1 && bi !== -1) return ai - bi;
    if (ai !== -1) return -1;
    if (bi !== -1) return 1;
    return a.localeCompare(b);
  });

  for (const group of sortedGroups) {
    const gFiles = groups[group];
    tree += `${group}/ (${gFiles.length} files)\n`;
    // Show first 15 files per group, summarize rest
    const show = gFiles.slice(0, 15);
    for (const f of show) {
      tree += `  ${f}\n`;
    }
    if (gFiles.length > 15) {
      tree += `  ... and ${gFiles.length - 15} more\n`;
    }
  }

  return { tree, files, dirs, projectRelRoot };
}

/**
 * For a given task description and domain, identify likely target areas.
 * Returns keywords and suggested directories to focus on.
 */
function inferTargetAreas(taskText, domain) {
  const lower = (taskText || '').toLowerCase();
  const areas = [];

  // TopRanker-specific patterns
  if (domain === 'topranker') {
    if (lower.includes('startup') || lower.includes('launch') || lower.includes('splash') || lower.includes('loading')) {
      areas.push({ area: 'app startup', dirs: ['app', 'app/_layout.tsx'], reason: 'startup/launch related' });
    }
    if (lower.includes('api') || lower.includes('server') || lower.includes('endpoint') || lower.includes('route')) {
      areas.push({ area: 'server/API', dirs: ['server'], reason: 'server/API related' });
    }
    if (lower.includes('leaderboard') || lower.includes('ranking') || lower.includes('rank')) {
      areas.push({ area: 'leaderboard', dirs: ['app/(tabs)/index.tsx', 'components/leaderboard'], reason: 'leaderboard/ranking related' });
    }
    if (lower.includes('search') || lower.includes('discover')) {
      areas.push({ area: 'search', dirs: ['app/(tabs)/search.tsx', 'components/search'], reason: 'search/discovery related' });
    }
    if (lower.includes('profile') || lower.includes('user')) {
      areas.push({ area: 'profile', dirs: ['app/(tabs)/profile.tsx', 'components/profile', 'app/edit-profile.tsx'], reason: 'profile/user related' });
    }
    if (lower.includes('business') || lower.includes('claim') || lower.includes('dashboard')) {
      areas.push({ area: 'business', dirs: ['app/business', 'components/business', 'components/dashboard'], reason: 'business profile related' });
    }
    if (lower.includes('performance') || lower.includes('render') || lower.includes('memo') || lower.includes('lazy')) {
      areas.push({ area: 'performance', dirs: ['app/_layout.tsx', 'app/(tabs)', 'hooks', 'lib'], reason: 'performance optimization' });
    }
    if (lower.includes('navigation') || lower.includes('tab') || lower.includes('layout') || lower.includes('router')) {
      areas.push({ area: 'navigation', dirs: ['app/_layout.tsx', 'app/(tabs)/_layout.tsx'], reason: 'navigation/routing' });
    }
    if (lower.includes('auth') || lower.includes('login') || lower.includes('signup')) {
      areas.push({ area: 'auth', dirs: ['app/auth', 'lib/auth'], reason: 'authentication' });
    }
    if (lower.includes('style') || lower.includes('theme') || lower.includes('color') || lower.includes('dark mode')) {
      areas.push({ area: 'styling', dirs: ['constants/colors.ts', 'constants/dark-colors.ts', 'constants/typography.ts'], reason: 'styling/theme' });
    }
    if (lower.includes('hook') || lower.includes('state') || lower.includes('context')) {
      areas.push({ area: 'hooks/state', dirs: ['hooks', 'lib/hooks'], reason: 'hooks/state management' });
    }
    if (lower.includes('test') || lower.includes('spec')) {
      areas.push({ area: 'tests', dirs: ['__tests__', 'tests'], reason: 'testing' });
    }
  }

  // Generic patterns
  if (lower.includes('config') || lower.includes('env') || lower.includes('setting')) {
    areas.push({ area: 'config', dirs: ['config'], reason: 'configuration' });
  }
  if (lower.includes('database') || lower.includes('migration') || lower.includes('schema')) {
    areas.push({ area: 'database', dirs: ['migrations', 'server/storage'], reason: 'database/schema' });
  }

  return areas;
}

/**
 * Find candidate files matching target areas.
 * Returns actual existing files (repo-relative to RPGPO_ROOT).
 */
function findCandidateFiles(domain, targetAreas, allFiles, projectRelRoot) {
  const candidates = [];

  for (const area of targetAreas) {
    for (const dir of area.dirs) {
      // Match files that start with this dir pattern
      const matching = allFiles.filter(f => f.startsWith(dir) || f === dir);
      for (const m of matching) {
        const repoRelPath = projectRelRoot + '/' + m;
        const fullPath = path.join(RPGPO_ROOT, repoRelPath);
        if (fs.existsSync(fullPath)) {
          candidates.push({
            path: repoRelPath,
            area: area.area,
            reason: area.reason,
          });
        }
      }
    }
  }

  // Dedupe
  const seen = new Set();
  return candidates.filter(c => {
    if (seen.has(c.path)) return false;
    seen.add(c.path);
    return true;
  });
}

/**
 * Full repo grounding: scan + infer + find candidates.
 * Returns everything the deliberation prompt needs.
 */
function groundInRepo(domain, taskText) {
  const map = buildStructuralMap(domain);
  if (!map) {
    return {
      grounded: false,
      reason: `No source repo found for domain "${domain}"`,
      tree: null,
      candidates: [],
      targetAreas: [],
    };
  }

  const targetAreas = inferTargetAreas(taskText, domain);
  const candidates = findCandidateFiles(domain, targetAreas, map.files, map.projectRelRoot);

  return {
    grounded: true,
    tree: map.tree,
    allFiles: map.files,
    projectRelRoot: map.projectRelRoot,
    targetAreas,
    candidates,
    totalFiles: map.files.length,
    totalDirs: map.dirs.length,
  };
}

/**
 * Validate that all file paths in a subtask definition actually exist.
 * Returns { valid: true } or { valid: false, missing: [...] }
 */
function validatePaths(filePaths) {
  const missing = [];
  for (const f of filePaths) {
    const fullPath = path.join(RPGPO_ROOT, f);
    if (!fs.existsSync(fullPath)) {
      missing.push(f);
    }
  }
  return missing.length === 0 ? { valid: true, missing: [] } : { valid: false, missing };
}

module.exports = {
  scanDir,
  buildStructuralMap,
  inferTargetAreas,
  findCandidateFiles,
  groundInRepo,
  validatePaths,
  PROJECT_ROOTS,
};
