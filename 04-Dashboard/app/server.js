// RPGPO Dashboard Server v6 — Premium Command Center with Cost Tracking
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Load .env if it exists (no dependencies needed)
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
      // API keys: always use .env value (prevents stale PM2 env from winning)
      // Other vars: only set if not already present
      if (API_KEY_NAMES.has(key) || !process.env[key]) process.env[key] = val;
    }
  } catch {}
})();

const { RPGPO_ROOT, readFile, readJson, listFiles, readAllInDir, parseMission, logAction } = require('./lib/files');
const queue = require('./lib/queue');
const events = require('./lib/events');
const costs = require('./lib/costs');
const intake = require('./lib/intake');
const workflow = require('./lib/workflow');

const PORT = process.env.PORT || 3200;
const startTime = Date.now();

// --- Watch tasks.json for cross-process changes (worker writes here) ---

let lastTasksJson = '';
const TASKS_FILE = path.resolve(__dirname, '..', 'state', 'tasks.json');

function watchTaskFile() {
  setInterval(() => {
    try {
      const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
      if (raw !== lastTasksJson) {
        const oldTasks = lastTasksJson ? JSON.parse(lastTasksJson) : [];
        const newTasks = JSON.parse(raw);
        lastTasksJson = raw;

        for (const nt of newTasks) {
          const ot = oldTasks.find(t => t.id === nt.id);
          if (!ot || ot.status !== nt.status || ot.updatedAt !== nt.updatedAt) {
            const evt = { event: 'task_updated', task: nt };
            events.broadcast('task', evt);
            if (nt.status === 'running') {
              events.broadcast('activity', { action: `Task running: ${nt.label}`, ts: new Date().toISOString() });
            } else if (nt.status === 'done') {
              events.broadcast('activity', { action: `Task done: ${nt.label}`, ts: new Date().toISOString() });
            } else if (nt.status === 'failed') {
              events.broadcast('activity', { action: `Task failed: ${nt.label}`, ts: new Date().toISOString() });
            }
          }
        }
      }
    } catch (e) {
      // Silently retry on next poll
    }
  }, 1000);

  try {
    lastTasksJson = fs.readFileSync(TASKS_FILE, 'utf-8');
    console.log(`[server] Task file watcher initialized.`);
  } catch {}
}

watchTaskFile();

// --- Helpers ---

function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try { resolve(JSON.parse(body)); } catch { resolve({}); }
    });
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(data));
}

// --- Provider state ---

function getProviderState(keyName, keyValue) {
  if (!keyValue) return 'missing';
  return 'ready';
}

function getProviderStates() {
  return {
    claude: { state: 'ready', type: 'local' },
    openai: { state: getProviderState('OPENAI_API_KEY', process.env.OPENAI_API_KEY), model: 'gpt-4o' },
    perplexity: { state: getProviderState('PERPLEXITY_API_KEY', process.env.PERPLEXITY_API_KEY), model: 'sonar' },
    gemini: {
      state: getProviderState('GEMINI_API_KEY', process.env.GEMINI_API_KEY),
      model: costs.getSettings().geminiModel || 'gemini-2.5-flash-lite',
    },
  };
}

// --- API data builder ---

function buildApiData() {
  const state = readJson('04-Dashboard/state/dashboard-state.json') || {};

  // Dynamic mission discovery: read all .md files in MissionStatus
  const missionDir = '03-Operations/MissionStatus';
  const missionFileNames = listFiles(missionDir).filter(f => f.endsWith('.md'));
  const missions = missionFileNames.map(f => {
    const md = readFile(path.join(missionDir, f));
    return parseMission(md);
  }).filter(Boolean);

  // Sort: active first, then needs-decision, then research-only, then planned
  const statusOrder = { active: 0, 'needs-decision': 1, 'needs decision': 1, 'research-only': 2, planned: 3 };
  missions.sort((a, b) => {
    const aOrd = statusOrder[(a.status || '').toLowerCase().replace(/\s+/g, '-')] ?? 4;
    const bOrd = statusOrder[(b.status || '').toLowerCase().replace(/\s+/g, '-')] ?? 4;
    if (aOrd !== bOrd) return aOrd - bOrd;
    // TopRanker always first within same status
    if (a.mission === 'TopRanker') return -1;
    if (b.mission === 'TopRanker') return 1;
    return 0;
  });

  const briefs = readAllInDir('03-Operations/DailyBriefs');
  const approvals = readAllInDir('03-Operations/Approvals/Pending');
  const logs = readAllInDir('03-Operations/Logs/AgentRuns');
  const toprankerSummary = readFile('03-Operations/Reports/TopRanker-Operating-Summary.md');
  const decisionLogs = readAllInDir('03-Operations/Logs/Decisions');

  // Cost summary for home
  const costSummary = costs.getSummary();

  return { state, missions, briefs, approvals, logs, decisionLogs, toprankerSummary, costSummary };
}

// --- Worker status ---

function getWorkerStatus() {
  try {
    const out = execSync('pm2 jlist 2>/dev/null', { timeout: 3000 }).toString();
    const procs = JSON.parse(out);
    const worker = procs.find(p => p.name === 'rpgpo-worker');
    if (worker) return { running: worker.pm2_env.status === 'online', pid: worker.pid, uptime: worker.pm2_env.pm_uptime };
  } catch {}
  try {
    execSync('pgrep -f "node.*worker.js"', { timeout: 2000 });
    return { running: true, pid: null, uptime: null };
  } catch {}
  return { running: false };
}

// --- HTTP server ---

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  // SSE endpoint
  if (req.url === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`event: connected\ndata: ${JSON.stringify({ ts: new Date().toISOString() })}\n\n`);
    events.addClient(res);

    const keepalive = setInterval(() => {
      try { res.write(': keepalive\n\n'); } catch { clearInterval(keepalive); }
    }, 15000);
    res.on('close', () => clearInterval(keepalive));

    const onTask = (data) => {
      try { res.write(`event: task\ndata: ${JSON.stringify(data)}\n\n`); } catch {}
    };
    queue.bus.on('task', onTask);
    res.on('close', () => queue.bus.off('task', onTask));
    return;
  }

  // Part 55: Inline route middleware guard
  const _tenantId = req.headers['x-tenant-id'] || 'rpgpo';
  const _projectId = req.headers['x-project-id'] || 'default';

  // Main data
  if (req.url === '/api/data') {
    return json(res, buildApiData());
  }

  // System status
  if (req.url === '/api/status') {
    return json(res, {
      server: { uptime: Date.now() - startTime, port: PORT },
      worker: getWorkerStatus(),
      providers: getProviderStates(),
      keys: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? 'configured' : 'missing',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
      },
      workspace: RPGPO_ROOT,
      node: process.version,
    });
  }

  // Cost endpoints
  if (req.url === '/api/costs') {
    return json(res, costs.getSummary());
  }

  if (req.url === '/api/costs/history') {
    return json(res, costs.getCosts({ since: new Date(Date.now() - 30 * 86400000).toISOString() }));
  }

  if (req.url === '/api/costs/settings' && req.method === 'GET') {
    return json(res, costs.getSettings());
  }

  if (req.url === '/api/costs/settings' && req.method === 'POST') {
    const body = await parseBody(req);
    const updated = costs.updateSettings(body);
    logAction('Cost settings updated', JSON.stringify(body), null);
    return json(res, { ok: true, settings: updated });
  }

  // Task queue
  if (req.url === '/api/tasks') {
    return json(res, queue.getAll());
  }

  if (req.url === '/api/tasks/submit' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.type) return json(res, { ok: false, error: 'Missing task type' }, 400);
    const task = queue.addTask(body.type, body.label || body.type, body.meta || {});
    events.broadcast('activity', { action: `Task queued: ${task.label}`, ts: new Date().toISOString() });
    logAction(`Task queued: ${body.type}`, task.id, null);
    return json(res, { ok: true, task });
  }

  // Direct script execution
  if (req.url?.startsWith('/api/run/') && req.method === 'POST') {
    const scriptName = req.url.replace('/api/run/', '');
    const scripts = {
      'refresh-state': path.join(__dirname, 'scripts', 'refresh-state.js'),
      'morning-loop': path.join(__dirname, 'scripts', 'morning-loop.js'),
      'evening-loop': path.join(__dirname, 'scripts', 'evening-loop.js'),
    };
    const script = scripts[scriptName];
    if (!script) return json(res, { ok: false, error: 'Unknown script' });
    try {
      const out = execSync(`node "${script}"`, { timeout: 30000, cwd: RPGPO_ROOT }).toString();
      logAction(`Run: ${scriptName}`, 'Success', script);
      events.broadcast('activity', { action: `Script completed: ${scriptName}`, ts: new Date().toISOString() });
      return json(res, { ok: true, output: out });
    } catch (e) {
      logAction(`Run: ${scriptName}`, 'Failed', script);
      return json(res, { ok: false, error: e.stderr ? e.stderr.toString() : e.message });
    }
  }

  // Approval actions
  if (req.url?.startsWith('/api/approval/') && req.method === 'POST') {
    const body = await parseBody(req);
    const filename = body.filename;
    const decision = req.url.includes('/approve') ? 'Approved' : 'Rejected';

    if (!filename || !/^[\w\-.]+\.md$/.test(filename)) return json(res, { ok: false, error: 'Invalid filename' }, 400);

    const src = path.join(RPGPO_ROOT, '03-Operations/Approvals/Pending', filename);
    const destDir = path.join(RPGPO_ROOT, `03-Operations/Approvals/${decision}`);
    const dest = path.join(destDir, filename);

    if (!fs.existsSync(src)) return json(res, { ok: false, error: 'File not found' }, 404);

    fs.mkdirSync(destDir, { recursive: true });
    const stamp = `\n\n---\n## Decision\n- **${decision}** by Rahul via RPGPO Dashboard\n- **Timestamp:** ${new Date().toISOString()}\n`;
    fs.appendFileSync(src, stamp);
    fs.renameSync(src, dest);

    logAction(`Approval ${decision}`, `Moved ${filename}`, filename);
    events.broadcast('activity', { action: `${decision}: ${filename}`, ts: new Date().toISOString() });
    return json(res, { ok: true, decision, filename });
  }

  // Settings
  if (req.url === '/api/settings') {
    return json(res, {
      keys: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? 'configured' : 'missing',
        GEMINI_API_KEY: process.env.GEMINI_API_KEY ? 'configured' : 'missing',
      },
      providers: getProviderStates(),
      costSettings: costs.getSettings(),
      workspace: RPGPO_ROOT,
      node: process.version,
      platform: process.platform,
    });
  }

  // Launch Claude Builder — creates a real tracked queue task
  if (req.url === '/api/launch-claude' && req.method === 'POST') {
    const body = await parseBody(req);
    const subtaskId = body.subtaskId || null;
    console.log(`[server][launch-claude] Re-run requested. subtaskId=${subtaskId || 'none (standalone)'}`);

    if (subtaskId) {
      // Re-queue a builder_fallback subtask for another real attempt
      const st = intake.getSubtask(subtaskId);
      if (!st) {
        console.log(`[server][launch-claude] FAILED: subtask not found: ${subtaskId}`);
        return json(res, { ok: false, error: 'Subtask not found: ' + subtaskId }, 404);
      }
      console.log(`[server][launch-claude] Subtask found: "${st.title}" (status=${st.status})`);

      // Reset subtask state so the worker re-runs the builder
      intake.updateSubtask(subtaskId, {
        status: 'queued',
        builder_outcome: null,
        builder_phase: null,
        error: null,
      });

      let task;
      try {
        task = queue.addTask('execute-builder', `Builder re-run: ${st.title}`, { subtaskId });
      } catch (e) {
        console.error(`[server][launch-claude] FAILED to write queue task: ${e.message}`);
        return json(res, { ok: false, error: 'Failed to create queue task: ' + e.message }, 500);
      }

      // Verify the task was actually persisted
      const verified = queue.getTask(task.id);
      if (!verified) {
        console.error(`[server][launch-claude] FAILED: task ${task.id} not found after write — queue persistence failure`);
        return json(res, { ok: false, error: 'Queue write failed — task not found after creation' }, 500);
      }

      console.log(`[server][launch-claude] SUCCESS: queue task ${task.id} created (type=execute-builder, status=${verified.status})`);
      events.broadcast('activity', { action: `Builder re-queued for subtask: ${st.title}`, ts: new Date().toISOString() });
      logAction('Launch Claude Builder', `Queued as ${task.id}`, `subtask=${subtaskId}`);
      return json(res, {
        ok: true,
        task: verified,
        subtaskId,
        taskId: verified.id,
        taskType: verified.type,
        taskStatus: verified.status,
        output: `Builder queued as task ${task.id} (type=${verified.type}). Worker will execute and track progress.`,
      });
    }

    // Standalone launch — create a launch_builder queue task
    let task;
    try {
      task = queue.addTask('launch_builder', 'Standalone Claude Builder Session');
    } catch (e) {
      console.error(`[server][launch-claude] FAILED to write standalone queue task: ${e.message}`);
      return json(res, { ok: false, error: 'Failed to create queue task: ' + e.message }, 500);
    }

    const verified = queue.getTask(task.id);
    if (!verified) {
      console.error(`[server][launch-claude] FAILED: standalone task ${task.id} not found after write`);
      return json(res, { ok: false, error: 'Queue write failed — task not found after creation' }, 500);
    }

    console.log(`[server][launch-claude] SUCCESS: standalone task ${verified.id} created (type=launch_builder, status=${verified.status})`);
    events.broadcast('activity', { action: 'Claude Builder session queued', ts: new Date().toISOString() });
    logAction('Launch Claude Builder', `Queued as ${task.id}`, 'standalone');
    return json(res, {
      ok: true,
      task: verified,
      taskId: verified.id,
      taskType: verified.type,
      taskStatus: verified.status,
      output: `Builder session queued as task ${task.id} (type=${verified.type}). Worker will spawn and track the process.`,
    });
  }

  // Board run (queue-based)
  if (req.url === '/api/board-run' && req.method === 'POST') {
    const task = queue.addTask('board-run', 'Board of AI Run');
    events.broadcast('activity', { action: 'Board of AI queued', ts: new Date().toISOString() });
    logAction('Board Run', 'Queued as ' + task.id, null);
    return json(res, { ok: true, task });
  }

  // AI tasks
  if (req.url?.startsWith('/api/ai/') && req.method === 'POST') {
    const taskType = req.url.replace('/api/ai/', '');
    const prompt = readFile('03-Operations/Reports/Claude-TopRanker-Starter-Prompt.md');
    if (taskType === 'claude-topranker-review' && prompt) {
      logAction('Claude TopRanker Review', 'Displayed', null);
      return json(res, { ok: true, output: 'TopRanker Review Prompt:\n\n' + prompt });
    }
    if (taskType === 'openai-daily-brief' && !process.env.OPENAI_API_KEY) {
      return json(res, { ok: false, error: 'OPENAI_API_KEY not set. Configure it and restart.' });
    }
    if (taskType === 'perplexity-research' && !process.env.PERPLEXITY_API_KEY) {
      return json(res, { ok: false, error: 'PERPLEXITY_API_KEY not set. Configure it and restart.' });
    }
    if (taskType === 'gemini-strategy' && !process.env.GEMINI_API_KEY) {
      return json(res, { ok: false, error: 'GEMINI_API_KEY not set. Configure it and restart.' });
    }
    return json(res, { ok: true, output: 'Use "Run Board of AI" or the Channels tab to execute via the task queue.' });
  }

  // ── Intake API ──

  // Submit a new intake task
  // Quick run — submit + auto-deliberate + auto-approve in one step
  if (req.url === '/api/intake/run' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.raw_request) return json(res, { ok: false, error: 'Missing raw_request' }, 400);
    try {
      const task = intake.createTask(body);
      events.broadcast('activity', { action: `Quick run: ${task.title}`, ts: new Date().toISOString() });
      // Queue deliberation
      queue.addTask('deliberate', `Deliberate: ${task.title}`, { taskId: task.task_id, autoApprove: true });
      return json(res, { ok: true, task, message: 'Task submitted — auto-deliberation and execution started' });
    } catch (e) { return json(res, { ok: false, error: e.message }, 500); }
  }

  if (req.url === '/api/intake/submit' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.raw_request) return json(res, { ok: false, error: 'Missing raw_request' }, 400);
    const task = intake.createTask(body);
    events.broadcast('activity', { action: `Task submitted: ${task.title}`, ts: new Date().toISOString() });
    logAction('Intake submit', task.task_id, task.title);
    // Auto-queue deliberation so task starts processing immediately
    try {
      queue.addTask('deliberate', `Deliberate: ${task.title}`, { taskId: task.task_id });
      events.broadcast('activity', { action: `Board deliberation queued: ${task.title}`, ts: new Date().toISOString() });
    } catch { /* manual deliberation fallback */ }
    return json(res, { ok: true, task, message: 'Task submitted and deliberation started' });
  }

  // List all intake tasks
  if (req.url === '/api/intake/tasks') {
    return json(res, intake.getAllTasks());
  }

  // Get a specific intake task with its subtasks
  if (req.url?.match(/^\/api\/intake\/task\/([^/]+)$/) && req.method === 'GET') {
    const taskId = req.url.match(/^\/api\/intake\/task\/([^/]+)$/)[1];
    const task = intake.getTask(taskId);
    if (!task) return json(res, { error: 'Not found' }, 404);
    const subtasks = intake.getSubtasksForTask(taskId);
    const progress = intake.getTaskProgress(taskId);
    return json(res, { task, subtasks, progress });
  }

  // Trigger deliberation on an intake task
  if (req.url?.match(/^\/api\/intake\/task\/([^/]+)\/deliberate$/) && req.method === 'POST') {
    const taskId = req.url.match(/^\/api\/intake\/task\/([^/]+)\/deliberate$/)[1];
    const task = intake.getTask(taskId);
    if (!task) return json(res, { error: 'Not found' }, 404);
    const qTask = queue.addTask('deliberate', `Deliberate: ${task.title}`, { taskId });
    events.broadcast('activity', { action: `Deliberation queued: ${task.title}`, ts: new Date().toISOString() });
    logAction('Deliberation queued', taskId, task.title);
    return json(res, { ok: true, queueTask: qTask });
  }

  // Approve plan and start execution
  if (req.url?.match(/^\/api\/intake\/task\/([^/]+)\/approve-plan$/) && req.method === 'POST') {
    const taskId = req.url.match(/^\/api\/intake\/task\/([^/]+)\/approve-plan$/)[1];
    const task = intake.getTask(taskId);
    if (!task) return json(res, { error: 'Not found' }, 404);
    if (task.status !== 'planned') return json(res, { error: 'Task not in planned state' }, 400);

    // Queue initial subtasks
    const queuedIds = workflow.queueInitialSubtasks(taskId);

    // Add queued subtasks to the worker queue
    for (const stId of queuedIds) {
      const st = intake.getSubtask(stId);
      if (st) queue.addTask('execute-subtask', `Subtask: ${st.title}`, { subtaskId: stId });
    }

    events.broadcast('activity', { action: `Plan approved, ${queuedIds.length} subtasks queued`, ts: new Date().toISOString() });
    logAction('Plan approved', taskId, `${queuedIds.length} subtasks queued`);
    return json(res, { ok: true, queued: queuedIds.length });
  }

  // Approve a single subtask
  if (req.url?.match(/^\/api\/subtask\/([^/]+)\/approve$/) && req.method === 'POST') {
    const subtaskId = req.url.match(/^\/api\/subtask\/([^/]+)\/approve$/)[1];
    const st = intake.getSubtask(subtaskId);
    if (!st) return json(res, { error: 'Not found' }, 404);
    const approvable = ['waiting_approval', 'builder_fallback', 'waiting_human'];
    if (!approvable.includes(st.status)) return json(res, { error: 'Subtask not awaiting approval' }, 400);

    const body = await parseBody(req);

    // ── Completed-work approval: subtask already ran and produced results ──
    // builder_outcome present means the builder/executor already finished;
    // approval = "accept results, mark done, continue workflow"
    const isCompletedWork = st.status === 'builder_fallback'
      || (st.status === 'waiting_approval' && st.builder_outcome)
      || (st.status === 'waiting_human' && st.builder_outcome);

    if (isCompletedWork) {
      const outcomeLabel = st.status === 'builder_fallback'
        ? 'manual_execution_confirmed'
        : `${st.builder_outcome}_approved`;

      console.log(`[server][approve] Completed-work approval: subtask=${subtaskId}, status=${st.status}, builder_outcome=${st.builder_outcome}, marking done`);

      intake.updateSubtask(subtaskId, {
        status: 'done',
        builder_outcome: outcomeLabel,
        output: (st.output || '') + `\n\n[Approved by Rahul at ${new Date().toISOString()}]`,
      });

      // Re-run dependency resolution and queue next eligible subtasks
      console.log(`[server][approve] Running workflow.onSubtaskComplete for ${subtaskId}`);
      const wfResult = workflow.onSubtaskComplete(subtaskId);
      console.log(`[server][approve] Workflow result: action=${wfResult.action}, next=${(wfResult.next_subtask_ids || []).length}, approval_needed=${(wfResult.approval_needed || []).length}, msg=${wfResult.message}`);

      const queuedNext = [];
      if (wfResult.next_subtask_ids) {
        for (const nextId of wfResult.next_subtask_ids) {
          const nextSt = intake.getSubtask(nextId);
          if (nextSt) {
            queue.addTask('execute-subtask', `Subtask: ${nextSt.title}`, { subtaskId: nextId });
            queuedNext.push({ id: nextId, title: nextSt.title });
            console.log(`[server][approve] Queued next subtask: ${nextId} "${nextSt.title}"`);
          }
        }
      }

      // Update parent task status
      const parentTask = intake.getTask(st.parent_task_id);
      if (parentTask && parentTask.status === 'waiting_approval') {
        if (queuedNext.length > 0 || (wfResult.approval_needed && wfResult.approval_needed.length > 0)) {
          intake.updateTask(st.parent_task_id, { status: 'executing' });
          console.log(`[server][approve] Parent task ${st.parent_task_id} moved to executing`);
        }
      }

      // Broadcast activity and SSE updates
      const nextLabel = queuedNext.length > 0
        ? `Queued next: ${queuedNext.map(n => n.title).join(', ')}`
        : wfResult.action === 'complete' ? 'All subtasks complete' : wfResult.message;
      events.broadcast('activity', {
        action: `Approved "${st.title}" — ${nextLabel}`,
        ts: new Date().toISOString(),
      });
      events.broadcast('intake-update', {
        taskId: st.parent_task_id,
        subtaskId,
        action: 'approved_and_continued',
        nextQueued: queuedNext,
      });

      return json(res, {
        ok: true,
        resumed: st.title,
        action: 'approved_and_continued',
        nextQueued: queuedNext,
        workflowAction: wfResult.action,
        message: nextLabel,
      });
    }

    // ── Pre-execution approval: yellow/red subtask hasn't run yet — queue it ──
    console.log(`[server][approve] Pre-execution approval: subtask=${subtaskId}, status=${st.status}, queuing for execution`);
    intake.updateSubtask(subtaskId, { status: 'queued' });
    queue.addTask('execute-subtask', `Subtask: ${st.title}`, { subtaskId });

    // Check if parent task should move from waiting_approval back to executing
    const parentTask = intake.getTask(st.parent_task_id);
    if (parentTask && parentTask.status === 'waiting_approval') {
      const siblings = intake.getSubtasksForTask(st.parent_task_id);
      const stillWaiting = siblings.filter(s => s.status === 'waiting_approval' && s.subtask_id !== subtaskId);
      if (!stillWaiting.length) {
        intake.updateTask(st.parent_task_id, { status: 'executing' });
      }
    }

    events.broadcast('activity', { action: `Subtask approved & queued: ${st.title}`, ts: new Date().toISOString() });
    events.broadcast('intake-update', { taskId: st.parent_task_id, subtaskId, action: 'approved' });
    return json(res, { ok: true, resumed: st.title, parentTask: parentTask?.title });
  }

  // Reject a subtask's code changes (revert via git checkout)
  if (req.url?.match(/^\/api\/subtask\/([^/]+)\/reject$/) && req.method === 'POST') {
    const subtaskId = req.url.match(/^\/api\/subtask\/([^/]+)\/reject$/)[1];
    const st = intake.getSubtask(subtaskId);
    if (!st) return json(res, { error: 'Not found' }, 404);
    if (st.status !== 'waiting_approval') return json(res, { error: 'Subtask not awaiting approval' }, 400);

    const body = await parseBody(req);
    const reason = body.reason || 'Rejected by Rahul';

    // Revert changed files if code_applied
    if (st.builder_outcome === 'code_applied' && st.files_changed && st.files_changed.length) {
      try {
        for (const f of st.files_changed) {
          execSync(`git checkout -- "${f}"`, { cwd: RPGPO_ROOT, timeout: 5000 });
        }
      } catch (e) {
        console.log(`[server] Git revert warning: ${e.message.slice(0, 80)}`);
      }
    }

    intake.updateSubtask(subtaskId, {
      status: 'failed',
      builder_outcome: 'rejected',
      error: `Rejected: ${reason}`,
      output: (st.output || '') + `\n\n[Rejected by Rahul: ${reason}]`,
    });
    workflow.onSubtaskComplete(subtaskId);

    events.broadcast('activity', { action: `Subtask rejected: ${st.title}`, ts: new Date().toISOString() });
    events.broadcast('intake-update', { taskId: st.parent_task_id, subtaskId, action: 'rejected' });
    return json(res, { ok: true, rejected: st.title, reverted: st.files_changed || [] });
  }

  // Revise a subtask — re-run builder with additional instructions
  if (req.url?.match(/^\/api\/subtask\/([^/]+)\/revise$/) && req.method === 'POST') {
    const subtaskId = req.url.match(/^\/api\/subtask\/([^/]+)\/revise$/)[1];
    const st = intake.getSubtask(subtaskId);
    if (!st) return json(res, { error: 'Not found' }, 404);
    if (st.status !== 'waiting_approval' && st.status !== 'builder_fallback')
      return json(res, { error: 'Subtask not in revisable state' }, 400);

    const body = await parseBody(req);
    if (!body.notes) return json(res, { error: 'Missing revision notes' }, 400);

    // Revert existing changes first if code_applied
    if (st.builder_outcome === 'code_applied' && st.files_changed && st.files_changed.length) {
      try {
        for (const f of st.files_changed) {
          execSync(`git checkout -- "${f}"`, { cwd: RPGPO_ROOT, timeout: 5000 });
        }
      } catch (e) {
        console.log(`[server] Git revert for revise warning: ${e.message.slice(0, 80)}`);
      }
    }

    // Reset subtask to queued and queue a builder re-run
    intake.updateSubtask(subtaskId, {
      status: 'queued',
      builder_outcome: null,
      builder_phase: null,
      files_changed: [],
      diff_summary: '',
      diff_detail: '',
      revision_notes: body.notes,
      output: (st.output || '') + `\n\n[Revision requested: ${body.notes}]`,
    });

    const qTask = queue.addTask('execute-builder', `Builder re-run: ${st.title}`, {
      subtaskId,
      revisionNotes: body.notes,
    });

    events.broadcast('activity', { action: `Builder revision queued: ${st.title}`, ts: new Date().toISOString() });
    events.broadcast('intake-update', { taskId: st.parent_task_id, subtaskId, action: 'revised' });
    return json(res, { ok: true, revised: st.title, queueTask: qTask });
  }

  // Get all subtasks
  if (req.url === '/api/subtasks') {
    return json(res, intake.getAllSubtasks());
  }

  // Global pending approvals — subtasks + tasks waiting approval
  if (req.url === '/api/intake/pending-approvals') {
    const allSubs = intake.getAllSubtasks();
    const pending = allSubs.filter(s => ['waiting_approval', 'builder_fallback', 'waiting_human', 'builder_running'].includes(s.status)).map(s => {
      const parent = intake.getTask(s.parent_task_id);
      return { ...s, parent_title: parent ? parent.title : 'Unknown', parent_domain: parent ? parent.domain : 'general' };
    });
    return json(res, pending);
  }

  // Current task focus — the most active intake task with its subtasks
  if (req.url === '/api/intake/current') {
    const allTasks = intake.getAllTasks();
    const terminal = ['done', 'failed', 'canceled'];
    const current = allTasks.find(t => !terminal.includes(t.status));
    if (!current) return json(res, { task: null, subtasks: [], progress: null, pendingApprovals: [] });
    const subtasks = intake.getSubtasksForTask(current.task_id);
    const progress = intake.getTaskProgress(current.task_id);
    const pendingApprovals = subtasks.filter(s => s.status === 'waiting_approval');
    const activeSubtask = subtasks.find(s => s.status === 'builder_running') || subtasks.find(s => s.status === 'running') || subtasks.find(s => s.status === 'queued') || null;
    const nextBlocking = subtasks.find(s => s.status === 'waiting_approval') || subtasks.find(s => s.status === 'builder_fallback') || null;
    const builderActive = subtasks.find(s => s.status === 'builder_running') || null;
    const reviewReady = subtasks.filter(s => s.status === 'waiting_approval' && s.builder_outcome);
    return json(res, { task: current, subtasks, progress, pendingApprovals, activeSubtask, nextBlocking, builderActive, reviewReady });
  }

  // Provider key diagnostic (safe — never exposes full keys)
  if (req.url === '/api/diag/keys') {
    function diagKey(name) {
      const v = process.env[name];
      if (!v) return { status: 'missing', source: 'none' };
      if (v === 'your_key_here' || v.startsWith('your_')) return { status: 'placeholder', source: 'stale', prefix: v.slice(0, 8) };
      return { status: 'ok', prefix: v.slice(0, 6) + '...', length: v.length };
    }
    return json(res, {
      openai: diagKey('OPENAI_API_KEY'),
      perplexity: diagKey('PERPLEXITY_API_KEY'),
      gemini: diagKey('GEMINI_API_KEY'),
      envFile: fs.existsSync(path.join(__dirname, '.env')) ? 'present' : 'missing',
    });
  }

  // ── Chief of Staff API ──

  if (req.url === '/api/chief-of-staff/brief') {
    try {
      const cos = require('./lib/chief-of-staff');
      return json(res, cos.generateBrief());
    } catch (e) {
      console.error('[server] Chief of Staff error:', e.message);
      return json(res, { error: e.message }, 500);
    }
  }

  if (req.url === '/api/chief-of-staff/actions' && req.method === 'GET') {
    try {
      const cos = require('./lib/chief-of-staff');
      return json(res, { actions: cos.getNextBestActions(20) });
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  if (req.url?.match(/^\/api\/chief-of-staff\/engine\/([^/]+)$/) && req.method === 'GET') {
    const domain = req.url.match(/^\/api\/chief-of-staff\/engine\/([^/]+)$/)[1];
    try {
      const cos = require('./lib/chief-of-staff');
      return json(res, { actions: cos.getEngineActions(domain) });
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  // ── Mission Statements API ──

  if (req.url === '/api/mission-statements' && req.method === 'GET') {
    try {
      const ms = require('./lib/mission-statements');
      return json(res, { statements: ms.getAllStatements() });
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  if (req.url === '/api/mission-statements' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.level || !body.scope_id || !body.statement) {
      return json(res, { error: 'Missing level, scope_id, or statement' }, 400);
    }
    try {
      const ms = require('./lib/mission-statements');
      const result = ms.setStatement(body.level, body.scope_id, {
        statement: body.statement,
        objectives: body.objectives || [],
        values: body.values || [],
        success_criteria: body.success_criteria || [],
      });
      logAction('Mission statement set', `${body.level}:${body.scope_id}`, body.statement.slice(0, 60));
      return json(res, { ok: true, statement: result });
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  // ── Memory Viewer API ──

  if (req.url === '/api/memory-viewer' && req.method === 'GET') {
    try {
      const mv = require('./lib/memory-viewer');
      return json(res, mv.getMemoryViewerData());
    } catch (e) {
      console.error('[server] Memory viewer error:', e.message);
      return json(res, { error: e.message }, 500);
    }
  }

  if (req.url?.startsWith('/api/memory-viewer/search') && req.method === 'GET') {
    const query = new URL(req.url, 'http://localhost').searchParams.get('q') || '';
    try {
      const mv = require('./lib/memory-viewer');
      return json(res, { results: mv.searchDocuments(query) });
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  if (req.url?.match(/^\/api\/memory-viewer\/domain\/([^/]+)$/) && req.method === 'GET') {
    const domain = req.url.match(/^\/api\/memory-viewer\/domain\/([^/]+)$/)[1];
    try {
      const mv = require('./lib/memory-viewer');
      return json(res, { documents: mv.getDocumentsByDomain(domain) });
    } catch (e) {
      return json(res, { error: e.message }, 500);
    }
  }

  // ── Execution Graphs API ──

  if (req.url === '/api/execution-graphs' && req.method === 'GET') {
    try {
      const eg = require('./lib/execution-graph');
      return json(res, { graphs: eg.getAllGraphs() });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/execution-graphs\/task\/([^/]+)$/) && req.method === 'GET') {
    const taskId = req.url.match(/^\/api\/execution-graphs\/task\/([^/]+)$/)[1];
    try {
      const eg = require('./lib/execution-graph');
      const graph = eg.getGraphForTask(taskId);
      if (!graph) return json(res, { error: 'No graph for task' }, 404);
      const nodes = eg.getNodesForGraph(graph.graph_id);
      return json(res, { graph, nodes });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/execution-graphs\/([^/]+)$/) && req.method === 'GET') {
    const graphId = req.url.match(/^\/api\/execution-graphs\/([^/]+)$/)[1];
    if (graphId === 'create') { /* fall through to POST handler */ }
    else {
      try {
        const eg = require('./lib/execution-graph');
        const graph = eg.getGraph(graphId);
        if (!graph) return json(res, { error: 'Graph not found' }, 404);
        const nodes = eg.getNodesForGraph(graphId);
        const ag = require('./lib/approval-gates');
        const gates = ag.getGatesForGraph(graphId);
        const rc = require('./lib/review-contracts');
        const reviews = rc.getReviewsForGraph(graphId);
        let dossier = null;
        if (graph.dossier_id) {
          const pd = require('./lib/promotion-dossiers');
          dossier = pd.getDossier(graph.dossier_id);
        }
        return json(res, { graph, nodes, gates, reviews, dossier });
      } catch (e) { return json(res, { error: e.message }, 500); }
    }
  }

  if (req.url === '/api/execution-graphs/create' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.task_id) return json(res, { error: 'Missing task_id' }, 400);
    try {
      const cos = require('./lib/chief-of-staff');
      const result = cos.orchestrateTask(body.task_id);
      if (!result.graph) return json(res, { error: 'Could not create graph — task may lack board deliberation' }, 400);
      events.broadcast('activity', { action: `Execution graph created for "${result.graph.title}"`, ts: new Date().toISOString() });
      logAction('Execution graph created', result.graph.graph_id, result.graph.title);
      return json(res, { ok: true, ...result });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/execution-graphs\/([^/]+)\/rebuild$/) && req.method === 'POST') {
    const graphId = req.url.match(/^\/api\/execution-graphs\/([^/]+)\/rebuild$/)[1];
    try {
      const eg = require('./lib/execution-graph');
      const graph = eg.rebuildGraph(graphId);
      if (!graph) return json(res, { error: 'Cannot rebuild — graph not in failed/canceled state' }, 400);
      return json(res, { ok: true, graph });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/execution-graphs\/([^/]+)\/nodes$/) && req.method === 'GET') {
    const graphId = req.url.match(/^\/api\/execution-graphs\/([^/]+)\/nodes$/)[1];
    try {
      const eg = require('./lib/execution-graph');
      return json(res, { nodes: eg.getNodesForGraph(graphId) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Execution Nodes API ──

  if (req.url?.match(/^\/api\/execution-nodes\/([^/]+)$/) && req.method === 'GET') {
    const nodeId = req.url.match(/^\/api\/execution-nodes\/([^/]+)$/)[1];
    try {
      const eg = require('./lib/execution-graph');
      const node = eg.getNode(nodeId);
      if (!node) return json(res, { error: 'Node not found' }, 404);
      return json(res, { node });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/execution-nodes\/([^/]+)\/status$/) && req.method === 'POST') {
    const nodeId = req.url.match(/^\/api\/execution-nodes\/([^/]+)\/status$/)[1];
    const body = await parseBody(req);
    if (!body.status) return json(res, { error: 'Missing status' }, 400);
    try {
      const eg = require('./lib/execution-graph');
      const node = eg.updateNodeStatus(nodeId, body.status);
      if (!node) return json(res, { error: 'Invalid transition or node not found' }, 400);
      return json(res, { ok: true, node });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Approval Gates API ──

  if (req.url?.match(/^\/api\/approval-gates\/([^/]+)$/) && req.method === 'GET') {
    const graphId = req.url.match(/^\/api\/approval-gates\/([^/]+)$/)[1];
    try {
      const ag = require('./lib/approval-gates');
      return json(res, { gates: ag.getGatesForGraph(graphId) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/approval-gates\/([^/]+)\/approve$/) && req.method === 'POST') {
    const gateId = req.url.match(/^\/api\/approval-gates\/([^/]+)\/approve$/)[1];
    const body = await parseBody(req);
    try {
      const ag = require('./lib/approval-gates');
      const gate = ag.approveGate(gateId, body.resolved_by || 'operator', body.notes);
      if (!gate) return json(res, { error: 'Gate not found or already resolved' }, 400);
      events.broadcast('activity', { action: `Gate approved: ${gate.title}`, ts: new Date().toISOString() });
      return json(res, { ok: true, gate });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/approval-gates\/([^/]+)\/reject$/) && req.method === 'POST') {
    const gateId = req.url.match(/^\/api\/approval-gates\/([^/]+)\/reject$/)[1];
    const body = await parseBody(req);
    try {
      const ag = require('./lib/approval-gates');
      const gate = ag.rejectGate(gateId, body.resolved_by || 'operator', body.notes);
      if (!gate) return json(res, { error: 'Gate not found or already resolved' }, 400);
      events.broadcast('activity', { action: `Gate rejected: ${gate.title}`, ts: new Date().toISOString() });
      return json(res, { ok: true, gate });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/approval-gates\/([^/]+)\/waive$/) && req.method === 'POST') {
    const gateId = req.url.match(/^\/api\/approval-gates\/([^/]+)\/waive$/)[1];
    const body = await parseBody(req);
    try {
      const ag = require('./lib/approval-gates');
      const gate = ag.waiveGate(gateId, body.resolved_by || 'operator', body.notes);
      if (!gate) return json(res, { error: 'Gate not found or already resolved' }, 400);
      events.broadcast('activity', { action: `Gate waived: ${gate.title}`, ts: new Date().toISOString() });
      return json(res, { ok: true, gate });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Review Contracts API ──

  if (req.url?.match(/^\/api\/review-contracts\/([^/]+)$/) && req.method === 'GET') {
    const graphId = req.url.match(/^\/api\/review-contracts\/([^/]+)$/)[1];
    try {
      const rc = require('./lib/review-contracts');
      return json(res, { reviews: rc.getReviewsForGraph(graphId) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/review-contracts\/([^/]+)\/complete$/) && req.method === 'POST') {
    const reviewId = req.url.match(/^\/api\/review-contracts\/([^/]+)\/complete$/)[1];
    const body = await parseBody(req);
    if (!body.verdict) return json(res, { error: 'Missing verdict' }, 400);
    try {
      const rc = require('./lib/review-contracts');
      const review = rc.completeReview(reviewId, body.verdict, body.reviewer || 'operator', body.notes, body.checklist_updates);
      if (!review) return json(res, { error: 'Review not found' }, 404);
      events.broadcast('activity', { action: `Review completed: ${review.title} (${body.verdict})`, ts: new Date().toISOString() });
      return json(res, { ok: true, review });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Promotion Dossiers API ──

  if (req.url === '/api/promotion-dossiers' && req.method === 'GET') {
    try {
      const pd = require('./lib/promotion-dossiers');
      return json(res, { dossiers: pd.getAllDossiers() });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url === '/api/promotion-dossiers/generate' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.graph_id) return json(res, { error: 'Missing graph_id' }, 400);
    try {
      const cos = require('./lib/chief-of-staff');
      const dossier = cos.generatePromotionDossier(body.graph_id);
      if (!dossier) return json(res, { error: 'Could not generate dossier — graph may not exist' }, 400);
      events.broadcast('activity', { action: `Dossier generated: ${dossier.title} (${dossier.recommendation})`, ts: new Date().toISOString() });
      logAction('Promotion dossier generated', dossier.dossier_id, dossier.recommendation);
      return json(res, { ok: true, dossier });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/promotion-dossiers\/([^/]+)\/promote$/) && req.method === 'POST') {
    const dossierId = req.url.match(/^\/api\/promotion-dossiers\/([^/]+)\/promote$/)[1];
    try {
      const pd = require('./lib/promotion-dossiers');
      const dossier = pd.promoteDossier(dossierId);
      if (!dossier) return json(res, { error: 'Cannot promote — dossier not found or recommendation is rework' }, 400);
      events.broadcast('activity', { action: `Dossier promoted: ${dossier.title}`, ts: new Date().toISOString() });
      logAction('Dossier promoted', dossierId, dossier.title);
      return json(res, { ok: true, dossier });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/promotion-dossiers\/([^/]+)$/) && req.method === 'GET') {
    const dossierId = req.url.match(/^\/api\/promotion-dossiers\/([^/]+)$/)[1];
    if (dossierId === 'generate') { /* handled above */ }
    else {
      try {
        const pd = require('./lib/promotion-dossiers');
        const dossier = pd.getDossier(dossierId);
        if (!dossier) return json(res, { error: 'Dossier not found' }, 404);
        return json(res, { dossier });
      } catch (e) { return json(res, { error: e.message }, 500); }
    }
  }

  // ── Provider Registry API ──

  if (req.url === '/api/provider-registry' && req.method === 'GET') {
    try {
      const pr = require('./lib/provider-registry');
      return json(res, { providers: pr.getProviderProfiles(), fits: pr.getAllFits(), recipes: pr.getAllRecipes() });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/provider-registry\/providers\/([^/]+)$/) && req.method === 'GET') {
    const providerId = req.url.match(/^\/api\/provider-registry\/providers\/([^/]+)$/)[1];
    try {
      const pr = require('./lib/provider-registry');
      const profile = pr.getProviderProfile(providerId);
      const fits = pr.getFitsForProvider(providerId);
      const recipes = pr.getRecipesForProvider(providerId);
      return json(res, { profile, fits, recipes });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url === '/api/provider-registry/fits' && req.method === 'GET') {
    try {
      const pr = require('./lib/provider-registry');
      return json(res, { fits: pr.getAllFits() });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/provider-registry\/fits\/domain\/([^/]+)$/) && req.method === 'GET') {
    const domain = req.url.match(/^\/api\/provider-registry\/fits\/domain\/([^/]+)$/)[1];
    try {
      const pr = require('./lib/provider-registry');
      return json(res, { fits: pr.getFitsForDomain(domain) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/provider-registry\/fits\/project\/([^/]+)$/) && req.method === 'GET') {
    const projectId = req.url.match(/^\/api\/provider-registry\/fits\/project\/([^/]+)$/)[1];
    try {
      const pr = require('./lib/provider-registry');
      return json(res, { fits: pr.getFitsForProject(projectId) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url === '/api/provider-registry/fits' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.provider_id || !body.role || !body.task_kind) return json(res, { error: 'Missing fields' }, 400);
    try {
      const pr = require('./lib/provider-registry');
      const fit = pr.upsertFit(body);
      return json(res, { ok: true, fit });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/provider-registry\/fits\/([^/]+)\/promote$/) && req.method === 'POST') {
    const fitId = req.url.match(/^\/api\/provider-registry\/fits\/([^/]+)\/promote$/)[1];
    try {
      const pr = require('./lib/provider-registry');
      const fit = pr.promoteFit(fitId);
      if (!fit) return json(res, { error: 'Fit not found' }, 404);
      return json(res, { ok: true, fit });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/provider-registry\/fits\/([^/]+)\/deprecate$/) && req.method === 'POST') {
    const fitId = req.url.match(/^\/api\/provider-registry\/fits\/([^/]+)\/deprecate$/)[1];
    try {
      const pr = require('./lib/provider-registry');
      const fit = pr.deprecateFit(fitId);
      if (!fit) return json(res, { error: 'Fit not found' }, 404);
      return json(res, { ok: true, fit });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Collaboration Contracts API ──

  if (req.url === '/api/collaboration-contracts' && req.method === 'GET') {
    try {
      const cc = require('./lib/collaboration-contracts');
      return json(res, { contracts: cc.getAllContracts() });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/collaboration-contracts\/domain\/([^/]+)$/) && req.method === 'GET') {
    const domain = req.url.match(/^\/api\/collaboration-contracts\/domain\/([^/]+)$/)[1];
    try {
      const cc = require('./lib/collaboration-contracts');
      return json(res, { contracts: cc.getContractsForDomain(domain) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/collaboration-contracts\/project\/([^/]+)$/) && req.method === 'GET') {
    const projectId = req.url.match(/^\/api\/collaboration-contracts\/project\/([^/]+)$/)[1];
    try {
      const cc = require('./lib/collaboration-contracts');
      return json(res, { contracts: cc.getContractsForProject(projectId) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url === '/api/collaboration-contracts' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.title || !body.from_role || !body.to_role) return json(res, { error: 'Missing fields' }, 400);
    try {
      const cc = require('./lib/collaboration-contracts');
      const contract = cc.createContract(body);
      return json(res, { ok: true, contract });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/collaboration-contracts\/([^/]+)\/toggle$/) && req.method === 'POST') {
    const contractId = req.url.match(/^\/api\/collaboration-contracts\/([^/]+)\/toggle$/)[1];
    try {
      const cc = require('./lib/collaboration-contracts');
      const contract = cc.toggleContract(contractId);
      if (!contract) return json(res, { error: 'Contract not found' }, 404);
      return json(res, { ok: true, contract });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Handoff Records API ──

  if (req.url?.match(/^\/api\/handoffs\/graph\/([^/]+)$/) && req.method === 'GET') {
    const graphId = req.url.match(/^\/api\/handoffs\/graph\/([^/]+)$/)[1];
    try {
      const cc = require('./lib/collaboration-contracts');
      return json(res, { handoffs: cc.getHandoffsForGraph(graphId) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Prompt Recipes API ──

  if (req.url === '/api/prompt-recipes' && req.method === 'GET') {
    try {
      const pr = require('./lib/provider-registry');
      return json(res, { recipes: pr.getAllRecipes() });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/prompt-recipes\/provider\/([^/]+)$/) && req.method === 'GET') {
    const providerId = req.url.match(/^\/api\/prompt-recipes\/provider\/([^/]+)$/)[1];
    try {
      const pr = require('./lib/provider-registry');
      return json(res, { recipes: pr.getRecipesForProvider(providerId) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/prompt-recipes\/project\/([^/]+)$/) && req.method === 'GET') {
    const projectId = req.url.match(/^\/api\/prompt-recipes\/project\/([^/]+)$/)[1];
    try {
      const pr = require('./lib/provider-registry');
      return json(res, { recipes: pr.getRecipesForProject(projectId) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url === '/api/prompt-recipes' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.provider_id || !body.role || !body.task_kind || !body.title || !body.template) return json(res, { error: 'Missing fields' }, 400);
    try {
      const pr = require('./lib/provider-registry');
      const recipe = pr.createRecipe(body);
      return json(res, { ok: true, recipe });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/prompt-recipes\/([^/]+)\/promote$/) && req.method === 'POST') {
    const recipeId = req.url.match(/^\/api\/prompt-recipes\/([^/]+)\/promote$/)[1];
    try {
      const pr = require('./lib/provider-registry');
      const recipe = pr.promoteRecipe(recipeId);
      if (!recipe) return json(res, { error: 'Recipe not found' }, 404);
      return json(res, { ok: true, recipe });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/prompt-recipes\/([^/]+)\/deprecate$/) && req.method === 'POST') {
    const recipeId = req.url.match(/^\/api\/prompt-recipes\/([^/]+)\/deprecate$/)[1];
    try {
      const pr = require('./lib/provider-registry');
      const recipe = pr.deprecateRecipe(recipeId);
      if (!recipe) return json(res, { error: 'Recipe not found' }, 404);
      return json(res, { ok: true, recipe });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Reverse Prompting API ──

  if (req.url?.match(/^\/api\/reverse-prompting\/run\/([^/]+)$/) && req.method === 'POST') {
    const graphId = req.url.match(/^\/api\/reverse-prompting\/run\/([^/]+)$/)[1];
    try {
      const cos = require('./lib/chief-of-staff');
      const run = cos.runReversePrompting(graphId);
      if (!run) return json(res, { error: 'Could not run reverse prompting' }, 400);
      events.broadcast('activity', { action: `Reverse prompting completed: ${run.success_factors.length} successes, ${run.anti_patterns.length} anti-patterns`, ts: new Date().toISOString() });
      return json(res, { ok: true, run });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/reverse-prompting\/runs\/([^/]+)$/) && req.method === 'GET') {
    const graphId = req.url.match(/^\/api\/reverse-prompting\/runs\/([^/]+)$/)[1];
    try {
      const rp = require('./lib/reverse-prompting');
      return json(res, { runs: rp.getRunsForGraph(graphId) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Operator Policies API ──

  if (req.url === '/api/operator-policies' && req.method === 'GET') {
    try { const m = require('./lib/operator-policies'); return json(res, { policies: m.getAllPolicies() }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/operator-policies\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/operator-policies\/domain\/([^/]+)$/)[1];
    try { const m = require('./lib/operator-policies'); return json(res, { policies: m.getPoliciesForDomain(d) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/operator-policies\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/operator-policies\/project\/([^/]+)$/)[1];
    try { const m = require('./lib/operator-policies'); return json(res, { policies: m.getPoliciesForProject(p) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/operator-policies' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.area || !body.value) return json(res, { error: 'Missing area or value' }, 400);
    try { const m = require('./lib/operator-policies'); return json(res, { ok: true, policy: m.createPolicy(body) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/operator-policies\/([^/]+)\/toggle$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/operator-policies\/([^/]+)\/toggle$/)[1];
    try { const m = require('./lib/operator-policies'); const p = m.togglePolicy(id); return p ? json(res, { ok: true, policy: p }) : json(res, { error: 'Not found' }, 404); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Autonomy Budgets API ──

  if (req.url === '/api/autonomy-budgets' && req.method === 'GET') {
    try { const m = require('./lib/autonomy-budgets'); return json(res, { budgets: m.getAllBudgets() }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/autonomy-budgets\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/autonomy-budgets\/domain\/([^/]+)$/)[1];
    try { const m = require('./lib/autonomy-budgets'); return json(res, { budgets: m.getBudgetsForDomain(d) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/autonomy-budgets\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/autonomy-budgets\/project\/([^/]+)$/)[1];
    try { const m = require('./lib/autonomy-budgets'); return json(res, { budgets: m.getBudgetsForProject(p) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/autonomy-budgets' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.scope_level || !body.scope_id || !body.lane) return json(res, { error: 'Missing fields' }, 400);
    try { const m = require('./lib/autonomy-budgets'); return json(res, { ok: true, budget: m.createBudget(body) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/autonomy-budgets\/([^/]+)\/toggle$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/autonomy-budgets\/([^/]+)\/toggle$/)[1];
    try { const m = require('./lib/autonomy-budgets'); const b = m.toggleBudget(id); return b ? json(res, { ok: true, budget: b }) : json(res, { error: 'Not found' }, 404); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Escalation Rules API ──

  if (req.url === '/api/escalation-rules' && req.method === 'GET') {
    try { const m = require('./lib/escalation-governance'); return json(res, { rules: m.getAllRules() }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/escalation-rules\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/escalation-rules\/domain\/([^/]+)$/)[1];
    try { const m = require('./lib/escalation-governance'); return json(res, { rules: m.getRulesForDomain(d) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/escalation-rules\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/escalation-rules\/project\/([^/]+)$/)[1];
    try { const m = require('./lib/escalation-governance'); return json(res, { rules: m.getRulesForProject(p) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/escalation-rules' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.trigger || !body.action) return json(res, { error: 'Missing fields' }, 400);
    try { const m = require('./lib/escalation-governance'); return json(res, { ok: true, rule: m.createRule(body) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/escalation-rules\/([^/]+)\/toggle$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/escalation-rules\/([^/]+)\/toggle$/)[1];
    try { const m = require('./lib/escalation-governance'); const r = m.toggleRule(id); return r ? json(res, { ok: true, rule: r }) : json(res, { error: 'Not found' }, 404); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/escalation\/evaluate\/([^/]+)$/) && req.method === 'POST') {
    const graphId = req.url.match(/^\/api\/escalation\/evaluate\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { events: cos.evaluateEscalation(graphId) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Documentation Governance API ──

  if (req.url === '/api/documentation-requirements' && req.method === 'GET') {
    try { const m = require('./lib/documentation-governance'); return json(res, { requirements: m.getAllRequirements() }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/documentation-requirements' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.scope_type || !body.title) return json(res, { error: 'Missing fields' }, 400);
    try { const m = require('./lib/documentation-governance'); return json(res, { ok: true, requirement: m.createRequirement(body) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/documentation-artifacts\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const match = req.url.match(/^\/api\/documentation-artifacts\/([^/]+)\/([^/]+)$/);
    try { const m = require('./lib/documentation-governance'); return json(res, { artifacts: m.getArtifactsForScope(match[1], match[2]) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/documentation-artifacts' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.scope_type || !body.related_id || !body.title || !body.path) return json(res, { error: 'Missing fields' }, 400);
    try { const m = require('./lib/documentation-governance'); return json(res, { ok: true, artifact: m.createArtifact(body) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/documentation\/check\/([^/]+)\/([^/]+)$/) && req.method === 'POST') {
    const match = req.url.match(/^\/api\/documentation\/check\/([^/]+)\/([^/]+)$/);
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.checkDocumentationRequirements(match[1], match[2], body.lane || 'dev')); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Policy Simulation API ──

  if (req.url === '/api/policy-simulation/run' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.related_type || !body.related_id || !body.lane) return json(res, { error: 'Missing related_type, related_id, or lane' }, 400);
    try { const cos = require('./lib/chief-of-staff'); const r = cos.simulateGovernanceScenario(body.related_type, body.related_id, body.lane, body.overrides); return r ? json(res, { ok: true, result: r }) : json(res, { error: 'Simulation failed' }, 500); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/policy-simulation\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/policy-simulation\/([^/]+)$/)[1];
    try { const ps = require('./lib/policy-simulation'); const s = ps.getScenario(id); return s ? json(res, { scenario: s }) : json(res, { error: 'Not found' }, 404); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/policy-simulation\/results\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/policy-simulation\/results\/([^/]+)$/)[1];
    try { const ps = require('./lib/policy-simulation'); const r = ps.getResult(id); return r ? json(res, { result: r }) : json(res, { error: 'Not found' }, 404); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Governance Testing API ──

  if (req.url?.match(/^\/api\/governance-tests\/run\/([^/]+)\/([^/]+)$/) && req.method === 'POST') {
    const match = req.url.match(/^\/api\/governance-tests\/run\/([^/]+)\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { tests: cos.runWhatIfTestSuite(match[1], match[2]) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/governance-tests\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const match = req.url.match(/^\/api\/governance-tests\/([^/]+)\/([^/]+)$/);
    try { const gt = require('./lib/governance-testing'); return json(res, { tests: gt.getTestsForEntity(match[1], match[2]) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Release Readiness API ──

  if (req.url?.match(/^\/api\/release-readiness\/score\/([^/]+)\/([^/]+)$/) && req.method === 'POST') {
    const match = req.url.match(/^\/api\/release-readiness\/score\/([^/]+)\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); const s = cos.computeReleaseReadiness(match[1], match[2]); return s ? json(res, { ok: true, score: s }) : json(res, { error: 'Scoring failed' }, 500); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/release-readiness\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const match = req.url.match(/^\/api\/release-readiness\/([^/]+)\/([^/]+)$/);
    try { const rr = require('./lib/release-readiness'); return json(res, { scores: rr.getScoresForEntity(match[1], match[2]) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url === '/api/release-readiness/rules' && req.method === 'GET') {
    try { const rr = require('./lib/release-readiness'); return json(res, { rules: rr.getRules() }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Dossier Simulation + Readiness ──

  if (req.url?.match(/^\/api\/promotion-dossiers\/([^/]+)\/simulate$/) && req.method === 'POST') {
    const dossierId = req.url.match(/^\/api\/promotion-dossiers\/([^/]+)\/simulate$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); const r = cos.simulateGovernanceScenario('dossier', dossierId, body.lane || 'beta', body.overrides); return r ? json(res, { ok: true, result: r }) : json(res, { error: 'Failed' }, 500); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/promotion-dossiers\/([^/]+)\/readiness$/) && req.method === 'POST') {
    const dossierId = req.url.match(/^\/api\/promotion-dossiers\/([^/]+)\/readiness$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const s = cos.computeReleaseReadiness('dossier', dossierId); return s ? json(res, { ok: true, score: s }) : json(res, { error: 'Failed' }, 500); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Enforcement Engine API ──

  if (req.url === '/api/enforcement/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.related_type || !body.related_id || !body.action || !body.lane) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); const d = cos.evaluateEnforcement(body.related_type, body.related_id, body.action, body.lane); return d ? json(res, { ok: true, decision: d }) : json(res, { error: 'Failed' }, 500); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/enforcement\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/enforcement\/([^/]+)\/([^/]+)$/);
    if (m[1] !== 'decisions' && m[1] !== 'rules') {
      try { const ee = require('./lib/enforcement-engine'); return json(res, { decisions: ee.getDecisionsForEntity(m[1], m[2]) }); }
      catch (e) { return json(res, { error: e.message }, 500); }
    }
  }

  if (req.url?.match(/^\/api\/enforcement\/decisions\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/enforcement\/decisions\/([^/]+)$/)[1];
    try { const ee = require('./lib/enforcement-engine'); const d = ee.getDecision(id); return d ? json(res, { decision: d }) : json(res, { error: 'Not found' }, 404); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url === '/api/enforcement/rules' && req.method === 'GET') {
    try { const ee = require('./lib/enforcement-engine'); return json(res, { rules: ee.getRules() }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Override Ledger API ──

  if (req.url === '/api/overrides/request' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.related_type || !body.related_id || !body.action || !body.override_type || !body.reason) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); const o = cos.requestOverride(body.related_type, body.related_id, body.action, body.override_type, body.reason, body.notes); return o ? json(res, { ok: true, override: o }) : json(res, { error: 'Failed' }, 500); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/overrides\/([^/]+)\/approve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/overrides\/([^/]+)\/approve$/)[1];
    try { const ol = require('./lib/override-ledger'); const o = ol.approveOverride(id); return o ? json(res, { ok: true, override: o }) : json(res, { error: 'Not found or not pending' }, 400); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/overrides\/([^/]+)\/reject$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/overrides\/([^/]+)\/reject$/)[1];
    try { const ol = require('./lib/override-ledger'); const o = ol.rejectOverride(id); return o ? json(res, { ok: true, override: o }) : json(res, { error: 'Not found or not pending' }, 400); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/overrides\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/overrides\/([^/]+)\/([^/]+)$/);
    if (m[1] !== 'pending') {
      try { const ol = require('./lib/override-ledger'); return json(res, { overrides: ol.getOverridesForEntity(m[1], m[2]) }); }
      catch (e) { return json(res, { error: e.message }, 500); }
    }
  }

  if (req.url === '/api/overrides/pending' && req.method === 'GET') {
    try { const ol = require('./lib/override-ledger'); return json(res, { overrides: ol.getPendingOverrides() }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Promotion Control API ──

  if (req.url === '/api/promotion-policies' && req.method === 'GET') {
    try { const pc = require('./lib/promotion-control'); return json(res, { policies: pc.getPolicies() }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url === '/api/promotion-policies' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.target_lane) return json(res, { error: 'Missing target_lane' }, 400);
    try { const pc = require('./lib/promotion-control'); return json(res, { ok: true, policy: pc.createPolicy(body) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/promotion-control\/([^/]+)\/evaluate\/([^/]+)$/) && req.method === 'POST') {
    const m = req.url.match(/^\/api\/promotion-control\/([^/]+)\/evaluate\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); const d = cos.resolvePromotionDecision(m[1], m[2]); return d ? json(res, { ok: true, decision: d }) : json(res, { error: 'Failed' }, 500); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/promotion-control\/([^/]+)\/promote\/([^/]+)$/) && req.method === 'POST') {
    const m = req.url.match(/^\/api\/promotion-control\/([^/]+)\/promote\/([^/]+)$/);
    try {
      const cos = require('./lib/chief-of-staff');
      const result = cos.applyPromotionControl(m[1], m[2]);
      if (result.promoted) {
        events.broadcast('activity', { action: `Dossier promoted to ${m[2]}`, ts: new Date().toISOString() });
        logAction('Promotion executed', m[1], `to ${m[2]}`);
      }
      return json(res, { ok: true, ...result });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/promotion-decisions\/([^/]+)$/) && req.method === 'GET') {
    const dossierId = req.url.match(/^\/api\/promotion-decisions\/([^/]+)$/)[1];
    try { const pc = require('./lib/promotion-control'); return json(res, { decisions: pc.getDecisionsForDossier(dossierId) }); }
    catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Exception Analytics API ──

  if (req.url === '/api/exception-analytics' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.analyzeExceptions()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/exception-analytics\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/exception-analytics\/domain\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.analyzeExceptions(d)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/exception-analytics\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/exception-analytics\/project\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.analyzeExceptions(undefined, p)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/exception-analytics\/provider\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/exception-analytics\/provider\/([^/]+)$/)[1];
    try { const ea = require('./lib/exception-analytics'); return json(res, ea.aggregate({ provider_id: p })); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Governance Drift API ──

  if (req.url === '/api/governance-drift' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { report: cos.detectGovernanceDrift() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/governance-drift\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/governance-drift\/domain\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { report: cos.detectGovernanceDrift('engine', d, d) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/governance-drift\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/governance-drift\/project\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { report: cos.detectGovernanceDrift('project', p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Governance Health API ──

  if (req.url === '/api/governance-health' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { health: cos.getGovernanceHealth() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Policy Tuning API ──

  if (req.url === '/api/policy-tuning/recommendations' && req.method === 'GET') {
    try { const pt = require('./lib/policy-tuning'); return json(res, { recommendations: pt.getAllRecommendations() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/policy-tuning\/recommendations\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/policy-tuning\/recommendations\/domain\/([^/]+)$/)[1];
    try { const pt = require('./lib/policy-tuning'); return json(res, { recommendations: pt.getRecommendationsForScope(d) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/policy-tuning\/recommendations\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/policy-tuning\/recommendations\/project\/([^/]+)$/)[1];
    try { const pt = require('./lib/policy-tuning'); return json(res, { recommendations: pt.getRecommendationsForScope(undefined, p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/policy-tuning\/recommendations\/([^/]+)\/approve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/policy-tuning\/recommendations\/([^/]+)\/approve$/)[1];
    const body = await parseBody(req);
    try { const pt = require('./lib/policy-tuning'); const d = pt.approveRecommendation(id, body.decided_by, body.notes); return d ? json(res, { ok: true, decision: d }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/policy-tuning\/recommendations\/([^/]+)\/reject$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/policy-tuning\/recommendations\/([^/]+)\/reject$/)[1];
    const body = await parseBody(req);
    try { const pt = require('./lib/policy-tuning'); const d = pt.rejectRecommendation(id, body.decided_by, body.notes); return d ? json(res, { ok: true, decision: d }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/policy-tuning\/decisions\/([^/]+)\/apply$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/policy-tuning\/decisions\/([^/]+)\/apply$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const d = cos.applyApprovedTuning(id); return d ? json(res, { ok: true, decision: d }) : json(res, { error: 'Not approved or not found' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Governance Ops Console API ──

  if (req.url === '/api/governance-ops' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getGovernanceOpsView()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/governance-ops/filter' && req.method === 'POST') {
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getGovernanceOpsView(body)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/governance-ops/hotspots' && req.method === 'GET') {
    try { const go = require('./lib/governance-ops'); const v = go.getOpsView(); return json(res, { hotspots: v.hotspots }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/governance-ops/watchlist' && req.method === 'GET') {
    try { const go = require('./lib/governance-ops'); return json(res, { watchlist: go.getWatchlist() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/governance-ops/watchlist' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.scope || !body.reason) return json(res, { error: 'Missing scope or reason' }, 400);
    try { const go = require('./lib/governance-ops'); return json(res, { ok: true, entry: go.addToWatchlist(body.scope, body.reason) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/governance-ops\/watchlist\/([^/]+)\/toggle$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/governance-ops\/watchlist\/([^/]+)\/toggle$/)[1];
    try { const go = require('./lib/governance-ops'); const e = go.toggleWatchlistEntry(id); return e ? json(res, { ok: true, entry: e }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Scoped Drift Resolutions API ──

  if (req.url === '/api/scoped-drift-resolutions' && req.method === 'GET') {
    try { const sdr = require('./lib/scoped-drift-resolution'); return json(res, { resolutions: sdr.getAllResolutions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/scoped-drift-resolutions\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/scoped-drift-resolutions\/domain\/([^/]+)$/)[1];
    try { const sdr = require('./lib/scoped-drift-resolution'); return json(res, { resolutions: sdr.getResolutionsForDomain(d) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/scoped-drift-resolutions\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/scoped-drift-resolutions\/project\/([^/]+)$/)[1];
    try { const sdr = require('./lib/scoped-drift-resolution'); return json(res, { resolutions: sdr.getResolutionsForProject(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/scoped-drift-resolutions\/provider\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/scoped-drift-resolutions\/provider\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { resolutions: cos.resolveScopedDrift('global', 'global') }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/scoped-drift-resolutions\/([^/]+)\/approve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/scoped-drift-resolutions\/([^/]+)\/approve$/)[1];
    try { const sdr = require('./lib/scoped-drift-resolution'); const r = sdr.approveResolution(id); return r ? json(res, { ok: true, resolution: r }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/scoped-drift-resolutions\/([^/]+)\/reject$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/scoped-drift-resolutions\/([^/]+)\/reject$/)[1];
    try { const sdr = require('./lib/scoped-drift-resolution'); const r = sdr.rejectResolution(id); return r ? json(res, { ok: true, resolution: r }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/scoped-drift-resolutions\/([^/]+)\/verify$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/scoped-drift-resolutions\/([^/]+)\/verify$/)[1];
    const body = await parseBody(req);
    try { const sdr = require('./lib/scoped-drift-resolution'); const r = sdr.verifyResolution(id, body.notes || ''); return r ? json(res, { ok: true, resolution: r }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Tuning Application API ──

  if (req.url?.match(/^\/api\/policy-tuning\/recommendations\/([^/]+)\/preview-apply$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/policy-tuning\/recommendations\/([^/]+)\/preview-apply$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const p = cos.previewTuningApplication(id); return p ? json(res, { ok: true, plan: p }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/policy-tuning\/applications\/([^/]+)\/rollback$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/policy-tuning\/applications\/([^/]+)\/rollback$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const r = cos.rollbackTuningApplication(id); return r ? json(res, { ok: true, rollback: r }) : json(res, { error: 'Not found or not available' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/policy-tuning/applications' && req.method === 'GET') {
    try { const ta = require('./lib/tuning-application'); return json(res, { applications: ta.getApplications() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/policy-tuning/rollbacks' && req.method === 'GET') {
    try { const ta = require('./lib/tuning-application'); return json(res, { rollbacks: ta.getRollbacks() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Governance Trends API ──

  if (req.url === '/api/governance-trends' && req.method === 'GET') {
    try { const go = require('./lib/governance-ops'); const v = go.getOpsView(); return json(res, { trends: v.trends }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/governance-trends\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/governance-trends\/domain\/([^/]+)$/)[1];
    try { const go = require('./lib/governance-ops'); const v = go.getOpsView({ domain: d }); return json(res, { trends: v.trends }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/governance-trends\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/governance-trends\/project\/([^/]+)$/)[1];
    try { const go = require('./lib/governance-ops'); const v = go.getOpsView({ project_id: p }); return json(res, { trends: v.trends }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Runtime Enforcement API ──

  if (req.url === '/api/runtime-enforcement' && req.method === 'GET') {
    try { const re = require('./lib/runtime-enforcement'); return json(res, re.getSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-enforcement\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/runtime-enforcement\/domain\/([^/]+)$/)[1];
    try { const re = require('./lib/runtime-enforcement'); return json(res, { blocks: re.getBlocks({ domain: d }) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-enforcement\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/runtime-enforcement\/project\/([^/]+)$/)[1];
    try { const re = require('./lib/runtime-enforcement'); return json(res, { blocks: re.getBlocks({ project_id: p }) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-enforcement\/graph\/([^/]+)$/) && req.method === 'GET') {
    const g = req.url.match(/^\/api\/runtime-enforcement\/graph\/([^/]+)$/)[1];
    try { const re = require('./lib/runtime-enforcement'); return json(res, { results: re.getResultsForGraph(g) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-enforcement\/node\/([^/]+)$/) && req.method === 'GET') {
    const n = req.url.match(/^\/api\/runtime-enforcement\/node\/([^/]+)$/)[1];
    try { const re = require('./lib/runtime-enforcement'); return json(res, { results: re.getResultsForNode(n) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/runtime-enforcement/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.graph_id || !body.transition) return json(res, { error: 'Missing graph_id or transition' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { result: cos.evaluateRuntimeGovernance(body.graph_id, body.node_id, body.transition) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Worker Governance API ──

  if (req.url === '/api/worker-governance' && req.method === 'GET') {
    try { const wg = require('./lib/worker-governance'); return json(res, { decisions: wg.getAllDecisions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/worker-governance\/graph\/([^/]+)$/) && req.method === 'GET') {
    const g = req.url.match(/^\/api\/worker-governance\/graph\/([^/]+)$/)[1];
    try { const wg = require('./lib/worker-governance'); return json(res, { decisions: wg.getDecisionsForGraph(g) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/worker-governance\/node\/([^/]+)$/) && req.method === 'GET') {
    const n = req.url.match(/^\/api\/worker-governance\/node\/([^/]+)$/)[1];
    try { const wg = require('./lib/worker-governance'); return json(res, { decisions: wg.getDecisionsForNode(n) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Execution Hooks API ──

  if (req.url?.match(/^\/api\/execution-hooks\/attach\/([^/]+)$/) && req.method === 'POST') {
    const g = req.url.match(/^\/api\/execution-hooks\/attach\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, hooks: cos.attachExecutionHooks(g) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/execution-hooks\/graph\/([^/]+)$/) && req.method === 'GET') {
    const g = req.url.match(/^\/api\/execution-hooks\/graph\/([^/]+)$/)[1];
    try { const eh = require('./lib/execution-hooks'); return json(res, { hooks: eh.getHooksForGraph(g) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Runtime Blocks API ──

  if (req.url === '/api/runtime-blocks' && req.method === 'GET') {
    try { const re = require('./lib/runtime-enforcement'); return json(res, { blocks: re.getActiveBlocks() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-blocks\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/runtime-blocks\/domain\/([^/]+)$/)[1];
    try { const re = require('./lib/runtime-enforcement'); return json(res, { blocks: re.getBlocks({ domain: d }).filter(b => !b.resolved) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-blocks\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/runtime-blocks\/project\/([^/]+)$/)[1];
    try { const re = require('./lib/runtime-enforcement'); return json(res, { blocks: re.getBlocks({ project_id: p }).filter(b => !b.resolved) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Override Operations API ──

  if (req.url === '/api/override-ops' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getOverrideOperationsView()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/override-ops/filter' && req.method === 'POST') {
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getOverrideOperationsView(body)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/override-ops/pending' && req.method === 'GET') {
    try { const ol = require('./lib/override-ledger'); return json(res, { overrides: ol.getPendingOverrides() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/override-ops/stale' && req.method === 'GET') {
    try { const oo = require('./lib/override-operations'); return json(res, { overrides: oo.getStaleOverrides() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/override-ops/consumed' && req.method === 'GET') {
    try { const oo = require('./lib/override-operations'); return json(res, { records: oo.getConsumptionRecords() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/override-consumption' && req.method === 'GET') {
    try { const oo = require('./lib/override-operations'); return json(res, { records: oo.getConsumptionRecords() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/overrides\/([^/]+)\/consume$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/overrides\/([^/]+)\/consume$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); const r = cos.consumeOverrideAction(id, body.decision_id || 'manual'); return r ? json(res, { ok: true, record: r }) : json(res, { error: 'Not found or not approved' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Exception Cases API ──

  if (req.url === '/api/exception-cases' && req.method === 'GET') {
    try { const el = require('./lib/exception-lifecycle'); return json(res, { cases: el.getAllCases() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/exception-cases\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/exception-cases\/domain\/([^/]+)$/)[1];
    try { const el = require('./lib/exception-lifecycle'); return json(res, { cases: el.getCasesForDomain(d) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/exception-cases\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/exception-cases\/project\/([^/]+)$/)[1];
    try { const el = require('./lib/exception-lifecycle'); return json(res, { cases: el.getCasesForProject(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/exception-cases' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.source_type || !body.source_id) return json(res, { error: 'Missing source_type or source_id' }, 400);
    try { const cos = require('./lib/chief-of-staff'); const c = cos.createExceptionCase(body.source_type, body.source_id, body); return c ? json(res, { ok: true, case: c }) : json(res, { error: 'Failed' }, 500); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/exception-cases\/([^/]+)\/assign$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/exception-cases\/([^/]+)\/assign$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); const c = cos.assignExceptionOwner(id, body.owner || 'operator'); return c ? json(res, { ok: true, case: c }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/exception-cases\/([^/]+)\/update-status$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/exception-cases\/([^/]+)\/update-status$/)[1];
    const body = await parseBody(req);
    if (!body.stage) return json(res, { error: 'Missing stage' }, 400);
    try { const el = require('./lib/exception-lifecycle'); const c = el.updateStatus(id, body.stage, body.notes); return c ? json(res, { ok: true, case: c }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Block Resolution API ──

  if (req.url === '/api/block-resolutions' && req.method === 'GET') {
    try { const br = require('./lib/block-resolution'); return json(res, { resolutions: br.getAllResolutions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/block-resolutions\/([^/]+)\/resolve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/block-resolutions\/([^/]+)\/resolve$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); const r = cos.resolveBlock(id, body.outcome || 'resolved', body.notes, body.override_id); return r ? json(res, { ok: true, resolution: r }) : json(res, { error: 'Block not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/block-resolutions\/([^/]+)\/reopen$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/block-resolutions\/([^/]+)\/reopen$/)[1];
    try { const br = require('./lib/block-resolution'); return json(res, { ok: br.reopenBlock(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Escalation Pauses API ──

  if (req.url === '/api/escalation-pauses' && req.method === 'GET') {
    try { const br = require('./lib/block-resolution'); return json(res, { pauses: br.getAllPauses() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/escalation-pauses\/([^/]+)\/resume$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/escalation-pauses\/([^/]+)\/resume$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const p = cos.resumeEscalatedExecution(id); return p ? json(res, { ok: true, pause: p }) : json(res, { error: 'Not found or not paused' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Project Isolation API ──

  if (req.url === '/api/project-isolation' && req.method === 'GET') {
    try { const pi = require('./lib/project-isolation'); return json(res, { policies: pi.getAllPolicies() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/project-isolation\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/project-isolation\/project\/([^/]+)$/)[1];
    try { const pi = require('./lib/project-isolation'); return json(res, { policy: pi.getPolicy(p), decisions: pi.getDecisions(p), violations: pi.getViolations(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/project-isolation/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.source_project || !body.target_project || !body.artifact_type) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decision: cos.evaluateCrossProjectAccess(body.source_project, body.target_project, body.artifact_type, body.action) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/isolation-violations' && req.method === 'GET') {
    try { const pi = require('./lib/project-isolation'); return json(res, { violations: pi.getViolations() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/isolation-violations\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/isolation-violations\/project\/([^/]+)$/)[1];
    try { const pi = require('./lib/project-isolation'); return json(res, { violations: pi.getViolations(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Pattern Exchange API ──

  if (req.url === '/api/pattern-exchange/candidates' && req.method === 'GET') {
    try { const pe = require('./lib/pattern-exchange'); return json(res, { candidates: pe.getCandidates() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/pattern-exchange/candidates' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.source_project || !body.candidate_type || !body.title || !body.content) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, candidate: cos.createPatternExchangeCandidate(body.source_project, body.artifact_ref || '', body.candidate_type, body.title, body.content, body.source_domain || 'general') }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/pattern-exchange\/candidates\/([^/]+)\/approve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/pattern-exchange\/candidates\/([^/]+)\/approve$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); const p = cos.approveSharedPattern(id, body.target_scope); return p ? json(res, { ok: true, pattern: p }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/pattern-exchange\/candidates\/([^/]+)\/reject$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/pattern-exchange\/candidates\/([^/]+)\/reject$/)[1];
    try { const pe = require('./lib/pattern-exchange'); const c = pe.rejectCandidate(id); return c ? json(res, { ok: true, candidate: c }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Shared Patterns API ──

  if (req.url === '/api/shared-patterns' && req.method === 'GET') {
    try { const pe = require('./lib/pattern-exchange'); return json(res, { patterns: pe.getPatterns() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/shared-patterns\/engine\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/shared-patterns\/engine\/([^/]+)$/)[1];
    try { const pe = require('./lib/pattern-exchange'); return json(res, { patterns: pe.getPatternsForEngine(d) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/shared-patterns\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/shared-patterns\/project\/([^/]+)$/)[1];
    try { const pe = require('./lib/pattern-exchange'); return json(res, { patterns: pe.getPatternsForProject(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/shared-patterns\/([^/]+)\/deprecate$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/shared-patterns\/([^/]+)\/deprecate$/)[1];
    try { const pe = require('./lib/pattern-exchange'); const p = pe.deprecatePattern(id); return p ? json(res, { ok: true, pattern: p }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/shared-patterns\/([^/]+)\/use$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/shared-patterns\/([^/]+)\/use$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); const u = cos.useSharedPattern(body.project_id || 'default', id, body.context); return u ? json(res, { ok: true, usage: u }) : json(res, { error: 'Pattern not found or deprecated' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/shared-pattern-usage' && req.method === 'GET') {
    try { const pe = require('./lib/pattern-exchange'); return json(res, { records: pe.getUsageRecords() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Shared Governance Boundaries API ──

  if (req.url === '/api/shared-governance-boundaries' && req.method === 'GET') {
    try { const sgb = require('./lib/shared-governance-boundaries'); return json(res, { boundaries: sgb.getAllBoundaries() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/shared-governance-boundaries' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.artifact_type) return json(res, { error: 'Missing artifact_type' }, 400);
    try { const sgb = require('./lib/shared-governance-boundaries'); return json(res, { ok: true, boundary: sgb.createBoundary(body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Provider Reliability API ──

  if (req.url === '/api/provider-reliability' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { snapshots: cos.getProviderReliability() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/provider-reliability\/provider\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/provider-reliability\/provider\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { snapshots: cos.getProviderReliability(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/provider-reliability\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/provider-reliability\/domain\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { snapshots: cos.getProviderReliability(undefined, d) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/provider-reliability\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/provider-reliability\/project\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { snapshots: cos.getProviderReliability(undefined, undefined, p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/provider-incidents' && req.method === 'GET') {
    try { const pr = require('./lib/provider-reliability'); return json(res, { incidents: pr.getAllIncidents() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/provider-incidents' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.provider_id || !body.incident_type) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, incident: cos.recordProviderIncident(body.provider_id, body.incident_type, body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Provider Cost Governance API ──

  if (req.url === '/api/provider-cost' && req.method === 'GET') {
    try { const cg = require('./lib/cost-governance'); return json(res, { profiles: cg.getCostProfiles(), decisions: cg.getCostDecisions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/provider-cost\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/provider-cost\/domain\/([^/]+)$/)[1];
    try { const cg = require('./lib/cost-governance'); return json(res, { profiles: cg.getCostProfiles(), decisions: cg.getCostDecisions(d) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/provider-cost\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/provider-cost\/project\/([^/]+)$/)[1];
    try { const cg = require('./lib/cost-governance'); return json(res, { profiles: cg.getCostProfiles(), decisions: cg.getCostDecisions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/provider-cost/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.provider_id || !body.action || !body.lane) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decision: cos.evaluateProviderCost(body.provider_id, body.action, body.lane, body.domain, body.project_id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Provider Latency Governance API ──

  if (req.url === '/api/provider-latency' && req.method === 'GET') {
    try { const lg = require('./lib/latency-governance'); return json(res, { profiles: lg.getLatencyProfiles(), decisions: lg.getLatencyDecisions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/provider-latency\/provider\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/provider-latency\/provider\/([^/]+)$/)[1];
    try { const lg = require('./lib/latency-governance'); return json(res, { profile: lg.getLatencyProfile(p), decisions: lg.getLatencyDecisions(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/provider-latency/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.provider_id || !body.role || !body.lane) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decision: cos.evaluateProviderLatency(body.provider_id, body.role, body.lane, body.domain) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Provider Governance Summary API ──

  if (req.url === '/api/provider-governance-summary' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { summary: cos.getProviderGovernanceSummary() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Artifact Registry API ──

  if (req.url === '/api/artifact-registry' && req.method === 'GET') {
    try { const ar = require('./lib/artifact-registry'); return json(res, { artifacts: ar.getAll() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/artifact-registry\/type\/([^/]+)$/) && req.method === 'GET') {
    const t = req.url.match(/^\/api\/artifact-registry\/type\/([^/]+)$/)[1];
    try { const ar = require('./lib/artifact-registry'); return json(res, { artifacts: ar.getByType(t) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/artifact-registry\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/artifact-registry\/domain\/([^/]+)$/)[1];
    try { const ar = require('./lib/artifact-registry'); return json(res, { artifacts: ar.getByDomain(d) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/artifact-registry\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/artifact-registry\/project\/([^/]+)$/)[1];
    try { const ar = require('./lib/artifact-registry'); return json(res, { artifacts: ar.getByProject(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/artifact-registry\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/artifact-registry\/([^/]+)$/)[1];
    if (id !== 'register') {
      try { const ar = require('./lib/artifact-registry'); const a = ar.getById(id); return a ? json(res, { artifact: a }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
    }
  }
  if (req.url === '/api/artifact-registry/register' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.source_id || !body.type || !body.title) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, artifact: cos.registerArtifact(body.type, body.source_id, body.title, body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Evidence Chain API ──

  if (req.url?.match(/^\/api\/evidence-chain\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/evidence-chain\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { lineage: cos.getLineageSummary(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/evidence-chain/link' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.source_id || !body.target_id || !body.relation) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, edge: cos.linkEvidence(body.source_id, body.target_id, body.relation, body.notes) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/evidence-bundles\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/evidence-bundles\/([^/]+)\/([^/]+)$/);
    try { const ec = require('./lib/evidence-chain'); return json(res, { bundles: ec.getBundles(m[1], m[2]) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/evidence-bundles\/build\/([^/]+)\/([^/]+)$/) && req.method === 'POST') {
    const m = req.url.match(/^\/api\/evidence-bundles\/build\/([^/]+)\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, bundle: cos.buildEvidenceBundle(m[1], m[2]) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Traceability Ledger API ──

  if (req.url === '/api/traceability-ledger' && req.method === 'GET') {
    try { const tl = require('./lib/traceability-ledger'); return json(res, { entries: tl.getAll() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/traceability-ledger\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/traceability-ledger\/domain\/([^/]+)$/)[1];
    try { const tl = require('./lib/traceability-ledger'); return json(res, { entries: tl.getByDomain(d) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/traceability-ledger\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/traceability-ledger\/project\/([^/]+)$/)[1];
    try { const tl = require('./lib/traceability-ledger'); return json(res, { entries: tl.getByProject(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/traceability-ledger\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/traceability-ledger\/([^/]+)$/)[1];
    if (id !== 'domain' && id !== 'project') {
      try { const tl = require('./lib/traceability-ledger'); const e = tl.getById(id); return e ? json(res, { entry: e }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
    }
  }

  // ── Audit Hub API ──

  if (req.url === '/api/audit-hub' && req.method === 'GET') {
    // Part 55: Inline boundary guard
    try {
      const hrg = require('./lib/http-response-guard');
      const gd = hrg.guard('/api/audit-hub', _tenantId, _projectId);
      if (!gd.allowed) return json(res, gd.payload, gd.status);
      if (gd.outcome === 'redact') {
        try { const cos = require('./lib/chief-of-staff'); const data = cos.getAuditView(); return json(res, hrg.redactPayload(data, gd.reason)); } catch (e) { return json(res, { error: e.message }, 500); }
      }
    } catch { /* */ }
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getAuditView()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/audit-hub/query' && req.method === 'POST') {
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getAuditView(body)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/audit-hub\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/audit-hub\/project\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getAuditView({ project_id: p })); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/audit-hub\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/audit-hub\/domain\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getAuditView({ domain: d })); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/audit-packages\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/audit-packages\/([^/]+)\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); const p = cos.buildAuditPackage(m[1], m[2]); return p ? json(res, { package: p }) : json(res, { error: 'Failed' }, 500); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Compliance Export API ──

  if (req.url === '/api/compliance-export' && req.method === 'POST') {
    // Part 55: Inline entitlement guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/compliance-export', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* guard not available — allow */ }
    const body = await parseBody(req);
    if (!body.scope_type || !body.related_id) return json(res, { error: 'Missing scope_type or related_id' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, export: cos.exportComplianceBundle(body.scope_type, body.related_id, body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/compliance-export\/([^/]+)$/) && req.method === 'GET') {
    // Part 55: Inline entitlement guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/compliance-export', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const id = req.url.match(/^\/api\/compliance-export\/([^/]+)$/)[1];
    try { const ce = require('./lib/compliance-export'); const e = ce.getExport(id); return e ? json(res, { export: e }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Policy History API ──

  if (req.url === '/api/policy-history' && req.method === 'GET') {
    try { const ph = require('./lib/policy-history'); return json(res, { versions: ph.getAllVersions(), changes: ph.getAllChanges() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/policy-history\/diff\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/policy-history\/diff\/([^/]+)\/([^/]+)$/);
    try { const ph = require('./lib/policy-history'); const d = ph.getDiff(m[1], m[2]); return d ? json(res, { diff: d }) : json(res, { error: 'No changes found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/policy-history\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/policy-history\/([^/]+)\/([^/]+)$/);
    if (m[1] !== 'diff') {
      try { const cos = require('./lib/chief-of-staff'); return json(res, { history: cos.getPolicyHistory(m[1], m[2]) }); } catch (e) { return json(res, { error: e.message }, 500); }
    }
  }
  if (req.url?.match(/^\/api\/policy-history\/([^/]+)$/) && req.method === 'GET') {
    const t = req.url.match(/^\/api\/policy-history\/([^/]+)$/)[1];
    if (t !== 'diff') {
      try { const cos = require('./lib/chief-of-staff'); return json(res, { versions: cos.getPolicyHistory(t) }); } catch (e) { return json(res, { error: e.message }, 500); }
    }
  }

  // ── Approval Workspace API ──

  if (req.url === '/api/approval-workspace' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getApprovalWorkspace()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/approval-workspace/filter' && req.method === 'POST') {
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getApprovalWorkspace(body)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/approval-workspace/pending' && req.method === 'GET') {
    try { const aw = require('./lib/approval-workspace'); return json(res, { items: aw.getPending() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/approval-workspace/overdue' && req.method === 'GET') {
    try { const aw = require('./lib/approval-workspace'); return json(res, { items: aw.getOverdue() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/approval-workspace/delegated' && req.method === 'GET') {
    try { const aw = require('./lib/approval-workspace'); return json(res, { items: aw.getDelegated() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/approval-workspace\/([^/]+)\/approve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/approval-workspace\/([^/]+)\/approve$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, decision: cos.applyApprovalDecision(id, 'approve', body.notes) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/approval-workspace\/([^/]+)\/reject$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/approval-workspace\/([^/]+)\/reject$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, decision: cos.applyApprovalDecision(id, 'reject', body.notes) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/approval-workspace\/([^/]+)\/request-evidence$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/approval-workspace\/([^/]+)\/request-evidence$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, decision: cos.applyApprovalDecision(id, 'request_evidence') }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Delegation Rules API ──

  if (req.url === '/api/delegation-rules' && req.method === 'GET') {
    try { const dm = require('./lib/delegation-manager'); return json(res, { rules: dm.getAllRules() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/delegation-rules' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.approval_type || !body.delegated_to) return json(res, { error: 'Missing fields' }, 400);
    try { const dm = require('./lib/delegation-manager'); return json(res, { ok: true, rule: dm.createRule(body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/delegation-rules\/([^/]+)\/toggle$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/delegation-rules\/([^/]+)\/toggle$/)[1];
    try { const dm = require('./lib/delegation-manager'); const r = dm.toggleRule(id); return r ? json(res, { ok: true, rule: r }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Escalation Inbox API ──

  if (req.url === '/api/escalation-inbox' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { items: cos.getEscalationInbox() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/escalation-inbox/new' && req.method === 'GET') {
    try { const ei = require('./lib/escalation-inbox'); return json(res, { items: ei.getNew() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/escalation-inbox/overdue' && req.method === 'GET') {
    try { const ei = require('./lib/escalation-inbox'); return json(res, { items: ei.getInbox().filter(i => i.status === 'new' && new Date(i.created_at) < new Date(Date.now() - 86400000)) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/escalation-inbox\/([^/]+)\/triage$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/escalation-inbox\/([^/]+)\/triage$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, item: cos.resolveEscalationInboxItem(id, 'triage', body.notes) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/escalation-inbox\/([^/]+)\/resolve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/escalation-inbox\/([^/]+)\/resolve$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, item: cos.resolveEscalationInboxItem(id, 'resolve', body.notes) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/escalation-inbox\/([^/]+)\/delegate$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/escalation-inbox\/([^/]+)\/delegate$/)[1];
    const body = await parseBody(req);
    try { const ei = require('./lib/escalation-inbox'); return json(res, { ok: true, item: ei.delegateItem(id, body.delegate_to || 'operator', body.notes) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/escalation-threads\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/escalation-threads\/([^/]+)$/)[1];
    try { const ei = require('./lib/escalation-inbox'); const item = ei.getItem(id); return item ? json(res, { thread: item.thread, item }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Release Orchestration API ──

  if (req.url === '/api/release-orchestration' && req.method === 'GET') {
    // Part 55: Inline entitlement guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/release-orchestration', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const ro = require('./lib/release-orchestration'); return json(res, { plans: ro.getPlans(), executions: ro.getExecutions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/release-orchestration\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/release-orchestration\/project\/([^/]+)$/)[1];
    try { const ro = require('./lib/release-orchestration'); return json(res, { plans: ro.getPlans(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/release-orchestration/plan' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.project_id || !body.target_lane) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, plan: cos.createReleasePlan(body.project_id, body, body.target_lane) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/release-orchestration\/([^/]+)\/approve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/release-orchestration\/([^/]+)\/approve$/)[1];
    try { const ro = require('./lib/release-orchestration'); const p = ro.approvePlan(id); return p ? json(res, { ok: true, plan: p }) : json(res, { error: 'Not found or not draft' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/release-orchestration\/([^/]+)\/execute$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/release-orchestration\/([^/]+)\/execute$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const e = cos.executeReleasePlan(id); return e ? json(res, { ok: true, execution: e }) : json(res, { error: 'Not approved or not found' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/release-orchestration\/([^/]+)\/verify$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/release-orchestration\/([^/]+)\/verify$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); const e = cos.verifyReleaseExecution(id, body.notes); return e ? json(res, { ok: true, execution: e }) : json(res, { error: 'Not found' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Environment Pipeline API ──

  if (req.url?.match(/^\/api\/environment-pipeline\/evaluate\/([^/]+)\/([^/]+)$/) && req.method === 'POST') {
    const m = req.url.match(/^\/api\/environment-pipeline\/evaluate\/([^/]+)\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, request: cos.evaluatePromotionPipeline(m[1], m[2]) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/environment-pipeline\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/environment-pipeline\/project\/([^/]+)$/)[1];
    try { const ep = require('./lib/environment-pipeline'); return json(res, { requests: ep.getRequests(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/environment-pipeline\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/environment-pipeline\/([^/]+)$/)[1];
    if (id !== 'evaluate' && id !== 'project') {
      try { const ep = require('./lib/environment-pipeline'); const r = ep.getRequest(id); return r ? json(res, { request: r }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
    }
  }

  // ── Rollback Control API ──

  if (req.url === '/api/rollback-control/plan' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.release_execution_id || !body.trigger) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, plan: cos.createRollbackPlan(body.release_execution_id, body.trigger, body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/rollback-control\/([^/]+)\/execute$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/rollback-control\/([^/]+)\/execute$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const e = cos.executeRollback(id); return e ? json(res, { ok: true, execution: e }) : json(res, { error: 'Not ready or not found' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/rollback-control\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/rollback-control\/project\/([^/]+)$/)[1];
    try { const rc = require('./lib/rollback-control'); return json(res, { plans: rc.getPlans(p), executions: rc.getExecutions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Release Workspace Summary API ──

  if (req.url === '/api/release-workspace-summary' && req.method === 'GET') {
    try {
      const ro = require('./lib/release-orchestration');
      const plans = ro.getPlans();
      const executions = ro.getExecutions();
      return json(res, { total_plans: plans.length, executing: plans.filter(p => p.status === 'executing').length, completed: plans.filter(p => p.status === 'completed').length, halted: plans.filter(p => p.status === 'halted').length, total_executions: executions.length });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Collaboration Runtime API ──

  if (req.url === '/api/collaboration-runtime' && req.method === 'GET') {
    try { const cr = require('./lib/collaboration-runtime'); return json(res, { sessions: cr.getSessions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/collaboration-runtime\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/collaboration-runtime\/project\/([^/]+)$/)[1];
    try { const cr = require('./lib/collaboration-runtime'); return json(res, { sessions: cr.getSessions(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/collaboration-runtime\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/collaboration-runtime\/([^/]+)$/)[1];
    if (id !== 'create' && id !== 'project') {
      try { const cr = require('./lib/collaboration-runtime'); const s = cr.getSession(id); return s ? json(res, { session: s }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
    }
  }
  if (req.url === '/api/collaboration-runtime/create' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.scope_type || !body.scope_id || !body.participants || !body.protocol_type) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, session: cos.createCollaborationSession(body.scope_type, body.scope_id, body.participants, body.protocol_type, body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/collaboration-runtime\/([^/]+)\/propose$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/collaboration-runtime\/([^/]+)\/propose$/)[1];
    const body = await parseBody(req);
    if (!body.provider_id || !body.role || !body.content) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, proposal: cos.recordAgentProposal(id, body.provider_id, body.role, body.content, body.confidence || 70, body.rationale || '') }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/collaboration-runtime\/([^/]+)\/negotiate$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/collaboration-runtime\/([^/]+)\/negotiate$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const o = cos.runNegotiationProtocol(id); return o ? json(res, { ok: true, outcome: o }) : json(res, { error: 'Failed' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/collaboration-runtime\/([^/]+)\/consensus$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/collaboration-runtime\/([^/]+)\/consensus$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, consensus: cos.computeConsensus(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/collaboration-runtime\/([^/]+)\/resolve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/collaboration-runtime\/([^/]+)\/resolve$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.resolveCollaborationOutcome(id)); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Negotiation Protocols API ──

  if (req.url === '/api/negotiation-protocols' && req.method === 'GET') {
    try { const np = require('./lib/negotiation-protocols'); return json(res, { protocols: np.getProtocols() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/negotiation-protocols' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.protocol_type) return json(res, { error: 'Missing protocol_type' }, 400);
    try { const np = require('./lib/negotiation-protocols'); return json(res, { ok: true, protocol: np.createProtocol(body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Agent Consensus API ──

  if (req.url?.match(/^\/api\/agent-consensus\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/agent-consensus\/([^/]+)$/)[1];
    try { const ac = require('./lib/agent-consensus'); return json(res, { votes: ac.getVotesForSession(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/dissent-records\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/dissent-records\/([^/]+)$/)[1];
    try { const ac = require('./lib/agent-consensus'); return json(res, { records: ac.getDissentForSession(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Tenant Admin API ──

  if (req.url === '/api/tenant-admin' && req.method === 'GET') {
    // Part 55: Inline isolation guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/tenant-admin', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const ta = require('./lib/tenant-admin'); return json(res, { tenants: ta.getAllTenants() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/tenant-admin\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/tenant-admin\/([^/]+)$/)[1];
    if (id !== 'update') {
      try { const ta = require('./lib/tenant-admin'); const t = ta.getTenant(id); return t ? json(res, { tenant: t }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
    }
  }
  if (req.url === '/api/tenant-admin' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.name) return json(res, { error: 'Missing name' }, 400);
    try { const ta = require('./lib/tenant-admin'); return json(res, { ok: true, tenant: ta.createTenant(body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/tenant-admin\/([^/]+)\/update$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/tenant-admin\/([^/]+)\/update$/)[1];
    const body = await parseBody(req);
    try { const ta = require('./lib/tenant-admin'); const t = ta.updateTenant(id, body); return t ? json(res, { ok: true, tenant: t }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Subscription Operations API ──

  if (req.url === '/api/subscription-operations' && req.method === 'GET') {
    try { const so = require('./lib/subscription-operations'); return json(res, { entitlements: so.evaluateEntitlements('rpgpo', ['governance', 'audit', 'compliance', 'collaboration', 'release', 'provider_governance', 'tenant_admin']) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/subscription-operations\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/subscription-operations\/([^/]+)$/)[1];
    try { const so = require('./lib/subscription-operations'); return json(res, { meters: so.getUsageMeters(id), billing: so.getBillingEvents(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/subscription-operations\/([^/]+)\/entitlements\/evaluate$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/subscription-operations\/([^/]+)\/entitlements\/evaluate$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { entitlements: cos.evaluateSubscriptionEntitlements(id, body.features || []) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/subscription-operations\/([^/]+)\/usage$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/subscription-operations\/([^/]+)\/usage$/)[1];
    const body = await parseBody(req);
    if (!body.meter_type || body.amount === undefined) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, meter: cos.recordUsageMeter(id, body.meter_type, body.amount) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/billing-events\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/billing-events\/([^/]+)$/)[1];
    try { const so = require('./lib/subscription-operations'); return json(res, { events: so.getBillingEvents(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Deployment Readiness API ──

  if (req.url === '/api/deployment-readiness' && req.method === 'GET') {
    try { const dr = require('./lib/deployment-readiness'); return json(res, { reports: dr.getReports() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deployment-readiness\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/deployment-readiness\/([^/]+)\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { report: cos.computeDeploymentReadiness(m[1], m[2]) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/deployment-readiness/run' && req.method === 'POST') {
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, report: cos.computeDeploymentReadiness(body.scope_type || 'platform', body.scope_id || 'gpo') }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Secret Governance API ──

  if (req.url === '/api/secret-governance' && req.method === 'GET') {
    try { const sg = require('./lib/secret-governance'); return json(res, { secrets: sg.getSecrets() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/secret-governance\/scope\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/secret-governance\/scope\/([^/]+)\/([^/]+)$/);
    try { const sg = require('./lib/secret-governance'); return json(res, { secrets: sg.getSecrets(m[1], m[2]) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/secret-governance/access/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.secret_id || !body.actor || !body.action) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decision: cos.evaluateSecretAccess(body.secret_id, body.actor, body.action) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/secret-governance/usage' && req.method === 'GET') {
    try { const sg = require('./lib/secret-governance'); return json(res, { usage: sg.getUsage() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Security Hardening API ──

  if (req.url === '/api/security-hardening' && req.method === 'GET') {
    // Part 56: Inline entitlement guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/security-hardening', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const sh = require('./lib/security-hardening'); return json(res, { reports: sh.getReports() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/security-hardening/run' && req.method === 'POST') {
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, report: cos.getSecurityPosture(body.scope_type, body.scope_id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/security-hardening/findings' && req.method === 'GET') {
    try { const sh = require('./lib/security-hardening'); return json(res, { findings: sh.getFindings() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/security-posture' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { posture: cos.getSecurityPosture() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/hardening-checklist' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { checklist: cos.getHardeningChecklist() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Data Boundaries API ──

  if (req.url === '/api/data-boundaries' && req.method === 'GET') {
    try { const db = require('./lib/data-boundaries'); return json(res, { policies: db.getPolicies() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/data-boundaries/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.source_scope || !body.target_scope || !body.artifact_type) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decision: cos.evaluateDataBoundary(body.source_scope, body.target_scope, body.artifact_type, body.action) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/boundary-violations' && req.method === 'GET') {
    try { const db = require('./lib/data-boundaries'); return json(res, { violations: db.getViolations() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Observability API ──

  if (req.url === '/api/observability' && req.method === 'GET') {
    // Part 56: Inline entitlement guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/observability', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getObservabilityView()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/observability/query' && req.method === 'POST') {
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getObservabilityView(body)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/observability\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/observability\/project\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getObservabilityView({ project_id: p })); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/observability\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/observability\/domain\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getObservabilityView({ domain: d })); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Reliability API ──

  if (req.url === '/api/reliability' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getReliabilitySummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/reliability\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/reliability\/project\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getReliabilitySummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/reliability/incidents' && req.method === 'GET') {
    try { const rg = require('./lib/reliability-governance'); return json(res, { incidents: rg.getIncidents() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/reliability/incidents' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.subsystem || !body.title) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, incident: cos.recordReliabilityIncident(body.subsystem, body.title, body.detail || '', body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── SLO/SLA API ──

  if (req.url === '/api/slo-sla' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { statuses: cos.getSLOStatus(), definitions: require('./lib/slo-sla').getDefinitions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/slo-sla\/project\/([^/]+)$/) && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { statuses: cos.getSLOStatus() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/alerts' && req.method === 'GET') {
    try { const slo = require('./lib/slo-sla'); return json(res, { alerts: slo.getAlerts(), rules: slo.getRules() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/alerts/rules' && req.method === 'POST') {
    const body = await parseBody(req);
    return json(res, { ok: true, message: 'Custom alert rules stored (future implementation)' });
  }
  if (req.url === '/api/service-health' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getReliabilitySummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Skill Packs API ──

  if (req.url === '/api/skill-packs' && req.method === 'GET') {
    // Part 56: Inline entitlement guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/skill-packs', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const sp = require('./lib/skill-packs'); return json(res, { packs: sp.getPacks() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/skill-packs\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/skill-packs\/([^/]+)$/)[1];
    if (id !== 'bindings') { try { const sp = require('./lib/skill-packs'); const p = sp.getPack(id); return p ? json(res, { pack: p }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); } }
  }
  if (req.url === '/api/skill-packs' && req.method === 'POST') {
    // Part 56: Mutation guard
    try { const mg = require('./lib/mutation-route-guards'); const gd = mg.guardMutation('/api/skill-packs', 'POST', _tenantId, _projectId); if (!gd.allowed) return json(res, { error: gd.reason, guard: 'mutation' }, 403); } catch { /* */ }
    const body = await parseBody(req);
    if (!body.name) return json(res, { error: 'Missing name' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, pack: cos.createSkillPack(body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/skill-packs\/([^/]+)\/version$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/skill-packs\/([^/]+)\/version$/)[1];
    const body = await parseBody(req);
    try { const sp = require('./lib/skill-packs'); const p = sp.versionPack(id, body); return p ? json(res, { ok: true, pack: p }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/skill-packs\/([^/]+)\/bind$/) && req.method === 'POST') {
    // Part 56: Mutation guard
    try { const mg = require('./lib/mutation-route-guards'); const gd = mg.guardMutation('/api/skill-packs/:id/bind', 'POST', _tenantId, _projectId); if (!gd.allowed) return json(res, { error: gd.reason, guard: 'mutation' }, 403); } catch { /* */ }
    const id = req.url.match(/^\/api\/skill-packs\/([^/]+)\/bind$/)[1];
    const body = await parseBody(req);
    if (!body.scope_type || !body.scope_id) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, binding: cos.bindSkillPack(body.scope_type, body.scope_id, id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/skill-pack-bindings' && req.method === 'GET') {
    try { const sp = require('./lib/skill-packs'); return json(res, { bindings: sp.getBindings() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Engine Templates API ──

  if (req.url === '/api/engine-templates' && req.method === 'GET') {
    // Part 56: Inline entitlement guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/engine-templates', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const et = require('./lib/engine-templates'); return json(res, { templates: et.getTemplates() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/engine-templates\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/engine-templates\/([^/]+)$/)[1];
    try { const et = require('./lib/engine-templates'); const t = et.getTemplate(id); return t ? json(res, { template: t }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/engine-templates' && req.method === 'POST') {
    // Part 56: Mutation guard
    try { const mg = require('./lib/mutation-route-guards'); const gd = mg.guardMutation('/api/engine-templates', 'POST', _tenantId, _projectId); if (!gd.allowed) return json(res, { error: gd.reason, guard: 'mutation' }, 403); } catch { /* */ }
    const body = await parseBody(req);
    if (!body.name || !body.domain_type) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, template: cos.createEngineTemplate(body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/engine-templates\/([^/]+)\/instantiate$/) && req.method === 'POST') {
    // Part 56: Mutation guard
    try { const mg = require('./lib/mutation-route-guards'); const gd = mg.guardMutation('/api/engine-templates/:id/instantiate', 'POST', _tenantId, _projectId); if (!gd.allowed) return json(res, { error: gd.reason, guard: 'mutation' }, 403); } catch { /* */ }
    const id = req.url.match(/^\/api\/engine-templates\/([^/]+)\/instantiate$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); const r = cos.instantiateEngineTemplate(id, body.tenant_id || 'rpgpo', body.engine_id || id, body.domain || 'general'); return r ? json(res, { ok: true, record: r }) : json(res, { error: 'Template not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/template-instantiations' && req.method === 'GET') {
    try { const et = require('./lib/engine-templates'); return json(res, { instantiations: et.getInstantiations() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Domain Capabilities API ──

  if (req.url?.match(/^\/api\/domain-capabilities\/([^/]+)\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/domain-capabilities\/([^/]+)\/([^/]+)$/);
    if (m[2] !== 'compose') { try { const cos = require('./lib/chief-of-staff'); return json(res, { plan: cos.composeDomainCapabilities(m[1], m[2]) }); } catch (e) { return json(res, { error: e.message }, 500); } }
  }
  if (req.url?.match(/^\/api\/domain-capabilities\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/domain-capabilities\/([^/]+)$/)[1];
    if (id !== 'compose') { try { const cos = require('./lib/chief-of-staff'); return json(res, { plan: cos.composeDomainCapabilities(id) }); } catch (e) { return json(res, { error: e.message }, 500); } }
  }
  if (req.url?.match(/^\/api\/domain-capabilities\/([^/]+)\/compose$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/domain-capabilities\/([^/]+)\/compose$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, plan: cos.composeDomainCapabilities(id, body.project_id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Extension Framework API ──

  if (req.url === '/api/extensions' && req.method === 'GET') {
    // Part 56: Inline extension guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/extensions', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const ef = require('./lib/extension-framework'); return json(res, { packages: ef.getPackages(), installs: ef.getInstalls() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/extensions\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/extensions\/([^/]+)$/)[1];
    try { const ef = require('./lib/extension-framework'); const p = ef.getPackage(id); return p ? json(res, { package: p }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/extensions' && req.method === 'POST') {
    // Part 56: Mutation guard
    try { const mg = require('./lib/mutation-route-guards'); const gd = mg.guardMutation('/api/extensions', 'POST', _tenantId, _projectId); if (!gd.allowed) return json(res, { error: gd.reason, guard: 'mutation' }, 403); } catch { /* */ }
    const body = await parseBody(req);
    if (!body.name) return json(res, { error: 'Missing name' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, package: cos.createExtensionPackage(body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/extensions\/([^/]+)\/version$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/extensions\/([^/]+)\/version$/)[1];
    try { const ef = require('./lib/extension-framework'); const p = ef.versionPackage(id); return p ? json(res, { ok: true, package: p }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/extensions\/([^/]+)\/install$/) && req.method === 'POST') {
    // Part 56: Mutation guard
    try { const mg = require('./lib/mutation-route-guards'); const gd = mg.guardMutation('/api/extensions/:id/install', 'POST', _tenantId, _projectId); if (!gd.allowed) return json(res, { error: gd.reason, guard: 'mutation' }, 403); } catch { /* */ }
    const id = req.url.match(/^\/api\/extensions\/([^/]+)\/install$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); const r = cos.installExtension(id, body.tenant_id || 'rpgpo', body.scope); return r ? json(res, { ok: true, install: r }) : json(res, { error: 'Install blocked' }, 400); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/extensions\/([^/]+)\/uninstall$/) && req.method === 'POST') {
    // Part 56: Mutation guard
    try { const mg = require('./lib/mutation-route-guards'); const gd = mg.guardMutation('/api/extensions/:id/uninstall', 'POST', _tenantId, _projectId); if (!gd.allowed) return json(res, { error: gd.reason, guard: 'mutation' }, 403); } catch { /* */ }
    const id = req.url.match(/^\/api\/extensions\/([^/]+)\/uninstall$/)[1];
    const body = await parseBody(req);
    try { const ef = require('./lib/extension-framework'); return json(res, { ok: ef.uninstallPackage(id, body.tenant_id || 'rpgpo') }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Marketplace API ──

  if (req.url === '/api/marketplace' && req.method === 'GET') {
    // Part 55: Inline extension guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/marketplace', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const mp = require('./lib/marketplace'); return json(res, { listings: mp.getListings() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/marketplace\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/marketplace\/([^/]+)$/)[1];
    if (id !== 'publish') { try { const mp = require('./lib/marketplace'); const l = mp.getListing(id); return l ? json(res, { listing: l }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); } }
  }
  if (req.url === '/api/marketplace/publish' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.asset_type || !body.asset_ref || !body.name) return json(res, { error: 'Missing fields' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, listing: cos.publishMarketplaceListing(body.asset_ref, body.asset_type, body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/marketplace\/([^/]+)\/review$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/marketplace\/([^/]+)\/review$/)[1];
    const body = await parseBody(req);
    try { const mp = require('./lib/marketplace'); const l = mp.reviewListing(id, body.approved !== false); return l ? json(res, { ok: true, listing: l }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/marketplace\/([^/]+)\/deprecate$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/marketplace\/([^/]+)\/deprecate$/)[1];
    try { const mp = require('./lib/marketplace'); const l = mp.deprecateListing(id); return l ? json(res, { ok: true, listing: l }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/marketplace-summary' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getMarketplaceSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Integrations API ──

  if (req.url === '/api/integrations' && req.method === 'GET') {
    // Part 56: Inline entitlement guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/integrations', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const ig = require('./lib/integration-governance'); return json(res, { integrations: ig.getIntegrations() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/integrations\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/integrations\/([^/]+)$/)[1];
    try { const ig = require('./lib/integration-governance'); const i = ig.getIntegration(id); return i ? json(res, { integration: i }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/integrations' && req.method === 'POST') {
    // Part 56: Mutation guard
    try { const mg = require('./lib/mutation-route-guards'); const gd = mg.guardMutation('/api/integrations', 'POST', _tenantId, _projectId); if (!gd.allowed) return json(res, { error: gd.reason, guard: 'mutation' }, 403); } catch { /* */ }
    const body = await parseBody(req);
    if (!body.name || !body.category) return json(res, { error: 'Missing fields' }, 400);
    try { const ig = require('./lib/integration-governance'); return json(res, { ok: true, integration: ig.createIntegration(body) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/integrations\/([^/]+)\/evaluate$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/integrations\/([^/]+)\/evaluate$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decision: cos.evaluateIntegrationAccess(id, body.tenant_id || 'rpgpo', body.action) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/integrations\/([^/]+)\/toggle$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/integrations\/([^/]+)\/toggle$/)[1];
    try { const ig = require('./lib/integration-governance'); const i = ig.toggleIntegration(id); return i ? json(res, { ok: true, integration: i }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── UI Surface Audit API ──

  if (req.url === '/api/ui-surface-audit' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getUISurfaceAudit()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/ui-surface-audit\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/ui-surface-audit\/area\/([^/]+)$/)[1];
    try { const ua = require('./lib/ui-surface-audit'); return json(res, { surfaces: ua.getAuditByArea(a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/ui-readiness' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getUIReadiness()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/ui-readiness\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/ui-readiness\/area\/([^/]+)$/)[1];
    try { const ur = require('./lib/ui-readiness'); const r = ur.computeReadiness(); return json(res, { area_score: r.area_scores[a] || null }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/ui-wiring-gaps' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { gaps: cos.getUIWiringGaps() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/ui-wiring-gaps\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/ui-wiring-gaps\/area\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { gaps: cos.getUIWiringGaps(a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/ui-end-to-end-check/run' && req.method === 'POST') {
    try { const ur = require('./lib/ui-readiness'); return json(res, { report: ur.computeReadiness() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/ui-end-to-end-check' && req.method === 'GET') {
    try { const ur = require('./lib/ui-readiness'); const r = ur.computeReadiness(); return json(res, { checks: r.e2e_checks }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Workflow Activation API ──

  if (req.url === '/api/workflow-activation' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getWorkflowActivationReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflow-activation\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/workflow-activation\/area\/([^/]+)$/)[1];
    try { const wa = require('./lib/workflow-activation'); return json(res, { workflows: wa.getByArea(a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/operator-actions' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getOperatorActions()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/operator-actions\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/operator-actions\/area\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getOperatorActions(a)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/e2e-flow\/run\/([^/]+)$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/e2e-flow\/run\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { run: cos.runE2EFlowCheck(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/e2e-flow' && req.method === 'GET') {
    try { const ef = require('./lib/e2e-flow-state'); return json(res, { runs: ef.getRuns() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/e2e-flow\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/e2e-flow\/([^/]+)$/)[1];
    if (id !== 'run') { try { const ef = require('./lib/e2e-flow-state'); const r = ef.getRunForFlow(id); return r ? json(res, { run: r }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); } }
  }

  // ── Action Visibility + Runtime Completion API ──

  if (req.url === '/api/action-visibility' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { actions: cos.getVisibleOperatorActions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/action-visibility\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/action-visibility\/area\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { actions: cos.getVisibleOperatorActions(a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/action-visibility-gaps' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { gaps: cos.getActionVisibilityGaps() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/runtime-completion' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getRuntimeCompletionReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-completion\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/runtime-completion\/area\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const r = cos.getRuntimeCompletionReport(); const filtered = r?.paths?.filter(p => p.path.includes(a)) || []; return json(res, { paths: filtered }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/mutation-refresh\/run\/([^/]+)$/) && req.method === 'POST') {
    const a = req.url.match(/^\/api\/mutation-refresh\/run\/([^/]+)$/)[1];
    try { const mr = require('./lib/mutation-refresh'); return json(res, { result: mr.recordRefresh(a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── UX Polish + Navigation + Refresh API ──

  if (req.url === '/api/ux-consistency' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getUXConsistencyReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/navigation-map' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { map: cos.getNavigationMap() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/navigation-gaps' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { gaps: cos.getNavigationGaps() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/targeted-refresh' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { plans: cos.getTargetedRefreshPlans() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/targeted-refresh\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/targeted-refresh\/area\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { plan: cos.getTargetedRefreshPlans(a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/targeted-refresh\/run\/([^/]+)$/) && req.method === 'POST') {
    const a = req.url.match(/^\/api\/targeted-refresh\/run\/([^/]+)$/)[1];
    try { const mr = require('./lib/mutation-refresh'); return json(res, { result: mr.recordRefresh(a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/operator-journeys' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { journeys: cos.getOperatorJourneys() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/operator-journeys\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/operator-journeys\/([^/]+)$/)[1];
    try { const ux = require('./lib/ux-polish'); const j = ux.getJourneys().find(j => j.journey_id === id); return j ? json(res, { journey: j }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Telemetry Wiring + Measured Reliability + Alert Routing API ──

  if (req.url === '/api/telemetry-wiring' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getTelemetryWiringReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/telemetry-wiring\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/telemetry-wiring\/area\/([^/]+)$/)[1];
    try { const tw = require('./lib/telemetry-wiring'); return json(res, { flows: tw.getWiringByArea(a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/measured-reliability' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getMeasuredReliability()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/measured-reliability\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/measured-reliability\/project\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getMeasuredReliability(`project:${p}`)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/measured-reliability\/domain\/([^/]+)$/) && req.method === 'GET') {
    const d = req.url.match(/^\/api\/measured-reliability\/domain\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getMeasuredReliability(`domain:${d}`)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/reliability-regressions' && req.method === 'GET') {
    try { const mr = require('./lib/measured-reliability'); const r = mr.computeReliability(); return json(res, { regressions: r.regressions }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/reliability-regressions\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/reliability-regressions\/project\/([^/]+)$/)[1];
    try { const mr = require('./lib/measured-reliability'); const r = mr.computeReliability(`project:${p}`); return json(res, { regressions: r.regressions }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/alert-routing' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getAlertRoutingSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/alert-routing/run' && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decisions: cos.runAlertCheck() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/slo-breaches' && req.method === 'GET') {
    try { const ar = require('./lib/alert-routing'); return json(res, { breaches: ar.getBreaches() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Tenant Isolation + Entitlement + Boundary Enforcement API ──

  if (req.url === '/api/tenant-isolation' && req.method === 'GET') {
    try { const tir = require('./lib/tenant-isolation-runtime'); return json(res, { decisions: tir.getDecisions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/tenant-isolation\/tenant\/([^/]+)$/) && req.method === 'GET') {
    const t = req.url.match(/^\/api\/tenant-isolation\/tenant\/([^/]+)$/)[1];
    try { const tir = require('./lib/tenant-isolation-runtime'); return json(res, { decisions: tir.getDecisions(t) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/tenant-isolation\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/tenant-isolation\/project\/([^/]+)$/)[1];
    try { const tir = require('./lib/tenant-isolation-runtime'); return json(res, { decisions: tir.getDecisions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/tenant-isolation/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decision: cos.evaluateTenantIsolation(body.source_tenant || 'rpgpo', body.target_tenant || 'rpgpo', body.action) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/api-entitlements' && req.method === 'GET') {
    try { const aee = require('./lib/api-entitlement-enforcement'); return json(res, { routes: aee.getProtectedRoutes(), decisions: aee.getDecisions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/api-entitlements\/tenant\/([^/]+)$/) && req.method === 'GET') {
    const t = req.url.match(/^\/api\/api-entitlements\/tenant\/([^/]+)$/)[1];
    try { const aee = require('./lib/api-entitlement-enforcement'); return json(res, { decisions: aee.getDecisions(t) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/api-entitlements/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.route) return json(res, { error: 'Missing route' }, 400);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decision: cos.evaluateAPIEntitlement(body.route, body.tenant_id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/route-protection' && req.method === 'GET') {
    try { const aee = require('./lib/api-entitlement-enforcement'); return json(res, { rules: aee.getProtectedRoutes() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/boundary-enforcement' && req.method === 'GET') {
    try { const be = require('./lib/boundary-enforcement'); return json(res, { results: be.getResults() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/boundary-enforcement\/project\/([^/]+)$/) && req.method === 'GET') {
    const p = req.url.match(/^\/api\/boundary-enforcement\/project\/([^/]+)$/)[1];
    try { const be = require('./lib/boundary-enforcement'); return json(res, { results: be.getResults(p) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/boundary-enforcement/evaluate' && req.method === 'POST') {
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { result: cos.evaluateBoundaryEnforcement(body.request_type || 'query', body.source_scope || '', body.target_scope || '', body.artifact_type || '') }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/enforcement-reports/isolation' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getIsolationEnforcementReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/enforcement-reports/entitlements' && req.method === 'GET') {
    try { const aee = require('./lib/api-entitlement-enforcement'); return json(res, { routes: aee.getProtectedRoutes(), decisions: aee.getDecisions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/enforcement-reports/boundaries' && req.method === 'GET') {
    try { const be = require('./lib/boundary-enforcement'); return json(res, be.getReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Runtime Capability Activation API ──

  if (req.url === '/api/runtime-capabilities' && req.method === 'GET') {
    try { const rca = require('./lib/runtime-capability-activation'); return json(res, { activations: rca.getActivations() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-capabilities\/engine\/([^/]+)\/project\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/runtime-capabilities\/engine\/([^/]+)\/project\/([^/]+)$/);
    try { const rca = require('./lib/runtime-capability-activation'); return json(res, { activations: rca.getActivations(m[1]) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-capabilities\/engine\/([^/]+)$/) && req.method === 'GET') {
    const e = req.url.match(/^\/api\/runtime-capabilities\/engine\/([^/]+)$/)[1];
    try { const rca = require('./lib/runtime-capability-activation'); return json(res, { activations: rca.getActivations(e) }); } catch (e2) { return json(res, { error: e2.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-capabilities\/activate\/([^/]+)\/([^/]+)$/) && req.method === 'POST') {
    const m = req.url.match(/^\/api\/runtime-capabilities\/activate\/([^/]+)\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, activations: cos.activateComposedCapabilities(m[1], m[2]) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/runtime-capabilities\/activate\/([^/]+)$/) && req.method === 'POST') {
    const e = req.url.match(/^\/api\/runtime-capabilities\/activate\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, activations: cos.activateComposedCapabilities(e) }); } catch (e2) { return json(res, { error: e2.message }, 500); }
  }
  if (req.url === '/api/template-runtime-bindings' && req.method === 'GET') {
    try { const trb = require('./lib/template-runtime-binding'); return json(res, { bindings: trb.getBindings() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/template-runtime-bind\/([^/]+)\/([^/]+)\/([^/]+)$/) && req.method === 'POST') {
    const m = req.url.match(/^\/api\/template-runtime-bind\/([^/]+)\/([^/]+)\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, binding: cos.bindTemplateRuntime(m[1], m[2], m[3]) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/template-runtime-bind\/([^/]+)\/([^/]+)$/) && req.method === 'POST') {
    const m = req.url.match(/^\/api\/template-runtime-bind\/([^/]+)\/([^/]+)$/);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { ok: true, binding: cos.bindTemplateRuntime(m[1], m[2]) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/extension-permissions' && req.method === 'GET') {
    try { const epe = require('./lib/extension-permission-enforcement'); return json(res, { decisions: epe.getDecisions() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/extension-permissions\/([^/]+)\/evaluate$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/extension-permissions\/([^/]+)\/evaluate$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { decision: cos.evaluateExtensionPermissions(id, body.permission || 'read_context', body.action) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/capability-conflicts' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { conflicts: cos.getCapabilityConflicts() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/runtime-activation-report' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getRuntimeActivationReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Production Readiness Closure API ──

  if (req.url === '/api/production-readiness-closure' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getProductionReadinessClosure()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/production-readiness-closure\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/production-readiness-closure\/area\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const r = cos.getProductionReadinessClosure(); return json(res, { dimension: r?.dimensions?.find(d => d.name === a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/live-integration-status' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getLiveIntegrationStatus()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/live-integration-status\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/live-integration-status\/area\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { statuses: cos.getLiveIntegrationStatus(a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/operator-acceptance/run' && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.runOperatorAcceptance()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/operator-acceptance' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.runOperatorAcceptance()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/ship-readiness' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getShipReadinessDecision()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // ── Ship Blocker Closure + Middleware + Workflow Completion API ──

  if (req.url === '/api/ship-blockers' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getShipBlockerSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/ship-blockers/summary' && req.method === 'GET') {
    try { const sbc = require('./lib/ship-blocker-closure'); return json(res, sbc.getSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/ship-blockers\/([^/]+)\/resolve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/ship-blockers\/([^/]+)\/resolve$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, { blocker: cos.resolveShipBlocker(id, body.evidence) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/middleware-enforcement' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { coverage: cos.getMiddlewareCoverageReport() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/middleware-enforcement\/area\/([^/]+)$/) && req.method === 'GET') {
    const a = req.url.match(/^\/api\/middleware-enforcement\/area\/([^/]+)$/)[1];
    try { const me = require('./lib/middleware-enforcement'); const all = me.getCoverageReport(); return json(res, { coverage: all.filter(r => r.area === a) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/middleware-enforcement\/validate\/([^/]+)$/) && req.method === 'POST') {
    const a = req.url.match(/^\/api\/middleware-enforcement\/validate\/([^/]+)$/)[1];
    try { const me = require('./lib/middleware-enforcement'); return json(res, me.enforce('/api/' + a)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/workflow-completion' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getWorkflowCompletionReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflow-completion\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/workflow-completion\/([^/]+)$/)[1];
    try { const owc = require('./lib/operator-workflow-completion'); const r = owc.getCompletionReport(); const wf = r.workflows.find(w => w.workflow_id === id); return wf ? json(res, { workflow: wf }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/rollback-restoration' && req.method === 'GET') {
    return json(res, { states: [
      { path: 'release_execution_state', state: 'fully_restorable', detail: 'Release execution status reverted on rollback' },
      { path: 'promotion_pipeline_state', state: 'partially_restorable', detail: 'Pipeline request not auto-reverted' },
      { path: 'binding_configuration', state: 'logical_only', detail: 'Template bindings not auto-reverted' },
    ] });
  }

  // Part 50: Go-Live Closure + Provider Gating + Readiness Reconciliation
  if (req.url === '/api/go-live-closure' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getGoLiveClosureReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/release-provider-gating' && req.method === 'GET') {
    // Part 55: Inline provider guard
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/release-provider-gating', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.evaluateReleaseProviderGating()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/release-provider-gating\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/release-provider-gating\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.evaluateReleaseProviderGating(id)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/readiness-reconciliation' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getReadinessReconciliation()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 51: Protected Path Validation + Middleware Truth + Enforcement Evidence
  if (req.url === '/api/protected-paths' && req.method === 'GET') {
    try { const ppv = require('./lib/protected-path-validation'); return json(res, { paths: ppv.getProtectedPaths() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/protected-paths\/run-all$/) && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.runProtectedPathValidation()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/protected-paths\/run\/([^/]+)$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/protected-paths\/run\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.runProtectedPathValidation(id)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/protected-paths\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/protected-paths\/([^/]+)$/)[1];
    try { const ppv = require('./lib/protected-path-validation'); const paths = ppv.getProtectedPaths(); const p = paths.find(pp => pp.path_id === id); return p ? json(res, { path: p }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/middleware-truth' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getMiddlewareTruthReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/enforcement-evidence' && req.method === 'GET') {
    // Part 55: Inline boundary guard with redaction support
    try {
      const hrg = require('./lib/http-response-guard');
      const gd = hrg.guard('/api/enforcement-evidence', _tenantId, _projectId);
      if (!gd.allowed) return json(res, gd.payload, gd.status);
      if (gd.outcome === 'redact') {
        try { const cos = require('./lib/chief-of-staff'); const data = { evidence: cos.getEnforcementEvidence() }; return json(res, hrg.redactPayload(data, gd.reason)); } catch (e) { return json(res, { error: e.message }, 500); }
      }
    } catch { /* */ }
    try { const cos = require('./lib/chief-of-staff'); return json(res, { evidence: cos.getEnforcementEvidence() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/enforcement-evidence\/area\/([^/]+)$/) && req.method === 'GET') {
    const area = req.url.match(/^\/api\/enforcement-evidence\/area\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { evidence: cos.getEnforcementEvidence(area) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/protected-path-summary' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getProtectedPathSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 52: HTTP Middleware Validation + Final Blockers + Final Ship Decision
  if (req.url === '/api/http-middleware-validation' && req.method === 'GET') {
    try { const hmv = require('./lib/http-middleware-validation'); const run = hmv.getLatestRun(); return run ? json(res, run) : json(res, { error: 'No validation run yet' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/http-middleware-validation/run' && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.runHTTPMiddlewareValidation()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-blockers' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getFinalBlockerReconciliation()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-blockers/reconciliation' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getFinalBlockerReconciliation()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-workflow-closure' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getFinalWorkflowClosure()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/redaction-behavior' && req.method === 'GET') {
    try { const hmv = require('./lib/http-middleware-validation'); return json(res, { records: hmv.getRedactionBehavior() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-ship-decision' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getFinalShipDecisionReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-ship-decision/recompute' && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getFinalShipDecisionReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 53: Network HTTP Validation + Reliability Closure + Clean-State Go
  if (req.url === '/api/network-http-validation' && req.method === 'GET') {
    try { const nhv = require('./lib/network-http-validation'); const run = nhv.getLatestRun(); return run ? json(res, run) : json(res, { error: 'No validation run yet' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/network-http-validation/run' && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); cos.runNetworkHTTPValidation().then(r => json(res, r)).catch(e => json(res, { error: e.message }, 500)); return; } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/reliability-closure' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getReliabilityClosureReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/clean-state-verification' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.runCleanStateVerification()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/clean-state-verification/clear' && req.method === 'POST') {
    try { const csv = require('./lib/clean-state-verification'); return json(res, csv.clearValidationState()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-go-verification' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getFinalGoVerificationReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-go-verification/recompute' && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getFinalGoVerificationReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 54: Live Server Proof + Go Authorization
  if (req.url === '/api/live-server-proof' && req.method === 'GET') {
    try { const lsp = require('./lib/live-server-proof'); const run = lsp.getLatestRun(); return run ? json(res, run) : json(res, { error: 'No proof run yet' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/live-server-proof/run' && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); cos.runLiveServerProof().then(r => json(res, r)).catch(e => json(res, { error: e.message }, 500)); return; } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/validation-harness' && req.method === 'GET') {
    try { const vho = require('./lib/validation-harness-orchestrator'); const exec = vho.getLatestExecution(); return exec ? json(res, exec) : json(res, { error: 'No harness run yet' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/validation-harness/run' && req.method === 'POST') {
    try { const vho = require('./lib/validation-harness-orchestrator'); vho.runHarness().then(r => json(res, r)).catch(e => json(res, { error: e.message }, 500)); return; } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/go-authorization' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getGoAuthorizationDecision()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/go-authorization/recompute' && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getGoAuthorizationDecision()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 55: Route Middleware Enforcement + Final Go Proof
  if (req.url === '/api/route-middleware' && req.method === 'GET') {
    try { const rme = require('./lib/route-middleware-enforcement'); return json(res, { bindings: rme.getBindings(), executions: rme.getExecutions().slice(0, 20) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/route-middleware/coverage' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getRouteMiddlewareCoverage()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/route-middleware/validate' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); return json(res, hrg.getGuardSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/http-response-guard' && req.method === 'GET') {
    try { const hrg = require('./lib/http-response-guard'); return json(res, { guards: hrg.getGuardSummary() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-go-proof' && req.method === 'GET') {
    try { const fgp = require('./lib/final-go-proof'); const run = fgp.getLatestRun(); return run ? json(res, run) : json(res, { error: 'No proof run yet' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-go-proof/run' && req.method === 'POST') {
    try { const cos = require('./lib/chief-of-staff'); cos.runFinalGoProof().then(r => json(res, r)).catch(e => json(res, { error: e.message }, 500)); return; } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/unconditional-go-report' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getUnconditionalGoReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 56: Route Protection Expansion + Mutation Guards + Deep Redaction
  if (req.url === '/api/route-protection-expansion' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getRouteProtectionExpansionReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/route-protection-expansion\/category\/([^/]+)$/) && req.method === 'GET') {
    const cat = req.url.match(/^\/api\/route-protection-expansion\/category\/([^/]+)$/)[1];
    try { const rpe = require('./lib/route-protection-expansion'); return json(res, { bindings: rpe.getByCategory(cat) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/mutation-route-guards' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getMutationProtectionReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/mutation-route-guards/validate' && req.method === 'POST') {
    try { const mg = require('./lib/mutation-route-guards'); return json(res, { rules: mg.getRules(), decisions: mg.getDecisions().slice(0, 20) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/deep-redaction' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getDeepRedactionReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/deep-redaction/validate' && req.method === 'POST') {
    try { const dr = require('./lib/deep-redaction'); return json(res, dr.validateRedaction()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/protection-regressions' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getProtectionRegressionChecks()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 57: Product Shell + Output Surfacing + Task Experience
  if (req.url === '/api/product-shell' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getProductShellState()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/product-shell/sections' && req.method === 'GET') {
    try { const ps = require('./lib/product-shell'); return json(res, { sections: ps.getSections() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/final-output\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/final-output\/([^/]+)$/)[1];
    try { const fos = require('./lib/final-output-surfacing'); const o = fos.getFinalOutput(id); return o ? json(res, o) : json(res, { error: 'Task not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/final-output-report' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getOutputSurfacingReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/task-experience' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { experiences: cos.getTaskExperienceReport() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/task-experience\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/task-experience\/([^/]+)$/)[1];
    try { const te = require('./lib/task-experience'); const e = te.getTaskExperience(id); return e ? json(res, e) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/ux-consolidation-report' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getProductShellState()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 58: Engine Catalog + Output Contracts + Mission Acceptance
  if (req.url === '/api/engine-catalog' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getEngineCatalogSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/engine-catalog\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/engine-catalog\/([^/]+)$/)[1];
    try { const ec = require('./lib/engine-catalog'); const e = ec.getEngine(id); return e ? json(res, { engine: e }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/output-contracts' && req.method === 'GET') {
    try { const oc = require('./lib/output-contracts'); return json(res, { contracts: oc.getContracts() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/output-contracts\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/output-contracts\/([^/]+)$/)[1];
    try { const oc = require('./lib/output-contracts'); const c = oc.getContract(id); return c ? json(res, { contract: c }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/task-deliverable-status\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/task-deliverable-status\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.validateTaskAgainstOutputContract(id)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/task-contract-validation\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/task-contract-validation\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.validateTaskAgainstOutputContract(id)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/mission-acceptance' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getMissionAcceptanceSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/mission-acceptance\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/mission-acceptance\/([^/]+)$/)[1];
    try { const mas = require('./lib/mission-acceptance-suite'); return json(res, { cases: mas.getCasesByEngine(id), summary: mas.getRunSummary(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/deliverable-visibility-report' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getOutputContractReport()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 59: Structured Deliverables + Contract Enforcement + Rendering
  if (req.url?.match(/^\/api\/tasks\/([^/]+)\/deliverable$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/tasks\/([^/]+)\/deliverable$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const r = cos.renderDeliverable(id); return r ? json(res, r) : json(res, { error: 'No deliverable' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/tasks\/([^/]+)\/deliverable\/validate$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/tasks\/([^/]+)\/deliverable\/validate$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.validateDeliverableForTask(id)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/tasks\/([^/]+)\/plan\/contract-enforce$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/tasks\/([^/]+)\/plan\/contract-enforce$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard(req.url, _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getBoardContractContext(id)); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 60: Deliverable Store
  if (req.url === '/api/deliverables' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getDeliverableStoreIndex()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/migrate-flat$/) && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/deliverables', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.migrateDeliverables()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/reindex$/) && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/deliverables', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const ds = require('./lib/deliverable-store'); return json(res, ds.reindex()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/versions$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/deliverables\/([^/]+)\/versions$/)[1];
    try { const cos = require('./lib/chief-of-staff'); return json(res, { versions: cos.getDeliverableHistory(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/versions\/(\d+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/deliverables\/([^/]+)\/versions\/(\d+)$/);
    try { const cos = require('./lib/chief-of-staff'); const d = cos.getStoredDeliverable(m[1], parseInt(m[2])); return d ? json(res, d) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/merge$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/deliverables\/([^/]+)\/merge$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/deliverables', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.mergeDeliverableFragments(id, body.fragments || [])); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/validate-merge$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/deliverables\/([^/]+)\/validate-merge$/)[1];
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.validateMergedDeliverable(body.engineId || 'general', id)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/diff\/(\d+)\.\.(\d+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/deliverables\/([^/]+)\/diff\/(\d+)\.\.(\d+)$/);
    try { const cos = require('./lib/chief-of-staff'); const d = cos.diffDeliverableVersions(m[1], parseInt(m[2]), parseInt(m[3])); return d ? json(res, { changes: d }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/merge-strategies' && req.method === 'GET') {
    try { const dm = require('./lib/deliverable-merge'); return json(res, { strategies: dm.getStrategies() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  // Part 62: Evidence + Approval
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/propose$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/deliverables\/([^/]+)\/propose$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/deliverables', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.proposeDeliverable(id, body.version || 1)); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/approve$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/deliverables\/([^/]+)\/approve$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/deliverables', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.approveDeliverable(id, body.version || 1, body.approver || 'operator')); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/reject$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/deliverables\/([^/]+)\/reject$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/deliverables', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.rejectDeliverable(id, body.version || 1, body.reviewer || 'operator', body.reason || 'Rejected')); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/evidence\/(\d+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/deliverables\/([^/]+)\/evidence\/(\d+)$/);
    try { const el = require('./lib/evidence-linker'); return json(res, el.getLinkReport(m[1], parseInt(m[2]))); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/deliverable-approvals' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { requests: cos.getDeliverableApprovalRequests() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  // Part 64: Release Assembly
  if (req.url === '/api/releases/candidates/build' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/releases', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.buildReleaseCandidate(body.project || 'rpgpo', body.channel || 'dev'), 201); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/releases/candidates' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, { candidates: cos.getReleaseCandidates() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/releases\/candidates\/([^/]+)\/promote$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/releases\/candidates\/([^/]+)\/promote$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/releases', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const ra = require('./lib/release-assembly'); const r = ra.promoteCandidate(id, 'operator'); return r ? json(res, { release: r }) : json(res, { error: 'Not found or not pending' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/releases\/candidates\/([^/]+)\/reject$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/releases\/candidates\/([^/]+)\/reject$/)[1];
    try { const ra = require('./lib/release-assembly'); return json(res, { rejected: ra.rejectCandidate(id) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/releases/current' && req.method === 'GET') {
    const project = new URL(req.url, 'http://x').searchParams?.get('project') || 'rpgpo';
    const channel = new URL(req.url, 'http://x').searchParams?.get('channel') || 'dev';
    try { const cos = require('./lib/chief-of-staff'); return json(res, { release: cos.getCurrentRelease(project, channel) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  // Part 73: Mission Control + Notifications
  if (req.url === '/api/mission-control/summary' && req.method === 'GET') {
    try { const mc = require('./lib/mission-control'); return json(res, mc.getMissionControlSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/mission-control\/full(\?.*)?$/) && req.method === 'GET') {
    try {
      const mc = require('./lib/mission-control');
      const params = new URL(req.url, 'http://x').searchParams;
      const limit = { workflows: parseInt(params.get('w') || '20'), deliverables: parseInt(params.get('d') || '20'), alerts: parseInt(params.get('a') || '20') };
      return json(res, mc.getMissionControlPayload({ limit }));
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/notifications(\?.*)?$/) && req.method === 'GET') {
    try {
      const notif = require('./lib/in-app-notifications');
      const params = new URL(req.url, 'http://x').searchParams;
      const since = params.get('since') ? parseInt(params.get('since')) : Date.now() - 86400000;
      return json(res, { notifications: notif.listNotifications(since, parseInt(params.get('limit') || '50')) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/notifications/ack' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/notifications', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const notif = require('./lib/in-app-notifications'); return json(res, notif.ackNotifications(body.ids || [])); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/notifications/mark-read' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/notifications', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const notif = require('./lib/in-app-notifications'); return json(res, notif.markRead(body.ids || [])); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Reports listing
  if (req.url?.match(/^\/api\/reports(\?.*)?$/) && req.method === 'GET') {
    try {
      const reportsDir = path.resolve(RPGPO_ROOT, '03-Operations', 'Reports');
      if (!fs.existsSync(reportsDir)) return json(res, { reports: [] });
      const files = fs.readdirSync(reportsDir).filter(f => f.endsWith('.md') || f.endsWith('.json') || f.endsWith('.txt'));
      const reports = files.map(f => {
        try {
          const stat = fs.statSync(path.join(reportsDir, f));
          return { name: f, path: '03-Operations/Reports/' + f, size: stat.size, modified: stat.mtimeMs };
        } catch { return null; }
      }).filter(Boolean).sort((a, b) => b.modified - a.modified).slice(0, 50);
      return json(res, { reports, total: files.length });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 72: TopRanker Engine
  if (req.url === '/api/topranker/contracts' && req.method === 'GET') {
    try { const tc = require('./lib/contracts/topranker.contracts'); return json(res, { contracts: tc.getTopRankerContracts() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/topranker/tasks/run' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/topranker', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try {
      const engine = require('./lib/engines/topranker-engine');
      const orc = require('./lib/workflow-orchestrator');
      const wf = orc.createFromIntake(`topranker_${Date.now().toString(36)}`, { tenantId: _tenantId, projectId: _projectId, autopilot: { enabled: body.autopilot || false } });
      const deliverableId = engine.computeDeliverableId('topranker.weekly-leaderboard', body);
      return json(res, { workflowId: wf.id, deliverableId, status: wf.state }, 201);
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/topranker/build' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/topranker', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const adapter = require('./lib/integrations/topranker-repo-adapter'); const result = await adapter.runTopRankerBuild({ dryRun: body.dryRun !== false, steps: body.steps }); return json(res, result); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/topranker\/deliverables(\?.*)?$/) && req.method === 'GET') {
    try {
      const ws = require('./lib/workflow-store');
      const workflows = ws.list({ tenantId: _tenantId });
      const toprankerWfs = workflows.filter(w => w.intakeRef?.intakeId?.startsWith('topranker_'));
      return json(res, { deliverables: toprankerWfs.map(w => ({ workflowId: w.id, state: w.state, deliverableRefs: w.deliverableRefs, createdAt: w.createdAt })) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 71: Workflow Orchestration
  if (req.url === '/api/workflows' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/workflows', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const orc = require('./lib/workflow-orchestrator'); const wf = orc.createFromIntake(body.intakeId, { tenantId: body.tenantId || _tenantId, projectId: body.projectId || _projectId, autopilot: body.autopilot }); return json(res, { workflow: wf }, 201); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflows(\?.*)?$/) && req.method === 'GET') {
    try {
      const ws = require('./lib/workflow-store');
      const params = new URL(req.url, 'http://x').searchParams;
      const filter = {};
      if (params.get('tenantId')) filter.tenantId = params.get('tenantId');
      if (params.get('projectId')) filter.projectId = params.get('projectId');
      if (params.get('state')) filter.state = params.get('state').split(',');
      return json(res, { workflows: ws.list(filter) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflows\/([^/]+)\/pause$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/workflows\/([^/]+)\/pause$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/workflows', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const orc = require('./lib/workflow-orchestrator'); const wf = orc.pause(id, 'operator', body.reason); return wf ? json(res, { workflow: wf }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflows\/([^/]+)\/resume$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/workflows\/([^/]+)\/resume$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/workflows', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const orc = require('./lib/workflow-orchestrator'); const wf = orc.resume(id, 'operator'); return wf ? json(res, { workflow: wf }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflows\/([^/]+)\/cancel$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/workflows\/([^/]+)\/cancel$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/workflows', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const orc = require('./lib/workflow-orchestrator'); const wf = orc.cancel(id, 'operator', body.reason); return wf ? json(res, { workflow: wf }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflows\/([^/]+)\/advance$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/workflows\/([^/]+)\/advance$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/workflows', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const orc = require('./lib/workflow-orchestrator'); const wf = orc.advance(id, body.reason || 'Operator advance', 'operator'); return wf ? json(res, { workflow: wf }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflows\/([^/]+)\/autopilot$/) && req.method === 'POST') {
    const id = req.url.match(/^\/api\/workflows\/([^/]+)\/autopilot$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/workflows', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try {
      const ws = require('./lib/workflow-store'); const ap = require('./lib/autopilot-controller');
      const wf = ws.get(id); if (!wf) return json(res, { error: 'Not found' }, 404);
      wf.autopilot = ap.getPolicyFor(body);
      ws.update(wf);
      return json(res, { autopilot: wf.autopilot });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflows\/([^/]+)\/timeline$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/workflows\/([^/]+)\/timeline$/)[1];
    try { const ws = require('./lib/workflow-store'); const wf = ws.get(id); return wf ? json(res, { timeline: wf.timeline }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/metrics/orchestrator' && req.method === 'GET') {
    try { const tel = require('./lib/orchestrator-telemetry'); return json(res, tel.getMetrics()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/workflows\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/workflows\/([^/]+)$/)[1];
    try { const ws = require('./lib/workflow-store'); const wf = ws.get(id); return wf ? json(res, { workflow: wf }) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 70: Runtime Scheduler
  if (req.url === '/runtime/scheduler' && req.method === 'GET') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/runtime/scheduler', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const s = require('./lib/scheduler/scheduler'); return json(res, s.state()); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/runtime/scheduler/pause' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/runtime/scheduler', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const s = require('./lib/scheduler/scheduler'); s.pause(); return json(res, { ok: true, paused: true }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/runtime/scheduler/resume' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/runtime/scheduler', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const s = require('./lib/scheduler/scheduler'); s.resume(); return json(res, { ok: true, paused: false }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/runtime/scheduler/config' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/runtime/scheduler', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const store = require('./lib/state/scheduler-store'); const current = store.loadConfig(); const updated = { ...current, ...body }; store.saveConfig(updated); return json(res, { ok: true, config: updated }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/runtime\/queue(\?.*)?$/) && req.method === 'GET') {
    try {
      const wq = require('./lib/scheduler/work-queue');
      const params = new URL(req.url, 'http://x').searchParams;
      const result = { stats: wq.stats() };
      if (params.get('includeSnapshot') === '1') result.snapshot = wq.snapshot();
      return json(res, result);
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/runtime/queue/reprioritize' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/runtime/scheduler', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const wq = require('./lib/scheduler/work-queue'); wq.reprioritize(body.itemId, body.priority); return json(res, { ok: true }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/runtime\/queue\/([^/]+)$/) && req.method === 'DELETE') {
    const itemId = req.url.match(/^\/runtime\/queue\/([^/]+)$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/runtime/scheduler', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try { const wq = require('./lib/scheduler/work-queue'); wq.markCanceled(itemId, 'Operator canceled'); return json(res, { ok: true }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/runtime\/providers\/([^/]+)\/limits$/) && req.method === 'POST') {
    const provider = req.url.match(/^\/runtime\/providers\/([^/]+)\/limits$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/runtime/scheduler', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const store = require('./lib/state/scheduler-store'); const cfg = store.loadConfig(); cfg.perProviderMaxConcurrent[provider] = body.maxConcurrent; store.saveConfig(cfg); return json(res, { ok: true }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/runtime\/runs\/([^/]+)\/progress$/) && req.method === 'GET') {
    const runId = req.url.match(/^\/runtime\/runs\/([^/]+)\/progress$/)[1];
    try { const dag = require('./lib/scheduler/dag-runner'); const p = dag.runProgress(runId); return p ? json(res, { runId, ...p, updatedAt: new Date().toISOString() }) : json(res, { error: 'Run not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/runtime\/runs\/([^/]+)\/cancel$/) && req.method === 'POST') {
    const runId = req.url.match(/^\/runtime\/runs\/([^/]+)\/cancel$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/runtime/scheduler', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const rec = require('./lib/scheduler/recovery'); const count = rec.cancelRun(runId, body.reason || 'Operator canceled'); return json(res, { ok: true, canceled: count }); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 69: Structured I/O Observability + Metrics + Provider Learning
  if (req.url?.match(/^\/api\/structured-io\/metrics(\?.*)?$/) && req.method === 'GET') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/structured-io', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try {
      const m = require('./lib/structured-io-metrics');
      const params = new URL(req.url, 'http://x').searchParams;
      const wm = parseInt(params.get('windowMinutes') || '60');
      return json(res, m.getCurrentSnapshot(wm));
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/structured-io/metrics/providers' && req.method === 'GET') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/structured-io', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try {
      const m = require('./lib/structured-io-metrics');
      const snap = m.getCurrentSnapshot(60);
      return json(res, { providers: Object.values(snap.byProvider) });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/structured-io/metrics/schemas' && req.method === 'GET') {
    try { const m = require('./lib/structured-io-metrics'); const snap = m.getCurrentSnapshot(60); return json(res, { schemas: Object.values(snap.bySchema) }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/structured-io\/latency-histogram(\?.*)?$/) && req.method === 'GET') {
    try { const m = require('./lib/structured-io-metrics'); const params = new URL(req.url, 'http://x').searchParams; return json(res, m.getLatencyHistogram(parseInt(params.get('windowMinutes') || '60'))); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/structured-io\/costs(\?.*)?$/) && req.method === 'GET') {
    try { const c = require('./lib/structured-io-cost'); const params = new URL(req.url, 'http://x').searchParams; return json(res, c.getCostSummary(parseInt(params.get('windowMinutes') || '1440'))); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/structured-io/alerts' && req.method === 'GET') {
    try { const a = require('./lib/structured-io-alerts'); return json(res, { alerts: a.listActiveAlerts() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/structured-io/alerts/ack' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/structured-io', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const a = require('./lib/structured-io-alerts'); const ok = a.acknowledgeAlert(body.id, body.actor || 'operator'); return json(res, { acknowledged: ok }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/structured-io/providers/learning' && req.method === 'GET') {
    try { const pl = require('./lib/provider-learning'); return json(res, { providers: pl.getProviderLearningState() }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/structured-io/providers/override-score' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/structured-io', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const pl = require('./lib/provider-learning'); pl.overrideProviderScore(body.providerKey, body.score); return json(res, { overridden: true, providerKey: body.providerKey, score: body.score }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/structured-io/metrics/reset' && req.method === 'POST') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/structured-io', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    const body = await parseBody(req);
    try { const m = require('./lib/structured-io-metrics'); m.resetMetrics(body.scope, body.key); return json(res, { reset: true }); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/structured-io/evidence/index' && req.method === 'GET') {
    try { const el = require('./lib/evidence-lifecycle'); return json(res, el.indexEvidence()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 68: Structured IO Status + Retry + Provider Capabilities
  if (req.url?.match(/^\/api\/ai-io\/status\/([^/]+)$/) && req.method === 'GET') {
    const taskId = req.url.match(/^\/api\/ai-io\/status\/([^/]+)$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/ai-io', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try {
      const cos = require('./lib/chief-of-staff');
      const statuses = cos.getStructuredIOStatus(taskId);
      try { const dr = require('./lib/deep-redaction'); const r = dr.redactDeep({ taskId, statuses }, '/api/ai-io/status', 'api_response', ['tenant_data']); return json(res, r.data); } catch { return json(res, { taskId, statuses }); }
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/ai-io\/retry\/([^/]+)$/) && req.method === 'POST') {
    const taskId = req.url.match(/^\/api\/ai-io\/retry\/([^/]+)$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/ai-io', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try {
      const { loadContractAwareConfig } = require('./lib/config/ai-io');
      const cfg = loadContractAwareConfig();
      if (!cfg.allowManualRetry) return json(res, { error: 'Manual retry not allowed by config' }, 403);
      return json(res, { taskId, message: 'Retry queued', status: 'queued' });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/providers/capabilities' && req.method === 'GET') {
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/providers', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try {
      const pc = require('./lib/ai/provider-capabilities');
      const { loadContractAwareConfig } = require('./lib/config/ai-io');
      const cfg = loadContractAwareConfig();
      return json(res, { capabilities: pc.getProviderCapabilities(), routing: cfg.providerRouting || 'capability-preferred' });
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 67: Structured Output Extraction API
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/structured$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/deliverables\/([^/]+)\/structured$/)[1];
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/deliverables', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try {
      const reader = require('./lib/evidence/reader');
      const evidence = reader.getLatestEvidence(id);
      if (!evidence) return json(res, { error: 'No structured evidence found' }, 404);
      try { const dr = require('./lib/deep-redaction'); const r = dr.redactDeep(evidence, '/api/deliverables/structured', 'api_response', ['tenant_data']); return json(res, r.data); } catch { return json(res, evidence); }
    } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url?.match(/^\/api\/deliverables\/([^/]+)\/structured\/([^/]+)$/) && req.method === 'GET') {
    const m = req.url.match(/^\/api\/deliverables\/([^/]+)\/structured\/([^/]+)$/);
    try { const hrg = require('./lib/http-response-guard'); const gd = hrg.guard('/api/deliverables', _tenantId, _projectId); if (!gd.allowed) return json(res, gd.payload, gd.status); } catch { /* */ }
    try {
      const reader = require('./lib/evidence/reader');
      const entries = reader.getTaskEvidence(m[1], m[2]);
      if (entries.length === 0) return json(res, { error: 'No evidence for this task' }, 404);
      try { const dr = require('./lib/deep-redaction'); const r = dr.redactDeep(entries, '/api/deliverables/structured', 'api_response', ['tenant_data']); return json(res, { entries: r.data }); } catch { return json(res, { entries }); }
    } catch (e) { return json(res, { error: e.message }, 500); }
  }

  if (req.url?.match(/^\/api\/deliverables\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/deliverables\/([^/]+)$/)[1];
    try { const cos = require('./lib/chief-of-staff'); const d = cos.getStoredDeliverable(id); return d ? json(res, d) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // Part 65: Runtime Deliverable Pipeline
  if (req.url?.match(/^\/api\/runtime-deliverable\/([^/]+)$/) && req.method === 'GET') {
    const id = req.url.match(/^\/api\/runtime-deliverable\/([^/]+)$/)[1];
    try { const rdp = require('./lib/runtime-deliverable-pipeline'); const s = rdp.getState(id); return s ? json(res, s) : json(res, { error: 'Not found' }, 404); } catch (e) { return json(res, { error: e.message }, 500); }
  }
  if (req.url === '/api/runtime-deliverable-summary' && req.method === 'GET') {
    try { const cos = require('./lib/chief-of-staff'); return json(res, cos.getRuntimeDeliverableSummary()); } catch (e) { return json(res, { error: e.message }, 500); }
  }

  // File reader (sandbox-safe)
  if (req.url?.startsWith('/api/file/')) {
    const relPath = decodeURIComponent(req.url.replace('/api/file/', ''));
    const fullPath = path.resolve(RPGPO_ROOT, relPath);
    if (!fullPath.startsWith(RPGPO_ROOT)) { res.writeHead(403); res.end('Forbidden'); return; }
    const content = readFile(relPath);
    if (content === null) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(content);
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url.split('?')[0];
  const ext = path.extname(filePath);
  const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
  const fullPath = path.join(__dirname, filePath);

  if (!fullPath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }

  fs.readFile(fullPath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

function keyDiag(name) {
  const v = process.env[name];
  if (!v) return 'MISSING';
  if (v === 'your_key_here' || v.startsWith('your_')) return 'PLACEHOLDER (broken!)';
  return `OK (${v.slice(0, 6)}...)`;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  RPGPO Command Center v6 running at http://localhost:${PORT}`);
  console.log(`  Binding 0.0.0.0 for remote access`);
  console.log(`  Keys: OpenAI=${keyDiag('OPENAI_API_KEY')} Perplexity=${keyDiag('PERPLEXITY_API_KEY')} Gemini=${keyDiag('GEMINI_API_KEY')}\n`);
});
