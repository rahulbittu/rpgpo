// GPO Task Chaining — Chain spec management and post-completion task creation

import type { TaskChainSpec, ChainRule, ChainEvaluationResult } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const CHAINS_DIR = path.resolve(__dirname, '..', '..', 'state', 'task-chains');

function ensureDir(): void { if (!fs.existsSync(CHAINS_DIR)) fs.mkdirSync(CHAINS_DIR, { recursive: true }); }

function chainFile(taskId: string): string { return path.join(CHAINS_DIR, `${taskId}.json`); }

export function upsertChainSpec(taskId: string, spec: Partial<TaskChainSpec>): TaskChainSpec {
  ensureDir();
  const existing = getChainSpec(taskId);
  const chain: TaskChainSpec = {
    id: existing?.id || 'chain_' + crypto.randomBytes(4).toString('hex'),
    taskId,
    createdAt: existing?.createdAt || new Date().toISOString(),
    rules: spec.rules || existing?.rules || [],
    autoExecute: spec.autoExecute ?? existing?.autoExecute ?? false,
    requireApproval: spec.requireApproval ?? existing?.requireApproval ?? true,
    name: spec.name || existing?.name,
    description: spec.description || existing?.description,
  };
  fs.writeFileSync(chainFile(taskId), JSON.stringify(chain, null, 2));
  return chain;
}

export function getChainSpec(taskId: string): TaskChainSpec | null {
  const file = chainFile(taskId);
  if (!fs.existsSync(file)) return null;
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return null; }
}

export function evaluateChainOnCompletion(taskId: string, taskStatus: string): ChainEvaluationResult {
  const spec = getChainSpec(taskId);
  if (!spec || spec.rules.length === 0) return { triggered: false, tasksToCreate: [] };

  const tasksToCreate: ChainEvaluationResult['tasksToCreate'] = [];

  for (const rule of spec.rules) {
    if (rule.condition === 'on_complete' && taskStatus === 'done') {
      tasksToCreate.push({ template: rule.nextTaskTemplate, ruleId: rule.id, parentOutputRef: taskId });
    }
    if (rule.condition === 'on_approve' && taskStatus === 'done') {
      tasksToCreate.push({ template: rule.nextTaskTemplate, ruleId: rule.id, parentOutputRef: taskId });
    }
  }

  return { triggered: tasksToCreate.length > 0, tasksToCreate };
}

export function createChainedTasks(parentTaskId: string, result: ChainEvaluationResult): string[] {
  if (!result.triggered) return [];

  const createdIds: string[] = [];
  try {
    const intake = require('./intake') as { createTask(body: any): any };
    const queue = require('./queue') as { addTask(type: string, label: string, meta: any): any };

    for (const item of result.tasksToCreate) {
      const task = intake.createTask({
        raw_request: item.template.raw_request,
        domain: item.template.domain || 'general',
        urgency: item.template.urgency || 'normal',
        desired_outcome: item.template.desired_outcome,
        parent_task_id: parentTaskId,
        chain_rule_id: item.ruleId,
      });
      // Auto-deliberate the chained task
      queue.addTask('deliberate', `Deliberate (chain): ${task.title}`, { taskId: task.task_id, autoApprove: true });
      createdIds.push(task.task_id);
      console.log(`[task-chaining] Created chained task ${task.task_id} from parent ${parentTaskId}`);
    }
  } catch (e) {
    console.log(`[task-chaining] Error creating chained tasks: ${(e as Error).message?.slice(0, 100)}`);
  }

  return createdIds;
}

module.exports = { upsertChainSpec, getChainSpec, evaluateChainOnCompletion, createChainedTasks };
