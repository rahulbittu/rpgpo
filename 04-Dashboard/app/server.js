const http = require('http');
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const RPGPO_ROOT = path.resolve(__dirname, '../..');
const PORT = 3200;

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

  return { state, missions, briefs, approvals, logs, toprankerSummary, toprankerSynthesis };
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
    return { ok: true, output: out };
  } catch (e) {
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
