"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require('fs');
var path = require('path');
var _a = require('./validate'), validateTaskArray = _a.validateTaskArray, validateSubtaskArray = _a.validateSubtaskArray;
var TASKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'intake-tasks.json');
var SUBTASKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'subtasks.json');
function ensureFile(file) {
    var dir = path.dirname(file);
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
    catch (_a) {
        return [];
    }
}
function writeStore(file, data) {
    ensureFile(file);
    if (data.length > 5000)
        data = data.slice(-5000);
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
function uid() { return 't_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function stid() { return 'st_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
var DOMAIN_KEYWORDS = {
    topranker: ['topranker', 'leaderboard', 'rankings', 'local business', 'expo', 'react native'],
    careeregine: ['career', 'resume', 'salary', 'hiring', 'interview', 'data engineer', 'job search', 'job market', 'compensation', 'engineering manager', 'staff engineer', 'promotion', 'personal brand', 'linkedin', 'mentoring'],
    founder2founder: ['founder', 'f2f', 'community'],
    wealthresearch: ['wealth', 'investment', 'finance', 'portfolio', 'passive income', 'side hustle', 'money', 'tax', 'retirement', 'insurance', 'savings', 'roth ira', '401k', 'estate planning', 'angel investing', 'dividend', 'financial plan', 'net worth'],
    newsroom: ['news', 'journalism', 'media', 'headline', 'trending', 'current events', 'breaking'],
    writing: ['write a guide', 'write a complete', 'draft', 'memo', 'prd', 'spec', 'sop', 'runbook', 'document', 'proposal', 'letter', 'rewrite', 'summarize', 'executive summary', 'concept for a', 'outline for a', 'treatment for a', 'technical writing'],
    research: ['research', 'analyze', 'compare', 'investigate', 'deep dive', 'market analysis', 'competitive analysis', 'assessment', 'best home', 'best budget', 'best portable', 'best smart'],
    learning: ['teach', 'explain how', 'explain the', 'tutor', 'learn', 'study plan', 'quiz', 'course', 'curriculum', 'how does', 'how do', 'internals of', 'works under'],
    shopping: ['buy', 'purchase', 'compare products', 'recommendation', 'shopping', 'best price'],
    travel: ['travel', 'trip', 'flight', 'hotel', 'itinerary', 'relocation', 'moving to', 'tour through', 'road trip', 'safari'],
    health: ['fitness', 'workout', 'diet', 'health protocol', 'wellness', 'exercise', 'nutrition', 'sleep', 'mobility', 'stretching', 'rehabilitation', 'prehab', 'posture', 'recovery protocol'],
    screenwriting: ['screenplay', 'script', 'film', 'movie', 'series concept', 'pilot episode', 'narrative game', 'board game', 'podcast series', 'documentary'],
    music: ['music', 'song', 'album', 'production', 'musical'],
    personalops: ['plan my week', 'schedule', 'time block', 'calendar', 'routine', 'habit', 'morning routine', 'meal prep', 'productivity', 'deep work', 'goal setting'],
};
// Resolve domain aliases from the intake form (e.g., 'career' → 'careeregine')
var INTAKE_ALIASES = {
    career: 'careeregine',
    finance: 'wealthresearch',
    home: 'personalops',
};
function detectDomain(text) {
    // Use the domain-router's scored matching instead of simple first-match
    try {
        var router = require('./domain-router');
        var result = router.routeRequest(text);
        if (result.confidence > 0.2)
            return result.domain;
    }
    catch ( /* fallback to simple matching */_a) { /* fallback to simple matching */ }
    var lower = (text || '').toLowerCase();
    for (var _i = 0, _b = Object.entries(DOMAIN_KEYWORDS); _i < _b.length; _i++) {
        var _c = _b[_i], domain = _c[0], keywords = _c[1];
        if (keywords.some(function (k) { return lower.includes(k); }))
            return domain;
    }
    return 'general';
}
function resolveDomainAlias(domain) {
    return (INTAKE_ALIASES[domain] || domain);
}
function createTask(opts) {
    var tasks = readStore(TASKS_FILE);
    var raw = opts.raw_request || '';
    var rawDomain = opts.domain || detectDomain(raw);
    var domain = resolveDomainAlias(rawDomain);
    // Resolve project_id — use provided, or default for domain
    var projectId = opts.project_id;
    try {
        var projects = require('./projects');
        projectId = projects.resolveProjectId(domain, projectId);
    }
    catch ( /* projects module not loaded yet */_a) { /* projects module not loaded yet */ }
    var task = {
        task_id: uid(),
        title: opts.title || raw.split('\n')[0].slice(0, 80) || 'Untitled task',
        raw_request: raw,
        domain: domain,
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
    return readStore(TASKS_FILE).find(function (t) { return t.task_id === taskId; }) || null;
}
function getAllTasks() {
    return validateTaskArray(readStore(TASKS_FILE));
}
function updateTask(taskId, updates) {
    var tasks = readStore(TASKS_FILE);
    var idx = tasks.findIndex(function (t) { return t.task_id === taskId; });
    if (idx === -1)
        return null;
    Object.assign(tasks[idx], updates, { updated_at: new Date().toISOString() });
    writeStore(TASKS_FILE, tasks);
    return tasks[idx];
}
function createSubtask(opts) {
    var subtasks = readStore(SUBTASKS_FILE);
    var st = {
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
    return readStore(SUBTASKS_FILE).find(function (s) { return s.subtask_id === subtaskId; }) || null;
}
function getSubtasksForTask(taskId) {
    return readStore(SUBTASKS_FILE)
        .filter(function (s) { return s.parent_task_id === taskId; })
        .sort(function (a, b) { return (a.order || 0) - (b.order || 0); });
}
function getAllSubtasks() {
    return validateSubtaskArray(readStore(SUBTASKS_FILE));
}
function updateSubtask(subtaskId, updates) {
    var subtasks = readStore(SUBTASKS_FILE);
    var idx = subtasks.findIndex(function (s) { return s.subtask_id === subtaskId; });
    if (idx === -1)
        return null;
    Object.assign(subtasks[idx], updates, { updated_at: new Date().toISOString() });
    writeStore(SUBTASKS_FILE, subtasks);
    return subtasks[idx];
}
function getTaskProgress(taskId) {
    var subs = getSubtasksForTask(taskId);
    var counts = { total: subs.length, proposed: 0, queued: 0, running: 0, waiting_approval: 0, done: 0, failed: 0, blocked: 0, canceled: 0 };
    for (var _i = 0, subs_1 = subs; _i < subs_1.length; _i++) {
        var s = subs_1[_i];
        counts[s.status] = (counts[s.status] || 0) + 1;
    }
    return counts;
}
module.exports = {
    detectDomain: detectDomain,
    createTask: createTask,
    getTask: getTask,
    getAllTasks: getAllTasks,
    updateTask: updateTask,
    createSubtask: createSubtask,
    getSubtask: getSubtask,
    getSubtasksForTask: getSubtasksForTask,
    getAllSubtasks: getAllSubtasks,
    updateSubtask: updateSubtask,
    getTaskProgress: getTaskProgress,
};
