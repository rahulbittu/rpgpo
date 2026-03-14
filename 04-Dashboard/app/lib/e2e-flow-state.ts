// GPO E2E Flow State — Track end-to-end workflow execution

import type { E2EFlowRun } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RUNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'e2e-flow-runs.json');

function uid(): string { return 'ef_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Run an E2E flow check */
export function runFlow(flowId: string): E2EFlowRun {
  const wa = require('./workflow-activation') as { getReport(): import('./types').WorkflowActivationReport };
  const report = wa.getReport();
  const workflow = report.workflows.find(w => w.workflow_id === flowId);

  if (!workflow) {
    return { run_id: uid(), flow_id: flowId, flow_name: 'Unknown', steps: [{ step: 'find_workflow', status: 'fail', detail: 'Workflow not found' }], overall: 'fail', created_at: new Date().toISOString() };
  }

  const steps = workflow.steps.map(s => ({
    step: s.step,
    status: (s.ui_visible && s.api_connected && (s.state_mutates ? s.result_visible : true)) ? 'pass' as const : s.api_connected ? 'partial' as const : 'fail' as const,
    detail: !s.ui_visible ? 'Not visible in UI' : !s.api_connected ? 'API not connected' : !s.result_visible && s.state_mutates ? 'State change not reflected in UI' : 'OK',
  }));

  const allPass = steps.every(s => s.status === 'pass');
  const anyFail = steps.some(s => s.status === 'fail');
  const overall = allPass ? 'pass' : anyFail ? 'fail' : 'partial';

  const run: E2EFlowRun = { run_id: uid(), flow_id: flowId, flow_name: workflow.name, steps, overall: overall as any, created_at: new Date().toISOString() };

  const runs = readJson<E2EFlowRun[]>(RUNS_FILE, []);
  runs.unshift(run);
  if (runs.length > 100) runs.length = 100;
  writeJson(RUNS_FILE, runs);

  return run;
}

/** Get all runs */
export function getRuns(): E2EFlowRun[] { return readJson<E2EFlowRun[]>(RUNS_FILE, []); }

/** Get run for a specific flow */
export function getRunForFlow(flowId: string): E2EFlowRun | null {
  return readJson<E2EFlowRun[]>(RUNS_FILE, []).find(r => r.flow_id === flowId) || null;
}

module.exports = { runFlow, getRuns, getRunForFlow };
