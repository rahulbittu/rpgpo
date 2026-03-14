"use strict";
// GPO E2E Flow State — Track end-to-end workflow execution
Object.defineProperty(exports, "__esModule", { value: true });
exports.runFlow = runFlow;
exports.getRuns = getRuns;
exports.getRunForFlow = getRunForFlow;
const fs = require('fs');
const path = require('path');
const RUNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'e2e-flow-runs.json');
function uid() { return 'ef_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson(f, fb) { try {
    return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb;
}
catch {
    return fb;
} }
function writeJson(f, d) { const dir = path.dirname(f); if (!fs.existsSync(dir))
    fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }
/** Run an E2E flow check */
function runFlow(flowId) {
    const wa = require('./workflow-activation');
    const report = wa.getReport();
    const workflow = report.workflows.find(w => w.workflow_id === flowId);
    if (!workflow) {
        return { run_id: uid(), flow_id: flowId, flow_name: 'Unknown', steps: [{ step: 'find_workflow', status: 'fail', detail: 'Workflow not found' }], overall: 'fail', created_at: new Date().toISOString() };
    }
    const steps = workflow.steps.map(s => ({
        step: s.step,
        status: (s.ui_visible && s.api_connected && (s.state_mutates ? s.result_visible : true)) ? 'pass' : s.api_connected ? 'partial' : 'fail',
        detail: !s.ui_visible ? 'Not visible in UI' : !s.api_connected ? 'API not connected' : !s.result_visible && s.state_mutates ? 'State change not reflected in UI' : 'OK',
    }));
    const allPass = steps.every(s => s.status === 'pass');
    const anyFail = steps.some(s => s.status === 'fail');
    const overall = allPass ? 'pass' : anyFail ? 'fail' : 'partial';
    const run = { run_id: uid(), flow_id: flowId, flow_name: workflow.name, steps, overall: overall, created_at: new Date().toISOString() };
    const runs = readJson(RUNS_FILE, []);
    runs.unshift(run);
    if (runs.length > 100)
        runs.length = 100;
    writeJson(RUNS_FILE, runs);
    return run;
}
/** Get all runs */
function getRuns() { return readJson(RUNS_FILE, []); }
/** Get run for a specific flow */
function getRunForFlow(flowId) {
    return readJson(RUNS_FILE, []).find(r => r.flow_id === flowId) || null;
}
module.exports = { runFlow, getRuns, getRunForFlow };
//# sourceMappingURL=e2e-flow-state.js.map