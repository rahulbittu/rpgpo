// GPO Release Orchestration — Manages release flow from plan to execution to verification

import type {
  ReleasePlan, ReleasePlanStatus, ReleaseCheckpoint, ReleaseExecution,
  Domain, Lane,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const PLANS_FILE = path.resolve(__dirname, '..', '..', 'state', 'release-plans.json');
const EXECUTIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'release-executions.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Create a release plan */
export function createPlan(opts: {
  project_id: string; domain: Domain; target_lane: Lane; title: string;
  source_dossier_ids?: string[]; source_graph_ids?: string[];
}): ReleasePlan {
  const plans = readJson<ReleasePlan[]>(PLANS_FILE, []);
  const checkpoints: ReleaseCheckpoint[] = [
    { checkpoint_id: uid('cp'), title: 'Readiness score computed', required: true, passed: false },
    { checkpoint_id: uid('cp'), title: 'All reviews completed', required: true, passed: false },
    { checkpoint_id: uid('cp'), title: 'Documentation complete', required: opts.target_lane !== 'dev', passed: false },
    { checkpoint_id: uid('cp'), title: 'Promotion approved', required: true, passed: false },
  ];
  const plan: ReleasePlan = {
    plan_id: uid('rp'), project_id: opts.project_id, domain: opts.domain,
    target_lane: opts.target_lane, title: opts.title,
    source_dossier_ids: opts.source_dossier_ids || [],
    source_graph_ids: opts.source_graph_ids || [],
    status: 'draft', checkpoints,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };
  plans.unshift(plan);
  if (plans.length > 100) plans.length = 100;
  writeJson(PLANS_FILE, plans);
  return plan;
}

function updatePlan(planId: string, updates: Partial<ReleasePlan>): ReleasePlan | null {
  const plans = readJson<ReleasePlan[]>(PLANS_FILE, []);
  const idx = plans.findIndex(p => p.plan_id === planId);
  if (idx === -1) return null;
  Object.assign(plans[idx], updates, { updated_at: new Date().toISOString() });
  writeJson(PLANS_FILE, plans);
  return plans[idx];
}

export function approvePlan(planId: string): ReleasePlan | null { return updatePlan(planId, { status: 'approved' }); }
export function haltPlan(planId: string): ReleasePlan | null { return updatePlan(planId, { status: 'halted' }); }

/** Execute a release plan */
export function executePlan(planId: string): ReleaseExecution | null {
  const plan = readJson<ReleasePlan[]>(PLANS_FILE, []).find(p => p.plan_id === planId);
  if (!plan || plan.status !== 'approved') return null;
  updatePlan(planId, { status: 'executing' });

  const execution: ReleaseExecution = {
    execution_id: uid('re'), plan_id: planId, status: 'executing',
    started_at: new Date().toISOString(),
  };
  const executions = readJson<ReleaseExecution[]>(EXECUTIONS_FILE, []);
  executions.unshift(execution);
  if (executions.length > 100) executions.length = 100;
  writeJson(EXECUTIONS_FILE, executions);
  // Part 45: Auto-emit telemetry
  try { const tw = require('./telemetry-wiring') as { emitTelemetry(c: string, a: string, o: string): void }; tw.emitTelemetry('release_pipeline', 'release_execute', 'success'); } catch { /* */ }
  return execution;
}

/** Verify a release execution */
export function verifyExecution(executionId: string, notes: string = ''): ReleaseExecution | null {
  const executions = readJson<ReleaseExecution[]>(EXECUTIONS_FILE, []);
  const idx = executions.findIndex(e => e.execution_id === executionId);
  if (idx === -1) return null;
  executions[idx].status = 'verified';
  executions[idx].completed_at = new Date().toISOString();
  executions[idx].verification_notes = notes;
  writeJson(EXECUTIONS_FILE, executions);
  updatePlan(executions[idx].plan_id, { status: 'completed' });
  return executions[idx];
}

export function getPlans(projectId?: string): ReleasePlan[] {
  const all = readJson<ReleasePlan[]>(PLANS_FILE, []);
  return projectId ? all.filter(p => p.project_id === projectId) : all;
}

export function getPlan(planId: string): ReleasePlan | null {
  return readJson<ReleasePlan[]>(PLANS_FILE, []).find(p => p.plan_id === planId) || null;
}

export function getExecutions(): ReleaseExecution[] { return readJson<ReleaseExecution[]>(EXECUTIONS_FILE, []); }

module.exports = { createPlan, approvePlan, haltPlan, executePlan, verifyExecution, getPlans, getPlan, getExecutions };
