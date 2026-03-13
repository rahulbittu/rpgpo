// RPGPO Dashboard Server v4 — World-class command center
const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const { RPGPO_ROOT, readFile, readJson, listFiles, readAllInDir, parseMission, logAction } = require('./lib/files');
const queue = require('./lib/queue');
const events = require('./lib/events');

const PORT = process.env.PORT || 3200;
const startTime = Date.now();

// --- Watch tasks.json for cross-process changes (worker writes here) ---

let lastTasksJson = '';
const TASKS_FILE = path.resolve(__dirname, '..', 'state', 'tasks.json');

function watchTaskFile() {
  // Poll the tasks file for changes made by the worker process.
  // fs.watch is unreliable across platforms; polling is robust.
  setInterval(() => {
    try {
      const raw = fs.readFileSync(TASKS_FILE, 'utf-8');
      if (raw !== lastTasksJson) {
        const oldTasks = lastTasksJson ? JSON.parse(lastTasksJson) : [];
        const newTasks = JSON.parse(raw);
        lastTasksJson = raw;

        // Find tasks whose status changed
        for (const nt of newTasks) {
          const ot = oldTasks.find(t => t.id === nt.id);
          if (!ot || ot.status !== nt.status || ot.updatedAt !== nt.updatedAt) {
            const evt = { event: 'task_updated', task: nt };
            console.log(`[server] Task ${nt.id} → ${nt.status} (file-watch broadcast)`);
            events.broadcast('task', evt);
            // Also broadcast as activity for the live feed
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
      console.error('[server] file-watch error:', e.message);
    }
  }, 1000); // Check every 1s for responsive task lifecycle

  // Initialize lastTasksJson
  try {
    lastTasksJson = fs.readFileSync(TASKS_FILE, 'utf-8');
    console.log(`[server] Task file watcher initialized. File: ${TASKS_FILE}`);
  } catch (e) {
    console.log(`[server] Task file not found yet: ${TASKS_FILE}`);
  }
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

// --- API data builder ---

function buildApiData() {
  const state = readJson('04-Dashboard/state/dashboard-state.json') || {};
  const missionFiles = ['TopRanker', 'CareerEngine', 'Founder2Founder', 'WealthResearch'];
  const missions = missionFiles.map(f => {
    const md = readFile(`03-Operations/MissionStatus/${f}.md`);
    return parseMission(md);
  }).filter(Boolean);

  const briefs = readAllInDir('03-Operations/DailyBriefs');
  const approvals = readAllInDir('03-Operations/Approvals/Pending');
  const logs = readAllInDir('03-Operations/Logs/AgentRuns');
  const toprankerSummary = readFile('03-Operations/Reports/TopRanker-Operating-Summary.md');
  const decisionLogs = readAllInDir('03-Operations/Logs/Decisions');

  return { state, missions, briefs, approvals, logs, decisionLogs, toprankerSummary };
}

// --- Worker status ---

function getWorkerStatus() {
  try {
    const out = execSync('pm2 jlist 2>/dev/null', { timeout: 3000 }).toString();
    const procs = JSON.parse(out);
    const worker = procs.find(p => p.name === 'rpgpo-worker');
    if (worker) return { running: worker.pm2_env.status === 'online', pid: worker.pid, uptime: worker.pm2_env.pm_uptime };
  } catch {}
  // Fallback: check if worker.js is running
  try {
    execSync('pgrep -f "node.*worker.js"', { timeout: 2000 });
    return { running: true, pid: null, uptime: null };
  } catch {}
  return { running: false };
}

// --- HTTP server ---

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // SSE endpoint — live event stream
  if (req.url === '/api/events') {
    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    });
    res.write(`event: connected\ndata: ${JSON.stringify({ ts: new Date().toISOString() })}\n\n`);
    events.addClient(res);

    // SSE keepalive every 15s to prevent proxy/Tailscale timeouts
    const keepalive = setInterval(() => {
      try { res.write(': keepalive\n\n'); } catch { clearInterval(keepalive); }
    }, 15000);
    res.on('close', () => clearInterval(keepalive));

    // Forward in-process task queue events to SSE (for tasks added by the server itself)
    const onTask = (data) => {
      console.log(`[server] SSE → task event: ${data.event} ${data.task?.id} ${data.task?.status}`);
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

  // System status (server uptime, worker, models)
  if (req.url === '/api/status') {
    return json(res, {
      server: { uptime: Date.now() - startTime, port: PORT },
      worker: getWorkerStatus(),
      keys: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? 'configured' : 'missing',
      },
      workspace: RPGPO_ROOT,
      node: process.version,
    });
  }

  // --- Task queue ---
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

  // --- Direct script execution (for quick actions) ---
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

  // --- Approval actions ---
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
      },
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
    return json(res, { ok: true, output: 'Use "Run Board of AI" to execute this via the task queue.' });
  }

  // File reader
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
  const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml' };
  const fullPath = path.join(__dirname, filePath);

  if (!fullPath.startsWith(__dirname)) { res.writeHead(403); res.end('Forbidden'); return; }

  fs.readFile(fullPath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n  RPGPO Command Center v4 running at http://localhost:${PORT}`);
  console.log(`  Binding 0.0.0.0 for remote access\n`);
});
