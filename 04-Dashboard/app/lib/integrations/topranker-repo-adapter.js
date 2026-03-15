"use strict";
// GPO TopRanker Repo Adapter — Build pipeline integration
Object.defineProperty(exports, "__esModule", { value: true });
exports.detectTopRankerRepo = detectTopRankerRepo;
exports.prepareTopRankerEnv = prepareTopRankerEnv;
exports.runTopRankerBuild = runTopRankerBuild;
exports.collectTopRankerArtifacts = collectTopRankerArtifacts;
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const RPGPO_ROOT = path.resolve(__dirname, '..', '..', '..', '..');
const REPO_PATH = path.join(RPGPO_ROOT, '02-Projects', 'TopRanker', 'source-repo');
const ARTIFACTS_DIR = path.join(RPGPO_ROOT, '02-Projects', 'TopRanker', 'artifacts');
function detectTopRankerRepo(basePath) {
    const repoDir = basePath || REPO_PATH;
    const pkgPath = path.join(repoDir, 'package.json');
    if (!fs.existsSync(repoDir))
        return { exists: false };
    let packageJson = null;
    try {
        if (fs.existsSync(pkgPath))
            packageJson = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    }
    catch { /* */ }
    return { exists: true, repoPath: repoDir, packageJson };
}
function prepareTopRankerEnv(opts) {
    const env = { NODE_ENV: 'production', ...process.env };
    const redactions = ['POSTGRES_URL', 'DATABASE_URL', 'EXPO_TOKEN', 'OPENAI_API_KEY', 'PERPLEXITY_API_KEY', 'GEMINI_API_KEY'];
    if (opts.dryRun)
        env.GPO_DRY_RUN = 'true';
    return { env, redactions };
}
async function runTopRankerBuild(opts) {
    const steps = opts.steps || ['install', 'build:server', 'test'];
    const cwd = opts.cwd || REPO_PATH;
    const now = new Date().toISOString().replace(/[:.]/g, '-');
    const logsDir = path.join(RPGPO_ROOT, '03-Operations', 'logs');
    const logsPath = path.join(logsDir, `topranker-build-${now}.log`);
    try {
        if (!fs.existsSync(logsDir))
            fs.mkdirSync(logsDir, { recursive: true });
    }
    catch { /* */ }
    if (opts.dryRun !== false) {
        // Dry run: simulate outputs
        const simDir = path.join(ARTIFACTS_DIR, 'simulated');
        try {
            if (!fs.existsSync(simDir))
                fs.mkdirSync(simDir, { recursive: true });
        }
        catch { /* */ }
        const dummyContent = JSON.stringify({ simulated: true, steps, timestamp: new Date().toISOString() });
        const dummyFile = path.join(simDir, `build-${now}.json`);
        try {
            fs.writeFileSync(dummyFile, dummyContent);
        }
        catch { /* */ }
        const checksum = crypto.createHash('sha256').update(dummyContent).digest('hex');
        const artifacts = [{
                artifactId: `art_${Date.now().toString(36)}`,
                repoPath: '02-Projects/TopRanker/source-repo',
                platform: 'server',
                filePath: path.relative(RPGPO_ROOT, dummyFile),
                sizeBytes: Buffer.byteLength(dummyContent),
                checksumSha256: checksum,
                createdAt: new Date().toISOString(),
            }];
        // Write log
        try {
            fs.writeFileSync(logsPath, `[dry-run] TopRanker build simulated\nSteps: ${steps.join(', ')}\nArtifacts: ${artifacts.length}\n`);
        }
        catch { /* */ }
        return { ok: true, artifacts, logsPath };
    }
    // Real build would use child_process.spawn — not implemented for safety
    return { ok: false, artifacts: [], logsPath, errors: ['Real build not implemented — use dryRun=true'] };
}
async function collectTopRankerArtifacts(opts) {
    const artifacts = [];
    const simDir = path.join(ARTIFACTS_DIR, 'simulated');
    if (!fs.existsSync(simDir))
        return artifacts;
    try {
        const files = fs.readdirSync(simDir).filter((f) => f.endsWith('.json'));
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
    }
    catch { /* */ }
    return artifacts;
}
module.exports = { detectTopRankerRepo, prepareTopRankerEnv, runTopRankerBuild, collectTopRankerArtifacts };
//# sourceMappingURL=topranker-repo-adapter.js.map