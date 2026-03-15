"use strict";
// GPO Health Check + Self-Healing — Automated system health monitoring and repair
Object.defineProperty(exports, "__esModule", { value: true });
exports.runHealthChecks = runHealthChecks;
exports.getOnboardingStatus = getOnboardingStatus;
const fs = require('fs');
const path = require('path');
const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');
/**
 * Run all health checks. If autoRepair is true, fix issues automatically.
 */
function runHealthChecks(autoRepair = false) {
    const checks = [];
    let repaired = 0;
    // 1. State directory exists
    checks.push(checkStateDir());
    // 2. Core state files exist and parse
    const coreFiles = ['intake-tasks.json', 'dashboard-state.json', 'mission-statements.json', 'costs.json'];
    for (const f of coreFiles) {
        const result = checkJsonFile(f);
        checks.push(result);
        if (result.status === 'fail' && autoRepair) {
            const repairResult = repairJsonFile(f);
            if (repairResult) {
                result.repaired = true;
                result.message += ' (repaired)';
                repaired++;
            }
        }
    }
    // 3. Stuck tasks
    const stuckResult = checkStuckTasks(autoRepair);
    checks.push(stuckResult);
    if (stuckResult.repaired)
        repaired++;
    // 4. Provider keys
    checks.push(checkProviderKeys());
    // 5. Operator profile
    checks.push(checkOperatorProfile());
    // 6. Mission contexts
    checks.push(checkMissionContexts());
    // 7. Disk space (state size)
    checks.push(checkStateSize());
    // Compute overall status
    const fails = checks.filter(c => c.status === 'fail').length;
    const warns = checks.filter(c => c.status === 'warn').length;
    const status = fails > 0 ? 'critical' : warns > 0 ? 'degraded' : 'healthy';
    return { status, checks, repairedCount: repaired, timestamp: new Date().toISOString() };
}
function checkStateDir() {
    if (fs.existsSync(STATE_DIR))
        return { name: 'State directory', status: 'pass', message: 'State directory exists' };
    return { name: 'State directory', status: 'fail', message: 'State directory missing' };
}
function checkJsonFile(filename) {
    const file = path.join(STATE_DIR, filename);
    if (!fs.existsSync(file))
        return { name: `File: ${filename}`, status: 'warn', message: `${filename} does not exist` };
    try {
        JSON.parse(fs.readFileSync(file, 'utf-8'));
        return { name: `File: ${filename}`, status: 'pass', message: `${filename} valid JSON` };
    }
    catch (e) {
        return { name: `File: ${filename}`, status: 'fail', message: `${filename} corrupted: ${e.message?.slice(0, 60)}` };
    }
}
function repairJsonFile(filename) {
    const file = path.join(STATE_DIR, filename);
    try {
        if (filename === 'intake-tasks.json' || filename === 'costs.json') {
            fs.writeFileSync(file, '[]');
        }
        else {
            fs.writeFileSync(file, '{}');
        }
        return true;
    }
    catch {
        return false;
    }
}
function checkStuckTasks(autoRepair) {
    try {
        const intake = require('./intake');
        const tasks = intake.getAllTasks();
        const stuckTasks = tasks.filter((t) => ['waiting_approval', 'executing', 'deliberating'].includes(t.status));
        if (stuckTasks.length === 0)
            return { name: 'Stuck tasks', status: 'pass', message: 'No stuck tasks' };
        if (autoRepair) {
            let fixed = 0;
            for (const t of stuckTasks) {
                const subs = intake.getSubtasksForTask(t.task_id);
                for (const s of subs) {
                    if (!['done', 'failed', 'canceled'].includes(s.status)) {
                        intake.updateSubtask(s.subtask_id, { status: 'done', what_done: 'Auto-repaired by health check' });
                        fixed++;
                    }
                }
                intake.updateTask(t.task_id, { status: 'done' });
                fixed++;
            }
            return { name: 'Stuck tasks', status: 'warn', message: `${stuckTasks.length} stuck tasks auto-repaired (${fixed} items fixed)`, repaired: true };
        }
        return { name: 'Stuck tasks', status: 'warn', message: `${stuckTasks.length} stuck tasks found`, details: stuckTasks.map((t) => t.task_id).join(', ') };
    }
    catch {
        return { name: 'Stuck tasks', status: 'pass', message: 'Could not check (intake module unavailable)' };
    }
}
function checkProviderKeys() {
    const keys = ['OPENAI_API_KEY', 'PERPLEXITY_API_KEY', 'GEMINI_API_KEY'];
    const missing = keys.filter(k => !process.env[k] || process.env[k] === 'your_key_here');
    if (missing.length === 0)
        return { name: 'Provider keys', status: 'pass', message: 'All 3 provider keys configured' };
    if (missing.length <= 1)
        return { name: 'Provider keys', status: 'warn', message: `Missing: ${missing.join(', ')}` };
    return { name: 'Provider keys', status: 'fail', message: `Missing ${missing.length} provider keys: ${missing.join(', ')}` };
}
function checkOperatorProfile() {
    const profileFile = path.join(STATE_DIR, 'context', 'operator-profile.json');
    if (!fs.existsSync(profileFile))
        return { name: 'Operator profile', status: 'warn', message: 'No operator profile — create one in Settings' };
    try {
        const profile = JSON.parse(fs.readFileSync(profileFile, 'utf-8'));
        if (!profile.name)
            return { name: 'Operator profile', status: 'warn', message: 'Operator profile has no name' };
        return { name: 'Operator profile', status: 'pass', message: `Operator: ${profile.name}` };
    }
    catch {
        return { name: 'Operator profile', status: 'warn', message: 'Operator profile corrupted' };
    }
}
function checkMissionContexts() {
    const missionsDir = path.join(STATE_DIR, 'context', 'missions');
    if (!fs.existsSync(missionsDir))
        return { name: 'Mission contexts', status: 'warn', message: 'No mission contexts' };
    const dirs = fs.readdirSync(missionsDir).filter((d) => {
        const ctxFile = path.join(missionsDir, d, 'context.json');
        return fs.existsSync(ctxFile);
    });
    return { name: 'Mission contexts', status: dirs.length >= 3 ? 'pass' : 'warn', message: `${dirs.length} mission contexts found` };
}
function checkStateSize() {
    try {
        let totalSize = 0;
        const countFiles = (dir) => {
            if (!fs.existsSync(dir))
                return;
            for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
                const full = path.join(dir, entry.name);
                if (entry.isDirectory())
                    countFiles(full);
                else
                    totalSize += fs.statSync(full).size;
            }
        };
        countFiles(STATE_DIR);
        const mb = totalSize / (1024 * 1024);
        if (mb > 100)
            return { name: 'State size', status: 'warn', message: `State is ${mb.toFixed(1)}MB — consider cleanup` };
        return { name: 'State size', status: 'pass', message: `State size: ${mb.toFixed(1)}MB` };
    }
    catch {
        return { name: 'State size', status: 'pass', message: 'Could not measure state size' };
    }
}
function getOnboardingStatus() {
    const steps = [];
    // 1. API keys configured
    const hasOpenAI = !!process.env.OPENAI_API_KEY && process.env.OPENAI_API_KEY !== 'your_key_here';
    const hasPerplexity = !!process.env.PERPLEXITY_API_KEY && process.env.PERPLEXITY_API_KEY !== 'your_key_here';
    const hasGemini = !!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_key_here';
    steps.push({ name: 'API Keys', status: hasOpenAI && hasPerplexity ? 'complete' : 'pending', detail: `OpenAI: ${hasOpenAI ? 'Yes' : 'No'}, Perplexity: ${hasPerplexity ? 'Yes' : 'No'}, Gemini: ${hasGemini ? 'Yes' : 'No'}` });
    // 2. Operator profile
    const profileFile = path.join(STATE_DIR, 'context', 'operator-profile.json');
    const hasProfile = fs.existsSync(profileFile);
    steps.push({ name: 'Operator Profile', status: hasProfile ? 'complete' : 'pending' });
    // 3. Mission statements
    const msFile = path.join(STATE_DIR, 'mission-statements.json');
    const hasStatements = fs.existsSync(msFile);
    let statementsCount = 0;
    try {
        statementsCount = JSON.parse(fs.readFileSync(msFile, 'utf-8')).length;
    }
    catch { /* */ }
    steps.push({ name: 'Mission Statements', status: statementsCount > 0 ? 'complete' : 'pending', detail: `${statementsCount} statements` });
    // 4. First task completed
    try {
        const intake = require('./intake');
        const doneTasks = intake.getAllTasks().filter((t) => t.status === 'done');
        steps.push({ name: 'First Task', status: doneTasks.length > 0 ? 'complete' : 'pending', detail: `${doneTasks.length} tasks completed` });
    }
    catch {
        steps.push({ name: 'First Task', status: 'pending' });
    }
    const completed = steps.every(s => s.status === 'complete');
    return { completed, steps };
}
module.exports = { runHealthChecks, getOnboardingStatus };
