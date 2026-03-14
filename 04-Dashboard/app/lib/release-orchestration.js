"use strict";
// GPO Release Orchestration — Manages release flow from plan to execution to verification
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPlan = createPlan;
exports.approvePlan = approvePlan;
exports.haltPlan = haltPlan;
exports.executePlan = executePlan;
exports.verifyExecution = verifyExecution;
exports.getPlans = getPlans;
exports.getPlan = getPlan;
exports.getExecutions = getExecutions;
const fs = require('fs');
const path = require('path');
const PLANS_FILE = path.resolve(__dirname, '..', '..', 'state', 'release-plans.json');
const EXECUTIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'release-executions.json');
function uid(p) { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Create a release plan */
function createPlan(opts) {
    const plans = readJson(PLANS_FILE, []);
    const checkpoints = [
        { checkpoint_id: uid('cp'), title: 'Readiness score computed', required: true, passed: false },
        { checkpoint_id: uid('cp'), title: 'All reviews completed', required: true, passed: false },
        { checkpoint_id: uid('cp'), title: 'Documentation complete', required: opts.target_lane !== 'dev', passed: false },
        { checkpoint_id: uid('cp'), title: 'Promotion approved', required: true, passed: false },
    ];
    const plan = {
        plan_id: uid('rp'), project_id: opts.project_id, domain: opts.domain,
        target_lane: opts.target_lane, title: opts.title,
        source_dossier_ids: opts.source_dossier_ids || [],
        source_graph_ids: opts.source_graph_ids || [],
        status: 'draft', checkpoints,
        created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
    };
    plans.unshift(plan);
    if (plans.length > 100)
        plans.length = 100;
    writeJson(PLANS_FILE, plans);
    return plan;
}
function updatePlan(planId, updates) {
    const plans = readJson(PLANS_FILE, []);
    const idx = plans.findIndex(p => p.plan_id === planId);
    if (idx === -1)
        return null;
    Object.assign(plans[idx], updates, { updated_at: new Date().toISOString() });
    writeJson(PLANS_FILE, plans);
    return plans[idx];
}
function approvePlan(planId) { return updatePlan(planId, { status: 'approved' }); }
function haltPlan(planId) { return updatePlan(planId, { status: 'halted' }); }
/** Execute a release plan */
function executePlan(planId) {
    const plan = readJson(PLANS_FILE, []).find(p => p.plan_id === planId);
    if (!plan || plan.status !== 'approved')
        return null;
    updatePlan(planId, { status: 'executing' });
    const execution = {
        execution_id: uid('re'), plan_id: planId, status: 'executing',
        started_at: new Date().toISOString(),
    };
    const executions = readJson(EXECUTIONS_FILE, []);
    executions.unshift(execution);
    if (executions.length > 100)
        executions.length = 100;
    writeJson(EXECUTIONS_FILE, executions);
    // Part 45: Auto-emit telemetry
    try {
        const tw = require('./telemetry-wiring');
        tw.emitTelemetry('release_pipeline', 'release_execute', 'success');
    }
    catch { /* */ }
    return execution;
}
/** Verify a release execution */
function verifyExecution(executionId, notes = '') {
    const executions = readJson(EXECUTIONS_FILE, []);
    const idx = executions.findIndex(e => e.execution_id === executionId);
    if (idx === -1)
        return null;
    executions[idx].status = 'verified';
    executions[idx].completed_at = new Date().toISOString();
    executions[idx].verification_notes = notes;
    writeJson(EXECUTIONS_FILE, executions);
    updatePlan(executions[idx].plan_id, { status: 'completed' });
    return executions[idx];
}
function getPlans(projectId) {
    const all = readJson(PLANS_FILE, []);
    return projectId ? all.filter(p => p.project_id === projectId) : all;
}
function getPlan(planId) {
    return readJson(PLANS_FILE, []).find(p => p.plan_id === planId) || null;
}
function getExecutions() { return readJson(EXECUTIONS_FILE, []); }
module.exports = { createPlan, approvePlan, haltPlan, executePlan, verifyExecution, getPlans, getPlan, getExecutions };
//# sourceMappingURL=release-orchestration.js.map