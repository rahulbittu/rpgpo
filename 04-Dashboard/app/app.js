// RPGPO Dashboard v2 — Client with SSE, task queue, live activity feed

let DATA = null;
let TASKS = [];
let STATUS = null;
const activityLog = [];
const MAX_ACTIVITY = 50;

// --- SSE Connection ---

let evtSource = null;

function connectSSE() {
  if (evtSource) { try { evtSource.close(); } catch {} }
  evtSource = new EventSource('/api/events');

  evtSource.addEventListener('connected', () => {
    document.getElementById('liveDot').classList.add('connected');
    addActivity('SSE connected');
  });

  evtSource.addEventListener('activity', (e) => {
    try {
      const data = JSON.parse(e.data);
      addActivity(data.action);
    } catch {}
  });

  evtSource.addEventListener('task', (e) => {
    try {
      const data = JSON.parse(e.data);
      if (data.event === 'task_added' || data.event === 'task_updated') {
        loadTasks();
      }
    } catch {}
  });

  evtSource.onerror = () => {
    document.getElementById('liveDot').classList.remove('connected');
  };
}

function addActivity(text) {
  const now = new Date();
  const time = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  activityLog.unshift({ time, text });
  if (activityLog.length > MAX_ACTIVITY) activityLog.length = MAX_ACTIVITY;
  renderActivityFeed();
}

function renderActivityFeed() {
  const feed = document.getElementById('activityFeed');
  if (!feed) return;
  if (activityLog.length === 0) {
    feed.innerHTML = '<div class="activity-empty">Waiting for events...</div>';
    return;
  }
  feed.innerHTML = activityLog.slice(0, 20).map(a =>
    `<div class="activity-item">
      <span class="activity-time">${a.time}</span>
      <span class="activity-text">${escapeHtml(a.text)}</span>
    </div>`
  ).join('');
}

// --- Tab navigation ---

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    switchTab(link.dataset.tab);
  });
});

function switchTab(tab) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const link = document.querySelector(`.nav-link[data-tab="${tab}"]`);
  if (link) link.classList.add('active');
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');
}

// --- Load data ---

async function loadData() {
  try {
    const res = await fetch('/api/data');
    DATA = await res.json();
    render();
  } catch (e) {
    console.error('Failed to load data:', e);
  }
}

async function loadStatus() {
  try {
    const res = await fetch('/api/status');
    STATUS = await res.json();
    renderStatus();
  } catch (e) {
    console.error('Failed to load status:', e);
  }
}

async function loadTasks() {
  try {
    const res = await fetch('/api/tasks');
    TASKS = await res.json();
    renderTasks();
    renderHomeRecentTasks();
  } catch {}
}

// --- Render status ---

function renderStatus() {
  if (!STATUS) return;

  // Sidebar pills
  const serverPill = document.getElementById('serverPill');
  const workerPill = document.getElementById('workerPill');
  serverPill.classList.add('online');
  workerPill.classList.toggle('online', STATUS.worker.running);

  // Sidebar text
  const sysStatus = document.getElementById('sysStatus');
  const uptime = STATUS.server.uptime ? formatUptime(STATUS.server.uptime) : '--';
  sysStatus.textContent = `Up ${uptime} | :${STATUS.server.port}`;

  // Home status bar
  const homeServer = document.getElementById('homeServerStatus');
  homeServer.textContent = 'Online';
  homeServer.className = 'status-value ok';

  const homeWorker = document.getElementById('homeWorkerStatus');
  homeWorker.textContent = STATUS.worker.running ? 'Running' : 'Stopped';
  homeWorker.className = 'status-value ' + (STATUS.worker.running ? 'ok' : 'err');

  const homeModels = document.getElementById('homeModelStatus');
  const openaiOk = STATUS.keys.OPENAI_API_KEY === 'configured';
  const perpOk = STATUS.keys.PERPLEXITY_API_KEY === 'configured';
  const modelCount = 1 + (openaiOk ? 1 : 0) + (perpOk ? 1 : 0); // Claude always available
  homeModels.textContent = `${modelCount}/3 ready`;
  homeModels.className = 'status-value ' + (modelCount === 3 ? 'ok' : 'warn');

  // Settings model badges
  const openaiTag = document.getElementById('modelOpenAI');
  openaiTag.textContent = openaiOk ? 'Ready' : 'No Key';
  openaiTag.className = 'model-tag ' + (openaiOk ? 'ready' : '');

  const perpTag = document.getElementById('modelPerplexity');
  perpTag.textContent = perpOk ? 'Ready' : 'No Key';
  perpTag.className = 'model-tag ' + (perpOk ? 'ready' : '');

  // Settings server
  const settingsServer = document.getElementById('settingsServer');
  if (settingsServer) {
    settingsServer.innerHTML = `
      <div class="settings-row"><span class="settings-label">Uptime</span> ${uptime}</div>
      <div class="settings-row"><span class="settings-label">Port</span> ${STATUS.server.port}</div>
      <div class="settings-row"><span class="settings-label">Worker</span> ${STATUS.worker.running ? '<span style="color:var(--green)">Running</span>' : '<span style="color:var(--red)">Stopped</span>'}</div>
      <div class="settings-row"><span class="settings-label">Node</span> ${escapeHtml(STATUS.node)}</div>
    `;
  }

  // Settings keys
  const keysDiv = document.getElementById('settingsKeys');
  if (keysDiv) {
    keysDiv.innerHTML = Object.entries(STATUS.keys).map(([key, status]) => {
      const cls = status === 'configured' ? 'key-configured' : 'key-missing';
      return `<div class="settings-row">
        <span class="settings-label">${escapeHtml(key.replace('_API_KEY', ''))}</span>
        <span class="key-status ${cls}">${status}</span>
      </div>`;
    }).join('');
  }

  // Settings system
  const sysDiv = document.getElementById('settingsSystem');
  if (sysDiv) {
    sysDiv.innerHTML = `
      <div class="settings-row"><span class="settings-label">Workspace</span> ${escapeHtml(STATUS.workspace)}</div>
      <div class="settings-row"><span class="settings-label">Node</span> ${escapeHtml(STATUS.node)}</div>
    `;
  }
}

function formatUptime(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ' + (m % 60) + 'm';
  const d = Math.floor(h / 24);
  return d + 'd ' + (h % 24) + 'h';
}

// --- Render task queue ---

function renderTasks() {
  const list = document.getElementById('taskQueueList');
  const countBadge = document.getElementById('taskQueueCount');
  if (!list) return;

  countBadge.textContent = TASKS.length + ' task' + (TASKS.length !== 1 ? 's' : '');

  // Home task count
  const homeTaskCount = document.getElementById('homeTaskCount');
  const running = TASKS.filter(t => t.status === 'running').length;
  const queued = TASKS.filter(t => t.status === 'queued').length;
  if (running > 0) {
    homeTaskCount.textContent = `${running} running`;
    homeTaskCount.className = 'status-value warn';
  } else if (queued > 0) {
    homeTaskCount.textContent = `${queued} queued`;
    homeTaskCount.className = 'status-value warn';
  } else {
    homeTaskCount.textContent = 'Idle';
    homeTaskCount.className = 'status-value ok';
  }

  if (TASKS.length === 0) {
    list.innerHTML = '<div class="task-empty">No tasks in queue.</div>';
    return;
  }

  list.innerHTML = TASKS.slice(0, 20).map(t => {
    const time = new Date(t.updatedAt || t.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    return `<div class="task-row" onclick="showTaskDetail('${t.id}')">
      <span class="task-status-dot ${t.status}"></span>
      <span class="task-label">${escapeHtml(t.label)}</span>
      <span class="task-type-badge">${escapeHtml(t.type)}</span>
      <span class="task-time">${time}</span>
    </div>`;
  }).join('');
}

function renderHomeRecentTasks() {
  const container = document.getElementById('homeRecentTasks');
  if (!container) return;

  if (TASKS.length === 0) {
    container.innerHTML = '<div class="task-empty">No tasks yet.</div>';
    return;
  }

  container.innerHTML = TASKS.slice(0, 8).map(t => {
    const time = new Date(t.updatedAt || t.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
    return `<div class="task-row" onclick="showTaskDetail('${t.id}')">
      <span class="task-status-dot ${t.status}"></span>
      <span class="task-label">${escapeHtml(t.label)}</span>
      <span class="task-time">${time}</span>
    </div>`;
  }).join('');
}

function showTaskDetail(id) {
  const task = TASKS.find(t => t.id === id);
  if (!task) return;
  const title = `${task.label} [${task.status}]`;
  let body = `Type:    ${task.type}\nStatus:  ${task.status}\nCreated: ${task.createdAt}\nUpdated: ${task.updatedAt}\n`;
  if (task.error) body += `\nError:\n${task.error}`;
  if (task.output) body += `\nOutput:\n${task.output}`;
  if (task.filesWritten && task.filesWritten.length) body += `\nFiles Written:\n${task.filesWritten.join('\n')}`;

  document.getElementById('taskModalTitle').textContent = title;
  document.getElementById('taskModalBody').textContent = body;
  document.getElementById('taskModal').classList.add('open');
}

function closeTaskModal(event) {
  if (event.target === event.currentTarget) {
    document.getElementById('taskModal').classList.remove('open');
  }
}

// --- Render all sections ---

function render() {
  if (!DATA) return;
  renderHome();
  renderMissions();
  renderBrief();
  renderApprovals();
  renderLogs();
  renderTopRanker();
}

// --- HOME ---
function renderHome() {
  const s = DATA.state;
  document.getElementById('homeDate').textContent =
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Priorities
  const ul = document.getElementById('homePriorities');
  ul.innerHTML = (s.top_priorities || []).map(p => `<li>${escapeHtml(p)}</li>`).join('');

  // Approvals
  const appDiv = document.getElementById('homeApprovals');
  if (DATA.approvals.length === 0) {
    appDiv.innerHTML = '<p style="color:var(--text-muted);font-size:12px;">No pending approvals.</p>';
  } else {
    appDiv.innerHTML = DATA.approvals.map(a =>
      `<div class="approval-pill" onclick="switchTab('approvals')">${escapeHtml(a.name)}</div>`
    ).join('');
  }

  // Mission health
  const md = document.getElementById('homeMissions');
  md.innerHTML = DATA.missions.map(m => {
    const cls = statusClass(m.status);
    return `<div class="home-mission">
      <span>${m.mission === 'TopRanker' ? '<strong style="color:var(--accent)">' + escapeHtml(m.mission) + '</strong>' : escapeHtml(m.mission)}</span>
      <span class="mission-status ${cls}">${escapeHtml(m.status)}</span>
    </div>`;
  }).join('');
}

// --- MISSIONS ---
function renderMissions() {
  const container = document.getElementById('missionCards');
  container.innerHTML = DATA.missions.map(m => {
    const isFlagship = m.mission === 'TopRanker';
    const cls = statusClass(m.status);
    return `<div class="mission-card ${isFlagship ? 'flagship-card' : ''}">
      <div style="display:flex;align-items:center;gap:6px;">
        <span class="mission-name">${escapeHtml(m.mission)}</span>
        ${isFlagship ? '<span class="badge-flagship">Flagship</span>' : ''}
      </div>
      <span class="mission-status ${cls}">${escapeHtml(m.status)}</span>
      <div class="mission-section"><strong>Objective</strong>${escapeHtml(m.objective)}</div>
      <div class="mission-section"><strong>Recent Progress</strong>${formatList(m.progress)}</div>
      <div class="mission-section"><strong>Blockers</strong>${formatList(m.blockers)}</div>
      <div class="mission-section"><strong>Next Actions</strong>${formatList(m.nextActions)}</div>
      <div class="mission-section"><strong>Owner</strong>${escapeHtml(m.owner)}</div>
    </div>`;
  }).join('');
}

// --- DAILY BRIEF ---
function renderBrief() {
  const container = document.getElementById('briefContent');
  if (DATA.briefs.length === 0) {
    container.innerHTML = '<p style="color:var(--text-muted)">No daily briefs found.</p>';
    return;
  }
  container.innerHTML = md2html(DATA.briefs[0].content);
}

// --- APPROVALS ---
function renderApprovals() {
  const container = document.getElementById('approvalsList');
  if (DATA.approvals.length === 0) {
    container.innerHTML = '<div class="card"><p style="color:var(--text-muted)">No pending approvals. All clear.</p></div>';
    return;
  }
  container.innerHTML = DATA.approvals.map(a => {
    const riskMatch = a.content.match(/## Risk Level\s*\n(\w+)/);
    const risk = riskMatch ? riskMatch[1].toLowerCase() : 'yellow';
    const actionMatch = a.content.match(/## Proposed Action\s*\n(.+)/);
    const action = actionMatch ? actionMatch[1] : a.name;
    const safeId = a.name.replace(/[^a-zA-Z0-9]/g, '_');
    return `<div class="approval-card" id="approval-${safeId}">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h4>${escapeHtml(action)}</h4>
        <span class="risk-badge risk-${risk}">${risk} risk</span>
      </div>
      <div class="md-content" style="margin-top:6px;max-height:200px;overflow-y:auto;">${md2html(a.content)}</div>
      <div class="approval-actions" id="actions-${safeId}">
        <button class="btn-approve" onclick="handleApproval('${a.name}', 'approve', '${safeId}')">Approve</button>
        <button class="btn-reject" onclick="handleApproval('${a.name}', 'reject', '${safeId}')">Reject</button>
      </div>
    </div>`;
  }).join('');
}

// --- LOGS ---
function renderLogs() {
  const container = document.getElementById('logsList');
  const allLogs = [];
  (DATA.logs || []).forEach(l => allLogs.push({ name: l.name, content: l.content, type: 'Agent Run' }));
  (DATA.decisionLogs || []).forEach(l => allLogs.push({ name: l.name, content: l.content, type: 'Decision' }));

  if (allLogs.length === 0) {
    container.innerHTML = '<div class="card"><p style="color:var(--text-muted)">No logs found.</p></div>';
    return;
  }

  allLogs.sort((a, b) => b.name.localeCompare(a.name));
  container.innerHTML = allLogs.map(l =>
    `<div class="log-entry">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h4>${escapeHtml(l.name)}</h4>
        <span class="risk-badge risk-${l.type === 'Decision' ? 'yellow' : 'green'}" style="font-size:10px">${l.type}</span>
      </div>
      <pre>${escapeHtml(l.content)}</pre>
    </div>`
  ).join('');
}

// --- TOPRANKER ---
function renderTopRanker() {
  const trMission = DATA.missions.find(m => m.mission === 'TopRanker');
  const statusDiv = document.getElementById('trStatus');
  if (trMission) {
    statusDiv.innerHTML = `
      <h3>Mission Status</h3>
      <span class="mission-status status-active">${escapeHtml(trMission.status)}</span>
      <div class="mission-section"><strong>Objective</strong>${escapeHtml(trMission.objective)}</div>
      <div class="mission-section"><strong>Blockers</strong>${formatList(trMission.blockers)}</div>
      <div class="mission-section"><strong>Next Actions</strong>${formatList(trMission.nextActions)}</div>
    `;
  }

  document.getElementById('trQuickFacts').innerHTML = `
    <h3>Quick Facts</h3>
    <ul style="list-style:none;padding:0;">
      <li><strong>Type:</strong> Community-ranked local business leaderboard</li>
      <li><strong>Stack:</strong> Expo/React Native + Express.js + PostgreSQL</li>
      <li><strong>Tests:</strong> 10,827 across 616 files</li>
      <li><strong>Source:</strong> 1,054 TypeScript files</li>
      <li><strong>Active:</strong> 5 Texas cities + 6 beta</li>
      <li><strong>Core Loop:</strong> Rate &rarr; Consequence &rarr; Ranking</li>
    </ul>
  `;

  const summaryDiv = document.getElementById('trSummary');
  if (DATA.toprankerSummary) {
    summaryDiv.innerHTML = '<h3>Operating Summary</h3>' + md2html(DATA.toprankerSummary);
  }
}

// --- Task submission (via queue) ---

async function submitTask(type, label) {
  const log = document.getElementById('controlLog');
  log.textContent = `Submitting task: ${label}...\n`;
  addActivity(`Task submitted: ${label}`);

  try {
    const res = await fetch('/api/tasks/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, label })
    });
    const result = await res.json();
    if (result.ok) {
      log.textContent += `Queued as ${result.task.id}. Worker will pick it up.\n`;
      loadTasks();
    } else {
      log.textContent += 'Error: ' + result.error;
    }
  } catch (e) {
    log.textContent += 'Failed: ' + e.message;
  }
}

// --- Direct actions ---

async function launchClaude() {
  const log = document.getElementById('controlLog');
  log.textContent = 'Launching Claude session...\n';
  try {
    const res = await fetch('/api/launch-claude', { method: 'POST' });
    const result = await res.json();
    log.textContent += result.ok ? result.output : 'Error: ' + result.error;
  } catch (e) {
    log.textContent += 'Failed: ' + e.message;
  }
}

async function runAiTask(task) {
  const log = document.getElementById('controlLog');
  log.textContent = `Running AI task: ${task}...\n`;
  try {
    const res = await fetch('/api/ai/' + task, { method: 'POST' });
    const result = await res.json();
    log.textContent += result.ok ? result.output : 'Error: ' + result.error;
  } catch (e) {
    log.textContent += 'Failed: ' + e.message;
  }
}

// --- Approval actions ---

async function handleApproval(filename, decision, safeId) {
  const actionsDiv = document.getElementById('actions-' + safeId);
  if (!actionsDiv) return;
  actionsDiv.querySelectorAll('button').forEach(b => b.disabled = true);

  const endpoint = decision === 'approve' ? '/api/approval/approve' : '/api/approval/reject';
  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename })
    });
    const result = await res.json();
    if (result.ok) {
      const color = result.decision === 'Approved' ? 'var(--green)' : 'var(--red)';
      actionsDiv.innerHTML = `<span class="approval-decided" style="color:${color}">${result.decision}</span>`;
      addActivity(`${result.decision}: ${filename}`);
      setTimeout(() => loadData(), 800);
    } else {
      actionsDiv.innerHTML = `<span style="color:var(--red);font-size:12px;">Error: ${escapeHtml(result.error)}</span>`;
    }
  } catch (e) {
    actionsDiv.innerHTML = `<span style="color:var(--red);font-size:12px;">Failed: ${escapeHtml(e.message)}</span>`;
  }
}

// --- File viewer ---

async function openFile(relPath) {
  try {
    const res = await fetch('/api/file/' + encodeURIComponent(relPath));
    const text = await res.text();
    document.getElementById('modalTitle').textContent = relPath;
    document.getElementById('modalBody').textContent = text;
    document.getElementById('modal').classList.add('open');
  } catch (e) {
    alert('Failed to open file: ' + e.message);
  }
}

function closeModal(event) {
  if (event.target === event.currentTarget) {
    document.getElementById('modal').classList.remove('open');
  }
}

// --- Helpers ---

function statusClass(status) {
  const s = (status || '').toLowerCase().replace(/\s+/g, '-');
  if (s === 'active') return 'status-active';
  if (s === 'needs-decision') return 'status-needs-decision';
  if (s === 'research-only') return 'status-research-only';
  return 'status-active';
}

function formatList(text) {
  if (!text) return '<span style="color:var(--text-muted)">None</span>';
  const items = text.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2));
  if (items.length === 0) return `<span style="font-size:12px">${escapeHtml(text)}</span>`;
  return '<ul style="list-style:disc;padding-left:14px;margin:3px 0;">' +
    items.map(i => `<li style="font-size:12px;padding:1px 0;border:none;">${escapeHtml(i)}</li>`).join('') +
    '</ul>';
}

function escapeHtml(s) {
  if (!s) return '';
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function md2html(md) {
  if (!md) return '';
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim()).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return '<!-- separator -->';
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    .replace(/((<tr>.*<\/tr>\n?)+)/g, '<table>$1</table>')
    .replace(/<!-- separator -->\n?/g, '')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, (m) => '<ul>' + m + '</ul>')
    .replace(/^(?!<[htul1]|<!)((?!<li|<td).+)$/gm, '<p>$1</p>')
    .replace(/<p>---<\/p>/g, '<hr>')
    .replace(/<p>\s*<\/p>/g, '');
}

// --- Init ---

connectSSE();
loadData();
loadStatus();
loadTasks();

// Poll status and tasks periodically
setInterval(loadStatus, 15000);
setInterval(loadTasks, 5000);
// Reload dashboard data every 60s
setInterval(loadData, 60000);
