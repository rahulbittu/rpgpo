// GPO TopRanker Repo Adapter — Build pipeline integration

import type { TopRankerReleaseArtifact } from '../types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const RPGPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const REPO_PATH = path.join(RPGPO_ROOT, '02-Projects', 'TopRanker', 'source-repo');
const ARTIFACTS_DIR = path.join(RPGPO_ROOT, '02-Projects', 'TopRanker', 'artifacts');

export function detectTopRankerRepo(basePath?: string): { exists: boolean; repoPath?: string; packageJson?: any } {
  const repoDir = basePath || REPO_PATH;
  const pkgPath = path.join(repoDir, 'package.json');
  if (!fs.existsSync(repoDir)) return { exists: false };
  let packageJson: any = null;
  try {
    if (fs.existsSync(pkgPath)) packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
  } catch { /* */ }
  return { exists: true, repoPath: repoDir, packageJson };
}

export function prepareTopRankerEnv(opts: { dryRun: boolean; env?: Record<string, string | undefined> }): { env: Record<string, string>; redactions: string[] } {
  const env: Record<string, string> = { NODE_ENV: 'production', ...process.env as Record<string, string> };
  const redactions = ['POSTGRES_URL', 'DATABASE_URL', 'EXPO_TOKEN', 'OPENAI_API_KEY', 'PERPLEXITY_API_KEY', 'GEMINI_API_KEY'];
  if (opts.dryRun) env.GPO_DRY_RUN = 'true';
  return { env, redactions };
}

export async function runTopRankerBuild(opts: { dryRun?: boolean; steps?: string[]; timeoutMs?: number; cwd?: string }): Promise<{ ok: boolean; artifacts: TopRankerReleaseArtifact[]; logsPath: string; errors?: string[] }> {
  const steps = opts.steps || ['install', 'build:server', 'test'];
  const cwd = opts.cwd || REPO_PATH;
  const now = new Date().toISOString().replace(/[:.]/g, '-');
  const logsDir = path.join(RPGPO_ROOT, '03-Operations', 'logs');
  const logsPath = path.join(logsDir, `topranker-build-${now}.log`);

  try { if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true }); } catch { /* */ }

  if (opts.dryRun !== false) {
    // Dry run: simulate outputs
    const simDir = path.join(ARTIFACTS_DIR, 'simulated');
    try { if (!fs.existsSync(simDir)) fs.mkdirSync(simDir, { recursive: true }); } catch { /* */ }

    const dummyContent = JSON.stringify({ simulated: true, steps, timestamp: new Date().toISOString() });
    const dummyFile = path.join(simDir, `build-${now}.json`);
    try { fs.writeFileSync(dummyFile, dummyContent); } catch { /* */ }

    const checksum = crypto.createHash('sha256').update(dummyContent).digest('hex');

    const artifacts: TopRankerReleaseArtifact[] = [{
      artifactId: `art_${Date.now().toString(36)}`,
      repoPath: '02-Projects/TopRanker/source-repo',
      platform: 'server',
      filePath: path.relative(RPGPO_ROOT, dummyFile),
      sizeBytes: Buffer.byteLength(dummyContent),
      checksumSha256: checksum,
      createdAt: new Date().toISOString(),
    }];

    // Write log
    try { fs.writeFileSync(logsPath, `[dry-run] TopRanker build simulated\nSteps: ${steps.join(', ')}\nArtifacts: ${artifacts.length}\n`); } catch { /* */ }

    return { ok: true, artifacts, logsPath };
  }

  // Real build would use child_process.spawn — not implemented for safety
  return { ok: false, artifacts: [], logsPath, errors: ['Real build not implemented — use dryRun=true'] };
}

export async function collectTopRankerArtifacts(opts: { cwd: string }): Promise<TopRankerReleaseArtifact[]> {
  const artifacts: TopRankerReleaseArtifact[] = [];
  const simDir = path.join(ARTIFACTS_DIR, 'simulated');
  if (!fs.existsSync(simDir)) return artifacts;

  try {
    const files = fs.readdirSync(simDir).filter((f: string) => f.endsWith('.json'));
    for (const file of files) {
      const full = path.join(simDir, file);
      const content = fs.readFileSync(full, 'utf-8');
      const checksum = crypto.createHash('sha256').update(content).digest('hex');
      artifacts.push({
        artifactId: `art_${file.replace('.json', '')}`,
        repoPath: '02-Projects/TopRanker/source-repo',
        platform: 'server',
        filePath: path.relative(RPGPO_ROOT, full),
        sizeBytes: Buffer.byteLength(content),
        checksumSha256: checksum,
        createdAt: new Date().toISOString(),
      });
    }
  } catch { /* */ }

  return artifacts;
}

module.exports = { detectTopRankerRepo, prepareTopRankerEnv, runTopRankerBuild, collectTopRankerArtifacts };
