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

  // Launch Claude
  if (req.url === '/api/launch-claude' && req.method === 'POST') {
    try {
      execSync(`osascript -e 'tell application "Terminal" to do script "cd \\"${RPGPO_ROOT}\\" && claude"'`, { timeout: 5000 });
      logAction('Launch Claude', 'OK', null);
      events.broadcast('activity', { action: 'Launched Claude session', ts: new Date().toISOString() });
      return json(res, { ok: true, output: 'Claude session launched in Terminal.' });
    } catch (e) {
      return json(res, { ok: false, error: e.message });
    }
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
  if (req.url === '/api/intake/submit' && req.method === 'POST') {
    const body = await parseBody(req);
    if (!body.raw_request) return json(res, { ok: false, error: 'Missing raw_request' }, 400);
    const task = intake.createTask(body);
    events.broadcast('activity', { action: `Intake task created: ${task.title}`, ts: new Date().toISOString() });
    logAction('Intake submit', task.task_id, task.title);
    return json(res, { ok: true, task });
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

    // If builder_fallback, user is confirming manual execution is complete — mark done
    if (st.status === 'builder_fallback') {
      intake.updateSubtask(subtaskId, {
        status: 'done',
        builder_outcome: 'manual_execution_confirmed',
        output: (st.output || '') + '\n\n[Manual execution confirmed by Rahul]',
      });
      // Continue workflow from this point
      const wfResult = workflow.onSubtaskComplete(subtaskId);
      if (wfResult.next_subtask_ids) {
        for (const nextId of wfResult.next_subtask_ids) {
          const nextSt = intake.getSubtask(nextId);
          if (nextSt) queue.addTask('execute-subtask', `Subtask: ${nextSt.title}`, { subtaskId: nextId });
        }
      }
      events.broadcast('activity', { action: `Builder fallback confirmed: ${st.title}`, ts: new Date().toISOString() });
      events.broadcast('intake-update', { taskId: st.parent_task_id, subtaskId, action: 'builder_confirmed' });
      return json(res, { ok: true, resumed: st.title, action: 'builder_confirmed' });
    }

    // Normal approval — re-queue for execution
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
