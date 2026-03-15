// GPO Command Center v7 — Premium Private Operations Console

// Domain name display mapping
const DOMAIN_LABELS = {
  topranker: 'TopRanker', newsroom: 'News', shopping: 'Shopping', startup: 'Code',
  legal: 'Legal', screenwriting: 'Creative', music: 'Music', calendar: 'Calendar',
  chief_of_staff: 'Planning', career: 'Career', careeregine: 'Career',
  health: 'Health', finance: 'Income', wealthresearch: 'Income',
  travel: 'Travel', research: 'Research', home: 'Home', communications: 'Writing',
  personalops: 'Personal', general: 'General',
};
function domainLabel(d) { return DOMAIN_LABELS[d] || d; }

let DATA = null, TASKS = [], STATUS = null, COSTS = null, COST_SETTINGS = null;
let INTAKE_TASKS = [];
let intakeFilter = 'all';
let selectedIntakeTaskId = null;
const activity = [];
const MAX_ACT = 50;
let trackedTaskId = null;
let logFilter = 'all';
let taskFilter = 'all';
let activeChannel = 'claude';
let evtSource = null;
let sseReconnectTimer = null;
let workerLastSeen = null;
let currentlyRunningTask = null;

// ═══════════════════════════════════════════
// SSE
// ═══════════════════════════════════════════

function connectSSE() {
  if (evtSource) try { evtSource.close(); } catch {}
  if (sseReconnectTimer) { clearTimeout(sseReconnectTimer); sseReconnectTimer = null; }
  evtSource = new EventSource('/api/events');

  evtSource.addEventListener('connected', () => {
    document.getElementById('liveDot').classList.add('connected');
    document.getElementById('ssePill').classList.add('online');
    pushActivity('SSE connected');
  });

  evtSource.addEventListener('activity', (e) => {
    try { const d = JSON.parse(e.data); pushActivity(d.action); } catch {}
  });

  evtSource.addEventListener('intake-update', (e) => {
    // Instant refresh when intake state changes
    loadPendingApprovals();
    loadCurrentTaskFocus();
    loadIntakeTasks();
  });

  evtSource.addEventListener('task', (e) => {
    try {
      const d = JSON.parse(e.data);
      if (d.task) {
        const i = TASKS.findIndex(t => t.id === d.task.id);
        if (i !== -1) TASKS[i] = d.task; else TASKS.unshift(d.task);
        renderAllTasks();
        if (trackedTaskId === d.task.id) updateOutput(d.task);

        if (d.task.status === 'done') {
          showToast(`Done: ${d.task.label}`, 'success');
          workerLastSeen = new Date();
        } else if (d.task.status === 'failed') {
          showToast(`Failed: ${d.task.label}`, 'error');
          workerLastSeen = new Date();
        } else if (d.task.status === 'running') {
          workerLastSeen = new Date();
        }
        renderHeartbeat();
      }
      loadTasks();
    } catch (err) { console.error('[SSE]', err); }
  });

  evtSource.onerror = () => {
    document.getElementById('liveDot').classList.remove('connected');
    document.getElementById('ssePill').classList.remove('online');
    if (!sseReconnectTimer) {
      sseReconnectTimer = setTimeout(connectSSE, 3000);
    }
  };
}

// ═══════════════════════════════════════════
// ACTIVITY
// ═══════════════════════════════════════════

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
  el.innerHTML = activity.slice(0, 25).map(a =>
    `<div class="activity-item"><span class="activity-time">${a.t}</span><span class="activity-text">${esc(a.text)}</span></div>`
  ).join('');
}

// ═══════════════════════════════════════════
// TOASTS
// ═══════════════════════════════════════════

function showToast(message, type = 'info') {
  const c = document.getElementById('toastContainer');
  if (!c) return;
  const icons = { success: '&#10003;', error: '&#10007;', info: '&#8505;' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${esc(message)}</span>`;
  c.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 4200);
}

// ═══════════════════════════════════════════
// NAVIGATION
// ═══════════════════════════════════════════

document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', e => { e.preventDefault(); switchTab(l.dataset.tab); }));

function switchTab(tab) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const link = document.querySelector(`.nav-link[data-tab="${tab}"]`);
  if (link) link.classList.add('active');
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');
  if (tab === 'costs') loadCosts();
  if (tab === 'settings') loadCostSettings();
  if (tab === 'intake') loadIntakeTasks();
}

// ═══════════════════════════════════════════
// DATA LOADING
// ═══════════════════════════════════════════

async function loadData() {
  try {
    const r = await fetch('/api/data');
    DATA = await r.json();
    render();
  } catch (e) { console.error('loadData:', e); }
}

async function loadStatus() {
  try {
    const r = await fetch('/api/status');
    STATUS = await r.json();
    renderStatus();
    renderHeartbeat();
  } catch (e) { console.error('loadStatus:', e); }
}

async function loadTasks() {
  try {
    const r = await fetch('/api/tasks');
    TASKS = await r.json();
    renderAllTasks();
    if (trackedTaskId) {
      const t = TASKS.find(x => x.id === trackedTaskId);
      if (t) updateOutput(t);
    }
  } catch {}
}

async function loadCosts() {
  try {
    const r = await fetch('/api/costs');
    COSTS = await r.json();
    renderCostCenter();
  } catch {}
}

async function loadCostSettings() {
  try {
    const r = await fetch('/api/costs/settings');
    COST_SETTINGS = await r.json();
    // Fetch subtasks for builder diagnostics display
    try {
      const sr = await fetch('/api/subtasks');
      window._lastSubtasks = await sr.json();
    } catch {}
    renderBudgetSettings();
  } catch {}
}

// ═══════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════

function renderStatus() {
  if (!STATUS) return;
  const s = STATUS;

  // Sidebar pills
  document.getElementById('serverPill').classList.add('online');
  document.getElementById('workerPill').classList.toggle('online', s.worker.running);

  const up = s.server.uptime ? fmtUp(s.server.uptime) : '--';
  document.getElementById('sysStatus').textContent = `${up} | :${s.server.port}`;

  // Home status strip
  setStatus('hsServer', 'Online', 'ok');
  setStatus('hsWorker', s.worker.running ? 'Running' : 'Stopped', s.worker.running ? 'ok' : 'err');

  const oai = s.keys.OPENAI_API_KEY === 'configured';
  const ppx = s.keys.PERPLEXITY_API_KEY === 'configured';
  const gem = s.keys.GEMINI_API_KEY === 'configured';
  const mc = 1 + (oai ? 1 : 0) + (ppx ? 1 : 0) + (gem ? 1 : 0);
  setStatus('hsModels', `${mc}/4`, mc === 4 ? 'ok' : 'warn');

  if (DATA) {
    const ac = DATA.approvals.length;
    setStatus('hsApprovals', ac === 0 ? 'Clear' : ac + ' pending', ac === 0 ? 'ok' : 'warn');
  }

  // Settings model tags
  updateModelTag('mOpenAI', oai);
  updateModelTag('mPerplexity', ppx);
  updateModelTag('mGemini', gem);

  // Gemini model display
  if (s.providers && s.providers.gemini) {
    const gm = document.getElementById('mGeminiModel');
    if (gm) gm.textContent = s.providers.gemini.model || 'gemini-2.5-flash-lite';
  }

  // Channel status indicators with provider state
  const providers = s.providers || {};
  const cs = (id, provider) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (provider.type === 'local') { el.textContent = 'Local'; el.className = 'ch-status local'; }
    else if (provider.state === 'ready') { el.textContent = 'Ready'; el.className = 'ch-status ready'; }
    else if (provider.state === 'auth_failed') { el.textContent = 'Auth Fail'; el.className = 'ch-status missing'; }
    else if (provider.state === 'quota_unavailable') { el.textContent = 'Quota'; el.className = 'ch-status missing'; }
    else if (provider.state === 'model_unavailable') { el.textContent = 'No Model'; el.className = 'ch-status missing'; }
    else { el.textContent = 'No Key'; el.className = 'ch-status missing'; }
  };
  cs('chStatusClaude', providers.claude || { type: 'local' });
  cs('chStatusOpenAI', providers.openai || { state: oai ? 'ready' : 'missing' });
  cs('chStatusPerplexity', providers.perplexity || { state: ppx ? 'ready' : 'missing' });
  cs('chStatusGemini', providers.gemini || { state: gem ? 'ready' : 'missing' });

  // Settings server
  const ss = document.getElementById('settingsServer');
  if (ss) ss.innerHTML = `
    <div class="settings-row"><span class="settings-label">Uptime</span>${up}</div>
    <div class="settings-row"><span class="settings-label">Port</span>${s.server.port}</div>
    <div class="settings-row"><span class="settings-label">Worker</span>${s.worker.running ? '<span style="color:var(--green)">Running</span>' : '<span style="color:var(--red)">Stopped</span>'}</div>
    <div class="settings-row"><span class="settings-label">PID</span>${s.worker.pid || '--'}</div>
    <div class="settings-row"><span class="settings-label">Node</span>${esc(s.node)}</div>
  `;

  // Settings system
  const sy = document.getElementById('settingsSystem');
  if (sy) sy.innerHTML = `
    <div class="settings-row"><span class="settings-label">Workspace</span><span style="font-family:var(--mono);font-size:11px">${esc(s.workspace)}</span></div>
    <div class="settings-row"><span class="settings-label">OPENAI</span><span class="key-status ${oai ? 'key-ok' : 'key-miss'}">${oai ? 'configured' : 'missing'}</span></div>
    <div class="settings-row"><span class="settings-label">PERPLEXITY</span><span class="key-status ${ppx ? 'key-ok' : 'key-miss'}">${ppx ? 'configured' : 'missing'}</span></div>
    <div class="settings-row"><span class="settings-label">GEMINI</span><span class="key-status ${gem ? 'key-ok' : 'key-miss'}">${gem ? 'configured' : 'missing'}</span></div>
  `;
}

function updateModelTag(id, ready) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = ready ? 'Ready' : 'No Key';
  el.className = 'model-tag ' + (ready ? 'ready' : '');
}

function setStatus(id, text, cls) {
  const el = document.getElementById(id);
  if (el) { el.textContent = text; el.className = 'status-cell-value ' + cls; }
}

// ═══════════════════════════════════════════
// HEARTBEAT
// ═══════════════════════════════════════════

function renderHeartbeat() {
  const dot = document.getElementById('heartbeatDot');
  const label = document.getElementById('heartbeatLabel');
  const detail = document.getElementById('heartbeatDetail');
  if (!dot) return;

  const running = TASKS.find(t => t.status === 'running');
  currentlyRunningTask = running || null;

  if (running) {
    dot.className = 'heartbeat-dot active';
    label.textContent = `Running: ${running.label}`;
    label.style.color = 'var(--yellow)';
    detail.textContent = `since ${fmtTime(running.updatedAt)}`;
  } else if (STATUS && STATUS.worker.running) {
    dot.className = 'heartbeat-dot idle';
    label.textContent = 'Worker idle';
    label.style.color = 'var(--text-dim)';
    detail.textContent = workerLastSeen ? `last active ${timeAgo(workerLastSeen)}` : 'waiting for task';
  } else {
    dot.className = 'heartbeat-dot';
    label.textContent = 'Worker stopped';
    label.style.color = 'var(--red)';
    detail.textContent = '';
  }
}

// ═══════════════════════════════════════════
// TASKS
// ═══════════════════════════════════════════

function renderAllTasks() {
  renderTaskQueue();
  renderHomeRunning();
  renderLatest();
  renderRecentReports();
  renderHomeRecent();
  renderNavBadges();
  renderChannelTasks();
}

function renderTaskQueue() {
  const list = document.getElementById('taskQueueList');
  const badge = document.getElementById('taskQueueCount');
  if (!list) return;
  badge.textContent = TASKS.length + ' task' + (TASKS.length !== 1 ? 's' : '');

  const running = TASKS.filter(t => t.status === 'running').length;
  const queued = TASKS.filter(t => t.status === 'queued').length;
  if (running > 0) setStatus('hsQueue', running + ' running', 'warn');
  else if (queued > 0) setStatus('hsQueue', queued + ' queued', 'warn');
  else setStatus('hsQueue', 'Idle', 'ok');

  // Running hero in tasks tab
  const runHero = document.getElementById('tasksRunningHero');
  const rt = TASKS.find(t => t.status === 'running');
  if (runHero) runHero.innerHTML = rt ? renderRunningHero(rt) : '';

  // Filtered task list
  const filtered = taskFilter === 'all' ? TASKS : TASKS.filter(t => t.status === taskFilter);
  if (!filtered.length) { list.innerHTML = '<div class="task-empty">No tasks match filter</div>'; return; }
  list.innerHTML = filtered.slice(0, 50).map(taskCard).join('');
}

function renderHomeRunning() {
  const el = document.getElementById('homeRunningTask');
  if (!el) return;
  const rt = TASKS.find(t => t.status === 'running');
  el.innerHTML = rt ? renderRunningHero(rt) : '';
}

function renderRunningHero(t) {
  const modelTag = getModelTag(t);
  return `<div class="running-task-hero" onclick="showTask('${t.id}')">
    <div class="running-label">Currently Running</div>
    <div style="display:flex;align-items:center;gap:8px">
      <span class="task-title">${esc(t.label)}</span>
      <span class="task-type-tag">${esc(t.type)}</span>
      ${modelTag}
    </div>
    ${t.output ? '<pre>' + esc(t.output.slice(-300)) + '</pre>' : '<pre style="color:var(--text-faint)">Executing...</pre>'}
  </div>`;
}

function taskCard(t) {
  const tm = fmtTime(t.updatedAt || t.createdAt);
  const extra = t.status === 'running' ? ' is-running' : t.status === 'failed' ? ' is-failed' : '';
  const modelTag = getModelTag(t);

  let summaryHtml = '';
  if (t.output && t.status === 'done') {
    const lines = t.output.trim().split('\n').filter(l => l.trim());
    const summary = lines.slice(-2).join(' ').slice(0, 140);
    if (summary) summaryHtml = `<div class="task-summary">${esc(summary)}</div>`;
  }
  if (t.error && t.status === 'failed') {
    summaryHtml = `<div class="task-summary" style="color:var(--red)">${esc(t.error.slice(0, 140))}</div>`;
  }

  let filesHtml = '';
  if (t.filesWritten && t.filesWritten.length) {
    filesHtml = `<div class="task-files">${t.filesWritten.map(f => `<span class="task-file-tag">${esc(f.split('/').pop())}</span>`).join('')}</div>`;
  }

  return `<div class="task-card${extra}" onclick="showTask('${t.id}')">
    <span class="task-indicator ${t.status}"></span>
    <div class="task-body">
      <div class="task-title">${esc(t.label)}</div>
      <div class="task-meta">
        <span class="task-type-tag">${esc(t.type)}</span>
        ${modelTag}
      </div>
      ${summaryHtml}
      ${filesHtml}
    </div>
    <div class="task-right">
      <span class="task-status-badge ${t.status}">${t.status}</span>
      <span class="task-time">${tm}</span>
    </div>
  </div>`;
}

function getModelTag(t) {
  const m = t.meta?.model;
  if (!m) {
    if (t.type === 'board-run') return '<span class="task-model-tag claude">Board</span>';
    return '';
  }
  const cls = m === 'claude' ? 'claude' : m === 'openai' ? 'openai' : m === 'perplexity' ? 'perplexity' : m === 'gemini' ? 'gemini' : '';
  return `<span class="task-model-tag ${cls}">${esc(m)}</span>`;
}

function renderHomeRecent() {
  const hr = document.getElementById('homeRecentTasks');
  if (!hr) return;
  if (!TASKS.length) { hr.innerHTML = '<div class="task-empty">No tasks yet</div>'; return; }
  hr.innerHTML = TASKS.slice(0, 8).map(t => {
    const tm = fmtTime(t.updatedAt || t.createdAt);
    return `<div class="task-card" onclick="showTask('${t.id}')" style="padding:7px 10px;margin-bottom:2px">
      <span class="task-indicator ${t.status}"></span>
      <div class="task-body">
        <div class="task-title" style="font-size:11px">${esc(t.label)}</div>
      </div>
      <div class="task-right">
        <span class="task-status-badge ${t.status}" style="font-size:8px;padding:1px 5px">${t.status}</span>
        <span class="task-time">${tm}</span>
      </div>
    </div>`;
  }).join('');
}

function renderLatest() {
  const el = document.getElementById('homeLatestTask');
  if (!el) return;

  // Try to show latest intake task first (more relevant)
  fetch('/api/intake/tasks').then(r => r.ok ? r.json() : null).then(data => {
    const tasks = (data?.tasks || data || []).filter(t => t.status === 'done');
    if (tasks.length > 0) {
      tasks.sort((a, b) => (b.updated_at || b.created_at || '').localeCompare(a.updated_at || a.created_at || ''));
      const t = tasks[0];
      el.innerHTML = `<div class="latest-task-card" onclick="switchTab('intake');showIntakeDetail('${t.task_id}')">
        <div class="completed-label">Latest completed</div>
        <div style="display:flex;align-items:center;gap:8px">
          <span class="task-title">${esc((t.title || t.raw_request || '').slice(0, 60))}</span>
          <span class="task-status-badge done" style="font-size:8px">done</span>
        </div>
        <div style="font-size:11px;color:var(--text-dim);margin-top:4px">${esc(t.domain || '')} &middot; ${esc(t.board_deliberation?.interpreted_objective?.slice(0, 100) || '')}</div>
      </div>`;
      return;
    }
    // Fall back to queue tasks
    const done = TASKS.filter(t => t.status === 'done' || t.status === 'failed');
    if (!done.length) { el.innerHTML = '<div class="task-empty">No completed tasks yet</div>'; return; }
    const qt = done[0];
    el.innerHTML = `<div class="latest-task-card" onclick="showTask('${qt.id}')">
      <div class="completed-label">${qt.status === 'failed' ? 'Failed' : 'Completed'}</div>
      <div class="task-title">${esc(qt.label)}</div>
      ${qt.output ? '<pre>' + esc(qt.output.slice(0, 200)) + '</pre>' : ''}
    </div>`;
  }).catch(() => {
    el.innerHTML = '<div class="task-empty">No completed tasks yet</div>';
  });
}

function renderRecentReports() {
  const el = document.getElementById('homeRecentReports');
  if (!el) return;
  fetch('/api/reports').then(r => r.ok ? r.json() : null).then(data => {
    if (!data?.reports?.length) { el.innerHTML = '<div class="task-empty">No reports yet</div>'; return; }
    el.innerHTML = data.reports.slice(0, 8).map(r => {
      const name = r.name.replace(/^Subtask-/, '').replace(/\.md$|\.json$|\.txt$/, '');
      const sizeKb = (r.size / 1024).toFixed(1);
      const ago = fmtTimeAgo(r.modified);
      return `<div class="task-card" onclick="window.open('/api/file/${encodeURIComponent(r.path)}','_blank')" style="padding:6px 10px;margin-bottom:3px">
        <div class="task-body">
          <div class="task-title" style="font-size:11px">${esc(name.slice(0, 40))}</div>
          <div style="font-size:9px;color:var(--text-faint)">${sizeKb}KB &middot; ${ago}</div>
        </div>
      </div>`;
    }).join('');
  }).catch(() => { el.innerHTML = '<div class="task-empty">Error loading reports</div>'; });
}

function fmtTimeAgo(ts) {
  const ms = Date.now() - (typeof ts === 'number' ? ts : new Date(ts).getTime());
  if (ms < 60000) return 'just now';
  if (ms < 3600000) return Math.floor(ms / 60000) + 'm ago';
  if (ms < 86400000) return Math.floor(ms / 3600000) + 'h ago';
  return Math.floor(ms / 86400000) + 'd ago';
}

function renderNavBadges() {
  const active = TASKS.filter(t => t.status === 'queued' || t.status === 'running').length;
  const tb = document.getElementById('navTaskBadge');
  if (tb) { tb.textContent = active; tb.style.display = active > 0 ? '' : 'none'; }

  if (DATA) {
    const ab = document.getElementById('navApprovalBadge');
    if (ab) { ab.textContent = DATA.approvals.length; ab.style.display = DATA.approvals.length > 0 ? '' : 'none'; }
  }
}

function filterTasks(f) {
  taskFilter = f;
  document.querySelectorAll('#taskFilters .filter-btn').forEach(b => {
    b.classList.toggle('active-filter', b.dataset.filter === f);
  });
  renderTaskQueue();
}

function showTask(id) {
  const t = TASKS.find(x => x.id === id);
  if (!t) return;
  let b = '';
  b += `Task:      ${t.label}\n`;
  b += `Type:      ${t.type}\n`;
  b += `Status:    ${t.status.toUpperCase()}\n`;
  if (t.meta?.model) b += `Model:     ${t.meta.model}\n`;
  if (t.meta?.role) b += `Role:      ${t.meta.role}\n`;
  b += `Created:   ${t.createdAt}\n`;
  b += `Updated:   ${t.updatedAt}\n`;
  if (t.filesWritten?.length) b += `\n--- Files Written ---\n${t.filesWritten.join('\n')}\n`;
  if (t.error) b += `\n--- Error ---\n${t.error}\n`;
  if (t.output) b += `\n--- Output ---\n${t.output}\n`;
  document.getElementById('taskModalTitle').textContent = `${t.label} [${t.status.toUpperCase()}]`;
  document.getElementById('taskModalBody').textContent = b;
  document.getElementById('taskModal').classList.add('open');
}

function closeTaskModal(e) { if (e.target === e.currentTarget) document.getElementById('taskModal').classList.remove('open'); }

// ═══════════════════════════════════════════
// OUTPUT PANEL
// ═══════════════════════════════════════════

function updateOutput(task) {
  const log = document.getElementById('controlLog');
  if (!log) return;
  const icon = { done: 'DONE', failed: 'FAIL', running: 'RUN', queued: 'WAIT' }[task.status] || '??';
  let t = `[${icon}] ${task.label} (${task.type})\nStatus: ${task.status} | ${task.updatedAt}\n`;
  if (task.status === 'running') { t += '\nExecuting...\n'; if (task.output) t += '\n' + task.output; }
  if (task.status === 'done') { if (task.output) t += '\n' + task.output; if (task.filesWritten?.length) t += '\n\nFiles:\n' + task.filesWritten.map(f => '  ' + f).join('\n'); t += '\n\nCompleted.'; trackedTaskId = null; }
  if (task.status === 'failed') { t += '\nError: ' + (task.error || 'Unknown'); trackedTaskId = null; }
  log.textContent = t;
}

// ═══════════════════════════════════════════
// RENDER ALL
// ═══════════════════════════════════════════

function render() {
  if (!DATA) return;
  renderHome();
  renderMissions();
  renderApprovals();
  renderLogs();
  renderTopRanker();
  renderNavBadges();
  renderHomeCosts();
}

// ═══════════════════════════════════════════
// HOME
// ═══════════════════════════════════════════

function renderHome() {
  const s = DATA.state;
  // Time-aware greeting
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const greetingEl = document.getElementById('homeGreeting');
  if (greetingEl) greetingEl.textContent = `${greeting}, Rahul`;
  document.getElementById('homeDate').textContent =
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Priorities
  const ul = document.getElementById('homePriorities');
  ul.innerHTML = (s.top_priorities || []).map(p => `<li>${esc(p)}</li>`).join('')
    || '<li style="color:var(--text-faint)">None set</li>';

  // TopRanker flagship card on home
  const trm = DATA.missions.find(x => x.mission === 'TopRanker');
  const trDiv = document.getElementById('homeTRStatus');
  if (trDiv && trm) {
    trDiv.innerHTML = `
      <div style="margin-bottom:4px"><span class="mission-badge active">${esc(trm.status)}</span></div>
      <div style="margin-bottom:6px">${esc(trm.objective)}</div>
      <div style="font-size:11px;color:var(--text-dim)"><strong style="color:var(--text-faint);font-size:9px;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:2px">Next</strong>${fmtList(trm.nextActions)}</div>
    `;
  }

  // Approvals
  const ap = document.getElementById('homeApprovals');
  if (!DATA.approvals.length) {
    ap.innerHTML = '<div style="color:var(--text-faint);font-size:12px;padding:4px 0">All clear</div>';
  } else {
    ap.innerHTML = DATA.approvals.map(a =>
      `<div class="approval-pill" onclick="switchTab('approvals')">&#9888; ${esc(a.name)}</div>`
    ).join('');
  }
  const totalApprovals = DATA.approvals.length + PENDING_APPROVALS.length;
  setStatus('hsApprovals', totalApprovals === 0 ? 'Clear' : totalApprovals + ' pending', totalApprovals === 0 ? 'ok' : 'warn');

  // Mission health
  const md = document.getElementById('homeMissions');
  const activeMissions = DATA.missions.filter(m => (m.status || '').toLowerCase() !== 'planned');
  md.innerHTML = activeMissions.map(m => {
    const bc = badgeClass(m.status);
    const isTR = m.mission === 'TopRanker';
    return `<div class="home-mission">
      <span>${isTR ? '<strong style="color:var(--accent-text)">' + esc(m.mission) + '</strong>' : esc(m.mission)}</span>
      <span class="mission-badge ${bc}">${esc(m.status)}</span>
    </div>`;
  }).join('');

  // Brief excerpt
  const briefDiv = document.getElementById('homeBriefExcerpt');
  if (briefDiv) {
    if (DATA.briefs.length) {
      const excerpt = DATA.briefs[0].content.slice(0, 500);
      briefDiv.innerHTML = md2html(excerpt);
    } else {
      briefDiv.innerHTML = '<p style="color:var(--text-faint)">No briefs available</p>';
    }
  }
}

function renderHomeCosts() {
  const cs = DATA && DATA.costSummary;
  if (!cs) return;

  const ct = document.getElementById('costToday');
  const cw = document.getElementById('costWeek');
  const cb = document.getElementById('costLastBoard');
  const cc = document.getElementById('costCallsToday');

  if (ct) ct.textContent = '$' + cs.today.cost.toFixed(4);
  if (cw) cw.textContent = '$' + cs.week.cost.toFixed(4);
  if (cb) cb.textContent = cs.lastBoardRun ? '$' + cs.lastBoardRun.cost.toFixed(4) : '--';
  if (cc) cc.textContent = cs.today.calls.toString();
}

// ═══════════════════════════════════════════
// COST CENTER
// ═══════════════════════════════════════════

function renderCostCenter() {
  if (!COSTS) return;

  // Summary cards
  document.getElementById('ccToday').textContent = '$' + COSTS.today.cost.toFixed(4);
  document.getElementById('ccTodayCalls').textContent = COSTS.today.calls + ' calls, ' + fmtTokens(COSTS.today.tokens);
  document.getElementById('ccWeek').textContent = '$' + COSTS.week.cost.toFixed(4);
  document.getElementById('ccWeekCalls').textContent = COSTS.week.calls + ' calls, ' + fmtTokens(COSTS.week.tokens);

  if (COSTS.lastBoardRun) {
    document.getElementById('ccLastBoard').textContent = '$' + COSTS.lastBoardRun.cost.toFixed(4);
    document.getElementById('ccLastBoardCalls').textContent = COSTS.lastBoardRun.calls + ' calls';
  } else {
    document.getElementById('ccLastBoard').textContent = '--';
    document.getElementById('ccLastBoardCalls').textContent = 'no data';
  }
  document.getElementById('ccTotalEntries').textContent = COSTS.totalEntries.toString();

  // By provider
  const bp = document.getElementById('ccByProvider');
  const providers = COSTS.byProvider;
  const provNames = Object.keys(providers);
  if (!provNames.length) {
    bp.innerHTML = '<div class="task-empty">No cost data yet</div>';
  } else {
    const maxCost = Math.max(...provNames.map(p => providers[p].cost), 0.001);
    bp.innerHTML = provNames.map(p => {
      const d = providers[p];
      const pct = Math.max((d.cost / maxCost) * 100, 4);
      return `<div class="cost-row">
        <span class="cost-row-name">${esc(p)}</span>
        <div class="cost-bar-container" style="flex:1;margin:0 12px">
          <div class="cost-bar ${p}" style="width:${pct}%"></div>
        </div>
        <span class="cost-row-value">$${d.cost.toFixed(4)}</span>
        <span class="cost-row-detail" style="margin-left:8px">${d.calls} calls</span>
      </div>`;
    }).join('');
  }

  // By model
  const bm = document.getElementById('ccByModel');
  const models = COSTS.byModel;
  const modNames = Object.keys(models);
  if (!modNames.length) {
    bm.innerHTML = '<div class="task-empty">No cost data yet</div>';
  } else {
    bm.innerHTML = modNames.map(m => {
      const d = models[m];
      return `<div class="cost-row">
        <span class="cost-row-name" style="font-family:var(--mono);font-size:11px">${esc(m)}</span>
        <span class="cost-row-value">$${d.cost.toFixed(4)}</span>
        <span class="cost-row-detail" style="margin-left:8px">${fmtTokens(d.tokens)}</span>
      </div>`;
    }).join('');
  }

  // By day
  const bd = document.getElementById('ccByDay');
  const days = COSTS.byDay;
  const dayNames = Object.keys(days).sort().reverse();
  if (!dayNames.length) {
    bd.innerHTML = '<div class="task-empty">No cost data yet</div>';
  } else {
    const maxDayCost = Math.max(...dayNames.map(d => days[d].cost), 0.001);
    bd.innerHTML = dayNames.map(d => {
      const data = days[d];
      const pct = Math.max((data.cost / maxDayCost) * 100, 4);
      return `<div class="cost-row">
        <span class="cost-row-name" style="font-family:var(--mono)">${d}</span>
        <div class="cost-bar-container" style="flex:1;margin:0 12px">
          <div class="cost-bar openai" style="width:${pct}%"></div>
        </div>
        <span class="cost-row-value">$${data.cost.toFixed(4)}</span>
        <span class="cost-row-detail" style="margin-left:8px">${data.calls} calls</span>
      </div>`;
    }).join('');
  }
}

function fmtTokens(n) {
  if (!n) return '0 tok';
  if (n < 1000) return n + ' tok';
  if (n < 1000000) return (n / 1000).toFixed(1) + 'k tok';
  return (n / 1000000).toFixed(2) + 'M tok';
}

// ═══════════════════════════════════════════
// BUDGET SETTINGS
// ═══════════════════════════════════════════

function renderBudgetSettings() {
  if (!COST_SETTINGS) return;
  const gm = document.getElementById('settGeminiModel');
  const bl = document.getElementById('settBudgetLimit');
  const wt = document.getElementById('settWarnThreshold');
  const da = document.getElementById('settDisableAfter');
  const bt = document.getElementById('settBuilderTimeout');
  if (gm) gm.value = COST_SETTINGS.geminiModel || 'gemini-2.5-flash-lite';
  if (bl) bl.value = COST_SETTINGS.geminibudgetLimit || '';
  if (wt) wt.value = COST_SETTINGS.warningThreshold || '';
  if (da) da.checked = !!COST_SETTINGS.disableAfterThreshold;
  if (bt) bt.value = COST_SETTINGS.builderTimeoutMinutes || 10;

  // Render builder diagnostics if available
  renderBuilderDiagnostics();
}

function renderBuilderDiagnostics() {
  const el = document.getElementById('builderDiagnostics');
  if (!el) return;
  // Pull diagnostics from most recent builder subtask
  try {
    const allSubs = window._lastSubtasks || [];
    const builderSubs = allSubs.filter(s => s.builder_diagnostics || s.builder_outcome);
    if (!builderSubs.length) { el.innerHTML = '<div style="font-size:11px;color:var(--muted)">No builder runs yet</div>'; return; }
    const last = builderSubs[0];
    const d = last.builder_diagnostics || {};
    el.innerHTML = `
      <div style="font-size:11px;border-top:1px solid var(--border);padding-top:6px">
        <strong>Last Builder Run</strong>
        <div class="settings-row"><span class="settings-label">Subtask</span>${esc(last.title || last.subtask_id)}</div>
        <div class="settings-row"><span class="settings-label">Outcome</span><span class="builder-outcome-tag ${last.builder_outcome || ''}">${last.builder_outcome || '?'}</span></div>
        ${d.durationMs ? `<div class="settings-row"><span class="settings-label">Duration</span>${Math.round(d.durationMs/1000)}s</div>` : ''}
        ${d.totalOutputBytes != null ? `<div class="settings-row"><span class="settings-label">Output</span>${d.totalLines || 0} lines, ${Math.round((d.totalOutputBytes||0)/1024)}KB</div>` : ''}
        ${d.killedReason ? `<div class="settings-row"><span class="settings-label">Killed</span><span style="color:var(--red)">${d.killedReason}</span></div>` : ''}
        ${d.cwd ? `<div class="settings-row"><span class="settings-label">CWD</span><span style="font-size:10px;font-family:var(--mono)">${esc(d.cwd.split('/').slice(-3).join('/'))}</span></div>` : ''}
      </div>`;
  } catch { el.innerHTML = ''; }
}

async function saveBudgetSettings() {
  const settings = {
    geminiModel: document.getElementById('settGeminiModel').value,
    geminibudgetLimit: parseFloat(document.getElementById('settBudgetLimit').value) || null,
    warningThreshold: parseFloat(document.getElementById('settWarnThreshold').value) || null,
    disableAfterThreshold: document.getElementById('settDisableAfter').checked,
    builderTimeoutMinutes: parseInt(document.getElementById('settBuilderTimeout')?.value) || 10,
  };
  try {
    await fetch('/api/costs/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings),
    });
    showToast('Settings saved', 'success');
    loadStatus();
  } catch { showToast('Failed to save settings', 'error'); }
}

// ═══════════════════════════════════════════
// MISSIONS
// ═══════════════════════════════════════════

function renderMissions() {
  document.getElementById('missionCards').innerHTML = DATA.missions.map(m => {
    const flag = m.mission === 'TopRanker';
    const bc = badgeClass(m.status);
    const isPlanned = (m.status || '').toLowerCase() === 'planned';
    return `<div class="mission-card ${flag ? 'flagship' : ''} ${isPlanned ? 'planned' : ''}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
        <span class="mission-name">${esc(m.mission)}</span>
        ${flag ? '<span class="badge-flagship">Flagship</span>' : ''}
      </div>
      <span class="mission-badge ${bc}">${esc(m.status)}</span>
      <div class="mission-section"><strong>Objective</strong>${esc(m.objective)}</div>
      ${!isPlanned ? `
        <div class="mission-section"><strong>Progress</strong>${fmtList(m.progress)}</div>
        <div class="mission-section"><strong>Blockers</strong>${fmtList(m.blockers)}</div>
        <div class="mission-section"><strong>Next</strong>${fmtList(m.nextActions)}</div>
      ` : ''}
      <div class="mission-section"><strong>Owner</strong>${esc(m.owner)}</div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════
// APPROVALS
// ═══════════════════════════════════════════

function renderApprovals() {
  const c = document.getElementById('approvalsList');

  // Show intake subtask approvals at top
  let intakeHtml = '';
  if (PENDING_APPROVALS.length) {
    intakeHtml = `<div class="card" style="margin-bottom:14px;border:1px solid var(--yellow-border);background:var(--yellow-soft)">
      <h3 style="color:var(--yellow);margin-bottom:8px">&#9888; Subtask Approvals (${PENDING_APPROVALS.length})</h3>`;
    for (const s of PENDING_APPROVALS) {
      const typeIcon = getSubtaskTypeIcon(s.stage);
      intakeHtml += `<div class="approval-inbox-item" style="margin-bottom:6px">
        <div class="approval-inbox-item-info">
          <span class="subtask-type-icon ${s.stage}">${typeIcon}</span>
          <div>
            <div class="approval-inbox-item-title">${esc(s.title)}</div>
            <div class="approval-inbox-item-meta">
              <span class="stage-tag ${s.stage}">${esc(s.stage)}</span>
              <span class="task-model-tag ${s.assigned_model}">${esc(s.assigned_model)}</span>
              <span style="color:var(--text-faint);font-size:9px">from: ${esc(s.parent_title)}</span>
            </div>
            ${s.files_changed && s.files_changed.length ? `<div class="approval-files-changed">${s.files_changed.map(f => '<span class="file-badge">' + esc(f) + '</span>').join('')}</div>` : ''}
          </div>
        </div>
        <button class="btn-approve-global" onclick="event.stopPropagation();approveSubtaskGlobal('${s.subtask_id}', this)">
          <span>&#10003;</span> Approve & Continue
        </button>
      </div>`;
    }
    intakeHtml += '</div>';
  }

  if (!DATA.approvals.length && !PENDING_APPROVALS.length) {
    c.innerHTML = '<div class="card"><p style="color:var(--text-faint)">No pending approvals</p></div>';
    return;
  }
  if (!DATA.approvals.length) {
    c.innerHTML = intakeHtml;
    return;
  }
  // Prepend intake approvals before file-based approvals
  c.innerHTML = DATA.approvals.map(a => {
    const rm = a.content.match(/## Risk Level\s*\n(\w+)/);
    const risk = rm ? rm[1].toLowerCase() : 'yellow';
    const am = a.content.match(/## Proposed Action\s*\n(.+)/);
    const action = am ? am[1] : a.name;
    const dm = a.content.match(/## Domain\s*\n(.+)/);
    const domain = dm ? dm[1] : '';
    const um = a.content.match(/## Expected Upside\s*\n([\s\S]*?)(?=\n##|$)/);
    const upside = um ? um[1].trim().split('\n')[0] : '';
    const wm = a.content.match(/## Why\s*\n([\s\S]*?)(?=\n##|$)/);
    const reason = wm ? wm[1].trim().split('\n')[0] : '';
    const sid = a.name.replace(/[^a-zA-Z0-9]/g, '_');

    return `<div class="approval-card" id="ap-${sid}">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:10px">
        <div>
          <h4>${esc(action)}</h4>
          ${domain ? '<span style="font-size:11px;color:var(--text-dim)">' + esc(domain) + '</span>' : ''}
        </div>
        <span class="risk-badge risk-${risk}">${risk}</span>
      </div>
      ${reason ? '<div class="approval-summary"><strong style="color:var(--text-faint);font-size:9px;text-transform:uppercase">Why:</strong> ' + esc(reason) + '</div>' : ''}
      ${upside ? '<div class="approval-summary"><strong style="color:var(--text-faint);font-size:9px;text-transform:uppercase">Upside:</strong> ' + esc(upside) + '</div>' : ''}
      <div class="approval-actions" id="act-${sid}">
        <button class="btn-approve" onclick="doApproval('${a.name}','approve','${sid}')">Approve</button>
        <button class="btn-reject" onclick="doApproval('${a.name}','reject','${sid}')">Reject</button>
        <button class="btn-detail" onclick="showApprovalDetail('${sid}')">Details</button>
      </div>
      <div class="md-content" id="detail-${sid}" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);max-height:200px;overflow-y:auto">${md2html(a.content)}</div>
    </div>`;
  }).join('');
  c.innerHTML = intakeHtml + c.innerHTML;
}

function showApprovalDetail(sid) {
  const el = document.getElementById('detail-' + sid);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// ═══════════════════════════════════════════
// LOGS — Sub-feeds: agent, decision, brief
// ═══════════════════════════════════════════

function renderLogs() {
  const c = document.getElementById('logsList');
  const all = [];
  (DATA.logs || []).forEach(l => all.push({ name: l.name, content: l.content, type: 'agent' }));
  (DATA.decisionLogs || []).forEach(l => all.push({ name: l.name, content: l.content, type: 'decision' }));
  (DATA.briefs || []).forEach(l => all.push({ name: l.name, content: l.content, type: 'brief' }));

  if (!all.length) { c.innerHTML = '<div class="card"><p style="color:var(--text-faint)">No logs found</p></div>'; return; }
  all.sort((a, b) => b.name.localeCompare(a.name));
  const filtered = logFilter === 'all' ? all : all.filter(l => l.type === logFilter);

  c.innerHTML = filtered.map(l => {
    let modelBadges = '';
    const lc = l.content.toLowerCase();
    if (lc.includes('claude')) modelBadges += '<span class="log-badge model-claude">Claude</span>';
    if (lc.includes('openai') || lc.includes('gpt')) modelBadges += '<span class="log-badge model-openai">OpenAI</span>';
    if (lc.includes('perplexity')) modelBadges += '<span class="log-badge model-ppx">Perplexity</span>';
    if (lc.includes('gemini')) modelBadges += '<span class="log-badge model-gemini">Gemini</span>';

    // Detect mission badges
    let missionBadges = '';
    if (lc.includes('topranker')) missionBadges += '<span class="badge-flagship" style="font-size:8px;padding:1px 5px">TopRanker</span>';

    // Detect outcome
    let outcomeBadge = '';
    if (lc.includes('success') || lc.includes('done') || lc.includes('completed')) outcomeBadge = '<span class="log-badge" style="background:var(--green-soft);color:var(--green)">Success</span>';
    else if (lc.includes('failed') || lc.includes('error')) outcomeBadge = '<span class="log-badge" style="background:var(--red-soft);color:var(--red)">Failed</span>';

    const typeBadge = l.type === 'brief' ? '<span class="log-badge brief">Brief</span>' :
                      l.type === 'decision' ? '<span class="log-badge decision">Decision</span>' :
                      '<span class="log-badge agent">Agent</span>';

    return `<div class="log-entry">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap">
        <h4>${esc(l.name)}</h4>
        <div style="display:flex;gap:3px;flex-wrap:wrap">
          ${missionBadges}${modelBadges}${outcomeBadge}${typeBadge}
        </div>
      </div>
      <pre>${esc(l.content.slice(0, 1500))}</pre>
    </div>`;
  }).join('');
}

function filterLogs(f) {
  logFilter = f;
  document.querySelectorAll('#logFilters .filter-btn').forEach(b => {
    b.classList.toggle('active-filter', b.dataset.filter === f);
  });
  if (DATA) renderLogs();
}

// ═══════════════════════════════════════════
// TOPRANKER — Flagship
// ═══════════════════════════════════════════

function renderTopRanker() {
  const m = DATA.missions.find(x => x.mission === 'TopRanker');

  const objEl = document.getElementById('trObjective');
  if (objEl && m) {
    objEl.innerHTML = `<strong style="color:var(--text-faint);font-size:9px;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:2px">Current Objective</strong>${esc(m.objective)}`;
  }

  // Next recommended action highlight
  const naEl = document.getElementById('trNextAction');
  if (naEl && m && m.nextActions) {
    const firstAction = m.nextActions.split('\n').find(l => l.startsWith('- ') || l.startsWith('1.'));
    if (firstAction) {
      naEl.innerHTML = `<strong style="font-size:9px;text-transform:uppercase;letter-spacing:.4px">Recommended Next:</strong> ${esc(firstAction.replace(/^[-\d.]+\s*/, ''))}`;
      naEl.style.display = '';
    } else {
      naEl.style.display = 'none';
    }
  }

  // Loop stage
  const ls = document.getElementById('trLoopStage');
  if (ls && m) {
    const stage = (m.status || '').toLowerCase().includes('active') ? 'Active Execution' : m.status;
    ls.textContent = stage;
  }

  // Status card
  const st = document.getElementById('trStatus');
  if (m && st) {
    st.innerHTML = `<h3>Mission Status</h3>
      <div style="margin-bottom:6px"><span class="mission-badge active">${esc(m.status)}</span></div>
      <div class="mission-section"><strong>Blockers</strong>${fmtList(m.blockers)}</div>
      <div class="mission-section"><strong>Next Actions</strong>${fmtList(m.nextActions)}</div>
      <div class="mission-section"><strong>Risks</strong>${fmtList(m.risks)}</div>`;
  }

  // Progress card
  const pr = document.getElementById('trProgress');
  if (m && pr) {
    pr.innerHTML = `<h3>Recent Progress</h3>
      <div class="mission-section">${fmtList(m.progress)}</div>
      <div class="mission-section" style="margin-top:10px"><strong>Key Metrics</strong>${fmtList(m.metrics)}</div>`;
  }

  // Operating summary
  const sum = document.getElementById('trSummary');
  if (DATA.toprankerSummary) {
    sum.innerHTML = '<h3 style="margin-bottom:8px">Operating Summary</h3>' + md2html(DATA.toprankerSummary);
  }
}

// ═══════════════════════════════════════════
// CHANNELS — AI Model Interaction
// ═══════════════════════════════════════════

function switchChannel(ch) {
  activeChannel = ch;
  document.querySelectorAll('.channel-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.ch === ch);
  });
  renderChannelTasks();
}

function renderChannelTasks() {
  const ct = document.getElementById('channelTasks');
  const co = document.getElementById('channelOutput');
  if (!ct) return;

  // Filter tasks for active channel
  const chTasks = TASKS.filter(t => {
    if (t.type === 'ai-channel' && t.meta?.model === activeChannel) return true;
    if (activeChannel === 'claude' && t.type === 'board-run') return true;
    return false;
  });

  if (!chTasks.length) {
    ct.innerHTML = '<div class="task-empty">No tasks for this channel yet</div>';
  } else {
    ct.innerHTML = chTasks.slice(0, 10).map(taskCard).join('');
  }

  // Show latest completed output
  if (co) {
    const done = chTasks.find(t => t.status === 'done' && t.output);
    if (done) {
      co.textContent = done.output.slice(0, 3000);
    } else {
      co.innerHTML = '<div class="task-empty">Send a task to see output</div>';
    }
  }
}

function sendChannelTask() {
  const prompt = document.getElementById('channelPrompt').value.trim();
  if (!prompt) { showToast('Enter a prompt first', 'info'); return; }

  const role = document.getElementById('channelRole').value;
  const label = `${activeChannel.charAt(0).toUpperCase() + activeChannel.slice(1)}: ${prompt.slice(0, 50)}${prompt.length > 50 ? '...' : ''}`;

  submitTask('ai-channel', label, { model: activeChannel, prompt, role });
  document.getElementById('channelPrompt').value = '';
}

// ═══════════════════════════════════════════
// ACTIONS
// ═══════════════════════════════════════════

async function submitTask(type, label, meta = {}) {
  const log = document.getElementById('controlLog');
  if (log) log.textContent = `Submitting: ${label}...\n`;
  pushActivity(`Submitted: ${label}`);
  try {
    const r = await fetch('/api/tasks/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, label, meta })
    });
    const d = await r.json();
    if (d.ok) {
      trackedTaskId = d.task.id;
      if (log) log.textContent = `[QUEUED] ${label}\nID: ${d.task.id}\nWaiting for worker...\n`;
      showToast(`Queued: ${label}`, 'info');
      loadTasks();
    } else {
      if (log) log.textContent += 'Error: ' + d.error;
      showToast('Failed to queue task', 'error');
    }
  } catch (e) {
    if (log) log.textContent += 'Failed: ' + e.message;
    showToast('Network error', 'error');
  }
}

async function launchClaude(subtaskId) {
  const log = document.getElementById('controlLog');
  if (log) log.textContent = 'Queuing Claude Builder task...\n';
  try {
    const body = subtaskId ? { subtaskId } : {};
    const r = await fetch('/api/launch-claude', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const d = await r.json();

    if (!d.ok) {
      const errMsg = d.error || 'Unknown error — server did not confirm task creation';
      if (log) log.textContent += 'FAILED: ' + errMsg;
      showToast('Re-run Builder failed: ' + errMsg, 'error');
      return;
    }

    // Server confirmed the task was created and verified in tasks.json
    const taskId = d.taskId || d.task?.id;
    const taskType = d.taskType || d.task?.type;
    if (log) log.textContent += `Queue task created: ${taskId} (type=${taskType})\n${d.output || ''}`;

    // Verify the task exists by fetching the tasks list
    try {
      const tasksResp = await fetch('/api/tasks');
      const tasks = await tasksResp.json();
      const found = tasks.find(t => t.id === taskId);
      if (found) {
        if (log) log.textContent += `\nVerified: task ${taskId} exists in queue (status=${found.status})`;
        showToast(`Builder queued as ${taskId} (verified in queue). Worker will pick it up.`, 'success');
      } else {
        if (log) log.textContent += `\nWARNING: task ${taskId} not found in tasks list after creation`;
        showToast(`Builder task ${taskId} created but not found in queue — check server logs`, 'warning');
      }
    } catch (verifyErr) {
      // Verification fetch failed, but the creation succeeded
      if (log) log.textContent += `\nCould not verify task (${verifyErr.message}), but server confirmed creation`;
      showToast(`Builder queued as ${taskId}. Could not verify — check Tasks tab.`, 'success');
    }

    // Refresh all relevant UI sections so the new task is visible
    pushActivity(`Builder re-run queued: ${taskId}`);
    if (typeof loadTasks === 'function') loadTasks();
    if (typeof loadCurrentTaskFocus === 'function') loadCurrentTaskFocus();
    if (typeof loadPendingApprovals === 'function') loadPendingApprovals();
    if (typeof loadIntakeTasks === 'function') loadIntakeTasks();
    if (selectedIntakeTaskId && typeof showIntakeDetail === 'function') showIntakeDetail(selectedIntakeTaskId);
  } catch (e) {
    if (log) log.textContent += 'Network error: ' + e.message;
    showToast('Network error queuing builder — server may be down', 'error');
  }
}

async function runAiTask(task) {
  const log = document.getElementById('controlLog');
  if (log) log.textContent = `AI task: ${task}...\n`;
  try {
    const r = await fetch('/api/ai/' + task, { method: 'POST' });
    const d = await r.json();
    if (log) log.textContent += d.ok ? d.output : 'Error: ' + (d.error || 'Unknown error');
  } catch (e) { if (log) log.textContent += 'Failed: ' + e.message; }
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
      showToast(`${d.decision}: ${filename}`, d.decision === 'Approved' ? 'success' : 'info');
      setTimeout(loadData, 600);
    } else {
      div.innerHTML = `<span style="color:var(--red);font-size:12px">Error: ${esc(d.error)}</span>`;
    }
  } catch (e) {
    div.innerHTML = `<span style="color:var(--red);font-size:12px">Failed: ${esc(e.message)}</span>`;
  }
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════

function badgeClass(status) {
  const s = (status || '').toLowerCase().replace(/\s+/g, '-');
  if (s === 'active') return 'active';
  if (s === 'needs-decision') return 'needs-decision';
  if (s === 'research-only') return 'research-only';
  if (s === 'planned') return 'planned';
  return 'active';
}

function fmtList(text) {
  if (!text) return '<span style="color:var(--text-faint)">None</span>';
  const items = text.split('\n').filter(l => l.startsWith('- ') || /^\d+\./.test(l)).map(l => l.replace(/^[-\d.]+\s*/, ''));
  if (!items.length) return `<span style="font-size:12px">${esc(text)}</span>`;
  return '<ul style="list-style:disc;padding-left:14px;margin:2px 0">' +
    items.map(i => `<li style="font-size:12px;padding:2px 0;border:none;color:var(--text-secondary)">${esc(i)}</li>`).join('') + '</ul>';
}

function fmtUp(ms) {
  const s = Math.floor(ms / 1000);
  if (s < 60) return s + 's';
  const m = Math.floor(s / 60);
  if (m < 60) return m + 'm';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ' + (m % 60) + 'm';
  return Math.floor(h / 24) + 'd ' + (h % 24) + 'h';
}

function fmtTime(iso) {
  if (!iso) return '--';
  return new Date(iso).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' });
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date.getTime()) / 1000);
  if (diff < 10) return 'just now';
  if (diff < 60) return diff + 's ago';
  if (diff < 3600) return Math.floor(diff / 60) + 'm ago';
  return Math.floor(diff / 3600) + 'h ago';
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

// ═══════════════════════════════════════════
// INTAKE — Unified Task Intake + Deliberation
// ═══════════════════════════════════════════

let _intakeDetailPollTimer = null;
let _lastKnownIntakeStatus = null;

async function loadIntakeTasks() {
  try {
    const r = await fetch('/api/intake/tasks');
    INTAKE_TASKS = await r.json();
    renderIntakeCurrentHero();
    renderIntakeTasks();
    renderIntakeBadge();
    updateFlowExplainer();

    // Auto-refresh detail panel if selected task changed state
    if (selectedIntakeTaskId) {
      const t = INTAKE_TASKS.find(x => x.task_id === selectedIntakeTaskId);
      if (t && t.status !== _lastKnownIntakeStatus) {
        _lastKnownIntakeStatus = t.status;
        showIntakeDetail(selectedIntakeTaskId);
      }
    }
  } catch {}
}

function renderIntakeBadge() {
  const active = INTAKE_TASKS.filter(t => t.status !== 'done' && t.status !== 'failed' && t.status !== 'canceled').length;
  const badge = document.getElementById('navIntakeBadge');
  if (badge) { badge.textContent = active; badge.style.display = active > 0 ? '' : 'none'; }
}

function updateFlowExplainer() {
  const t = selectedIntakeTaskId
    ? INTAKE_TASKS.find(x => x.task_id === selectedIntakeTaskId)
    : getActiveIntakeTask();
  if (!t) {
    document.querySelectorAll('.flow-step').forEach(s => { s.classList.remove('flow-active', 'flow-done'); });
    return;
  }

  const stageOrder = ['intake', 'deliberating', 'planned', 'executing', 'done'];
  const statusMap = { waiting_approval: 'executing', builder_running: 'executing', builder_fallback: 'executing', waiting_human: 'executing', failed: 'done', canceled: 'done' };
  const current = statusMap[t.status] || t.status;
  const currentIdx = stageOrder.indexOf(current);

  document.querySelectorAll('.flow-step').forEach(s => {
    const step = s.dataset.step;
    const stepIdx = stageOrder.indexOf(step);
    s.classList.remove('flow-active', 'flow-done');
    if (stepIdx < currentIdx) s.classList.add('flow-done');
    else if (stepIdx === currentIdx) s.classList.add('flow-active');
  });
}

function getActiveIntakeTask() {
  const terminal = ['done', 'failed', 'canceled'];
  return INTAKE_TASKS.find(t => !terminal.includes(t.status)) || null;
}

function getStatusBanner(status) {
  const configs = {
    intake:            { dot: 'var(--text-dim)',  text: 'Task submitted — ready for Board deliberation', pulse: false },
    deliberating:      { dot: 'var(--purple)',     text: 'Board is deliberating — analyzing your request...', pulse: true },
    planned:           { dot: 'var(--blue)',       text: 'Plan ready — review the Board\'s recommendation and approve', pulse: false },
    builder_running:   { dot: 'var(--purple)',     text: 'Claude Builder is executing — writing code in your repo...', pulse: true },
    waiting_approval:  { dot: 'var(--yellow)',     text: 'Waiting for your approval on one or more subtasks', pulse: true },
    builder_fallback:  { dot: 'var(--red)',        text: 'Builder could not execute — manual Claude session required', pulse: true },
    waiting_human:     { dot: 'var(--yellow)',     text: 'Waiting for manual action from Rahul', pulse: true },
    executing:         { dot: 'var(--green)',      text: 'Executing subtasks...', pulse: true },
    done:              { dot: 'var(--green)',      text: 'All subtasks completed', pulse: false },
    failed:            { dot: 'var(--red)',        text: 'One or more subtasks failed', pulse: false },
  };
  const c = configs[status] || configs.intake;
  return `<div class="status-banner banner-${status}">
    <span class="status-banner-dot" style="background:${c.dot}${c.pulse ? ';animation:livePulse 1.2s ease-in-out infinite;box-shadow:0 0 6px ${c.dot}' : ''}"></span>
    ${c.text}
  </div>`;
}

function renderIntakeCurrentHero() {
  const hero = document.getElementById('intakeCurrentHero');
  if (!hero) return;

  const t = getActiveIntakeTask();
  if (!t) { hero.innerHTML = ''; return; }

  const delib = t.board_deliberation;
  const objective = delib ? delib.interpreted_objective : '';

  // Determine hero action button
  let actionHtml = '';
  if (t.status === 'intake') {
    actionHtml = `<div class="intake-hero-action">
      <button class="intake-hero-btn btn-deliberate" onclick="deliberateTask('${t.task_id}')">
        <span class="btn-icon">&#9670;</span> Send to Board for Deliberation
      </button>
    </div>`;
  } else if (t.status === 'planned') {
    actionHtml = `<div class="intake-hero-action">
      <button class="intake-hero-btn btn-approve-exec" onclick="approvePlan('${t.task_id}')">
        <span class="btn-icon">&#9654;</span> Approve &amp; Execute Plan
      </button>
    </div>`;
  } else if (t.status === 'waiting_approval') {
    actionHtml = `<div class="intake-hero-action">
      <button class="intake-hero-btn btn-approve-exec" onclick="showIntakeDetail('${t.task_id}')" style="background:linear-gradient(135deg,var(--yellow),#e0a020);color:#0a0d15">
        <span class="btn-icon">&#9888;</span> Review Subtasks Awaiting Approval
      </button>
    </div>`;
  }

  // Status dot color + pulse
  const dotColors = {
    intake: 'var(--text-dim)', deliberating: 'var(--purple)', planned: 'var(--blue)',
    builder_running: 'var(--purple)', executing: 'var(--green)',
    waiting_approval: 'var(--yellow)', builder_fallback: 'var(--red)',
    waiting_human: 'var(--yellow)', done: 'var(--green)', failed: 'var(--red)',
  };
  const isPulse = ['deliberating', 'executing', 'builder_running'].includes(t.status);
  const dotColor = dotColors[t.status] || 'var(--text-faint)';

  const statusLabels = {
    intake: 'Task Submitted', deliberating: 'Deliberation Running', planned: 'Plan Ready',
    builder_running: 'Builder Running', executing: 'Executing',
    waiting_approval: 'Waiting for Approval',
    builder_fallback: 'Builder Fallback', waiting_human: 'Needs Manual Action',
    done: 'Completed', failed: 'Failed',
  };

  hero.innerHTML = `<div class="intake-hero" onclick="showIntakeDetail('${t.task_id}')" style="cursor:pointer">
    <div class="intake-hero-status">
      <span class="intake-hero-dot ${isPulse ? 'pulse' : ''}" style="background:${dotColor}"></span>
      <span class="intake-hero-status-text" style="color:${dotColor}">${statusLabels[t.status] || t.status}</span>
      <span class="domain-tag" style="margin-left:auto">${esc(t.domain)}</span>
    </div>
    <div class="intake-hero-title">${esc(t.title)}</div>
    ${objective ? `<div class="intake-hero-objective">${esc(objective)}</div>` : ''}
    ${actionHtml}
  </div>`;
}

function renderIntakeTasks() {
  const list = document.getElementById('intakeTaskList');
  if (!list) return;

  // Exclude the current active task from the list (it's in the hero)
  const activeTask = getActiveIntakeTask();
  const activeId = activeTask ? activeTask.task_id : null;
  let tasks = INTAKE_TASKS.filter(t => t.task_id !== activeId);

  // Apply filter
  if (intakeFilter !== 'all') {
    tasks = tasks.filter(t => t.status === intakeFilter);
  }

  if (!tasks.length && !activeTask) {
    list.innerHTML = '<div class="task-empty" style="padding:12px">No tasks yet. Submit one above to get started.</div>';
    return;
  }

  if (!tasks.length) {
    list.innerHTML = '';
    return;
  }

  // Section header
  let html = '<h3 style="margin-top:8px;margin-bottom:6px">Previous Tasks</h3>';

  html += tasks.map(t => {
    const urgTag = (t.urgency === 'high' || t.urgency === 'critical')
      ? `<span class="urgency-tag ${t.urgency}">${t.urgency}</span>` : '';
    const riskTag = t.risk_level && t.risk_level !== 'green'
      ? `<span class="risk-badge risk-${t.risk_level}">${t.risk_level}</span>` : '';
    const delib = t.board_deliberation;
    const objective = delib ? delib.interpreted_objective : '';

    const isCompleted = ['done', 'failed', 'canceled'].includes(t.status);
    const isActive = !isCompleted && t.task_id === selectedIntakeTaskId;
    const extraCls = isCompleted ? ' is-completed' : isActive ? ' is-active' : '';

    return `<div class="intake-card status-${t.status}${extraCls}" onclick="showIntakeDetail('${t.task_id}')">
      <div class="intake-card-header">
        <div>
          <div class="intake-card-title">${esc(t.title)}</div>
          ${objective ? `<div style="font-size:11px;color:var(--text-dim);margin-top:2px">${esc(objective)}</div>` : ''}
        </div>
        <span class="intake-status-badge ${t.status}">${t.status.replace('_', ' ')}</span>
      </div>
      <div class="intake-card-meta">
        <span class="domain-tag">${domainLabel(t.domain)}</span>
        ${urgTag}${riskTag}
        <span style="font-size:9px;color:var(--text-faint);font-family:var(--mono);margin-left:auto">${fmtTime(t.created_at)}</span>
      </div>
    </div>`;
  }).join('');

  list.innerHTML = html;
}

function filterIntake(f) {
  intakeFilter = f;
  document.querySelectorAll('#intakeFilters .filter-btn').forEach(b => {
    b.classList.toggle('active-filter', b.dataset.filter === f);
  });
  renderIntakeTasks();
}

async function submitIntakeTask() {
  const raw = document.getElementById('intakeRequest').value.trim();
  if (!raw) { showToast('Enter a task description', 'info'); return; }

  const domain = document.getElementById('intakeDomain').value || undefined;
  const urgency = document.getElementById('intakeUrgency').value;
  const desired_outcome = document.getElementById('intakeOutcome').value.trim() || undefined;

  try {
    const r = await fetch('/api/intake/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_request: raw, domain, urgency, desired_outcome }),
    });
    const d = await r.json();
    if (d.ok) {
      _autoApproved = false;
      showToast('Task submitted — starting Board deliberation...', 'success');
      document.getElementById('intakeRequest').value = '';
      document.getElementById('intakeOutcome').value = '';
      // Auto-focus the new task
      selectedIntakeTaskId = d.task.task_id;
      _lastKnownIntakeStatus = 'intake';
      await loadIntakeTasks();
      showIntakeDetail(d.task.task_id);
      startIntakeDetailPoll();
      // Auto-deliberate: immediately send to Board
      try {
        await fetch('/api/intake/task/' + d.task.task_id + '/deliberate', { method: 'POST' });
        pushActivity('Board deliberation started for: ' + d.task.title);
      } catch { /* manual deliberation fallback */ }
    } else {
      showToast('Error: ' + d.error, 'error');
    }
  } catch (e) { showToast('Network error', 'error'); }
}

function startIntakeDetailPoll() {
  stopIntakeDetailPoll();
  _intakeDetailPollTimer = setInterval(async () => {
    if (!selectedIntakeTaskId) { stopIntakeDetailPoll(); return; }
    await loadIntakeTasks();
    // Auto-approve plan when deliberation completes (for non-code research tasks)
    try {
      const r = await fetch('/api/intake/task/' + selectedIntakeTaskId);
      if (r.ok) {
        const d = await r.json();
        if (d.task?.status === 'planned' && !_autoApproved) {
          _autoApproved = true;
          const isCodeTask = d.task.board_deliberation?.is_code_task;
          if (!isCodeTask) {
            showToast('Plan approved — executing subtasks...', 'success');
            await fetch('/api/intake/task/' + selectedIntakeTaskId + '/approve-plan', { method: 'POST' });
            pushActivity('Auto-approved plan for: ' + d.task.title);
          }
        }
        // Update detail view with latest progress
        if (d.task?.status !== _lastKnownIntakeStatus) {
          _lastKnownIntakeStatus = d.task?.status;
          showIntakeDetail(selectedIntakeTaskId);
        }
        if (d.task?.status === 'done' || d.task?.status === 'failed') {
          stopIntakeDetailPoll();
          showToast(d.task?.status === 'done' ? 'Task completed!' : 'Task failed', d.task?.status === 'done' ? 'success' : 'error');
          showIntakeDetail(selectedIntakeTaskId);
        }
      }
    } catch { /* polling error, continue */ }
  }, 3000);
}
var _autoApproved = false;

function stopIntakeDetailPoll() {
  if (_intakeDetailPollTimer) { clearInterval(_intakeDetailPollTimer); _intakeDetailPollTimer = null; }
}

async function showIntakeDetail(taskId) {
  selectedIntakeTaskId = taskId;
  updateFlowExplainer();
  const panel = document.getElementById('intakeDetailPanel');
  if (!panel) return;

  panel.style.display = 'block';
  panel.innerHTML = '<div class="delib-panel"><div style="color:var(--text-dim)">Loading...</div></div>';

  // Scroll detail into view
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  try {
    const r = await fetch('/api/intake/task/' + taskId);
    const data = await r.json();
    _lastKnownIntakeStatus = data.task.status;
    renderIntakeDetail(data);
    startIntakeDetailPoll();
  } catch (e) {
    panel.innerHTML = '<div class="delib-panel"><div style="color:var(--red)">Failed to load task</div></div>';
  }
}

function closeIntakeDetail() {
  selectedIntakeTaskId = null;
  _lastKnownIntakeStatus = null;
  stopIntakeDetailPoll();
  const panel = document.getElementById('intakeDetailPanel');
  if (panel) { panel.style.display = 'none'; panel.innerHTML = ''; }
  updateFlowExplainer();
}

function renderIntakeDetail(data) {
  const panel = document.getElementById('intakeDetailPanel');
  if (!panel) return;
  const { task, subtasks, progress } = data;
  const delib = task.board_deliberation;

  let html = '<div class="delib-panel">';

  // Close button
  html += `<div style="display:flex;justify-content:flex-end;margin-bottom:-8px">
    <button class="modal-close" onclick="closeIntakeDetail()" style="background:none;border:none;color:var(--text-faint);font-size:18px;cursor:pointer">&times;</button>
  </div>`;

  // Status banner
  html += getStatusBanner(task.status);

  // Header
  html += `<div style="margin-bottom:12px">
    <div style="font-size:15px;font-weight:700;margin-bottom:4px">${esc(task.title)}</div>
    <div class="intake-card-meta">
      <span class="domain-tag">${domainLabel(task.domain)}</span>
      <span class="intake-status-badge ${task.status}">${task.status.replace('_', ' ')}</span>
      ${task.risk_level !== 'green' ? `<span class="risk-badge risk-${task.risk_level}">${task.risk_level}</span>` : ''}
      <span style="font-size:9px;color:var(--text-faint);font-family:var(--mono);margin-left:auto">${fmtTime(task.created_at)}</span>
    </div>
  </div>`;

  // Primary action button (large, full-width, unmistakable)
  if (task.status === 'intake') {
    html += `<button class="intake-hero-btn btn-deliberate" onclick="deliberateTask('${task.task_id}')" style="margin-bottom:14px">
      <span class="btn-icon">&#9670;</span> Send to Board for Deliberation
    </button>`;
  } else if (task.status === 'planned') {
    html += `<button class="intake-hero-btn btn-approve-exec" onclick="approvePlan('${task.task_id}')" style="margin-bottom:14px">
      <span class="btn-icon">&#9654;</span> Approve &amp; Execute Plan
    </button>`;
  }

  // Raw request
  html += `<div class="delib-section">
    <div class="delib-section-title">Request</div>
    <div class="delib-section-body">${esc(task.raw_request)}</div>
  </div>`;

  // Deliberation results
  if (delib) {
    html += `<div class="delib-section">
      <div class="delib-section-title">Interpreted Objective</div>
      <div class="delib-section-body" style="font-weight:600">${esc(delib.interpreted_objective)}</div>
    </div>`;

    html += `<div class="delib-section">
      <div class="delib-section-title">Recommended Strategy</div>
      <div class="delib-section-body">${esc(delib.recommended_strategy)}</div>
    </div>`;

    if (delib.expected_outcome) {
      html += `<div class="delib-section">
        <div class="delib-section-title">Expected Outcome</div>
        <div class="delib-section-body">${esc(delib.expected_outcome)}</div>
      </div>`;
    }

    if (delib.key_unknowns && delib.key_unknowns.length) {
      html += `<div class="delib-section">
        <div class="delib-section-title">Key Unknowns</div>
        <div class="delib-section-body"><ul style="list-style:disc;padding-left:14px;margin:0">${delib.key_unknowns.map(u => `<li style="font-size:12px;padding:2px 0;color:var(--text-secondary)">${esc(u)}</li>`).join('')}</ul></div>
      </div>`;
    }

    if (delib.approval_points && delib.approval_points.length) {
      html += `<div class="delib-section">
        <div class="delib-section-title">Approval Points</div>
        <div class="delib-section-body"><ul style="list-style:disc;padding-left:14px;margin:0">${delib.approval_points.map(a => `<li style="font-size:12px;padding:2px 0;color:var(--yellow)">${esc(a)}</li>`).join('')}</ul></div>
      </div>`;
    }

    html += `<div class="delib-section" style="display:flex;gap:16px;flex-wrap:wrap">
      <div><span class="delib-section-title">Risk</span> <span class="risk-badge risk-${delib.risk_level || 'green'}">${delib.risk_level || 'green'}</span></div>
      <div><span class="delib-section-title">Model</span> <span style="font-size:11px;color:var(--text-dim);font-family:var(--mono)">${esc(delib.model_used || '')}</span></div>
      <div><span class="delib-section-title">Tokens</span> <span style="font-size:11px;color:var(--text-dim);font-family:var(--mono)">${delib.tokens_used || '--'}</span></div>
    </div>`;
  }

  // Task Timeline — coherent vertical view
  if (subtasks && subtasks.length) {
    html += `<div class="delib-section">
      <div class="delib-section-title">Task Timeline (${progress.done}/${progress.total} complete)</div>
      ${renderTaskTimeline(task, subtasks)}
    </div>`;
  }

  html += '</div>';
  panel.innerHTML = html;
}

async function deliberateTask(taskId) {
  try {
    const r = await fetch('/api/intake/task/' + taskId + '/deliberate', { method: 'POST' });
    const d = await r.json();
    if (d.ok) {
      showToast('Deliberation queued — Board is working on it', 'success');
      pushActivity('Deliberation queued');
      selectedIntakeTaskId = taskId;
      _lastKnownIntakeStatus = 'deliberating';
      loadIntakeTasks();
      showIntakeDetail(taskId);
      startIntakeDetailPoll();
    } else {
      showToast('Error: ' + (d.error || 'Unknown'), 'error');
    }
  } catch (e) { showToast('Network error', 'error'); }
}

async function approvePlan(taskId) {
  try {
    const r = await fetch('/api/intake/task/' + taskId + '/approve-plan', { method: 'POST' });
    const d = await r.json();
    if (d.ok) {
      showToast(`Plan approved — ${d.queued} subtasks queued for execution`, 'success');
      pushActivity('Plan approved, execution started');
      loadIntakeTasks();
      showIntakeDetail(taskId);
      startIntakeDetailPoll();
    } else {
      showToast('Error: ' + (d.error || 'Unknown'), 'error');
    }
  } catch (e) { showToast('Network error', 'error'); }
}

async function approveSubtask(subtaskId) {
  try {
    const r = await fetch('/api/subtask/' + subtaskId + '/approve', { method: 'POST' });
    const d = await r.json();
    if (d.ok) {
      const msg = d.action === 'approved_and_continued'
        ? (d.nextQueued && d.nextQueued.length > 0
          ? `Approved — resuming workflow: ${d.nextQueued.map(n => n.title).join(', ')}`
          : `Approved "${d.resumed}" — ${d.message || 'workflow continuing'}`)
        : `Approved & queued: ${d.resumed || 'subtask'}`;
      showToast(msg, 'success');
      pushActivity(msg);
      // Instant refresh everywhere
      loadPendingApprovals();
      loadCurrentTaskFocus();
      if (selectedIntakeTaskId) showIntakeDetail(selectedIntakeTaskId);
      loadIntakeTasks();
    } else {
      showToast('Error: ' + (d.error || 'Unknown'), 'error');
    }
  } catch (e) { showToast('Network error', 'error'); }
}

// ═══════════════════════════════════════════
// GLOBAL APPROVAL INBOX + CURRENT TASK FOCUS
// ═══════════════════════════════════════════

let PENDING_APPROVALS = [];

async function loadPendingApprovals() {
  try {
    const r = await fetch('/api/intake/pending-approvals');
    PENDING_APPROVALS = await r.json();
    renderGlobalApprovalInbox();
    renderApprovalBadge();
  } catch {}
}

function renderApprovalBadge() {
  const badge = document.getElementById('navApprovalBadge');
  if (badge) {
    badge.textContent = PENDING_APPROVALS.length;
    badge.style.display = PENDING_APPROVALS.length > 0 ? '' : 'none';
  }
}

function renderGlobalApprovalInbox() {
  const el = document.getElementById('globalApprovalInbox');
  if (!el) return;

  if (!PENDING_APPROVALS.length) { el.innerHTML = ''; return; }

  let html = `<div class="approval-inbox">
    <div class="approval-inbox-header">
      <span class="approval-inbox-icon">&#9888;</span>
      <span class="approval-inbox-title">${PENDING_APPROVALS.length} subtask${PENDING_APPROVALS.length > 1 ? 's' : ''} awaiting your approval</span>
    </div>
    <div class="approval-inbox-items">`;

  for (const s of PENDING_APPROVALS) {
    const typeIcon = getSubtaskTypeIcon(s.stage);
    const isFallback = s.status === 'builder_fallback';
    const isBuilderRunning = s.status === 'builder_running';
    const outcome = s.builder_outcome || '';
    const outcomeLabel = getBuilderOutcomeLabel(outcome);
    const phase = s.builder_phase || '';

    // Builder running — show progress, no actions
    if (isBuilderRunning) {
      const phaseLabels = {
        inspecting: 'Scanning repo...', launching: 'Starting CLI...',
        running: 'Writing code...', diffing: 'Checking changes...',
        classifying: 'Analyzing...', reporting: 'Reporting...',
      };
      html += `<div class="approval-inbox-item is-builder-running">
        <div class="approval-inbox-item-info">
          <span class="subtask-type-icon ${s.stage}">${typeIcon}</span>
          <div>
            <div class="approval-inbox-item-title">${esc(s.title)}</div>
            <div class="approval-inbox-item-meta">
              <span class="stage-tag ${s.stage}">${esc(s.stage)}</span>
              <span class="task-model-tag claude">claude</span>
              <span class="builder-phase-indicator phase-${phase}">${phaseLabels[phase] || 'Builder running...'}</span>
            </div>
            ${s.files_to_write && s.files_to_write.length ? `<div class="approval-files-changed"><span style="font-size:9px;color:var(--text-faint)">Targeting:</span> ${s.files_to_write.slice(0, 3).map(f => '<span class="file-badge">' + esc(f) + '</span>').join('')}</div>` : ''}
          </div>
        </div>
        <div class="builder-running-spinner"></div>
      </div>`;
      continue;
    }

    html += `<div class="approval-inbox-item ${isFallback ? 'is-fallback' : ''} ${outcome === 'code_applied' ? 'is-code-applied' : ''}">
      <div class="approval-inbox-item-info">
        <span class="subtask-type-icon ${s.stage}">${typeIcon}</span>
        <div>
          <div class="approval-inbox-item-title">${esc(s.title)}</div>
          <div class="approval-inbox-item-meta">
            <span class="stage-tag ${s.stage}">${esc(s.stage)}</span>
            <span class="task-model-tag ${s.assigned_model}">${esc(s.assigned_model)}</span>
            ${outcome ? `<span class="builder-outcome-tag ${outcome}">${outcomeLabel}</span>` : ''}
            <span style="color:var(--text-faint);font-size:9px">from: ${esc(s.parent_title)}</span>
          </div>`;

    // Review surface for code_applied: changed files + diff summary + output excerpt
    if (outcome === 'code_applied') {
      html += `<div class="builder-review-surface">`;
      if (s.files_changed && s.files_changed.length) {
        html += `<div class="review-files-section">
          <div class="review-section-label">Changed Files (${s.files_changed.length})</div>
          <div class="approval-files-changed">${s.files_changed.map(f => '<span class="file-badge">' + esc(f) + '</span>').join('')}</div>
        </div>`;
      }
      if (s.diff_summary) {
        html += `<div class="review-diff-section">
          <div class="review-section-label">Diff Summary</div>
          <pre class="review-diff-pre">${esc(s.diff_summary)}</pre>
        </div>`;
      }
      if (s.output) {
        html += `<div class="review-output-section">
          <div class="review-section-label">Builder Output</div>
          <pre class="review-output-pre">${esc((s.output || '').slice(0, 500))}</pre>
        </div>`;
      }
      html += `</div>`;
    } else {
      // Non-code-applied: show basic info
      if (s.files_changed && s.files_changed.length) {
        html += `<div class="approval-files-changed">${s.files_changed.map(f => '<span class="file-badge">' + esc(f) + '</span>').join('')}</div>`;
      }
      if (s.diff_summary) {
        html += `<div class="builder-diff-summary"><pre>${esc(s.diff_summary)}</pre></div>`;
      }
      if (s.prompt_file) {
        html += `<div class="builder-prompt-link">Prompt file: <code>${esc(s.prompt_file)}</code></div>`;
      }
    }

    html += `</div>
      </div>
      <div class="approval-inbox-actions">
        ${isFallback ? `
          <button class="btn-launch-builder" onclick="event.stopPropagation();launchClaude('${s.subtask_id}')">
            <span>&#9654;</span> Re-run Builder
          </button>
          <button class="btn-approve-global" onclick="event.stopPropagation();approveSubtaskGlobal('${s.subtask_id}', this)">
            <span>&#10003;</span> Manual Execution Done
          </button>
        ` : outcome === 'code_applied' ? `
          <button class="btn-approve-global" onclick="event.stopPropagation();approveSubtaskGlobal('${s.subtask_id}', this)">
            <span>&#10003;</span> Approve Changes
          </button>
          <button class="btn-reject-global" onclick="event.stopPropagation();rejectSubtask('${s.subtask_id}')">
            <span>&#10007;</span> Reject
          </button>
          <button class="btn-revise-global" onclick="event.stopPropagation();reviseSubtask('${s.subtask_id}')">
            <span>&#9998;</span> Revise
          </button>
        ` : `
          <button class="btn-approve-global" onclick="event.stopPropagation();approveSubtaskGlobal('${s.subtask_id}', this)">
            <span>&#10003;</span> Approve & Continue
          </button>
        `}
      </div>
    </div>`;
  }

  html += '</div></div>';
  el.innerHTML = html;
}

async function approveSubtaskGlobal(subtaskId, btnEl) {
  if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Approving...'; }
  try {
    const r = await fetch('/api/subtask/' + subtaskId + '/approve', { method: 'POST' });
    const d = await r.json();
    if (d.ok) {
      const msg = d.action === 'approved_and_continued'
        ? (d.nextQueued && d.nextQueued.length > 0
          ? `Approved — resuming workflow: ${d.nextQueued.map(n => n.title).join(', ')}`
          : `Approved "${d.resumed}" — ${d.message || 'workflow continuing'}`)
        : `Approved & queued: ${d.resumed || 'subtask'}`;
      showToast(msg, 'success');
      pushActivity(msg);
      // Instant refresh all approval surfaces
      loadPendingApprovals();
      loadCurrentTaskFocus();
      if (selectedIntakeTaskId) showIntakeDetail(selectedIntakeTaskId);
      loadIntakeTasks();
      // Refresh operator panels
      if (typeof renderNeedsOperator === 'function') renderNeedsOperator();
      if (typeof refreshChiefOfStaff === 'function') refreshChiefOfStaff();
    } else {
      showToast('Error: ' + (d.error || 'Unknown'), 'error');
      if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '<span>&#10003;</span> Approve & Continue'; }
    }
  } catch (e) {
    showToast('Network error', 'error');
    if (btnEl) { btnEl.disabled = false; btnEl.innerHTML = '<span>&#10003;</span> Approve & Continue'; }
  }
}

async function rejectSubtask(subtaskId) {
  const reason = prompt('Reason for rejection (changes will be reverted):');
  if (!reason) return;
  try {
    const r = await fetch('/api/subtask/' + subtaskId + '/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    const d = await r.json();
    if (d.ok) {
      showToast(`Rejected & reverted: ${d.rejected}`, 'info');
      pushActivity(`Rejected: ${d.rejected}`);
      loadPendingApprovals();
      loadCurrentTaskFocus();
      if (selectedIntakeTaskId) showIntakeDetail(selectedIntakeTaskId);
      loadIntakeTasks();
    } else {
      showToast('Error: ' + (d.error || 'Unknown'), 'error');
    }
  } catch (e) { showToast('Network error', 'error'); }
}

async function reviseSubtask(subtaskId) {
  const notes = prompt('Revision instructions for the builder:');
  if (!notes) return;
  try {
    const r = await fetch('/api/subtask/' + subtaskId + '/revise', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notes }),
    });
    const d = await r.json();
    if (d.ok) {
      showToast(`Revision queued: ${d.revised}`, 'success');
      pushActivity(`Revision queued: ${d.revised}`);
      loadPendingApprovals();
      loadCurrentTaskFocus();
      if (selectedIntakeTaskId) showIntakeDetail(selectedIntakeTaskId);
      loadIntakeTasks();
    } else {
      showToast('Error: ' + (d.error || 'Unknown'), 'error');
    }
  } catch (e) { showToast('Network error', 'error'); }
}

async function loadCurrentTaskFocus() {
  try {
    const r = await fetch('/api/intake/current');
    const data = await r.json();
    renderCurrentTaskFocus(data);
  } catch {}
}

function renderCurrentTaskFocus(data) {
  const el = document.getElementById('currentTaskFocus');
  if (!el) return;

  if (!data.task) { el.innerHTML = ''; return; }
  const t = data.task;
  const p = data.progress || {};
  const active = data.activeSubtask;
  const blocking = data.nextBlocking;

  const dotColors = {
    intake: 'var(--text-dim)', deliberating: 'var(--purple)', planned: 'var(--blue)',
    builder_running: 'var(--purple)', executing: 'var(--green)',
    waiting_approval: 'var(--yellow)', builder_fallback: 'var(--red)',
    waiting_human: 'var(--yellow)', done: 'var(--green)', failed: 'var(--red)',
  };
  const dot = dotColors[t.status] || 'var(--text-faint)';
  const isPulse = ['deliberating', 'executing', 'builder_running'].includes(t.status);

  const statusLabels = {
    intake: 'Submitted', deliberating: 'Board Deliberating', planned: 'Plan Ready',
    builder_running: 'Builder Running', executing: 'Executing',
    waiting_approval: 'Needs Approval',
    builder_fallback: 'Builder Fallback', waiting_human: 'Manual Action Needed',
    done: 'Done', failed: 'Failed',
  };

  let html = `<div class="current-task-focus" onclick="switchTab('intake');showIntakeDetail('${t.task_id}')" style="cursor:pointer">
    <div class="ctf-header">
      <span class="ctf-label">CURRENT TASK</span>
      <span class="ctf-status-dot ${isPulse ? 'pulse' : ''}" style="background:${dot}"></span>
      <span class="ctf-status-text" style="color:${dot}">${statusLabels[t.status] || t.status}</span>
      <span class="domain-tag" style="margin-left:auto">${esc(t.domain)}</span>
    </div>
    <div class="ctf-title">${esc(t.title)}</div>`;

  // Progress bar
  if (p.total > 0) {
    const pct = Math.round((p.done / p.total) * 100);
    html += `<div class="ctf-progress">
      <div class="ctf-progress-bar"><div class="ctf-progress-fill" style="width:${pct}%"></div></div>
      <span class="ctf-progress-text">${p.done}/${p.total} subtasks</span>
    </div>`;
  }

  // Builder active — show detailed builder info
  const builderActive = data.builderActive;
  if (builderActive) {
    const phase = builderActive.builder_phase || 'running';
    const phaseLabels = {
      inspecting: 'Scanning repo...', launching: 'Starting Claude CLI...',
      running: 'Claude is writing code...', diffing: 'Checking for changes...',
      classifying: 'Analyzing results...', reporting: 'Generating report...',
      review: 'Ready for review', fallback: 'Needs manual execution',
    };
    const targetFiles = builderActive.target_files || {};
    const realFiles = targetFiles.real || builderActive.files_to_write || [];

    html += `<div class="ctf-builder-active">
      <span class="ctf-mini-label" style="color:var(--purple)">BUILDER:</span>
      <span class="builder-phase-indicator phase-${phase}">${phaseLabels[phase] || phase}</span>
    </div>`;
    if (realFiles.length) {
      html += `<div class="ctf-builder-files">
        <span class="ctf-mini-label">FILES:</span>
        ${realFiles.slice(0, 4).map(f => '<span class="file-badge">' + esc(f.split('/').pop()) + '</span>').join('')}
        ${realFiles.length > 4 ? '<span class="file-badge">+' + (realFiles.length - 4) + ' more</span>' : ''}
      </div>`;
    }
  }

  // Active subtask (non-builder)
  if (active && !builderActive) {
    const typeIcon = getSubtaskTypeIcon(active.stage);
    html += `<div class="ctf-active-subtask">
      <span class="ctf-mini-label">NOW:</span>
      <span class="subtask-type-icon ${active.stage}" style="font-size:10px">${typeIcon}</span>
      <span>${esc(active.title)}</span>
      <span class="task-model-tag ${active.assigned_model}" style="font-size:8px">${esc(active.assigned_model)}</span>
    </div>`;
  }

  // Review ready items (code changes awaiting approval)
  const reviewReady = data.reviewReady || [];
  if (reviewReady.length > 0) {
    html += `<div class="ctf-review-ready">
      <span class="ctf-mini-label" style="color:var(--yellow)">REVIEW:</span>
      <span>${reviewReady.length} subtask(s) with code changes need your review</span>
    </div>`;
  }

  // Blocking item
  if (blocking && !active && !builderActive) {
    html += `<div class="ctf-blocking">
      <span class="ctf-mini-label" style="color:var(--yellow)">BLOCKED:</span>
      <span>${esc(blocking.title)}</span>
      <button class="btn-approve-inline" onclick="event.stopPropagation();approveSubtaskGlobal('${blocking.subtask_id}', this)">Approve</button>
    </div>`;
  }

  // Next action from Rahul
  if (t.status === 'intake') {
    html += `<div class="ctf-next-action">Your action: Send to Board for Deliberation</div>`;
  } else if (t.status === 'planned') {
    html += `<div class="ctf-next-action">Your action: Review plan and Approve & Execute</div>`;
  } else if (t.status === 'waiting_approval') {
    html += `<div class="ctf-next-action">Your action: Review and approve ${data.pendingApprovals.length} pending subtask(s)</div>`;
  } else if (t.status === 'builder_running' || (builderActive && t.status === 'executing')) {
    html += `<div class="ctf-next-action" style="color:var(--purple)">Builder is working — will stop for review when done</div>`;
  }

  html += '</div>';
  el.innerHTML = html;
}

function getSubtaskTypeIcon(stage) {
  const icons = {
    audit: '&#128269;',         // magnifying glass
    decide: '&#9878;',          // scales
    implement: '&#128736;',     // hammer wrench
    build: '&#128736;',
    code: '&#128187;',          // laptop
    locate_files: '&#128205;',  // round pushpin — file targeting
    report: '&#128196;',        // document
    research: '&#128218;',      // book
    review: '&#128065;',        // eye
    strategy: '&#9813;',        // chess queen
    approve: '&#9989;',         // checkmark
  };
  return icons[stage] || '&#9654;';
}

function getBuilderOutcomeLabel(outcome) {
  const labels = {
    code_applied: 'Code Applied',
    no_changes: 'No Changes',
    builder_fallback_prompt_created: 'Fallback — Manual Required',
    builder_timeout: 'Builder Timed Out',
    blocked_missing_context: 'Blocked — Missing Files',
    waiting_approval_for_commit: 'Awaiting Commit Approval',
    manual_execution_confirmed: 'Manual Done',
    rejected: 'Rejected — Reverted',
  };
  return labels[outcome] || outcome || '';
}

// ═══════════════════════════════════════════
// TASK TIMELINE — Vertical timeline per task
// ═══════════════════════════════════════════

function renderTaskTimeline(task, subtasks) {
  if (!subtasks || !subtasks.length) return '';

  // Build timeline events: intake → deliberation → plan → subtasks → done
  const events = [];

  // Task created
  events.push({
    type: 'milestone', label: 'Task Created', stage: 'intake',
    detail: task.raw_request.slice(0, 80), time: task.created_at, status: 'done',
  });

  // Deliberation (if happened)
  if (task.board_deliberation) {
    const rg = task.board_deliberation.repo_grounding;
    let deliberationDetail = task.board_deliberation.recommended_strategy?.slice(0, 80) || 'Plan produced';
    if (rg && rg.grounded) {
      deliberationDetail += ` | Repo grounded: ${rg.totalFiles} files scanned, ${rg.candidateCount} candidates`;
    }

    events.push({
      type: 'milestone', label: 'Board Deliberation', stage: 'deliberating',
      detail: deliberationDetail,
      time: task.updated_at, status: 'done', model: task.board_deliberation.model_used,
      repo_grounding: rg,
    });

    events.push({
      type: 'milestone', label: 'Plan Ready', stage: 'planned',
      detail: `${subtasks.length} subtasks planned`, time: task.updated_at, status: 'done',
    });
  }

  // Subtasks
  for (let i = 0; i < subtasks.length; i++) {
    const st = subtasks[i];
    events.push({
      type: 'subtask', label: st.title, stage: st.stage,
      role: st.assigned_role, model: st.assigned_model, status: st.status,
      output: st.output?.slice(0, 120), files: st.files_changed || [],
      error: st.error, subtask_id: st.subtask_id, order: i + 1,
      builder_outcome: st.builder_outcome, builder_phase: st.builder_phase,
      diff_summary: st.diff_summary, prompt_file: st.prompt_file,
      what_done: st.what_done, outcome_type: st.outcome_type,
      code_modified: st.code_modified, report_file: st.report_file,
      file_scope: st.file_scope,
    });
  }

  // Render
  let html = '<div class="task-timeline">';
  for (const ev of events) {
    const statusCls = ev.status === 'done' ? 'tl-done' :
                      ev.status === 'running' ? 'tl-running' :
                      ev.status === 'builder_running' ? 'tl-builder-running' :
                      ev.status === 'waiting_approval' ? 'tl-waiting' :
                      ev.status === 'builder_fallback' ? 'tl-fallback' :
                      ev.status === 'waiting_human' ? 'tl-waiting' :
                      ev.status === 'failed' ? 'tl-failed' :
                      ev.status === 'blocked' ? 'tl-blocked' :
                      ev.status === 'queued' ? 'tl-queued' : 'tl-proposed';

    const typeIcon = getSubtaskTypeIcon(ev.stage);

    html += `<div class="tl-event ${statusCls} ${ev.type === 'milestone' ? 'tl-milestone' : 'tl-subtask-event'}">
      <div class="tl-line"><div class="tl-dot ${statusCls}"></div></div>
      <div class="tl-content">
        <div class="tl-header">
          <span class="subtask-type-icon ${ev.stage}">${typeIcon}</span>
          <span class="tl-label">${ev.order ? ev.order + '. ' : ''}${esc(ev.label)}</span>
          ${ev.model ? `<span class="task-model-tag ${ev.model}" style="font-size:8px">${esc(ev.model)}</span>` : ''}
          ${ev.role ? `<span class="tl-role">${esc(ev.role)}</span>` : ''}
          <span class="intake-status-badge ${ev.status}" style="font-size:8px;margin-left:auto">${(ev.status || '').replace('_', ' ')}</span>
        </div>`;

    // Builder outcome badge
    if (ev.builder_outcome) {
      const outcomeLabel = getBuilderOutcomeLabel(ev.builder_outcome);
      html += `<div style="margin-top:3px"><span class="builder-outcome-tag ${ev.builder_outcome}">${outcomeLabel}</span></div>`;
    }

    // "What was done" section — compact summary for completed/terminal subtasks
    if (ev.type === 'subtask' && ev.what_done && ['done', 'failed', 'waiting_approval', 'builder_fallback', 'blocked'].includes(ev.status)) {
      html += `<div class="tl-what-done">`;
      html += `<div class="tl-what-done-label">What was done</div>`;
      html += `<div class="tl-what-done-text">${esc(ev.what_done)}</div>`;

      // Show file scope if available (RPGPO vs TopRanker)
      if (ev.file_scope) {
        if (ev.file_scope.onlyRpgpo) {
          html += `<div class="tl-scope-warning">Changed only RPGPO infra files — no TopRanker project files modified</div>`;
        } else if (ev.file_scope.summary) {
          html += `<div class="tl-scope-detail">${esc(ev.file_scope.summary)}</div>`;
        }
      }

      // Explicit "no code changes" for build tasks
      if (ev.code_modified === false && ['implement', 'build', 'code'].includes(ev.stage)) {
        html += `<div class="tl-no-code-changes">No code changes made</div>`;
      }

      // Changed files
      if (ev.files && ev.files.length) {
        html += `<div class="tl-files">${ev.files.map(f => '<span class="file-badge">' + esc(f) + '</span>').join('')}</div>`;
      }

      // Diff summary
      if (ev.diff_summary) {
        html += `<div class="tl-diff-summary"><div class="tl-diff-label">Diff:</div><pre>${esc(ev.diff_summary)}</pre></div>`;
      }

      // Report link — clickable to view
      if (ev.report_file) {
        html += `<div class="tl-report-link">Report: <a href="/api/file/${encodeURIComponent(ev.report_file)}" target="_blank" style="color:var(--accent-text);text-decoration:none;font-family:var(--mono);font-size:10px">${esc(ev.report_file.split('/').pop())}</a></div>`;
      }

      html += `</div>`;
    } else {
      // Fallback for subtasks without what_done (legacy) or milestones
      if (ev.detail) html += `<div class="tl-detail">${esc(ev.detail)}</div>`;
      if (ev.output) html += `<div class="tl-output">${esc(ev.output)}</div>`;
      if (ev.error) html += `<div class="tl-error">${esc(ev.error)}</div>`;

      // Repo grounding display for deliberation milestone
      if (ev.repo_grounding && ev.repo_grounding.grounded) {
        const rg = ev.repo_grounding;
        html += `<div class="tl-repo-grounding">
          <div class="tl-repo-grounding-label">Repo Grounding</div>
          <div class="tl-repo-grounding-stats">
            <span class="rg-stat">${rg.totalFiles} files scanned</span>
            <span class="rg-stat">${rg.candidateCount} candidates found</span>
            ${rg.targetAreas && rg.targetAreas.length ? `<span class="rg-stat">Areas: ${rg.targetAreas.join(', ')}</span>` : ''}
          </div>
          ${rg.candidates && rg.candidates.length ? `<div class="tl-repo-grounding-files">${rg.candidates.slice(0, 5).map(f => '<span class="file-badge rg-file">' + esc(f) + '</span>').join('')}${rg.candidates.length > 5 ? '<span class="rg-more">+' + (rg.candidates.length - 5) + ' more</span>' : ''}</div>` : ''}
        </div>`;
      } else if (ev.repo_grounding && !ev.repo_grounding.grounded) {
        html += `<div class="tl-repo-grounding tl-repo-grounding-failed">
          <div class="tl-repo-grounding-label">Repo Grounding Failed</div>
          <div class="tl-repo-grounding-reason">No source repo found — file paths may be unverified</div>
        </div>`;
      }

      if (ev.diff_summary) {
        html += `<div class="tl-diff-summary"><div class="tl-diff-label">Changes:</div><pre>${esc(ev.diff_summary)}</pre></div>`;
      }

      if (ev.files && ev.files.length) {
        html += `<div class="tl-files">${ev.files.map(f => '<span class="file-badge">' + esc(f) + '</span>').join('')}</div>`;
      }
    }

    // Prompt file link for fallbacks
    if (ev.prompt_file) {
      html += `<div class="builder-prompt-link" style="margin-top:4px">Prompt: <code>${esc(ev.prompt_file)}</code></div>`;
    }

    // Builder running — show phase indicator
    if (ev.status === 'builder_running') {
      const phase = ev.builder_phase || 'running';
      const phaseLabels = {
        inspecting: 'Scanning repo...', launching: 'Starting CLI...',
        running: 'Writing code...', diffing: 'Checking changes...',
        classifying: 'Analyzing...', reporting: 'Reporting...',
      };
      html += `<div class="tl-builder-progress">
        <span class="builder-phase-indicator phase-${phase}">${phaseLabels[phase] || 'Builder running...'}</span>
        <div class="builder-running-spinner"></div>
      </div>`;
    }

    // Action buttons based on status
    if (ev.status === 'builder_fallback') {
      html += `<div class="tl-actions" style="margin-top:6px;display:flex;gap:6px">
        <button class="btn-launch-builder" onclick="event.stopPropagation();launchClaude('${ev.subtask_id}')">
          <span>&#9654;</span> Re-run Builder
        </button>
        <button class="btn-approve-inline" onclick="event.stopPropagation();approveSubtaskGlobal('${ev.subtask_id}', this)">
          <span>&#10003;</span> Manual Execution Done
        </button>
      </div>`;
    } else if (ev.status === 'waiting_approval') {
      html += `<div class="tl-actions" style="margin-top:4px">`;
      if (ev.builder_outcome === 'code_applied') {
        html += `<button class="btn-approve-inline" onclick="event.stopPropagation();approveSubtaskGlobal('${ev.subtask_id}', this)">
          <span>&#10003;</span> Approve Changes
        </button>
        <button class="btn-reject-inline" onclick="event.stopPropagation();rejectSubtask('${ev.subtask_id}')">
          <span>&#10007;</span> Reject
        </button>
        <button class="btn-revise-inline" onclick="event.stopPropagation();reviseSubtask('${ev.subtask_id}')">
          <span>&#9998;</span> Revise
        </button>`;
      } else {
        html += `<button class="btn-approve-inline" onclick="event.stopPropagation();approveSubtaskGlobal('${ev.subtask_id}', this)">
          <span>&#10003;</span> Approve & Continue
        </button>`;
      }
      html += `</div>`;
    }

    html += '</div></div>';
  }
  html += '</div>';

  // Part 57: Final Result block for completed tasks
  if (task.status === 'done') {
    html += '<div class="final-result-block" id="finalResult_' + task.task_id + '">';
    html += '<div class="final-result-header">Final Result</div>';
    html += '<div class="final-result-loading">Loading final output...</div>';
    html += '</div>';
    // Async-load final output — try structured deliverable first, then raw, then subtask reports
    setTimeout(function() {
      var slot = document.getElementById('finalResult_' + task.task_id);
      // Part 59: Try structured deliverable
      fetch('/api/tasks/' + encodeURIComponent(task.task_id) + '/deliverable').then(function(r) { return r.ok ? r.json() : null; }).then(function(deliv) {
        if (slot && deliv && deliv.model) {
          var h = '<div class="final-result-header">Final Result</div>';
          h += renderStructuredDeliverable(deliv.model);
          if (deliv.model.badges && deliv.model.badges.length) {
            h += '<div class="deliverable-badges">' + deliv.model.badges.map(function(b) { return '<span class="badge-missing">' + esc(b) + '</span>'; }).join(' ') + '</div>';
          }
          h += '<div style="margin-top:6px"><a href="#" onclick="event.preventDefault();this.parentNode.nextSibling.style.display=this.parentNode.nextSibling.style.display===\'none\'?\'block\':\'none\'" style="font-size:10px;color:var(--accent-text)">Toggle raw output</a></div><div style="display:none" id="rawOutput_' + task.task_id + '"></div>';
          slot.innerHTML = h;
          loadRawOutput(task.task_id);
          return;
        }
        // Fallback to raw output
        loadRawOutput(task.task_id);
        // If raw output also fails after 2s, show subtask reports as fallback
        setTimeout(function() {
          if (slot && slot.innerHTML.includes('Loading final output')) {
            var fallbackHtml = '<div class="final-result-header">Final Result</div>';
            fallbackHtml += '<div class="final-result-answer" style="color:var(--text-secondary)">Output available in subtask reports above. Click the report links to view details.</div>';
            slot.innerHTML = fallbackHtml;
          }
        }, 2000);
      }).catch(function() {
        loadRawOutput(task.task_id);
        setTimeout(function() {
          if (slot && slot.innerHTML.includes('Loading final output')) {
            slot.innerHTML = '<div class="final-result-header">Final Result</div><div class="final-result-answer" style="color:var(--text-secondary)">Output available in subtask reports above.</div>';
          }
        }, 2000);
      });
    }, 100);
  }

  return html;
}

/** Part 59: Render structured deliverable from RenderModel */
function renderStructuredDeliverable(model) {
  if (!model) return '';
  var h = '';
  if (model.rendererKey === 'newsroom_list' && model.items) {
    h += '<div class="deliverable-list">';
    for (var i = 0; i < model.items.length; i++) {
      var item = model.items[i];
      h += '<div class="deliverable-card"><span class="deliverable-rank">' + (item.rank || (i+1)) + '</span>';
      h += '<div class="deliverable-card-body"><div class="deliverable-headline">' + esc(String(item.headline || item.label || '')) + '</div>';
      h += '<div class="deliverable-summary">' + esc(String(item.summary || item.rationale || '')) + '</div>';
      if (item.source_url) h += '<a href="' + esc(String(item.source_url)) + '" target="_blank" class="deliverable-source">' + esc(String(item.source_name || 'Source')) + '</a>';
      h += '</div></div>';
    }
    h += '</div>';
  } else if (model.rendererKey === 'shopping_table' && model.table) {
    h += '<table class="deliverable-table"><thead><tr>' + model.table.columns.map(function(c) { return '<th>' + esc(c) + '</th>'; }).join('') + '</tr></thead><tbody>';
    for (var j = 0; j < model.table.rows.length; j++) {
      var row = model.table.rows[j];
      h += '<tr>' + model.table.columns.map(function(c) { return '<td>' + esc(String(row[c] || '')) + '</td>'; }).join('') + '</tr>';
    }
    h += '</tbody></table>';
  } else if (model.rendererKey === 'code_diff' && model.diffs) {
    for (var k = 0; k < model.diffs.length; k++) {
      var diff = model.diffs[k];
      h += '<div class="deliverable-diff"><div class="diff-header">' + esc(diff.changeType) + ' ' + esc(diff.filePath) + '</div>';
      if (diff.hunks) { for (var l = 0; l < diff.hunks.length; l++) { h += '<pre class="diff-hunk">' + esc(diff.hunks[l].lines.join('\n')) + '</pre>'; } }
      h += '</div>';
    }
  } else if ((model.rendererKey === 'document_sections' || model.rendererKey === 'creative_view') && model.sections) {
    for (var m = 0; m < model.sections.length; m++) {
      h += '<div class="deliverable-section"><h4>' + esc(model.sections[m].heading) + '</h4><div>' + esc(model.sections[m].content).replace(/\n/g, '<br>') + '</div></div>';
    }
  } else if (model.rendererKey === 'action_plan_steps' && model.steps) {
    h += '<div class="deliverable-steps">';
    for (var n = 0; n < model.steps.length; n++) {
      var step = model.steps[n];
      h += '<div class="deliverable-step"><span class="step-status">' + esc(step.status || 'todo') + '</span><span>' + esc(step.description) + '</span></div>';
    }
    h += '</div>';
  } else if ((model.rendererKey === 'recommendation_list' || model.rendererKey === 'analysis_brief') && model.items) {
    h += '<div class="deliverable-list">';
    for (var p = 0; p < model.items.length; p++) {
      var rec = model.items[p];
      h += '<div class="deliverable-card"><div class="deliverable-card-body"><div class="deliverable-headline">' + esc(String(rec.label || '')) + '</div>';
      h += '<div class="deliverable-summary">' + esc(String(rec.rationale || rec.detail || '')) + '</div>';
      if (rec.confidence) h += '<span class="deliverable-confidence">' + rec.confidence + '% confidence</span>';
      h += '</div></div>';
    }
    h += '</div>';
  } else if (model.rendererKey === 'schedule_timeline' && model.timeline) {
    h += '<div class="deliverable-timeline">';
    for (var q = 0; q < model.timeline.length; q++) {
      var ev = model.timeline[q];
      h += '<div class="deliverable-event"><span class="event-time">' + esc(ev.start) + '</span><span>' + esc(ev.title) + '</span>';
      if (ev.location) h += '<span class="event-location">' + esc(ev.location) + '</span>';
      h += '</div>';
    }
    h += '</div>';
  } else {
    h += '<div class="deliverable-fallback">Structured deliverable available but no specific renderer — showing raw</div>';
  }
  return h;
}

/** Load raw output fallback */
function loadRawOutput(taskId) {
  fetch('/api/final-output/' + encodeURIComponent(taskId)).then(function(r) { return r.ok ? r.json() : null; }).then(function(output) {
        var slot = document.getElementById('finalResult_' + taskId);
        var rawSlot = document.getElementById('rawOutput_' + taskId);
        if (!output) { if (slot && !slot.innerHTML.includes('final-result-header')) { slot.innerHTML = '<div class="final-result-header">Final Result</div><div class="final-result-empty">No output available</div>'; } return; }
        // Build raw HTML
        var rh = '';
        if (output.final_answer) {
          rh += '<div class="final-result-answer">' + esc(output.final_answer).replace(/\n/g, '<br>') + '</div>';
        } else if (output.summary) {
          rh += '<div class="final-result-answer">' + esc(output.summary) + '</div>';
        } else {
          rh += '<div class="final-result-empty">No final answer extracted — check report files below</div>';
        }
        if (output.artifacts && output.artifacts.length) {
          rh += '<div class="final-result-artifacts">';
          for (var i = 0; i < output.artifacts.length; i++) {
            var a = output.artifacts[i];
            rh += '<div class="final-result-artifact"><span class="fra-type">' + esc(a.type) + '</span><span class="fra-title">' + esc(a.title) + '</span>';
            if (a.path) rh += ' <a href="/api/file/' + encodeURIComponent(a.path) + '" target="_blank" class="fra-link">Open</a>';
            rh += '</div>';
          }
          rh += '</div>';
        }
        if (output.report_paths && output.report_paths.length) {
          rh += '<div class="final-result-reports"><span class="fra-type">Reports:</span> ';
          for (var j = 0; j < output.report_paths.length; j++) {
            rh += '<a href="/api/file/' + encodeURIComponent(output.report_paths[j]) + '" target="_blank" class="fra-link">' + esc(output.report_paths[j].split('/').pop()) + '</a> ';
          }
          rh += '</div>';
        }
        if (output.files_changed && output.files_changed.length) {
          rh += '<div class="final-result-files">' + output.files_changed.map(function(f) { return '<span class="file-badge">' + esc(f) + '</span>'; }).join('') + '</div>';
        }
        // If structured renderer already populated slot, put raw in hidden div
        if (rawSlot) { rawSlot.innerHTML = rh; }
        else if (slot) { slot.innerHTML = '<div class="final-result-header">Final Result</div>' + rh; }
      }).catch(function() {});
}

// ═══════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════

// Part 58: Engine contract hint on domain selection
(function() {
  var domainSelect = document.getElementById('intakeDomain');
  var hintEl = document.getElementById('engineContractHint');
  if (domainSelect && hintEl) {
    domainSelect.addEventListener('change', function() {
      var engineId = domainSelect.value;
      if (!engineId) { hintEl.style.display = 'none'; return; }
      fetch('/api/output-contracts/' + encodeURIComponent(engineId)).then(function(r) { return r.ok ? r.json() : null; }).then(function(data) {
        if (data && data.contract) {
          var c = data.contract;
          hintEl.style.display = 'block';
          hintEl.innerHTML = '<strong>Expected output:</strong> ' + esc(c.example_deliverable) + (c.approval_required ? ' <span style="color:var(--accent-text)">| Approval required</span>' : ' | Auto-complete');
        } else { hintEl.style.display = 'none'; }
      }).catch(function() { hintEl.style.display = 'none'; });
    });
  }
})();

connectSSE();
loadData();
loadStatus();
loadTasks();
loadPendingApprovals();
loadCurrentTaskFocus();

setInterval(loadStatus, 10000);
setInterval(loadTasks, 3000);
setInterval(loadData, 45000);
setInterval(renderHeartbeat, 5000);
setInterval(loadPendingApprovals, 4000);
setInterval(loadCurrentTaskFocus, 4000);

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;
  if (e.key === 'Escape') document.getElementById('taskModal').classList.remove('open');
  const tabs = ['home', 'tasks', 'intake', 'channels', 'missions', 'topranker', 'approvals', 'costs', 'logs', 'controls', 'settings'];
  const n = parseInt(e.key);
  if (n >= 1 && n <= 9 && !e.metaKey && !e.ctrlKey && !e.altKey) switchTab(tabs[n - 1]);
  if (e.key === '0' && !e.metaKey && !e.ctrlKey && !e.altKey) switchTab(tabs[9]);
});
