const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RPGPO_ROOT = path.resolve(__dirname, '../..');
const PORT = 3200;

// --- Action logger ---
// Every dashboard-triggered action appends a log entry

function logAction(action, result, fileAffected) {
  const logDir = path.join(RPGPO_ROOT, '03-Operations/Logs/Decisions');
  fs.mkdirSync(logDir, { recursive: true });
  const now = new Date();
  const ts = now.toISOString();
  const dateStr = ts.slice(0, 10);
  const logFile = path.join(logDir, `${dateStr}-DashboardActions.md`);

  const entry = `\n## ${ts}\n- **Action:** ${action}\n- **Result:** ${result}\n- **File:** ${fileAffected || 'n/a'}\n`;

  if (fs.existsSync(logFile)) {
    fs.appendFileSync(logFile, entry);
  } else {
    fs.writeFileSync(logFile, `# RPGPO Dashboard Action Log\n## Date: ${dateStr}\n${entry}`);
  }
}

// --- File readers ---

function readFile(relPath) {
  const full = path.join(RPGPO_ROOT, relPath);
  try { return fs.readFileSync(full, 'utf-8'); } catch { return null; }
}

function readJson(relPath) {
  const raw = readFile(relPath);
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

function listFiles(relDir) {
  const full = path.join(RPGPO_ROOT, relDir);
  try {
    return fs.readdirSync(full)
      .filter(f => !f.startsWith('.'))
      .sort()
      .reverse();
  } catch { return []; }
}

function readAllInDir(relDir) {
  const files = listFiles(relDir);
  return files.map(f => ({
    name: f,
    content: readFile(path.join(relDir, f))
  })).filter(f => f.content);
}

// --- Markdown to simple HTML ---

function md2html(md) {
  if (!md) return '<p class="muted">No content available.</p>';
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^## (.+)$/gm, '<h3>$1</h3>')
    .replace(/^# (.+)$/gm, '<h2>$1</h2>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => '<ul>' + m + '</ul>')
    .replace(/^(?!<[hul])((?!<li).+)$/gm, '<p>$1</p>')
    .replace(/<p>---<\/p>/g, '<hr>')
    .replace(/<p>\s*<\/p>/g, '');
}

// --- Parse mission status markdown ---

function parseMission(md) {
  if (!md) return null;
  const get = (label) => {
    const re = new RegExp('^## ' + label + '\\s*\\n([\\s\\S]*?)(?=\\n## |$)', 'm');
    const m = md.match(re);
    return m ? m[1].trim() : '';
  };
  return {
    mission: get('Mission'),
    objective: get('Current Objective'),
    status: get('Current Status'),
    metrics: get('Key Metrics'),
    progress: get('Recent Progress'),
    blockers: get('Blockers'),
    risks: get('Risks'),
    nextActions: get('Next Recommended Actions'),
    owner: get('Owner / Domain'),
  };
}

// --- API data builder ---

function buildApiData() {
  const state = readJson('04-Dashboard/state/dashboard-state.json') || {};

  // Missions
  const missionFiles = ['TopRanker', 'CareerEngine', 'Founder2Founder', 'WealthResearch'];
  const missions = missionFiles.map(f => {
    const md = readFile(`03-Operations/MissionStatus/${f}.md`);
    return parseMission(md);
  }).filter(Boolean);

  // Daily briefs
  const briefs = readAllInDir('03-Operations/DailyBriefs');

  // Approvals
  const approvals = readAllInDir('03-Operations/Approvals/Pending');

  // Logs
  const logs = readAllInDir('03-Operations/Logs/AgentRuns');

  // TopRanker
  const toprankerSummary = readFile('03-Operations/Reports/TopRanker-Operating-Summary.md');
  const toprankerSynthesis = readFile('02-Projects/TopRanker/Notes/TopRanker-Synthesis.md');

  // Decision logs
  const decisionLogs = readAllInDir('03-Operations/Logs/Decisions');

  return { state, missions, briefs, approvals, logs, decisionLogs, toprankerSummary, toprankerSynthesis };
}

// --- Script runner (safe, read-only operations) ---

function runScript(name) {
  const scripts = {
    'refresh-state': path.join(__dirname, 'scripts', 'refresh-state.js'),
    'morning-loop': path.join(__dirname, 'scripts', 'morning-loop.js'),
    'evening-loop': path.join(__dirname, 'scripts', 'evening-loop.js'),
  };
  const script = scripts[name];
  if (!script) return { ok: false, error: 'Unknown script' };
  try {
    const out = execSync(`node "${script}"`, { timeout: 30000, cwd: RPGPO_ROOT }).toString();
    logAction(`Run script: ${name}`, 'Success', script);
    return { ok: true, output: out };
  } catch (e) {
    logAction(`Run script: ${name}`, 'Failed: ' + (e.stderr ? e.stderr.toString().slice(0, 200) : e.message.slice(0, 200)), script);
    return { ok: false, error: e.stderr ? e.stderr.toString() : e.message };
  }
}

// --- HTTP server ---

const server = http.createServer((req, res) => {
  // CORS for local dev
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST');

  if (req.url === '/api/data') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(buildApiData()));
    return;
  }

  if (req.url?.startsWith('/api/run/') && req.method === 'POST') {
    const scriptName = req.url.replace('/api/run/', '');
    const result = runScript(scriptName);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  // --- Approval actions ---
  if (req.url?.startsWith('/api/approval/') && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const filename = data.filename;
        const decision = req.url.includes('/approve') ? 'Approved' : 'Rejected';

        if (!filename || !/^[\w\-.]+\.md$/.test(filename)) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'Invalid filename' }));
          return;
        }

        const src = path.join(RPGPO_ROOT, '03-Operations/Approvals/Pending', filename);
        const destDir = path.join(RPGPO_ROOT, `03-Operations/Approvals/${decision}`);
        const dest = path.join(destDir, filename);

        if (!fs.existsSync(src)) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: false, error: 'File not found in Pending' }));
          return;
        }

        fs.mkdirSync(destDir, { recursive: true });

        // Append decision stamp to the file
        const stamp = `\n\n---\n## Decision\n- **${decision}** by Rahul via RPGPO Dashboard\n- **Timestamp:** ${new Date().toISOString()}\n`;
        fs.appendFileSync(src, stamp);

        // Move
        fs.renameSync(src, dest);

        logAction(`Approval ${decision}`, `Moved ${filename} to ${decision}/`, filename);

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true, decision, filename }));
      } catch (e) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  // --- Settings / integrations status ---
  if (req.url === '/api/settings') {
    const settings = {
      keys: {
        OPENAI_API_KEY: process.env.OPENAI_API_KEY ? 'configured' : 'missing',
        PERPLEXITY_API_KEY: process.env.PERPLEXITY_API_KEY ? 'configured' : 'missing',
      },
      workspace: RPGPO_ROOT,
      node: process.version,
      platform: process.platform,
    };
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(settings));
    return;
  }

  // --- Launch Claude session (returns the command, macOS opens Terminal) ---
  if (req.url === '/api/launch-claude' && req.method === 'POST') {
    try {
      execSync(`osascript -e 'tell application "Terminal" to do script "cd \\"${RPGPO_ROOT}\\" && claude"'`, { timeout: 5000 });
      logAction('Launch Claude Session', 'Opened Terminal with claude', null);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: true, output: 'Claude session launched in Terminal.' }));
    } catch (e) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Could not open Terminal: ' + e.message }));
    }
    return;
  }

  // --- Board of AI runner ---
  if (req.url === '/api/board-run' && req.method === 'POST') {
    const boardScript = path.join(__dirname, 'scripts', 'board-runner.js');
    // Build env with current keys passed through
    const env = { ...process.env };

    logAction('Board of AI Run', 'Started', null);

    const { spawn } = require('child_process');
    const child = spawn('node', [boardScript], {
      cwd: RPGPO_ROOT,
      env,
      timeout: 120000,
    });

    let stdout = '';
    let stderr = '';
    child.stdout.on('data', d => stdout += d.toString());
    child.stderr.on('data', d => stderr += d.toString());

    child.on('close', (code) => {
      // Extract structured result if present
      const resultMarker = '__BOARD_RESULT__';
      let boardResult = null;
      const markerIdx = stdout.indexOf(resultMarker);
      if (markerIdx !== -1) {
        try {
          boardResult = JSON.parse(stdout.slice(markerIdx + resultMarker.length).trim());
        } catch {}
      }

      const consoleOutput = markerIdx !== -1 ? stdout.slice(0, markerIdx) : stdout;
      const ok = code === 0;
      const filesWritten = boardResult ? boardResult.filesWritten : [];

      logAction(
        'Board of AI Run',
        ok ? `Completed — ${boardResult ? boardResult.steps.filter(s=>s.status==='success').length : '?'}/3 succeeded` : 'Failed',
        filesWritten.join(', ') || null
      );

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        ok,
        output: consoleOutput + (stderr ? '\n\nStderr:\n' + stderr : ''),
        result: boardResult,
      }));
    });

    child.on('error', (e) => {
      logAction('Board of AI Run', 'Failed: ' + e.message, null);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: e.message }));
    });
    return;
  }

  // --- AI task handlers ---
  if (req.url?.startsWith('/api/ai/') && req.method === 'POST') {
    const task = req.url.replace('/api/ai/', '');
    const handlers = {
      'claude-topranker-review': () => {
        // Safe: just reads the starter prompt and shows it
        const prompt = readFile('03-Operations/Reports/Claude-TopRanker-Starter-Prompt.md');
        if (!prompt) return { ok: false, error: 'Starter prompt not found at 03-Operations/Reports/Claude-TopRanker-Starter-Prompt.md' };
        logAction('Claude TopRanker Review', 'Displayed starter prompt', 'Claude-TopRanker-Starter-Prompt.md');
        return { ok: true, output: 'TopRanker Review Prompt:\n\n' + prompt, type: 'prompt' };
      },
      'openai-daily-brief': () => {
        if (!process.env.OPENAI_API_KEY) {
          return { ok: false, error: 'OPENAI_API_KEY is not set.\n\nTo configure:\n  export OPENAI_API_KEY=sk-...\nthen restart the dashboard.' };
        }
        // Redirect to board runner for the full implementation
        return { ok: true, output: 'Use "Run Board of AI" to generate the OpenAI daily brief.\nThe board runner calls OpenAI as the Chief of Staff role.' };
      },
      'perplexity-research': () => {
        if (!process.env.PERPLEXITY_API_KEY) {
          return { ok: false, error: 'PERPLEXITY_API_KEY is not set.\n\nTo configure:\n  export PERPLEXITY_API_KEY=pplx-...\nthen restart the dashboard.' };
        }
        return { ok: true, output: 'Use "Run Board of AI" to run the Perplexity research scan.\nThe board runner calls Perplexity as the Research Director role.' };
      },
    };

    const handler = handlers[task];
    if (!handler) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Unknown AI task' }));
      return;
    }
    const result = handler();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result));
    return;
  }

  if (req.url?.startsWith('/api/file/')) {
    const relPath = decodeURIComponent(req.url.replace('/api/file/', ''));
    // Safety: only allow reading within RPGPO
    const fullPath = path.resolve(RPGPO_ROOT, relPath);
    if (!fullPath.startsWith(RPGPO_ROOT)) {
      res.writeHead(403); res.end('Forbidden'); return;
    }
    const content = readFile(relPath);
    if (content === null) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end(content);
    return;
  }

  // Static files
  let filePath = req.url === '/' ? '/index.html' : req.url;
  const ext = path.extname(filePath);
  const mimeTypes = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json' };
  const fullPath = path.join(__dirname, filePath);

  if (!fullPath.startsWith(__dirname)) {
    res.writeHead(403); res.end('Forbidden'); return;
  }

  fs.readFile(fullPath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  });
});

server.listen(PORT, () => {
  console.log(`\n  RPGPO Dashboard running at http://localhost:${PORT}\n`);
});
