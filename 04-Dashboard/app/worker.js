#!/usr/bin/env node
// RPGPO Background Task Worker v6
// Polls the task queue and executes tasks sequentially.
// Safe: no auto-send, no auto-post, no financial execution.

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Load .env if it exists
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
      if (!process.env[key]) process.env[key] = val;
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
console.log(`[worker] Models: OpenAI=${process.env.OPENAI_API_KEY ? 'OK' : 'missing'} Perplexity=${process.env.PERPLEXITY_API_KEY ? 'OK' : 'missing'} Gemini=${process.env.GEMINI_API_KEY ? 'OK' : 'missing'}`);
console.log(`[worker] Polling every ${POLL_INTERVAL}ms`);

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
        // Claude Builder — real execution path
        const today = new Date().toISOString().slice(0, 10);
        const isBuildTask = ['implement', 'build', 'code'].includes(st.stage);

        // Try to execute Claude CLI in print mode
        let claudeResult = null;
        let filesChanged = [];
        try {
          // Snapshot git status before
          let gitBefore = '';
          try { gitBefore = execSync('git diff --name-only', { cwd: RPGPO_ROOT, timeout: 5000 }).toString().trim(); } catch {}

          // Run claude -p (non-interactive, print mode)
          queue.updateTask(task.id, { output: `Claude Builder executing: ${st.title}...` });
          const claudeOut = execSync(
            `claude -p ${JSON.stringify(userPrompt.slice(0, 8000))}`,
            { cwd: RPGPO_ROOT, timeout: 120000, maxBuffer: 1024 * 1024 }
          ).toString();

          claudeResult = claudeOut;

          // Snapshot git status after to detect file changes
          try {
            const gitAfter = execSync('git diff --name-only', { cwd: RPGPO_ROOT, timeout: 5000 }).toString().trim();
            const beforeSet = new Set(gitBefore.split('\n').filter(Boolean));
            const afterFiles = gitAfter.split('\n').filter(Boolean);
            filesChanged = afterFiles.filter(f => !beforeSet.has(f));
            // Also check untracked files
            const untracked = execSync('git ls-files --others --exclude-standard', { cwd: RPGPO_ROOT, timeout: 5000 }).toString().trim();
            if (untracked) filesChanged.push(...untracked.split('\n').filter(Boolean));
          } catch {}

        } catch (claudeErr) {
          // Claude CLI not available or failed — fallback to prompt file
          console.log(`[worker] Claude CLI failed, falling back to prompt file: ${claudeErr.message.slice(0, 100)}`);
          const promptFile = writeFile(
            `03-Operations/Reports/Subtask-Claude-${today}-${subtaskId}.md`,
            `# RPGPO Subtask — Claude Builder\n## ${st.title}\n## Stage: ${st.stage}\n\n${userPrompt}\n`
          );
          intake.updateSubtask(subtaskId, {
            status: 'waiting_approval',
            output: `Claude CLI unavailable. Prompt saved to ${promptFile}. Execute manually and approve when done.`,
            files_changed: [],
          });
          return { output: `Claude prompt saved: ${promptFile} (execute manually)`, filesWritten: [promptFile] };
        }

        // Save output report
        const reportFile = writeFile(
          `03-Operations/Reports/Builder-Claude-${today}-${subtaskId}.md`,
          `# Claude Builder Output\n## ${st.title}\n## Stage: ${st.stage}\n## Date: ${today}\n\n${claudeResult.slice(0, 10000)}\n\n## Files Changed\n${filesChanged.map(f => '- ' + f).join('\n') || 'None detected'}\n`
        );

        // For build tasks with file changes, require approval before continuing
        if (isBuildTask && filesChanged.length > 0) {
          intake.updateSubtask(subtaskId, {
            status: 'waiting_approval',
            output: claudeResult.slice(0, 5000),
            files_changed: filesChanged,
          });
          intake.updateTask(st.parent_task_id, { status: 'waiting_approval' });
          return {
            output: `Claude Builder completed: ${st.title}\nFiles changed: ${filesChanged.join(', ')}\nAwaiting approval before continuing.`,
            filesWritten: [reportFile, ...filesChanged],
          };
        }

        // Non-build or no file changes — mark done
        intake.updateSubtask(subtaskId, {
          status: 'done',
          output: claudeResult.slice(0, 5000),
          files_changed: filesChanged,
        });
        const wfResult = workflow.onSubtaskComplete(subtaskId);

        if (wfResult.next_subtask_ids) {
          for (const nextId of wfResult.next_subtask_ids) {
            const nextSt = intake.getSubtask(nextId);
            if (nextSt) queue.addTask('execute-subtask', `Subtask: ${nextSt.title}`, { subtaskId: nextId });
          }
        }

        return {
          output: `Claude Builder: ${claudeResult.slice(0, 500)}\nFiles: ${filesChanged.join(', ') || 'none'}\n${wfResult.message}`,
          filesWritten: [reportFile, ...filesChanged],
        };
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

      // Mark subtask done
      intake.updateSubtask(subtaskId, {
        status: 'done',
        output: result.text.slice(0, 5000),
        cost: costEntry,
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
        output: `${st.title}: ${result.text.slice(0, 500)}\n\n${wfResult.message}`,
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
    logAction(`Worker: ${task.type}`, 'Done', (result.filesWritten || []).join(', ') || null);
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
