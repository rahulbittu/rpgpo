// GPO Visual System Map — Dashboard surfaces for architecture visibility
// Loaded after operator.js. Adds system map, mission maps, task flow, agent surface.

// ═══════════════════════════════════════════
// SYSTEM MAP — Visual architecture overview
// ═══════════════════════════════════════════

let SYSTEM_MAP_DATA = null;

async function loadSystemMap() {
  try {
    const r = await fetch('/api/system-map');
    SYSTEM_MAP_DATA = await r.json();
    renderSystemMap();
  } catch (e) { console.log('[system-map] Load error:', e.message); }
}

function renderSystemMap() {
  const el = document.getElementById('systemMapContainer');
  if (!el || !SYSTEM_MAP_DATA) return;
  const d = SYSTEM_MAP_DATA;

  // Status bar
  const healthColors = { healthy: 'var(--green)', degraded: 'var(--yellow)', error: 'var(--red)' };
  const healthColor = healthColors[d.health] || 'var(--text-dim)';

  let html = `<div class="sysmap">`;

  // Top summary
  html += `<div class="sysmap-summary">
    <span class="sysmap-health" style="color:${healthColor}">${d.health.toUpperCase()}</span>
    <span class="sysmap-stat">${d.missions_active} active</span>
    <span class="sysmap-stat">${d.providers_ready} providers</span>
    <span class="sysmap-stat">${d.capabilities_enabled} capabilities</span>
    <span class="sysmap-stat">${d.blockers} blocker${d.blockers !== 1 ? 's' : ''}</span>
    <span class="sysmap-plan">${d.plan}</span>
  </div>`;

  // Node grid — organized by layer
  const coreNodes = d.nodes.filter(n => n.type === 'core' || n.type === 'instance');
  const engineNodes = d.nodes.filter(n => n.type === 'engine');
  const missionNodes = d.nodes.filter(n => n.type === 'mission');
  const providerNodes = d.nodes.filter(n => n.type === 'provider');

  html += `<div class="sysmap-layers">`;

  // Core + Instance
  html += `<div class="sysmap-layer">
    <div class="sysmap-layer-label">Platform</div>
    <div class="sysmap-nodes">${coreNodes.map(n => mapNode(n)).join('')}</div>
  </div>`;

  // Engines
  html += `<div class="sysmap-layer">
    <div class="sysmap-layer-label">Engines</div>
    <div class="sysmap-nodes">${engineNodes.map(n => mapNode(n)).join('')}</div>
  </div>`;

  // Providers
  html += `<div class="sysmap-layer">
    <div class="sysmap-layer-label">Providers</div>
    <div class="sysmap-nodes">${providerNodes.map(n => mapNode(n)).join('')}</div>
  </div>`;

  // Missions
  html += `<div class="sysmap-layer">
    <div class="sysmap-layer-label">Missions</div>
    <div class="sysmap-nodes">${missionNodes.map(n => mapNode(n)).join('')}</div>
  </div>`;

  html += `</div></div>`;
  el.innerHTML = html;
}

function mapNode(node) {
  const statusColors = {
    active: 'var(--green)', idle: 'var(--text-dim)',
    blocked: 'var(--yellow)', disabled: 'var(--text-faint)',
  };
  const color = statusColors[node.status] || 'var(--text-dim)';
  const isClickable = node.type === 'mission';
  const onclick = isClickable ? ` onclick="loadMissionMapView('${node.id.replace('mission-','')}')"` : '';

  return `<div class="sysmap-node sysmap-${node.type} sysmap-s-${node.status}"${onclick}>
    <div class="sysmap-node-dot" style="background:${color}"></div>
    <div class="sysmap-node-label">${esc(node.label)}</div>
    ${node.detail ? `<div class="sysmap-node-detail">${esc(node.detail)}</div>` : ''}
  </div>`;
}

// ═══════════════════════════════════════════
// MISSION MAP — Per-mission detail view
// ═══════════════════════════════════════════

async function loadMissionMapView(domain) {
  try {
    const r = await fetch('/api/mission-map/' + domain);
    const data = await r.json();
    renderMissionMapModal(data, domain);
  } catch (e) { console.log('[mission-map] Load error:', e.message); }
}

function renderMissionMapModal(data, domain) {
  const title = document.getElementById('taskModalTitle');
  const body = document.getElementById('taskModalBody');
  if (!title || !body) return;

  title.textContent = `Mission: ${data.domain}`;

  let html = '';

  // Loop status
  if (data.loop) {
    const loopColor = { healthy: 'var(--green)', active: 'var(--green)', idle: 'var(--text-dim)', blocked: 'var(--yellow)', degraded: 'var(--red)' };
    html += `<div class="mm-section">
      <div class="mm-label">Loop Status</div>
      <div class="mm-value" style="color:${loopColor[data.loop.health] || 'var(--text-dim)'}">${data.loop.health.toUpperCase()} | ${data.loop.tasks_completed} completed</div>
      ${data.loop.blocker_summary ? `<div class="mm-blocker">${esc(data.loop.blocker_summary)}</div>` : ''}
    </div>`;
  }

  // Blockers
  if (data.blockers && data.blockers.length) {
    html += `<div class="mm-section">
      <div class="mm-label">Blockers (${data.blockers.length})</div>
      ${data.blockers.map(b => `<div class="mm-item mm-blocker-item">${esc(b.title)}</div>`).join('')}
    </div>`;
  }

  // Active tasks
  if (data.active_tasks && data.active_tasks.length) {
    html += `<div class="mm-section">
      <div class="mm-label">Active Tasks</div>
      ${data.active_tasks.map(t => `<div class="mm-item">${esc(t.title.slice(0, 60))} <span class="mm-status">${t.status}</span></div>`).join('')}
    </div>`;
  }

  // Recent completions
  if (data.recent_completions && data.recent_completions.length) {
    html += `<div class="mm-section">
      <div class="mm-label">Recent Completions</div>
      ${data.recent_completions.map(t => `<div class="mm-item mm-done">${esc(t.title.slice(0, 60))}</div>`).join('')}
    </div>`;
  }

  // Agents
  if (data.agents && data.agents.length) {
    html += `<div class="mm-section">
      <div class="mm-label">Available Agents</div>
      ${data.agents.map(a => `<div class="mm-item"><span class="mm-agent-name">${esc(a.name)}</span> <span class="mm-agent-role">${a.role}</span></div>`).join('')}
    </div>`;
  }

  // Context
  if (data.context) {
    const ctx = data.context;
    html += `<div class="mm-section">
      <div class="mm-label">Context</div>
      ${ctx.mission_summary ? `<div class="mm-item">${esc(ctx.mission_summary)}</div>` : ''}
      ${ctx.recent_decisions && ctx.recent_decisions.length ? `<div class="mm-sublabel">Recent Decisions</div>${ctx.recent_decisions.slice(0,3).map(d => `<div class="mm-item mm-decision">${esc(d)}</div>`).join('')}` : ''}
      ${ctx.open_questions && ctx.open_questions.length ? `<div class="mm-sublabel">Open Questions</div>${ctx.open_questions.slice(0,3).map(q => `<div class="mm-item mm-question">${esc(q)}</div>`).join('')}` : ''}
    </div>`;
  }

  // Repo
  if (data.repo) {
    html += `<div class="mm-section"><div class="mm-label">Repo</div><div class="mm-item" style="font-family:var(--mono);font-size:11px">${esc(data.repo)}</div></div>`;
  }

  body.innerHTML = html;
  document.getElementById('taskModal').classList.add('open');
}

// ═══════════════════════════════════════════
// TASK FLOW CARDS — Visual stage progression
// ═══════════════════════════════════════════

function renderTaskFlowCard(subtasks) {
  if (!subtasks || !subtasks.length) return '';

  const stageIcons = {
    audit: '&#128269;', locate_files: '&#128205;', implement: '&#128736;',
    build: '&#128736;', code: '&#128187;', report: '&#128196;',
    research: '&#128218;', review: '&#128065;', strategy: '&#9813;',
    decide: '&#9878;', approve: '&#9989;',
  };

  const stageColors = {
    done: 'var(--green)', running: 'var(--purple)', builder_running: 'var(--purple)',
    waiting_approval: 'var(--yellow)', builder_fallback: 'var(--red)',
    queued: 'var(--blue)', failed: 'var(--red)',
    proposed: 'var(--text-faint)', blocked: 'var(--text-faint)',
  };

  let html = '<div class="task-flow">';
  for (let i = 0; i < subtasks.length; i++) {
    const st = subtasks[i];
    const icon = stageIcons[st.stage] || '&#9654;';
    const color = stageColors[st.status] || 'var(--text-faint)';
    const isActive = ['running', 'builder_running', 'waiting_approval'].includes(st.status);
    const model = (st.assigned_model || '').charAt(0).toUpperCase() + (st.assigned_model || '').slice(1);
    const desc = typeof describeSubtask === 'function' ? describeSubtask(st) : st.title;

    html += `<div class="tf-step tf-${st.status} ${isActive ? 'tf-active' : ''}">
      <div class="tf-connector" style="background:${color}"></div>
      <div class="tf-icon" style="border-color:${color};${st.status === 'done' ? 'background:' + color : ''}">${icon}</div>
      <div class="tf-body">
        <div class="tf-title">${esc(st.title)}</div>
        <div class="tf-meta">
          <span class="tf-model task-model-tag ${st.assigned_model}">${model}</span>
          <span class="tf-status" style="color:${color}">${st.status.replace('_', ' ')}</span>
        </div>
        ${st.status !== 'proposed' ? `<div class="tf-desc">${esc(desc)}</div>` : ''}
        ${st.files_changed && st.files_changed.length ? `<div class="tf-files">${st.files_changed.slice(0,3).map(f => '<span class="file-badge">' + esc(f) + '</span>').join('')}</div>` : ''}
      </div>
    </div>`;

    if (i < subtasks.length - 1) {
      html += `<div class="tf-arrow" style="border-color:${color}"></div>`;
    }
  }
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════
// AGENT SURFACE — Visual agent participation view
// ═══════════════════════════════════════════

async function loadAgentSurface() {
  try {
    const [agentsResp, handoffsResp] = await Promise.all([
      fetch('/api/agents'), fetch('/api/agents/handoffs'),
    ]);
    const agentsData = await agentsResp.json();
    const handoffsData = await handoffsResp.json();
    renderAgentSurface(agentsData, handoffsData);
  } catch (e) { console.log('[agents] Load error:', e.message); }
}

function renderAgentSurface(agentsData, handoffs) {
  const el = document.getElementById('agentSurfaceContainer');
  if (!el) return;

  let html = '<div class="agent-surface">';
  html += '<div class="agent-surface-title">Agent Participation</div>';

  // Agent cards
  html += '<div class="agent-grid">';
  for (const ag of agentsData) {
    const statusColor = ag.status === 'available' ? 'var(--green)' : ag.status === 'busy' ? 'var(--yellow)' : 'var(--text-faint)';
    html += `<div class="agent-card">
      <div class="agent-card-header">
        <span class="agent-card-dot" style="background:${statusColor}"></span>
        <span class="agent-card-name">${esc(ag.name)}</span>
      </div>
      <div class="agent-card-role">${esc(ag.role)}</div>
      <div class="agent-card-caps">${ag.capabilities.slice(0,3).map(c => '<span class="agent-cap-tag">' + esc(c) + '</span>').join('')}</div>
      <div class="agent-card-status" style="color:${statusColor}">${ag.status}</div>
    </div>`;
  }
  html += '</div>';

  // Recent handoffs
  if (handoffs && handoffs.length) {
    html += '<div class="agent-handoffs-title">Recent Handoffs</div>';
    html += handoffs.slice(0, 5).map(h =>
      `<div class="agent-handoff-item">
        <span class="agent-hf-from">${esc(h.from_agent)}</span>
        <span class="agent-hf-arrow">&rarr;</span>
        <span class="agent-hf-to">${esc(h.to_agent)}</span>
        <span class="agent-hf-stage">${esc(h.stage)}</span>
      </div>`
    ).join('');
  }

  html += '</div>';
  el.innerHTML = html;
}

// ═══════════════════════════════════════════
// WIRING — Add system map tab and init
// ═══════════════════════════════════════════

// Hook into tab switching
const _origSwitchTab2 = window.switchTab;
window.switchTab = function(tab) {
  _origSwitchTab2(tab);
  if (tab === 'settings') {
    setTimeout(() => { loadSystemMap(); loadAgentSurface(); }, 100);
  }
};

// Initial load
setTimeout(() => { loadSystemMap(); }, 1000);

console.log('[system-map] GPO Visual System Map loaded');
