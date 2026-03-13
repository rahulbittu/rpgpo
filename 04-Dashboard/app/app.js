// RPGPO Command Center v4 — World-Class Private Operations Console

let DATA = null, TASKS = [], STATUS = null;
const activity = [];
const MAX_ACT = 50;
let trackedTaskId = null;
let logFilter = 'all';
let taskFilter = 'all';
let evtSource = null;
let sseReconnectTimer = null;
let workerLastSeen = null;
let currentlyRunningTask = null;

// ══════════════════════════════════════════════
// SSE — Live event stream with auto-reconnect
// ══════════════════════════════════════════════

function connectSSE() {
  if (evtSource) try { evtSource.close(); } catch {}
  if (sseReconnectTimer) { clearTimeout(sseReconnectTimer); sseReconnectTimer = null; }
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
      pushActivity(d.action);
    } catch {}
  });

  evtSource.addEventListener('task', (e) => {
    try {
      const d = JSON.parse(e.data);
      if (d.task) {
        const i = TASKS.findIndex(t => t.id === d.task.id);
        if (i !== -1) TASKS[i] = d.task; else TASKS.unshift(d.task);
        renderAllTasks();
        if (trackedTaskId === d.task.id) updateOutput(d.task);

        // Toast for important transitions
        if (d.task.status === 'done') {
          showToast(`Task completed: ${d.task.label}`, 'success');
          workerLastSeen = new Date();
        } else if (d.task.status === 'failed') {
          showToast(`Task failed: ${d.task.label}`, 'error');
          workerLastSeen = new Date();
        } else if (d.task.status === 'running') {
          workerLastSeen = new Date();
        }
        renderHeartbeat();
      }
      loadTasks(); // full refresh for consistency
    } catch (err) { console.error('[SSE] parse err:', err); }
  });

  evtSource.onerror = () => {
    document.getElementById('liveDot').classList.remove('connected');
    document.getElementById('ssePill').classList.remove('online');
    // Auto-reconnect after 3s
    if (!sseReconnectTimer) {
      sseReconnectTimer = setTimeout(() => {
        console.log('[SSE] reconnecting...');
        connectSSE();
      }, 3000);
    }
  };
}

// ══════════════════════════════════════════════
// ACTIVITY FEED
// ══════════════════════════════════════════════

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

// ══════════════════════════════════════════════
// TOAST NOTIFICATIONS
// ══════════════════════════════════════════════

function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: '&#10003;', error: '&#10007;', info: '&#8505;' };
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span class="toast-icon">${icons[type] || icons.info}</span><span>${esc(message)}</span>`;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 4200);
}

// ══════════════════════════════════════════════
// NAVIGATION
// ══════════════════════════════════════════════

document.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', e => { e.preventDefault(); switchTab(l.dataset.tab); }));

function switchTab(tab) {
  document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(p => p.classList.remove('active'));
  const link = document.querySelector(`.nav-link[data-tab="${tab}"]`);
  if (link) link.classList.add('active');
  const panel = document.getElementById('tab-' + tab);
  if (panel) panel.classList.add('active');
}

// ══════════════════════════════════════════════
// DATA LOADING
// ══════════════════════════════════════════════

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

// ══════════════════════════════════════════════
// RENDER STATUS
// ══════════════════════════════════════════════

function renderStatus() {
  if (!STATUS) return;
  const s = STATUS;

  // Sidebar pills
  document.getElementById('serverPill').classList.add('online');
  document.getElementById('workerPill').classList.toggle('online', s.worker.running);

  // Sidebar text
  const up = s.server.uptime ? fmtUp(s.server.uptime) : '--';
  document.getElementById('sysStatus').textContent = `${up} | :${s.server.port}`;

  // Home status strip
  setStatus('hsServer', 'Online', 'ok');
  setStatus('hsWorker', s.worker.running ? 'Running' : 'Stopped', s.worker.running ? 'ok' : 'err');

  const oai = s.keys.OPENAI_API_KEY === 'configured';
  const ppx = s.keys.PERPLEXITY_API_KEY === 'configured';
  const mc = 1 + (oai ? 1 : 0) + (ppx ? 1 : 0);
  setStatus('hsModels', `${mc}/3`, mc === 3 ? 'ok' : 'warn');

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
    <div class="settings-row"><span class="settings-label">PID</span>${s.worker.pid || '--'}</div>
    <div class="settings-row"><span class="settings-label">Node</span>${esc(s.node)}</div>
  `;

  // Settings system
  const sy = document.getElementById('settingsSystem');
  if (sy) sy.innerHTML = `
    <div class="settings-row"><span class="settings-label">Workspace</span><span style="font-family:var(--mono);font-size:11px">${esc(s.workspace)}</span></div>
    <div class="settings-row"><span class="settings-label">OPENAI</span><span class="key-status ${oai ? 'key-ok' : 'key-miss'}">${oai ? 'configured' : 'missing'}</span></div>
    <div class="settings-row"><span class="settings-label">PERPLEXITY</span><span class="key-status ${ppx ? 'key-ok' : 'key-miss'}">${ppx ? 'configured' : 'missing'}</span></div>
  `;
}

function setStatus(id, text, cls) {
  const el = document.getElementById(id);
  if (el) { el.textContent = text; el.className = 'status-cell-value ' + cls; }
}

// ══════════════════════════════════════════════
// WORKER HEARTBEAT
// ══════════════════════════════════════════════

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
    const lastSeen = workerLastSeen ? timeAgo(workerLastSeen) : '--';
    detail.textContent = workerLastSeen ? `last active ${lastSeen}` : 'waiting for task';
  } else {
    dot.className = 'heartbeat-dot';
    label.textContent = 'Worker stopped';
    label.style.color = 'var(--red)';
    detail.textContent = '';
  }
}

// ══════════════════════════════════════════════
// RENDER TASKS — Rich task cards
// ══════════════════════════════════════════════

function renderAllTasks() {
  renderTaskQueue();
  renderHomeRunning();
  renderLatest();
  renderHomeRecent();
  renderNavBadges();
}

function renderTaskQueue() {
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

  // Running hero in tasks tab
  const runHero = document.getElementById('tasksRunningHero');
  const rt = TASKS.find(t => t.status === 'running');
  if (runHero) {
    if (rt) {
      runHero.innerHTML = renderRunningHero(rt);
    } else {
      runHero.innerHTML = '';
    }
  }

  // Filtered task list
  const filtered = taskFilter === 'all' ? TASKS : TASKS.filter(t => t.status === taskFilter);
  if (!filtered.length) { list.innerHTML = '<div class="task-empty">No tasks match filter</div>'; return; }
  list.innerHTML = filtered.slice(0, 50).map(taskCard).join('');
}

function renderHomeRunning() {
  const el = document.getElementById('homeRunningTask');
  if (!el) return;
  const rt = TASKS.find(t => t.status === 'running');
  if (rt) {
    el.innerHTML = renderRunningHero(rt);
  } else {
    el.innerHTML = '';
  }
}

function renderRunningHero(t) {
  return `<div class="running-task-hero" onclick="showTask('${t.id}')">
    <div class="running-label">Currently Running</div>
    <div style="display:flex;align-items:center;gap:8px">
      <span class="task-title">${esc(t.label)}</span>
      <span class="task-type-tag">${esc(t.type)}</span>
    </div>
    ${t.output ? '<pre>' + esc(t.output.slice(-200)) + '</pre>' : '<pre style="color:var(--text-faint)">Executing...</pre>'}
  </div>`;
}

function taskCard(t) {
  const tm = fmtTime(t.updatedAt || t.createdAt);
  const extra = t.status === 'running' ? ' is-running' : t.status === 'failed' ? ' is-failed' : '';
  let summaryHtml = '';
  if (t.output && t.status === 'done') {
    const lines = t.output.trim().split('\n').filter(l => l.trim());
    const summary = lines.slice(-2).join(' ').slice(0, 120);
    if (summary) summaryHtml = `<div class="task-summary">${esc(summary)}</div>`;
  }
  if (t.error && t.status === 'failed') {
    summaryHtml = `<div class="task-summary" style="color:var(--red)">${esc(t.error.slice(0, 120))}</div>`;
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
  const done = TASKS.filter(t => t.status === 'done' || t.status === 'failed');
  if (!done.length) { el.innerHTML = '<div class="task-empty">No completed tasks yet</div>'; return; }
  const t = done[0];
  const tm = fmtTime(t.updatedAt);
  const borderClass = t.status === 'done' ? 'latest-task-card' : 'latest-task-card';
  const labelClass = t.status === 'done' ? 'completed-label' : 'completed-label';
  el.innerHTML = `<div class="${borderClass}" onclick="showTask('${t.id}')" style="cursor:pointer${t.status === 'failed' ? ';border-color:var(--red-border)' : ''}">
    <div class="${labelClass}" style="${t.status === 'failed' ? 'color:var(--red)' : ''}">
      ${t.status === 'failed' ? 'Failed' : 'Completed'} at ${tm}
    </div>
    <div style="display:flex;align-items:center;gap:8px">
      <span class="task-title">${esc(t.label)}</span>
      <span class="task-status-badge ${t.status}" style="font-size:8px">${t.status}</span>
    </div>
    ${t.output ? '<pre>' + esc(t.output.slice(0, 200)) + '</pre>' : ''}
    ${t.error ? '<pre style="color:var(--red)">' + esc(t.error.slice(0, 150)) + '</pre>' : ''}
    ${t.filesWritten && t.filesWritten.length ? '<div class="task-files" style="margin-top:4px">' + t.filesWritten.map(f => `<span class="task-file-tag">${esc(f.split('/').pop())}</span>`).join('') + '</div>' : ''}
  </div>`;
}

function renderNavBadges() {
  // Active tasks badge
  const active = TASKS.filter(t => t.status === 'queued' || t.status === 'running').length;
  const tb = document.getElementById('navTaskBadge');
  if (tb) {
    if (active > 0) { tb.textContent = active; tb.style.display = ''; }
    else { tb.style.display = 'none'; }
  }

  // Approval badge
  if (DATA) {
    const ab = document.getElementById('navApprovalBadge');
    if (ab) {
      if (DATA.approvals.length > 0) { ab.textContent = DATA.approvals.length; ab.style.display = ''; }
      else { ab.style.display = 'none'; }
    }
  }
}

function filterTasks(f) {
  taskFilter = f;
  document.querySelectorAll('#taskFilters .qa-btn').forEach(b => {
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
  b += `Created:   ${t.createdAt}\n`;
  b += `Updated:   ${t.updatedAt}\n`;
  if (t.filesWritten?.length) {
    b += `\n--- Files Written ---\n${t.filesWritten.join('\n')}\n`;
  }
  if (t.error) b += `\n--- Error ---\n${t.error}\n`;
  if (t.output) b += `\n--- Output ---\n${t.output}\n`;
  document.getElementById('taskModalTitle').textContent = `${t.label} [${t.status.toUpperCase()}]`;
  document.getElementById('taskModalBody').textContent = b;
  document.getElementById('taskModal').classList.add('open');
}

function closeTaskModal(e) { if (e.target === e.currentTarget) document.getElementById('taskModal').classList.remove('open'); }

// ══════════════════════════════════════════════
// OUTPUT PANEL (Controls tab)
// ══════════════════════════════════════════════

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

// ══════════════════════════════════════════════
// RENDER ALL
// ══════════════════════════════════════════════

function render() {
  if (!DATA) return;
  renderHome();
  renderMissions();
  renderBrief();
  renderApprovals();
  renderLogs();
  renderTopRanker();
  renderNavBadges();
}

// ══════════════════════════════════════════════
// HOME
// ══════════════════════════════════════════════

function renderHome() {
  const s = DATA.state;
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
  setStatus('hsApprovals', DATA.approvals.length === 0 ? 'Clear' : DATA.approvals.length + ' pending', DATA.approvals.length === 0 ? 'ok' : 'warn');

  // Mission health
  const md = document.getElementById('homeMissions');
  md.innerHTML = DATA.missions.map(m => {
    const bc = badgeClass(m.status);
    const isTR = m.mission === 'TopRanker';
    return `<div class="home-mission">
      <span>${isTR ? '<strong style="color:var(--accent-text)">' + esc(m.mission) + '</strong>' : esc(m.mission)}</span>
      <span class="mission-badge ${bc}">${esc(m.status)}</span>
    </div>`;
  }).join('');
}

// ══════════════════════════════════════════════
// MISSIONS
// ══════════════════════════════════════════════

function renderMissions() {
  document.getElementById('missionCards').innerHTML = DATA.missions.map(m => {
    const flag = m.mission === 'TopRanker';
    const bc = badgeClass(m.status);
    return `<div class="mission-card ${flag ? 'flagship' : ''}">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
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

// ══════════════════════════════════════════════
// BRIEF
// ══════════════════════════════════════════════

function renderBrief() {
  const c = document.getElementById('briefContent');
  if (!DATA.briefs.length) { c.innerHTML = '<p style="color:var(--text-faint)">No briefs found</p>'; return; }
  c.innerHTML = md2html(DATA.briefs[0].content);
}

// ══════════════════════════════════════════════
// APPROVALS — Compact, frictionless
// ══════════════════════════════════════════════

function renderApprovals() {
  const c = document.getElementById('approvalsList');
  if (!DATA.approvals.length) {
    c.innerHTML = '<div class="card"><p style="color:var(--text-faint)">No pending approvals</p></div>';
    return;
  }
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
      ${reason ? '<div class="approval-summary"><strong style="color:var(--text-faint);font-size:9px;text-transform:uppercase">Reason:</strong> ' + esc(reason) + '</div>' : ''}
      ${upside ? '<div class="approval-summary"><strong style="color:var(--text-faint);font-size:9px;text-transform:uppercase">Upside:</strong> ' + esc(upside) + '</div>' : ''}
      <div class="approval-actions" id="act-${sid}">
        <button class="btn-approve" onclick="doApproval('${a.name}','approve','${sid}')">Approve</button>
        <button class="btn-reject" onclick="doApproval('${a.name}','reject','${sid}')">Reject</button>
        <button class="btn-detail" onclick="showApprovalDetail('${sid}')">View Details</button>
      </div>
      <div class="md-content" id="detail-${sid}" style="display:none;margin-top:8px;padding-top:8px;border-top:1px solid var(--border);max-height:200px;overflow-y:auto">${md2html(a.content)}</div>
    </div>`;
  }).join('');
}

function showApprovalDetail(sid) {
  const el = document.getElementById('detail-' + sid);
  if (el) el.style.display = el.style.display === 'none' ? 'block' : 'none';
}

// ══════════════════════════════════════════════
// LOGS — Scannable, badged
// ══════════════════════════════════════════════

function renderLogs() {
  const c = document.getElementById('logsList');
  const all = [];
  (DATA.logs || []).forEach(l => all.push({ name: l.name, content: l.content, type: 'agent' }));
  (DATA.decisionLogs || []).forEach(l => all.push({ name: l.name, content: l.content, type: 'decision' }));
  if (!all.length) { c.innerHTML = '<div class="card"><p style="color:var(--text-faint)">No logs found</p></div>'; return; }
  all.sort((a, b) => b.name.localeCompare(a.name));
  const filtered = logFilter === 'all' ? all : all.filter(l => l.type === logFilter);

  c.innerHTML = filtered.map(l => {
    // Detect model from content
    let modelBadge = '';
    const lc = l.content.toLowerCase();
    if (lc.includes('claude')) modelBadge = '<span class="log-badge model-claude">Claude</span>';
    else if (lc.includes('openai') || lc.includes('gpt')) modelBadge = '<span class="log-badge model-openai">OpenAI</span>';
    else if (lc.includes('perplexity')) modelBadge = '<span class="log-badge model-ppx">Perplexity</span>';

    return `<div class="log-entry">
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px">
        <h4>${esc(l.name)}</h4>
        <div style="display:flex;gap:4px">
          ${modelBadge}
          <span class="log-badge ${l.type}">${l.type === 'decision' ? 'Decision' : 'Agent'}</span>
        </div>
      </div>
      <pre>${esc(l.content)}</pre>
    </div>`;
  }).join('');
}

function filterLogs(f) {
  logFilter = f;
  document.querySelectorAll('#logFilters .qa-btn').forEach(b => {
    b.classList.toggle('active-filter', b.dataset.filter === f);
  });
  if (DATA) renderLogs();
}

// ══════════════════════════════════════════════
// TOPRANKER — Flagship treatment
// ══════════════════════════════════════════════

function renderTopRanker() {
  const m = DATA.missions.find(x => x.mission === 'TopRanker');

  // Objective under hero stats
  const objEl = document.getElementById('trObjective');
  if (objEl && m) {
    objEl.innerHTML = `<strong style="color:var(--text-faint);font-size:9px;text-transform:uppercase;letter-spacing:.4px;display:block;margin-bottom:2px">Current Objective</strong>${esc(m.objective)}`;
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

// ══════════════════════════════════════════════
// ACTIONS
// ══════════════════════════════════════════════

async function submitTask(type, label) {
  const log = document.getElementById('controlLog');
  if (log) log.textContent = `Submitting: ${label}...\n`;
  pushActivity(`Submitted: ${label}`);
  try {
    const r = await fetch('/api/tasks/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, label })
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

async function launchClaude() {
  const log = document.getElementById('controlLog');
  if (log) log.textContent = 'Launching Claude...\n';
  try {
    const r = await fetch('/api/launch-claude', { method: 'POST' });
    const d = await r.json();
    if (log) log.textContent += d.ok ? d.output : 'Error: ' + d.error;
    if (d.ok) showToast('Claude session launched', 'success');
  } catch (e) { if (log) log.textContent += 'Failed: ' + e.message; }
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

// ══════════════════════════════════════════════
// HELPERS
// ══════════════════════════════════════════════

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

// ══════════════════════════════════════════════
// INIT + POLLING
// ══════════════════════════════════════════════

connectSSE();
loadData();
loadStatus();
loadTasks();

// Polling intervals
setInterval(loadStatus, 10000);  // 10s — responsive system status
setInterval(loadTasks, 3000);    // 3s — snappy task updates
setInterval(loadData, 45000);    // 45s — full data refresh
setInterval(renderHeartbeat, 5000); // 5s — update heartbeat time display

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
  if (e.key === 'Escape') {
    document.getElementById('taskModal').classList.remove('open');
  }
  // Number keys switch tabs
  const tabs = ['home', 'tasks', 'missions', 'topranker', 'approvals', 'brief', 'logs', 'controls', 'settings'];
  const n = parseInt(e.key);
  if (n >= 1 && n <= 9 && !e.metaKey && !e.ctrlKey && !e.altKey) {
    switchTab(tabs[n - 1]);
  }
});
