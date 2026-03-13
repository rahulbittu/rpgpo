// RPGPO Dashboard — Client

let DATA = null;

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
    document.getElementById('sysStatus').innerHTML =
      '<span style="color:#4ade80">&#9679;</span> System active';
  } catch (e) {
    document.getElementById('sysStatus').textContent = 'Error loading data';
    console.error(e);
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
  renderSettings();
}

// --- HOME ---
function renderHome() {
  const s = DATA.state;
  document.getElementById('homeDate').textContent =
    new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Priorities
  const ul = document.getElementById('homePriorities');
  ul.innerHTML = (s.top_priorities || []).map(p => `<li>${p}</li>`).join('');

  // Approvals
  const appDiv = document.getElementById('homeApprovals');
  if (DATA.approvals.length === 0) {
    appDiv.innerHTML = '<p style="color:var(--text-muted);font-size:13px;">No pending approvals.</p>';
  } else {
    appDiv.innerHTML = DATA.approvals.map(a =>
      `<div class="approval-pill" onclick="switchTab('approvals')">${a.name}</div>`
    ).join('');
  }

  // Research queue
  const rq = document.getElementById('homeResearch');
  rq.innerHTML = (s.research_queue || []).map(r => `<li>${r}</li>`).join('');

  // Missions overview
  const md = document.getElementById('homeMissions');
  md.innerHTML = DATA.missions.map(m => {
    const cls = statusClass(m.status);
    return `<div class="home-mission">
      <span>${m.mission === 'TopRanker' ? '<strong style="color:var(--accent)">' + m.mission + '</strong>' : m.mission}</span>
      <span class="mission-status ${cls}">${m.status}</span>
    </div>`;
  }).join('');

  // Recent wins
  const wins = document.getElementById('homeWins');
  wins.innerHTML = (s.recent_wins || []).map(w => `<li>${w}</li>`).join('');
}

// --- MISSIONS ---
function renderMissions() {
  const container = document.getElementById('missionCards');
  container.innerHTML = DATA.missions.map(m => {
    const isFlagship = m.mission === 'TopRanker';
    const cls = statusClass(m.status);
    return `<div class="mission-card ${isFlagship ? 'flagship-card' : ''}">
      <div style="display:flex;align-items:center;gap:8px;">
        <span class="mission-name">${m.mission}</span>
        ${isFlagship ? '<span class="badge-flagship">Flagship</span>' : ''}
      </div>
      <span class="mission-status ${cls}">${m.status}</span>

      <div class="mission-section">
        <strong>Objective</strong>
        ${m.objective}
      </div>

      <div class="mission-section">
        <strong>Recent Progress</strong>
        ${formatList(m.progress)}
      </div>

      <div class="mission-section">
        <strong>Blockers</strong>
        ${formatList(m.blockers)}
      </div>

      <div class="mission-section">
        <strong>Next Actions</strong>
        ${formatList(m.nextActions)}
      </div>

      <div class="mission-section">
        <strong>Owner</strong>
        ${m.owner}
      </div>
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
  // Show the most recent brief
  const latest = DATA.briefs[0];
  container.innerHTML = md2html(latest.content);
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
      <div class="md-content" style="margin-top:8px;">${md2html(a.content)}</div>
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

  // Agent run logs
  (DATA.logs || []).forEach(l => allLogs.push({ name: l.name, content: l.content, type: 'Agent Run' }));

  // Decision logs
  (DATA.decisionLogs || []).forEach(l => allLogs.push({ name: l.name, content: l.content, type: 'Decision' }));

  if (allLogs.length === 0) {
    container.innerHTML = '<div class="card"><p style="color:var(--text-muted)">No logs found.</p></div>';
    return;
  }

  // Sort by name (date-prefixed) descending
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
  // Status card
  const trMission = DATA.missions.find(m => m.mission === 'TopRanker');
  const statusDiv = document.getElementById('trStatus');
  if (trMission) {
    statusDiv.innerHTML = `
      <h3>Mission Status</h3>
      <span class="mission-status status-active">${trMission.status}</span>
      <div class="mission-section"><strong>Objective</strong>${trMission.objective}</div>
      <div class="mission-section"><strong>Blockers</strong>${formatList(trMission.blockers)}</div>
      <div class="mission-section"><strong>Next Actions</strong>${formatList(trMission.nextActions)}</div>
    `;
  }

  // Quick facts from synthesis
  const factsDiv = document.getElementById('trQuickFacts');
  factsDiv.innerHTML = `
    <h3>Quick Facts</h3>
    <ul style="list-style:none;padding:0;">
      <li style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)"><strong>Type:</strong> Community-ranked local business leaderboard</li>
      <li style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)"><strong>Stack:</strong> Expo/React Native + Express.js + PostgreSQL</li>
      <li style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)"><strong>Tests:</strong> 10,827 across 616 files</li>
      <li style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)"><strong>Source:</strong> 1,054 TypeScript files</li>
      <li style="padding:5px 0;border-bottom:1px solid rgba(255,255,255,0.04)"><strong>Active:</strong> 5 Texas cities + 6 beta</li>
      <li style="padding:5px 0;"><strong>Core Loop:</strong> Rate &rarr; Consequence &rarr; Ranking</li>
    </ul>
  `;

  // Full summary
  const summaryDiv = document.getElementById('trSummary');
  if (DATA.toprankerSummary) {
    summaryDiv.innerHTML = '<h3>Operating Summary</h3>' + md2html(DATA.toprankerSummary);
  }
}

// --- Controls ---
async function runAction(name) {
  const log = document.getElementById('controlLog');
  log.textContent = `Running ${name}...\n`;
  try {
    const res = await fetch('/api/run/' + name, { method: 'POST' });
    const result = await res.json();
    if (result.ok) {
      log.textContent += result.output + '\nDone.';
      // Reload data after script runs
      await loadData();
    } else {
      log.textContent += 'Error: ' + result.error;
    }
  } catch (e) {
    log.textContent += 'Failed: ' + e.message;
  }
}

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
  if (items.length === 0) return `<span style="font-size:13px">${escapeHtml(text)}</span>`;
  return '<ul style="list-style:disc;padding-left:16px;margin:4px 0;">' +
    items.map(i => `<li style="font-size:13px;padding:2px 0;border:none;">${escapeHtml(i)}</li>`).join('') +
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
    // Tables
    .replace(/^\|(.+)\|$/gm, (match) => {
      const cells = match.split('|').filter(c => c.trim()).map(c => c.trim());
      if (cells.every(c => /^[-:]+$/.test(c))) return '<!-- separator -->';
      return '<tr>' + cells.map(c => `<td>${c}</td>`).join('') + '</tr>';
    })
    .replace(/((<tr>.*<\/tr>\n?)+)/g, '<table>$1</table>')
    .replace(/<!-- separator -->\n?/g, '')
    // Headers
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

// --- SETTINGS ---
async function renderSettings() {
  try {
    const res = await fetch('/api/settings');
    const settings = await res.json();

    const keysDiv = document.getElementById('settingsKeys');
    if (keysDiv) {
      keysDiv.innerHTML = Object.entries(settings.keys).map(([key, status]) => {
        const cls = status === 'configured' ? 'key-configured' : 'key-missing';
        return `<div class="settings-row">
          <span class="settings-label">${escapeHtml(key)}</span>
          <span class="key-status ${cls}">${status}</span>
        </div>`;
      }).join('');
    }

    const sysDiv = document.getElementById('settingsSystem');
    if (sysDiv) {
      sysDiv.innerHTML = `
        <div class="settings-row"><span class="settings-label">Workspace</span> ${escapeHtml(settings.workspace)}</div>
        <div class="settings-row"><span class="settings-label">Node</span> ${escapeHtml(settings.node)}</div>
        <div class="settings-row"><span class="settings-label">Platform</span> ${escapeHtml(settings.platform)}</div>
      `;
    }
  } catch (e) {
    console.error('Failed to load settings:', e);
  }
}

// --- Approval actions ---
async function handleApproval(filename, decision, safeId) {
  const actionsDiv = document.getElementById('actions-' + safeId);
  if (!actionsDiv) return;

  // Disable buttons immediately
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
      // Reload data after a moment
      setTimeout(() => loadData(), 800);
    } else {
      actionsDiv.innerHTML = `<span style="color:var(--red);font-size:13px;">Error: ${escapeHtml(result.error)}</span>`;
    }
  } catch (e) {
    actionsDiv.innerHTML = `<span style="color:var(--red);font-size:13px;">Failed: ${escapeHtml(e.message)}</span>`;
  }
}

// --- Launch Claude session ---
async function launchClaude() {
  const log = document.getElementById('controlLog');
  log.textContent = 'Launching Claude session in Terminal...\n';
  try {
    const res = await fetch('/api/launch-claude', { method: 'POST' });
    const result = await res.json();
    if (result.ok) {
      log.textContent += result.output;
    } else {
      log.textContent += 'Error: ' + result.error;
    }
  } catch (e) {
    log.textContent += 'Failed: ' + e.message;
  }
}

// --- AI task runner ---
async function runAiTask(task) {
  const log = document.getElementById('controlLog');
  log.textContent = `Running AI task: ${task}...\n`;
  try {
    const res = await fetch('/api/ai/' + task, { method: 'POST' });
    const result = await res.json();
    if (result.ok) {
      log.textContent += result.output;
    } else {
      log.textContent += 'Error:\n' + result.error;
    }
  } catch (e) {
    log.textContent += 'Failed: ' + e.message;
  }
}

// --- Board of AI runner ---
async function runBoard() {
  const log = document.getElementById('controlLog');
  const btn = document.getElementById('boardRunBtn');

  btn.classList.add('running');
  btn.disabled = true;
  log.textContent = '=== RPGPO Board of AI ===\nStarting orchestration...\n\n';
  log.textContent += 'Roles:\n';
  log.textContent += '  [1] Claude Builder — TopRanker review prompt\n';
  log.textContent += '  [2] OpenAI Chief of Staff — executive briefing\n';
  log.textContent += '  [3] Perplexity Research Director — research scan\n\n';
  log.textContent += 'Running... (this may take 30-60 seconds if API calls are made)\n\n';

  try {
    const res = await fetch('/api/board-run', { method: 'POST' });
    const data = await res.json();

    log.textContent = '';

    if (data.output) {
      log.textContent += data.output + '\n';
    }

    // Show structured result if available
    if (data.result) {
      const r = data.result;
      log.textContent += '\n--- Board Run Summary ---\n\n';
      for (const step of r.steps) {
        const icon = step.status === 'success' ? '[OK]' : step.status === 'skipped' ? '[--]' : '[!!]';
        log.textContent += `${icon} ${step.role}: ${step.status}`;
        if (step.model) log.textContent += ` (${step.model})`;
        if (step.error) log.textContent += ` — ${step.error}`;
        log.textContent += '\n';
      }

      if (r.filesWritten.length > 0) {
        log.textContent += '\nFiles written:\n';
        for (const f of r.filesWritten) {
          log.textContent += `  ${f}\n`;
        }
      }
    }

    if (!data.ok && !data.result) {
      log.textContent += '\nError: ' + (data.error || 'Unknown error');
    }

    // Reload dashboard data
    await loadData();
  } catch (e) {
    log.textContent += '\nFailed: ' + e.message;
  } finally {
    btn.classList.remove('running');
    btn.disabled = false;
  }
}

// --- Init ---
loadData();
