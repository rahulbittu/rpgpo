// GPO Rollback Control — Create and execute rollback plans for releases

import type {
  RollbackPlan, RollbackExecution, RollbackTrigger,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const PLANS_FILE = path.resolve(__dirname, '..', '..', 'state', 'rollback-plans.json');
const EXECUTIONS_FILE = path.resolve(__dirname, '..', '..', 'state', 'rollback-executions.json');

function uid(p: string): string { return p + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

/** Create a rollback plan */
export function createPlan(opts: {
  release_execution_id: string;
  trigger: RollbackTrigger;
  description: string;
  affected_artifacts?: string[];
}): RollbackPlan {
  const plans = readJson<RollbackPlan[]>(PLANS_FILE, []);
  const plan: RollbackPlan = {
    plan_id: uid('rb'), release_execution_id: opts.release_execution_id,
    trigger: opts.trigger, description: opts.description,
    affected_artifacts: opts.affected_artifacts || [],
    status: 'ready', created_at: new Date().toISOString(),
  };
  plans.unshift(plan);
  if (plans.length > 100) plans.length = 100;
  writeJson(PLANS_FILE, plans);
  return plan;
}

/** Execute a rollback */
export function executePlan(planId: string): RollbackExecution | null {
  const plans = readJson<RollbackPlan[]>(PLANS_FILE, []);
  const idx = plans.findIndex(p => p.plan_id === planId);
  if (idx === -1 || plans[idx].status !== 'ready') return null;
  plans[idx].status = 'completed';
  writeJson(PLANS_FILE, plans);

  // Mark the release execution as rolled back
  try {
    const execFile = path.resolve(__dirname, '..', '..', 'state', 'release-executions.json');
    const executions = readJson<any[]>(execFile, []);
    const eIdx = executions.findIndex((e: any) => e.execution_id === plans[idx].release_execution_id);
    if (eIdx >= 0) { executions[eIdx].status = 'rolled_back'; executions[eIdx].rollback_plan_id = planId; writeJson(execFile, executions); }
  } catch { /* */ }

  // Append traceability
  try {
    const tl = require('./traceability-ledger') as { append(o: Record<string, unknown>): unknown };
    tl.append({ actor: 'rollback_control', action: 'rollback_executed', target_type: 'release', target_id: plans[idx].release_execution_id, detail: plans[idx].description });
  } catch { /* */ }

  const execution: RollbackExecution = {
    execution_id: uid('rx'), plan_id: planId,
    release_execution_id: plans[idx].release_execution_id,
    before_state: { status: 'executing' }, after_state: { status: 'rolled_back' },
    executed_at: new Date().toISOString(),
  };
  const executions = readJson<RollbackExecution[]>(EXECUTIONS_FILE, []);
  executions.unshift(execution);
  if (executions.length > 100) executions.length = 100;
  writeJson(EXECUTIONS_FILE, executions);
  return execution;
}

export function getPlans(projectId?: string): RollbackPlan[] {
  return readJson<RollbackPlan[]>(PLANS_FILE, []);
}

export function getExecutions(): RollbackExecution[] {
  return readJson<RollbackExecution[]>(EXECUTIONS_FILE, []);
}

module.exports = { createPlan, executePlan, getPlans, getExecutions };
