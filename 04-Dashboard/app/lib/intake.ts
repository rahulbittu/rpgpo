import type {
  IntakeTask,
  Subtask,
  Domain,
  TaskStatus,
  SubtaskStatus,
  Urgency,
  RiskLevel,
  TaskProgress,
} from './types';

const fs = require('fs');
const path = require('path');
const { validateTaskArray, validateSubtaskArray } = require('./validate') as {
  validateTaskArray(raw: unknown): IntakeTask[];
  validateSubtaskArray(raw: unknown): Subtask[];
};

const TASKS_FILE: string = path.resolve(__dirname, '..', '..', 'state', 'intake-tasks.json');
const SUBTASKS_FILE: string = path.resolve(__dirname, '..', '..', 'state', 'subtasks.json');

function ensureFile(file: string): void {
  const dir: string = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, '[]');
}

function readStore<T = any>(file: string): T[] {
  ensureFile(file);
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return []; }
}

function writeStore<T>(file: string, data: T[]): void {
  ensureFile(file);
  if (data.length > 5000) data = data.slice(-5000);
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

function uid(): string { return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function stid(): string { return 'st_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

const DOMAIN_KEYWORDS: Record<string, string[]> = {
  topranker: ['topranker', 'leaderboard', 'rankings', 'local business', 'expo', 'react native'],
  careeregine: ['career', 'resume', 'job', 'salary', 'hiring', 'interview', 'data engineer', 'job search', 'job market', 'compensation'],
  founder2founder: ['founder', 'f2f', 'community'],
  wealthresearch: ['wealth', 'investment', 'finance', 'portfolio', 'passive income', 'side hustle', 'side project', 'income ideas', 'money'],
  newsroom: ['news', 'journalism', 'media', 'headline', 'trending', 'current events', 'breaking'],
  writing: ['email', 'draft', 'write', 'memo', 'prd', 'spec', 'sop', 'runbook', 'document', 'proposal', 'letter', 'rewrite', 'summarize', 'executive summary'],
  research: ['research', 'analyze', 'compare', 'investigate', 'deep dive', 'market analysis', 'competitive analysis', 'assessment'],
  learning: ['teach', 'explain', 'tutor', 'learn', 'study plan', 'quiz', 'course', 'curriculum', 'master'],
  shopping: ['buy', 'purchase', 'compare products', 'recommendation', 'shopping', 'best price', 'review products'],
  travel: ['travel', 'trip', 'flight', 'hotel', 'itinerary', 'relocation', 'moving to'],
  health: ['fitness', 'workout', 'diet', 'health', 'wellness', 'exercise', 'nutrition', 'sleep'],
  screenwriting: ['screenplay', 'script', 'film', 'movie'],
  music: ['music', 'song', 'album', 'production'],
  personalops: ['plan my week', 'schedule', 'time block', 'calendar', 'routine', 'habit'],
};

// Resolve domain aliases from the intake form (e.g., 'career' → 'careeregine')
const INTAKE_ALIASES: Record<string, string> = {
  career: 'careeregine',
  finance: 'wealthresearch',
  home: 'personalops',
};

function detectDomain(text: string): Domain {
  // Use the domain-router's scored matching instead of simple first-match
  try {
    const router = require('./domain-router') as { routeRequest(req: string): { domain: string; confidence: number } };
    const result = router.routeRequest(text);
    if (result.confidence > 0.2) return result.domain as Domain;
  } catch { /* fallback to simple matching */ }
  const lower = (text || '').toLowerCase();
  for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
    if (keywords.some((k: string) => lower.includes(k))) return domain as Domain;
  }
  return 'general';
}

function resolveDomainAlias(domain: string): Domain {
  return (INTAKE_ALIASES[domain] || domain) as Domain;
}

function createTask(opts: Partial<IntakeTask> & { raw_request?: string; project_id?: string }): IntakeTask {
  const tasks = readStore<IntakeTask>(TASKS_FILE);
  const raw = opts.raw_request || '';
  const rawDomain = opts.domain || detectDomain(raw);
  const domain = resolveDomainAlias(rawDomain as string);

  // Resolve project_id — use provided, or default for domain
  let projectId = opts.project_id;
  try {
    const projects = require('./projects') as { resolveProjectId(d: Domain, pid?: string): string };
    projectId = projects.resolveProjectId(domain, projectId);
  } catch { /* projects module not loaded yet */ }

  const task: IntakeTask = {
    task_id: uid(),
    title: opts.title || raw.split('\n')[0].slice(0, 80) || 'Untitled task',
    raw_request: raw,
    domain,
    desired_outcome: opts.desired_outcome || '',
    constraints: opts.constraints || '',
    urgency: opts.urgency || 'normal',
    risk_level: 'green',
    success_criteria: opts.success_criteria || '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    status: 'intake',
    board_deliberation: null,
    execution_plan: null,
  };
  // Attach project_id (not in IntakeTask type yet — use extension)
  (task as IntakeTask & { project_id?: string }).project_id = projectId;

  tasks.unshift(task);
  writeStore<IntakeTask>(TASKS_FILE, tasks);
  return task;
}

function getTask(taskId: string): IntakeTask | null {
  return readStore<IntakeTask>(TASKS_FILE).find((t: IntakeTask) => t.task_id === taskId) || null;
}

function getAllTasks(): IntakeTask[] {
  return validateTaskArray(readStore<IntakeTask>(TASKS_FILE));
}

function updateTask(taskId: string, updates: Partial<IntakeTask>): IntakeTask | null {
  const tasks = readStore<IntakeTask>(TASKS_FILE);
  const idx = tasks.findIndex((t: IntakeTask) => t.task_id === taskId);
  if (idx === -1) return null;
  Object.assign(tasks[idx], updates, { updated_at: new Date().toISOString() });
  writeStore<IntakeTask>(TASKS_FILE, tasks);
  return tasks[idx];
}

function createSubtask(opts: Partial<Subtask> & { parent_task_id: string }): Subtask {
  const subtasks = readStore<Subtask>(SUBTASKS_FILE);
  const st: Subtask = {
    subtask_id: stid(),
    parent_task_id: opts.parent_task_id,
    title: opts.title || 'Untitled subtask',
    domain: opts.domain || 'general',
    stage: opts.stage || 'audit',
    assigned_role: opts.assigned_role || 'general',
    assigned_model: opts.assigned_model || 'openai',
    expected_output: opts.expected_output || '',
    prompt: opts.prompt || '',
    files_to_read: opts.files_to_read || [],
    files_to_write: opts.files_to_write || [],
    risk_level: opts.risk_level || 'green',
    status: 'proposed',
    approval_required: opts.approval_required || false,
    depends_on: opts.depends_on || [],
    order: opts.order || 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    output: null,
    error: null,
    cost: null,
    // Builder-specific fields
    builder_outcome: null,
    builder_phase: null,
    outcome_type: null,
    code_modified: null,
    files_changed: [],
    file_scope: null,
    diff_summary: null,
    diff_detail: null,
    target_files: null,
    report_file: null,
    prompt_file: null,
    what_done: null,
    builder_diagnostics: null,
    revision_notes: null,
    next_subtasks: (opts as any).next_subtasks || [],
  } as Subtask;
  subtasks.unshift(st);
  writeStore<Subtask>(SUBTASKS_FILE, subtasks);
  return st;
}

function getSubtask(subtaskId: string): Subtask | null {
  return readStore<Subtask>(SUBTASKS_FILE).find((s: Subtask) => s.subtask_id === subtaskId) || null;
}

function getSubtasksForTask(taskId: string): Subtask[] {
  return readStore<Subtask>(SUBTASKS_FILE)
    .filter((s: Subtask) => s.parent_task_id === taskId)
    .sort((a: Subtask, b: Subtask) => (a.order || 0) - (b.order || 0));
}

function getAllSubtasks(): Subtask[] {
  return validateSubtaskArray(readStore<Subtask>(SUBTASKS_FILE));
}

function updateSubtask(subtaskId: string, updates: Partial<Subtask>): Subtask | null {
  const subtasks = readStore<Subtask>(SUBTASKS_FILE);
  const idx = subtasks.findIndex((s: Subtask) => s.subtask_id === subtaskId);
  if (idx === -1) return null;
  Object.assign(subtasks[idx], updates, { updated_at: new Date().toISOString() });
  writeStore<Subtask>(SUBTASKS_FILE, subtasks);
  return subtasks[idx];
}

function getTaskProgress(taskId: string): TaskProgress {
  const subs = getSubtasksForTask(taskId);
  const counts: TaskProgress = { total: subs.length, proposed: 0, queued: 0, running: 0, waiting_approval: 0, done: 0, failed: 0, blocked: 0, canceled: 0 };
  for (const s of subs) counts[s.status as keyof Omit<TaskProgress, 'total'>] = (counts[s.status as keyof Omit<TaskProgress, 'total'>] || 0) + 1;
  return counts;
}

module.exports = {
  detectDomain,
  createTask, getTask, getAllTasks, updateTask,
  createSubtask, getSubtask, getSubtasksForTask, getAllSubtasks, updateSubtask,
  getTaskProgress,
};
