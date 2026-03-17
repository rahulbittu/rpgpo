// GPO V2 — Private AI Command Center

// ═══ THEME ═══
function setTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  localStorage.setItem('gpo-theme', t);
  document.querySelector('meta[name=theme-color]').content = t === 'light' ? '#f5f6f8' : '#090b12';
  const dk = document.getElementById('tDark'), lt = document.getElementById('tLight');
  if (dk) dk.className = t === 'dark' ? 'b b-sm on' : 'b b-ghost b-sm';
  if (lt) lt.className = t === 'light' ? 'b b-sm on' : 'b b-ghost b-sm';
}

// ═══ ROUTING ═══
const SCREENS = ['command', 'ask', 'work', 'activity', 'ops', 'settings'];
function go(r) {
  SCREENS.forEach(s => {
    const el = document.getElementById('s-' + s);
    if (el) el.classList.toggle('on', s === r);
  });
  document.querySelectorAll('.v2-nav-item,.mob-tab').forEach(n => n.classList.toggle('on', n.dataset.r === r));
  if (r === 'command') loadCommand();
  if (r === 'work') loadWork();
  if (r === 'activity') loadActivity();
  if (r === 'ops') loadOps();
  if (r === 'settings') loadSettings();
  if (r === 'ask') { populateEngineSelect(); renderTemplates(); loadAskRecent(); }
  // Reset work view when navigating
  if (r !== 'work') {
    const wd = document.getElementById('workDetail'); if (wd) wd.style.display = 'none';
    const wl = document.getElementById('workListWrap'); if (wl) wl.style.display = '';
  }
}
document.querySelectorAll('.v2-nav-item,.mob-tab').forEach(n => n.addEventListener('click', e => { e.preventDefault(); go(n.dataset.r); }));
document.head.insertAdjacentHTML('beforeend', '<style>.v2-screen{display:none}.v2-screen.on{display:block}</style>');

// ═══ UTILITIES ═══
function esc(s) { const d = document.createElement('div'); d.textContent = s || ''; return d.innerHTML; }
function toast(msg, type) {
  const c = document.getElementById('toastBox'); if (!c) return;
  while (c.children.length >= 3) c.removeChild(c.firstChild);
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'ok' ? ' toast-ok' : type === 'err' ? ' toast-err' : '');
  t.textContent = msg;
  c.appendChild(t);
  setTimeout(() => { if (t.parentNode) t.remove(); }, 3000);
}
function timeAgo(ts) {
  if (!ts) return '';
  const d = Date.now() - new Date(ts).getTime(), m = Math.floor(d / 60000);
  if (m < 1) return 'just now'; if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}
function fmtDate(ts) { return ts ? new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''; }
function fmtCost(n) { return typeof n === 'number' ? '$' + n.toFixed(2) : '--'; }
function pct(n) { return typeof n === 'number' ? n + '%' : '--'; }

// Engine display names
const ENG = {code:'Code',writing:'Writing',research:'Research',learning:'Learning',ops:'Life Ops',health:'Health',shopping:'Shopping',travel:'Travel',finance:'Finance',startup:'Startup',career:'Career',screenwriting:'Creative',film:'Film',music:'Music',news:'News',general:'General',
  topranker:'Startup',careeregine:'Career',wealthresearch:'Finance',personalops:'Life Ops',newsroom:'News',founder2founder:'Film'};
function engName(d) { return ENG[d] || (d || '').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()); }
// Prefer engine_display from backend when available
function taskEngName(t) { return t.engine_display || engName(t.engine || t.domain); }

// Operator-facing status
const STATUS = {intake:'Submitted',deliberating:'Planning',planned:'Ready',executing:'Working',waiting_approval:'Needs Review',done:'Complete',failed:'Issue',builder_running:'Working'};
function statusLabel(s) { return STATUS[s] || s; }
function statusTag(s) {
  const cls = s === 'done' ? 'tag-ok' : s === 'failed' ? 'tag-err' : ['executing','deliberating','waiting_approval','builder_running'].includes(s) ? 'tag-warn' : 'tag-muted';
  return `<span class="tag ${cls}">${esc(statusLabel(s))}</span>`;
}

// Phase rail — shows Board of AI execution lifecycle
const PHASES = [
  { key: 'deliberating', label: 'Board Review' },
  { key: 'planned', label: 'Plan Ready' },
  { key: 'executing', label: 'Executing' },
  { key: 'done', label: 'Complete' },
];
const PHASE_ORDER = { intake: 0, deliberating: 1, planned: 2, executing: 3, waiting_approval: 3, builder_running: 3, done: 4, failed: 4 };

function renderPhaseRail(status) {
  const current = PHASE_ORDER[status] || 0;
  return `<div class="phase-rail">${PHASES.map((p, i) => {
    const idx = i + 1;
    const cls = idx < current ? 'done' : idx === current ? 'active' : 'pending';
    const conn = i < PHASES.length - 1 ? `<div class="phase-conn ${idx < current ? 'done' : ''}"></div>` : '';
    return `<div class="phase-node ${cls}"><span class="pn-dot"></span>${p.label}</div>${conn}`;
  }).join('')}</div>`;
}

// Markdown to HTML (lightweight)
function md(text) {
  if (!text) return '';
  let h = esc(text);
  h = h.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  h = h.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  h = h.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  h = h.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/\*(.+?)\*/g, '<em>$1</em>');
  h = h.replace(/`([^`]+)`/g, '<code>$1</code>');
  h = h.replace(/\[([^\]]+)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  h = h.replace(/(https?:\/\/[^\s<]+)/g, '<a href="$1" target="_blank" rel="noopener">$1</a>');
  h = h.replace(/^- (.+)$/gm, '<li>$1</li>');
  h = h.replace(/(<li>.*<\/li>\n?)+/g, m => '<ul>' + m + '</ul>');
  h = h.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
  h = h.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  h = h.replace(/\n{2,}/g, '</p><p>');
  h = '<p>' + h + '</p>';
  h = h.replace(/<p><(h[123]|ul|ol|blockquote|pre)/g, '<$1');
  h = h.replace(/<\/(h[123]|ul|ol|blockquote|pre)><\/p>/g, '</$1>');
  return h;
}

function extractSources(text) {
  if (!text) return [];
  const urls = text.match(/https?:\/\/[^\s)>\]"]+/g) || [];
  return [...new Set(urls)].slice(0, 10);
}

// ═══ COMMAND (Home) ═══
async function loadCommand() {
  // Greeting
  const hour = new Date().getHours();
  const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const ge = document.getElementById('greeting');
  if (ge) ge.textContent = g;
  const de = document.getElementById('dateText');
  if (de) de.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Parallel fetch all command data
  const [status, costs, tasks, approvals, brief, actions, health] = await Promise.all([
    fetch('/api/status').then(r => r.json()).catch(() => ({})),
    fetch('/api/costs').then(r => r.json()).catch(() => ({})),
    fetch('/api/intake/tasks').then(r => r.json()).catch(() => []),
    fetch('/api/intake/pending-approvals').then(r => r.json()).catch(() => []),
    fetch('/api/chief-of-staff/brief').then(r => r.json()).catch(() => null),
    fetch('/api/chief-of-staff/actions').then(r => r.json()).catch(() => null),
    fetch('/api/service-health').then(r => r.json()).catch(() => null),
  ]);

  // Status
  const se = document.getElementById('homeStatus');
  if (se) {
    const running = tasks.filter(t => ['executing', 'deliberating', 'builder_running'].includes(t.status));
    se.textContent = running.length ? running.length + ' task' + (running.length > 1 ? 's' : '') + ' running' : 'System ready';
  }

  // Metrics
  const today = new Date().toISOString().slice(0, 10);
  const todayTasks = tasks.filter(t => (t.created_at || '').startsWith(today));
  const todayDone = todayTasks.filter(t => t.status === 'done').length;
  const allDone = tasks.filter(t => t.status === 'done').length;
  const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
  el('mcTasks', todayTasks.length);
  el('mcDone', allDone);
  el('mcCost', fmtCost(costs.today?.cost));
  el('mcWeek', fmtCost(costs.week?.cost));
  el('mcCalls', costs.today?.calls || 0);

  // Attention — pending approvals
  const attn = document.getElementById('cmdAttention');
  if (attn) {
    let html = '';
    if (approvals.length > 0) {
      html += `<div class="card card-warn mb-16"><div class="spread"><strong style="color:var(--warn)">&#9888; ${approvals.length} pending approval${approvals.length > 1 ? 's' : ''}</strong><button class="b b-sm b-ok" onclick="go('ops')">Review</button></div></div>`;
    }
    // Running tasks
    const running = tasks.filter(t => ['executing', 'deliberating', 'builder_running'].includes(t.status));
    if (running.length) {
      html += `<div style="font-size:11px;font-weight:600;color:var(--text-1);margin-bottom:6px">&#9679; ${running.length} Active</div>`;
      html += running.map(t => `<div class="card card-accent card-click mb-12" style="padding:0" onclick="openWorkDetail('${t.task_id}')">
        ${renderPhaseRail(t.status)}
        <div style="padding:10px 14px">
          <div class="spread"><span style="font-size:12px;font-weight:500">${esc((t.title || '').slice(0, 55))}</span><span class="tag tag-muted">${taskEngName(t)}</span></div>
          <div style="font-size:10px;color:var(--text-2);margin-top:3px">${timeAgo(t.created_at)}${t.board_deliberation ? ' &middot; Board reviewed' : ''}</div>
        </div>
      </div>`).join('');
    }
    attn.innerHTML = html;
  }
  const badge = document.getElementById('approvalCount');
  if (badge) { badge.textContent = approvals.length; badge.style.display = approvals.length > 0 ? '' : 'none'; }

  // Chief of Staff Brief
  const briefEl = document.getElementById('cmdBrief');
  const briefContent = document.getElementById('cmdBriefContent');
  if (briefEl && briefContent && brief && brief.operator_summary) {
    briefEl.style.display = '';
    const priorities = (brief.top_priorities || []).slice(0, 3);
    briefContent.innerHTML = `<div style="margin-bottom:8px">${esc(brief.operator_summary)}</div>` +
      (priorities.length ? priorities.map(p =>
        `<div style="padding:4px 0;border-bottom:1px solid var(--border-0)"><span style="font-weight:500">${esc(p.title?.slice(0, 60) || '')}</span> <span style="color:var(--text-2);font-size:10px">${esc(p.why?.slice(0, 50) || '')}</span></div>`
      ).join('') : '');
  }

  // Recommended Actions
  const actionsEl = document.getElementById('cmdActions');
  const actionsList = document.getElementById('cmdActionsList');
  if (actionsEl && actionsList && actions?.actions?.length) {
    actionsEl.style.display = '';
    actionsList.innerHTML = actions.actions.slice(0, 5).map(a =>
      `<div class="card card-click" style="padding:10px 14px;margin-bottom:6px">
        <div class="spread"><span style="font-size:12px;font-weight:500">${esc((a.title || '').slice(0, 60))}</span><span class="tag tag-${a.priority === 'high' ? 'warn' : 'muted'}">${esc(a.priority || 'medium')}</span></div>
        <div style="font-size:10px;color:var(--text-2);margin-top:3px">${esc((a.why || '').slice(0, 80))}</div>
      </div>`
    ).join('');
  }

  // System Health
  const healthEl = document.getElementById('cmdHealth');
  const provEl = document.getElementById('cmdProviders');
  const sysEl = document.getElementById('cmdSysHealth');
  if (healthEl && status.providers) {
    healthEl.style.display = '';
    if (provEl) {
      provEl.innerHTML = Object.entries(status.providers).map(([name, p]) => {
        const dot = p.state === 'ready' ? 'dot-ok' : p.state === 'missing' ? 'dot-err' : 'dot-warn';
        return `<div class="prov-row"><span class="dot ${dot}"></span><span class="prov-name">${esc(name)}</span><span class="prov-model">${esc(p.model || p.type || '')}</span></div>`;
      }).join('');
    }
    if (sysEl && health?.subsystems) {
      sysEl.innerHTML = health.subsystems.slice(0, 5).map(s => {
        const dot = s.status === 'healthy' ? 'dot-ok' : s.status === 'degraded' ? 'dot-warn' : 'dot-err';
        const label = s.subsystem.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `<div class="prov-row"><span class="dot ${dot}"></span><span style="flex:1">${esc(label)}</span><span class="tag tag-${s.status === 'healthy' ? 'ok' : 'warn'}">${esc(s.status)}</span></div>`;
      }).join('');
    }
  }

  // Today's work breakdown by engine
  const todayWrap = document.getElementById('cmdTodayWrap');
  const todayBreak = document.getElementById('cmdTodayBreakdown');
  if (todayWrap && todayBreak && todayTasks.length > 0) {
    todayWrap.style.display = '';
    const byEngine = {};
    todayTasks.forEach(t => {
      const eng = taskEngName(t);
      byEngine[eng] = (byEngine[eng] || 0) + 1;
    });
    todayBreak.innerHTML = Object.entries(byEngine)
      .sort((a, b) => b[1] - a[1])
      .map(([eng, count]) => `<span class="tag tag-muted" style="padding:3px 10px;font-size:11px">${esc(eng)} <strong>${count}</strong></span>`)
      .join('');
  }

  // Recent Results — richer cards with Board info
  const recent = tasks.filter(x => x.status === 'done').slice(-5).reverse();
  const re = document.getElementById('cmdResults');
  if (re && recent.length) {
    re.innerHTML = recent.map(r => {
      const obj = r.board_deliberation?.interpreted_objective || '';
      return `<div class="card card-click" style="padding:10px 14px;margin-bottom:6px" onclick="openWorkDetail('${r.task_id}')">
        <div class="spread"><span style="font-size:13px;font-weight:500">${esc((r.title || '').slice(0, 60))}</span><span class="tag tag-muted">${taskEngName(r)}</span></div>
        ${obj ? `<div style="font-size:11px;color:var(--text-1);margin-top:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(obj.slice(0, 80))}</div>` : ''}
        <div style="font-size:10px;color:var(--text-2);margin-top:3px">${timeAgo(r.updated_at || r.created_at)}${r.board_deliberation ? ' &middot; Board reviewed' : ''}</div>
      </div>`;
    }).join('');
  }

  // Activity feed
  try {
    const data = await fetch('/api/behavior/events?limit=8&offset=0').then(r => r.json());
    const homeAct = document.getElementById('cmdActivity');
    if (homeAct && data.events?.length) {
      homeAct.innerHTML = data.events.map(e => {
        const label = EVT_LABELS[e.type] || e.type.replace(/_/g, ' ');
        return `<div class="ev"><div class="ev-time">${timeAgo(e.timestamp)}</div>${evtIcon(e.type)}<div class="ev-text">${esc(label)}${e.engine ? ' · ' + engName(e.engine) : ''}</div></div>`;
      }).join('');
    }
  } catch {}
}

// ═══ ASK ═══
const TEMPLATES = [
  { icon: '&#128200;', title: 'AI News Today', desc: 'Latest AI and tech headlines', prompt: "Compile today's most important AI and technology news with sources.", domain: 'news' },
  { icon: '&#128176;', title: 'Income Ideas', desc: 'Passive income opportunities', prompt: 'Research the top 10 passive income opportunities for a tech professional with startup costs and first steps.', domain: 'finance' },
  { icon: '&#128188;', title: 'Job Search', desc: 'Find roles in your field', prompt: 'Search for current high-paying remote job openings in my field. Include company, title, salary range, and where to apply.', domain: 'career' },
  { icon: '&#128197;', title: 'Plan My Week', desc: 'Weekly schedule + priorities', prompt: 'Help me plan the upcoming week with day-by-day time blocks, priorities, and key decisions.', domain: 'ops' },
  { icon: '&#127891;', title: 'Explain a Topic', desc: 'Deep dive into any subject', prompt: '', domain: 'learning' },
  { icon: '&#128270;', title: 'Product Research', desc: 'Compare and recommend', prompt: '', domain: 'research' },
];

function renderTemplates() {
  const qs = document.getElementById('askQuickStart');
  if (qs) qs.style.display = '';
  const el = document.getElementById('askTemplates');
  if (!el) return;
  el.innerHTML = TEMPLATES.map(t =>
    `<div class="card card-click" style="padding:10px 12px" onclick="useTemplate('${esc(t.prompt)}','${t.domain}')">
      <div class="row gap-8"><span style="font-size:16px">${t.icon}</span><div><div style="font-size:12px;font-weight:600">${esc(t.title)}</div><div style="font-size:10px;color:var(--text-2)">${esc(t.desc)}</div></div></div>
    </div>`
  ).join('');
}

function useTemplate(prompt, domain) {
  const inp = document.getElementById('askInput');
  if (inp && prompt) { inp.value = prompt; inp.focus(); }
  else if (inp) { inp.focus(); }
  const eng = document.getElementById('askEngine');
  if (eng && domain) eng.value = domain;
  // Hide quick start when using a template
  const qs = document.getElementById('askQuickStart');
  if (qs && prompt) qs.style.display = 'none';
}

function populateEngineSelect() {
  const sel = document.getElementById('askEngine');
  if (!sel || sel.options.length > 1) return;
  const engines = ['code','writing','research','learning','ops','health','shopping','travel','finance','startup','career','screenwriting','film','music','news','general'];
  engines.forEach(e => { const o = document.createElement('option'); o.value = e; o.textContent = engName(e); sel.appendChild(o); });
}

async function loadAskRecent() {
  const el = document.getElementById('askRecent');
  if (!el) return;
  try {
    const tasks = await fetch('/api/intake/tasks').then(r => r.json());
    const recent = tasks.filter(t => t.status === 'done').reverse().slice(0, 5);
    if (recent.length) {
      el.innerHTML = `<div class="hd"><h3>Recent</h3></div>` + recent.map(t =>
        `<div class="card card-click" style="padding:10px 14px;margin-bottom:6px" onclick="openWorkDetail('${t.task_id}')">
          <div class="spread"><span style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((t.title || '').slice(0, 55))}</span><span class="tag tag-muted">${taskEngName(t)}</span></div>
          <div style="font-size:10px;color:var(--text-2);margin-top:2px">${timeAgo(t.updated_at || t.created_at)}</div>
        </div>`
      ).join('');
    }
  } catch {}
}

let _askPoll = null;
async function submitAsk() {
  const input = document.getElementById('askInput');
  const raw = (input?.value || '').trim();
  if (!raw) { toast('Enter a request', 'err'); return; }
  const engine = document.getElementById('askEngine')?.value || '';
  const urgency = document.getElementById('askUrgency')?.value || 'normal';

  document.getElementById('askBtn').disabled = true;
  document.getElementById('askProgress').style.display = 'block';
  document.getElementById('askProgress').innerHTML = '<div class="card"><div class="progress-panel"><div class="progress-step step-active"><div class="step-dot">&#9679;</div><div class="step-label">Submitting request...</div></div></div></div>';
  document.getElementById('askResult').style.display = 'none';
  const qs = document.getElementById('askQuickStart'); if (qs) qs.style.display = 'none';

  try {
    const body = { raw_request: raw, priority: urgency };
    if (engine) body.domain = engine;
    const r = await fetch('/api/intake/run', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
    const d = await r.json();
    if (!d.ok) { toast('Error: ' + (d.error || 'Unknown'), 'err'); document.getElementById('askBtn').disabled = false; return; }
    input.value = '';
    toast('Request submitted', 'ok');
    pollAskResult(d.task.task_id);
  } catch (e) { toast('Network error', 'err'); document.getElementById('askBtn').disabled = false; }
}

function pollAskResult(taskId) {
  if (_askPoll) clearInterval(_askPoll);
  const startTime = Date.now();
  _askPoll = setInterval(async () => {
    try {
      const r = await fetch('/api/intake/task/' + taskId);
      const d = await r.json();
      const task = d.task;
      const subs = d.subtasks || [];
      const elapsed = Math.floor((Date.now() - startTime) / 1000);

      const pp = document.getElementById('askProgress');
      if (pp) {
        let steps = subs.map((s, i) => {
          const isDone = s.status === 'done';
          const isRunning = s.status === 'running' || s.status === 'builder_running';
          const cls = isDone ? 'step-done' : isRunning ? 'step-active' : 'step-pending';
          const icon = isDone ? '&#10003;' : isRunning ? '&#9679;' : '&#9675;';
          const STEP_LABELS = { research: 'Searching the web', report: 'Writing response', strategy: 'Analyzing and comparing', implement: 'Making code changes', audit: 'Reviewing quality', locate_files: 'Finding relevant files' };
          const label = STEP_LABELS[s.stage] || s.title || 'Processing';
          const provider = s.assigned_model === 'perplexity' ? 'Web search' : s.assigned_model === 'openai' ? 'AI synthesis' : s.assigned_model === 'gemini' ? 'Analysis' : '';
          return `<div class="progress-step ${cls}"><div class="step-dot">${icon}</div><div class="step-label">${esc(label)}${provider && !isDone ? ' <span style="color:var(--text-2);font-size:10px">&middot; ' + provider + '</span>' : ''}</div><div class="step-time">${isDone ? '&#10003;' : elapsed + 's'}</div></div>`;
        });
        const doneCount = subs.filter(s => s.status === 'done').length;
        const totalCount = subs.length || 1;
        const progPct = Math.round(doneCount / totalCount * 100);
        if (!steps.length) steps = [`<div class="progress-step step-active"><div class="step-dot">&#9679;</div><div class="step-label">${statusLabel(task.status)}...</div><div class="step-time">${elapsed}s</div></div>`];
        const progressBar = totalCount > 1 ? `<div style="padding:0 14px 10px"><div style="height:3px;background:var(--border-1);border-radius:2px;overflow:hidden"><div style="height:100%;width:${progPct}%;background:var(--accent);border-radius:2px;transition:width .3s ease"></div></div><div style="font-size:9px;color:var(--text-2);margin-top:4px;text-align:right">${doneCount}/${totalCount} steps</div></div>` : '';
        const boardNote = task.board_deliberation ? `<div style="padding:6px 14px;font-size:10px;color:var(--text-1);border-bottom:1px solid var(--border-0)"><span class="tag tag-accent" style="margin-right:6px">Board of AI</span>${esc((task.board_deliberation.recommended_strategy || '').slice(0, 80))}</div>` : '';
        pp.innerHTML = `<div class="card" style="padding:0">${renderPhaseRail(task.status)}<div class="spread" style="padding:10px 14px;border-bottom:1px solid var(--border-0)"><span style="font-size:13px;font-weight:500">${esc((task.title || '').slice(0, 50))}</span><span class="tag tag-muted">${taskEngName(task)}</span></div>${boardNote}<div class="progress-panel" style="padding:8px">${steps.join('')}</div>${progressBar}</div>`;
      }

      if (task.status === 'done' || task.status === 'failed') {
        clearInterval(_askPoll); _askPoll = null;
        document.getElementById('askBtn').disabled = false;
        if (task.status === 'done') {
          toast('Complete', 'ok');
          const output = subs.filter(s => s.output).map(s => s.output).join('\n\n');
          renderAskResult(task, output);
        } else {
          toast('Encountered an issue', 'err');
          pp.innerHTML = `<div class="card card-err" style="padding:14px"><strong>Issue</strong><p style="margin-top:6px;font-size:12px;color:var(--text-1)">Unable to complete this request. You can try again or modify your request.</p></div>`;
        }
      }
    } catch {}
  }, 3000);
}

function renderAskResult(task, output) {
  const rp = document.getElementById('askResult');
  if (!rp) return;
  rp.style.display = 'block';
  const sources = extractSources(output);
  const sourcesHtml = sources.length ? `<div class="result-sources"><h4>Sources (${sources.length})</h4>${sources.map(u => {
    const domain = u.replace(/https?:\/\//, '').split('/')[0];
    return `<a href="${esc(u)}" target="_blank" rel="noopener" class="source-link">&#128279; ${esc(domain)}</a>`;
  }).join('')}</div>` : '';

  rp.innerHTML = `<div class="card result">
    <div class="result-head"><span class="tag tag-muted">${taskEngName(task)}</span><h3>${esc((task.title || '').slice(0, 60))}</h3><span style="font-size:10px;color:var(--text-2)">${timeAgo(task.updated_at)}</span></div>
    <div class="result-body">${md(output)}</div>
    ${sourcesHtml}
    <div class="result-actions">
      <a href="/api/intake/task/${task.task_id}/export?fmt=md" download class="b b-line b-sm" style="text-decoration:none">&#128229; Download MD</a>
      <a href="/api/intake/task/${task.task_id}/export?fmt=json" download class="b b-ghost b-sm" style="text-decoration:none">&#128229; JSON</a>
      <button class="b b-ghost b-sm" onclick="openWorkDetail('${task.task_id}')">&#128270; Full Details</button>
    </div>
    <div class="fb" id="fb-${task.task_id}">
      <span class="fb-q">Was this helpful?</span>
      <button class="b b-ok b-sm" onclick="sendFeedback('${task.task_id}','good',this)">Yes</button>
      <button class="b b-ghost b-sm" onclick="sendFeedback('${task.task_id}','needs_improvement',this)">Could be better</button>
      <button class="b b-err b-sm" onclick="sendFeedback('${task.task_id}','bad',this)">No</button>
    </div>
  </div>`;

  const pp = document.getElementById('askProgress');
  if (pp) pp.style.display = 'none';
}

function rerunTask(request, domain) {
  go('ask');
  const inp = document.getElementById('askInput');
  if (inp) inp.value = request;
  const eng = document.getElementById('askEngine');
  if (eng) eng.value = domain || '';
  toast('Request loaded — submit when ready', 'ok');
}

function refineTask(request) {
  go('ask');
  const inp = document.getElementById('askInput');
  if (inp) { inp.value = request + '\n\n[Refine: please improve the previous result — '; inp.focus(); inp.setSelectionRange(inp.value.length, inp.value.length); }
  toast('Add your refinement notes and submit', 'ok');
}

async function sendFeedback(taskId, rating, btn) {
  try {
    await fetch('/api/intake/task/' + taskId + '/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating }) });
    const fb = document.getElementById('fb-' + taskId);
    if (fb) fb.innerHTML = `<span class="fb-done">Feedback recorded — thank you</span>`;
    toast('Feedback recorded', 'ok');
  } catch { toast('Feedback failed', 'err'); }
}

// ═══ WORK (unified tasks + detail view) ═══
let _allWork = [];
async function loadWork() {
  const el = document.getElementById('workList');
  if (!el) return;
  el.innerHTML = '<div class="wait">Loading tasks...</div>';
  try {
    const tasks = await fetch('/api/intake/tasks').then(r => r.json());
    _allWork = tasks.reverse(); // newest first

    // Update status counts in the page header
    const running = _allWork.filter(t => ['executing', 'deliberating', 'builder_running'].includes(t.status)).length;
    const done = _allWork.filter(t => t.status === 'done').length;
    const failed = _allWork.filter(t => t.status === 'failed').length;
    const statusSel = document.getElementById('workStatus');
    if (statusSel) {
      statusSel.options[0].textContent = `All Status (${_allWork.length})`;
      for (const opt of statusSel.options) {
        if (opt.value === 'executing') opt.textContent = `Running (${running})`;
        if (opt.value === 'done') opt.textContent = `Completed (${done})`;
        if (opt.value === 'failed') opt.textContent = `Failed (${failed})`;
      }
    }

    // Build engine filter
    const ff = document.getElementById('workEngineFilter');
    const engines = [...new Set(_allWork.map(t => t.engine || t.domain))];
    if (ff) {
      ff.innerHTML = `<button class="b b-sm on" onclick="filterWorkEngine('')">All (${_allWork.length})</button>` +
        engines.slice(0, 10).map(e => {
          const count = _allWork.filter(t => (t.engine || t.domain) === e).length;
          return `<button class="b b-ghost b-sm" onclick="filterWorkEngine('${e}')">${engName(e)} (${count})</button>`;
        }).join('');
    }
    applyWorkFilters();
  } catch { el.innerHTML = '<div class="nil"><span class="nil-desc">Error loading tasks</span></div>'; }
}

let _workEngineFilter = '';
function filterWorkEngine(engine) {
  _workEngineFilter = engine;
  const ff = document.getElementById('workEngineFilter');
  if (ff) ff.querySelectorAll('.b').forEach(b => b.classList.toggle('on', !engine ? b.textContent.startsWith('All') : b.textContent.startsWith(engName(engine))));
  applyWorkFilters();
}

let _workShown = 40;
function applyWorkFilters() {
  const q = (document.getElementById('workSearch')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('workStatus')?.value || '';
  let filtered = _allWork;
  if (_workEngineFilter) filtered = filtered.filter(t => (t.engine || t.domain) === _workEngineFilter);
  if (statusFilter) filtered = filtered.filter(t => t.status === statusFilter);
  if (q) filtered = filtered.filter(t => (t.title || '').toLowerCase().includes(q) || (t.raw_request || '').toLowerCase().includes(q) || (t.board_deliberation?.interpreted_objective || '').toLowerCase().includes(q));
  renderWorkList(filtered);
}

function renderWorkList(tasks) {
  const el = document.getElementById('workList');
  if (!el) return;
  if (!tasks.length) { el.innerHTML = '<div class="nil"><span class="nil-icon">&#9671;</span><span class="nil-title">No matching tasks</span></div>'; return; }
  const visible = tasks.slice(0, _workShown);
  el.innerHTML = visible.map(t => {
    const isActive = ['executing', 'deliberating', 'builder_running', 'waiting_approval'].includes(t.status);
    const border = isActive ? 'card-accent' : t.status === 'failed' ? 'card-err' : '';
    const preview = t.board_deliberation?.interpreted_objective || '';
    const hasBoard = !!t.board_deliberation;
    return `<div class="card card-click ${border}" style="padding:0;margin-bottom:6px" onclick="openWorkDetail('${t.task_id}')">
      ${isActive ? renderPhaseRail(t.status) : ''}
      <div style="padding:12px 14px">
        <div style="font-size:13px;font-weight:500;margin-bottom:3px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((t.title || '').slice(0, 70))}</div>
        ${preview ? `<div style="font-size:11px;color:var(--text-1);margin-bottom:5px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(preview.slice(0, 90))}</div>` : ''}
        <div class="row gap-12" style="font-size:10px;color:var(--text-2)">
          <span class="tag tag-muted">${taskEngName(t)}</span>
          ${hasBoard ? '<span class="tag tag-accent">Board reviewed</span>' : ''}
          <span>${fmtDate(t.updated_at || t.created_at)}</span>
          <span style="margin-left:auto">${statusTag(t.status)}</span>
      </div>
    </div>`;
  }).join('');
  if (tasks.length > _workShown) {
    el.innerHTML += `<div style="text-align:center;padding:12px"><button class="b b-ghost b-sm" onclick="_workShown+=40;applyWorkFilters()">Show more (${tasks.length - _workShown} remaining)</button></div>`;
  }
}

// Work Detail (replaces old Evidence page)
async function openWorkDetail(taskId) {
  go('work');
  const el = document.getElementById('workDetail');
  const listWrap = document.getElementById('workListWrap');
  if (!el) return;
  if (listWrap) listWrap.style.display = 'none';
  el.style.display = 'block';
  el.innerHTML = '<div class="wait">Loading task details...</div>';

  try {
    const d = await fetch('/api/intake/task/' + taskId).then(r => r.json());
    const task = d.task, subs = d.subtasks || [], delib = task.board_deliberation;
    const output = subs.filter(s => s.output).map(s => s.output).join('\n\n');
    const sources = extractSources(output);

    let html = `<div style="margin-bottom:12px"><button class="b b-ghost b-sm" onclick="closeWorkDetail()">&#8592; Back to Work</button></div>`;

    // Phase rail — shows lifecycle stage
    html += `<div class="card mb-16" style="padding:0">${renderPhaseRail(task.status)}
      <div style="padding:12px 14px">
        <div style="font-size:15px;font-weight:600;margin-bottom:6px">${esc((task.title || '').slice(0, 80))}</div>
        <div class="row gap-12" style="font-size:11px;color:var(--text-1);flex-wrap:wrap">
          <span class="tag tag-muted">${taskEngName(task)}</span>
          ${statusTag(task.status)}
          <span>${fmtDate(task.created_at)}</span>
          ${(() => { const el = task.created_at && task.updated_at ? Math.round((new Date(task.updated_at) - new Date(task.created_at)) / 1000) : null; return el !== null ? `<span>${el < 60 ? el + 's' : Math.floor(el/60) + 'm ' + (el%60) + 's'}</span>` : ''; })()}
          <span>${subs.length} step${subs.length !== 1 ? 's' : ''}</span>
        </div>
        ${task.raw_request && task.raw_request !== task.title ? `<div style="font-size:11px;color:var(--text-2);margin-top:6px">Request: ${esc(task.raw_request.slice(0, 120))}</div>` : ''}
      </div>
    </div>`;

    // Board of AI Deliberation — prominent card
    if (delib) {
      html += `<div class="card delib-card">
        <div class="delib-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none'">
          <span class="delib-label">Board of AI</span>
          <span style="font-size:12px;font-weight:500;flex:1">${esc(delib.interpreted_objective || '')}</span>
          <span class="tag tag-${delib.risk_level === 'green' ? 'ok' : delib.risk_level === 'red' ? 'err' : 'warn'}">${esc(delib.risk_level || 'green')}</span>
        </div>
        <div class="delib-body">
          <div style="margin-bottom:8px"><strong>Strategy:</strong> ${esc(delib.recommended_strategy || '')}</div>
          ${delib.expected_outcome ? `<div style="margin-bottom:8px"><strong>Expected outcome:</strong> ${esc(delib.expected_outcome)}</div>` : ''}
          <div style="font-size:10px;color:var(--text-2)">Model: ${esc(delib.model_used || '')} &middot; ${delib.tokens_used || 0} tokens</div>
        </div>
      </div>`;
    }

    // Running task — show progress panel
    const isRunning = ['executing', 'deliberating', 'builder_running', 'waiting_approval', 'planned'].includes(task.status);
    if (isRunning) {
      const doneCount = subs.filter(s => s.status === 'done').length;
      const totalCount = subs.length || 1;
      const progPct = Math.round(doneCount / totalCount * 100);
      const STEP_LABELS = { research: 'Searching the web', report: 'Writing response', strategy: 'Analyzing and comparing', implement: 'Making code changes', audit: 'Reviewing quality', locate_files: 'Finding relevant files' };
      html += `<div class="card card-accent mb-16">
        <div class="spread" style="padding:12px 14px;border-bottom:1px solid var(--border-0)"><span style="font-size:13px;font-weight:500">${esc((task.title || '').slice(0, 50))}</span>${statusTag(task.status)}</div>
        <div class="progress-panel" style="padding:8px">${subs.map(s => {
          const isDone = s.status === 'done';
          const isActive = s.status === 'running' || s.status === 'builder_running';
          const cls = isDone ? 'step-done' : isActive ? 'step-active' : 'step-pending';
          const icon = isDone ? '&#10003;' : isActive ? '&#9679;' : '&#9675;';
          const label = STEP_LABELS[s.stage] || s.title || 'Processing';
          const provName = s.assigned_model === 'perplexity' ? 'Web search' : s.assigned_model === 'openai' ? 'AI synthesis' : s.assigned_model === 'gemini' ? 'Analysis' : '';
          return `<div class="progress-step ${cls}"><div class="step-dot">${icon}</div><div class="step-label">${esc(label)}${provName && !isDone ? ' <span style="color:var(--text-2);font-size:10px">&middot; ' + provName + '</span>' : ''}</div></div>`;
        }).join('')}</div>
        ${totalCount > 1 ? `<div style="padding:0 14px 10px"><div style="height:3px;background:var(--border-1);border-radius:2px;overflow:hidden"><div style="height:100%;width:${progPct}%;background:var(--accent);border-radius:2px;transition:width .3s ease"></div></div><div style="font-size:9px;color:var(--text-2);margin-top:4px;text-align:right">${doneCount}/${totalCount} steps</div></div>` : ''}
        <div style="padding:8px 14px;font-size:11px;color:var(--text-2)">This task is still running. Refresh to see latest progress.</div>
      </div>`;
    }

    // Result card (for completed/failed tasks, or partial output for running)
    if (output || task.status === 'done' || task.status === 'failed') {
      html += `<div class="card result mb-16">
        <div class="result-head"><span class="tag tag-muted">${taskEngName(task)}</span><h3>${esc((task.title || '').slice(0, 60))}</h3>${statusTag(task.status)}<span style="font-size:10px;color:var(--text-2);margin-left:8px">${fmtDate(task.updated_at || task.created_at)}</span></div>
        ${output ? `<div class="result-body">${md(output)}</div>` : '<div class="result-body" style="color:var(--text-2)">No output yet</div>'}
        ${sources.length ? `<div class="result-sources"><h4>Sources (${sources.length})</h4>${sources.map(u => `<a href="${esc(u)}" target="_blank" class="source-link">&#128279; ${esc(u.replace(/https?:\/\//,'').split('/')[0])}</a>`).join('')}</div>` : ''}
        <div class="result-actions">
          <button class="b b-line b-sm" onclick="rerunTask('${esc(task.raw_request || task.title)}','${esc(task.domain)}')">&#8635; Run Again</button>
          <button class="b b-ghost b-sm" onclick="refineTask('${esc(task.raw_request || task.title)}')">&#9998; Refine</button>
          <a href="/api/intake/task/${task.task_id}/export?fmt=md" download class="b b-ghost b-sm" style="text-decoration:none">&#128229; MD</a>
          <a href="/api/intake/task/${task.task_id}/export?fmt=json" download class="b b-ghost b-sm" style="text-decoration:none">&#128229; JSON</a>
        </div>
        <div class="fb" id="fb-${task.task_id}">
          <span class="fb-q">Was this helpful?</span>
          <button class="b b-ok b-sm" onclick="sendFeedback('${task.task_id}','good',this)">Yes</button>
          <button class="b b-ghost b-sm" onclick="sendFeedback('${task.task_id}','needs_improvement',this)">Could be better</button>
          <button class="b b-err b-sm" onclick="sendFeedback('${task.task_id}','bad',this)">No</button>
        </div>
      </div>`;
    }

    // Execution chain — richer with numbered steps and provider visibility
    if (subs.length) {
      html += `<div class="card"><div class="hd"><h3>Execution Chain</h3><span style="font-size:10px;color:var(--text-2)">${subs.filter(s => s.status === 'done').length}/${subs.length} complete</span></div>
        <div>${subs.map((s, i) => {
          const STEP = { research: 'Web Search', report: 'Synthesis', strategy: 'Analysis', implement: 'Code', audit: 'Review', locate_files: 'File Scan' };
          const PROV = { perplexity: 'Perplexity', openai: 'OpenAI', gemini: 'Gemini', claude: 'Claude' };
          const stepName = STEP[s.stage] || s.stage;
          const provName = PROV[s.assigned_model] || s.assigned_model || '';
          const stepCls = s.status === 'done' ? 'done' : (s.status === 'running' || s.status === 'builder_running') ? 'active' : 'pending';
          const hasOutput = s.output && s.output.length > 50;
          const outputId = 'sub-out-' + i;
          return `<div class="exec-step">
            <div class="exec-step-num ${stepCls}">${s.status === 'done' ? '&#10003;' : i + 1}</div>
            <div class="exec-step-content">
              <div class="exec-step-title">${esc(s.title || stepName)}</div>
              <div class="exec-step-meta">
                <span class="tag tag-muted">${esc(provName)}</span>
                <span class="tag tag-muted">${esc(stepName)}</span>
                <span class="tag tag-${s.status === 'done' ? 'ok' : s.status === 'failed' ? 'err' : 'warn'}">${statusLabel(s.status)}</span>
              </div>
              ${hasOutput ? `<div style="margin-top:6px"><button class="b b-ghost b-xs" onclick="document.getElementById('${outputId}').style.display=document.getElementById('${outputId}').style.display==='none'?'block':'none'">View output (${Math.round(s.output.length/1000)}K chars)</button><div id="${outputId}" style="display:none;margin-top:6px" class="inset"><div class="result-body" style="font-size:11px;max-height:300px;overflow-y:auto">${md(s.output)}</div></div></div>` : ''}
            </div>
          </div>`;
        }).join('')}</div>
      </div>`;
    }

    el.innerHTML = html;
  } catch { el.innerHTML = '<div class="nil"><span class="nil-desc">Error loading task details</span></div>'; }
}

function closeWorkDetail() {
  const el = document.getElementById('workDetail');
  const listWrap = document.getElementById('workListWrap');
  if (el) el.style.display = 'none';
  if (listWrap) listWrap.style.display = '';
}

// ═══ ACTIVITY ═══
const EVT_LABELS = {
  task_created: 'Task submitted',
  task_routed: 'Routed to engine',
  output_accepted: 'Task completed',
  output_abandoned: 'Task failed',
  approval_granted: 'Approved',
  approval_denied: 'Rejected',
  rewrite_requested: 'Revision requested',
  quality_feedback: 'Feedback recorded',
  dissatisfaction_expressed: 'Quality concern',
  deliverable_downloaded: 'Downloaded',
  export_generated: 'Export created',
  followup_correction: 'Follow-up detected',
  engine_overridden: 'Engine changed',
};

function evtIcon(type) {
  if (type === 'output_accepted') return '<span class="dot dot-ok"></span>';
  if (type === 'output_abandoned') return '<span class="dot dot-err"></span>';
  if (type.includes('approval')) return '<span class="dot dot-warn"></span>';
  if (type === 'quality_feedback' || type === 'dissatisfaction_expressed') return '<span class="dot dot-warn"></span>';
  return '<span class="dot dot-off"></span>';
}

let _actOffset = 0;
let _actEvents = [];
async function loadActivity(append) {
  const el = document.getElementById('actList');
  if (!el) return;
  if (!append) { _actOffset = 0; _actEvents = []; el.innerHTML = '<div class="wait">Loading activity...</div>'; }
  try {
    const data = await fetch(`/api/behavior/events?limit=50&offset=${_actOffset}`).then(r => r.json());
    const events = data.events || [];
    _actEvents = _actEvents.concat(events);
    _actOffset += events.length;
    // Show total in header
    const totalEl = document.getElementById('actTotal');
    if (totalEl) totalEl.textContent = `${data.total || 0} events`;
    if (!_actEvents.length) { el.innerHTML = '<div class="nil"><span class="nil-desc">No activity yet</span></div>'; return; }
    el.innerHTML = _actEvents.map(e => renderEvent(e)).join('');
    if (_actOffset < data.total) {
      el.innerHTML += `<div style="text-align:center;padding:12px"><button class="b b-ghost b-sm" onclick="loadActivity(true)">Load more (${data.total - _actOffset} remaining)</button></div>`;
    } else {
      el.innerHTML += `<div style="text-align:center;padding:8px;font-size:10px;color:var(--text-2)">${data.total} total events</div>`;
    }
  } catch { if (!append) el.innerHTML = '<div class="nil"><span class="nil-desc">Error loading activity</span></div>'; }
}

let _actTypeFilter = '';
function filterActivityType(type) {
  _actTypeFilter = type;
  document.querySelectorAll('#actTypeFilter .b').forEach(b => b.classList.toggle('on', !type ? b.textContent === 'All' : b.getAttribute('onclick')?.includes(type)));
  renderFilteredActivity();
}

function filterActivity(query) {
  renderFilteredActivity(query);
}

function renderFilteredActivity(query) {
  const q = (query || document.getElementById('actSearch')?.value || '').toLowerCase().trim();
  const el = document.getElementById('actList');
  if (!el) return;
  let filtered = _actEvents;
  if (_actTypeFilter) filtered = filtered.filter(e => e.type.includes(_actTypeFilter));
  if (q) filtered = filtered.filter(e => {
    const label = (EVT_LABELS[e.type] || e.type).toLowerCase();
    const detail = (e.metadata?.title || e.metadata?.comment || e.metadata?.rating || '').toLowerCase();
    const engine = (e.engine || '').toLowerCase();
    return label.includes(q) || detail.includes(q) || engine.includes(q);
  });
  if (!filtered.length) { el.innerHTML = '<div class="nil"><span class="nil-desc">No matching events</span></div>'; return; }
  el.innerHTML = filtered.slice(0, 100).map(e => renderEvent(e)).join('');
  if (filtered.length > 100) el.innerHTML += `<div style="text-align:center;padding:8px;font-size:10px;color:var(--text-2)">Showing 100 of ${filtered.length} matches</div>`;
}

function renderEvent(e) {
  const label = EVT_LABELS[e.type] || e.type.replace(/_/g, ' ');
  const engine = e.engine ? `<span class="tag tag-muted">${engName(e.engine)}</span>` : '';
  const title = e.metadata?.taskTitle || e.metadata?.title || '';
  const rating = e.metadata?.rating;
  const format = e.metadata?.format;
  let detail = '';
  if (title) detail = esc(title.slice(0, 60));
  else if (rating) detail = `Rating: <strong>${esc(rating)}</strong>`;
  else if (e.metadata?.comment) detail = esc(e.metadata.comment.slice(0, 40));
  if (format) detail += detail ? ` (${format})` : format;
  const ts = e.timestamp ? new Date(e.timestamp) : null;
  const timeStr = ts ? ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
  const dateStr = ts ? ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
  const taskId = e.taskId || e.metadata?.taskId;
  const clickCls = taskId ? ' ev-click' : '';
  const clickAttr = taskId ? ` onclick="openWorkDetail('${esc(taskId)}')"` : '';
  return `<div class="ev${clickCls}"${clickAttr}><div class="ev-time">${dateStr}<br>${timeStr}</div>${evtIcon(e.type)}<div class="ev-text"><strong>${esc(label)}</strong>${detail ? ' — ' + detail : ''} ${engine}</div></div>`;
}

// ═══ OPERATIONS ═══
async function loadOps() {
  // Parallel fetch
  const [providers, reliability, latency, provCost, health, observability, memory, signals, guidance, approvals, costs, costHistory, govHealth, allTasks] = await Promise.all([
    fetch('/api/provider-registry').then(r => r.json()).catch(() => ({})),
    fetch('/api/provider-reliability').then(r => r.json()).catch(() => ({})),
    fetch('/api/provider-latency').then(r => r.json()).catch(() => ({})),
    fetch('/api/provider-cost').then(r => r.json()).catch(() => ({})),
    fetch('/api/service-health').then(r => r.json()).catch(() => ({})),
    fetch('/api/observability').then(r => r.json()).catch(() => ({})),
    fetch('/api/memory-viewer').then(r => r.json()).catch(() => ({})),
    fetch('/api/behavior/signals').then(r => r.json()).catch(() => []),
    fetch('/api/behavior/guidance').then(r => r.json()).catch(() => ({})),
    fetch('/api/intake/pending-approvals').then(r => r.json()).catch(() => []),
    fetch('/api/costs').then(r => r.json()).catch(() => ({})),
    fetch('/api/costs/history').then(r => r.json()).catch(() => []),
    fetch('/api/governance-health').then(r => r.json()).catch(() => ({})),
    fetch('/api/intake/tasks').then(r => r.json()).catch(() => []),
  ]);

  // Approvals
  const appEl = document.getElementById('opsApprovals');
  const appList = document.getElementById('opsApprovalsList');
  if (appEl && approvals.length > 0) {
    appEl.style.display = '';
    appList.innerHTML = approvals.map(s => `<div class="card card-warn" style="padding:12px;margin-bottom:8px">
      <div class="spread"><span style="font-size:13px;font-weight:500">${esc(s.title)}</span><span class="tag tag-warn">${esc(s.stage)}</span></div>
      <div style="font-size:11px;color:var(--text-1);margin-top:4px">from: ${esc(s.parent_title || '')}</div>
      <div class="row gap-4 mt-8">
        <button class="b b-ok b-sm" onclick="approveSubtask('${s.subtask_id}')">Approve</button>
        <button class="b b-err b-sm" onclick="rejectSubtask('${s.subtask_id}')">Reject</button>
        <button class="b b-ghost b-sm" onclick="openWorkDetail('${s.parent_task_id}')">Details</button>
      </div>
    </div>`).join('');
  } else if (appEl) { appEl.style.display = 'none'; }

  // Queue depth metrics
  const queueEl = document.getElementById('opsQueueStrip');
  if (queueEl && Array.isArray(allTasks)) {
    const running = allTasks.filter(t => ['executing', 'deliberating', 'builder_running'].includes(t.status)).length;
    const pending = allTasks.filter(t => ['intake', 'planned', 'waiting_approval'].includes(t.status)).length;
    const done = allTasks.filter(t => t.status === 'done').length;
    const failed = allTasks.filter(t => t.status === 'failed').length;
    const total = allTasks.length;
    queueEl.innerHTML = `
      <div class="metric-card"><span class="metric-val">${running}</span><span class="metric-label">Running</span></div>
      <div class="metric-card"><span class="metric-val">${pending}</span><span class="metric-label">Pending</span></div>
      <div class="metric-card"><span class="metric-val">${done}</span><span class="metric-label">Completed</span></div>
      <div class="metric-card"><span class="metric-val">${failed}</span><span class="metric-label">Failed</span></div>
      <div class="metric-card"><span class="metric-val">${total}</span><span class="metric-label">Total</span></div>`;
  }

  // Providers — rich view with reliability, latency, cost
  const provEl = document.getElementById('opsProviders');
  if (provEl && providers.providers?.length) {
    const reliMap = {}; (reliability.snapshots || []).forEach(s => reliMap[s.provider_id] = s);
    const latMap = {}; (latency.profiles || []).forEach(p => latMap[p.provider_id] = p);
    const costMap = {}; (provCost.profiles || []).forEach(p => costMap[p.provider_id] = p);

    provEl.innerHTML = providers.providers.map(p => {
      const r = reliMap[p.provider_id] || {};
      const l = latMap[p.provider_id] || {};
      const c = costMap[p.provider_id] || {};
      const healthDot = r.health === 'healthy' ? 'dot-ok' : r.health === 'degraded' ? 'dot-warn' : 'dot-err';
      return `<div style="padding:10px 0;border-bottom:1px solid var(--border-0)">
        <div class="spread">
          <div class="row gap-8"><span class="dot ${healthDot}"></span><span style="font-weight:600">${esc(p.display_name)}</span></div>
          <span class="tag tag-${r.health === 'healthy' ? 'ok' : 'warn'}">${esc(r.health || 'unknown')}</span>
        </div>
        <div class="row gap-16 mt-8" style="font-size:11px;color:var(--text-1)">
          <span>Latency: <strong style="color:var(--text-0)">${l.avg_latency_ms || '--'}ms</strong> avg / ${l.p95_latency_ms || '--'}ms p95</span>
          <span>Cost: <strong style="color:var(--text-0)">${c.cost_tier || '--'}</strong></span>
          <span>Success: <strong style="color:var(--text-0)">${pct(r.success_rate)}</strong></span>
        </div>
        <div style="font-size:10px;color:var(--text-2);margin-top:4px">${(p.strengths || []).slice(0, 3).join(' · ')}</div>
      </div>`;
    }).join('');
  }

  // System Health
  const sysEl = document.getElementById('opsSysHealth');
  if (sysEl && health.subsystems) {
    sysEl.innerHTML = `<div class="spread mb-12"><span style="font-weight:600">Overall</span><span class="tag tag-${health.overall === 'healthy' ? 'ok' : 'warn'}">${esc(health.overall)}</span></div>` +
      health.subsystems.map(s => {
        const dot = s.status === 'healthy' ? 'dot-ok' : s.status === 'degraded' ? 'dot-warn' : 'dot-err';
        const label = s.subsystem.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
        return `<div class="prov-row"><span class="dot ${dot}"></span><span style="flex:1">${esc(label)}</span><span class="tag tag-${s.status === 'healthy' ? 'ok' : 'warn'}">${esc(s.status)}</span></div>`;
      }).join('');
  }

  // Governance health
  if (sysEl && govHealth.health) {
    const gh = govHealth.health;
    const govDot = gh.health === 'healthy' ? 'dot-ok' : gh.health === 'drifting' ? 'dot-warn' : 'dot-err';
    sysEl.innerHTML += `<div class="prov-row" style="margin-top:4px"><span class="dot ${govDot}"></span><span style="flex:1">Governance</span><span class="tag tag-${gh.health === 'healthy' ? 'ok' : 'warn'}">${esc(gh.health)}</span></div>`;
    if (gh.exception_count > 0 || gh.drift_signal_count > 0) {
      sysEl.innerHTML += `<div style="font-size:10px;color:var(--text-2);padding-left:19px">${gh.exception_count} exceptions &middot; ${gh.drift_signal_count} drift signals</div>`;
    }
  }

  // Observability
  const obsEl = document.getElementById('opsObservability');
  if (obsEl && observability.metrics) {
    obsEl.innerHTML = observability.metrics.map(m => {
      const label = m.metric.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      return `<div class="spread" style="font-size:12px;padding:4px 0"><span style="color:var(--text-1)">${esc(label)}</span><span style="font-weight:600">${m.value}${m.unit === '%' ? '%' : ' ' + m.unit}</span></div>`;
    }).join('');
  }

  // Memory & Signals
  const memEl = document.getElementById('opsMemory');
  if (memEl) {
    let memHtml = '';

    // Operator profile
    if (memory.operator?.length) {
      const op = memory.operator[0];
      memHtml += `<div class="inset mb-12" style="font-size:12px">
        <div style="font-weight:600;margin-bottom:6px">Operator Profile</div>
        <div style="color:var(--text-1);white-space:pre-wrap">${esc(op.summary || op.content || '')}</div>
      </div>`;
    }

    // Guidance
    memHtml += `<div class="spread mb-12" style="font-size:12px">
      <span style="color:var(--text-1)">Auto-approve recommendation</span>
      <span class="tag tag-${guidance.autoApproveRecommended ? 'ok' : 'warn'}">${guidance.autoApproveRecommended ? 'Recommended' : 'Not recommended'}</span>
    </div>`;
    if (guidance.confidenceNote) memHtml += `<div style="font-size:10px;color:var(--text-2);margin-bottom:12px">${esc(guidance.confidenceNote)}</div>`;

    // Memory statistics
    const memStats = [];
    if (memory.total_count) memStats.push(`${memory.total_count} total items`);
    if (Array.isArray(memory.projects)) memStats.push(`${memory.projects.length} projects`);
    if (Array.isArray(memory.decisions)) memStats.push(`${memory.decisions.length} decisions`);
    if (Array.isArray(memory.artifacts)) memStats.push(`${memory.artifacts.length} artifacts`);
    if (Array.isArray(memory.reports)) memStats.push(`${memory.reports.length} reports`);
    if (Array.isArray(memory.mission_statements)) memStats.push(`${memory.mission_statements.length} missions`);
    if (memStats.length) {
      memHtml += `<div class="g3 mb-12">${memStats.slice(0, 6).map(s => `<div class="metric-card" style="padding:8px"><span class="metric-val" style="font-size:14px">${esc(s.split(' ')[0])}</span><span class="metric-label">${esc(s.split(' ').slice(1).join(' '))}</span></div>`).join('')}</div>`;
    }

    // Engine memory breakdown
    if (memory.engines && typeof memory.engines === 'object') {
      const engEntries = Object.entries(memory.engines).filter(([,v]) => Array.isArray(v) && v.length > 0);
      if (engEntries.length) {
        memHtml += `<div style="font-weight:600;font-size:12px;margin-bottom:8px">Engine Memory (${engEntries.length} engines)</div>`;
        memHtml += `<div class="row gap-4 mb-12" style="flex-wrap:wrap">${engEntries.map(([eng, items]) =>
          `<span class="tag tag-muted" style="cursor:default">${engName(eng)} <strong>${items.length}</strong></span>`
        ).join('')}</div>`;
      }
    }

    // Recent decisions (top 5)
    if (Array.isArray(memory.decisions) && memory.decisions.length) {
      memHtml += `<div style="font-weight:600;font-size:12px;margin-bottom:8px">Recent Decisions (${memory.decisions.length})</div>`;
      memHtml += memory.decisions.slice(0, 5).map(d =>
        `<div style="padding:4px 0;border-bottom:1px solid var(--border-0);font-size:11px;color:var(--text-1)">${esc((d.title || d.summary || '').slice(0, 80))}</div>`
      ).join('');
      memHtml += '<div style="height:12px"></div>';
    }

    // Active signals
    const active = (Array.isArray(signals) ? signals : []).filter(s => s.active);
    if (active.length) {
      memHtml += `<div style="font-weight:600;font-size:12px;margin-bottom:8px">Active Signals (${active.length})</div>`;
      memHtml += active.slice(0, 12).map(s => {
        const confPct = Math.round((s.confidence || 0) * 100);
        return `<div class="signal-row">
          <span class="signal-name">${esc(s.name.replace(/_/g, ' '))}</span>
          <span class="signal-val">${esc(String(s.value))}</span>
          <span class="signal-conf">${confPct}% conf</span>
          <span style="font-size:10px;color:var(--text-2)">${s.sourceEventCount || 0} events</span>
        </div>`;
      }).join('');
    }

    memEl.innerHTML = memHtml || '<div style="font-size:12px;color:var(--text-2)">No memory data available</div>';
  }

  // Cost Breakdown
  const costEl = document.getElementById('opsCostBreakdown');
  if (costEl && costs.byProvider) {
    let costHtml = `<div class="g2 mb-12">
      <div class="metric-card"><span class="metric-val">${fmtCost(costs.today?.cost)}</span><span class="metric-label">Today</span></div>
      <div class="metric-card"><span class="metric-val">${fmtCost(costs.week?.cost)}</span><span class="metric-label">This Week</span></div>
    </div>`;
    costHtml += '<div style="font-weight:600;font-size:12px;margin-bottom:8px">By Provider</div>';
    costHtml += Object.entries(costs.byProvider).map(([name, data]) =>
      `<div class="spread" style="font-size:12px;padding:4px 0;border-bottom:1px solid var(--border-0)">
        <span style="font-weight:500">${esc(name)}</span>
        <div class="row gap-12">
          <span style="color:var(--text-1)">${data.calls || 0} calls</span>
          <span style="font-weight:600">${fmtCost(data.cost)}</span>
        </div>
      </div>`
    ).join('');
    // Daily cost history
    if (Array.isArray(costHistory) && costHistory.length) {
      const dailyCosts = {};
      costHistory.forEach(e => {
        const d = e.date || (e.ts || '').slice(0, 10);
        if (!d) return;
        if (!dailyCosts[d]) dailyCosts[d] = { cost: 0, calls: 0 };
        dailyCosts[d].cost += e.cost || 0;
        dailyCosts[d].calls += 1;
      });
      const days = Object.entries(dailyCosts).sort((a, b) => b[0].localeCompare(a[0])).slice(0, 7);
      if (days.length) {
        costHtml += '<div style="font-weight:600;font-size:12px;margin-top:12px;margin-bottom:8px">Daily History</div>';
        costHtml += days.map(([date, data]) =>
          `<div class="spread" style="font-size:12px;padding:4px 0;border-bottom:1px solid var(--border-0)">
            <span style="color:var(--text-1)">${date}</span>
            <div class="row gap-12"><span style="color:var(--text-2)">${data.calls} calls</span><span style="font-weight:600">${fmtCost(data.cost)}</span></div>
          </div>`
        ).join('');
      }
    }
    costEl.innerHTML = costHtml;
  }
}

async function approveSubtask(id) {
  try {
    const r = await fetch('/api/subtask/' + id + '/approve', { method: 'POST' });
    const d = await r.json();
    toast(d.ok ? 'Approved' : 'Error', d.ok ? 'ok' : 'err');
    loadOps();
    loadCommand();
  } catch { toast('Error', 'err'); }
}

async function rejectSubtask(id) {
  try {
    const r = await fetch('/api/subtask/' + id + '/reject', { method: 'POST' });
    const d = await r.json();
    toast(d.ok ? 'Rejected' : 'Error', d.ok ? 'ok' : 'err');
    loadOps();
  } catch { toast('Error', 'err'); }
}

// ═══ SETTINGS ═══
async function loadSettings() {
  // API Keys
  try {
    const keys = await fetch('/api/diag/keys').then(r => r.json());
    const el = document.getElementById('settingsKeys');
    if (el && keys) {
      el.innerHTML = Object.entries(keys).filter(([k]) => k !== 'envFile').map(([name, info]) => {
        const status = info.status === 'ok' ? 'Configured' : 'Missing';
        const tagCls = info.status === 'ok' ? 'tag-ok' : 'tag-err';
        const prefix = info.prefix ? `<span style="font-family:'SF Mono',monospace;font-size:10px;color:var(--text-2)">${esc(info.prefix)}</span>` : '';
        return `<div class="spread" style="font-size:12px;padding:4px 0"><span style="font-weight:500">${esc(name.toUpperCase())}</span><div class="row gap-8">${prefix}<span class="tag ${tagCls}">${status}</span></div></div>`;
      }).join('');
      if (keys.envFile) {
        el.innerHTML += `<div style="font-size:10px;color:var(--text-2);margin-top:8px;border-top:1px solid var(--border-0);padding-top:8px">.env file: ${keys.envFile}</div>`;
      }
    }
  } catch {}

  // Mission statements
  try {
    const ms = await fetch('/api/mission-statements').then(r => r.json());
    const msEl = document.getElementById('settingsMissions');
    if (msEl && ms.statements?.length) {
      msEl.innerHTML = ms.statements.map(s => {
        const level = s.level === 'operator' ? 'System' : 'Engine';
        const scope = s.level === 'operator' ? '' : engName(s.scope_id);
        return `<div style="padding:8px 0;border-bottom:1px solid var(--border-0);font-size:12px">
          <div class="row gap-8 mb-4"><span class="tag tag-${s.level === 'operator' ? 'accent' : 'muted'}">${level}</span>${scope ? `<span style="font-weight:500">${esc(scope)}</span>` : ''}</div>
          <div style="color:var(--text-1)">${esc((s.statement || '').slice(0, 150))}</div>
        </div>`;
      }).join('');
    } else if (msEl) { msEl.innerHTML = '<div style="font-size:12px;color:var(--text-2)">No mission statements defined</div>'; }
  } catch {}

  // Engines
  try {
    const engines = await fetch('/api/engines').then(r => r.json());
    const el = document.getElementById('settingsEngines');
    if (el && engines.engines) {
      el.innerHTML = engines.engines.map(e =>
        `<div class="spread" style="font-size:12px;padding:4px 0;border-bottom:1px solid var(--border-0)">
          <div><span style="font-weight:500">${esc(e.displayName)}</span><div style="font-size:10px;color:var(--text-2)">${esc(e.description || '')}</div></div>
          <span class="tag tag-muted">${esc(e.id)}</span>
        </div>`
      ).join('');
    }
  } catch {}

  // Cost settings
  try {
    const cs = await fetch('/api/costs/settings').then(r => r.json());
    const el = document.getElementById('settingsCostConfig');
    if (el && cs) {
      el.innerHTML = `
        <div class="spread" style="font-size:12px;padding:4px 0"><span style="color:var(--text-1)">Gemini Model</span><span style="font-family:'SF Mono',monospace">${esc(cs.geminiModel || 'default')}</span></div>
        <div class="spread" style="font-size:12px;padding:4px 0"><span style="color:var(--text-1)">Budget Limit</span><span>${cs.geminibudgetLimit ? fmtCost(cs.geminibudgetLimit) : 'None'}</span></div>
        <div class="spread" style="font-size:12px;padding:4px 0"><span style="color:var(--text-1)">Warning Threshold</span><span>${cs.warningThreshold ? fmtCost(cs.warningThreshold) : 'None'}</span></div>
        <div class="spread" style="font-size:12px;padding:4px 0">
          <span style="color:var(--text-1)">Builder Timeout</span>
          <div class="row gap-4">
            <input id="settingsTimeout" type="number" class="sel" style="width:60px;text-align:center" value="${cs.builderTimeoutMinutes || 10}" min="1" max="60">
            <span>min</span>
            <button class="b b-ghost b-xs" onclick="saveCostSettings()">Save</button>
          </div>
        </div>
      `;
    }
  } catch {}

  // System info
  try {
    const sys = document.getElementById('settingsSystem');
    if (!sys) return;
    const [status, behavior, tasks, costs] = await Promise.all([
      fetch('/api/status').then(r => r.json()).catch(() => ({})),
      fetch('/api/behavior/stats').then(r => r.json()).catch(() => ({})),
      fetch('/api/intake/tasks').then(r => r.json()).catch(() => []),
      fetch('/api/costs').then(r => r.json()).catch(() => ({})),
    ]);
    const done = tasks.filter(t => t.status === 'done').length;
    const total = tasks.length;
    const uptime = status.server?.uptime ? Math.floor(status.server.uptime / 3600) + 'h ' + Math.floor((status.server.uptime % 3600) / 60) + 'm' : '--';
    sys.innerHTML = `
      <div class="spread"><span>Version</span><span style="font-family:monospace">GPO v2.0</span></div>
      <div class="spread"><span>Tasks</span><span>${done} completed / ${total} total</span></div>
      <div class="spread"><span>Cost today</span><span>${fmtCost(costs.today?.cost)}</span></div>
      <div class="spread"><span>Cost this week</span><span>${fmtCost(costs.week?.cost)}</span></div>
      <div class="spread"><span>Behavior events</span><span>${behavior.totalEvents || 0}</span></div>
      <div class="spread"><span>Active signals</span><span>${behavior.activeSignalCount || 0} of ${behavior.signalCount || 0}</span></div>
      <div class="spread"><span>Feedback ratings</span><span>${(behavior.eventsByType?.quality_feedback || 0)}</span></div>
      <div class="spread"><span>Server uptime</span><span>${uptime}</span></div>
      <div class="spread"><span>Node</span><span style="font-family:monospace">${esc(status.node || '--')}</span></div>
      <div class="spread"><span>Worker</span><span class="tag tag-${status.worker?.running ? 'ok' : 'err'}">${status.worker?.running ? 'Running' : 'Stopped'}</span></div>
    `;
  } catch {}

  // Theme
  const theme = localStorage.getItem('gpo-theme') || 'dark';
  const dk = document.getElementById('tDark'), lt = document.getElementById('tLight');
  if (dk) dk.className = theme === 'dark' ? 'b b-sm on' : 'b b-ghost b-sm';
  if (lt) lt.className = theme === 'light' ? 'b b-sm on' : 'b b-ghost b-sm';
}

async function saveCostSettings() {
  const timeout = document.getElementById('settingsTimeout');
  if (!timeout) return;
  try {
    const r = await fetch('/api/costs/settings', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ builderTimeoutMinutes: parseInt(timeout.value) || 10 }) });
    const d = await r.json();
    toast(d.ok ? 'Settings saved' : 'Error saving', d.ok ? 'ok' : 'err');
  } catch { toast('Error saving settings', 'err'); }
}

// ═══ SSE ═══
let _activityRefreshTimer = null;
function connectSSE() {
  const src = new EventSource('/api/events');
  src.onopen = () => {
    const d = document.getElementById('statusDot'); if (d) d.className = 'dot dot-ok dot-pulse';
    const t = document.getElementById('statusText'); if (t) t.textContent = 'Connected';
  };
  src.onerror = () => {
    const d = document.getElementById('statusDot'); if (d) d.className = 'dot dot-err';
    const t = document.getElementById('statusText'); if (t) t.textContent = 'Reconnecting...';
    setTimeout(connectSSE, 5000);
  };
  src.addEventListener('activity', () => {
    if (_activityRefreshTimer) return;
    _activityRefreshTimer = setTimeout(() => {
      _activityRefreshTimer = null;
      const actScreen = document.getElementById('s-activity');
      if (actScreen && actScreen.classList.contains('on')) loadActivity();
      const cmdScreen = document.getElementById('s-command');
      if (cmdScreen && cmdScreen.classList.contains('on')) loadCommand();
    }, 10000);
  });
  // Live task updates — refresh work list and command when tasks change
  let _intakeRefreshTimer = null;
  src.addEventListener('intake-update', () => {
    if (_intakeRefreshTimer) return;
    _intakeRefreshTimer = setTimeout(() => {
      _intakeRefreshTimer = null;
      const workScreen = document.getElementById('s-work');
      const workDetail = document.getElementById('workDetail');
      // Only refresh work list if on work page and not viewing detail
      if (workScreen && workScreen.classList.contains('on') && (!workDetail || workDetail.style.display === 'none')) {
        loadWork();
      }
      const cmdScreen = document.getElementById('s-command');
      if (cmdScreen && cmdScreen.classList.contains('on')) loadCommand();
    }, 5000);
  });
}

// ═══ KEYBOARD SHORTCUTS ═══
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    go('ask');
    const inp = document.getElementById('askInput');
    if (inp) inp.focus();
    return;
  }
  if (e.key === '/' && !['INPUT','TEXTAREA','SELECT'].includes(document.activeElement?.tagName)) {
    e.preventDefault();
    go('ask');
    const inp = document.getElementById('askInput');
    if (inp) inp.focus();
    return;
  }
  if (e.key === 'Escape') {
    const wd = document.getElementById('workDetail');
    if (wd && wd.style.display !== 'none') { closeWorkDetail(); return; }
    const askResult = document.getElementById('askResult');
    if (askResult && askResult.style.display !== 'none') { askResult.style.display = 'none'; return; }
    go('command');
  }
});

// ═══ INIT ═══
connectSSE();
loadCommand();
loadActivity();
