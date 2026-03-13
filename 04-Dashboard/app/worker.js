#!/usr/bin/env node
// RPGPO Background Task Worker
// Polls the task queue and executes tasks sequentially.
// Safe: no auto-send, no auto-post, no financial execution.

const { execSync, spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const queue = require('./lib/queue');
const { RPGPO_ROOT, logAction } = require('./lib/files');

const POLL_INTERVAL = 2000; // 2 seconds
let running = false;

console.log(`[worker] RPGPO Task Worker started at ${new Date().toISOString()}`);
console.log(`[worker] Root: ${RPGPO_ROOT}`);
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
        timeout: 120000,
      });

      let stdout = '';
      let stderr = '';
      child.stdout.on('data', d => {
        const chunk = d.toString();
        stdout += chunk;
        // Live update task output
        queue.updateTask(task.id, { output: stdout.slice(0, 5000) });
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
          });
        } else {
          reject(new Error(stderr || `Exit code ${code}`));
        }
      });

      child.on('error', reject);
    });
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
  console.log(`[worker] Running task ${task.id}: ${task.type} — ${task.label}`);
  queue.updateTask(task.id, { status: 'running' });

  try {
    const result = await handler(task);
    queue.updateTask(task.id, {
      status: 'done',
      output: (result.output || '').slice(0, 10000),
      filesWritten: result.filesWritten || [],
    });
    logAction(`Worker: ${task.type}`, 'Done', (result.filesWritten || []).join(', ') || null);
    console.log(`[worker] Task ${task.id} done.`);
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

// Poll
setInterval(processNext, POLL_INTERVAL);
processNext();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('[worker] Shutting down...');
  process.exit(0);
});
process.on('SIGINT', () => {
  console.log('[worker] Interrupted.');
  process.exit(0);
});
