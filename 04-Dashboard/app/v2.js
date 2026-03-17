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
const SCREENS = ['home', 'ask', 'results', 'evidence', 'approvals', 'activity', 'settings'];
function go(r) {
  SCREENS.forEach(s => {
    const el = document.getElementById('s-' + s);
    if (el) el.classList.toggle('on', s === r);
  });
  document.querySelectorAll('.v2-nav-item,.mob-tab').forEach(n => n.classList.toggle('on', n.dataset.r === r));
  if (r === 'home') loadHome();
  if (r === 'results') loadResults();
  if (r === 'approvals') loadApprovals();
  if (r === 'activity') loadActivity();
  if (r === 'settings') loadSettings();
  if (r === 'ask') { populateEngineSelect(); loadAskRecent(); }
}
// Nav click handlers
document.querySelectorAll('.v2-nav-item,.mob-tab').forEach(n => n.addEventListener('click', e => { e.preventDefault(); go(n.dataset.r); }));
// Screen visibility
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

// Engine display names
const ENG = {code:'Code',writing:'Writing',research:'Research',learning:'Learning',ops:'Life Ops',health:'Health',shopping:'Shopping',travel:'Travel',finance:'Finance',startup:'Startup',career:'Career',screenwriting:'Creative',film:'Film',music:'Music',news:'News',general:'General',
  topranker:'Startup',careeregine:'Career',wealthresearch:'Finance',personalops:'Life Ops',newsroom:'News',founder2founder:'Film'};
function engName(d) { return ENG[d] || d; }

// Operator-facing status
const STATUS = {intake:'Submitted',deliberating:'Planning',planned:'Ready',executing:'Working',waiting_approval:'Needs Review',done:'Complete',failed:'Issue'};
function statusLabel(s) { return STATUS[s] || s; }
function statusTag(s) {
  const cls = s === 'done' ? 'tag-ok' : s === 'failed' ? 'tag-err' : ['executing','deliberating','waiting_approval'].includes(s) ? 'tag-warn' : 'tag-muted';
  return `<span class="tag ${cls}">${esc(statusLabel(s))}</span>`;
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

// Extract sources from text
function extractSources(text) {
  if (!text) return [];
  const urls = text.match(/https?:\/\/[^\s)>\]"]+/g) || [];
  return [...new Set(urls)].slice(0, 10);
}

// ═══ HOME ═══
async function loadHome() {
  // Greeting
  const hour = new Date().getHours();
  const g = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const ge = document.getElementById('greeting');
  if (ge) ge.textContent = g;
  const de = document.getElementById('dateText');
  if (de) de.textContent = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  // Status
  try {
    const st = await fetch('/api/status').then(r => r.json());
    const se = document.getElementById('homeStatus');
    if (se && st.worker) se.textContent = st.worker === 'idle' ? 'System ready' : 'Working...';
  } catch {}

  // Costs
  try {
    const c = await fetch('/api/costs').then(r => r.json());
    if (c.today) { const el = document.getElementById('hcToday'); if (el) el.textContent = '$' + (c.today.cost || 0).toFixed(2); }
    if (c.week) { const el = document.getElementById('hcWeek'); if (el) el.textContent = '$' + (c.week.cost || 0).toFixed(2); }
    if (c.today) { const el = document.getElementById('hcCalls'); if (el) el.textContent = c.today.calls || 0; }
  } catch {}

  // Task count
  try {
    const t = await fetch('/api/intake/tasks').then(r => r.json());
    const done = t.filter(x => x.status === 'done').length;
    const el = document.getElementById('hcDone'); if (el) el.textContent = done;
    // Recent results
    const recent = t.filter(x => x.status === 'done').slice(-5).reverse();
    const re = document.getElementById('homeResults');
    if (re && recent.length) {
      re.innerHTML = recent.map(r => `<div class="card card-click" style="padding:10px 14px;margin-bottom:6px" onclick="viewResult('${r.task_id}')">
        <div class="spread"><span style="font-size:13px;font-weight:500">${esc((r.title || '').slice(0, 60))}</span><span class="tag tag-muted">${engName(r.domain)}</span></div>
        <div style="font-size:10px;color:var(--text-2);margin-top:3px">${timeAgo(r.updated_at || r.created_at)}</div>
      </div>`).join('');
    }
    // Today summary
    const today = new Date().toISOString().slice(0, 10);
    const todayTasks = t.filter(x => (x.created_at || '').startsWith(today));
    const todayDone = todayTasks.filter(x => x.status === 'done').length;
    const todayRunning = todayTasks.filter(x => ['executing', 'deliberating'].includes(x.status)).length;
    const tc = document.getElementById('homeTodayContent');
    if (tc) tc.innerHTML = `<div>${todayDone} completed${todayRunning ? ', ' + todayRunning + ' running' : ''}</div><div style="color:var(--text-2);margin-top:4px">${todayTasks.length} tasks today</div>`;
  } catch {}

  // Pending approvals
  try {
    const ap = await fetch('/api/intake/pending-approvals').then(r => r.json());
    const attn = document.getElementById('homeAttention');
    if (attn && ap.length > 0) {
      attn.innerHTML = `<div class="card card-warn" style="margin-bottom:16px">
        <div class="spread"><strong style="color:var(--warn)">${ap.length} pending approval${ap.length > 1 ? 's' : ''}</strong><button class="b b-sm b-ok" onclick="go('approvals')">Review</button></div>
      </div>`;
    } else if (attn) { attn.innerHTML = ''; }
    const badge = document.getElementById('approvalCount');
    if (badge) { badge.textContent = ap.length; badge.style.display = ap.length > 0 ? '' : 'none'; }
  } catch {}
}

// ═══ ASK ═══
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
        `<div class="card card-click" style="padding:10px 14px;margin-bottom:6px" onclick="viewResult('${t.task_id}')">
          <div class="spread"><span style="font-size:12px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((t.title || '').slice(0, 55))}</span><span class="tag tag-muted">${engName(t.engine || t.domain)}</span></div>
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
  document.getElementById('askProgress').innerHTML = '<div class="card"><div class="progress-panel"><div class="progress-step step-active"><div class="step-dot">●</div><div class="step-label">Submitting request...</div></div></div></div>';
  document.getElementById('askResult').style.display = 'none';

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

      // Progress panel
      const pp = document.getElementById('askProgress');
      if (pp) {
        let steps = subs.map((s, i) => {
          const isDone = s.status === 'done';
          const isRunning = s.status === 'running' || s.status === 'builder_running';
          const cls = isDone ? 'step-done' : isRunning ? 'step-active' : 'step-pending';
          const icon = isDone ? '✓' : isRunning ? '●' : '○';
          const STEP_LABELS = { research: 'Searching the web', report: 'Writing response', strategy: 'Analyzing and comparing', implement: 'Making code changes', audit: 'Reviewing quality', locate_files: 'Finding relevant files' };
          const label = STEP_LABELS[s.stage] || s.title || 'Processing';
          const provider = s.assigned_model === 'perplexity' ? 'Web search' : s.assigned_model === 'openai' ? 'AI synthesis' : s.assigned_model === 'gemini' ? 'Analysis' : '';
          return `<div class="progress-step ${cls}"><div class="step-dot">${icon}</div><div class="step-label">${esc(label)}${provider && !isDone ? ' <span style="color:var(--text-2);font-size:10px">· ' + provider + '</span>' : ''}</div><div class="step-time">${isDone ? '✓' : elapsed + 's'}</div></div>`;
        });
        const doneCount = subs.filter(s => s.status === 'done').length;
        const totalCount = subs.length || 1;
        const pct = Math.round(doneCount / totalCount * 100);
        if (!steps.length) steps = [`<div class="progress-step step-active"><div class="step-dot">●</div><div class="step-label">${statusLabel(task.status)}...</div><div class="step-time">${elapsed}s</div></div>`];
        const progressBar = totalCount > 1 ? `<div style="padding:0 14px 10px"><div style="height:3px;background:var(--border-1);border-radius:2px;overflow:hidden"><div style="height:100%;width:${pct}%;background:var(--accent);border-radius:2px;transition:width .3s ease"></div></div><div style="font-size:9px;color:var(--text-2);margin-top:4px;text-align:right">${doneCount}/${totalCount} steps</div></div>` : '';
        pp.innerHTML = `<div class="card"><div class="spread" style="padding:12px 14px;border-bottom:1px solid var(--border-0)"><span style="font-size:13px;font-weight:500">${esc((task.title || '').slice(0, 50))}</span><span class="tag tag-muted">${engName(task.domain)}</span></div><div class="progress-panel" style="padding:8px">${steps.join('')}</div>${progressBar}</div>`;
      }

      // Done?
      if (task.status === 'done' || task.status === 'failed') {
        clearInterval(_askPoll); _askPoll = null;
        document.getElementById('askBtn').disabled = false;
        if (task.status === 'done') {
          toast('Done ✓', 'ok');
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
    <div class="result-head"><span class="tag tag-muted">${engName(task.domain)}</span><h3>${esc((task.title || '').slice(0, 60))}</h3><span style="font-size:10px;color:var(--text-2)">${timeAgo(task.updated_at)}</span></div>
    <div class="result-body">${md(output)}</div>
    ${sourcesHtml}
    <div class="result-actions">
      <a href="/api/intake/task/${task.task_id}/export?fmt=md" download class="b b-line b-sm" style="text-decoration:none">&#128229; Download</a>
      <button class="b b-ghost b-sm" onclick="viewResult('${task.task_id}')">&#128270; Evidence</button>
    </div>
    <div class="fb" id="fb-${task.task_id}">
      <span class="fb-q">Was this helpful?</span>
      <button class="b b-ok b-sm" onclick="sendFeedback('${task.task_id}','good',this)">Yes</button>
      <button class="b b-ghost b-sm" onclick="sendFeedback('${task.task_id}','needs_improvement',this)">Could be better</button>
      <button class="b b-err b-sm" onclick="sendFeedback('${task.task_id}','bad',this)">No</button>
    </div>
  </div>`;

  // Hide progress
  const pp = document.getElementById('askProgress');
  if (pp) pp.style.display = 'none';
}

async function sendFeedback(taskId, rating, btn) {
  try {
    await fetch('/api/intake/task/' + taskId + '/feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ rating }) });
    const fb = document.getElementById('fb-' + taskId);
    if (fb) fb.innerHTML = `<span class="fb-done">Feedback recorded — thank you</span>`;
    toast('Feedback recorded', 'ok');
  } catch { toast('Feedback failed', 'err'); }
}

// ═══ RESULTS ═══
let _allResults = [];
async function loadResults() {
  const el = document.getElementById('resultsList');
  const ff = document.getElementById('resultFilters');
  if (!el) return;
  el.innerHTML = '<div class="wait">Loading results...</div>';
  try {
    const tasks = await fetch('/api/intake/tasks').then(r => r.json());
    _allResults = tasks.filter(t => t.status === 'done').reverse();

    // Build engine filter
    const engines = [...new Set(_allResults.map(t => t.engine || t.domain))];
    if (ff) {
      ff.innerHTML = `<button class="b b-sm on" onclick="filterResults('')">All (${_allResults.length})</button>` +
        engines.slice(0, 8).map(e => {
          const count = _allResults.filter(t => (t.engine || t.domain) === e).length;
          return `<button class="b b-ghost b-sm" onclick="filterResults('${e}')">${engName(e)} (${count})</button>`;
        }).join('');
    }
    renderResults(_allResults.slice(0, 50));
  } catch { el.innerHTML = '<div class="nil"><span class="nil-desc">Error loading results</span></div>'; }
}

let _resultFilter = '';
function filterResults(engine) {
  _resultFilter = engine;
  const ff = document.getElementById('resultFilters');
  if (ff) ff.querySelectorAll('.b').forEach(b => b.classList.toggle('on', b.textContent.startsWith(engine ? engName(engine) : 'All')));
  applyResultFilters();
}

function searchResults(query) {
  applyResultFilters(query);
}

function applyResultFilters(query) {
  const q = (query || document.getElementById('resultSearch')?.value || '').toLowerCase().trim();
  let filtered = _resultFilter ? _allResults.filter(t => (t.engine || t.domain) === _resultFilter) : _allResults;
  if (q) filtered = filtered.filter(t => (t.title || '').toLowerCase().includes(q) || (t.raw_request || '').toLowerCase().includes(q) || (t.board_deliberation?.interpreted_objective || '').toLowerCase().includes(q));
  renderResults(filtered.slice(0, 50));
}

let _resultsShown = 30;
function renderResults(tasks) {
  const el = document.getElementById('resultsList');
  if (!el) return;
  if (!tasks.length) { el.innerHTML = '<div class="nil"><span class="nil-icon">&#9671;</span><span class="nil-title">No results</span></div>'; return; }
  const visible = tasks.slice(0, _resultsShown);
  el.innerHTML = visible.map(t => {
    const preview = t.board_deliberation?.interpreted_objective || '';
    return `<div class="card card-click" style="padding:12px 14px;margin-bottom:8px" onclick="viewResult('${t.task_id}')">
      <div style="font-size:13px;font-weight:500;margin-bottom:4px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc((t.title || '').slice(0, 70))}</div>
      ${preview ? `<div style="font-size:11px;color:var(--text-1);margin-bottom:6px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${esc(preview.slice(0, 90))}</div>` : ''}
      <div class="row gap-12" style="font-size:10px;color:var(--text-2)">
        <span class="tag tag-muted">${engName(t.engine || t.domain)}</span>
        <span>${fmtDate(t.updated_at || t.created_at)}</span>
        <span style="margin-left:auto">${statusTag(t.status)}</span>
      </div>
    </div>`;
  }).join('');
  if (tasks.length > _resultsShown) {
    el.innerHTML += `<div style="text-align:center;padding:12px"><button class="b b-ghost b-sm" onclick="_resultsShown+=30;applyResultFilters()">Show more (${tasks.length - _resultsShown} remaining)</button></div>`;
  }
}

async function viewResult(taskId) {
  // Show loading immediately on evidence screen, then load
  const el = document.getElementById('evidenceContent');
  if (el) el.innerHTML = '<div class="wait">Loading...</div>';
  go('evidence');
  await viewEvidence(taskId);
}

// ═══ EVIDENCE ═══
async function viewEvidence(taskId) {
  const el = document.getElementById('evidenceContent');
  if (!el) return;
  el.innerHTML = '<div class="wait">Loading evidence...</div>';
  try {
    const d = await fetch('/api/intake/task/' + taskId).then(r => r.json());
    const task = d.task, subs = d.subtasks || [], delib = task.board_deliberation;
    const output = subs.filter(s => s.output).map(s => s.output).join('\n\n');
    const sources = extractSources(output);

    let html = `<div style="margin-bottom:12px"><button class="b b-ghost b-sm" onclick="go('results')">&#8592; Back to Results</button></div>
    <div class="card result" style="margin-bottom:16px">
      <div class="result-head"><span class="tag tag-muted">${engName(task.domain)}</span><h3>${esc((task.title || '').slice(0, 60))}</h3>${statusTag(task.status)}<span style="font-size:10px;color:var(--text-2);margin-left:8px">${fmtDate(task.updated_at || task.created_at)}</span></div>
      <div class="result-body">${md(output)}</div>
      ${sources.length ? `<div class="result-sources"><h4>Sources (${sources.length})</h4>${sources.map(u => `<a href="${esc(u)}" target="_blank" class="source-link">&#128279; ${esc(u.replace(/https?:\/\//,'').split('/')[0])}</a>`).join('')}</div>` : ''}
      <div class="result-actions">
        <a href="/api/intake/task/${task.task_id}/export?fmt=md" download class="b b-line b-sm" style="text-decoration:none">&#128229; Download MD</a>
        <a href="/api/intake/task/${task.task_id}/export?fmt=json" download class="b b-ghost b-sm" style="text-decoration:none">&#128229; JSON</a>
      </div>
      <div class="fb" id="fb-${task.task_id}">
        <span class="fb-q">Was this helpful?</span>
        <button class="b b-ok b-sm" onclick="sendFeedback('${task.task_id}','good',this)">Yes</button>
        <button class="b b-ghost b-sm" onclick="sendFeedback('${task.task_id}','needs_improvement',this)">Could be better</button>
        <button class="b b-err b-sm" onclick="sendFeedback('${task.task_id}','bad',this)">No</button>
      </div>
    </div>`;

    // Board deliberation
    if (delib) {
      html += `<div class="card" style="margin-bottom:16px"><div class="hd"><h3>Board Deliberation</h3></div>
        <div class="stack" style="font-size:12px;color:var(--text-1)">
          <div><strong>Objective:</strong> ${esc(delib.interpreted_objective)}</div>
          <div><strong>Strategy:</strong> ${esc(delib.recommended_strategy)}</div>
          ${delib.expected_outcome ? `<div><strong>Expected:</strong> ${esc(delib.expected_outcome)}</div>` : ''}
          <div class="row gap-12 mt-8"><span>Risk: ${statusTag(delib.risk_level || 'green')}</span><span style="font-size:10px;color:var(--text-2)">Model: ${esc(delib.model_used || '')} · ${delib.tokens_used || 0} tokens</span></div>
        </div>
      </div>`;
    }

    // Subtask execution chain
    if (subs.length) {
      html += `<div class="card"><div class="hd"><h3>Execution Chain (${subs.filter(s => s.status === 'done').length}/${subs.length} steps)</h3></div>
        <div class="stack">${subs.map((s, i) => {
          const stag = s.status === 'done' ? 'tag-ok' : s.status === 'failed' ? 'tag-err' : 'tag-muted';
          const STEP = { research: 'Web Search', report: 'Synthesis', strategy: 'Analysis', implement: 'Code', audit: 'Review', locate_files: 'File Scan' };
          const stepName = STEP[s.stage] || s.stage;
          const provName = s.assigned_model === 'perplexity' ? 'Perplexity' : s.assigned_model === 'openai' ? 'OpenAI' : s.assigned_model === 'gemini' ? 'Gemini' : s.assigned_model || '';
          const hasOutput = s.output && s.output.length > 50;
          const outputId = 'sub-out-' + i;
          return `<div style="padding:8px 0;border-bottom:1px solid var(--border-0)">
            <div class="spread" style="font-size:12px">
              <div class="row gap-4"><span style="font-weight:500">${esc(s.title || stepName)}</span></div>
              <div class="row gap-4"><span class="tag tag-muted">${esc(provName)}</span><span class="tag tag-muted">${esc(stepName)}</span><span class="tag ${stag}">${statusLabel(s.status)}</span></div>
            </div>
            ${hasOutput ? `<div style="margin-top:4px"><button class="b b-ghost b-xs" onclick="document.getElementById('${outputId}').style.display=document.getElementById('${outputId}').style.display==='none'?'block':'none'">Toggle output (${Math.round(s.output.length/1000)}K chars)</button><div id="${outputId}" style="display:none;margin-top:6px" class="inset"><div class="result-body" style="font-size:11px;max-height:300px;overflow-y:auto">${md(s.output)}</div></div></div>` : ''}
          </div>`;
        }).join('')}</div>
      </div>`;
    }

    el.innerHTML = html;
  } catch { el.innerHTML = '<div class="nil"><span class="nil-desc">Error loading evidence</span></div>'; }
}

// ═══ APPROVALS ═══
async function loadApprovals() {
  const el = document.getElementById('approvalsList');
  if (!el) return;
  try {
    const ap = await fetch('/api/intake/pending-approvals').then(r => r.json());
    if (!ap.length) { el.innerHTML = '<div class="nil"><span class="nil-icon">&#9745;</span><span class="nil-title">All clear</span><span class="nil-desc">No pending approvals</span></div>'; return; }
    el.innerHTML = ap.map(s => `<div class="card card-warn" style="padding:12px;margin-bottom:8px">
      <div class="spread"><span style="font-size:13px;font-weight:500">${esc(s.title)}</span><span class="tag tag-warn">${esc(s.stage)}</span></div>
      <div style="font-size:11px;color:var(--text-1);margin-top:4px">from: ${esc(s.parent_title || '')}</div>
      <div class="row gap-4 mt-8"><button class="b b-ok b-sm" onclick="approveSubtask('${s.subtask_id}')">Approve</button><button class="b b-ghost b-sm" onclick="viewEvidence('${s.parent_task_id}')">Details</button></div>
    </div>`).join('');
  } catch { el.innerHTML = '<div class="nil"><span class="nil-desc">Error loading approvals</span></div>'; }
}

async function approveSubtask(id) {
  try {
    const r = await fetch('/api/subtask/' + id + '/approve', { method: 'POST' });
    const d = await r.json();
    toast(d.ok ? 'Approved' : 'Error', d.ok ? 'ok' : 'err');
    loadApprovals();
    loadHome();
  } catch { toast('Error', 'err'); }
}

// ═══ SETTINGS ═══
async function loadSettings() {
  try {
    const engines = await fetch('/api/engines').then(r => r.json());
    const el = document.getElementById('settingsEngines');
    if (el && engines.engines) {
      el.innerHTML = engines.engines.map(e => `<div class="spread" style="font-size:12px"><span>${esc(e.displayName)}</span><span class="tag tag-muted">${esc(e.id)}</span></div>`).join('');
    }
  } catch {}
  try {
    const keys = await fetch('/api/diag/keys').then(r => r.json());
    if (keys) {
      ['OpenAI', 'Perplexity', 'Gemini'].forEach(p => {
        const el = document.getElementById('sp' + p);
        const k = keys[p.toLowerCase()] || keys[p];
        if (el && k) { el.textContent = k.status || '--'; el.className = 'tag ' + (k.status === 'OK' ? 'tag-ok' : 'tag-err'); }
      });
    }
  } catch {}
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

async function loadActivity() {
  const el = document.getElementById('actList');
  if (!el) return;
  el.innerHTML = '<div class="wait">Loading activity...</div>';
  try {
    const data = await fetch('/api/behavior/events').then(r => r.json());
    const events = (data.recent || []).reverse();
    if (!events.length) { el.innerHTML = '<div class="nil"><span class="nil-desc">No activity yet</span></div>'; return; }
    el.innerHTML = events.map(e => {
      const label = EVT_LABELS[e.type] || e.type.replace(/_/g, ' ');
      const engine = e.engine ? `<span class="tag tag-muted">${engName(e.engine)}</span>` : '';
      const detail = e.metadata?.title ? esc(e.metadata.title.slice(0, 50)) : e.metadata?.rating ? `Rating: ${e.metadata.rating}` : e.metadata?.comment ? esc(e.metadata.comment.slice(0, 40)) : '';
      const ts = e.timestamp ? new Date(e.timestamp) : null;
      const timeStr = ts ? ts.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) : '';
      const dateStr = ts ? ts.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '';
      return `<div class="ev">
        <div class="ev-time">${dateStr}<br>${timeStr}</div>
        ${evtIcon(e.type)}
        <div class="ev-text"><strong>${esc(label)}</strong>${detail ? ' — ' + detail : ''} ${engine}</div>
      </div>`;
    }).join('');

    // Also populate home activity
    const homeAct = document.getElementById('homeActivity');
    if (homeAct && events.length) {
      homeAct.innerHTML = events.slice(0, 8).map(e => {
        const label = EVT_LABELS[e.type] || e.type.replace(/_/g, ' ');
        return `<div class="ev"><div class="ev-time">${timeAgo(e.timestamp)}</div>${evtIcon(e.type)}<div class="ev-text">${esc(label)}${e.engine ? ' · ' + engName(e.engine) : ''}</div></div>`;
      }).join('');
    }
  } catch { el.innerHTML = '<div class="nil"><span class="nil-desc">Error loading activity</span></div>'; }
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
    // Auto-reconnect after 5s
    setTimeout(connectSSE, 5000);
  };
  // On any activity event, refresh activity and home if visible
  src.addEventListener('activity', () => {
    // Debounce: don't refresh more than once per 10 seconds
    if (_activityRefreshTimer) return;
    _activityRefreshTimer = setTimeout(() => {
      _activityRefreshTimer = null;
      const actScreen = document.getElementById('s-activity');
      if (actScreen && actScreen.classList.contains('on')) loadActivity();
      const homeScreen = document.getElementById('s-home');
      if (homeScreen && homeScreen.classList.contains('on')) loadHome();
    }, 10000);
  });
}

// ═══ INIT ═══
connectSSE();
loadHome();
loadActivity();
