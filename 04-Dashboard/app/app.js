// RPGPO Command Center v3 — Premium Operations Client

let DATA = null, TASKS = [], STATUS = null;
const activity = [];
const MAX_ACT = 40;
let trackedTaskId = null;
let logFilter = 'all';
let evtSource = null;

// ── SSE ──

function connectSSE() {
  if (evtSource) try { evtSource.close(); } catch {}
  evtSource = new EventSource('/api/events');

  evtSource.addEventListener('connected', () => {
    console.log('[SSE] connected');
    document.getElementById('liveDot').classList.add('connected');
    document.getElementById('ssePill').classList.add('online');
    pushActivity('SSE connected');
  });

  evtSource.addEventListener('activity', (e) => {
    try {
      const d = JSON.parse(e.data);
      console.log('[SSE] activity:', d.action);
      pushActivity(d.action);
    } catch {}
  });

  evtSource.addEventListener('task', (e) => {
    try {
      const d = JSON.parse(e.data);
      console.log('[SSE] task:', d.event, d.task?.id, d.task?.status);
      if (d.task) {
        const i = TASKS.findIndex(t => t.id === d.task.id);
        if (i !== -1) TASKS[i] = d.task; else TASKS.unshift(d.task);
        renderTasks(); renderLatest();
        if (trackedTaskId === d.task.id) updateOutput(d.task);
      }
      loadTasks(); // full refresh
    } catch (err) { console.error('[SSE] parse err:', err); }
  });

  evtSource.onerror = () => {
    console.log('[SSE] error/closed');
    document.getElementById('liveDot').classList.remove('connected');
    document.getElementById('ssePill').classList.remove('online');
  };
}

function pushActivity(text) {
  const t = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  activity.unshift({ t, text });
  if (activity.length > MAX_ACT) activity.length = MAX_ACT;
  renderActivity();
}

function renderActivity() {
  const el = document.getElementById('activityFeed');
  if (!el) return;
  if (!activity.length) { el.innerHTML = '<div class="activity-empty">Waiting for events...</div>'; return; }
  el.innerHTML = activity.slice(0, 20).map(a =>
    `<div class="activity-item"><span class="activity-time">${a.t}</span><span class="activity-text">${esc(a.text)}</span></div>`
  ).join('');
}

// ── Navigation ──

document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', e => { e.preventDefault(); switchTab(l.dataset.tab); }));
function switchTab(tab) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const link = document.querySelector(`.nav-link[data-tab="${tab}"]`);
  if (link) link.classList.add('active');
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');
}

// ── Data Loading ──

async function loadData() {
  try { const r = await fetch('/api/data'); DATA = await r.json(); render(); } catch (e) { console.error('loadData:', e); }
}

async function loadStatus() {
  try { const r = await fetch('/api/status'); STATUS = await r.json(); renderStatus(); } catch (e) { console.error('loadStatus:', e); }
}

async function loadTasks() {
  try {
    const r = await fetch('/api/tasks'); TASKS = await r.json();
    renderTasks(); renderLatest();
    if (trackedTaskId) { const t = TASKS.find(x => x.id === trackedTaskId); if (t) updateOutput(t); }
  } catch {}
}

// ── Render Status ──

function renderStatus() {
  if (!STATUS) return;
  const s = STATUS;

  // Sidebar pills
  document.getElementById('serverPill').classList.add('online');
  document.getElementById('workerPill').classList.toggle('online', s.worker.running);

  // Sidebar text
  const up = s.server.uptime ? fmtUp(s.server.uptime) : '--';
  document.getElementById('sysStatus').textContent = `${up} :${s.server.port}`;

  // Home status bar
  setStatus('hsServer', 'Online', 'ok');
  setStatus('hsWorker', s.worker.running ? 'Running' : 'Stopped', s.worker.running ? 'ok' : 'err');

  const oai = s.keys.OPENAI_API_KEY === 'configured';
  const ppx = s.keys.PERPLEXITY_API_KEY === 'configured';
  const mc = 1 + (oai ? 1 : 0) + (ppx ? 1 : 0);
  setStatus('hsModels', `${mc}/3`, mc === 3 ? 'ok' : 'warn');

  // Approvals count
  if (DATA) {
    const ac = DATA.approvals.length;
    setStatus('hsApprovals', ac === 0 ? 'Clear' : ac + ' pending', ac === 0 ? 'ok' : 'warn');
  }

  // Settings model tags
  const oTag = document.getElementById('mOpenAI');
  oTag.textContent = oai ? 'Ready' : 'No Key';
  oTag.className = 'model-tag ' + (oai ? 'ready' : '');
  const pTag = document.getElementById('mPerplexity');
  pTag.textContent = ppx ? 'Ready' : 'No Key';
  pTag.className = 'model-tag ' + (ppx ? 'ready' : '');

  // Settings server
  const ss = document.getElementById('settingsServer');
  if (ss) ss.innerHTML = `
    <div class="settings-row"><span class="settings-label">Uptime</span>${up}</div>
    <div class="settings-row"><span class="settings-label">Port</span>${s.server.port}</div>
    <div class="settings-row"><span class="settings-label">Worker</span>${s.worker.running ? '<span style="color:var(--green)">Running</span>' : '<span style="color:var(--red)">Stopped</span>'}</div>
    <div class="settings-row"><span class="settings-label">Node</span>${esc(s.node)}</div>
  `;

  // Settings system
  const sy = document.getElementById('settingsSystem');
  if (sy) sy.innerHTML = `
    <div class="settings-row"><span class="settings-label">Workspace</span>${esc(s.workspace)}</div>
    <div class="settings-row"><span class="settings-label">OPENAI</span><span class="key-status ${oai ? 'key-ok' : 'key-miss'}">${oai ? 'configured' : 'missing'}</span></div>
    <div class="settings-row"><span class="settings-label">PERPLEXITY</span><span class="key-status ${ppx ? 'key-ok' : 'key-miss'}">${ppx ? 'configured' : 'missing'}</span></div>
  `;
}

function setStatus(id, text, cls) {
  const el = document.getElementById(id);
  if (el) { el.textContent = text; el.className = 'status-value ' + cls; }
}

function fmtUp(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h' + (m % 60) + 'm';
  return Math.floor(h / 24) + 'd' + (h % 24) + 'h';
}

// ── Render Tasks ──

function renderTasks() {
  const list = document.getElementById('taskQueueList');
  const badge = document.getElementById('taskQueueCount');
  if (!list) return;
  badge.textContent = TASKS.length + ' task' + (TASKS.length !== 1 ? 's' : '');

  // Home queue count
  const running = TASKS.filter(t => t.status === 'running').length;
  const queued = TASKS.filter(t => t.status === 'queued').length;
  if (running > 0) setStatus('hsQueue', running + ' running', 'warn');
  else if (queued > 0) setStatus('hsQueue', queued + ' queued', 'warn');
  else setStatus('hsQueue', 'Idle', 'ok');

  if (!TASKS.length) { list.innerHTML = '<div class="task-empty">No tasks</div>'; return; }
  list.innerHTML = TASKS.slice(0, 25).map(taskRow).join('');

  // Home recent
  const hr = document.getElementById('homeRecentTasks');
  if (hr) hr.innerHTML = TASKS.length ? TASKS.slice(0, 8).map(taskRow).join('') : '<div class="task-empty">No tasks yet</div>';
}

function taskRow(t) {
  const tm = new Date(t.updatedAt || t.createdAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
  return `<div class="task-row" onclick="showTask('${t.id}')">
    <span class="task-dot ${t.status}"></span>
    <span class="task-name">${esc(t.label)}</span>
    <span class="task-badge ${t.status}">${t.status}</span>
    <span class="task-time">${tm}</span>
  </div>`;
}

function renderLatest() {
  const el = document.getElementById('homeLatestTask');
  if (!el) return;
  const done = TASKS.filter(t => t.status === 'done' || t.status === 'failed');
  if (!done.length) { el.innerHTML = '<div class="task-empty">No completed tasks yet</div>'; return; }
  const t = done[0];
  const clr = t.status === 'done' ? 'var(--green)' : 'var(--red)';
  const tm = new Date(t.updatedAt).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
  el.innerHTML = `<div class="latest-task">
    <div class="task-row" onclick="showTask('${t.id}')">
      <span class="task-dot ${t.status}"></span>
      <span class="task-name">${esc(t.label)}</span>
      <span class="task-badge ${t.status}">${t.status}</span>
      <span class="task-time">${tm}</span>
    </div>
    ${t.output ? '<pre>' + esc(t.output.slice(0, 300)) + '</pre>' : ''}
    ${t.error ? '<pre style="color:var(--red)">' + esc(t.error.slice(0, 200)) + '</pre>' : ''}
    ${t.filesWritten && t.filesWritten.length ? '<pre style="color:var(--blue)">Files: ' + esc(t.filesWritten.join(', ')) + '</pre>' : ''}
  </div>`;
}

function showTask(id) {
  const t = TASKS.find(x => x.id === id);
  if (!t) return;
  let b = `Task:    ${t.label}\nType:    ${t.type}\nStatus:  ${t.status}\nCreated: ${t.createdAt}\nUpdated: ${t.updatedAt}\n`;
  if (t.error) b += `\n── Error ──\n${t.error}`;
  if (t.output) b += `\n── Output ──\n${t.output}`;
  if (t.filesWritten?.length) b += `\n── Files Written ──\n${t.filesWritten.join('\n')}`;
  document.getElementById('taskModalTitle').textContent = `${t.label} [${t.status.toUpperCase()}]`;
  document.getElementById('taskModalBody').textContent = b;
  document.getElementById('taskModal').classList.add('open');
}

function closeTaskModal(e) { if (e.target === e.currentTarget) document.getElementById('taskModal').classList.remove('open'); }

// ── Output Panel ──

function updateOutput(task) {
  const log = document.getElementById('controlLog');
  if (!log) return;
  const icon = { done: 'DONE', failed: 'FAIL', running: 'RUN', queued: 'WAIT' }[task.status] || '??';
  let t = `[${icon}] ${task.label} (${task.type})\nStatus: ${task.status} | ${task.updatedAt}\n`;
  if (task.status === 'running') {
    t += '\nExecuting...\n';
    if (task.output) t += '\n' + task.output;
  }
  if (task.status === 'done') {
    if (task.output) t += '\n' + task.output;
    if (task.filesWritten?.length) t += '\n\nFiles:\n' + task.filesWritten.map(f => '  ' + f).join('\n');
    t += '\n\nCompleted.';
    trackedTaskId = null;
  }
  if (task.status === 'failed') {
    t += '\nError: ' + (task.error || 'Unknown');
    trackedTaskId = null;
  }
  log.textContent = t;
}

// ── Render All ──

function render() {
  if (!DATA) return;
  renderHome(); renderMissions(); renderBrief(); renderApprovals(); renderLogs(); renderTopRanker();
}

// ── Home ──

function renderHome() {
  const s = DATA.state;
  document.getElementById('homeDate').textContent =
    new Date().toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });

  const ul = document.getElementById('homePriorities');
  ul.innerHTML = (s.top_priorities || []).map(p => `<li>${esc(p)}</li>`).join('') || '<li style="color:var(--text-faint)">None set</li>';

  const ap = document.getElementById('homeApprovals');
  if (!DATA.approvals.length) {
    ap.innerHTML = '<div style="color:var(--text-faint);font-size:11px">All clear</div>';
  } else {
    ap.innerHTML = DATA.approvals.map(a =>
      `<div class="approval-pill" onclick="switchTab('approvals')">${esc(a.name)}</div>`
    ).join('');
  }

  const md = document.getElementById('homeMissions');
  md.innerHTML = DATA.missions.map(m => {
    const bc = badgeClass(m.status);
    const isTR = m.mission === 'TopRanker';
    return `<div class="home-mission">
      <span>${isTR ? '<strong style="color:var(--accent)">' + esc(m.mission) + '</strong>' : esc(m.mission)}</span>
      <span class="mission-badge ${bc}">${esc(m.status)}</span>
    </div>`;
  }).join('');

  // Update approvals count in status bar
  setStatus('hsApprovals', DATA.approvals.length === 0 ? 'Clear' : DATA.approvals.length + ' pending', DATA.approvals.length === 0 ? 'ok' : 'warn');
}

// ── Missions ──

function renderMissions() {
  document.getElementById('missionCards').innerHTML = DATA.missions.map(m => {
    const flag = m.mission === 'TopRanker';
    const bc = badgeClass(m.status);
    return `<div class="mission-card ${flag ? 'flagship' : ''}">
      <div style="display:flex;align-items:center;gap:5px">
        <span class="mission-name">${esc(m.mission)}</span>
        ${flag ? '<span class="badge-flagship">Flagship</span>' : ''}
      </div>
      <span class="mission-badge ${bc}">${esc(m.status)}</span>
      <div class="mission-section"><strong>Objective</strong>${esc(m.objective)}</div>
      <div class="mission-section"><strong>Progress</strong>${fmtList(m.progress)}</div>
      <div class="mission-section"><strong>Blockers</strong>${fmtList(m.blockers)}</div>
      <div class="mission-section"><strong>Next</strong>${fmtList(m.nextActions)}</div>
      <div class="mission-section"><strong>Owner</strong>${esc(m.owner)}</div>
    </div>`;
  }).join('');
}

// ── Brief ──

function renderBrief() {
  const c = document.getElementById('briefContent');
  if (!DATA.briefs.length) { c.innerHTML = '<p style="color:var(--text-faint)">No briefs found</p>'; return; }
  c.innerHTML = md2html(DATA.briefs[0].content);
}

// ── Approvals ──

function renderApprovals() {
  const c = document.getElementById('approvalsList');
  if (!DATA.approvals.length) { c.innerHTML = '<div class="card"><p style="color:var(--text-faint)">No pending approvals</p></div>'; return; }
  c.innerHTML = DATA.approvals.map(a => {
    const rm = a.content.match(/## Risk Level\s*\n(\w+)/);
    const risk = rm ? rm[1].toLowerCase() : 'yellow';
    const am = a.content.match(/## Proposed Action\s*\n(.+)/);
    const action = am ? am[1] : a.name;
    const sid = a.name.replace(/[^a-zA-Z0-9]/g, '_');
    return `<div class="approval-card" id="ap-${sid}">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h4>${esc(action)}</h4>
        <span class="risk-badge risk-${risk}">${risk}</span>
      </div>
      <div class="md-content" style="margin-top:4px;max-height:160px;overflow-y:auto">${md2html(a.content)}</div>
      <div class="approval-actions" id="act-${sid}">
        <button class="btn-approve" onclick="doApproval('${a.name}','approve','${sid}')">Approve</button>
        <button class="btn-reject" onclick="doApproval('${a.name}','reject','${sid}')">Reject</button>
      </div>
    </div>`;
  }).join('');
}

// ── Logs ──

function renderLogs() {
  const c = document.getElementById('logsList');
  const all = [];
  (DATA.logs || []).forEach(l => all.push({ name: l.name, content: l.content, type: 'agent' }));
  (DATA.decisionLogs || []).forEach(l => all.push({ name: l.name, content: l.content, type: 'decision' }));
  if (!all.length) { c.innerHTML = '<div class="card"><p style="color:var(--text-faint)">No logs found</p></div>'; return; }
  all.sort((a, b) => b.name.localeCompare(a.name));
  const filtered = logFilter === 'all' ? all : all.filter(l => l.type === logFilter);
  c.innerHTML = filtered.map(l => {
    const color = l.type === 'decision' ? 'yellow' : 'green';
    const label = l.type === 'decision' ? 'Decision' : 'Agent';
    return `<div class="log-entry">
      <div style="display:flex;justify-content:space-between;align-items:center">
        <h4>${esc(l.name)}</h4>
        <span class="risk-badge risk-${color}" style="font-size:9px">${label}</span>
      </div>
      <pre>${esc(l.content)}</pre>
    </div>`;
  }).join('');
}

function filterLogs(f) {
  logFilter = f;
  document.querySelectorAll('#logFilters .qa-btn').forEach(b => {
    b.style.borderColor = b.dataset.filter === f ? 'var(--accent)' : '';
    b.style.color = b.dataset.filter === f ? 'var(--text)' : '';
  });
  if (DATA) renderLogs();
}

// ── TopRanker ──

function renderTopRanker() {
  const m = DATA.missions.find(x => x.mission === 'TopRanker');
  const st = document.getElementById('trStatus');
  if (m) {
    st.innerHTML = `<h3>Status</h3>
      <span class="mission-badge active">${esc(m.status)}</span>
      <div class="mission-section"><strong>Objective</strong>${esc(m.objective)}</div>
      <div class="mission-section"><strong>Blockers</strong>${fmtList(m.blockers)}</div>
      <div class="mission-section"><strong>Next</strong>${fmtList(m.nextActions)}</div>`;
  }

  document.getElementById('trFacts').innerHTML = `<h3>Profile</h3>
    <ul style="list-style:none;padding:0">
      <li><strong>Stack:</strong> Expo/RN + Express + PostgreSQL</li>
      <li><strong>Tests:</strong> 10,827 across 616 files</li>
      <li><strong>Source:</strong> 1,054 TypeScript files</li>
      <li><strong>Cities:</strong> 5 active + 6 beta</li>
      <li><strong>DB:</strong> 34 tables via Drizzle ORM</li>
      <li><strong>Loop:</strong> Rate &rarr; Consequence &rarr; Ranking</li>
    </ul>`;

  const sum = document.getElementById('trSummary');
  if (DATA.toprankerSummary) sum.innerHTML = '<h3>Operating Summary</h3>' + md2html(DATA.toprankerSummary);
}

// ── Actions ──

async function submitTask(type, label) {
  const log = document.getElementById('controlLog');
  log.textContent = `Submitting: ${label}...\n`;
  pushActivity(`Submitted: ${label}`);
  try {
    const r = await fetch('/api/tasks/submit', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ type, label }) });
    const d = await r.json();
    if (d.ok) {
      trackedTaskId = d.task.id;
      log.textContent = `[QUEUED] ${label}\nID: ${d.task.id}\nWaiting for worker...\n`;
      console.log('[task] tracking:', d.task.id);
      loadTasks();
    } else log.textContent += 'Error: ' + d.error;
  } catch (e) { log.textContent += 'Failed: ' + e.message; }
}

async function launchClaude() {
  const log = document.getElementById('controlLog');
  log.textContent = 'Launching Claude...\n';
  try {
    const r = await fetch('/api/launch-claude', { method: 'POST' });
    const d = await r.json();
    log.textContent += d.ok ? d.output : 'Error: ' + d.error;
  } catch (e) { log.textContent += 'Failed: ' + e.message; }
}

async function runAiTask(task) {
  const log = document.getElementById('controlLog');
  log.textContent = `AI task: ${task}...\n`;
  try {
    const r = await fetch('/api/ai/' + task, { method: 'POST' });
    const d = await r.json();
    log.textContent += d.ok ? d.output : 'Error: ' + d.error;
  } catch (e) { log.textContent += 'Failed: ' + e.message; }
}

async function doApproval(filename, decision, sid) {
  const div = document.getElementById('act-' + sid);
  if (!div) return;
  div.querySelectorAll('button').forEach(b => b.disabled = true);
  const ep = decision === 'approve' ? '/api/approval/approve' : '/api/approval/reject';
  try {
    const r = await fetch(ep, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ filename }) });
    const d = await r.json();
    if (d.ok) {
      const c = d.decision === 'Approved' ? 'var(--green)' : 'var(--red)';
      div.innerHTML = `<span class="approval-decided" style="color:${c}">${d.decision}</span>`;
      pushActivity(`${d.decision}: ${filename}`);
      setTimeout(loadData, 600);
    } else div.innerHTML = `<span style="color:var(--red);font-size:11px">Error: ${esc(d.error)}</span>`;
  } catch (e) { div.innerHTML = `<span style="color:var(--red);font-size:11px">Failed: ${esc(e.message)}</span>`; }
}

// ── Modals ──

function closeModal(e) { if (e.target === e.currentTarget) document.getElementById('modal').classList.remove('open'); }

// ── Helpers ──

function badgeClass(status) {
  const s = (status || '').toLowerCase().replace(/\s+/g, '-');
  if (s === 'active') return 'active';
  if (s === 'needs-decision') return 'needs-decision';
  if (s === 'research-only') return 'research-only';
  return 'active';
}

function fmtList(text) {
  if (!text) return '<span style="color:var(--text-faint)">None</span>';
  const items = text.split('\n').filter(l => l.startsWith('- ')).map(l => l.slice(2));
  if (!items.length) return `<span style="font-size:11px">${esc(text)}</span>`;
  return '<ul style="list-style:disc;padding-left:12px;margin:2px 0">' +
    items.map(i => `<li style="font-size:11px;padding:1px 0;border:none">${esc(i)}</li>`).join('') + '</ul>';
}

function esc(s) { return s ? s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;') : ''; }

function md2html(md) {
  if (!md) return '';
  return md
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/^\|(.+)\|$/gm, m => {
      const c = m.split('|').filter(x => x.trim()).map(x => x.trim());
      if (c.every(x => /^[-:]+$/.test(x))) return '<!-- sep -->';
      return '<tr>' + c.map(x => `<td>${x}</td>`).join('') + '</tr>';
    })
    .replace(/((<tr>.*<\/tr>\n?)+)/g, '<table>$1</table>')
    .replace(/<!-- sep -->\n?/g, '')
    .replace(/^#### (.+)$/gm, '<h4>$1</h4>')
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm, '<h2>$1</h2>')
    .replace(/^# (.+)$/gm, '<h1>$1</h1>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/^- (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>')
    .replace(/^(?!<[htul1]|<!)((?!<li|<td).+)$/gm, '<p>$1</p>')
    .replace(/<p>---<\/p>/g, '<hr>')
    .replace(/<p>\s*<\/p>/g, '');
}

// ── Init ──

connectSSE();
loadData();
loadStatus();
loadTasks();

setInterval(loadStatus, 12000);
setInterval(loadTasks, 3000);
setInterval(loadData, 45000);
