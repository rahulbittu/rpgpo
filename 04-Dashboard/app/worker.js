#!/usr/bin/env node
// RPGPO Background Task Worker v6
// Polls the task queue and executes tasks sequentially.
// Safe: no auto-send, no auto-post, no financial execution.

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// .env is the canonical source for API keys — always overrides process.env
// to prevent stale PM2-cached placeholders from being used.
const API_KEY_NAMES = new Set(['OPENAI_API_KEY', 'PERPLEXITY_API_KEY', 'GEMINI_API_KEY']);
(function loadEnv() {
  try {
    const lines = fs.readFileSync(path.join(__dirname, '.env'), 'utf-8').split('\n');
    for (const line of lines) {
      const t = line.trim();
      if (!t || t.startsWith('#')) continue;
      const eq = t.indexOf('=');
      if (eq === -1) continue;
      const key = t.slice(0, eq).trim();
      const val = t.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
      if (API_KEY_NAMES.has(key) || !process.env[key]) process.env[key] = val;
    }
  } catch {}
})();

const queue = require('./lib/queue');
const { RPGPO_ROOT, logAction, writeFile, readFile } = require('./lib/files');
const { callOpenAI, callPerplexity, callGemini } = require('./lib/ai');
const costs = require('./lib/costs');
const intake = require('./lib/intake');
const { deliberate } = require('./lib/deliberation');
const workflow = require('./lib/workflow');

const POLL_INTERVAL = 2000;
let running = false;

console.log(`[worker] RPGPO Task Worker v6 started at ${new Date().toISOString()}`);
console.log(`[worker] Root: ${RPGPO_ROOT}`);
// Key diagnostic — show prefix only, confirm source is .env not placeholder
function keyDiag(name) {
  const v = process.env[name];
  if (!v) return 'MISSING';
  if (v === 'your_key_here' || v.startsWith('your_')) return 'PLACEHOLDER (broken!)';
  return `OK (${v.slice(0, 6)}...)`;
}
console.log(`[worker] Keys: OpenAI=${keyDiag('OPENAI_API_KEY')} Perplexity=${keyDiag('PERPLEXITY_API_KEY')} Gemini=${keyDiag('GEMINI_API_KEY')}`);
console.log(`[worker] Polling every ${POLL_INTERVAL}ms`);

// ═══════════════════════════════════════════
// Dedicated Claude Builder Runner
// Separated from text subtasks. Optimized for coding/build tasks.
// Non-blocking, progress-aware, honest about outcomes.
// ═══════════════════════════════════════════

// Builder timeout defaults — overridable via cost-settings.json
const BUILDER_DEFAULT_TIMEOUT_MS = 600000; // 10 minutes (was 3min — too short for real code tasks)
const BUILDER_INACTIVITY_TIMEOUT_MS = 180000; // 3 minutes of no output = hung (Claude code tasks take 60-90s before first output)
const BUILDER_PROGRESS_INTERVAL = 3000;

function getBuilderTimeoutMs() {
  try {
    const settings = costs.getSettings();
    if (settings.builderTimeoutMinutes && Number(settings.builderTimeoutMinutes) > 0) {
      return Number(settings.builderTimeoutMinutes) * 60000;
    }
  } catch {}
  return BUILDER_DEFAULT_TIMEOUT_MS;
}

// Classify changed files by project scope
function classifyFiles(files) {
  const rpgpo = []; const topranker = []; const other = [];
  for (const f of files) {
    const fl = f.toLowerCase();
    if (fl.startsWith('04-dashboard/') || fl.startsWith('03-operations/') || fl.startsWith('01-') || fl.startsWith('02-')) rpgpo.push(f);
    else if (fl.includes('topranker') || fl.startsWith('apps/') || fl.startsWith('packages/') || fl.startsWith('src/')) topranker.push(f);
    else other.push(f);
  }
  const parts = [];
  if (topranker.length) parts.push(`${topranker.length} TopRanker file(s)`);
  if (rpgpo.length) parts.push(`${rpgpo.length} RPGPO infra file(s)`);
  if (other.length) parts.push(`${other.length} other file(s)`);
  const summary = parts.join(', ') || 'No files';
  const onlyRpgpo = rpgpo.length > 0 && topranker.length === 0 && other.length === 0;
  return { rpgpo, topranker, other, summary, onlyRpgpo };
}

function broadcastBuilderPhase(taskQueueId, subtaskId, phase, detail) {
  const msg = { phase, detail, subtaskId, ts: new Date().toISOString() };
  queue.updateTask(taskQueueId, { output: `[builder:${phase}] ${detail}` });
  // Also update subtask with live phase for dashboard
  try { intake.updateSubtask(subtaskId, { builder_phase: phase }); } catch {}
}

async function runBuilder(task, subtaskId, st, userPrompt) {
  const today = new Date().toISOString().slice(0, 10);
  const isBuildTask = ['implement', 'build', 'code'].includes(st.stage);

  // ── Phase 1: INSPECTING — Ground in real repo ──
  broadcastBuilderPhase(task.id, subtaskId, 'inspecting', 'Scanning repo for target files...');
  intake.updateSubtask(subtaskId, { status: 'builder_running', builder_phase: 'inspecting' });
  intake.updateTask(st.parent_task_id, { status: 'executing' });

  let repoContext = '';
  const targetFiles = [...(st.files_to_read || []), ...(st.files_to_write || [])];
  const realFiles = [];
  const missingFiles = [];

  try {
    for (const f of targetFiles) {
      const fullPath = path.join(RPGPO_ROOT, f);
      if (fs.existsSync(fullPath)) { realFiles.push(f); }
      else { missingFiles.push(f); }
    }

    // If build task has no real targets at all, block
    if (missingFiles.length && isBuildTask && !realFiles.length) {
      broadcastBuilderPhase(task.id, subtaskId, 'blocked', `No target files found: ${missingFiles.join(', ')}`);
      intake.updateSubtask(subtaskId, {
        status: 'blocked',
        builder_outcome: 'blocked_missing_context',
        builder_phase: 'blocked',
        outcome_type: 'blocked_missing_context',
        code_modified: false,
        output: `Builder blocked: target files not found in repo.\nMissing: ${missingFiles.join(', ')}`,
        error: `Cannot execute build — target files do not exist: ${missingFiles.join(', ')}`,
        files_changed: [],
        what_done: `Blocked — target files not found: ${missingFiles.join(', ')}`,
      });
      intake.updateTask(st.parent_task_id, { status: 'waiting_approval' });
      return { output: `Builder blocked: missing files ${missingFiles.join(', ')}`, builderOutcome: 'blocked_missing_context' };
    }

    if (realFiles.length) {
      repoContext = `Real files verified:\n${realFiles.map(f => '  + ' + f).join('\n')}`;
      if (missingFiles.length) repoContext += `\nMissing (will skip):\n${missingFiles.map(f => '  - ' + f).join('\n')}`;
    }

    // Read file sizes to show scope
    let totalSize = 0;
    for (const f of realFiles) {
      try { totalSize += fs.statSync(path.join(RPGPO_ROOT, f)).size; } catch {}
    }
    broadcastBuilderPhase(task.id, subtaskId, 'inspecting',
      `Found ${realFiles.length} target file(s) (${Math.round(totalSize / 1024)}KB). ${missingFiles.length ? missingFiles.length + ' missing.' : ''}`);
  } catch (e) {
    console.log(`[worker] Builder repo inspection warning: ${e.message.slice(0, 80)}`);
  }

  // ── Phase 2: LAUNCHING — Async Claude CLI execution ──
  // Determine working directory: use TopRanker source repo for TopRanker tasks
  let builderCwd = RPGPO_ROOT;
  const isTopRankerTask = (st.domain === 'topranker') ||
    (targetFiles.some(f => f.toLowerCase().includes('topranker') || f.startsWith('02-Projects/TopRanker')));
  const topRankerRepo = path.join(RPGPO_ROOT, '02-Projects/TopRanker/source-repo');
  if (isTopRankerTask && fs.existsSync(topRankerRepo)) {
    builderCwd = topRankerRepo;
    console.log(`[worker][builder] TopRanker task — using cwd: ${builderCwd}`);
  }

  const hardTimeoutMs = getBuilderTimeoutMs();
  const inactivityTimeoutMs = BUILDER_INACTIVITY_TIMEOUT_MS;
  console.log(`[worker][builder] Timeout config: hard=${Math.round(hardTimeoutMs/60000)}min, inactivity=${Math.round(inactivityTimeoutMs/1000)}s`);
  broadcastBuilderPhase(task.id, subtaskId, 'launching',
    `Starting Claude CLI (timeout: ${Math.round(hardTimeoutMs/60000)}min, cwd: ${builderCwd.split('/').slice(-2).join('/')})...`);
  intake.updateSubtask(subtaskId, { builder_phase: 'launching' });

  let claudeResult = null;
  let filesChanged = [];
  let builderOutcome = null;

  // Builder runtime diagnostics
  const builderDiag = {
    startedAt: new Date().toISOString(),
    cwd: builderCwd,
    hardTimeoutMs,
    inactivityTimeoutMs,
    targetFiles: realFiles,
    totalOutputBytes: 0,
    totalLines: 0,
    lastOutputAt: null,
    killedReason: null,
    exitCode: null,
    durationMs: 0,
  };

  // ── Builder preflight — verify Claude CLI responds using the exact same
  //    spawn path (env, stdio, flags) that the real builder will use ──
  const builderEnv = { ...process.env };
  // Remove Claude Code nesting markers — these cause "cannot launch inside
  // another Claude Code session" when the PM2 worker inherits them.
  Object.keys(builderEnv).filter(k => k.startsWith('CLAUDE')).forEach(k => delete builderEnv[k]);

  const builderStdio = ['ignore', 'pipe', 'pipe']; // stdin must be closed, not piped

  try {
    broadcastBuilderPhase(task.id, subtaskId, 'preflight', 'Verifying Claude CLI can respond...');
    const preflightOut = await new Promise((pfResolve, pfReject) => {
      const pf = spawn('claude', ['--dangerously-skip-permissions', '-p', 'Reply with exactly: PREFLIGHT_OK'], {
        cwd: builderCwd,
        env: builderEnv,
        stdio: builderStdio,
      });
      let pfStdout = '', pfStderr = '';
      pf.stdout.on('data', d => { pfStdout += d.toString(); });
      pf.stderr.on('data', d => { pfStderr += d.toString(); });
      pf.on('close', code => {
        if (pfStdout.includes('PREFLIGHT_OK')) pfResolve(pfStdout);
        else pfReject(new Error(`Preflight failed: exit=${code} stdout="${pfStdout.slice(0,100)}" stderr="${pfStderr.slice(0,200)}"`));
      });
      pf.on('error', pfReject);
      setTimeout(() => { try { pf.kill('SIGTERM'); } catch {} pfReject(new Error('Preflight timed out after 30s')); }, 30000);
    });
    console.log(`[worker][builder] Preflight OK — Claude CLI is responsive`);
    builderDiag.preflightOk = true;
  } catch (pfErr) {
    console.error(`[worker][builder] Preflight FAILED: ${pfErr.message.slice(0, 200)}`);
    builderDiag.preflightOk = false;
    builderDiag.preflightError = pfErr.message.slice(0, 300);
    broadcastBuilderPhase(task.id, subtaskId, 'fallback', `Claude CLI preflight failed: ${pfErr.message.slice(0, 100)}`);

    const promptFile = writeFile(
      `03-Operations/Reports/Subtask-Claude-${today}-${subtaskId}.md`,
      `# RPGPO Builder Prompt — Manual Execution Required\n## ${st.title}\n## Stage: ${st.stage}\n## Reason: Claude CLI preflight failed: ${pfErr.message.slice(0,200)}\n## Working Directory: ${builderCwd}\n## Target Files: ${realFiles.join(', ') || 'none'}\n\n${userPrompt}\n`
    );
    intake.updateSubtask(subtaskId, {
      status: 'builder_fallback',
      builder_outcome: 'builder_fallback_prompt_created',
      builder_phase: 'fallback',
      outcome_type: 'builder_fallback_prompt_created',
      code_modified: false,
      output: `Claude CLI preflight failed: ${pfErr.message.slice(0,200)}\nPrompt saved to ${promptFile}.`,
      prompt_file: promptFile,
      files_changed: [],
      target_files: { real: realFiles, missing: missingFiles },
      what_done: `Builder preflight failed — prompt saved for manual execution`,
      builder_diagnostics: builderDiag,
    });
    intake.updateTask(st.parent_task_id, { status: 'waiting_approval' });
    return { output: `Preflight failed: ${pfErr.message.slice(0,120)}`, builderOutcome: 'builder_fallback_prompt_created', filesWritten: [promptFile], diagnostics: builderDiag };
  }

  // Snapshot git state before
  let gitBefore = '';
  try { gitBefore = execSync('git diff --name-only', { cwd: builderCwd, timeout: 5000 }).toString().trim(); } catch {}

  try {
    const startTime = Date.now();

    claudeResult = await new Promise((resolve, reject) => {
      const args = ['--dangerously-skip-permissions', '-p', userPrompt.slice(0, 16000)];
      const child = spawn('claude', args, {
        cwd: builderCwd,
        env: builderEnv,
        stdio: builderStdio,
      });

      let stdout = '';
      let stderr = '';
      let lastOutputTime = Date.now();
      let lastLineCount = 0;
      let lastOutputBytes = 0;
      let resolved = false;

      function cleanup() {
        clearInterval(progressInterval);
        clearTimeout(hardTimer);
        clearInterval(inactivityChecker);
      }

      // Track stdout — reset inactivity on real output
      child.stdout.on('data', d => {
        const chunk = d.toString();
        stdout += chunk;
        lastOutputTime = Date.now();
        builderDiag.totalOutputBytes += chunk.length;
        builderDiag.lastOutputAt = new Date().toISOString();
      });
      child.stderr.on('data', d => {
        const chunk = d.toString();
        stderr += chunk;
        lastOutputTime = Date.now(); // stderr counts as activity too
        // Log stderr so errors aren't silently swallowed
        console.log(`[worker][builder] stderr: ${chunk.trim().slice(0, 200)}`);
      });

      // Progress broadcast
      const progressInterval = setInterval(() => {
        const lines = stdout.split('\n').length;
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const newLines = lines - lastLineCount;
        const newBytes = stdout.length - lastOutputBytes;
        const sinceLastOutput = Math.round((Date.now() - lastOutputTime) / 1000);
        lastLineCount = lines;
        lastOutputBytes = stdout.length;
        builderDiag.totalLines = lines;

        const activeLabel = sinceLastOutput < 5 ? 'active' : sinceLastOutput < 30 ? 'thinking' : 'waiting';
        broadcastBuilderPhase(task.id, subtaskId, 'running',
          `Claude ${activeLabel}... ${lines} lines, ${Math.round(stdout.length/1024)}KB, ${elapsed}s elapsed` +
          (newLines > 0 ? ` (+${newLines} new)` : '') +
          (sinceLastOutput > 10 ? ` [${sinceLastOutput}s since last output]` : ''));
        intake.updateSubtask(subtaskId, { builder_phase: 'running' });

        console.log(`[worker][builder] progress: ${lines} lines, ${Math.round(stdout.length/1024)}KB, ${elapsed}s, last_output=${sinceLastOutput}s ago [${activeLabel}]`);
      }, BUILDER_PROGRESS_INTERVAL);

      child.on('close', (code) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        builderDiag.exitCode = code;
        builderDiag.durationMs = Date.now() - startTime;
        console.log(`[worker][builder] Process exited: code=${code}, duration=${Math.round(builderDiag.durationMs/1000)}s, output=${Math.round(stdout.length/1024)}KB`);
        if (code === 0 || stdout.length > 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `Claude CLI exit code ${code}`));
        }
      });

      child.on('error', (err) => {
        if (resolved) return;
        resolved = true;
        cleanup();
        builderDiag.killedReason = 'spawn_error';
        reject(err);
      });

      // Hard timeout — absolute maximum regardless of activity
      const hardTimer = setTimeout(() => {
        if (resolved) return;
        resolved = true;
        cleanup();
        builderDiag.killedReason = 'hard_timeout';
        builderDiag.durationMs = Date.now() - startTime;
        console.log(`[worker][builder] HARD TIMEOUT after ${Math.round(builderDiag.durationMs/1000)}s (limit=${Math.round(hardTimeoutMs/60000)}min). Output so far: ${Math.round(stdout.length/1024)}KB`);

        // If we have substantial output, save it and resolve instead of rejecting
        if (stdout.length > 500) {
          console.log(`[worker][builder] Had ${Math.round(stdout.length/1024)}KB of output — treating as partial success`);
          try { child.kill('SIGTERM'); } catch {}
          resolve(stdout);
        } else {
          try { child.kill('SIGTERM'); } catch {}
          reject(new Error('BUILDER_TIMEOUT'));
        }
      }, hardTimeoutMs);

      // Inactivity checker — kills only if NO output for inactivityTimeoutMs
      const inactivityChecker = setInterval(() => {
        if (resolved) return;
        const idle = Date.now() - lastOutputTime;
        if (idle > inactivityTimeoutMs) {
          resolved = true;
          cleanup();
          builderDiag.killedReason = 'inactivity_timeout';
          builderDiag.durationMs = Date.now() - startTime;
          console.log(`[worker][builder] INACTIVITY TIMEOUT: no output for ${Math.round(idle/1000)}s (limit=${Math.round(inactivityTimeoutMs/1000)}s). Total output: ${Math.round(stdout.length/1024)}KB`);

          // If we have substantial output, treat as partial success
          if (stdout.length > 500) {
            console.log(`[worker][builder] Had ${Math.round(stdout.length/1024)}KB — treating as partial success`);
            try { child.kill('SIGTERM'); } catch {}
            resolve(stdout);
          } else {
            try { child.kill('SIGTERM'); } catch {}
            reject(new Error('BUILDER_INACTIVITY_TIMEOUT'));
          }
        }
      }, 10000); // check every 10s
    });

    // ── Phase 3: DIFFING — Detect file changes via git diff ──
    broadcastBuilderPhase(task.id, subtaskId, 'diffing', 'Checking for file changes...');
    intake.updateSubtask(subtaskId, { builder_phase: 'diffing' });

    try {
      const gitAfter = execSync('git diff --name-only', { cwd: builderCwd, timeout: 5000 }).toString().trim();
      const beforeSet = new Set(gitBefore.split('\n').filter(Boolean));
      filesChanged = gitAfter.split('\n').filter(Boolean).filter(f => !beforeSet.has(f));
      const untracked = execSync('git ls-files --others --exclude-standard', { cwd: builderCwd, timeout: 5000 }).toString().trim();
      if (untracked) filesChanged.push(...untracked.split('\n').filter(Boolean));
    } catch {}

    // Also check RPGPO_ROOT if cwd was different
    if (builderCwd !== RPGPO_ROOT) {
      try {
        const rpgpoAfter = execSync('git diff --name-only', { cwd: RPGPO_ROOT, timeout: 5000 }).toString().trim();
        const beforeSet = new Set(gitBefore.split('\n').filter(Boolean));
        const rpgpoChanged = rpgpoAfter.split('\n').filter(Boolean).filter(f => !beforeSet.has(f) && !filesChanged.includes(f));
        filesChanged.push(...rpgpoChanged);
      } catch {}
    }

    // ── Phase 4: CLASSIFYING — Determine honest outcome ──
    builderDiag.filesChanged = filesChanged.length;
    broadcastBuilderPhase(task.id, subtaskId, 'classifying',
      filesChanged.length > 0 ? `${filesChanged.length} file(s) changed` : 'No file changes detected');

    builderOutcome = filesChanged.length > 0 ? 'code_applied' : 'no_changes';

    // If hard/inactivity timeout but we still got output — note it
    if (builderDiag.killedReason) {
      console.log(`[worker][builder] Completed via ${builderDiag.killedReason} with ${filesChanged.length} file changes and ${builderDiag.totalLines} lines output`);
    }

  } catch (claudeErr) {
    const errMsg = claudeErr.message || '';
    const isTimeout = errMsg.includes('ETIMEDOUT') || errMsg.includes('BUILDER_TIMEOUT') || errMsg.includes('BUILDER_INACTIVITY_TIMEOUT');
    const isInactivity = errMsg.includes('BUILDER_INACTIVITY_TIMEOUT');
    builderDiag.durationMs = builderDiag.durationMs || (Date.now() - new Date(builderDiag.startedAt).getTime());
    const durationSec = Math.round(builderDiag.durationMs / 1000);
    console.log(`[worker][builder] FAILED: ${errMsg.slice(0, 120)} (duration=${durationSec}s, output=${builderDiag.totalOutputBytes}B, reason=${builderDiag.killedReason || 'error'})`);

    builderOutcome = isTimeout ? 'builder_timeout' : 'builder_fallback_prompt_created';
    const timeoutDetail = isInactivity
      ? `Claude CLI had no output for ${Math.round(BUILDER_INACTIVITY_TIMEOUT_MS/1000)}s (hung)`
      : isTimeout
        ? `Claude CLI exceeded ${Math.round(getBuilderTimeoutMs()/60000)}-minute hard timeout`
        : 'Claude CLI unavailable';

    broadcastBuilderPhase(task.id, subtaskId, 'fallback', timeoutDetail);

    // Write prompt file for manual execution
    const promptFile = writeFile(
      `03-Operations/Reports/Subtask-Claude-${today}-${subtaskId}.md`,
      `# RPGPO Builder Prompt — Manual Execution Required\n## ${st.title}\n## Stage: ${st.stage}\n## Reason: ${timeoutDetail}\n## Duration: ${durationSec}s\n## Output received: ${builderDiag.totalOutputBytes} bytes, ${builderDiag.totalLines} lines\n## Working Directory: ${builderCwd}\n## Target Files: ${realFiles.join(', ') || 'none'}\n\n${userPrompt}\n`
    );

    intake.updateSubtask(subtaskId, {
      status: 'builder_fallback',
      builder_outcome: builderOutcome,
      builder_phase: 'fallback',
      outcome_type: builderOutcome,
      code_modified: false,
      output: `${timeoutDetail}.\nDuration: ${durationSec}s | Output: ${builderDiag.totalOutputBytes} bytes\nPrompt saved to ${promptFile}.\nManual execution required — launch Claude Builder and run this prompt.`,
      prompt_file: promptFile,
      files_changed: [],
      target_files: { real: realFiles, missing: missingFiles },
      what_done: `Builder ${isInactivity ? 'hung (no output)' : isTimeout ? 'timed out' : 'unavailable'} after ${durationSec}s — prompt saved for manual execution`,
      builder_diagnostics: builderDiag,
    });
    intake.updateTask(st.parent_task_id, { status: 'waiting_approval' });

    return {
      output: `Builder ${isTimeout ? 'timeout' : 'fallback'}: ${promptFile} (${durationSec}s, ${builderDiag.totalOutputBytes}B output)`,
      builderOutcome,
      filesWritten: [promptFile],
      diagnostics: builderDiag,
    };
  }

  // ── Phase 5: REPORTING — Save report and generate diff summary ──
  builderDiag.durationMs = builderDiag.durationMs || (Date.now() - new Date(builderDiag.startedAt).getTime());
  const durationSec = Math.round(builderDiag.durationMs / 1000);
  broadcastBuilderPhase(task.id, subtaskId, 'reporting', `Generating report (${durationSec}s, ${filesChanged.length} files)...`);

  let diffSummary = '';
  let diffDetail = '';
  if (filesChanged.length > 0) {
    try { diffSummary = execSync('git diff --stat', { cwd: builderCwd, timeout: 5000 }).toString().trim(); } catch {}
    try { diffDetail = execSync('git diff', { cwd: builderCwd, timeout: 10000 }).toString().trim(); } catch {}
  }

  const reportFile = writeFile(
    `03-Operations/Reports/Builder-Claude-${today}-${subtaskId}.md`,
    `# Claude Builder Output\n## ${st.title}\n## Stage: ${st.stage}\n## Outcome: ${builderOutcome}\n## Date: ${today}\n## Duration: ${durationSec}s\n## Working Directory: ${builderCwd}\n## Target Files: ${realFiles.join(', ') || 'none'}\n## Output: ${builderDiag.totalLines} lines, ${builderDiag.totalOutputBytes} bytes\n${builderDiag.killedReason ? `## Killed: ${builderDiag.killedReason}\n` : ''}\n### Builder Output\n${(claudeResult || '').slice(0, 10000)}\n\n### Files Changed\n${filesChanged.map(f => '- ' + f).join('\n') || 'None detected'}\n\n### Diff Summary\n\`\`\`\n${diffSummary || 'No changes'}\n\`\`\`\n`
  );

  // ── Phase 6: STATE TRANSITION — Based on honest outcome ──

  if (builderOutcome === 'code_applied') {
    broadcastBuilderPhase(task.id, subtaskId, 'review',
      `${filesChanged.length} file(s) changed. Waiting for your review.`);

    // Classify files: RPGPO infra vs project (TopRanker, etc.)
    const fileScope = classifyFiles(filesChanged);
    const whatDone = `Code applied: ${filesChanged.length} file(s) changed. ${fileScope.summary}`;

    intake.updateSubtask(subtaskId, {
      status: 'waiting_approval',
      builder_outcome: 'code_applied',
      builder_phase: 'review',
      outcome_type: 'code_applied',
      code_modified: true,
      output: (claudeResult || '').slice(0, 5000),
      files_changed: filesChanged,
      file_scope: fileScope,
      diff_summary: diffSummary,
      diff_detail: diffDetail.slice(0, 20000),
      target_files: { real: realFiles, missing: missingFiles },
      report_file: reportFile,
      what_done: whatDone,
      builder_diagnostics: builderDiag,
    });
    intake.updateTask(st.parent_task_id, { status: 'waiting_approval' });

    console.log(`[worker][builder] SUCCESS: code_applied, ${filesChanged.length} files, ${durationSec}s`);
    return {
      output: `Builder: code_applied. ${filesChanged.length} file(s) changed in ${durationSec}s. Awaiting approval.`,
      builderOutcome: 'code_applied',
      filesWritten: [reportFile, ...filesChanged],
      diagnostics: builderDiag,
    };
  }

  if (builderOutcome === 'no_changes') {
    if (isBuildTask) {
      // Build task with no changes is suspicious — surface it
      broadcastBuilderPhase(task.id, subtaskId, 'review',
        'Builder ran but made no file changes — needs review.');

      intake.updateSubtask(subtaskId, {
        status: 'waiting_approval',
        builder_outcome: 'no_changes',
        builder_phase: 'review',
        outcome_type: 'no_changes',
        code_modified: false,
        output: `Claude ran but made no file changes.\n${(claudeResult || '').slice(0, 3000)}`,
        files_changed: [],
        target_files: { real: realFiles, missing: missingFiles },
        report_file: reportFile,
        what_done: 'Builder ran but made no code changes — needs review',
      });
      intake.updateTask(st.parent_task_id, { status: 'waiting_approval' });

      return {
        output: `Builder: no_changes on a build task — needs review.`,
        builderOutcome: 'no_changes',
        filesWritten: [reportFile],
      };
    }

    // Non-build (research/audit) Claude task with no changes is fine
    broadcastBuilderPhase(task.id, subtaskId, 'complete', 'Research/audit task completed.');

    const firstLine = (claudeResult || '').split('\n').find(l => l.trim().length > 10) || (claudeResult || '').slice(0, 120);
    intake.updateSubtask(subtaskId, {
      status: 'done',
      builder_outcome: 'no_changes',
      builder_phase: 'complete',
      outcome_type: 'text_output',
      code_modified: false,
      output: (claudeResult || '').slice(0, 5000),
      files_changed: [],
      target_files: { real: realFiles, missing: missingFiles },
      report_file: reportFile,
      what_done: `Research/audit complete (no code changes). ${firstLine.trim().slice(0, 100)}`,
    });
    const wfResult = workflow.onSubtaskComplete(subtaskId);
    if (wfResult.next_subtask_ids) {
      for (const nextId of wfResult.next_subtask_ids) {
        const nextSt = intake.getSubtask(nextId);
        if (nextSt) queue.addTask('execute-subtask', `Subtask: ${nextSt.title}`, { subtaskId: nextId });
      }
    }
    return {
      output: `Builder: ${(claudeResult || '').slice(0, 400)}\n${wfResult.message}`,
      builderOutcome: 'no_changes',
      filesWritten: [reportFile],
    };
  }

  return { output: 'Builder completed with unknown outcome', builderOutcome };
}

// --- Task handlers ---

const handlers = {
  'refresh-state': async (task) => {
    const script = path.join(__dirname, 'scripts', 'refresh-state.js');
    const out = execSync(`node "${script}"`, { timeout: 30000, cwd: RPGPO_ROOT }).toString();
    return { output: out };
  },

  'morning-loop': async (task) => {
    const script = path.join(__dirname, 'scripts', 'morning-loop.js');
    const out = execSync(`node "${script}"`, { timeout: 30000, cwd: RPGPO_ROOT }).toString();
    return { output: out };
  },

  'evening-loop': async (task) => {
    const script = path.join(__dirname, 'scripts', 'evening-loop.js');
    const out = execSync(`node "${script}"`, { timeout: 30000, cwd: RPGPO_ROOT }).toString();
    return { output: out };
  },

  'board-run': async (task) => {
    return new Promise((resolve, reject) => {
      const script = path.join(__dirname, 'scripts', 'board-runner.js');
      const child = spawn('node', [script], {
        cwd: RPGPO_ROOT,
        env: { ...process.env },
        timeout: 180000,
      });

      let stdout = '';
      let stderr = '';
      child.stdout.on('data', d => {
        const chunk = d.toString();
        stdout += chunk;
        queue.updateTask(task.id, { output: stdout.slice(0, 8000) });
      });
      child.stderr.on('data', d => stderr += d.toString());

      child.on('close', (code) => {
        const marker = '__BOARD_RESULT__';
        const idx = stdout.indexOf(marker);
        let boardResult = null;
        if (idx !== -1) {
          try { boardResult = JSON.parse(stdout.slice(idx + marker.length).trim()); } catch {}
        }
        const consoleOut = idx !== -1 ? stdout.slice(0, idx) : stdout;
        if (code === 0) {
          resolve({
            output: consoleOut,
            boardResult,
            filesWritten: boardResult ? boardResult.filesWritten : [],
            costs: boardResult ? boardResult.costs : [],
          });
        } else {
          reject(new Error(stderr || `Exit code ${code}`));
        }
      });

      child.on('error', reject);
    });
  },

  // Deliberate on an intake task
  'deliberate': async (task) => {
    const taskId = task.meta?.taskId;
    if (!taskId) throw new Error('No taskId in meta');

    const intakeTask = intake.getTask(taskId);
    if (!intakeTask) throw new Error('Intake task not found: ' + taskId);

    intake.updateTask(taskId, { status: 'deliberating' });
    queue.updateTask(task.id, { output: 'Deliberating...' });

    const { deliberation, costEntry } = await deliberate(intakeTask);

    // Store deliberation result on the task
    intake.updateTask(taskId, {
      status: 'planned',
      board_deliberation: deliberation,
      risk_level: deliberation.risk_level || 'green',
    });

    // Part 66: Wire runtime deliverable pipeline — init scaffold from engine contract
    try {
      const cos = require('./lib/chief-of-staff');
      const engineId = intakeTask.domain || 'general';
      cos.onRuntimeTaskStart(taskId, engineId);
      // Augment plan with contract context
      const ctx = cos.getBoardContractContext(engineId);
      if (ctx && deliberation) deliberation._contract_context = ctx;
    } catch (e) { console.log('[worker] Deliverable scaffold init:', e.message?.slice(0, 80)); }

    // Materialize subtasks from the deliberation
    const created = workflow.materializeSubtasks(taskId, deliberation);

    const summary = `Deliberation complete.\nObjective: ${deliberation.interpreted_objective}\nStrategy: ${deliberation.recommended_strategy}\nRisk: ${deliberation.risk_level}\nSubtasks: ${created.length}\nTokens: ${deliberation.tokens_used}`;

    // Auto-approve plan if requested (from /api/intake/run quick-run)
    if (task.meta?.autoApprove) {
      try {
        const queuedIds = workflow.queueInitialSubtasks(taskId);
        console.log(`[worker] Auto-approved plan for ${taskId}: ${queuedIds.length} subtasks queued`);
        for (const id of queuedIds) {
          const nextSt = intake.getSubtask(id);
          if (nextSt) queue.addTask('execute-subtask', `Subtask: ${nextSt.title}`, { subtaskId: id });
        }
      } catch (e) { console.log('[worker] Auto-approve error:', e.message?.slice(0, 80)); }
    }

    return {
      output: summary,
      deliberation,
      subtasksCreated: created.length,
    };
  },

  // Execute a single subtask via AI
  'execute-subtask': async (task) => {
    const subtaskId = task.meta?.subtaskId;
    if (!subtaskId) throw new Error('No subtaskId in meta');

    const st = intake.getSubtask(subtaskId);
    if (!st) throw new Error('Subtask not found: ' + subtaskId);

    intake.updateSubtask(subtaskId, { status: 'running' });
    queue.updateTask(task.id, { output: `Running subtask: ${st.title}` });

    const model = st.assigned_model || 'openai';

    // Value fix: Inject rich operator context + domain context into every subtask
    let operatorContext = '';
    try {
      const opProfile = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'state', 'context', 'operator-profile.json'), 'utf-8'));
      operatorContext = `\nOperator: ${opProfile.name} (${opProfile.professional_context?.role || 'Operator'})`;
      if (opProfile.recurring_priorities?.length) operatorContext += `\nPriorities: ${opProfile.recurring_priorities.slice(0, 3).join('; ')}`;
      if (opProfile.output_preferences?.style) operatorContext += `\nOutput style: ${opProfile.output_preferences.style}`;
      if (opProfile.output_preferences?.avoid) operatorContext += `\nAvoid: ${opProfile.output_preferences.avoid}`;
    } catch { /* no profile */ }

    let domainContext = '';
    try {
      const domain = st.domain || task.meta?.domain || 'general';
      const ctxFile = path.join(__dirname, '..', 'state', 'context', 'missions', domain, 'context.json');
      if (fs.existsSync(ctxFile)) {
        const ctx = JSON.parse(fs.readFileSync(ctxFile, 'utf-8'));
        if (ctx.context_summary) domainContext += `\nDomain context: ${ctx.context_summary.slice(0, 500)}`;
        if (ctx.recent_decisions?.length) domainContext += `\nRecent decisions: ${ctx.recent_decisions.slice(0, 3).map(d => d.title || d.decision || d).join('; ')}`;
        if (ctx.constraints?.length) domainContext += `\nConstraints: ${ctx.constraints.slice(0, 3).join('; ')}`;
      }
    } catch { /* no domain context */ }

    // Model-specific system prompt enhancements
    let modelRules = '';
    if (model === 'perplexity') {
      modelRules = `
SEARCH INSTRUCTIONS:
- You have web search capabilities. USE THEM to find current, real information.
- Always include specific names, numbers, dates, URLs, and sources from your search results.
- Do NOT give generic advice. Search the web and report what you actually find.
- Include source citations for every major claim.
- If the search doesn't return relevant results, say so and suggest better search terms.`;
    } else if (model === 'openai') {
      modelRules = `
SYNTHESIS INSTRUCTIONS:
- Synthesize information into clear, actionable recommendations.
- Include specific examples, numbers, and concrete next steps.
- Organize with clear sections and bullet points.`;
    } else if (model === 'gemini') {
      modelRules = `
STRATEGY INSTRUCTIONS:
- Focus on strategic analysis with specific data points.
- Compare alternatives with clear pros/cons.
- Provide actionable recommendations with expected impact.`;
    }

    const systemPrompt = `You are operating inside RPGPO, a governed personal AI operating system. Stage: ${st.stage}. Role: ${st.assigned_role}.${operatorContext}${domainContext}

RULES:
- Be direct, specific, and actionable
- Include real data, citations, and sources when available
- Structure output clearly with sections and bullet points
- Never produce generic templates or placeholder text like "[Insert Title]"
- If you cannot find specific information, say so explicitly${modelRules}`;

    // Gather completed sibling subtask outputs as context
    let priorOutputs = '';
    try {
      const allSubs = intake.getSubtasksForTask(st.parent_task);
      const completedSiblings = allSubs.filter(s => s.status === 'done' && s.subtask_id !== subtaskId && s.output);
      if (completedSiblings.length > 0) {
        priorOutputs = '\n\n## Prior Subtask Results\n' + completedSiblings.map(s =>
          `### ${s.title}\n${(s.output || s.what_done || '').slice(0, 1500)}`
        ).join('\n\n');
      }
    } catch { /* non-fatal */ }

    // Gather file context
    let fileContext = '';
    for (const f of (st.files_to_read || [])) {
      const content = readFile(f);
      if (content) fileContext += `\n### ${f}\n${content.slice(0, 2000)}\n`;
    }

    const userPrompt = `${st.prompt}${priorOutputs}${fileContext ? '\n\n## Reference Files\n' + fileContext : ''}`;

    let result;
    try {
      if (model === 'openai') {
        result = await callOpenAI(systemPrompt, userPrompt);
      } else if (model === 'perplexity') {
        result = await callPerplexity(systemPrompt, userPrompt);
      } else if (model === 'gemini') {
        const costSettings = costs.getSettings();
        const geminiModel = costSettings.geminiModel || 'gemini-2.5-flash-lite';
        result = await callGemini(systemPrompt, userPrompt, { model: geminiModel });
      } else if (model === 'claude') {
        // Route claude subtasks to the dedicated builder runner
        return await runBuilder(task, subtaskId, st, userPrompt);
      } else {
        throw new Error('Unknown model: ' + model);
      }

      // Record cost
      const costEntry = costs.recordCost({
        provider: result.provider,
        model: result.model,
        inputTokens: result.usage.inputTokens,
        outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        cost: result.usage.cost,
        taskId: st.parent_task_id,
        taskType: 'subtask',
        role: st.assigned_role,
      });

      // Write output file if files_to_write specified
      const filesWritten = [];
      if (st.files_to_write && st.files_to_write.length > 0) {
        for (const f of st.files_to_write) {
          const written = writeFile(f, result.text);
          if (written) filesWritten.push(written);
        }
      }

      // Save report for every subtask
      const today = new Date().toISOString().slice(0, 10);
      const reportFile = writeFile(
        `03-Operations/Reports/Subtask-${model}-${today}-${subtaskId}.md`,
        `# Subtask Output — ${st.title}\n## Model: ${result.model}\n## Stage: ${st.stage}\n## Date: ${today}\n\n${result.text.slice(0, 10000)}\n`
      );
      if (reportFile) filesWritten.push(reportFile);

      // Determine outcome type and code modification flag
      const isBuildStage = ['implement', 'build', 'code'].includes(st.stage);
      const codeModified = filesWritten.some(f => !f.includes('Reports/'));
      const outcomeType = codeModified ? 'files_written' : (isBuildStage ? 'text_only_build' : 'text_output');

      // Build concise "what was done" summary
      const firstLine = result.text.split('\n').find(l => l.trim().length > 10) || result.text.slice(0, 120);
      const whatDone = codeModified
        ? `Wrote ${filesWritten.filter(f => !f.includes('Reports/')).length} file(s): ${filesWritten.filter(f => !f.includes('Reports/')).map(f => f.split('/').pop()).join(', ')}`
        : isBuildStage
          ? `Analysis complete (no code changes made)`
          : firstLine.trim().slice(0, 150);

      // Mark subtask done with full completion metadata
      intake.updateSubtask(subtaskId, {
        status: 'done',
        output: result.text.slice(0, 5000),
        cost: costEntry,
        outcome_type: outcomeType,
        code_modified: codeModified,
        files_changed: filesWritten.filter(f => !f.includes('Reports/')),
        report_file: reportFile,
        what_done: whatDone,
      });

      // Part 66: Wire runtime deliverable pipeline — merge subtask output
      try {
        const cos = require('./lib/chief-of-staff');
        const parentTask = intake.getTask(st.parent_task);
        const engineId = parentTask?.domain || 'general';
        cos.onRuntimeSubtaskComplete(st.parent_task, subtaskId, result.text?.slice(0, 3000) || '', engineId);
      } catch (e) { console.log('[worker] Deliverable merge:', e.message?.slice(0, 80)); }

      // Part 75: Record provider performance for persistent learning
      try {
        const ls = require('./lib/learning-store');
        const parentTask = intake.getTask(st.parent_task);
        ls.recordProviderSample(
          { engineId: parentTask?.domain || 'general', taskKind: st.stage || 'subtask', contractName: st.assigned_role || 'general' },
          {
            timestamp: Date.now(), providerId: model,
            latencyMs: result.usage?.totalTokens ? (result.usage.totalTokens * 0.5) : 500,
            inputTokens: result.usage?.inputTokens || 0, outputTokens: result.usage?.outputTokens || 0,
            totalCostUsd: costEntry?.cost || 0, success: true, qualityScore: 0.8,
          }
        );
      } catch { /* learning non-fatal */ }

      // Emit in-app notification on subtask completion
      try {
        const notif = require('./lib/in-app-notifications');
        notif.emitNotification({
          type: 'system.info',
          severity: 'low',
          title: `Subtask complete: ${st.title?.slice(0, 50) || subtaskId}`,
          message: whatDone.slice(0, 200),
          actions: [{ label: 'View Task', action: 'viewWorkflow', ref: { kind: 'task', id: st.parent_task || '' } }],
        });
      } catch { /* non-fatal */ }

      // Auto-continue workflow
      const wfResult = workflow.onSubtaskComplete(subtaskId);

      // Queue next subtasks via the task queue
      if (wfResult.next_subtask_ids) {
        for (const nextId of wfResult.next_subtask_ids) {
          const nextSt = intake.getSubtask(nextId);
          if (nextSt) {
            queue.addTask('execute-subtask', `Subtask: ${nextSt.title}`, { subtaskId: nextId });
          }
        }
      }

      return {
        output: `${st.title}: ${whatDone}\n\n${wfResult.message}`,
        filesWritten,
      };
    } catch (err) {
      intake.updateSubtask(subtaskId, {
        status: 'failed',
        error: err.message.slice(0, 500),
      });
      // Notify on failure
      try {
        const notif = require('./lib/in-app-notifications');
        notif.emitNotification({
          type: 'workflow.failed',
          severity: 'high',
          title: `Subtask failed: ${st.title?.slice(0, 50) || subtaskId}`,
          message: err.message.slice(0, 200),
        });
      } catch { /* non-fatal */ }
      // Track error
      try {
        const et = require('./lib/error-tracker');
        const errMsg = err.message || '';
        const category = errMsg.includes('timeout') ? 'timeout' : errMsg.includes('API key') ? 'provider' : errMsg.includes('parse') ? 'parse' : 'system';
        et.trackError({ category, severity: 'high', source: 'worker', message: errMsg, taskId: st.parent_task, providerId: model, retryable: category === 'timeout' || category === 'provider' });
      } catch { /* non-fatal */ }
      workflow.onSubtaskComplete(subtaskId);
      throw err;
    }
  },

  // Dedicated builder execution — can be queued directly for re-runs/revisions
  'execute-builder': async (task) => {
    console.log(`[worker][execute-builder] Picked up task ${task.id} — starting builder execution`);
    const subtaskId = task.meta?.subtaskId;
    const revisionNotes = task.meta?.revisionNotes || '';
    if (!subtaskId) {
      console.error(`[worker][execute-builder] FAILED: no subtaskId in task ${task.id} meta`);
      throw new Error('No subtaskId in meta');
    }
    console.log(`[worker][execute-builder] subtaskId=${subtaskId}, revisionNotes=${revisionNotes ? 'yes' : 'none'}`);

    const st = intake.getSubtask(subtaskId);
    if (!st) {
      console.error(`[worker][execute-builder] FAILED: subtask ${subtaskId} not found`);
      throw new Error('Subtask not found: ' + subtaskId);
    }
    console.log(`[worker][execute-builder] Subtask found: "${st.title}" (model=${st.assigned_model}, stage=${st.stage})`);

    // Gather file context
    let fileContext = '';
    for (const f of (st.files_to_read || [])) {
      const content = readFile(f);
      if (content) fileContext += `\n### ${f}\n${content.slice(0, 2000)}\n`;
    }

    let userPrompt = `${st.prompt}${fileContext ? '\n\n## Reference Files\n' + fileContext : ''}`;
    if (revisionNotes) {
      userPrompt += `\n\n## Revision Instructions\n${revisionNotes}`;
    }

    return await runBuilder(task, subtaskId, st, userPrompt);
  },

  // Standalone builder launch — spawns Claude CLI, tracks process, reports honestly
  'launch_builder': async (task) => {
    const startTime = Date.now();
    queue.updateTask(task.id, { output: '[launch_builder] Verifying Claude CLI availability...' });

    // Phase 1: Verify Claude CLI exists
    let claudePath = null;
    try {
      claudePath = execSync('which claude', { timeout: 5000 }).toString().trim();
    } catch {
      queue.updateTask(task.id, {
        output: '[launch_builder] launch_failed — Claude CLI not found in PATH',
        error: 'Claude CLI not found. Install with: npm install -g @anthropic-ai/claude-code',
      });
      return {
        output: 'launch_failed: Claude CLI not found in PATH',
        launch_verified: false,
        reason: 'claude_cli_not_found',
      };
    }

    queue.updateTask(task.id, { output: `[launch_builder] Claude CLI found at ${claudePath}. Spawning process...` });

    // Phase 2: Spawn Claude with a project status prompt
    const statusPrompt = 'Review the current RPGPO project state. Check git status, recent changes, and any pending work. Provide a brief status summary of what needs attention.';

    try {
      const result = await new Promise((resolve, reject) => {
        // Use same clean spawn path as runBuilder
        const standaloneEnv = { ...process.env };
        Object.keys(standaloneEnv).filter(k => k.startsWith('CLAUDE')).forEach(k => delete standaloneEnv[k]);
        const child = spawn('claude', ['--dangerously-skip-permissions', '-p', statusPrompt], {
          cwd: RPGPO_ROOT,
          env: standaloneEnv,
          stdio: ['ignore', 'pipe', 'pipe'],
        });

        let stdout = '';
        let stderr = '';
        let pid = child.pid;

        queue.updateTask(task.id, {
          output: `[launch_builder] Process spawned (PID: ${pid}). Claude is working...`,
        });

        const progressInterval = setInterval(() => {
          const elapsed = Math.round((Date.now() - startTime) / 1000);
          const lines = stdout.split('\n').length;
          queue.updateTask(task.id, {
            output: `[launch_builder] Running (PID: ${pid}) — ${lines} lines, ${elapsed}s elapsed`,
          });
        }, BUILDER_PROGRESS_INTERVAL);

        child.stdout.on('data', d => { stdout += d.toString(); });
        child.stderr.on('data', d => { stderr += d.toString(); });

        child.on('close', (code) => {
          clearInterval(progressInterval);
          if (code === 0 || stdout.length > 0) {
            resolve({ stdout, pid, exitCode: code });
          } else {
            reject(new Error(stderr || `Claude CLI exit code ${code}`));
          }
        });

        child.on('error', (err) => {
          clearInterval(progressInterval);
          reject(err);
        });

        // Timeout — use configurable timeout
        setTimeout(() => {
          clearInterval(progressInterval);
          try { child.kill('SIGTERM'); } catch {}
          reject(new Error('BUILDER_TIMEOUT'));
        }, getBuilderTimeoutMs());
      });

      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const today = new Date().toISOString().slice(0, 10);
      const reportFile = writeFile(
        `03-Operations/Reports/Builder-Standalone-${today}-${task.id}.md`,
        `# Standalone Claude Builder Session\n## Date: ${today}\n## PID: ${result.pid}\n## Duration: ${elapsed}s\n## Exit Code: ${result.exitCode}\n\n${result.stdout.slice(0, 10000)}\n`
      );

      return {
        output: `Builder session completed (PID: ${result.pid}, ${elapsed}s).\n\n${result.stdout.slice(0, 3000)}`,
        launch_verified: true,
        pid: result.pid,
        duration_seconds: elapsed,
        filesWritten: reportFile ? [reportFile] : [],
      };
    } catch (err) {
      const errMsg = err.message || '';
      const isTimeout = errMsg.includes('BUILDER_TIMEOUT');
      const reason = isTimeout ? 'timeout' : 'spawn_failed';

      return {
        output: `launch_failed: ${isTimeout ? 'Claude CLI timed out after 3 minutes' : errMsg}`,
        launch_verified: false,
        reason,
        error: errMsg.slice(0, 500),
      };
    }
  },

  // AI Channel tasks — direct model interaction from the Channels tab
  'ai-channel': async (task) => {
    const { model, prompt, role } = task.meta || {};
    if (!prompt) throw new Error('No prompt provided');
    if (!model) throw new Error('No model specified');

    const today = new Date().toISOString().slice(0, 10);
    const ts = new Date().toISOString();
    const shortId = task.id.slice(-6);

    // Build system prompt based on role — with operator context
    let opCtx = '';
    try {
      const opProfile = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'state', 'context', 'operator-profile.json'), 'utf-8'));
      opCtx = `\nOperator: ${opProfile.name} (${opProfile.professional_context?.role || 'Operator'}). Priorities: ${(opProfile.recurring_priorities || []).slice(0, 3).join('; ')}.`;
      if (opProfile.output_preferences?.style) opCtx += ` Output style: ${opProfile.output_preferences.style}`;
    } catch { /* */ }

    const rolePrompts = {
      general: `You are operating inside RPGPO (Rahul Pitta Governed Private Office).${opCtx} Be direct, concise, evidence-based, and actionable. Never produce generic templates or placeholder text.`,
      research: `You are the RPGPO Research Director.${opCtx} Provide evidence-based research with specific facts, numbers, citations, and sources. Include actionable recommendations with concrete next steps.`,
      builder: `You are the RPGPO Builder / CTO.${opCtx} Focus on technical analysis, implementation priorities, and practical engineering advice. Be specific and direct.`,
      strategy: `You are the RPGPO Growth Strategist.${opCtx} Focus on business strategy, market positioning, growth channels, and actionable opportunities with specific examples and data.`,
      creative: `You are the RPGPO Creative Director.${opCtx} Support storytelling, ideation, and creative development with structured, imaginative, and practical output.`,
      chief: `You are the RPGPO Chief of Staff.${opCtx} Synthesize information, identify priorities, surface blockers, and produce executive-quality briefings with specific action items.`,
    };
    const systemPrompt = rolePrompts[role] || rolePrompts.general;

    let output = '';
    let filesWritten = [];
    let costEntries = [];

    if (model === 'claude') {
      // Claude runs locally — generate a prompt file for manual execution
      const promptFile = writeFile(
        `03-Operations/Reports/Channel-Claude-${today}-${shortId}.md`,
        `# RPGPO Channel Task — Claude\n## Generated: ${ts}\n## Role: ${role || 'general'}\n\n## Prompt\n${prompt}\n\n## Instructions\nRun this in a Claude session. Output your response to:\n03-Operations/Reports/Channel-Claude-Response-${today}-${shortId}.md\n`
      );
      filesWritten.push(promptFile);
      output = `Claude prompt saved to ${promptFile}\nUse "Launch Claude" to execute this prompt in a terminal session.`;
    } else if (model === 'openai') {
      queue.updateTask(task.id, { output: 'Calling OpenAI...' });
      const result = await callOpenAI(systemPrompt, prompt);
      const outFile = writeFile(
        `03-Operations/Reports/Channel-OpenAI-${today}-${shortId}.md`,
        `# RPGPO Channel Response — OpenAI\n## Generated: ${ts}\n## Role: ${role || 'general'}\n## Model: ${result.model}\n\n${result.text}\n`
      );
      filesWritten.push(outFile);
      output = result.text;

      costEntries.push(costs.recordCost({
        provider: 'openai', model: result.model,
        inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        taskId: task.id, taskType: 'ai-channel', role: role || 'general',
      }));
    } else if (model === 'perplexity') {
      queue.updateTask(task.id, { output: 'Calling Perplexity...' });
      const result = await callPerplexity(systemPrompt, prompt);
      const outFile = writeFile(
        `03-Operations/Reports/Channel-Perplexity-${today}-${shortId}.md`,
        `# RPGPO Channel Response — Perplexity\n## Generated: ${ts}\n## Role: ${role || 'general'}\n## Model: ${result.model}\n\n${result.text}\n`
      );
      filesWritten.push(outFile);
      output = result.text;

      costEntries.push(costs.recordCost({
        provider: 'perplexity', model: result.model,
        inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        cost: result.usage.cost,
        taskId: task.id, taskType: 'ai-channel', role: role || 'general',
      }));
    } else if (model === 'gemini') {
      queue.updateTask(task.id, { output: 'Calling Gemini...' });
      const costSettings = costs.getSettings();
      const geminiModel = costSettings.geminiModel || 'gemini-2.5-flash-lite';
      const result = await callGemini(systemPrompt, prompt, { model: geminiModel });
      const outFile = writeFile(
        `03-Operations/Reports/Channel-Gemini-${today}-${shortId}.md`,
        `# RPGPO Channel Response — Gemini\n## Generated: ${ts}\n## Role: ${role || 'general'}\n## Model: ${result.model}\n\n${result.text}\n`
      );
      filesWritten.push(outFile);
      output = result.text;

      costEntries.push(costs.recordCost({
        provider: 'gemini', model: result.model,
        inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens,
        totalTokens: result.usage.totalTokens,
        taskId: task.id, taskType: 'ai-channel', role: role || 'general',
      }));
    } else {
      throw new Error(`Unknown model: ${model}`);
    }

    return { output, filesWritten, costs: costEntries };
  },
};

// --- Main poll loop ---

async function processNext() {
  if (running) return;

  const queued = queue.getQueued();
  if (queued.length === 0) return;

  const task = queued[queued.length - 1]; // oldest first (FIFO)
  const handler = handlers[task.type];

  if (!handler) {
    queue.updateTask(task.id, { status: 'failed', error: `Unknown task type: ${task.type}` });
    logAction(`Worker: ${task.type}`, 'Failed — unknown type', null);
    return;
  }

  running = true;
  console.log(`[worker] ── Task pickup ── ${task.id} → type=${task.type} label="${task.label}" meta=${JSON.stringify(task.meta || {})}`);
  queue.updateTask(task.id, { status: 'running' });

  try {
    const result = await handler(task);
    queue.updateTask(task.id, {
      status: 'done',
      output: (result.output || '').slice(0, 10000),
      filesWritten: result.filesWritten || [],
    });
    const logFiles = (result.filesWritten || []).join(', ');
    const logOutcome = result.builderOutcome ? ` [${result.builderOutcome}]` : '';
    logAction(`Worker: ${task.type}`, `Done${logOutcome}`, logFiles || 'no files changed');
    console.log(`[worker] Task ${task.id} → done.`);
  } catch (e) {
    queue.updateTask(task.id, {
      status: 'failed',
      error: e.message.slice(0, 2000),
    });
    logAction(`Worker: ${task.type}`, 'Failed: ' + e.message.slice(0, 200), null);
    console.error(`[worker] Task ${task.id} failed:`, e.message.slice(0, 200));
  } finally {
    running = false;
  }
}

setInterval(processNext, POLL_INTERVAL);
processNext();

process.on('SIGTERM', () => { console.log('[worker] Shutting down...'); process.exit(0); });
process.on('SIGINT', () => { console.log('[worker] Interrupted.'); process.exit(0); });
