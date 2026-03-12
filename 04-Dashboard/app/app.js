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
    container.innerHTML = '<div class="card"><p style="color:var(--text-muted)">No pending approvals.</p></div>';
    return;
  }
  container.innerHTML = DATA.approvals.map(a => {
    const riskMatch = a.content.match(/## Risk Level\s*\n(\w+)/);
    const risk = riskMatch ? riskMatch[1].toLowerCase() : 'yellow';
    const actionMatch = a.content.match(/## Proposed Action\s*\n(.+)/);
    const action = actionMatch ? actionMatch[1] : a.name;
    return `<div class="approval-card">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <h4>${action}</h4>
        <span class="risk-badge risk-${risk}">${risk} risk</span>
      </div>
      <div class="md-content" style="margin-top:8px;">${md2html(a.content)}</div>
    </div>`;
  }).join('');
}

// --- LOGS ---
function renderLogs() {
  const container = document.getElementById('logsList');
  if (DATA.logs.length === 0) {
    container.innerHTML = '<div class="card"><p style="color:var(--text-muted)">No agent logs found.</p></div>';
    return;
  }
  container.innerHTML = DATA.logs.map(l =>
    `<div class="log-entry">
      <h4>${l.name}</h4>
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

// --- Init ---
loadData();
