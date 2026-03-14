// GPO Conversation & Engine/Project Product Surface
// Makes engine→project hierarchy visible. Shows board conversations inline.
// Loaded after system-map.js.

// ═══════════════════════════════════════════
// ENGINE/PROJECT PRODUCT SURFACES
// ═══════════════════════════════════════════

let ENGINE_MAPPINGS = [];
let ENGINE_PROJECTS = {};

async function loadEngineMappings() {
  try {
    const r = await fetch('/api/engine-mappings');
    ENGINE_MAPPINGS = await r.json();
  } catch { ENGINE_MAPPINGS = []; }
}

async function loadEngineProjects(domain) {
  try {
    const r = await fetch('/api/projects/mission/' + domain);
    ENGINE_PROJECTS[domain] = await r.json();
  } catch { ENGINE_PROJECTS[domain] = []; }
}

/** Render engine selector for intake — replaces raw domain dropdown */
function renderEngineSelector() {
  const domainEl = document.getElementById('intakeDomain');
  if (!domainEl || !ENGINE_MAPPINGS.length) return;

  // Replace options with engine display names
  domainEl.innerHTML = '<option value="">Auto-detect engine</option>';
  for (const m of ENGINE_MAPPINGS) {
    domainEl.innerHTML += `<option value="${m.domain}">${esc(m.display_name)}</option>`;
  }

  // Add project selector if not already present
  if (!document.getElementById('intakeProject')) {
    const row = domainEl.closest('.intake-form-row');
    if (row) {
      const projectSelect = document.createElement('select');
      projectSelect.id = 'intakeProject';
      projectSelect.className = 'channel-select';
      projectSelect.innerHTML = '<option value="">Default project</option>';
      row.insertBefore(projectSelect, domainEl.nextSibling);

      // Update projects when engine changes
      domainEl.addEventListener('change', async () => {
        const domain = domainEl.value;
        if (!domain) { projectSelect.innerHTML = '<option value="">Default project</option>'; return; }
        await loadEngineProjects(domain);
        const projects = ENGINE_PROJECTS[domain] || [];
        projectSelect.innerHTML = '<option value="">Default project</option>';
        for (const p of projects) {
          if (p.status === 'active') {
            projectSelect.innerHTML += `<option value="${p.project_id}">${esc(p.project_name)}</option>`;
          }
        }
      });
    }
  }
}

/** Render engine/project context panel in task detail */
function renderEngineProjectContext(domain, projectId) {
  let html = '';

  // Engine display name
  const engine = ENGINE_MAPPINGS.find(m => m.domain === domain);
  const engineName = engine ? engine.display_name : domain;

  html += `<div class="ep-context">`;
  html += `<div class="ep-engine"><span class="ep-label">Engine</span> ${esc(engineName)}</div>`;

  // Project info
  const projects = ENGINE_PROJECTS[domain] || [];
  const project = projects.find(p => p.project_id === projectId);
  if (project) {
    html += `<div class="ep-project"><span class="ep-label">Project</span> ${esc(project.project_name)}</div>`;
    if (project.objective) {
      html += `<div class="ep-objective">${esc(project.objective)}</div>`;
    }
  }

  html += `</div>`;
  return html;
}

// ═══════════════════════════════════════════
// CONVERSATION SURFACE — Board discussion inside RPGPO
// ═══════════════════════════════════════════

let RECENT_CONVERSATIONS = [];

async function loadRecentConversations() {
  try {
    const r = await fetch('/api/conversations');
    RECENT_CONVERSATIONS = await r.json();
  } catch { RECENT_CONVERSATIONS = []; }
}

/** Render a board conversation inline */
function renderConversationInline(conversation) {
  if (!conversation || !conversation.turns || !conversation.turns.length) {
    return '<div class="conv-empty">No board conversation yet</div>';
  }

  let html = '<div class="conv-inline">';

  // Conversation header
  const agentCount = new Set(conversation.turns.map(t => t.agent_name)).size;
  const turnCount = conversation.turns.length;
  html += `<div class="conv-header">
    <span class="conv-title">Board Discussion</span>
    <span class="conv-meta">${agentCount} agents, ${turnCount} turns</span>
    ${conversation.status ? `<span class="conv-status conv-s-${conversation.status}">${conversation.status}</span>` : ''}
  </div>`;

  // Turns
  for (const turn of conversation.turns) {
    const phaseColors = {
      interpret: 'var(--blue)', research: 'var(--cyan)', critique: 'var(--red)',
      synthesize: 'var(--green)', review: 'var(--purple)', decide: 'var(--accent)',
    };
    const color = phaseColors[turn.phase] || 'var(--text-dim)';

    html += `<div class="conv-turn">
      <div class="conv-turn-header">
        <span class="conv-agent" style="color:${color}">${esc(turn.agent_name)}</span>
        <span class="conv-phase">${esc(turn.phase)}</span>
        ${turn.cost > 0 ? `<span class="conv-cost">$${turn.cost.toFixed(4)}</span>` : ''}
      </div>
      <div class="conv-turn-body">${esc(turn.response)}</div>
    </div>`;
  }

  // Synthesis
  if (conversation.synthesis) {
    const s = conversation.synthesis;
    html += `<div class="conv-synthesis">
      <div class="conv-synth-label">Board Decision</div>
      <div class="conv-synth-body">${esc(s.recommendation)}</div>
      <div class="conv-synth-meta">
        Risk: <span class="risk-badge risk-${s.risk_level}">${s.risk_level}</span>
        Confidence: ${s.confidence}
        ${s.unresolved.length ? ` | ${s.unresolved.length} unresolved` : ''}
      </div>
    </div>`;
  }

  // Dissents
  if (conversation.dissents && conversation.dissents.length) {
    html += `<div class="conv-dissents">`;
    for (const d of conversation.dissents) {
      html += `<div class="conv-dissent">
        <span class="conv-dissent-agent">${esc(d.agent_name)}</span> dissented: ${esc(d.dissent.slice(0, 100))}
      </div>`;
    }
    html += `</div>`;
  }

  // Claude participation
  const claudeInfo = conversation.claude_participation;
  if (claudeInfo) {
    const icon = claudeInfo.participation === 'real_cli' ? '&#10003;' : claudeInfo.participation === 'api_proxy' ? '&#8505;' : '&#10007;';
    html += `<div class="conv-claude">
      <span class="conv-claude-icon">${icon}</span>
      Claude: ${esc(claudeInfo.reason)}
    </div>`;
  }

  html += '</div>';
  return html;
}

/** Render a compact conversation card for the home/task view */
function renderConversationCard(conversation) {
  if (!conversation) return '';

  const synthesis = conversation.synthesis;
  if (!synthesis) return '';

  return `<div class="conv-card" onclick="showConversationDetail('${conversation.id}')">
    <div class="conv-card-header">
      <span class="conv-card-label">Board says:</span>
      <span class="risk-badge risk-${synthesis.risk_level}">${synthesis.risk_level}</span>
    </div>
    <div class="conv-card-body">${esc(synthesis.recommendation.slice(0, 120))}</div>
    <div class="conv-card-meta">${conversation.turns.length} turns | ${new Set(conversation.turns.map(t => t.agent_name)).size} agents</div>
  </div>`;
}

function showConversationDetail(convId) {
  const conv = RECENT_CONVERSATIONS.find(c => c.id === convId);
  if (!conv) return;

  const title = document.getElementById('taskModalTitle');
  const body = document.getElementById('taskModalBody');
  if (!title || !body) return;

  title.textContent = 'Board Conversation';
  body.innerHTML = renderConversationInline(conv);
  document.getElementById('taskModal').classList.add('open');
}

// ═══════════════════════════════════════════
// ENRICHMENT STATUS SURFACE
// ═══════════════════════════════════════════

async function renderEnrichmentStatus() {
  const el = document.getElementById('enrichmentStatusContainer');
  if (!el) return;

  try {
    const [statusResp, schedulerResp] = await Promise.all([
      fetch('/api/enrichment/status'),
      fetch('/api/scheduler/status'),
    ]);
    const status = await statusResp.json();
    const scheduler = await schedulerResp.json();

    let html = '<div class="enrich-status">';
    html += `<div class="enrich-header">
      <span class="enrich-label">Enrichment</span>
      <span class="enrich-scheduler ${scheduler.running ? 'es-active' : 'es-off'}">${scheduler.running ? (scheduler.paused ? 'Paused' : 'Active') : 'Off'}</span>
      <span class="enrich-due">${status.due} due</span>
    </div>`;

    for (const s of status.states) {
      const statusColor = { completed: 'var(--green)', failed: 'var(--red)', running: 'var(--purple)', idle: 'var(--text-faint)', skipped: 'var(--yellow)' };
      html += `<div class="enrich-job">
        <span class="enrich-job-dot" style="background:${statusColor[s.status] || 'var(--text-faint)'}"></span>
        <span class="enrich-job-name">${esc(s.job_id)}</span>
        <span class="enrich-job-status">${s.status}</span>
        <span class="enrich-job-runs">${s.run_count} runs</span>
      </div>`;
    }

    html += '</div>';
    el.innerHTML = html;
  } catch {
    el.innerHTML = '<div style="color:var(--text-faint);font-size:11px">Enrichment status unavailable</div>';
  }
}

// ═══════════════════════════════════════════
// CSS for conversation and engine surfaces
// ═══════════════════════════════════════════

const CONV_CSS = document.createElement('style');
CONV_CSS.textContent = `
.ep-context { font-size: 11px; margin-bottom: 8px; }
.ep-label { font-weight: 700; color: var(--text-faint); font-size: 9px; text-transform: uppercase; letter-spacing: .5px; margin-right: 4px; }
.ep-engine { color: var(--accent-text); font-weight: 600; }
.ep-project { color: var(--text-secondary); margin-top: 2px; }
.ep-objective { color: var(--text-dim); font-size: 10px; margin-top: 2px; }

.conv-inline { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r); padding: 12px; margin-top: 8px; }
.conv-header { display: flex; align-items: center; gap: 8px; margin-bottom: 10px; }
.conv-title { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: var(--text-faint); }
.conv-meta { font-size: 10px; color: var(--text-dim); }
.conv-status { font-size: 9px; padding: 1px 6px; border-radius: var(--r-xs); background: var(--bg-raised); border: 1px solid var(--border); }
.conv-s-synthesized { color: var(--green); border-color: var(--green-border); }
.conv-s-active { color: var(--purple); border-color: var(--purple-border); }

.conv-turn { margin-bottom: 8px; padding-bottom: 8px; border-bottom: 1px solid var(--border); }
.conv-turn:last-child { border-bottom: none; margin-bottom: 0; }
.conv-turn-header { display: flex; align-items: center; gap: 8px; margin-bottom: 3px; }
.conv-agent { font-size: 11px; font-weight: 700; }
.conv-phase { font-size: 9px; color: var(--text-faint); text-transform: uppercase; letter-spacing: .3px; }
.conv-cost { font-size: 9px; color: var(--text-faint); font-family: var(--mono); margin-left: auto; }
.conv-turn-body { font-size: 12px; color: var(--text-secondary); line-height: 1.4; }

.conv-synthesis { margin-top: 10px; padding: 10px; background: var(--green-soft); border: 1px solid var(--green-border); border-radius: var(--r); }
.conv-synth-label { font-size: 9px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--green); margin-bottom: 4px; }
.conv-synth-body { font-size: 12px; color: var(--text); line-height: 1.4; margin-bottom: 4px; }
.conv-synth-meta { font-size: 10px; color: var(--text-dim); }

.conv-dissents { margin-top: 6px; }
.conv-dissent { font-size: 10px; color: var(--yellow); padding: 2px 0; border-left: 2px solid var(--yellow); padding-left: 8px; margin-bottom: 4px; }
.conv-dissent-agent { font-weight: 600; }

.conv-claude { font-size: 10px; color: var(--text-dim); margin-top: 6px; display: flex; align-items: center; gap: 4px; }
.conv-claude-icon { font-size: 12px; }

.conv-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: var(--r); padding: 10px 12px; margin-top: 6px; cursor: pointer; transition: border-color var(--transition); }
.conv-card:hover { border-color: var(--accent); }
.conv-card-header { display: flex; align-items: center; gap: 6px; margin-bottom: 4px; }
.conv-card-label { font-size: 10px; font-weight: 700; text-transform: uppercase; color: var(--text-faint); }
.conv-card-body { font-size: 12px; color: var(--text-secondary); line-height: 1.3; }
.conv-card-meta { font-size: 9px; color: var(--text-faint); margin-top: 4px; }

.conv-empty { font-size: 11px; color: var(--text-faint); padding: 8px; }

.enrich-status { margin-top: 10px; }
.enrich-header { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
.enrich-label { font-size: 10px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; color: var(--text-faint); }
.enrich-scheduler { font-size: 9px; padding: 1px 6px; border-radius: var(--r-xs); }
.es-active { background: var(--green-soft); color: var(--green); border: 1px solid var(--green-border); }
.es-off { background: var(--bg-raised); color: var(--text-faint); border: 1px solid var(--border); }
.enrich-due { font-size: 10px; color: var(--text-dim); margin-left: auto; }
.enrich-job { display: flex; align-items: center; gap: 6px; padding: 3px 0; font-size: 11px; }
.enrich-job-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
.enrich-job-name { color: var(--text-secondary); font-family: var(--mono); font-size: 10px; min-width: 90px; }
.enrich-job-status { color: var(--text-dim); font-size: 10px; min-width: 60px; }
.enrich-job-runs { color: var(--text-faint); font-size: 9px; margin-left: auto; }
`;
document.head.appendChild(CONV_CSS);

// ═══════════════════════════════════════════
// WIRING
// ═══════════════════════════════════════════

const _origSwitchTab3 = window.switchTab;
window.switchTab = function(tab) {
  _origSwitchTab3(tab);
  if (tab === 'intake') {
    setTimeout(renderEngineSelector, 100);
  }
  if (tab === 'settings') {
    setTimeout(renderEnrichmentStatus, 200);
  }
};

// Load engine mappings on init
setTimeout(async () => {
  await loadEngineMappings();
  renderEngineSelector();
  await loadRecentConversations();
}, 800);

// Make functions available globally
window.renderConversationInline = renderConversationInline;
window.renderConversationCard = renderConversationCard;
window.showConversationDetail = showConversationDetail;
window.renderEngineProjectContext = renderEngineProjectContext;

console.log('[conversation-ui] GPO Conversation & Engine/Project Surface loaded');
