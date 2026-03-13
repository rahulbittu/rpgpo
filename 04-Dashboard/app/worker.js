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

const BUILDER_TIMEOUT_MS = 180000; // 3 minutes
const BUILDER_PROGRESS_INTERVAL = 2000;

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
  broadcastBuilderPhase(task.id, subtaskId, 'launching', 'Starting Claude CLI...');
  intake.updateSubtask(subtaskId, { builder_phase: 'launching' });

  let claudeResult = null;
  let filesChanged = [];
  let builderOutcome = null;

  // Snapshot git state before
  let gitBefore = '';
  try { gitBefore = execSync('git diff --name-only', { cwd: RPGPO_ROOT, timeout: 5000 }).toString().trim(); } catch {}

  try {
    const startTime = Date.now();

    claudeResult = await new Promise((resolve, reject) => {
      const args = ['-p', userPrompt.slice(0, 12000)];
      const child = spawn('claude', args, {
        cwd: RPGPO_ROOT,
        env: { ...process.env },
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      let stdout = '';
      let stderr = '';
      let lastLineCount = 0;

      const progressInterval = setInterval(() => {
        const lines = stdout.split('\n').length;
        const elapsed = Math.round((Date.now() - startTime) / 1000);
        const newLines = lines - lastLineCount;
        lastLineCount = lines;
        broadcastBuilderPhase(task.id, subtaskId, 'running',
          `Claude working... ${lines} lines, ${elapsed}s elapsed${newLines > 0 ? ` (+${newLines} new)` : ''}`);
        intake.updateSubtask(subtaskId, { builder_phase: 'running' });
      }, BUILDER_PROGRESS_INTERVAL);

      child.stdout.on('data', d => { stdout += d.toString(); });
      child.stderr.on('data', d => { stderr += d.toString(); });

      child.on('close', (code) => {
        clearInterval(progressInterval);
        if (code === 0 || stdout.length > 0) {
          resolve(stdout);
        } else {
          reject(new Error(stderr || `Claude CLI exit code ${code}`));
        }
      });

      child.on('error', (err) => {
        clearInterval(progressInterval);
        reject(err);
      });

      // Hard timeout
      setTimeout(() => {
        clearInterval(progressInterval);
        try { child.kill('SIGTERM'); } catch {}
        reject(new Error('BUILDER_TIMEOUT'));
      }, BUILDER_TIMEOUT_MS);
    });

    // ── Phase 3: DIFFING — Detect file changes via git diff ──
    broadcastBuilderPhase(task.id, subtaskId, 'diffing', 'Checking for file changes...');
    intake.updateSubtask(subtaskId, { builder_phase: 'diffing' });

    try {
      const gitAfter = execSync('git diff --name-only', { cwd: RPGPO_ROOT, timeout: 5000 }).toString().trim();
      const beforeSet = new Set(gitBefore.split('\n').filter(Boolean));
      filesChanged = gitAfter.split('\n').filter(Boolean).filter(f => !beforeSet.has(f));
      const untracked = execSync('git ls-files --others --exclude-standard', { cwd: RPGPO_ROOT, timeout: 5000 }).toString().trim();
      if (untracked) filesChanged.push(...untracked.split('\n').filter(Boolean));
    } catch {}

    // ── Phase 4: CLASSIFYING — Determine honest outcome ──
    broadcastBuilderPhase(task.id, subtaskId, 'classifying',
      filesChanged.length > 0 ? `${filesChanged.length} file(s) changed` : 'No file changes detected');

    builderOutcome = filesChanged.length > 0 ? 'code_applied' : 'no_changes';

  } catch (claudeErr) {
    const errMsg = claudeErr.message || '';
    const isTimeout = errMsg.includes('ETIMEDOUT') || errMsg.includes('BUILDER_TIMEOUT');
    console.log(`[worker] Claude Builder failed: ${errMsg.slice(0, 120)}`);

    builderOutcome = isTimeout ? 'builder_timeout' : 'builder_fallback_prompt_created';
    broadcastBuilderPhase(task.id, subtaskId, 'fallback',
      isTimeout ? 'Claude CLI timed out' : 'Claude CLI unavailable');

    // Write prompt file for manual execution
    const promptFile = writeFile(
      `03-Operations/Reports/Subtask-Claude-${today}-${subtaskId}.md`,
      `# RPGPO Builder Prompt — Manual Execution Required\n## ${st.title}\n## Stage: ${st.stage}\n## Reason: ${isTimeout ? 'Claude CLI timed out' : 'Claude CLI unavailable'}\n## Target Files: ${realFiles.join(', ') || 'none'}\n\n${userPrompt}\n`
    );

    intake.updateSubtask(subtaskId, {
      status: 'builder_fallback',
      builder_outcome: builderOutcome,
      builder_phase: 'fallback',
      outcome_type: builderOutcome,
      code_modified: false,
      output: `Claude CLI ${isTimeout ? 'timed out' : 'unavailable'}. Prompt saved to ${promptFile}.\nManual execution required — launch Claude Builder and run this prompt.`,
      prompt_file: promptFile,
      files_changed: [],
      target_files: { real: realFiles, missing: missingFiles },
      what_done: `Builder ${isTimeout ? 'timed out' : 'unavailable'} — prompt saved for manual execution`,
    });
    intake.updateTask(st.parent_task_id, { status: 'waiting_approval' });

    return {
      output: `Builder ${isTimeout ? 'timeout' : 'fallback'}: ${promptFile}`,
      builderOutcome,
      filesWritten: [promptFile],
    };
  }

  // ── Phase 5: REPORTING — Save report and generate diff summary ──
  broadcastBuilderPhase(task.id, subtaskId, 'reporting', 'Generating report...');

  let diffSummary = '';
  let diffDetail = '';
  if (filesChanged.length > 0) {
    try { diffSummary = execSync('git diff --stat', { cwd: RPGPO_ROOT, timeout: 5000 }).toString().trim(); } catch {}
    try { diffDetail = execSync('git diff', { cwd: RPGPO_ROOT, timeout: 10000 }).toString().trim(); } catch {}
  }

  const reportFile = writeFile(
    `03-Operations/Reports/Builder-Claude-${today}-${subtaskId}.md`,
    `# Claude Builder Output\n## ${st.title}\n## Stage: ${st.stage}\n## Outcome: ${builderOutcome}\n## Date: ${today}\n## Target Files: ${realFiles.join(', ') || 'none'}\n\n### Builder Output\n${(claudeResult || '').slice(0, 10000)}\n\n### Files Changed\n${filesChanged.map(f => '- ' + f).join('\n') || 'None detected'}\n\n### Diff Summary\n\`\`\`\n${diffSummary || 'No changes'}\n\`\`\`\n`
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
    });
    intake.updateTask(st.parent_task_id, { status: 'waiting_approval' });

    return {
      output: `Builder: code_applied. ${filesChanged.length} file(s) changed. Awaiting approval.`,
      builderOutcome: 'code_applied',
      filesWritten: [reportFile, ...filesChanged],
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

    // Materialize subtasks from the deliberation
    const created = workflow.materializeSubtasks(taskId, deliberation);

    const summary = `Deliberation complete.\nObjective: ${deliberation.interpreted_objective}\nStrategy: ${deliberation.recommended_strategy}\nRisk: ${deliberation.risk_level}\nSubtasks: ${created.length}\nTokens: ${deliberation.tokens_used}`;

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
    const systemPrompt = `You are operating inside RPGPO. Stage: ${st.stage}. Role: ${st.assigned_role}. Be direct, specific, and actionable.`;

    // Gather file context
    let fileContext = '';
    for (const f of (st.files_to_read || [])) {
      const content = readFile(f);
      if (content) fileContext += `\n### ${f}\n${content.slice(0, 2000)}\n`;
    }

    const userPrompt = `${st.prompt}${fileContext ? '\n\n## Reference Files\n' + fileContext : ''}`;

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
      workflow.onSubtaskComplete(subtaskId);
      throw err;
    }
  },

  // Dedicated builder execution — can be queued directly for re-runs/revisions
  'execute-builder': async (task) => {
    const subtaskId = task.meta?.subtaskId;
    const revisionNotes = task.meta?.revisionNotes || '';
    if (!subtaskId) throw new Error('No subtaskId in meta');

    const st = intake.getSubtask(subtaskId);
    if (!st) throw new Error('Subtask not found: ' + subtaskId);

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

  // AI Channel tasks — direct model interaction from the Channels tab
  'ai-channel': async (task) => {
    const { model, prompt, role } = task.meta || {};
    if (!prompt) throw new Error('No prompt provided');
    if (!model) throw new Error('No model specified');

    const today = new Date().toISOString().slice(0, 10);
    const ts = new Date().toISOString();
    const shortId = task.id.slice(-6);

    // Build system prompt based on role
    const rolePrompts = {
      general: 'You are operating inside RPGPO (Rahul Pitta Governed Private Office). Be direct, concise, evidence-based, and actionable.',
      research: 'You are the RPGPO Research Director. Provide evidence-based research with specific facts, numbers, and sources. Be concise and actionable.',
      builder: 'You are the RPGPO Builder / CTO. Focus on technical analysis, implementation priorities, and practical engineering advice. Be specific and direct.',
      strategy: 'You are the RPGPO Growth Strategist. Focus on business strategy, market positioning, growth channels, and actionable opportunities.',
      creative: 'You are the RPGPO Creative Director. Support storytelling, ideation, and creative development with structured, imaginative, and practical output.',
      chief: 'You are the RPGPO Chief of Staff. Synthesize information, identify priorities, surface blockers, and produce executive-quality briefings.',
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
  console.log(`[worker] Task ${task.id} → running: ${task.type} — ${task.label}`);
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
