// RPGPO Unified Task Intake + Subtask Store
// File-backed intake tasks and subtasks with lifecycle management.
// Safe: read/write only to state/ directory.

const fs = require('fs');
const path = require('path');

const TASKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'intake-tasks.json');
const SUBTASKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'subtasks.json');

function ensureFile(file) {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
}

function readStore(file) {
  ensureFile(file);
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return []; }
}

function writeStore(file, data) {
  ensureFile(file);
  if (data.length > 200) data = data.slice(-200);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function uid() { return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function stid() { return 'st_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// --- Domain detection ---

const DOMAIN_KEYWORDS = {
  topranker: ['topranker', 'leaderboard', 'rankings', 'local business', 'expo', 'react native'],
  careeregine: ['career', 'resume', 'job'],
  founder2founder: ['founder', 'f2f', 'community'],
  wealthresearch: ['wealth', 'investment', 'finance', 'portfolio'],
  newsroom: ['news', 'journalism', 'media'],
  screenwriting: ['screenplay', 'script', 'film', 'movie'],
  music: ['music', 'song', 'album', 'production'],
  personalops: ['personal', 'ops', 'admin', 'household'],
};

function detectDomain(text) {
  const lower = (text || '').toLowerCase();
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some(k => lower.includes(k))) return domain;
  }
  return 'general';
}

// --- Intake Task CRUD ---

// statuses: intake, deliberating, planned, executing, waiting_approval, done, failed, canceled
function createTask(opts) {
  const tasks = readStore(TASKS_FILE);
  const raw = opts.raw_request || '';
  const task = {
    task_id: uid(),
    title: opts.title || raw.split('\n')[0].slice(0, 80) || 'Untitled task',
    raw_request: raw,
    domain: opts.domain || detectDomain(raw),
    desired_outcome: opts.desired_outcome || '',
    constraints: opts.constraints || '',
    urgency: opts.urgency || 'normal',  // low, normal, high, critical
    risk_level: 'green',
    success_criteria: opts.success_criteria || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'intake',
    board_deliberation: null,
    execution_plan: null,
  };
  tasks.unshift(task);
  writeStore(TASKS_FILE, tasks);
  return task;
}

function getTask(taskId) {
  return readStore(TASKS_FILE).find(t => t.task_id === taskId) || null;
}

function getAllTasks() {
  return readStore(TASKS_FILE);
}

function updateTask(taskId, updates) {
  const tasks = readStore(TASKS_FILE);
  const idx = tasks.findIndex(t => t.task_id === taskId);
  if (idx === -1) return null;
  Object.assign(tasks[idx], updates, { updated_at: new Date().toISOString() });
  writeStore(TASKS_FILE, tasks);
  return tasks[idx];
}

// --- Subtask CRUD ---

// statuses: proposed, queued, running, waiting_approval, done, failed, blocked, canceled
function createSubtask(opts) {
  const subtasks = readStore(SUBTASKS_FILE);
  const st = {
    subtask_id: stid(),
    parent_task_id: opts.parent_task_id,
    title: opts.title || 'Untitled subtask',
    domain: opts.domain || 'general',
    stage: opts.stage || 'audit',  // audit, decide, implement, report
    assigned_role: opts.assigned_role || 'general',
    assigned_model: opts.assigned_model || 'openai',
    expected_output: opts.expected_output || '',
    prompt: opts.prompt || '',
    files_to_read: opts.files_to_read || [],
    files_to_write: opts.files_to_write || [],
    risk_level: opts.risk_level || 'green',
    status: 'proposed',
    approval_required: opts.approval_required || false,
    next_subtasks: opts.next_subtasks || [],
    depends_on: opts.depends_on || [],
    order: opts.order || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    output: null,
    error: null,
    cost: null,
  };
  subtasks.unshift(st);
  writeStore(SUBTASKS_FILE, subtasks);
  return st;
}

function getSubtask(subtaskId) {
  return readStore(SUBTASKS_FILE).find(s => s.subtask_id === subtaskId) || null;
}

function getSubtasksForTask(taskId) {
  return readStore(SUBTASKS_FILE)
    .filter(s => s.parent_task_id === taskId)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
}

function getAllSubtasks() {
  return readStore(SUBTASKS_FILE);
}

function updateSubtask(subtaskId, updates) {
  const subtasks = readStore(SUBTASKS_FILE);
  const idx = subtasks.findIndex(s => s.subtask_id === subtaskId);
  if (idx === -1) return null;
  Object.assign(subtasks[idx], updates, { updated_at: new Date().toISOString() });
  writeStore(SUBTASKS_FILE, subtasks);
  return subtasks[idx];
}

// --- Subtask summary for a task ---

function getTaskProgress(taskId) {
  const subs = getSubtasksForTask(taskId);
  const counts = { proposed: 0, queued: 0, running: 0, waiting_approval: 0, done: 0, failed: 0, blocked: 0, canceled: 0 };
  for (const s of subs) counts[s.status] = (counts[s.status] || 0) + 1;
  return { total: subs.length, ...counts };
}

module.exports = {
  detectDomain,
  createTask, getTask, getAllTasks, updateTask,
  createSubtask, getSubtask, getSubtasksForTask, getAllSubtasks, updateSubtask,
  getTaskProgress,
};
