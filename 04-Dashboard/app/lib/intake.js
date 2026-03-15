"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs = require('fs');
const path = require('path');
const { validateTaskArray, validateSubtaskArray } = require('./validate');
const TASKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'intake-tasks.json');
const SUBTASKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'subtasks.json');
function ensureFile(file) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    if (!fs.existsSync(file))
        fs.writeFileSync(file, '[]');
}
function readStore(file) {
    ensureFile(file);
    try {
        return JSON.parse(fs.readFileSync(file, 'utf-8'));
    }
    catch {
        return [];
    }
}
function writeStore(file, data) {
    ensureFile(file);
    if (data.length > 2000)
        data = data.slice(-2000);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function uid() { return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function stid() { return 'st_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
const DOMAIN_KEYWORDS = {
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
const INTAKE_ALIASES = {
    career: 'careeregine',
    finance: 'wealthresearch',
    home: 'personalops',
};
function detectDomain(text) {
    // Use the domain-router's scored matching instead of simple first-match
    try {
        const router = require('./domain-router');
        const result = router.routeRequest(text);
        if (result.confidence > 0.2)
            return result.domain;
    }
    catch { /* fallback to simple matching */ }
    const lower = (text || '').toLowerCase();
    for (const [domain, keywords] of Object.entries(DOMAIN_KEYWORDS)) {
        if (keywords.some((k) => lower.includes(k)))
            return domain;
    }
    return 'general';
}
function resolveDomainAlias(domain) {
    return (INTAKE_ALIASES[domain] || domain);
}
function createTask(opts) {
    const tasks = readStore(TASKS_FILE);
    const raw = opts.raw_request || '';
    const rawDomain = opts.domain || detectDomain(raw);
    const domain = resolveDomainAlias(rawDomain);
    // Resolve project_id — use provided, or default for domain
    let projectId = opts.project_id;
    try {
        const projects = require('./projects');
        projectId = projects.resolveProjectId(domain, projectId);
    }
    catch { /* projects module not loaded yet */ }
    const task = {
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
    task.project_id = projectId;
    tasks.unshift(task);
    writeStore(TASKS_FILE, tasks);
    return task;
}
function getTask(taskId) {
    return readStore(TASKS_FILE).find((t) => t.task_id === taskId) || null;
}
function getAllTasks() {
    return validateTaskArray(readStore(TASKS_FILE));
}
function updateTask(taskId, updates) {
    const tasks = readStore(TASKS_FILE);
    const idx = tasks.findIndex((t) => t.task_id === taskId);
    if (idx === -1)
        return null;
    Object.assign(tasks[idx], updates, { updated_at: new Date().toISOString() });
    writeStore(TASKS_FILE, tasks);
    return tasks[idx];
}
function createSubtask(opts) {
    const subtasks = readStore(SUBTASKS_FILE);
    const st = {
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
        next_subtasks: opts.next_subtasks || [],
    };
    subtasks.unshift(st);
    writeStore(SUBTASKS_FILE, subtasks);
    return st;
}
function getSubtask(subtaskId) {
    return readStore(SUBTASKS_FILE).find((s) => s.subtask_id === subtaskId) || null;
}
function getSubtasksForTask(taskId) {
    return readStore(SUBTASKS_FILE)
        .filter((s) => s.parent_task_id === taskId)
        .sort((a, b) => (a.order || 0) - (b.order || 0));
}
function getAllSubtasks() {
    return validateSubtaskArray(readStore(SUBTASKS_FILE));
}
function updateSubtask(subtaskId, updates) {
    const subtasks = readStore(SUBTASKS_FILE);
    const idx = subtasks.findIndex((s) => s.subtask_id === subtaskId);
    if (idx === -1)
        return null;
    Object.assign(subtasks[idx], updates, { updated_at: new Date().toISOString() });
    writeStore(SUBTASKS_FILE, subtasks);
    return subtasks[idx];
}
function getTaskProgress(taskId) {
    const subs = getSubtasksForTask(taskId);
    const counts = { total: subs.length, proposed: 0, queued: 0, running: 0, waiting_approval: 0, done: 0, failed: 0, blocked: 0, canceled: 0 };
    for (const s of subs)
        counts[s.status] = (counts[s.status] || 0) + 1;
    return counts;
}
module.exports = {
    detectDomain,
    createTask, getTask, getAllTasks, updateTask,
    createSubtask, getSubtask, getSubtasksForTask, getAllSubtasks, updateSubtask,
    getTaskProgress,
};
//# sourceMappingURL=intake.js.map