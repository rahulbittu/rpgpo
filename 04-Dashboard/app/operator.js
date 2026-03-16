// GPO Admin Product Layer
// Enhances the base app with admin-grade operator features.
// Loaded after app.js — extends existing functions, does not replace them.

// ═══════════════════════════════════════════
// MISSION TEMPLATES
// ═══════════════════════════════════════════

const MISSION_TEMPLATES = [
  // HIGH VALUE — Research & Income
  { domain: 'wealthresearch', title: 'Passive Income Ideas', desc: 'Research specific passive income opportunities', prompt: 'Research the top 10 passive income opportunities for a senior data engineer / entrepreneur in 2025-2026. Focus on: SaaS micro-products, API-as-a-service, data pipeline consulting, digital products, and automated tools. For each opportunity, provide: estimated monthly income potential, startup cost, time to first revenue, and 3 concrete first steps. Use real examples of people who have succeeded.', urgency: 'high', outcome: 'Specific, actionable passive income opportunities with real examples and concrete next steps' },
  { domain: 'wealthresearch', title: 'Side Project Ideas', desc: 'Find profitable side project opportunities', prompt: 'Research profitable side project ideas for someone with expertise in data engineering, TypeScript/Python, PostgreSQL, and mobile app development (React Native/Expo). Focus on projects that can generate $1,000-$10,000/month with less than 20 hours/week. Include real examples, market size data, and competition analysis. Prioritize ideas that leverage existing skills.', urgency: 'normal', outcome: 'Ranked list of side project ideas with revenue potential, effort estimate, and competitive landscape' },

  // HIGH VALUE — Career
  { domain: 'careeregine', title: 'Data Eng Jobs $180k+', desc: 'Find high-paying data engineering roles NOW', prompt: 'Search the web for current data engineering job openings paying $180,000+ per year. Focus on: remote-friendly roles at top companies (FAANG, unicorns, well-funded startups), Staff/Principal level positions, roles involving modern stack (Spark, Airflow, dbt, Snowflake/Databricks, Kafka). For each listing include: company name, exact role title, salary range, location/remote status, key requirements, and where to apply. Prioritize roles posted in the last 30 days.', urgency: 'high', outcome: 'Specific job listings with salary, company, requirements, and application links' },
  { domain: 'careeregine', title: 'Career Growth Plan', desc: 'Strategic career development roadmap', prompt: 'Create a 12-month career growth roadmap for a senior data engineer who is also building a startup on the side. Focus on: skills to develop for Staff/Principal level, leadership opportunities, conference talks, open source contributions, and how to balance W2 career with entrepreneurship. Include specific certifications, communities, and networking strategies.', urgency: 'normal', outcome: 'Specific 12-month roadmap with quarterly milestones, skills to develop, and actionable steps' },
  { domain: 'careeregine', title: 'Interview Prep', desc: 'Data engineering interview guide', prompt: 'Create a comprehensive data engineering interview preparation guide for Staff/Principal level roles. Include: common system design questions (with sketch answers), SQL optimization problems, data modeling scenarios, behavioral STAR examples for leadership, and questions to ask interviewers. Focus on real interview questions from companies like Google, Meta, Netflix, Databricks, and Snowflake.', urgency: 'normal', outcome: 'Interview prep guide with real questions, frameworks, and practice problems' },
  { domain: 'careeregine', title: 'Salary Benchmark', desc: 'What should I be earning?', prompt: 'Research current salary benchmarks for senior/staff/principal data engineers in 2026. Include: base salary ranges by level and location (Austin TX, remote US, SF/NYC), total compensation (RSU, bonus, equity), how startup experience and side projects affect compensation, and negotiation tactics. Use real data from levels.fyi, Glassdoor, Blind, and similar sources.', urgency: 'normal', outcome: 'Detailed salary analysis with negotiation strategies and market positioning advice' },

  // HIGH VALUE — News & Trends
  { domain: 'newsroom', title: 'AI News Today', desc: 'Current AI industry news and analysis', prompt: 'Search the web and compile today\'s most important AI and technology news. Include: major product launches, funding rounds, policy/regulation updates, research breakthroughs, and industry moves. For each item provide: headline, 2-3 sentence summary, source URL, and why it matters for a data engineer / startup founder. Focus on the last 48 hours.', urgency: 'high', outcome: 'Curated news digest with 10-15 items, sources, and relevance analysis' },
  { domain: 'newsroom', title: 'Startup News', desc: 'Startup ecosystem updates', prompt: 'Search the web for this week\'s most notable startup news. Focus on: Series A-C fundraising rounds, notable launches, Y Combinator updates, startup failures/lessons, and emerging markets. Include specific companies, amounts, and trends.', urgency: 'normal', outcome: 'Weekly startup digest with funding data, launches, and trend analysis' },
  { domain: 'newsroom', title: 'Tech Industry', desc: 'Technology industry analysis', prompt: 'Analyze the current state of the technology industry. Focus on: hiring trends, layoff updates, major company earnings/moves, emerging tech categories, and developer tool landscape. Include specific data points, company names, and market analysis. What should a data engineer / startup founder pay attention to this week?', urgency: 'normal', outcome: 'Industry analysis with specific data, trends, and actionable insights' },

  // STARTUP & BUSINESS
  { domain: 'topranker', title: 'Startup Strategy', desc: 'Competitive analysis and growth plan', prompt: 'Analyze my startup\'s competitive position in its market. Research similar products, their traction, and go-to-market strategies. Provide specific growth tactics with expected impact and timeline.', urgency: 'normal', outcome: 'Competitive analysis and growth strategy with specific tactics and timelines' },
  { domain: 'topranker', title: 'Business Model', desc: 'Validate or design a business model', prompt: 'Help me design or validate a business model for my startup. Include revenue model options, pricing strategy, customer segments, and unit economics estimates.', urgency: 'normal', outcome: 'Business model canvas with revenue projections and validation strategy' },

  // SCHEDULING & PLANNING
  { domain: 'personalops', title: 'Weekly Plan', desc: 'Plan the week ahead', prompt: 'Help me plan the upcoming week. Consider my priorities: startup development, passive income research, career growth, and personal productivity. Create a day-by-day plan with specific time blocks, key decisions to make, and tasks to delegate to GPO.', urgency: 'normal', outcome: 'Day-by-day weekly plan with time blocks, priorities, and delegation suggestions' },

  // LEARNING
  { domain: 'learning', title: 'Learn a Topic', desc: 'Personalized study plan', prompt: '', urgency: 'normal', outcome: 'Structured learning path with resources and practice exercises' },

  // HEALTH
  { domain: 'health', title: 'Fitness Plan', desc: 'Create a workout or wellness plan', prompt: 'Create a personalized workout plan based on my goals and constraints. Include exercises, progression, and rest guidance.', urgency: 'normal', outcome: 'Actionable fitness plan with specific exercises and progression' },

  // GENERAL
  { domain: 'general', title: 'Quick Research', desc: 'Research any topic', prompt: '', urgency: 'normal', outcome: 'Specific, cited research with actionable recommendations' },
];

function renderMissionTemplates() {
  const el = document.getElementById('missionTemplateGrid');
  if (!el) return;
  el.innerHTML = MISSION_TEMPLATES.map((t, i) =>
    `<div class="template-card" data-idx="${i}">
      <div class="tc-domain">${esc(t.domain)}</div>
      <div class="tc-title" onclick="applyTemplateByIndex(${i})">${esc(t.title)}</div>
      <div class="tc-desc">${esc(t.desc)}</div>
      ${t.prompt ? '<button class="tc-run-btn" onclick="event.stopPropagation();runTemplateByIndex(' + i + ')" title="Submit & run immediately">Run</button>' : ''}
    </div>`
  ).join('');
}

function runTemplateByIndex(idx) {
  const t = MISSION_TEMPLATES[idx];
  if (!t || !t.prompt) return;
  quickRunTask(t.domain, t.prompt, t.urgency);
}

function applyTemplateByIndex(idx) {
  const t = MISSION_TEMPLATES[idx];
  if (!t) return;
  applyTemplate(t.domain, t.prompt, t.urgency, t.outcome);
}

// Quick-run a task directly from a one-click suggestion (no form, instant submit)
async function quickRunTask(domain, prompt, urgency) {
  try {
    const res = await fetch('/api/intake/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ raw_request: prompt, domain, urgency }),
    });
    if (res.ok) {
      showToast('Task submitted & running', 'success');
      loadIntakeTasks();
      loadPendingApprovals();
      loadCurrentTaskFocus();
    } else {
      showToast('Failed to submit task', 'error');
    }
  } catch (e) {
    showToast('Error: ' + e.message, 'error');
  }
}

function applyTemplate(domain, prompt, urgency, outcome) {
  const domainEl = document.getElementById('intakeDomain');
  const reqEl = document.getElementById('intakeRequest');
  const urgEl = document.getElementById('intakeUrgency');
  const outEl = document.getElementById('intakeOutcome');
  if (domainEl) domainEl.value = domain;
  if (reqEl && prompt) { reqEl.value = prompt; reqEl.focus(); }
  if (urgEl) urgEl.value = urgency;
  if (outEl && outcome) outEl.value = outcome;
  // Scroll form into view
  const form = document.getElementById('intakeFormCard');
  if (form) form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ═══════════════════════════════════════════
// NEEDS OPERATOR — Priority blocker surface
// ═══════════════════════════════════════════

function renderNeedsOperator() {
  const el = document.getElementById('needsRahulHero');
  if (!el) return;

  // Collect all items needing operator action
  const items = [];

  // Pending subtask approvals
  for (const s of (window.PENDING_APPROVALS || [])) {
    const desc = typeof describeSubtask === 'function' ? describeSubtask(s) : s.title;
    const cls = s.builder_outcome === 'code_applied' ? 'nop-code-review'
      : s.status === 'builder_fallback' ? 'nop-fallback' : '';

    let actions = '';
    if (s.builder_outcome === 'code_applied') {
      actions = `<button class="nop-btn nop-btn-primary" onclick="event.stopPropagation();approveSubtaskGlobal('${s.subtask_id}',this)">Approve Changes</button>
        <button class="nop-btn nop-btn-secondary" onclick="event.stopPropagation();rejectSubtask('${s.subtask_id}')">Reject</button>
        <button class="nop-btn nop-btn-secondary" onclick="event.stopPropagation();reviseSubtask('${s.subtask_id}')">Revise</button>`;
    } else if (s.status === 'builder_fallback') {
      actions = `<button class="nop-btn nop-btn-primary" onclick="event.stopPropagation();launchClaude('${s.subtask_id}')">Re-run Builder</button>
        <button class="nop-btn nop-btn-secondary" onclick="event.stopPropagation();approveSubtaskGlobal('${s.subtask_id}',this)">Manual Done</button>`;
    } else {
      actions = `<button class="nop-btn nop-btn-primary" onclick="event.stopPropagation();approveSubtaskGlobal('${s.subtask_id}',this)">Approve</button>`;
    }

    let filesHtml = '';
    if (s.files_changed && s.files_changed.length) {
      filesHtml = `<div class="nop-files">${s.files_changed.slice(0, 5).map(f => '<span class="file-badge">' + esc(f) + '</span>').join('')}${s.files_changed.length > 5 ? '<span class="file-badge">+' + (s.files_changed.length - 5) + '</span>' : ''}</div>`;
    }

    let diffHtml = '';
    if (s.diff_summary) {
      diffHtml = `<div class="nop-diff">${esc(s.diff_summary.slice(0, 200))}</div>`;
    }

    items.push(`<div class="nop-item ${cls}">
      <div class="nop-why">${esc(desc)}</div>
      <div class="nop-context">
        <span class="nop-mission">${esc(s.parent_title || s.domain || '')}</span>
        <span class="nop-model task-model-tag ${s.assigned_model}">${esc(s.assigned_model)}</span>
        <span>${esc(s.stage)}</span>
      </div>
      ${filesHtml}${diffHtml}
      <div class="nop-actions">${actions}</div>
    </div>`);
  }

  // Plan approvals from intake tasks
  for (const t of (window.INTAKE_TASKS || [])) {
    if (t.status === 'planned') {
      items.push(`<div class="nop-item nop-plan">
        <div class="nop-why">Plan ready for "${esc(t.title.slice(0, 60))}" — review and approve to start execution</div>
        <div class="nop-context"><span class="nop-mission">${esc(t.domain)}</span></div>
        <div class="nop-actions">
          <button class="nop-btn nop-btn-primary" onclick="approvePlan('${t.task_id}')">Approve & Execute Plan</button>
          <button class="nop-btn nop-btn-secondary" onclick="switchTab('intake');showIntakeDetail('${t.task_id}')">Review Details</button>
        </div>
      </div>`);
    }
    if (t.status === 'intake') {
      items.push(`<div class="nop-item">
        <div class="nop-why">New task "${esc(t.title.slice(0, 60))}" needs Board deliberation</div>
        <div class="nop-context"><span class="nop-mission">${esc(t.domain)}</span></div>
        <div class="nop-actions">
          <button class="nop-btn nop-btn-primary" onclick="deliberateTask('${t.task_id}')">Send to Board</button>
        </div>
      </div>`);
    }
  }

  if (!items.length) { el.innerHTML = ''; return; }

  el.innerHTML = `<div class="needs-operator">
    <div class="needs-operator-header">
      <span class="needs-operator-count">${items.length}</span>
      <span class="needs-operator-label">Needs Your Action</span>
    </div>
    <div class="needs-operator-list">${items.join('')}</div>
  </div>`;
}

// ═══════════════════════════════════════════
// BOARD DISCUSSION — Structured view of deliberation
// ═══════════════════════════════════════════

function renderBoardDiscussion(deliberation) {
  if (!deliberation) return '';

  const objective = deliberation.interpreted_objective || '';
  const strategy = deliberation.recommended_strategy || '';
  const unknowns = (deliberation.key_unknowns || []).slice(0, 3);
  const approvalPts = (deliberation.approval_points || []).slice(0, 3);
  const risk = deliberation.risk_level || 'green';
  const outcome = deliberation.expected_outcome || '';

  // Simulate board voices from the synthesized deliberation
  let chiefText = `Objective: ${objective}`;
  if (outcome) chiefText += `. Expected outcome: ${outcome}`;

  let criticText = '';
  if (unknowns.length) criticText = `Key unknowns: ${unknowns.join('; ')}`;
  if (approvalPts.length) criticText += (criticText ? '. ' : '') + `Approval points: ${approvalPts.join('; ')}`;
  if (!criticText) criticText = 'No significant risks identified.';

  const specialistText = strategy;

  return `<div class="board-discussion">
    <div class="board-discussion-title">Board Discussion</div>
    <div class="board-voice">
      <div class="board-voice-label bv-chief">Chief of Staff</div>
      <div class="board-voice-text">${esc(chiefText)}</div>
    </div>
    <div class="board-voice">
      <div class="board-voice-label bv-critic">Critic</div>
      <div class="board-voice-text">${esc(criticText)}</div>
    </div>
    <div class="board-voice">
      <div class="board-voice-label bv-specialist">Domain Specialist</div>
      <div class="board-voice-text">${esc(specialistText)}</div>
    </div>
    <div class="board-voice">
      <div class="board-voice-label bv-decision">Decision</div>
      <div class="board-voice-text">Risk: <span class="risk-badge risk-${risk}">${risk}</span> | ${deliberation.subtasks ? deliberation.subtasks.length + ' subtasks planned' : 'Plan pending'}</div>
    </div>
  </div>`;
}

// ═══════════════════════════════════════════
// ENHANCED MISSION SNAPSHOT
// ═══════════════════════════════════════════

function renderEnhancedMissionSnapshot() {
  const grid = document.getElementById('missionSnapshotGrid');
  if (!grid || !window.DATA) return;

  const missions = window.DATA.missions || [];
  if (!missions.length) { grid.innerHTML = '<div style="color:var(--text-faint);font-size:11px;padding:4px">No missions</div>'; return; }

  grid.innerHTML = missions.map(m => {
    const displayName = typeof domainLabel === 'function' ? domainLabel(m.mission.toLowerCase().replace(/\s+/g, '').replace('engine','egine')) : m.mission;
    const blocker = m.blockers && m.blockers.trim() && !m.blockers.toLowerCase().includes('none') ? m.blockers.split('\n')[0].replace(/^-\s*/, '').slice(0, 60) : '';
    const next = m.nextActions ? m.nextActions.split('\n').find(l => l.startsWith('- ') || /^\d+\./.test(l)) : '';
    const nextText = next ? next.replace(/^[-\d.]+\s*/, '').slice(0, 50) : '';
    const progress = m.progress ? m.progress.split('\n').find(l => l.startsWith('- ')) : '';
    const progressText = progress ? progress.replace(/^-\s*/, '').slice(0, 50) : '';

    return `<div class="mission-card-enhanced" onclick="switchTab('missions')">
      <div class="mce-header">
        <span class="mce-name">${esc(displayName)}</span>
        <span class="mission-badge ${badgeClass(m.status)}">${esc(m.status)}</span>
      </div>
      ${m.objective ? `<div class="mce-objective">${esc(m.objective.slice(0, 80))}</div>` : ''}
      <div class="mce-meta">
        ${blocker ? `<span class="mce-blocker">Blocker: ${esc(blocker)}</span>` : ''}
        ${progressText ? `<span class="mce-progress">${esc(progressText)}</span>` : ''}
        ${nextText ? `<span class="mce-next">Next: ${esc(nextText)}</span>` : ''}
      </div>
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════
// CHIEF OF STAFF BRIEF — Next best actions surface
// ═══════════════════════════════════════════

async function loadChiefOfStaffBrief() {
  try {
    const res = await fetch('/api/chief-of-staff/brief');
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function renderChiefOfStaffBrief(brief) {
  const el = document.getElementById('chiefOfStaffPanel');
  if (!el) return;
  if (!brief) { el.innerHTML = ''; return; }

  const priorityIcon = { critical: '!!', high: '!', medium: '-', low: '.' };
  const priorityClass = { critical: 'cos-critical', high: 'cos-high', medium: 'cos-medium', low: 'cos-low' };

  const actionsHtml = (brief.top_priorities || []).map(a => {
    // Generate one-click action button based on context
    let actionBtn = '';
    if (a.needs_approval && a.title.includes('Review and approve plan')) {
      const taskId = a.title.match(/plan for "([^"]+)"/)?.[1] || '';
      actionBtn = `<button class="cos-action-btn" onclick="event.stopPropagation();switchTab('intake')">Review Plan</button>`;
    } else if (a.needs_approval && (a.title.includes('Review code') || a.title.includes('Approve "'))) {
      actionBtn = `<button class="cos-action-btn" onclick="event.stopPropagation();switchTab('approvals')">Review</button>`;
    } else if (a.title.includes('Send') && a.title.includes('Board')) {
      actionBtn = `<button class="cos-action-btn" onclick="event.stopPropagation();switchTab('intake')">Go to Intake</button>`;
    } else if (a.suggested_capability === 'research') {
      actionBtn = `<button class="cos-action-btn" onclick="event.stopPropagation();applyTemplate('${esc(a.domain || 'general')}','${esc(a.title.replace(/'/g, "\\'").slice(0, 100))}','normal','');switchTab('intake')">Submit Task</button>`;
    }
    return `<div class="cos-action ${priorityClass[a.priority] || ''}">
      <div class="cos-action-header">
        <span class="cos-priority">${priorityIcon[a.priority] || '-'}</span>
        <span class="cos-action-title">${esc(a.title)}</span>
        ${a.needs_approval ? '<span class="cos-badge cos-approval">approval</span>' : ''}
        ${a.blocked ? '<span class="cos-badge cos-blocked">blocked</span>' : ''}
        ${actionBtn}
      </div>
      <div class="cos-action-why">${esc(a.why)}</div>
      <div class="cos-action-meta">
        <span class="cos-scope">${esc(typeof domainLabel === 'function' ? domainLabel(a.domain || a.scope_id) : (a.domain || a.scope_id))}</span>
        <span class="cos-alignment">${esc(a.mission_alignment)}</span>
        ${a.suggested_capability ? '<span class="cos-cap">' + esc(a.suggested_capability) + '</span>' : ''}
      </div>
    </div>`;
  }).join('');

  const healthHtml = (brief.mission_health || []).map(h => {
    const alignClass = { on_track: 'mh-on-track', drifting: 'mh-drifting', stalled: 'mh-stalled', no_statement: 'mh-none' };
    return `<div class="cos-health-item ${alignClass[h.alignment] || ''}">
      <span class="cos-health-label">${esc(h.label)}</span>
      <span class="cos-health-status">${esc(h.alignment.replace('_', ' '))}</span>
      ${h.statement_snippet ? '<span class="cos-health-stmt">' + esc(h.statement_snippet) + '</span>' : ''}
    </div>`;
  }).join('');

  const enginesHtml = (brief.by_engine || []).filter(e => e.actions.length > 0).map(e => {
    const healthClass = { healthy: 'eng-healthy', needs_attention: 'eng-attention', blocked: 'eng-blocked', idle: 'eng-idle' };
    return `<div class="cos-engine">
      <div class="cos-engine-header">
        <span class="cos-engine-name">${esc(typeof domainLabel === 'function' ? domainLabel(e.domain || e.engine_name) : e.engine_name)}</span>
        <span class="cos-engine-health ${healthClass[e.health] || ''}">${esc(e.health.replace('_', ' '))}</span>
      </div>
      ${e.mission_statement ? '<div class="cos-engine-mission">' + esc(e.mission_statement.slice(0, 80)) + '</div>' : ''}
      <div class="cos-engine-actions">${e.actions.map(a =>
        '<div class="cos-engine-action">' + esc(a.title) + '</div>'
      ).join('')}</div>
    </div>`;
  }).join('');

  // Proactive suggestions when queue is clear
  let proactiveSuggestionsHtml = '';
  if (!actionsHtml) {
    const proactiveSuggestions = [
      { label: 'AI News', desc: 'Get today\'s AI headlines', domain: 'newsroom', prompt: 'Search the web for today\'s most important AI news. Include headlines, sources, and relevance.', urgency: 'high' },
      { label: 'Job Market', desc: 'Data eng jobs $180k+ remote', domain: 'careeregine', prompt: 'Find the highest-paying remote data engineering jobs right now. Include salary, company, requirements, and application links.', urgency: 'normal' },
      { label: 'Income Ideas', desc: 'Passive income for engineers', domain: 'wealthresearch', prompt: 'Research the top passive income opportunities for a senior data engineer in 2026. Include revenue estimates and concrete first steps.', urgency: 'normal' },
      { label: 'Startup Strategy', desc: 'Competitive analysis & GTM', domain: 'topranker', prompt: 'Analyze my startup competitive position. Include competitor data and growth tactics.', urgency: 'normal' },
      { label: 'Weekly Plan', desc: 'Plan your week ahead', domain: 'personalops', prompt: 'Help me plan the upcoming week balancing startup development, career growth, and passive income research. Create a day-by-day plan.', urgency: 'normal' },
    ];
    proactiveSuggestionsHtml = `<div class="cos-section">
      <div class="cos-section-title">Suggested Tasks</div>
      <div class="cos-suggestions-grid">${proactiveSuggestions.map(s =>
        `<button class="cos-suggestion-btn" onclick="quickRunTask('${s.domain}','${s.prompt.replace(/'/g, "\\'")}','${s.urgency}')">
          <span class="cos-sug-label">${esc(s.label)}</span>
          <span class="cos-sug-desc">${esc(s.desc)}</span>
        </button>`
      ).join('')}</div>
    </div>`;
  }

  el.innerHTML = `<div class="chief-of-staff">
    <div class="cos-header">
      <div class="cos-title">Chief of Staff</div>
      <div class="cos-focus">${esc(brief.focus_recommendation || '')}</div>
    </div>
    ${actionsHtml ? '<div class="cos-section"><div class="cos-section-title">Next Best Actions</div>' + actionsHtml + '</div>' : ''}
    ${proactiveSuggestionsHtml}
    ${enginesHtml ? '<div class="cos-section"><div class="cos-section-title">By Engine</div>' + enginesHtml + '</div>' : ''}
    ${healthHtml ? '<div class="cos-section"><div class="cos-section-title">Mission Health</div><div class="cos-health-grid">' + healthHtml + '</div></div>' : ''}
    ${brief.blockers_summary && brief.blockers_summary.length ? '<div class="cos-section"><div class="cos-section-title">Blockers</div>' + brief.blockers_summary.map(b => '<div class="cos-blocker">' + esc(b) + '</div>').join('') + '</div>' : ''}
  </div>`;
}

async function refreshChiefOfStaff() {
  const brief = await loadChiefOfStaffBrief();
  if (brief) renderChiefOfStaffBrief(brief);
}

// ═══════════════════════════════════════════
// MISSION STATEMENTS — View and edit
// ═══════════════════════════════════════════

async function loadMissionStatements() {
  try {
    const res = await fetch('/api/mission-statements');
    if (!res.ok) return [];
    const data = await res.json();
    return data.statements || [];
  } catch { return []; }
}

async function saveMissionStatement(level, scopeId, statement, objectives, values, criteria) {
  try {
    const res = await fetch('/api/mission-statements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ level, scope_id: scopeId, statement, objectives, values, success_criteria: criteria }),
    });
    return res.ok;
  } catch { return false; }
}

function renderMissionStatements(statements) {
  const el = document.getElementById('missionStatementsPanel');
  if (!el) return;

  const levels = ['operator', 'engine', 'project'];
  const engineDomains = [
    { id: 'startup', name: 'Code & Product Engineering' },
    { id: 'writing', name: 'Writing & Documentation' },
    { id: 'research', name: 'Research & Analysis' },
    { id: 'learning', name: 'Learning & Tutoring' },
    { id: 'personalops', name: 'Scheduling & Life Operations' },
    { id: 'health', name: 'Health & Wellness Coach' },
    { id: 'shopping', name: 'Shopping & Buying Advisor' },
    { id: 'travel', name: 'Travel & Relocation Planner' },
    { id: 'careeregine', name: 'Career & Job Search' },
    { id: 'wealthresearch', name: 'Personal Finance & Investing' },
    { id: 'topranker', name: 'Startup & Business Builder' },
    { id: 'screenwriting', name: 'Screenwriting & Story Development' },
    { id: 'music', name: 'Music & Audio Creation' },
    { id: 'newsroom', name: 'News & Intelligence' },
    { id: 'general', name: 'General' },
  ];

  let html = '<div class="ms-container">';
  html += '<div class="ms-header"><span class="ms-title">Mission Statements</span></div>';

  // Operator level
  const opStmt = statements.find(s => s.level === 'operator');
  html += `<div class="ms-level">
    <div class="ms-level-title">Operator Mission</div>
    <div class="ms-card" id="msCardOperator">
      ${opStmt
        ? `<div class="ms-statement">${esc(opStmt.statement)}</div>
           ${opStmt.objectives.length ? '<div class="ms-objectives">' + opStmt.objectives.map(o => '<span class="ms-obj">' + esc(o) + '</span>').join('') + '</div>' : ''}`
        : '<div class="ms-empty">No operator mission set</div>'}
      <button class="nop-btn nop-btn-secondary ms-edit-btn" onclick="editMissionStatement('operator','operator')">
        ${opStmt ? 'Edit' : 'Set Mission'}
      </button>
    </div>
  </div>`;

  // Engine level
  html += '<div class="ms-level"><div class="ms-level-title">Engine Missions (15 Engines)</div><div class="ms-grid">';
  for (const eng of engineDomains) {
    const stmt = statements.find(s => s.level === 'engine' && s.scope_id === eng.id);
    html += `<div class="ms-card ms-card-sm" id="msCard_${eng.id}">
      <div class="ms-domain">${esc(eng.name)}</div>
      ${stmt
        ? `<div class="ms-statement-sm">${esc(stmt.statement.slice(0, 80))}</div>`
        : '<div class="ms-empty-sm">No mission set</div>'}
      <button class="nop-btn nop-btn-secondary ms-edit-btn-sm" onclick="editMissionStatement('engine','${eng.id}')">
        ${stmt ? 'Edit' : 'Set'}
      </button>
    </div>`;
  }
  html += '</div></div>';

  html += '</div>';
  el.innerHTML = html;
}

function editMissionStatement(level, scopeId) {
  const modal = document.getElementById('msEditModal');
  if (!modal) return;

  modal.style.display = 'flex';
  modal.innerHTML = `<div class="ms-modal-inner">
    <div class="ms-modal-title">${level === 'operator' ? 'Operator' : (typeof domainLabel === 'function' ? domainLabel(scopeId) : esc(scopeId))} Mission Statement</div>
    <textarea id="msEditStatement" class="ms-textarea" placeholder="What is the core purpose and direction?" rows="3"></textarea>
    <input id="msEditObjectives" class="ms-input" placeholder="Key objectives (comma-separated)" />
    <input id="msEditValues" class="ms-input" placeholder="Core values (comma-separated)" />
    <input id="msEditCriteria" class="ms-input" placeholder="Success criteria (comma-separated)" />
    <div class="ms-modal-actions">
      <button class="nop-btn nop-btn-primary" onclick="submitMissionStatement('${level}','${scopeId}')">Save</button>
      <button class="nop-btn nop-btn-secondary" onclick="closeMsModal()">Cancel</button>
    </div>
  </div>`;
}

window.editMissionStatement = editMissionStatement;

async function submitMissionStatement(level, scopeId) {
  const stmt = document.getElementById('msEditStatement')?.value?.trim();
  if (!stmt) return;
  const objectives = (document.getElementById('msEditObjectives')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
  const values = (document.getElementById('msEditValues')?.value || '').split(',').map(s => s.trim()).filter(Boolean);
  const criteria = (document.getElementById('msEditCriteria')?.value || '').split(',').map(s => s.trim()).filter(Boolean);

  const ok = await saveMissionStatement(level, scopeId, stmt, objectives, values, criteria);
  if (ok) {
    closeMsModal();
    const stmts = await loadMissionStatements();
    renderMissionStatements(stmts);
    refreshChiefOfStaff(); // refresh COS since missions changed
  }
}

window.submitMissionStatement = submitMissionStatement;

function closeMsModal() {
  const modal = document.getElementById('msEditModal');
  if (modal) modal.style.display = 'none';
}
window.closeMsModal = closeMsModal;

// ═══════════════════════════════════════════
// MEMORY VIEWER — Document & context inspector
// ═══════════════════════════════════════════

async function loadMemoryViewer() {
  try {
    const res = await fetch('/api/memory-viewer');
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function renderMemoryViewer(data) {
  const el = document.getElementById('memoryViewerPanel');
  if (!el || !data) return;

  const categories = [
    { key: 'operator', label: 'Operator Profile', icon: 'O', docs: data.operator || [] },
    { key: 'mission_statements', label: 'Mission Statements', icon: 'M', docs: data.mission_statements || [] },
    { key: 'decisions', label: 'Decisions', icon: 'D', docs: (data.decisions || []).slice(0, 20) },
    { key: 'projects', label: 'Projects', icon: 'P', docs: data.projects || [] },
    { key: 'artifacts', label: 'Artifacts', icon: 'A', docs: (data.artifacts || []).slice(0, 20) },
    { key: 'reports', label: 'Reports', icon: 'R', docs: (data.reports || []).slice(0, 15) },
  ];

  // Add engine docs with canonical names
  for (const [domain, docs] of Object.entries(data.engines || {})) {
    if (docs.length > 0) {
      const label = typeof domainLabel === 'function' ? domainLabel(domain) : domain;
      categories.push({ key: 'engine_' + domain, label: label, icon: 'E', docs });
    }
  }

  let html = `<div class="mv-container">
    <div class="mv-header">
      <span class="mv-title">Memory & Documents</span>
      <span class="mv-count">${data.total_count || 0} items</span>
      <input type="text" class="mv-search" placeholder="Search..." oninput="filterMemoryDocs(this.value)" />
    </div>
    <div class="mv-categories">`;

  for (const cat of categories) {
    if (!cat.docs.length) continue;
    html += `<div class="mv-category" data-category="${cat.key}">
      <div class="mv-cat-header" onclick="toggleMvCategory('${cat.key}')">
        <span class="mv-cat-icon">${cat.icon}</span>
        <span class="mv-cat-label">${esc(cat.label)}</span>
        <span class="mv-cat-count">${cat.docs.length}</span>
      </div>
      <div class="mv-cat-docs mv-collapsed" id="mvCat_${cat.key}">`;

    for (const doc of cat.docs) {
      html += `<div class="mv-doc" data-search="${esc((doc.title + ' ' + doc.summary).toLowerCase())}">
        <div class="mv-doc-title">${esc(doc.title)}</div>
        <div class="mv-doc-summary">${esc(doc.summary.slice(0, 120))}</div>
        ${doc.domain ? '<span class="mv-doc-domain">' + esc(doc.domain) + '</span>' : ''}
        <div class="mv-doc-content mv-hidden" id="mvDoc_${doc.id}">${esc(doc.content)}</div>
        <button class="mv-expand-btn" onclick="toggleMvDoc('${doc.id}')">expand</button>
      </div>`;
    }

    html += '</div></div>';
  }

  html += '</div></div>';
  el.innerHTML = html;
}

function toggleMvCategory(key) {
  const el = document.getElementById('mvCat_' + key);
  if (el) el.classList.toggle('mv-collapsed');
}
window.toggleMvCategory = toggleMvCategory;

function toggleMvDoc(id) {
  const el = document.getElementById('mvDoc_' + id);
  if (el) el.classList.toggle('mv-hidden');
}
window.toggleMvDoc = toggleMvDoc;

function filterMemoryDocs(query) {
  const lq = (query || '').toLowerCase();
  document.querySelectorAll('.mv-doc').forEach(el => {
    const searchText = el.getAttribute('data-search') || '';
    el.style.display = !lq || searchText.includes(lq) ? '' : 'none';
  });
}
window.filterMemoryDocs = filterMemoryDocs;

// ═══════════════════════════════════════════
// EXECUTION GRAPH — Visual graph panel on task detail
// ═══════════════════════════════════════════

async function loadExecutionGraph(taskId) {
  try {
    const res = await fetch('/api/execution-graphs/task/' + taskId);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function loadGraphDetail(graphId) {
  try {
    const res = await fetch('/api/execution-graphs/' + graphId);
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

async function createExecutionGraph(taskId) {
  try {
    const res = await fetch('/api/execution-graphs/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ task_id: taskId }),
    });
    return res.ok ? await res.json() : null;
  } catch { return null; }
}

function renderExecutionGraph(data) {
  const el = document.getElementById('executionGraphPanel');
  if (!el) return;
  if (!data || !data.graph) {
    el.innerHTML = '';
    return;
  }

  const g = data.graph;
  const nodes = data.nodes || [];
  const gates = data.gates || [];
  const reviews = data.reviews || [];
  const dossier = data.dossier;

  const statusClass = { draft: 'eg-draft', ready: 'eg-ready', executing: 'eg-executing', paused: 'eg-paused', completed: 'eg-completed', failed: 'eg-failed', canceled: 'eg-canceled' };
  const nodeStatusIcon = { pending: '○', ready: '◎', running: '●', waiting_gate: '◈', completed: '✓', failed: '✗', skipped: '–', canceled: '∅' };

  // Nodes
  const nodesHtml = nodes.map(n =>
    `<div class="eg-node eg-node-${n.status}">
      <span class="eg-node-icon">${nodeStatusIcon[n.status] || '?'}</span>
      <div class="eg-node-info">
        <div class="eg-node-title">${esc(n.title)}</div>
        <div class="eg-node-meta">
          <span class="eg-stage">${esc(n.stage)}</span>
          <span class="eg-agent">${esc(n.assigned_agent)}</span>
          <span class="risk-badge risk-${n.risk_level}">${n.risk_level}</span>
        </div>
        ${n.output_summary ? '<div class="eg-node-output">' + esc(n.output_summary) + '</div>' : ''}
        ${n.error ? '<div class="eg-node-error">' + esc(n.error) + '</div>' : ''}
      </div>
    </div>`
  ).join('');

  // Gates
  const gatesHtml = gates.length ? gates.map(gate => {
    const gateStatusClass = { pending: 'gate-pending', approved: 'gate-approved', rejected: 'gate-rejected', waived: 'gate-waived' };
    return `<div class="eg-gate ${gateStatusClass[gate.status] || ''}">
      <span class="eg-gate-type">${esc(gate.gate_type)}</span>
      <span class="eg-gate-title">${esc(gate.title)}</span>
      <span class="eg-gate-status">${gate.status}</span>
      ${gate.blocking ? '<span class="eg-gate-blocking">blocking</span>' : ''}
      ${gate.status === 'pending' ? `
        <div class="eg-gate-actions">
          <button class="nop-btn nop-btn-primary" onclick="approveGate('${gate.gate_id}')">Approve</button>
          <button class="nop-btn nop-btn-secondary" onclick="rejectGate('${gate.gate_id}')">Reject</button>
          <button class="nop-btn nop-btn-secondary" onclick="waiveGate('${gate.gate_id}')">Waive</button>
        </div>` : ''}
    </div>`;
  }).join('') : '';

  // Reviews
  const reviewsHtml = reviews.length ? reviews.map(r => {
    const verdictClass = { pass: 'rv-pass', fail: 'rv-fail', waive: 'rv-waive' };
    const passed = r.checklist ? r.checklist.filter(i => i.checked).length : 0;
    const total = r.checklist ? r.checklist.length : 0;
    return `<div class="eg-review ${r.verdict ? verdictClass[r.verdict] || '' : 'rv-pending'}">
      <span class="eg-review-type">${esc(r.review_type.replace(/_/g, ' '))}</span>
      <span class="eg-review-progress">${passed}/${total}</span>
      <span class="eg-review-verdict">${r.verdict || 'pending'}</span>
    </div>`;
  }).join('') : '';

  // Dossier
  let dossierHtml = '';
  if (dossier) {
    const recClass = { promote: 'dos-promote', hold: 'dos-hold', rework: 'dos-rework' };
    dossierHtml = `<div class="eg-dossier ${recClass[dossier.recommendation] || ''}">
      <div class="eg-dossier-header">
        <span class="eg-dossier-title">Promotion Dossier</span>
        <span class="eg-dossier-score">Confidence: ${dossier.confidence_score}%</span>
        <span class="eg-dossier-rec">${dossier.recommendation}</span>
      </div>
      ${dossier.risks.length ? '<div class="eg-dossier-risks">Risks: ' + dossier.risks.map(r => esc(r)).join('; ') + '</div>' : ''}
      ${dossier.recommendation !== 'rework' && !dossier.promoted_at ? '<button class="nop-btn nop-btn-primary" onclick="promoteDossier(\'' + dossier.dossier_id + '\')">Promote</button>' : ''}
      ${dossier.promoted_at ? '<span class="eg-promoted">Promoted</span>' : ''}
    </div>`;
  }

  el.innerHTML = `<div class="execution-graph ${statusClass[g.status] || ''}">
    <div class="eg-header">
      <div class="eg-title-row">
        <span class="eg-label">Execution Graph</span>
        <span class="eg-status">${g.status}</span>
        <span class="eg-lane">lane: ${g.lane}</span>
        <span class="eg-mode">${g.execution_mode}</span>
      </div>
      <div class="eg-plan">${esc(g.chief_of_staff_plan.split('\n')[0])}</div>
    </div>
    ${nodesHtml ? '<div class="eg-section"><div class="eg-section-title">Nodes</div>' + nodesHtml + '</div>' : ''}
    ${gatesHtml ? '<div class="eg-section"><div class="eg-section-title">Approval Gates</div>' + gatesHtml + '</div>' : ''}
    ${reviewsHtml ? '<div class="eg-section"><div class="eg-section-title">Reviews</div>' + reviewsHtml + '</div>' : ''}
    ${dossierHtml}
    <div id="rpSummarySlot"></div>
    <div id="simSlot"></div>
    ${g.status === 'completed' && !dossier ? '<button class="nop-btn nop-btn-primary eg-gen-dossier" onclick="generateDossier(\'' + g.graph_id + '\')">Generate Dossier</button>' : ''}
    ${g.status === 'completed' ? '<button class="nop-btn nop-btn-secondary" style="margin-top:6px" onclick="triggerReversePrompting(\'' + g.graph_id + '\')">Run Reverse Prompting</button>' : ''}
    <button class="nop-btn nop-btn-secondary" style="margin-top:6px" onclick="showSimulationForGraph('${g.graph_id}','${g.lane}')">Simulate Governance</button>
  </div>`;

  // Load reverse prompting runs async
  loadReversePromptingRuns(g.graph_id).then(runs => {
    const slot = document.getElementById('rpSummarySlot');
    if (slot && runs.length) slot.innerHTML = renderReversePromptingSummary(runs);
  });
}

// Gate actions
async function approveGate(gateId) {
  const res = await fetch('/api/approval-gates/' + gateId + '/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (res.ok) refreshCurrentGraphPanel();
}
window.approveGate = approveGate;

async function rejectGate(gateId) {
  const res = await fetch('/api/approval-gates/' + gateId + '/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (res.ok) refreshCurrentGraphPanel();
}
window.rejectGate = rejectGate;

async function waiveGate(gateId) {
  const res = await fetch('/api/approval-gates/' + gateId + '/waive', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (res.ok) refreshCurrentGraphPanel();
}
window.waiveGate = waiveGate;

async function generateDossier(graphId) {
  const res = await fetch('/api/promotion-dossiers/generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ graph_id: graphId }) });
  if (res.ok) refreshCurrentGraphPanel();
}
window.generateDossier = generateDossier;

async function promoteDossier(dossierId) {
  const res = await fetch('/api/promotion-dossiers/' + dossierId + '/promote', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (res.ok) refreshCurrentGraphPanel();
}
window.promoteDossier = promoteDossier;

// Track current graph context for refreshes
let _currentGraphTaskId = null;

async function refreshCurrentGraphPanel() {
  if (!_currentGraphTaskId) return;
  const data = await loadExecutionGraph(_currentGraphTaskId);
  renderExecutionGraph(data);
}

async function showGraphForTask(taskId) {
  _currentGraphTaskId = taskId;
  const data = await loadExecutionGraph(taskId);
  if (data && data.graph) {
    // Load full detail with gates/reviews/dossier
    const detail = await loadGraphDetail(data.graph.graph_id);
    renderExecutionGraph(detail);
  } else {
    // No graph yet — offer to create one
    const el = document.getElementById('executionGraphPanel');
    if (el) {
      el.innerHTML = `<div class="eg-empty">
        <div class="eg-empty-text">No execution graph yet</div>
        <button class="nop-btn nop-btn-primary" onclick="createGraphForTask('${taskId}')">Create Execution Graph</button>
      </div>`;
    }
  }
}
window.showGraphForTask = showGraphForTask;

async function createGraphForTask(taskId) {
  const result = await createExecutionGraph(taskId);
  if (result && result.graph) {
    _currentGraphTaskId = taskId;
    const detail = await loadGraphDetail(result.graph.graph_id);
    renderExecutionGraph(detail);
  }
}
window.createGraphForTask = createGraphForTask;

// ═══════════════════════════════════════════
// PROMOTION DOSSIERS — Standalone viewer
// ═══════════════════════════════════════════

async function loadAllDossiers() {
  try {
    const res = await fetch('/api/promotion-dossiers');
    if (!res.ok) return [];
    const data = await res.json();
    return data.dossiers || [];
  } catch { return []; }
}

function renderDossiersList(dossiers) {
  const el = document.getElementById('dossiersPanel');
  if (!el) return;
  if (!dossiers.length) {
    el.innerHTML = '<div style="color:var(--text-faint);font-size:11px;padding:8px">No promotion dossiers yet</div>';
    return;
  }

  el.innerHTML = dossiers.map(d => {
    const recClass = { promote: 'dos-promote', hold: 'dos-hold', rework: 'dos-rework' };
    return `<div class="dossier-card ${recClass[d.recommendation] || ''}">
      <div class="dossier-card-header">
        <span class="dossier-card-title">${esc(d.title)}</span>
        <span class="dossier-card-score">${d.confidence_score}%</span>
        <span class="dossier-card-rec">${d.recommendation}</span>
      </div>
      <div class="dossier-card-meta">
        <span>${esc(d.domain)}</span>
        <span>Lane: ${d.lane}</span>
        ${d.promoted_at ? '<span class="eg-promoted">Promoted</span>' : ''}
      </div>
      <div class="dossier-card-summary">${esc(d.board_rationale.slice(0, 120))}</div>
      ${d.risks.length ? '<div class="dossier-card-risks">' + d.risks.map(r => '<span class="dossier-risk">' + esc(r) + '</span>').join('') + '</div>' : ''}
      ${d.review_results.length ? '<div class="dossier-card-reviews">' + d.review_results.map(r => '<span class="dossier-rv dossier-rv-' + r.verdict + '">' + esc(r.review_type.replace(/_/g, ' ')) + ': ' + r.verdict + '</span>').join('') + '</div>' : ''}
    </div>`;
  }).join('');
}

// ═══════════════════════════════════════════
// PROVIDERS — Provider capability cards + fits
// ═══════════════════════════════════════════

async function loadProviderRegistry() {
  try {
    const res = await fetch('/api/provider-registry');
    if (!res.ok) return null;
    return await res.json();
  } catch { return null; }
}

function renderProviders(data) {
  const el = document.getElementById('providersPanel');
  if (!el || !data) return;

  const providers = data.providers || [];
  const fits = data.fits || [];
  const recipes = data.recipes || [];

  let html = '<div class="prov-container">';

  // Provider cards
  html += '<div class="prov-grid">';
  for (const p of providers) {
    const provFits = fits.filter(f => f.provider_id === p.provider_id);
    const provRecipes = recipes.filter(r => r.provider_id === p.provider_id);
    const privClass = p.privacy_class === 'local' ? 'prov-local' : 'prov-external';

    html += `<div class="prov-card ${privClass}">
      <div class="prov-card-header">
        <span class="prov-name">${esc(p.display_name)}</span>
        <span class="prov-privacy">${p.privacy_class}</span>
      </div>
      <div class="prov-roles">${p.best_roles.map(r => '<span class="prov-role">' + esc(r) + '</span>').join('')}</div>
      <div class="prov-tasks">${p.best_task_kinds.map(t => '<span class="prov-task">' + esc(t) + '</span>').join('')}</div>
      <div class="prov-strengths">${p.strengths.slice(0, 3).map(s => '<span class="prov-str">' + esc(s) + '</span>').join('')}</div>
      <div class="prov-meta">
        <span>${provFits.length} fits</span>
        <span>${provRecipes.length} recipes</span>
        <span>Cost: ${p.cost_tier}</span>
      </div>
    </div>`;
  }
  html += '</div>';

  // Fits table
  if (fits.length) {
    html += '<div class="prov-section"><div class="prov-section-title">Scoped Provider Fits</div>';
    html += fits.slice(0, 20).map(f => {
      const stateClass = { experimental: 'fit-exp', promoted: 'fit-prom', deprecated: 'fit-dep' };
      return `<div class="prov-fit ${stateClass[f.state] || ''}">
        <span class="prov-fit-provider">${esc(f.provider_id)}</span>
        <span class="prov-fit-role">${esc(f.role)}</span>
        <span class="prov-fit-task">${esc(f.task_kind)}</span>
        <span class="prov-fit-score">${f.fit_score}</span>
        <span class="prov-fit-conf">conf: ${f.confidence}</span>
        <span class="prov-fit-state">${f.state}</span>
        <span class="prov-fit-scope">${f.scope_level}:${esc(f.scope_id)}</span>
      </div>`;
    }).join('');
    html += '</div>';
  }

  // Recipes
  if (recipes.length) {
    html += '<div class="prov-section"><div class="prov-section-title">Prompt Recipes</div>';
    html += recipes.slice(0, 15).map(r => {
      const stateClass = { experimental: 'fit-exp', promoted: 'fit-prom', deprecated: 'fit-dep' };
      return `<div class="prov-recipe ${stateClass[r.state] || ''}">
        <span class="prov-recipe-title">${esc(r.title)}</span>
        <span class="prov-recipe-provider">${esc(r.provider_id)}</span>
        <span class="prov-recipe-role">${esc(r.role)}</span>
        <span class="prov-recipe-uses">${r.uses} uses</span>
        <span class="prov-fit-state">${r.state}</span>
      </div>`;
    }).join('');
    html += '</div>';
  }

  html += '</div>';
  el.innerHTML = html;
}

// ═══════════════════════════════════════════
// REVERSE PROMPTING — Summary on completed graphs
// ═══════════════════════════════════════════

async function loadReversePromptingRuns(graphId) {
  try {
    const res = await fetch('/api/reverse-prompting/runs/' + graphId);
    if (!res.ok) return [];
    const data = await res.json();
    return data.runs || [];
  } catch { return []; }
}

async function triggerReversePrompting(graphId) {
  const res = await fetch('/api/reverse-prompting/run/' + graphId, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  if (res.ok) refreshCurrentGraphPanel();
}
window.triggerReversePrompting = triggerReversePrompting;

function renderReversePromptingSummary(runs) {
  if (!runs || !runs.length) return '';
  const run = runs[0]; // most recent

  let html = '<div class="rp-summary">';
  html += '<div class="rp-title">Reverse Prompting Analysis</div>';

  if (run.success_factors.length) {
    html += '<div class="rp-section"><span class="rp-label">Success Factors</span>';
    html += run.success_factors.map(f => '<div class="rp-item rp-success">' + esc(f) + '</div>').join('');
    html += '</div>';
  }
  if (run.failure_factors.length) {
    html += '<div class="rp-section"><span class="rp-label">Failure Factors</span>';
    html += run.failure_factors.map(f => '<div class="rp-item rp-failure">' + esc(f) + '</div>').join('');
    html += '</div>';
  }
  if (run.anti_patterns.length) {
    html += '<div class="rp-section"><span class="rp-label">Anti-Patterns</span>';
    html += run.anti_patterns.map(f => '<div class="rp-item rp-anti">' + esc(f) + '</div>').join('');
    html += '</div>';
  }
  if (run.fit_updates.length) {
    html += '<div class="rp-section"><span class="rp-label">Fit Recommendations</span>';
    html += run.fit_updates.map(u =>
      `<div class="rp-fit-update">${esc(u.provider_id)} as ${esc(u.role)} for ${esc(u.task_kind)}: ${u.current_score} → ${u.recommended_score}</div>`
    ).join('');
    html += '</div>';
  }
  if (run.recipe_candidates.length) {
    html += '<div class="rp-section"><span class="rp-label">Recipe Candidates</span>';
    html += run.recipe_candidates.slice(0, 5).map(c =>
      `<div class="rp-recipe">${esc(c.provider_id)} as ${esc(c.role)}: ${esc(c.rationale)}</div>`
    ).join('');
    html += '</div>';
  }

  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════
// GOVERNANCE — Policies, budgets, escalation, documentation
// ═══════════════════════════════════════════

async function loadGovernanceData() {
  const [polRes, budRes, escRes, docRes] = await Promise.all([
    fetch('/api/operator-policies').then(r => r.ok ? r.json() : { policies: [] }).catch(() => ({ policies: [] })),
    fetch('/api/autonomy-budgets').then(r => r.ok ? r.json() : { budgets: [] }).catch(() => ({ budgets: [] })),
    fetch('/api/escalation-rules').then(r => r.ok ? r.json() : { rules: [] }).catch(() => ({ rules: [] })),
    fetch('/api/documentation-requirements').then(r => r.ok ? r.json() : { requirements: [] }).catch(() => ({ requirements: [] })),
  ]);
  return { policies: polRes.policies, budgets: budRes.budgets, rules: escRes.rules, requirements: docRes.requirements };
}

function renderGovernance(data) {
  const el = document.getElementById('governancePanel');
  if (!el || !data) return;

  let html = '<div class="gov-container">';

  // Policies
  html += '<div class="gov-section"><div class="gov-section-title">Operator Policies</div>';
  if (data.policies.length) {
    html += data.policies.map(p =>
      `<div class="gov-row ${p.enabled ? '' : 'gov-disabled'}">
        <span class="gov-area">${esc(p.area.replace(/_/g, ' '))}</span>
        <span class="gov-value gov-val-${p.value}">${p.value}</span>
        <span class="gov-scope">${p.scope_level}:${esc(p.scope_id)}</span>
        ${p.rationale ? '<span class="gov-rationale">' + esc(p.rationale) + '</span>' : ''}
      </div>`
    ).join('');
  } else {
    html += '<div class="gov-empty">Using defaults — create policies to customize behavior</div>';
  }
  html += '</div>';

  // Budgets
  html += '<div class="gov-section"><div class="gov-section-title">Autonomy Budgets</div>';
  if (data.budgets.length) {
    html += data.budgets.map(b =>
      `<div class="gov-row ${b.enabled ? '' : 'gov-disabled'}">
        <span class="gov-lane gov-lane-${b.lane}">${b.lane}</span>
        <span class="gov-scope">${b.scope_level}:${esc(b.scope_id)}</span>
        <span class="gov-meta">retries: ${b.max_retries} | $${b.max_daily_cost_usd}/day</span>
        <span class="gov-flags">${b.auto_execute_green ? 'auto-green' : ''} ${b.auto_learn_from_evidence ? 'auto-learn' : ''}</span>
      </div>`
    ).join('');
  } else {
    html += '<div class="gov-empty">Using lane defaults (dev: permissive, beta: moderate, prod: strict)</div>';
  }
  html += '</div>';

  // Escalation Rules
  html += '<div class="gov-section"><div class="gov-section-title">Escalation Rules</div>';
  html += data.rules.map(r =>
    `<div class="gov-row ${r.enabled ? '' : 'gov-disabled'}">
      <span class="gov-trigger">${esc(r.trigger.replace(/_/g, ' '))}</span>
      <span class="gov-arrow">→</span>
      <span class="gov-action">${esc(r.action.replace(/_/g, ' '))}</span>
      ${r.threshold ? '<span class="gov-threshold">threshold: ' + r.threshold + '</span>' : ''}
    </div>`
  ).join('');
  html += '</div>';

  // Documentation Requirements
  html += '<div class="gov-section"><div class="gov-section-title">Documentation Requirements</div>';
  html += data.requirements.map(d =>
    `<div class="gov-row">
      <span class="gov-doc-scope">${esc(d.scope_type.replace(/_/g, ' '))}</span>
      <span class="gov-doc-title">${esc(d.title)}</span>
      <span class="gov-doc-arts">${d.required_artifacts.join(', ')}</span>
      <span class="gov-doc-lanes">dev:${d.lane_behavior.dev} beta:${d.lane_behavior.beta} prod:${d.lane_behavior.prod}</span>
    </div>`
  ).join('');
  html += '</div>';

  html += '</div>';
  el.innerHTML = html;
}

// ═══════════════════════════════════════════
// SIMULATION + READINESS — Inline panels
// ═══════════════════════════════════════════

async function runSimulation(relatedType, relatedId, lane, overrides) {
  try {
    const res = await fetch('/api/policy-simulation/run', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ related_type: relatedType, related_id: relatedId, lane, overrides }),
    });
    return res.ok ? (await res.json()).result : null;
  } catch { return null; }
}

async function runReadiness(relatedType, relatedId) {
  try {
    const res = await fetch('/api/release-readiness/score/' + relatedType + '/' + relatedId, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    return res.ok ? (await res.json()).score : null;
  } catch { return null; }
}

async function runGovTests(relatedType, relatedId) {
  try {
    const res = await fetch('/api/governance-tests/run/' + relatedType + '/' + relatedId, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}',
    });
    return res.ok ? (await res.json()).tests : [];
  } catch { return []; }
}

function renderSimulationResult(result) {
  if (!result) return '';
  const outcomeClass = { pass: 'sim-pass', warn: 'sim-warn', block: 'sim-block' };
  let html = `<div class="sim-result ${outcomeClass[result.outcome] || ''}">
    <div class="sim-header">
      <span class="sim-label">Simulation</span>
      <span class="sim-lane">${result.lane}</span>
      <span class="sim-outcome">${result.outcome}</span>
    </div>
    <div class="sim-summary">${esc(result.summary)}</div>`;
  if (result.blocked_actions.length) html += '<div class="sim-items sim-blockers">' + result.blocked_actions.map(b => '<div>' + esc(b) + '</div>').join('') + '</div>';
  if (result.warnings.length) html += '<div class="sim-items sim-warnings">' + result.warnings.map(w => '<div>' + esc(w) + '</div>').join('') + '</div>';
  if (result.escalation_triggers.length) html += '<div class="sim-items sim-escalations">' + result.escalation_triggers.map(e => '<div>' + esc(e) + '</div>').join('') + '</div>';
  html += '</div>';
  return html;
}

function renderReadinessScore(score) {
  if (!score) return '';
  const recClass = { ready: 'rdy-ready', conditional: 'rdy-conditional', not_ready: 'rdy-not-ready' };
  let html = `<div class="readiness-card ${recClass[score.recommendation] || ''}">
    <div class="rdy-header">
      <span class="rdy-label">Release Readiness</span>
      <span class="rdy-score">${score.overall_score}%</span>
      <span class="rdy-rec">${score.recommendation.replace('_', ' ')}</span>
    </div>
    <div class="rdy-categories">`;
  for (const [cat, data] of Object.entries(score.category_scores || {})) {
    const pct = data.max > 0 ? Math.round((data.score / data.max) * 100) : 0;
    html += `<div class="rdy-cat">
      <span class="rdy-cat-name">${esc(cat.replace(/_/g, ' '))}</span>
      <span class="rdy-cat-bar"><span class="rdy-cat-fill" style="width:${pct}%"></span></span>
      <span class="rdy-cat-score">${data.score}/${data.max}</span>
    </div>`;
  }
  html += '</div>';
  if (score.blockers.length) html += '<div class="rdy-blockers">' + score.blockers.map(b => '<div class="rdy-blocker">' + esc(b) + '</div>').join('') + '</div>';
  if (score.warnings.length) html += '<div class="rdy-warnings">' + score.warnings.map(w => '<div class="rdy-warning">' + esc(w) + '</div>').join('') + '</div>';
  html += '</div>';
  return html;
}

function renderGovTestResults(tests) {
  if (!tests || !tests.length) return '';
  const passed = tests.filter(t => t.passed).length;
  let html = `<div class="gov-tests">
    <div class="gov-tests-header">
      <span class="gov-tests-label">What-If Tests</span>
      <span class="gov-tests-summary">${passed}/${tests.length} passed</span>
    </div>`;
  html += tests.map(t => {
    const cls = t.passed ? 'gt-pass' : t.passed === false ? 'gt-fail' : 'gt-pending';
    return `<div class="gov-test ${cls}">
      <span class="gt-title">${esc(t.title)}</span>
      <span class="gt-expected">${t.expected_outcome}</span>
      <span class="gt-actual">${t.actual_outcome || '—'}</span>
      <span class="gt-result">${t.passed === true ? 'PASS' : t.passed === false ? 'FAIL' : '—'}</span>
    </div>`;
  }).join('');
  html += '</div>';
  return html;
}

// Attach simulation + readiness to graph panel
async function showSimulationForGraph(graphId, lane) {
  const simSlot = document.getElementById('simSlot');
  if (!simSlot) return;
  simSlot.innerHTML = '<div style="color:var(--text-faint);font-size:10px">Running simulation...</div>';
  const [simResult, readiness, tests] = await Promise.all([
    runSimulation('graph', graphId, lane || 'dev'),
    runReadiness('graph', graphId),
    runGovTests('graph', graphId),
  ]);
  simSlot.innerHTML = renderSimulationResult(simResult) + renderReadinessScore(readiness) + renderGovTestResults(tests);
}
window.showSimulationForGraph = showSimulationForGraph;

async function showSimulationForDossier(dossierId) {
  const simSlot = document.getElementById('dossierSimSlot');
  if (!simSlot) return;
  simSlot.innerHTML = '<div style="color:var(--text-faint);font-size:10px">Running...</div>';
  const [simResult, readiness] = await Promise.all([
    runSimulation('dossier', dossierId, 'beta'),
    runReadiness('dossier', dossierId),
  ]);
  simSlot.innerHTML = renderSimulationResult(simResult) + renderReadinessScore(readiness);
}
window.showSimulationForDossier = showSimulationForDossier;

// ═══════════════════════════════════════════
// GOVERNANCE HEALTH + ANALYTICS + DRIFT + TUNING
// ═══════════════════════════════════════════

async function loadGovernanceHealth() {
  try { const r = await fetch('/api/governance-health'); return r.ok ? (await r.json()).health : null; } catch { return null; }
}

async function loadExceptionAnalytics() {
  try { const r = await fetch('/api/exception-analytics'); return r.ok ? await r.json() : null; } catch { return null; }
}

async function loadDriftReport() {
  try { const r = await fetch('/api/governance-drift'); return r.ok ? (await r.json()).report : null; } catch { return null; }
}

async function loadTuningRecs() {
  try { const r = await fetch('/api/policy-tuning/recommendations'); return r.ok ? (await r.json()).recommendations : []; } catch { return []; }
}

function renderGovernanceHealthPanel(health, analytics, drift, tuning) {
  const el = document.getElementById('govHealthPanel');
  if (!el) return;

  let html = '';

  // Health card
  if (health) {
    const hClass = { healthy: 'gh-healthy', drifting: 'gh-drifting', degraded: 'gh-degraded', critical: 'gh-critical' };
    html += `<div class="gh-card ${hClass[health.health] || ''}">
      <div class="gh-header"><span class="gh-label">Governance Health</span><span class="gh-status">${health.health}</span></div>
      <div class="gh-summary">${esc(health.summary)}</div>
      <div class="gh-stats">
        <span>Exceptions: ${health.exception_count}</span>
        <span>Drift signals: ${health.drift_signal_count}</span>
        <span>Pending tuning: ${health.pending_tuning_count}</span>
        <span>Override rate: ${health.override_rate}%</span>
      </div>
    </div>`;
  }

  // Exception analytics
  if (analytics && analytics.total > 0) {
    html += '<div class="gh-section"><div class="gh-section-title">Exception Analytics</div>';
    html += `<div class="gh-meta">Total: ${analytics.total} | Window: ${analytics.window_start?.slice(0, 10)} to ${analytics.window_end?.slice(0, 10)}</div>`;
    if (analytics.hotspots?.length) html += '<div class="gh-hotspots">' + analytics.hotspots.map(h => '<span class="gh-hotspot">' + esc(h) + '</span>').join('') + '</div>';
    if (analytics.trends?.length) html += '<div class="gh-trends">' + analytics.trends.map(t => '<div class="gh-trend">' + esc(t) + '</div>').join('') + '</div>';
    html += '</div>';
  }

  // Drift report
  if (drift && drift.signals?.length > 0) {
    html += '<div class="gh-section"><div class="gh-section-title">Governance Drift</div>';
    html += drift.signals.map(s =>
      `<div class="gh-drift gh-drift-${s.severity}"><span class="gh-drift-cat">${esc(s.category.replace(/_/g, ' '))}</span><span class="gh-drift-desc">${esc(s.description)}</span><span class="gh-drift-ev">${s.evidence_count} evidence</span></div>`
    ).join('');
    html += '</div>';
  }

  // Tuning recommendations
  if (tuning && tuning.length > 0) {
    html += '<div class="gh-section"><div class="gh-section-title">Policy Tuning Recommendations</div>';
    html += tuning.map(r => {
      const riskClass = { low: 'tr-low', medium: 'tr-medium', high: 'tr-high' };
      return `<div class="gh-tuning ${riskClass[r.risk] || ''}">
        <div class="tr-header"><span class="tr-title">${esc(r.title)}</span><span class="tr-action">${r.action}</span><span class="tr-target">${r.target.replace(/_/g, ' ')}</span><span class="tr-risk">${r.risk}</span><span class="tr-status">${r.status}</span></div>
        <div class="tr-rationale">${esc(r.rationale)}</div>
        ${r.status === 'pending' ? '<div class="tr-actions"><button class="nop-btn nop-btn-primary" onclick="approveTuning(\'' + r.rec_id + '\')">Approve</button><button class="nop-btn nop-btn-secondary" onclick="rejectTuning(\'' + r.rec_id + '\')">Reject</button></div>' : ''}
      </div>`;
    }).join('');
    html += '</div>';
  }

  el.innerHTML = html || '<div class="gov-empty">No governance health data yet</div>';
}

async function approveTuning(recId) {
  await fetch('/api/policy-tuning/recommendations/' + recId + '/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  refreshGovernanceHealth();
}
window.approveTuning = approveTuning;

async function rejectTuning(recId) {
  await fetch('/api/policy-tuning/recommendations/' + recId + '/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  refreshGovernanceHealth();
}
window.rejectTuning = rejectTuning;

async function refreshGovernanceHealth() {
  const [health, analytics, drift, tuning] = await Promise.all([
    loadGovernanceHealth(), loadExceptionAnalytics(), loadDriftReport(), loadTuningRecs(),
  ]);
  renderGovernanceHealthPanel(health, analytics, drift, tuning);
}

// ═══════════════════════════════════════════
// GOVERNANCE OPS CONSOLE — Extended panels
// ═══════════════════════════════════════════

async function loadGovOps() {
  try { const r = await fetch('/api/governance-ops'); return r.ok ? await r.json() : null; } catch { return null; }
}

function renderGovOpsCards(ops) {
  if (!ops) return '';
  let html = '<div class="go-cards">';
  const cards = [
    { label: 'Pending Resolutions', value: ops.pending_resolutions, cls: ops.pending_resolutions > 0 ? 'go-warn' : '' },
    { label: 'Pending Tuning', value: ops.pending_tuning, cls: ops.pending_tuning > 0 ? 'go-warn' : '' },
    { label: 'Pending Overrides', value: ops.pending_overrides, cls: ops.pending_overrides > 0 ? 'go-warn' : '' },
    { label: 'Open Escalations', value: ops.unresolved_escalations, cls: ops.unresolved_escalations > 0 ? 'go-alert' : '' },
  ];
  for (const c of cards) {
    html += `<div class="go-card ${c.cls}"><div class="go-card-value">${c.value}</div><div class="go-card-label">${c.label}</div></div>`;
  }
  html += '</div>';

  // Hotspots
  if (ops.hotspots?.length) {
    html += '<div class="gh-section"><div class="gh-section-title">Hotspots</div>';
    html += ops.hotspots.map(h =>
      `<div class="gh-hotspot">${esc(h.category)}: ${h.count} (${h.severity})</div>`
    ).join('');
    html += '</div>';
  }

  // Watchlist
  if (ops.watchlist?.length) {
    html += '<div class="gh-section"><div class="gh-section-title">Watchlist</div>';
    html += ops.watchlist.filter(w => w.active).map(w =>
      `<div class="go-watch">${esc(w.scope)}: ${esc(w.reason)}</div>`
    ).join('');
    html += '</div>';
  }

  return html;
}

// Enhance the governance tab refresh to include ops
const _origRefreshGovHealth = refreshGovernanceHealth;
refreshGovernanceHealth = async function() {
  await _origRefreshGovHealth();
  const ops = await loadGovOps();
  const opsSlot = document.getElementById('govOpsCards');
  if (opsSlot && ops) opsSlot.innerHTML = renderGovOpsCards(ops);
};

// ═══════════════════════════════════════════
// RUNTIME GOVERNANCE — Panel on graph/node detail
// ═══════════════════════════════════════════

async function loadRuntimeSummary() {
  try { const r = await fetch('/api/runtime-enforcement'); return r.ok ? await r.json() : null; } catch { return null; }
}

async function loadRuntimeForGraph(graphId) {
  try { const r = await fetch('/api/runtime-enforcement/graph/' + graphId); return r.ok ? await r.json() : null; } catch { return null; }
}

function renderRuntimePanel(data) {
  if (!data) return '';
  const results = data.results || [];
  if (!results.length && !data.total_hooks) return '';

  // If summary data
  if (data.total_hooks !== undefined) {
    const healthClass = data.active_blocks > 0 ? 'rt-blocked' : data.total_warnings > 0 ? 'rt-warned' : 'rt-clear';
    return `<div class="rt-summary ${healthClass}">
      <div class="rt-header"><span class="rt-label">Runtime Governance</span><span class="rt-status">${data.active_blocks > 0 ? data.active_blocks + ' blocked' : data.total_warnings > 0 ? data.total_warnings + ' warnings' : 'clear'}</span></div>
      <div class="rt-stats"><span>Hooks: ${data.total_hooks}</span><span>Blocks: ${data.total_blocks}</span><span>Warnings: ${data.total_warnings}</span><span>Pauses: ${data.total_pauses}</span></div>
    </div>`;
  }

  // Results list
  let html = '<div class="rt-results"><div class="rt-label">Runtime Checks</div>';
  for (const r of results.slice(0, 5)) {
    const cls = { proceed: 'rt-proceed', proceed_with_warning: 'rt-warn', block: 'rt-block', require_override: 'rt-override', pause_for_escalation: 'rt-pause' };
    html += `<div class="rt-result ${cls[r.outcome] || ''}">
      <span class="rt-transition">${esc(r.transition)}</span>
      <span class="rt-outcome">${r.outcome.replace(/_/g, ' ')}</span>
      ${r.blockers.length ? '<span class="rt-blocker">' + esc(r.blockers[0]) + '</span>' : ''}
      ${r.warnings.length ? '<span class="rt-warning-text">' + esc(r.warnings[0]) + '</span>' : ''}
    </div>`;
  }
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════
// OVERRIDE OPS + EXCEPTION CASES — Dedicated panels
// ═══════════════════════════════════════════

async function loadOverrideOps() {
  try { const r = await fetch('/api/override-ops'); return r.ok ? await r.json() : null; } catch { return null; }
}

async function loadExceptionCases() {
  try { const r = await fetch('/api/exception-cases'); return r.ok ? (await r.json()).cases : []; } catch { return []; }
}

function renderOverrideOps(data) {
  if (!data) return '';
  let html = `<div class="oo-summary">
    <div class="oo-header"><span class="oo-label">Override Operations</span></div>
    <div class="oo-cards">
      <div class="oo-stat ${data.pending > 0 ? 'oo-warn' : ''}"><span class="oo-val">${data.pending}</span><span class="oo-key">Pending</span></div>
      <div class="oo-stat"><span class="oo-val">${data.approved}</span><span class="oo-key">Approved</span></div>
      <div class="oo-stat ${data.stale > 0 ? 'oo-warn' : ''}"><span class="oo-val">${data.stale}</span><span class="oo-key">Stale</span></div>
      <div class="oo-stat"><span class="oo-val">${data.consumed}</span><span class="oo-key">Consumed</span></div>
      <div class="oo-stat"><span class="oo-val">${data.expired}</span><span class="oo-key">Expired</span></div>
      <div class="oo-stat"><span class="oo-val">${data.rejected}</span><span class="oo-key">Rejected</span></div>
    </div>
    ${data.hotspots?.length ? '<div class="oo-hotspots">' + data.hotspots.map(h => '<span class="gh-hotspot">' + esc(h) + '</span>').join('') + '</div>' : ''}
  </div>`;
  return html;
}

function renderExceptionCases(cases) {
  if (!cases || !cases.length) return '';
  const open = cases.filter(c => !['resolved', 'closed', 'expired', 'consumed', 'verified'].includes(c.stage));
  if (!open.length) return '';
  let html = '<div class="exc-list"><div class="exc-title">Open Exception Cases (' + open.length + ')</div>';
  html += open.slice(0, 10).map(c => {
    const sevClass = { low: 'exc-low', medium: 'exc-medium', high: 'exc-high', critical: 'exc-critical' };
    return `<div class="exc-case ${sevClass[c.severity] || ''}">
      <span class="exc-case-title">${esc(c.title.slice(0, 60))}</span>
      <span class="exc-sev">${c.severity}</span>
      <span class="exc-stage">${c.stage}</span>
      ${c.owner ? '<span class="exc-owner">' + esc(c.owner) + '</span>' : ''}
      ${c.domain ? '<span class="exc-domain">' + esc(c.domain) + '</span>' : ''}
    </div>`;
  }).join('');
  html += '</div>';
  return html;
}

// ═══════════════════════════════════════════
// ENFORCEMENT + OVERRIDES + PROMOTION CONTROL
// ═══════════════════════════════════════════

function renderEnforcementDecision(decision) {
  if (!decision) return '';
  const levelClass = { allow: 'enf-allow', warn: 'enf-warn', soft_block: 'enf-soft-block', hard_block: 'enf-hard-block', override_required: 'enf-override' };
  let html = `<div class="enf-decision ${levelClass[decision.level] || ''}">
    <div class="enf-header">
      <span class="enf-label">Enforcement</span>
      <span class="enf-action">${esc(decision.action.replace(/_/g, ' '))}</span>
      <span class="enf-level">${decision.level.replace(/_/g, ' ')}</span>
    </div>`;
  if (decision.blockers.length) html += '<div class="enf-blockers">' + decision.blockers.map(b => '<div class="enf-blocker">' + esc(b) + '</div>').join('') + '</div>';
  if (decision.warnings.length) html += '<div class="enf-warnings">' + decision.warnings.map(w => '<div class="enf-warning">' + esc(w) + '</div>').join('') + '</div>';
  if (decision.required_override_types.length) html += '<div class="enf-overrides">Override needed: ' + decision.required_override_types.join(', ') + '</div>';
  html += '</div>';
  return html;
}

function renderOverrides(overrides) {
  if (!overrides || !overrides.length) return '';
  let html = '<div class="ovr-list"><div class="ovr-title">Overrides</div>';
  html += overrides.map(o => {
    const statusClass = { pending: 'ovr-pending', approved: 'ovr-approved', rejected: 'ovr-rejected', expired: 'ovr-expired', consumed: 'ovr-consumed' };
    return `<div class="ovr-entry ${statusClass[o.status] || ''}">
      <span class="ovr-type">${esc(o.override_type.replace(/_/g, ' '))}</span>
      <span class="ovr-status">${o.status}</span>
      <span class="ovr-reason">${esc(o.reason.slice(0, 80))}</span>
      ${o.status === 'pending' ? `
        <div class="ovr-actions">
          <button class="nop-btn nop-btn-primary" onclick="approveOverrideAction('${o.override_id}')">Approve</button>
          <button class="nop-btn nop-btn-secondary" onclick="rejectOverrideAction('${o.override_id}')">Reject</button>
        </div>` : ''}
    </div>`;
  }).join('');
  html += '</div>';
  return html;
}

async function approveOverrideAction(overrideId) {
  await fetch('/api/overrides/' + overrideId + '/approve', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  refreshCurrentGraphPanel();
}
window.approveOverrideAction = approveOverrideAction;

async function rejectOverrideAction(overrideId) {
  await fetch('/api/overrides/' + overrideId + '/reject', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
  refreshCurrentGraphPanel();
}
window.rejectOverrideAction = rejectOverrideAction;

function renderPromotionDecision(decision) {
  if (!decision) return '';
  const resultClass = { allowed: 'promo-allowed', allowed_with_override: 'promo-override', blocked: 'promo-blocked' };
  let html = `<div class="promo-decision ${resultClass[decision.result] || ''}">
    <div class="promo-header">
      <span class="promo-label">Promotion → ${decision.target_lane}</span>
      <span class="promo-result">${decision.result.replace(/_/g, ' ')}</span>
      ${decision.readiness_score !== undefined ? '<span class="promo-score">' + decision.readiness_score + '%</span>' : ''}
    </div>`;
  if (decision.blockers.length) html += '<div class="promo-blockers">' + decision.blockers.map(b => '<div class="promo-blocker">' + esc(b) + '</div>').join('') + '</div>';
  if (decision.result !== 'blocked') {
    html += `<button class="nop-btn nop-btn-primary" style="margin-top:6px" onclick="executePromotionAction('${decision.dossier_id}','${decision.target_lane}')">Execute Promotion</button>`;
  }
  html += '</div>';
  return html;
}

async function evaluatePromotionUI(dossierId, targetLane) {
  const promoSlot = document.getElementById('promoSlot');
  if (!promoSlot) return;
  promoSlot.innerHTML = '<div style="color:var(--text-faint);font-size:10px">Evaluating...</div>';
  try {
    const res = await fetch('/api/promotion-control/' + dossierId + '/evaluate/' + targetLane, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (res.ok) {
      const data = await res.json();
      promoSlot.innerHTML = renderPromotionDecision(data.decision);
    }
  } catch { promoSlot.innerHTML = ''; }
}
window.evaluatePromotionUI = evaluatePromotionUI;

async function executePromotionAction(dossierId, targetLane) {
  try {
    await fetch('/api/promotion-control/' + dossierId + '/promote/' + targetLane, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    refreshCurrentGraphPanel();
  } catch { /* */ }
}
window.executePromotionAction = executePromotionAction;

// ═══════════════════════════════════════════
// ENHANCED LIVE FEED
// ═══════════════════════════════════════════

// Override pushLiveFeed to add mission tagging and signal classification
const _origPushLiveFeed = typeof pushLiveFeed === 'function' ? pushLiveFeed : null;

function enhancedPushLiveFeed(actor, body, linkTaskId, result) {
  // Call original
  if (_origPushLiveFeed) _origPushLiveFeed(actor, body, linkTaskId, result);

  // Classify signal level
  const text = (body || '').toLowerCase();
  const isHighSignal = text.includes('approved') || text.includes('rejected') ||
    text.includes('code applied') || text.includes('plan approved') ||
    text.includes('failed') || text.includes('builder') ||
    text.includes('completed') || text.includes('queued next');

  // Tag the most recent feed item with signal class
  if (isHighSignal) {
    const feed = document.getElementById('liveFeed');
    if (feed && feed.firstElementChild) {
      feed.firstElementChild.classList.add('lf-high-signal');
    }
  }
}

// Replace global pushLiveFeed if it exists
if (typeof pushLiveFeed === 'function') {
  window.pushLiveFeed = enhancedPushLiveFeed;
}

// ═══════════════════════════════════════════
// WIRING — Override/extend existing render functions
// ═══════════════════════════════════════════

// Replace renderNeedsRahul with the enhanced version
if (typeof renderNeedsRahul === 'function') {
  window.renderNeedsRahul = renderNeedsOperator;
}

// Replace renderMissionSnapshot with enhanced version
const _origRenderMissionSnapshot = typeof renderMissionSnapshot === 'function' ? renderMissionSnapshot : null;
window.renderMissionSnapshot = function() {
  renderEnhancedMissionSnapshot();
};

// Enhance the intake detail renderer to include board discussion
const _origRenderIntakeDetail = typeof renderIntakeDetail === 'function' ? renderIntakeDetail : null;
if (_origRenderIntakeDetail) {
  window.renderIntakeDetail = function(data) {
    _origRenderIntakeDetail(data);
    // Inject board discussion after the detail panel renders
    if (data.task && data.task.board_deliberation) {
      const panel = document.getElementById('intakeDetailPanel');
      if (panel) {
        const delibPanel = panel.querySelector('.delib-panel');
        if (delibPanel) {
          // Find where to insert — after the deliberation sections, before timeline
          const timelineSection = delibPanel.querySelector('.task-timeline');
          const boardHtml = renderBoardDiscussion(data.task.board_deliberation);
          if (timelineSection && boardHtml) {
            timelineSection.insertAdjacentHTML('beforebegin', boardHtml);
          } else if (boardHtml) {
            delibPanel.insertAdjacentHTML('beforeend', boardHtml);
          }
        }
      }
    }
    // Show execution graph panel for this task
    if (data.task) {
      showGraphForTask(data.task.task_id);
    }
  };
}

// ═══════════════════════════════════════════
// INIT — Run after DOM and app.js are ready
// ═══════════════════════════════════════════

// Render templates on intake tab, load COS/memory/missions on their tabs
const _origSwitchTab = typeof switchTab === 'function' ? switchTab : null;
if (_origSwitchTab) {
  window.switchTab = function(tab) {
    _origSwitchTab(tab);
    if (tab === 'intake') {
      setTimeout(renderMissionTemplates, 50);
    }
    if (tab === 'home' || tab === 'chief-of-staff') {
      refreshChiefOfStaff();
    }
    if (tab === 'missions' || tab === 'mission-statements') {
      loadMissionStatements().then(s => renderMissionStatements(s));
    }
    if (tab === 'memory') {
      loadMemoryViewer().then(d => renderMemoryViewer(d));
    }
    if (tab === 'dossiers') {
      loadAllDossiers().then(d => renderDossiersList(d));
    }
    if (tab === 'providers') {
      loadProviderRegistry().then(d => renderProviders(d));
      // Part 30: Provider governance summary
      fetch('/api/provider-governance-summary').then(r => r.ok ? r.json() : { summary: [] }).then(data => {
        const slot = document.getElementById('provGovSummary');
        if (!slot || !data.summary?.length) return;
        slot.innerHTML = '<div class="prov-section"><div class="prov-section-title">Provider Health</div>' +
          data.summary.map(s => {
            const hCls = { healthy: 'pgh-healthy', watch: 'pgh-watch', degraded: 'pgh-degraded', unstable: 'pgh-unstable' };
            return '<div class="prov-gov-row ' + (hCls[s.reliability] || '') + '">' +
              '<span class="pgr-name">' + esc(s.provider_id) + '</span>' +
              '<span class="pgr-health">' + s.reliability + '</span>' +
              '<span class="pgr-cost">' + s.cost_tier + '</span>' +
              '<span class="pgr-latency">' + s.latency_class + '</span>' +
              '<span class="pgr-routing">' + s.routing.overall + '</span>' +
              (s.incidents > 0 ? '<span class="pgr-incidents">' + s.incidents + ' incidents</span>' : '') +
            '</div>';
          }).join('') + '</div>';
      }).catch(() => {});
    }
    if (tab === 'governance') {
      loadGovernanceData().then(d => renderGovernance(d));
      refreshGovernanceHealth();
      loadRuntimeSummary().then(d => {
        const slot = document.getElementById('runtimeSummarySlot');
        if (slot && d) slot.innerHTML = renderRuntimePanel(d);
      });
      // Part 28: Override ops + exceptions
      Promise.all([loadOverrideOps(), loadExceptionCases()]).then(([ops, cases]) => {
        const ooSlot = document.getElementById('overrideOpsSlot');
        if (ooSlot) ooSlot.innerHTML = renderOverrideOps(ops) + renderExceptionCases(cases);
      });
      // Part 29: Isolation + patterns
      Promise.all([
        fetch('/api/shared-patterns').then(r => r.ok ? r.json() : { patterns: [] }).catch(() => ({ patterns: [] })),
        fetch('/api/isolation-violations').then(r => r.ok ? r.json() : { violations: [] }).catch(() => ({ violations: [] })),
      ]).then(([patData, violData]) => {
        const isoSlot = document.getElementById('isolationPatternSlot');
        if (!isoSlot) return;
        let html = '';
        if (violData.violations.length) {
          html += '<div class="iso-section"><div class="iso-title">Isolation Violations (' + violData.violations.length + ')</div>';
          html += violData.violations.slice(0, 5).map(v => '<div class="iso-viol"><span class="iso-art">' + esc(v.artifact_type) + '</span> <span class="iso-path">' + esc(v.source_project) + ' → ' + esc(v.target_project) + '</span></div>').join('');
          html += '</div>';
        }
        if (patData.patterns.length) {
          html += '<div class="iso-section"><div class="iso-title">Shared Patterns (' + patData.patterns.length + ')</div>';
          html += patData.patterns.slice(0, 5).map(p => '<div class="iso-pat"><span class="iso-pat-title">' + esc(p.title) + '</span><span class="iso-pat-scope">' + p.scope + '</span><span class="iso-pat-uses">' + p.uses + ' uses</span><span class="iso-pat-state">' + p.state + '</span></div>').join('');
          html += '</div>';
        }
        isoSlot.innerHTML = html;
      });
      // Part 31: Artifact registry + traceability
      Promise.all([
        fetch('/api/artifact-registry').then(r => r.ok ? r.json() : { artifacts: [] }).catch(() => ({ artifacts: [] })),
        fetch('/api/traceability-ledger').then(r => r.ok ? r.json() : { entries: [] }).catch(() => ({ entries: [] })),
      ]).then(([arData, tlData]) => {
        const slot = document.getElementById('traceabilitySlot');
        if (!slot) return;
        let html = '';
        if (arData.artifacts.length) {
          html += '<div class="iso-section"><div class="iso-title">Artifact Registry (' + arData.artifacts.length + ')</div>';
          html += arData.artifacts.slice(0, 8).map(a => '<div class="trc-item"><span class="trc-type">' + esc(a.type) + '</span><span class="trc-title">' + esc(a.title.slice(0, 50)) + '</span><span class="trc-status">' + a.retention + '</span></div>').join('');
          html += '</div>';
        }
        if (tlData.entries.length) {
          html += '<div class="iso-section"><div class="iso-title">Traceability Ledger (' + tlData.entries.length + ')</div>';
          html += tlData.entries.slice(0, 8).map(e => '<div class="trc-item"><span class="trc-actor">' + esc(e.actor) + '</span><span class="trc-action">' + esc(e.action) + '</span><span class="trc-target">' + esc(e.target_type) + ':' + esc(e.target_id.slice(0, 12)) + '</span></div>').join('');
          html += '</div>';
        }
        slot.innerHTML = html;
      });
      // Part 51: Middleware Truth + Protected Paths panel
      Promise.all([
        fetch('/api/middleware-truth').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/protected-path-summary').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/enforcement-evidence').then(r => r.ok ? r.json() : null).catch(() => null),
      ]).then(([truth, ppSummary, evidence]) => {
        const slot = document.getElementById('middlewareTruthSlot');
        if (!slot) return;
        let html = '';
        if (truth) {
          html += '<div class="aud-section"><div class="aud-section-title">Middleware Truth Report — Score: ' + truth.truth_score + '%</div>';
          html += '<div class="go-cards">';
          html += '<div class="go-card"><span class="go-card-value">' + truth.executed_and_verified + '</span><span class="go-card-label">Verified</span></div>';
          html += '<div class="go-card"><span class="go-card-value">' + truth.wired + '</span><span class="go-card-label">Wired</span></div>';
          html += '<div class="go-card ' + (truth.evaluated_only > 0 ? 'oo-warn' : '') + '"><span class="go-card-value">' + truth.evaluated_only + '</span><span class="go-card-label">Eval Only</span></div>';
          html += '<div class="go-card ' + (truth.design_only > 0 ? 'go-alert' : '') + '"><span class="go-card-value">' + truth.design_only + '</span><span class="go-card-label">Design Only</span></div>';
          html += '</div>';
          if (truth.areas?.length) {
            html += truth.areas.map(function(a) {
              var sCls = a.state === 'executed_and_verified' ? 'trc-type' : a.state === 'wired' ? 'trc-action' : 'exc-sev';
              return '<div class="trc-item"><span class="' + sCls + '">' + esc(a.state) + '</span><span class="trc-title">' + esc(a.area) + '</span><span class="trc-status">' + esc(a.detail) + '</span></div>';
            }).join('');
          }
          html += '</div>';
        }
        if (ppSummary) {
          html += '<div class="aud-section"><div class="aud-section-title">Protected Paths — ' + ppSummary.validated + '/' + ppSummary.total_paths + ' validated</div>';
          html += '<div class="go-cards">';
          html += '<div class="go-card"><span class="go-card-value">' + ppSummary.validated + '</span><span class="go-card-label">Validated</span></div>';
          html += '<div class="go-card ' + (ppSummary.partially_validated > 0 ? 'oo-warn' : '') + '"><span class="go-card-value">' + ppSummary.partially_validated + '</span><span class="go-card-label">Partial</span></div>';
          html += '<div class="go-card ' + (ppSummary.failed > 0 ? 'go-alert' : '') + '"><span class="go-card-value">' + ppSummary.failed + '</span><span class="go-card-label">Failed</span></div>';
          html += '<div class="go-card ' + (ppSummary.not_wired > 0 ? 'go-alert' : '') + '"><span class="go-card-value">' + ppSummary.not_wired + '</span><span class="go-card-label">Not Wired</span></div>';
          html += '</div>';
          html += '<button class="nop-btn nop-btn-primary" style="font-size:10px;padding:4px 12px;margin:6px 0" onclick="gpoAction(this,\'/api/protected-paths/run-all\',\'POST\',\'governance\')">Run All Validations</button>';
          if (ppSummary.validation_runs?.length) {
            html += ppSummary.validation_runs.map(function(r) {
              var oCls = r.overall === 'validated' ? 'trc-type' : r.overall === 'partially_validated' ? 'trc-action' : 'exc-sev';
              var steps = r.steps?.map(function(s) { return s.middleware_invoked + ': ' + s.decision + (s.matched_expectation ? ' ✓' : ' ✗'); }).join(', ') || '';
              return '<div class="trc-item"><span class="' + oCls + '">' + esc(r.overall) + '</span><span class="trc-title">' + esc(r.path_name) + '</span><span class="trc-status">' + esc(steps) + '</span></div>';
            }).join('');
          }
          html += '</div>';
        }
        if (evidence?.evidence?.length) {
          html += '<div class="aud-section"><div class="aud-section-title">Enforcement Evidence (' + evidence.evidence.length + ' records)</div>';
          html += evidence.evidence.slice(0, 8).map(function(e) {
            return '<div class="trc-item"><span class="trc-type">' + esc(e.area) + '</span><span class="trc-title">' + esc(e.middleware_ran) + '</span><span class="trc-action">' + esc(e.decision_made) + '</span><span class="trc-status">' + esc(e.response_effect) + ' | ' + esc(e.route) + '</span></div>';
          }).join('');
          html += '</div>';
        }
        slot.innerHTML = html;
      });
      // Part 56: Protection Coverage Expansion panel
      Promise.all([
        fetch('/api/route-protection-expansion').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/mutation-route-guards').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/deep-redaction').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/protection-regressions').then(r => r.ok ? r.json() : null).catch(() => null),
      ]).then(function(arr) {
        var expand = arr[0], mutation = arr[1], redact = arr[2], regressions = arr[3];
        var protSlot = document.getElementById('protectionCoverageSlot');
        if (!protSlot) return;
        var html2 = '';
        if (expand) {
          html2 += '<div class="aud-section"><div class="aud-section-title">Route Protection Coverage — ' + expand.coverage_percent + '% (' + expand.fully_guarded + '/' + (expand.total - (expand.bindings?.filter(function(b) { return b.status === 'not_applicable'; }).length || 0)) + ' guarded)</div>';
          html2 += '<div class="go-cards">';
          html2 += '<div class="go-card"><span class="go-card-value">' + expand.fully_guarded + '</span><span class="go-card-label">Guarded</span></div>';
          html2 += '<div class="go-card ' + (expand.not_guarded > 0 ? 'go-alert' : '') + '"><span class="go-card-value">' + expand.not_guarded + '</span><span class="go-card-label">Not Guarded</span></div>';
          html2 += '</div>';
          if (expand.delta) html2 += '<div style="font-size:10px;color:var(--green)">' + esc(expand.delta.detail) + '</div>';
          html2 += '</div>';
        }
        if (mutation) {
          html2 += '<div class="aud-section"><div class="aud-section-title">Mutation Guards — ' + mutation.coverage_percent + '% (' + mutation.enforced + '/' + mutation.total + ')</div>';
          if (mutation.rules?.length) {
            html2 += mutation.rules.slice(0, 8).map(function(r) {
              return '<div class="trc-item"><span class="' + (r.enforced ? 'trc-type' : 'exc-sev') + '">' + (r.enforced ? 'ON' : 'OFF') + '</span><span class="trc-title">' + esc(r.route_pattern) + ' ' + r.method + '</span><span class="trc-status">' + r.guard_types.join(', ') + '</span></div>';
            }).join('');
          }
          html2 += '</div>';
        }
        if (redact) {
          html2 += '<div class="aud-section"><div class="aud-section-title">Deep Redaction — ' + redact.fields_stripped_total + ' stripped, ' + redact.fields_masked_total + ' masked</div>';
          html2 += '<button class="nop-btn nop-btn-secondary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/deep-redaction/validate\',\'POST\',\'governance\')">Validate Redaction</button>';
          html2 += '</div>';
        }
        if (regressions && regressions.length) {
          html2 += '<div class="aud-section"><div class="aud-section-title">Protection Regressions</div>';
          html2 += regressions.map(function(r) {
            return '<div class="trc-item"><span class="' + (r.passed ? 'trc-type' : 'exc-sev') + '">' + (r.passed ? 'OK' : 'REGR') + '</span><span class="trc-title">' + esc(r.area) + '</span><span class="trc-status">' + esc(r.detail) + '</span></div>';
          }).join('');
          html2 += '</div>';
        }
        protSlot.innerHTML = html2;
      });
    }
    if (tab === 'audit') {
      // Load audit hub + policy history
      Promise.all([
        fetch('/api/audit-hub').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/policy-history').then(r => r.ok ? r.json() : null).catch(() => null),
      ]).then(([auditData, historyData]) => {
        const ahSlot = document.getElementById('auditHubPanel');
        if (ahSlot && auditData) {
          let html = '<div class="aud-summary">';
          html += '<div class="aud-header"><span class="aud-label">Audit Timeline</span><span class="aud-count">' + auditData.total_results + ' items</span></div>';
          if (auditData.artifacts?.length) {
            html += '<div class="aud-section"><div class="aud-section-title">Recent Artifacts</div>';
            html += auditData.artifacts.slice(0, 8).map(a => '<div class="trc-item"><span class="trc-type">' + esc(a.type) + '</span><span class="trc-title">' + esc(a.title.slice(0, 50)) + '</span></div>').join('');
            html += '</div>';
          }
          if (auditData.ledger_entries?.length) {
            html += '<div class="aud-section"><div class="aud-section-title">Recent Actions</div>';
            html += auditData.ledger_entries.slice(0, 8).map(e => '<div class="trc-item"><span class="trc-actor">' + esc(e.actor) + '</span><span class="trc-action">' + esc(e.action) + '</span><span class="trc-target">' + esc(e.target_type) + '</span></div>').join('');
            html += '</div>';
          }
          html += '</div>';
          ahSlot.innerHTML = html;
        }
        const phSlot = document.getElementById('policyHistoryPanel');
        if (phSlot && historyData) {
          let html = '<div class="aud-section"><div class="aud-section-title">Policy Versions (' + (historyData.versions?.length || 0) + ')</div>';
          if (historyData.versions?.length) {
            html += historyData.versions.slice(0, 8).map(v => '<div class="trc-item"><span class="trc-type">' + esc(v.target_type) + '</span><span class="trc-title">v' + v.version + '</span><span class="trc-status">' + (v.superseded_at ? 'superseded' : 'active') + '</span></div>').join('');
          }
          if (historyData.changes?.length) {
            html += '<div class="aud-section-title" style="margin-top:8px">Recent Changes (' + historyData.changes.length + ')</div>';
            html += historyData.changes.slice(0, 5).map(c => '<div class="trc-item"><span class="trc-actor">' + esc(c.actor) + '</span><span class="trc-action">' + esc(c.reason.slice(0, 50)) + '</span><span class="trc-target">' + esc(c.target_type) + '</span></div>').join('');
          }
          html += '</div>';
          phSlot.innerHTML = html;
        }
      });
    }
    if (tab === 'audit') {
      // Also load approval workspace + escalation inbox in audit tab
      Promise.all([
        fetch('/api/approval-workspace').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/escalation-inbox').then(r => r.ok ? r.json() : null).catch(() => null),
      ]).then(([wsData, inboxData]) => {
        const auditPanel = document.getElementById('auditHubPanel');
        if (!auditPanel) return;
        let extra = '';
        if (wsData?.summary) {
          const s = wsData.summary;
          extra += `<div class="aud-section"><div class="aud-section-title">Approval Workspace</div>
            <div class="go-cards" style="margin-bottom:6px">
              <div class="go-card ${s.pending > 0 ? 'oo-warn' : ''}"><span class="oo-val">${s.pending}</span><span class="oo-key">Pending</span></div>
              <div class="go-card ${s.overdue > 0 ? 'go-alert' : ''}"><span class="oo-val">${s.overdue}</span><span class="oo-key">Overdue</span></div>
              <div class="go-card"><span class="oo-val">${s.delegated}</span><span class="oo-key">Delegated</span></div>
              <div class="go-card"><span class="oo-val">${s.approved}</span><span class="oo-key">Approved</span></div>
            </div></div>`;
        }
        if (wsData?.items?.length) {
          const pending = wsData.items.filter(r => r.status === 'pending' || r.status === 'overdue');
          if (pending.length > 0) {
            extra += '<div class="aud-section"><div class="aud-section-title">Pending Approvals</div>';
            extra += pending.slice(0, 5).map(r => `<div class="exc-case exc-${r.severity || 'medium'}">
              <span class="exc-case-title">${esc(r.title.slice(0, 50))}</span>
              <span class="exc-sev">${r.severity || 'medium'}</span>
              <div style="margin-top:4px;display:flex;gap:4px">
                <button class="nop-btn nop-btn-primary" style="font-size:9px;padding:2px 8px" onclick="(async()=>{await fetch('/api/approval-workspace/${r.request_id}/approve',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});location.reload()})()">Approve</button>
                <button class="nop-btn nop-btn-secondary" style="font-size:9px;padding:2px 8px" onclick="(async()=>{await fetch('/api/approval-workspace/${r.request_id}/reject',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});location.reload()})()">Reject</button>
              </div>
            </div>`).join('');
            extra += '</div>';
          }
        }
        if (inboxData?.items?.length) {
          const newItems = inboxData.items.filter(i => i.status === 'new' || i.status === 'triaged');
          if (newItems.length > 0) {
            extra += `<div class="aud-section"><div class="aud-section-title">Escalation Inbox (${newItems.length} active)</div>`;
            extra += newItems.slice(0, 5).map(i => `<div class="exc-case exc-${i.severity}">
              <span class="exc-case-title">${esc(i.title.slice(0, 50))}</span>
              <span class="exc-sev">${i.severity}</span>
              <span class="exc-stage">${i.status}</span>
              <div style="margin-top:4px;display:flex;gap:4px">
                <button class="nop-btn nop-btn-primary" style="font-size:9px;padding:2px 8px" onclick="(async()=>{await fetch('/api/escalation-inbox/${i.item_id}/triage',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});location.reload()})()">Triage</button>
                <button class="nop-btn nop-btn-secondary" style="font-size:9px;padding:2px 8px" onclick="(async()=>{await fetch('/api/escalation-inbox/${i.item_id}/resolve',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});location.reload()})()">Resolve</button>
              </div>
            </div>`).join('');
            extra += '</div>';
          }
        }
        if (extra) auditPanel.insertAdjacentHTML('beforeend', extra);
      });
    }
    if (tab === 'releases') {
      fetch('/api/release-workspace-summary').then(r => r.ok ? r.json() : null).then(data => {
        const slot = document.getElementById('releaseWorkspacePanel');
        if (!slot || !data) return;
        let html = '<div class="go-cards">';
        html += `<div class="go-card"><span class="go-card-value">${data.total_plans || 0}</span><span class="go-card-label">Plans</span></div>`;
        html += `<div class="go-card ${data.executing > 0 ? 'oo-warn' : ''}"><span class="go-card-value">${data.executing || 0}</span><span class="go-card-label">Executing</span></div>`;
        html += `<div class="go-card"><span class="go-card-value">${data.completed || 0}</span><span class="go-card-label">Completed</span></div>`;
        html += `<div class="go-card ${data.halted > 0 ? 'go-alert' : ''}"><span class="go-card-value">${data.halted || 0}</span><span class="go-card-label">Halted</span></div>`;
        html += '</div>';
        // Load full plans
        fetch('/api/release-orchestration').then(r => r.ok ? r.json() : null).then(full => {
          if (!full) return;
          if (full.plans?.length) {
            html += '<div class="aud-section"><div class="aud-section-title">Release Plans</div>';
            html += full.plans.slice(0, 10).map(p => {
              let actions = '';
              if (p.status === 'draft') actions = '<button class="nop-btn nop-btn-primary" style="font-size:9px;padding:2px 8px" onclick="(async()=>{await fetch(\'/api/release-orchestration/' + p.plan_id + '/approve\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:\'{}\'});location.reload()})()">Approve</button>';
              else if (p.status === 'approved') actions = '<button class="nop-btn nop-btn-primary" style="font-size:9px;padding:2px 8px" onclick="(async()=>{await fetch(\'/api/release-orchestration/' + p.plan_id + '/execute\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:\'{}\'});location.reload()})()">Execute</button>';
              return `<div class="trc-item"><span class="trc-type">${esc(p.target_lane)}</span><span class="trc-title">${esc(p.title)}</span><span class="trc-status">${p.status}</span>${actions ? '<span style="margin-left:auto">' + actions + '</span>' : ''}</div>`;
            }).join('');
            html += '</div>';
          }
          if (full.executions?.length) {
            html += '<div class="aud-section"><div class="aud-section-title">Executions</div>';
            html += full.executions.slice(0, 5).map(e => {
              let actions = '';
              if (e.status === 'executing') actions = '<button class="nop-btn nop-btn-primary" style="font-size:9px;padding:2px 8px" onclick="(async()=>{await fetch(\'/api/release-orchestration/' + e.execution_id + '/verify\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:\'{}\'});location.reload()})()">Verify</button>';
              return `<div class="trc-item"><span class="trc-type">${e.status}</span><span class="trc-title">${esc(e.execution_id.slice(0, 12))}</span>${actions ? '<span style="margin-left:auto">' + actions + '</span>' : ''}</div>`;
            }).join('');
            html += '</div>';
          }
          // Part 49: Rollback controls
          html += '<div class="aud-section"><div class="aud-section-title">Rollback</div>';
          if (full.executions?.filter(e => e.status === 'executing' || e.status === 'verified').length) {
            html += full.executions.filter(e => e.status === 'executing' || e.status === 'verified').map(e =>
              `<div class="trc-item"><span class="trc-type">${e.status}</span><span class="trc-title">${esc(e.execution_id.slice(0, 12))}</span><span style="margin-left:auto"><button class="nop-btn nop-btn-secondary" style="font-size:9px;padding:2px 8px" onclick="gpoAction(this,'/api/rollback-control/plan','POST','releases')">Create Rollback</button></span></div>`
            ).join('');
          } else { html += '<div class="gov-empty">No active executions to rollback</div>'; }
          html += '</div>';
          // Part 35: Collaboration sessions
          fetch('/api/collaboration-runtime').then(r => r.ok ? r.json() : { sessions: [] }).then(collab => {
            if (collab.sessions?.length) {
              html += '<div class="aud-section"><div class="aud-section-title">Collaboration Sessions</div>';
              html += collab.sessions.slice(0, 5).map(s => {
                const statusCls = s.status === 'consensus_reached' ? 'trc-type' : s.status === 'unresolved' ? 'exc-sev' : 'trc-action';
                return `<div class="trc-item"><span class="${statusCls}">${esc(s.status)}</span><span class="trc-title">${esc(s.protocol_type)} (${s.participants.length} agents)</span></div>`;
              }).join('');
              html += '</div>';
            }
            // Part 50: Go-Live Closure + Readiness Reconciliation
            Promise.all([
              fetch('/api/go-live-closure').then(r => r.ok ? r.json() : null).catch(() => null),
              fetch('/api/readiness-reconciliation').then(r => r.ok ? r.json() : null).catch(() => null),
              fetch('/api/release-provider-gating').then(r => r.ok ? r.json() : null).catch(() => null),
            ]).then(([closure, recon, gating]) => {
              if (recon) {
                html += '<div class="aud-section"><div class="aud-section-title">Ship Readiness Reconciliation</div>';
                const decCls = recon.ship_decision === 'go' ? 'trc-type' : recon.ship_decision === 'conditional_go' ? 'trc-action' : 'exc-sev';
                html += '<div class="go-cards">';
                html += `<div class="go-card"><span class="go-card-value">${recon.reconciled_score}%</span><span class="go-card-label">Score</span></div>`;
                html += `<div class="go-card"><span class="go-card-value">${recon.workflow_completion}%</span><span class="go-card-label">Workflows</span></div>`;
                html += `<div class="go-card"><span class="go-card-value">${recon.middleware_coverage}%</span><span class="go-card-label">Middleware</span></div>`;
                html += `<div class="go-card"><span class="go-card-value">${recon.operator_acceptance}%</span><span class="go-card-label">Acceptance</span></div>`;
                html += '</div>';
                html += `<div class="trc-item"><span class="${decCls}">${esc(recon.ship_decision.toUpperCase())}</span><span class="trc-title">Final Ship Decision</span><span class="trc-status">Reconciled from ${recon.stale_contradictions_resolved || 0} resolved signals</span></div>`;
                html += '</div>';
              }
              if (closure) {
                html += '<div class="aud-section"><div class="aud-section-title">Go-Live Closure</div>';
                html += '<div class="go-cards">';
                html += `<div class="go-card"><span class="go-card-value">${closure.closed}</span><span class="go-card-label">Closed</span></div>`;
                html += `<div class="go-card ${closure.partial > 0 ? 'oo-warn' : ''}"><span class="go-card-value">${closure.partial}</span><span class="go-card-label">Partial</span></div>`;
                html += `<div class="go-card ${closure.blocked > 0 ? 'go-alert' : ''}"><span class="go-card-value">${closure.blocked}</span><span class="go-card-label">Blocked</span></div>`;
                html += '</div>';
                const recCls = closure.recommendation === 'go' ? 'trc-type' : closure.recommendation === 'conditional_go' ? 'trc-action' : 'exc-sev';
                html += `<div class="trc-item"><span class="${recCls}">${esc(closure.recommendation.toUpperCase())}</span><span class="trc-title">Closure Recommendation</span></div>`;
                if (closure.blockers?.length) {
                  html += closure.blockers.map(b => {
                    const sCls = b.status === 'closed' ? 'trc-type' : b.status === 'partial' ? 'trc-action' : 'exc-sev';
                    return `<div class="trc-item"><span class="${sCls}">${esc(b.status)}</span><span class="trc-title">${esc(b.name)}</span><span class="trc-status">${esc(b.evidence)}</span></div>`;
                  }).join('');
                }
                html += '</div>';
              }
              if (gating) {
                html += '<div class="aud-section"><div class="aud-section-title">Provider Release Gate</div>';
                const gCls = gating.outcome === 'clear' ? 'trc-type' : gating.outcome === 'warning' ? 'trc-action' : 'exc-sev';
                html += `<div class="trc-item"><span class="${gCls}">${esc(gating.outcome.toUpperCase())}</span><span class="trc-title">${esc(gating.detail)}</span><span class="trc-status">Health: ${esc(gating.provider_health)} | Incidents: ${gating.incidents}</span></div>`;
                html += '</div>';
              }
              // Part 52: Final Ship Decision panel
              Promise.all([
                fetch('/api/final-ship-decision').then(r => r.ok ? r.json() : null).catch(() => null),
                fetch('/api/final-blockers').then(r => r.ok ? r.json() : null).catch(() => null),
                fetch('/api/http-middleware-validation').then(r => r.ok ? r.json() : null).catch(() => null),
                fetch('/api/final-workflow-closure').then(r => r.ok ? r.json() : null).catch(() => null),
                fetch('/api/redaction-behavior').then(r => r.ok ? r.json() : null).catch(() => null),
              ]).then(([shipDecision, blockerRecon, httpValid, wfClosure, redaction]) => {
                if (shipDecision) {
                  var dCls = shipDecision.decision === 'go' ? 'trc-type' : shipDecision.decision === 'conditional_go' ? 'trc-action' : 'exc-sev';
                  html += '<div class="aud-section"><div class="aud-section-title">Final Ship Decision</div>';
                  html += '<div class="go-cards">';
                  html += '<div class="go-card"><span class="go-card-value ' + dCls + '">' + esc(shipDecision.decision.toUpperCase().replace('_', ' ')) + '</span><span class="go-card-label">Decision</span></div>';
                  html += '<div class="go-card"><span class="go-card-value">' + shipDecision.overall_score + '%</span><span class="go-card-label">Score</span></div>';
                  html += '</div>';
                  if (shipDecision.evidence?.length) {
                    html += shipDecision.evidence.map(function(e) {
                      var eCls = e.status === 'pass' ? 'trc-type' : e.status === 'conditional' ? 'trc-action' : 'exc-sev';
                      return '<div class="trc-item"><span class="' + eCls + '">' + esc(e.status) + '</span><span class="trc-title">' + esc(e.dimension) + '</span><span class="trc-status">' + e.score + '/' + e.max + ' — ' + esc(e.detail) + '</span></div>';
                    }).join('');
                  }
                  if (shipDecision.remaining_gaps?.length) {
                    html += '<div style="margin-top:6px;font-size:10px;color:var(--red)">Gaps: ' + shipDecision.remaining_gaps.map(function(g) { return esc(g); }).join(', ') + '</div>';
                  }
                  html += '<div style="margin-top:6px;display:flex;gap:6px">';
                  html += '<button class="nop-btn nop-btn-primary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/http-middleware-validation/run\',\'POST\',\'releases\')">Run HTTP Validation</button>';
                  html += '<button class="nop-btn nop-btn-secondary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/final-ship-decision/recompute\',\'POST\',\'releases\')">Recompute Decision</button>';
                  html += '</div></div>';
                }
                if (blockerRecon) {
                  html += '<div class="aud-section"><div class="aud-section-title">Final Blocker Reconciliation — ' + blockerRecon.closed + '/' + blockerRecon.total + ' closed</div>';
                  if (blockerRecon.blockers?.length) {
                    html += blockerRecon.blockers.map(function(b) {
                      var bCls = b.status === 'closed' ? 'trc-type' : b.status === 'partially_closed' ? 'trc-action' : 'exc-sev';
                      return '<div class="trc-item"><span class="' + bCls + '">' + esc(b.status) + '</span><span class="trc-title">' + esc(b.name) + '</span><span class="trc-status">' + esc(b.evidence) + '</span></div>';
                    }).join('');
                  }
                  if (blockerRecon.stale_contradictions_resolved > 0) {
                    html += '<div style="font-size:10px;color:var(--green);margin-top:4px">' + blockerRecon.stale_contradictions_resolved + ' stale contradiction(s) resolved</div>';
                  }
                  html += '</div>';
                }
                if (httpValid) {
                  html += '<div class="aud-section"><div class="aud-section-title">HTTP Middleware Validation — ' + httpValid.passed + '/' + httpValid.total + ' passed</div>';
                  if (httpValid.results?.length) {
                    html += httpValid.results.map(function(r) {
                      var rCls = r.passed ? 'trc-type' : 'exc-sev';
                      return '<div class="trc-item"><span class="' + rCls + '">' + (r.passed ? 'PASS' : 'FAIL') + '</span><span class="trc-title">' + esc(r.case_name) + '</span><span class="trc-status">' + r.expected_effect + '→' + r.actual_effect + ' | ' + esc(r.route) + '</span></div>';
                    }).join('');
                  }
                  html += '</div>';
                }
                if (redaction?.records?.length) {
                  html += '<div class="aud-section"><div class="aud-section-title">Redaction vs Deny Behavior</div>';
                  html += redaction.records.slice(0, 5).map(function(r) {
                    var rCls = r.correct ? 'trc-type' : 'exc-sev';
                    return '<div class="trc-item"><span class="' + rCls + '">' + (r.correct ? 'CORRECT' : 'MISMATCH') + '</span><span class="trc-title">' + esc(r.artifact_type) + ': ' + esc(r.policy_outcome) + '→' + esc(r.actual_outcome) + '</span><span class="trc-status">' + esc(r.source_scope) + '→' + esc(r.target_scope) + '</span></div>';
                  }).join('');
                  html += '</div>';
                }
                if (wfClosure) {
                  html += '<div class="aud-section"><div class="aud-section-title">Final Workflow Closure — ' + wfClosure.usable + '/' + wfClosure.total + ' usable</div>';
                  if (wfClosure.workflows?.length) {
                    var partial = wfClosure.workflows.filter(function(w) { return w.status !== 'usable'; });
                    if (partial.length > 0) {
                      html += partial.map(function(w) {
                        return '<div class="trc-item"><span class="exc-sev">' + esc(w.status) + '</span><span class="trc-title">' + esc(w.name) + '</span><span class="trc-status">' + esc(w.detail) + '</span></div>';
                      }).join('');
                    } else {
                      html += '<div class="trc-item"><span class="trc-type">ALL USABLE</span><span class="trc-title">' + wfClosure.total + '/' + wfClosure.total + ' workflows fully usable</span></div>';
                    }
                  }
                  html += '</div>';
                }
                // Part 53: Final Go Verification panel
                Promise.all([
                  fetch('/api/final-go-verification').then(r => r.ok ? r.json() : null).catch(() => null),
                  fetch('/api/network-http-validation').then(r => r.ok ? r.json() : null).catch(() => null),
                  fetch('/api/reliability-closure').then(r => r.ok ? r.json() : null).catch(() => null),
                  fetch('/api/clean-state-verification').then(r => r.ok ? r.json() : null).catch(() => null),
                ]).then(function(arr) {
                  var goVerify = arr[0], netVal = arr[1], relClose = arr[2], cleanSt = arr[3];
                  if (goVerify && goVerify.production_decision) {
                    var pd = goVerify.production_decision;
                    var pdCls = pd.decision === 'go' ? 'trc-type' : pd.decision === 'conditional_go' ? 'trc-action' : 'exc-sev';
                    html += '<div class="aud-section"><div class="aud-section-title">Final Go Verification</div>';
                    html += '<div class="go-cards">';
                    html += '<div class="go-card"><span class="go-card-value ' + pdCls + '">' + esc(pd.decision.toUpperCase().replace(/_/g, ' ')) + '</span><span class="go-card-label">Production Decision</span></div>';
                    html += '<div class="go-card"><span class="go-card-value">' + pd.overall_score + '%</span><span class="go-card-label">Gate Score</span></div>';
                    html += '</div>';
                    if (pd.gates?.length) {
                      html += pd.gates.map(function(g) {
                        var gCls = g.passed ? 'trc-type' : 'exc-sev';
                        return '<div class="trc-item"><span class="' + gCls + '">' + (g.passed ? 'PASS' : 'FAIL') + '</span><span class="trc-title">' + esc(g.name) + '</span><span class="trc-status">' + esc(g.detail) + '</span></div>';
                      }).join('');
                    }
                    if (pd.confidence?.length) {
                      html += '<div style="margin-top:6px;font-size:10px;color:var(--text-faint)">';
                      html += pd.confidence.map(function(c) { return c.dimension + ': ' + c.level; }).join(' | ');
                      html += '</div>';
                    }
                    if (pd.remaining_gaps?.length) {
                      html += '<div style="margin-top:4px;font-size:10px;color:var(--red)">Gaps: ' + pd.remaining_gaps.map(function(g) { return esc(g); }).join(', ') + '</div>';
                    }
                    html += '<div style="margin-top:6px;display:flex;gap:6px">';
                    html += '<button class="nop-btn nop-btn-primary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/network-http-validation/run\',\'POST\',\'releases\')">Run Network Validation</button>';
                    html += '<button class="nop-btn nop-btn-secondary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/final-go-verification/recompute\',\'POST\',\'releases\')">Recompute Go</button>';
                    html += '<button class="nop-btn nop-btn-secondary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/clean-state-verification/clear\',\'POST\',\'releases\')">Clear Stale State</button>';
                    html += '</div></div>';
                  }
                  if (netVal && netVal.results) {
                    html += '<div class="aud-section"><div class="aud-section-title">Network HTTP Validation — ' + netVal.passed + '/' + netVal.total + ' (' + netVal.network_validated + ' network, ' + netVal.function_fallback + ' fallback)</div>';
                    html += '<div style="font-size:10px;color:var(--text-faint);margin-bottom:4px">Server: ' + (netVal.harness_state?.server_reachable ? 'reachable (' + netVal.harness_state.latency_ms + 'ms)' : 'not reachable — function fallback') + '</div>';
                    html += netVal.results.map(function(r) {
                      var rCls = r.passed ? 'trc-type' : 'exc-sev';
                      return '<div class="trc-item"><span class="' + rCls + '">' + (r.passed ? 'PASS' : 'FAIL') + '</span><span class="trc-title">' + esc(r.case_name) + '</span><span class="trc-status">[' + r.validation_level + '] ' + r.expected_effect + '→' + r.actual_effect + '</span></div>';
                    }).join('');
                    html += '</div>';
                  }
                  if (relClose) {
                    html += '<div class="aud-section"><div class="aud-section-title">Reliability Closure — ' + relClose.closure_score + '% (' + relClose.proxy_only + ' proxy-only)</div>';
                    html += '<div class="go-cards">';
                    html += '<div class="go-card"><span class="go-card-value">' + relClose.fully_measured + '</span><span class="go-card-label">Measured</span></div>';
                    html += '<div class="go-card ' + (relClose.partially_measured > 0 ? 'oo-warn' : '') + '"><span class="go-card-value">' + relClose.partially_measured + '</span><span class="go-card-label">Partial</span></div>';
                    html += '<div class="go-card ' + (relClose.proxy_only > 0 ? 'go-alert' : '') + '"><span class="go-card-value">' + relClose.proxy_only + '</span><span class="go-card-label">Proxy Only</span></div>';
                    html += '</div></div>';
                  }
                  if (cleanSt) {
                    var csCls = cleanSt.clean ? 'trc-type' : 'exc-sev';
                    html += '<div class="aud-section"><div class="aud-section-title">Clean State Verification</div>';
                    html += '<div class="trc-item"><span class="' + csCls + '">' + (cleanSt.clean ? 'CLEAN' : 'STALE') + '</span><span class="trc-title">' + cleanSt.state_files_checked + ' files checked</span><span class="trc-status">' + esc(cleanSt.detail) + '</span></div>';
                    html += '</div>';
                  }
                  // Part 54: Production Authorization panel
                  Promise.all([
                    fetch('/api/go-authorization').then(r => r.ok ? r.json() : null).catch(() => null),
                    fetch('/api/live-server-proof').then(r => r.ok ? r.json() : null).catch(() => null),
                    fetch('/api/validation-harness').then(r => r.ok ? r.json() : null).catch(() => null),
                  ]).then(function(arr2) {
                    var goAuth = arr2[0], liveProof = arr2[1], harness = arr2[2];
                    if (goAuth) {
                      var aCls = goAuth.decision === 'go' ? 'trc-type' : goAuth.decision === 'conditional_go' ? 'trc-action' : 'exc-sev';
                      html += '<div class="aud-section"><div class="aud-section-title">Production Go Authorization</div>';
                      html += '<div class="go-cards">';
                      html += '<div class="go-card"><span class="go-card-value ' + aCls + '">' + esc(goAuth.decision.toUpperCase().replace(/_/g, ' ')) + '</span><span class="go-card-label">Authorization</span></div>';
                      html += '<div class="go-card"><span class="go-card-value">' + goAuth.overall_score + '%</span><span class="go-card-label">Gates</span></div>';
                      html += '<div class="go-card"><span class="go-card-value">' + esc(goAuth.confidence?.overall || 'unknown') + '</span><span class="go-card-label">Confidence</span></div>';
                      html += '</div>';
                      if (goAuth.gates?.length) {
                        html += goAuth.gates.map(function(g) {
                          var gCls = g.passed ? 'trc-type' : 'exc-sev';
                          var lvl = g.proof_level === 'live_network' ? '🔒' : g.proof_level === 'function_only' ? '⚠️' : '❌';
                          return '<div class="trc-item"><span class="' + gCls + '">' + (g.passed ? 'PASS' : 'FAIL') + '</span><span class="trc-title">' + lvl + ' ' + esc(g.name) + '</span><span class="trc-status">' + esc(g.detail) + '</span></div>';
                        }).join('');
                      }
                      if (goAuth.proof_gaps?.length) {
                        html += '<div style="margin-top:4px;font-size:10px;color:var(--red)">Proof gaps: ' + goAuth.proof_gaps.map(function(g) { return esc(g.area) + ' (' + esc(g.gap_type) + ')'; }).join(', ') + '</div>';
                      }
                      html += '<div style="margin-top:6px;display:flex;gap:6px">';
                      html += '<button class="nop-btn nop-btn-primary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/live-server-proof/run\',\'POST\',\'releases\')">Run Live Proof</button>';
                      html += '<button class="nop-btn nop-btn-secondary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/validation-harness/run\',\'POST\',\'releases\')">Run Full Harness</button>';
                      html += '<button class="nop-btn nop-btn-secondary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/go-authorization/recompute\',\'POST\',\'releases\')">Recompute Auth</button>';
                      html += '</div></div>';
                    }
                    if (liveProof && liveProof.results) {
                      html += '<div class="aud-section"><div class="aud-section-title">Live Server Proof — ' + liveProof.passed + '/' + liveProof.total + ' (' + liveProof.live_proven + ' live, ' + liveProof.function_only + ' fallback)</div>';
                      html += '<div style="font-size:10px;color:var(--text-faint);margin-bottom:4px">Server: ' + (liveProof.environment?.server_running ? 'running (' + liveProof.environment.latency_ms + 'ms)' : 'not running — function fallback') + ' | Proof complete: ' + (liveProof.proof_complete ? 'YES' : 'NO') + '</div>';
                      html += liveProof.results.map(function(r) {
                        var rCls = r.passed ? 'trc-type' : 'exc-sev';
                        var lvl = r.proof_level === 'live_network' ? '[NET]' : '[FN]';
                        return '<div class="trc-item"><span class="' + rCls + '">' + (r.passed ? 'PASS' : 'FAIL') + '</span><span class="trc-title">' + lvl + ' ' + esc(r.case_name) + '</span><span class="trc-status">' + r.expected_effect + '→' + r.middleware_effect + (r.http_status > 0 ? ' HTTP:' + r.http_status : '') + '</span></div>';
                      }).join('');
                      html += '</div>';
                    }
                    if (harness && harness.phases) {
                      html += '<div class="aud-section"><div class="aud-section-title">Validation Harness</div>';
                      html += '<div style="font-size:10px;color:var(--text-faint);margin-bottom:4px">Mode: ' + (harness.environment?.validation_mode || 'unknown') + '</div>';
                      html += harness.phases.map(function(p) {
                        var pCls = p.status === 'passed' ? 'trc-type' : p.status === 'skipped' ? 'trc-action' : 'exc-sev';
                        return '<div class="trc-item"><span class="' + pCls + '">' + esc(p.status) + '</span><span class="trc-title">' + esc(p.phase) + '</span><span class="trc-status">' + esc(p.detail) + '</span></div>';
                      }).join('');
                      html += '</div>';
                    }
                    // Part 55: Unconditional Go panel
                    Promise.all([
                      fetch('/api/unconditional-go-report').then(r => r.ok ? r.json() : null).catch(() => null),
                      fetch('/api/final-go-proof').then(r => r.ok ? r.json() : null).catch(() => null),
                      fetch('/api/route-middleware/coverage').then(r => r.ok ? r.json() : null).catch(() => null),
                    ]).then(function(arr3) {
                      var ugo = arr3[0], routeProof = arr3[1], routeCov = arr3[2];
                      if (ugo) {
                        var uCls = ugo.decision === 'unconditional_go' ? 'trc-type' : ugo.decision === 'conditional_go' ? 'trc-action' : 'exc-sev';
                        html += '<div class="aud-section"><div class="aud-section-title">Unconditional Go Report</div>';
                        html += '<div class="go-cards">';
                        html += '<div class="go-card"><span class="go-card-value ' + uCls + '">' + esc(ugo.decision.toUpperCase().replace(/_/g, ' ')) + '</span><span class="go-card-label">Decision</span></div>';
                        html += '<div class="go-card"><span class="go-card-value">' + ugo.overall_score + '%</span><span class="go-card-label">Route Score</span></div>';
                        html += '<div class="go-card"><span class="go-card-value">' + esc(ugo.confidence?.level || 'unknown') + '</span><span class="go-card-label">Confidence</span></div>';
                        html += '</div>';
                        if (ugo.proof_blockers?.length) {
                          html += '<div style="margin-top:4px;font-size:10px;color:var(--red)">Blockers: ' + ugo.proof_blockers.map(function(b) { return esc(b.area) + ': ' + esc(b.detail); }).join('; ') + '</div>';
                        }
                        html += '<div style="margin-top:6px"><button class="nop-btn nop-btn-primary" style="font-size:10px;padding:4px 12px" onclick="gpoAction(this,\'/api/final-go-proof/run\',\'POST\',\'releases\')">Run Route Proof</button></div>';
                        html += '</div>';
                      }
                      if (routeProof && routeProof.results) {
                        html += '<div class="aud-section"><div class="aud-section-title">Route-Level Proof — ' + routeProof.route_proven + '/' + routeProof.total + ' proven (server: ' + (routeProof.server_running ? 'running' : 'not running') + ')</div>';
                        html += routeProof.results.map(function(r) {
                          var rCls = r.proof_level === 'route_proven' ? 'trc-type' : 'exc-sev';
                          return '<div class="trc-item"><span class="' + rCls + '">' + esc(r.proof_level) + '</span><span class="trc-title">' + esc(r.case_name) + '</span><span class="trc-status">expect:' + r.expected_effect + ' actual:' + r.actual_effect + ' HTTP:' + r.actual_status + '</span></div>';
                        }).join('');
                        html += '</div>';
                      }
                      if (routeCov) {
                        html += '<div class="aud-section"><div class="aud-section-title">Route Middleware Coverage — ' + routeCov.coverage_percent + '% (' + routeCov.total_enforced + '/' + routeCov.total_protected + ')</div>';
                        if (routeCov.bindings?.length) {
                          html += routeCov.bindings.map(function(b) {
                            return '<div class="trc-item"><span class="' + (b.enforced ? 'trc-type' : 'exc-sev') + '">' + (b.enforced ? 'ENFORCED' : 'NOT') + '</span><span class="trc-title">' + esc(b.route) + '</span><span class="trc-status">' + esc(b.guard_type) + '</span></div>';
                          }).join('');
                        }
                        html += '</div>';
                      }
                      slot.innerHTML = html;
                    }).catch(function() { slot.innerHTML = html; });
                  }).catch(function() { slot.innerHTML = html; });
                }).catch(function() { slot.innerHTML = html; });
              }).catch(function() { slot.innerHTML = html; });
            }).catch(() => { slot.innerHTML = html; });
          }).catch(() => { slot.innerHTML = html; });
        }).catch(() => { slot.innerHTML = html; });
      }).catch(() => {});
    }
    // Part 63: Deliverables panel in releases tab
    if (tab === 'releases') {
      Promise.all([
        fetch('/api/deliverables').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/deliverable-approvals').then(r => r.ok ? r.json() : null).catch(() => null),
      ]).then(function(arr) {
        var storeIdx = arr[0], approvals = arr[1];
        var dp = document.getElementById('deliverablesPanel');
        if (!dp) return;
        var html = '';
        if (storeIdx && storeIdx.entries) {
          var ids = Object.keys(storeIdx.entries);
          html += '<div class="aud-section"><div class="aud-section-title">Deliverables Store — ' + ids.length + ' deliverables, ' + storeIdx.totalVersions + ' versions</div>';
          if (ids.length > 0) {
            html += ids.slice(0, 10).map(function(id) {
              var e = storeIdx.entries[id];
              var sCls = e.status === 'approved' ? 'trc-type' : e.status === 'proposed' ? 'trc-action' : e.status === 'rejected' ? 'exc-sev' : 'trc-status';
              return '<div class="trc-item"><span class="' + sCls + '">' + esc(e.status) + '</span><span class="trc-title">' + esc(id.slice(0, 40)) + '</span><span class="trc-status">v' + e.latestVersion + (e.approvedVersion ? ' (approved: v' + e.approvedVersion + ')' : '') + '</span>' +
                '<span class="structured-badge-slot" data-dlv-id="' + esc(id) + '"></span>' +
                '<button class="nop-btn nop-btn-secondary" style="font-size:9px;padding:2px 6px;margin-left:4px" onclick="gpoToggleStructuredView(this,\'' + esc(id) + '\')">Raw/Parsed</button>' +
                '</div><div class="structured-view-slot" id="sv-' + esc(id.replace(/[^a-zA-Z0-9_-]/g,'_')) + '" style="display:none"></div>';
            }).join('');
          } else {
            html += '<div class="gov-empty">No deliverables in store yet</div>';
          }
          html += '</div>';
        }
        if (approvals && approvals.requests && approvals.requests.length) {
          html += '<div class="aud-section"><div class="aud-section-title">Deliverable Approvals</div>';
          html += approvals.requests.slice(0, 5).map(function(r) {
            var rCls = r.status === 'approved' ? 'trc-type' : r.status === 'rejected' ? 'exc-sev' : 'trc-action';
            return '<div class="trc-item"><span class="' + rCls + '">' + esc(r.status) + '</span><span class="trc-title">' + esc(r.deliverable_id.slice(0, 30)) + ' v' + r.version + '</span>' +
              (r.status === 'pending' ? '<span style="margin-left:auto;display:flex;gap:4px"><button class="nop-btn nop-btn-primary" style="font-size:9px;padding:2px 8px" onclick="gpoAction(this,\'/api/deliverables/' + esc(r.deliverable_id) + '/approve\',\'POST\',\'releases\')">Approve</button><button class="nop-btn nop-btn-secondary" style="font-size:9px;padding:2px 8px" onclick="gpoAction(this,\'/api/deliverables/' + esc(r.deliverable_id) + '/reject\',\'POST\',\'releases\')">Reject</button></span>' : '') +
              '</div>';
          }).join('');
          html += '</div>';
        }
        dp.innerHTML = html;
      });
    }
    if (tab === 'admin') {
      Promise.all([
        fetch('/api/tenant-admin').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/subscription-operations').then(r => r.ok ? r.json() : null).catch(() => null),
      ]).then(([tenantData, subData]) => {
        const ap = document.getElementById('adminPanel');
        if (!ap) return;
        let html = '';
        if (tenantData?.tenants?.length) {
          html += '<div class="aud-section"><div class="aud-section-title">Tenants</div>';
          html += tenantData.tenants.map(t => `<div class="trc-item"><span class="trc-type">${esc(t.plan)}</span><span class="trc-title">${esc(t.name)}</span><span class="trc-status">${t.enabled_engines.length} engines | ${t.enabled_modules.length} modules</span></div>`).join('');
          html += '</div>';
        }
        if (subData?.entitlements?.length) {
          html += '<div class="aud-section"><div class="aud-section-title">Entitlements</div>';
          html += subData.entitlements.map(e => `<div class="trc-item"><span class="trc-title">${esc(e.feature)}</span><span class="${e.entitled ? 'trc-type' : 'exc-sev'}">${e.entitled ? 'Entitled' : 'Not entitled'}</span></div>`).join('');
          html += '</div>';
        }
        ap.innerHTML = html;
      });
      // Deployment readiness
      fetch('/api/deployment-readiness/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' }).then(r => r.ok ? r.json() : null).then(data => {
        const dp = document.getElementById('deploymentReadinessPanel');
        if (!dp || !data?.report) return;
        const r = data.report;
        let html = `<div class="readiness-card ${r.overall_score >= 75 ? 'rdy-ready' : r.overall_score >= 50 ? 'rdy-conditional' : 'rdy-not-ready'}">
          <div class="rdy-header"><span class="rdy-label">Deployment Readiness</span><span class="rdy-score">${r.overall_score}%</span></div>
          <div class="rdy-categories">`;
        for (const d of r.dimensions) {
          const pct = d.max_score > 0 ? Math.round((d.score / d.max_score) * 100) : 0;
          html += `<div class="rdy-cat"><span class="rdy-cat-name">${esc(d.dimension.replace(/_/g, ' '))}</span><span class="rdy-cat-bar"><span class="rdy-cat-fill" style="width:${pct}%"></span></span><span class="rdy-cat-score">${d.score}/${d.max_score}</span></div>`;
        }
        html += '</div>';
        if (r.blockers.length) html += '<div class="rdy-blockers">' + r.blockers.map(b => '<div class="rdy-blocker">' + esc(b) + '</div>').join('') + '</div>';
        if (r.warnings.length) html += '<div class="rdy-warnings">' + r.warnings.map(w => '<div class="rdy-warning">' + esc(w) + '</div>').join('') + '</div>';
        if (r.recommended_fixes.length) html += '<div class="aud-section"><div class="aud-section-title">Recommended Fixes</div>' + r.recommended_fixes.map(f => '<div class="trc-item"><span class="trc-title">' + esc(f) + '</span></div>').join('') + '</div>';
        html += '</div>';
        dp.innerHTML = html;
      }).catch(() => {});
      // Part 37: Security posture + checklist
      Promise.all([
        fetch('/api/security-posture').then(r => r.ok ? r.json() : null).catch(() => null),
        fetch('/api/hardening-checklist').then(r => r.ok ? r.json() : null).catch(() => null),
      ]).then(([postureData, checkData]) => {
        const sp = document.getElementById('securityPanel');
        if (!sp) return;
        let html = '';
        if (postureData?.posture) {
          const p = postureData.posture;
          const cls = { strong: 'rdy-ready', acceptable: 'rdy-conditional', weak: 'rdy-not-ready', critical: 'rdy-not-ready' };
          html += `<div class="readiness-card ${cls[p.overall] || ''}"><div class="rdy-header"><span class="rdy-label">Security Posture</span><span class="rdy-rec">${p.overall}</span></div>`;
          html += `<div class="gh-stats"><span>Controls: ${p.controls?.length || 0}</span><span>Findings: ${p.findings?.length || 0}</span><span>Secrets: ${p.secret_health?.total || 0} (${p.secret_health?.expired || 0} expired)</span><span>Violations: ${p.boundary_health?.violations || 0}</span></div>`;
          if (p.findings?.length) {
            html += '<div class="aud-section" style="margin-top:8px"><div class="aud-section-title">Findings</div>';
            html += p.findings.map(f => `<div class="exc-case exc-${f.severity === 'blocker' || f.severity === 'high' ? 'high' : f.severity}"><span class="exc-sev">${f.severity}</span><span class="exc-case-title">${esc(f.title)}</span></div>`).join('');
            html += '</div>';
          }
          html += '</div>';
        }
        if (checkData?.checklist?.length) {
          const done = checkData.checklist.filter(c => c.completed).length;
          html += `<div class="aud-section"><div class="aud-section-title">Hardening Checklist (${done}/${checkData.checklist.length})</div>`;
          html += checkData.checklist.map(c => `<div class="trc-item"><span class="${c.completed ? 'trc-type' : 'exc-sev'}">${c.completed ? '✓' : '✗'}</span><span class="trc-title">${esc(c.title)}</span></div>`).join('');
          html += '</div>';
        }
        sp.innerHTML = html;
      });
      // Part 38: Service health + SLO
      fetch('/api/service-health').then(r => r.ok ? r.json() : null).then(health => {
        if (!health) return;
        const sp = document.getElementById('securityPanel');
        if (!sp) return;
        const cls = { healthy: 'rdy-ready', degraded: 'rdy-conditional', critical: 'rdy-not-ready' };
        let html = `<div class="readiness-card ${cls[health.overall] || ''}" style="margin-top:10px"><div class="rdy-header"><span class="rdy-label">Service Health</span><span class="rdy-rec">${health.overall}</span></div>`;
        html += `<div class="gh-stats"><span>Incidents: ${health.active_incidents}</span><span>SLO Breaches: ${health.active_alerts}</span></div>`;
        if (health.subsystems?.length) {
          html += '<div class="aud-section" style="margin-top:6px"><div class="aud-section-title">Subsystems</div>';
          html += health.subsystems.map(s => `<div class="prov-gov-row ${s.status === 'watch' ? 'pgh-watch' : s.status === 'degraded' ? 'pgh-degraded' : s.status === 'critical' ? 'pgh-unstable' : ''}"><span class="pgr-name">${esc(s.subsystem.replace(/_/g, ' '))}</span><span class="pgr-health">${s.status}</span><span class="pgr-cost">${s.success_rate}%</span></div>`).join('');
          html += '</div>';
        }
        if (health.slo_statuses?.length) {
          html += '<div class="aud-section"><div class="aud-section-title">SLO Status</div>';
          html += health.slo_statuses.map(s => `<div class="trc-item"><span class="${s.met ? 'trc-type' : 'exc-sev'}">${s.met ? '✓' : '✗'}</span><span class="trc-title">${esc(s.name)}</span><span class="trc-status">${s.current}/${s.target} ${s.unit}</span></div>`).join('');
          html += '</div>';
        }
        html += '</div>';
        sp.insertAdjacentHTML('beforeend', html);
      }).catch(() => {});
      // Part 41: Wire productization surfaces into admin tab
      Promise.all([
        fetch('/api/skill-packs').then(r => r.ok ? r.json() : { packs: [] }).catch(() => ({ packs: [] })),
        fetch('/api/engine-templates').then(r => r.ok ? r.json() : { templates: [] }).catch(() => ({ templates: [] })),
        fetch('/api/marketplace').then(r => r.ok ? r.json() : { listings: [] }).catch(() => ({ listings: [] })),
        fetch('/api/extensions').then(r => r.ok ? r.json() : { packages: [] }).catch(() => ({ packages: [] })),
        fetch('/api/integrations').then(r => r.ok ? r.json() : { integrations: [] }).catch(() => ({ integrations: [] })),
      ]).then(([spData, etData, mpData, extData, intData]) => {
        const sp = document.getElementById('securityPanel');
        if (!sp) return;
        let html = '';
        // Skill Packs — Part 49: with bind action
        html += '<div class="aud-section"><div class="aud-section-title">Skill Packs (' + (spData.packs?.length || 0) + ')</div>';
        if (spData.packs?.length) {
          html += spData.packs.map(p => '<div class="trc-item"><span class="trc-type">' + esc(p.state || 'draft') + '</span><span class="trc-title">' + esc(p.name) + ' v' + p.version + '</span><span class="trc-status">' + (p.capabilities?.length || 0) + ' caps</span><span style="margin-left:auto"><button class="nop-btn nop-btn-secondary" style="font-size:9px;padding:2px 8px" onclick="gpoAction(this,\'/api/skill-packs/' + p.pack_id + '/bind\',\'POST\',\'admin\')">Bind</button></span></div>').join('');
        } else { html += '<div class="gov-empty">No skill packs created yet</div>'; }
        html += '</div>';
        // Engine Templates — Part 49: with instantiate action
        html += '<div class="aud-section"><div class="aud-section-title">Engine Templates (' + (etData.templates?.length || 0) + ')</div>';
        if (etData.templates?.length) {
          html += etData.templates.map(t => '<div class="trc-item"><span class="trc-type">' + esc(t.domain_type) + '</span><span class="trc-title">' + esc(t.name) + '</span><span style="margin-left:auto"><button class="nop-btn nop-btn-secondary" style="font-size:9px;padding:2px 8px" onclick="gpoAction(this,\'/api/engine-templates/' + t.template_id + '/instantiate\',\'POST\',\'admin\')">Instantiate</button></span></div>').join('');
        } else { html += '<div class="gov-empty">No templates</div>'; }
        html += '</div>';
        // Marketplace
        html += '<div class="aud-section"><div class="aud-section-title">Marketplace (' + (mpData.listings?.length || 0) + ')</div>';
        if (mpData.listings?.length) {
          html += mpData.listings.map(l => '<div class="trc-item"><span class="trc-type">' + esc(l.status) + '</span><span class="trc-title">' + esc(l.name) + '</span><span class="trc-status">' + l.asset_type + '</span></div>').join('');
        } else { html += '<div class="gov-empty">No marketplace listings</div>'; }
        html += '</div>';
        // Extensions — Part 49: with install/uninstall action
        html += '<div class="aud-section"><div class="aud-section-title">Extensions (' + (extData.packages?.length || 0) + ')</div>';
        if (extData.packages?.length) {
          html += extData.packages.map(e => {
            const action = e.state === 'installed'
              ? '<button class="nop-btn nop-btn-secondary" style="font-size:9px;padding:2px 8px" onclick="gpoAction(this,\'/api/extensions/' + e.extension_id + '/uninstall\',\'POST\',\'admin\')">Uninstall</button>'
              : '<button class="nop-btn nop-btn-primary" style="font-size:9px;padding:2px 8px" onclick="gpoAction(this,\'/api/extensions/' + e.extension_id + '/install\',\'POST\',\'admin\')">Install</button>';
            return '<div class="trc-item"><span class="trc-type">' + esc(e.trust_level) + '</span><span class="trc-title">' + esc(e.name) + ' v' + e.version + '</span><span class="trc-status">' + e.state + '</span><span style="margin-left:auto">' + action + '</span></div>';
          }).join('');
        } else { html += '<div class="gov-empty">No extensions installed</div>'; }
        html += '</div>';
        // Integrations
        html += '<div class="aud-section"><div class="aud-section-title">Integrations (' + (intData.integrations?.length || 0) + ')</div>';
        if (intData.integrations?.length) {
          html += intData.integrations.map(i => '<div class="trc-item"><span class="${i.enabled ? \'trc-type\' : \'exc-sev\'}">' + (i.enabled ? '✓' : '✗') + '</span><span class="trc-title">' + esc(i.name) + '</span><span class="trc-status">' + esc(i.category) + ' | ' + i.trust_level + '</span></div>').join('');
        } else { html += '<div class="gov-empty">No integrations configured</div>'; }
        html += '</div>';
        sp.insertAdjacentHTML('beforeend', html);
      });
    }
  };
}

// ═══════════════════════════════════════════
// GPO ACTION HELPER — Loading + Error + Success + Targeted Refresh
// ═══════════════════════════════════════════

window.gpoAction = async function(btn, url, method, refreshTab) {
  if (!btn) return;
  const origText = btn.textContent;
  btn.disabled = true;
  btn.textContent = '...';
  btn.classList.add('nop-btn-loading');
  try {
    const res = await fetch(url, { method: method || 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' });
    if (res.ok) {
      btn.textContent = '✓';
      btn.classList.remove('nop-btn-loading');
      btn.classList.add('nop-btn-success');
      // Targeted refresh: re-trigger the tab load instead of full page reload
      setTimeout(() => {
        if (refreshTab && typeof switchTab === 'function') {
          switchTab(refreshTab);
        }
      }, 500);
    } else {
      const data = await res.json().catch(() => ({ error: 'Unknown error' }));
      btn.textContent = '✗';
      btn.classList.remove('nop-btn-loading');
      btn.classList.add('nop-btn-error');
      btn.title = data.error || 'Action failed';
      setTimeout(() => { btn.textContent = origText; btn.disabled = false; btn.classList.remove('nop-btn-error'); }, 3000);
    }
  } catch (err) {
    btn.textContent = '✗';
    btn.classList.remove('nop-btn-loading');
    btn.classList.add('nop-btn-error');
    setTimeout(() => { btn.textContent = origText; btn.disabled = false; btn.classList.remove('nop-btn-error'); }, 3000);
  }
};

// Re-render needs-operator when approvals change
const _origLoadPendingApprovals = typeof loadPendingApprovals === 'function' ? loadPendingApprovals : null;
if (_origLoadPendingApprovals) {
  window.loadPendingApprovals = async function() {
    await _origLoadPendingApprovals();
    renderNeedsOperator();
  };
}

// Initial render
setTimeout(() => {
  renderNeedsOperator();
  renderMissionTemplates();
  renderEnhancedMissionSnapshot();
  // Load Chief of Staff on home
  refreshChiefOfStaff();
}, 500);

// Part 67: Structured output badge + Raw/Parsed toggle
window.gpoToggleStructuredView = function(btn, dlvId) {
  var slotId = 'sv-' + dlvId.replace(/[^a-zA-Z0-9_-]/g, '_');
  var slot = document.getElementById(slotId);
  if (!slot) return;
  if (slot.style.display !== 'none') { slot.style.display = 'none'; return; }
  slot.style.display = 'block';
  slot.innerHTML = '<div class="gov-empty">Loading structured view...</div>';
  fetch('/api/deliverables/' + encodeURIComponent(dlvId) + '/structured')
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data || data.error) {
        slot.innerHTML = '<div class="gov-empty">No structured extraction available</div>';
        return;
      }
      var html = '<div class="aud-section" style="margin:4px 0 8px 24px;padding:8px;background:var(--bg-secondary,#1a1a2e);border-radius:6px;font-size:11px">';
      html += '<div style="display:flex;gap:8px;margin-bottom:4px"><span class="trc-type">Structured</span>';
      html += '<span class="trc-status">Mode: ' + esc(data.extraction?.usedMode || '?') + '</span>';
      html += '<span class="trc-status">' + (data.extraction?.ok ? 'Parse OK' : 'Parse Failed') + '</span>';
      if (data.extraction?.durationMs) html += '<span class="trc-status">' + data.extraction.durationMs + 'ms</span>';
      html += '</div>';
      if (data.extraction?.valueKeys?.length) {
        html += '<div style="margin-top:4px"><strong>Fields:</strong> ' + data.extraction.valueKeys.join(', ') + '</div>';
      }
      if (data.mapping) {
        if (data.mapping.updatedFields?.length) html += '<div style="color:var(--accent-green,#4ade80)">Updated: ' + data.mapping.updatedFields.join(', ') + '</div>';
        if (data.mapping.rejectedFields?.length) html += '<div style="color:var(--accent-red,#f87171)">Rejected: ' + data.mapping.rejectedFields.join(', ') + '</div>';
      }
      if (data.extraction?.errors?.length) {
        html += '<div style="color:var(--accent-red,#f87171);margin-top:4px">Errors: ' + data.extraction.errors.map(esc).join('; ') + '</div>';
      }
      html += '<div style="margin-top:4px;color:var(--text-tertiary,#888)">Schema: ' + esc(data.schema?.contractId || '?') + ' hash:' + esc((data.schema?.schemaHash || '?').slice(0, 8)) + '</div>';
      html += '</div>';
      slot.innerHTML = html;
    })
    .catch(function() { slot.innerHTML = '<div class="gov-empty">Error loading structured data</div>'; });
};

// Load structured badges for visible deliverables
function loadStructuredBadges() {
  var slots = document.querySelectorAll('.structured-badge-slot[data-dlv-id]');
  slots.forEach(function(slot) {
    var id = slot.getAttribute('data-dlv-id');
    if (!id || slot.dataset.loaded) return;
    slot.dataset.loaded = '1';
    fetch('/api/deliverables/' + encodeURIComponent(id) + '/structured')
      .then(function(r) { return r.ok ? r.json() : null; })
      .then(function(data) {
        if (data && data.extraction && data.extraction.ok) {
          slot.innerHTML = '<span class="trc-type" style="font-size:9px;padding:1px 4px;margin-left:4px">Structured</span>';
        }
      })
      .catch(function() {});
  });
}
// Run badge loading after tab renders
var _origTabSwitch = window.switchTab;
if (_origTabSwitch) {
  window.switchTab = function(tab) {
    _origTabSwitch(tab);
    if (tab === 'releases') setTimeout(loadStructuredBadges, 600);
  };
}

// Part 68: Structured IO status badge for tasks
window.gpoLoadStructuredIOStatus = function(taskId, container) {
  fetch('/api/ai-io/status/' + encodeURIComponent(taskId))
    .then(function(r) { return r.ok ? r.json() : null; })
    .then(function(data) {
      if (!data || !data.statuses || !data.statuses.length) return;
      var latest = data.statuses[data.statuses.length - 1];
      var statusColor = latest.status === 'complete' ? 'var(--accent-green,#4ade80)'
        : latest.status === 'partial' ? 'var(--accent-amber,#fbbf24)'
        : latest.status === 'failed' ? 'var(--accent-red,#f87171)'
        : latest.status === 'fallback' ? 'var(--text-tertiary,#888)'
        : 'var(--text-secondary,#aaa)';
      var attemptStr = (latest.attempts ? latest.attempts.length : 0) + '/' + (latest.maxAttempts || 3);
      var modeLabel = latest.providerMode === 'native-json' ? 'JSON' : latest.providerMode === 'mime-json' ? 'MIME' : 'Sentinel';
      var badge = '<span class="structured-io-badge" style="display:inline-flex;align-items:center;gap:4px;font-size:10px;padding:2px 6px;border-radius:4px;background:var(--bg-secondary,#1a1a2e)">'
        + '<span style="color:' + statusColor + '">' + esc(latest.status) + '</span>'
        + '<span style="color:var(--text-tertiary,#888)">' + esc(latest.providerId) + ' ' + modeLabel + '</span>'
        + '<span style="color:var(--text-tertiary,#888)">' + attemptStr + '</span>'
        + (latest.fieldsExtracted ? '<span style="color:var(--text-secondary,#aaa)">' + latest.fieldsExtracted + ' fields</span>' : '')
        + '</span>';
      if (container) container.innerHTML = badge;
    })
    .catch(function() {});
};

// Part 69: Structured I/O Health Panel
var _sioInterval = null;
function renderStructuredIoPanel() {
  var panel = document.getElementById('structuredIoPanel');
  if (!panel) return;
  panel.innerHTML = '<div class="gov-empty">Loading structured I/O metrics...</div>';

  Promise.all([
    fetch('/api/structured-io/metrics?windowMinutes=60').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
    fetch('/api/structured-io/metrics/providers').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
    fetch('/api/structured-io/costs?windowMinutes=1440').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
    fetch('/api/structured-io/alerts').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
    fetch('/api/structured-io/evidence/index').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
    fetch('/api/structured-io/latency-histogram?windowMinutes=60').then(function(r) { return r.ok ? r.json() : null; }).catch(function() { return null; }),
  ]).then(function(arr) {
    var snap = arr[0], providers = arr[1], costs = arr[2], alertsData = arr[3], evidence = arr[4], histogram = arr[5];
    var html = '';

    // KPIs
    if (snap) {
      var sr = (snap.successRate * 100).toFixed(1);
      var srCls = snap.successRate >= 0.9 ? 'trc-type' : snap.successRate >= 0.7 ? 'trc-action' : 'exc-sev';
      html += '<div class="aud-section"><div class="aud-section-title">Global KPIs (1h window)</div>';
      html += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin:8px 0">';
      html += '<div class="kpi-box"><span class="' + srCls + '">' + sr + '%</span><span class="kpi-label">Success Rate</span></div>';
      html += '<div class="kpi-box"><span class="trc-status">' + snap.p50LatencyMs.toFixed(0) + 'ms</span><span class="kpi-label">p50 Latency</span></div>';
      html += '<div class="kpi-box"><span class="trc-status">' + snap.p95LatencyMs.toFixed(0) + 'ms</span><span class="kpi-label">p95 Latency</span></div>';
      html += '<div class="kpi-box"><span class="trc-status">' + (snap.retryRate * 100).toFixed(1) + '%</span><span class="kpi-label">Retry Rate</span></div>';
      html += '<div class="kpi-box"><span class="trc-status">' + snap.totalCalls + '</span><span class="kpi-label">Total Calls</span></div>';
      html += '<div class="kpi-box"><span class="trc-status">$' + snap.totalCostUsd.toFixed(4) + '</span><span class="kpi-label">Cost (1h)</span></div>';
      html += '</div></div>';
    }

    // Provider table
    if (providers && providers.providers && providers.providers.length) {
      html += '<div class="aud-section"><div class="aud-section-title">Per-Provider Metrics</div>';
      html += '<div style="overflow-x:auto"><table style="width:100%;font-size:11px;border-collapse:collapse">';
      html += '<tr style="border-bottom:1px solid var(--border,#222)"><th>Provider</th><th>Calls</th><th>Success</th><th>Errors</th><th>p95</th><th>Attempts</th><th>Cost</th><th>Score</th><th>Circuit</th></tr>';
      providers.providers.forEach(function(p) {
        var circuitCls = p.circuitOpen ? 'exc-sev' : 'trc-type';
        html += '<tr><td>' + esc(p.providerKey) + '</td><td>' + p.totalCalls + '</td><td>' + (p.successRate * 100).toFixed(1) + '%</td><td>' + (p.providerErrorRate * 100).toFixed(1) + '%</td><td>' + p.p95LatencyMs.toFixed(0) + 'ms</td><td>' + p.avgAttempts.toFixed(1) + '</td><td>$' + p.totalCostUsd.toFixed(4) + '</td><td>' + p.dynamicScore.toFixed(2) + '</td><td><span class="' + circuitCls + '">' + (p.circuitOpen ? 'OPEN' : 'closed') + '</span></td></tr>';
      });
      html += '</table></div></div>';
    }

    // Latency histogram
    if (histogram && histogram.counts) {
      html += '<div class="aud-section"><div class="aud-section-title">Latency Histogram (1h)</div>';
      var maxC = Math.max.apply(null, histogram.counts) || 1;
      html += '<div style="display:flex;align-items:flex-end;gap:2px;height:60px;margin:8px 0">';
      for (var i = 0; i < histogram.counts.length; i++) {
        var h = Math.max(2, (histogram.counts[i] / maxC) * 60);
        var label = histogram.bucketsMs[i] === Infinity ? '>' + histogram.bucketsMs[i-1] : '<' + histogram.bucketsMs[i] + 'ms';
        html += '<div style="flex:1;background:var(--accent-blue,#60a5fa);height:' + h + 'px;border-radius:2px 2px 0 0" title="' + label + ': ' + histogram.counts[i] + '"></div>';
      }
      html += '</div></div>';
    }

    // Alerts
    if (alertsData && alertsData.alerts && alertsData.alerts.length) {
      html += '<div class="aud-section"><div class="aud-section-title">Active Alerts (' + alertsData.alerts.length + ')</div>';
      alertsData.alerts.forEach(function(a) {
        html += '<div class="trc-item"><span class="exc-sev">' + esc(a.kind) + '</span><span class="trc-title">' + esc(a.details.slice(0, 80)) + '</span>';
        html += '<button class="nop-btn nop-btn-secondary" style="font-size:9px;padding:2px 6px;margin-left:auto" onclick="fetch(\'/api/structured-io/alerts/ack\',{method:\'POST\',headers:{\'Content-Type\':\'application/json\'},body:JSON.stringify({id:\'' + esc(a.id) + '\',actor:\'operator\'})}).then(function(){renderStructuredIoPanel()})">Ack</button></div>';
      });
      html += '</div>';
    }

    // Evidence lifecycle
    if (evidence) {
      html += '<div class="aud-section"><div class="aud-section-title">Evidence Store</div>';
      html += '<div style="display:flex;gap:12px;flex-wrap:wrap;margin:8px 0">';
      html += '<div class="kpi-box"><span class="trc-status">' + evidence.totalFiles + '</span><span class="kpi-label">Files</span></div>';
      html += '<div class="kpi-box"><span class="trc-status">' + (evidence.totalBytes / 1024).toFixed(1) + ' KB</span><span class="kpi-label">Size</span></div>';
      if (evidence.byAge) {
        Object.keys(evidence.byAge).forEach(function(k) {
          html += '<div class="kpi-box"><span class="trc-status">' + evidence.byAge[k] + '</span><span class="kpi-label">' + k + '</span></div>';
        });
      }
      html += '</div></div>';
    }

    if (!html) html = '<div class="gov-empty">No structured I/O data yet</div>';
    panel.innerHTML = html;
  });
}

// Hook tab switch for structured-io panel with polling
var _origTabSwitch2 = window.switchTab;
if (_origTabSwitch2) {
  window.switchTab = function(tab) {
    _origTabSwitch2(tab);
    if (_sioInterval) { clearInterval(_sioInterval); _sioInterval = null; }
    if (tab === 'structured-io') {
      renderStructuredIoPanel();
      _sioInterval = setInterval(renderStructuredIoPanel, 10000);
    }
  };
}

console.log('[operator] GPO Operator Product Layer + Chief of Staff loaded');
