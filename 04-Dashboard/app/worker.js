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
const { RPGPO_ROOT, logAction, writeFile } = require('./lib/files');
const { callOpenAI, callPerplexity, callGemini } = require('./lib/ai');
const costs = require('./lib/costs');

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
