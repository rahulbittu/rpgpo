// GPO Task Experience — Clean task lifecycle surface with final result prominence

import type { TaskExperienceState, ShippableSurfaceState } from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const STATE_DIR = path.resolve(__dirname, '..', '..', 'state');

function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }

/** Get task experience state for a task */
export function getTaskExperience(taskId: string): TaskExperienceState | null {
  const tasks = readJson<any[]>(path.join(STATE_DIR, 'tasks.json'), []);
  const subtasks = readJson<any[]>(path.join(STATE_DIR, 'subtasks.json'), []);
  const intakeTasks = readJson<any[]>(path.join(STATE_DIR, 'intake-tasks.json'), []);

  const task = tasks.find(t => t.task_id === taskId);
  const intake = intakeTasks.find(t => t.intake_id === taskId || t.task_id === taskId);
  if (!task && !intake) return null;

  const taskSubs = subtasks.filter(st => st.parent_task === taskId);
  const hasBoardInterp = !!(intake?.board_interpretation || intake?.board_strategy);
  const hasPlan = taskSubs.length > 0;
  const isDone = (task?.status === 'done') || (intake?.status === 'done');
  const hasResult = isDone && taskSubs.some(st => st.status === 'done' && (st.output || st.report_file || st.what_done));

  let stage: TaskExperienceState['lifecycle_stage'] = 'request';
  if (isDone) stage = 'result';
  else if (taskSubs.some(st => st.status === 'running' || st.status === 'builder_running')) stage = 'execution';
  else if (taskSubs.some(st => st.status === 'waiting_approval' || st.status === 'waiting_human')) stage = 'approvals';
  else if (hasPlan) stage = 'plan';
  else if (hasBoardInterp) stage = 'deliberation';

  return {
    task_id: taskId, lifecycle_stage: stage,
    has_board_interpretation: hasBoardInterp, has_plan: hasPlan,
    has_final_result: hasResult, result_surfaced: hasResult,
  };
}

/** Get all task experience states for recent tasks */
export function getAllExperiences(): TaskExperienceState[] {
  const tasks = readJson<any[]>(path.join(STATE_DIR, 'tasks.json'), []);
  const results: TaskExperienceState[] = [];
  for (const task of tasks.slice(0, 20)) {
    const exp = getTaskExperience(task.task_id);
    if (exp) results.push(exp);
  }
  return results;
}

/** Assess shippable surface state for each major tab */
export function getShippableSurfaces(): ShippableSurfaceState[] {
  return [
    { tab: 'home', shippable: true, reason: 'Status, CoS, current task, approvals, mission health — core product surface' },
    { tab: 'tasks', shippable: true, reason: 'Full task stream with filters, timeline, status — Part 57 adds final result surfacing' },
    { tab: 'intake', shippable: true, reason: 'Task submission with board flow explainer, deliberation, execution graph' },
    { tab: 'channels', shippable: true, reason: 'Direct AI interaction — marked as advanced' },
    { tab: 'missions', shippable: true, reason: 'Mission health grid with statements' },
    { tab: 'memory', shippable: true, reason: 'Memory viewer with all artifact categories' },
    { tab: 'dossiers', shippable: false, reason: 'Empty — needs empty state UI' },
    { tab: 'providers', shippable: true, reason: 'Provider cards with governance health' },
    { tab: 'governance', shippable: true, reason: 'Full governance stack with middleware truth, protection coverage' },
    { tab: 'audit', shippable: true, reason: 'Audit timeline, approvals, escalations, policy history' },
    { tab: 'releases', shippable: true, reason: 'Release plans, ship readiness, go authorization, route proof' },
    { tab: 'admin', shippable: true, reason: 'Tenant admin, deployment, security posture' },
    { tab: 'topranker', shippable: true, reason: 'Flagship mission with status and actions' },
    { tab: 'approvals', shippable: true, reason: 'Pending approvals with actions' },
    { tab: 'costs', shippable: true, reason: 'Cost tracking with provider/model/day breakdown' },
    { tab: 'logs', shippable: true, reason: 'Filtered log stream' },
    { tab: 'controls', shippable: true, reason: 'Operating loops and quick dispatch — marked as operator-only' },
    { tab: 'settings', shippable: true, reason: 'Provider status, system map, system info' },
  ];
}

module.exports = { getTaskExperience, getAllExperiences, getShippableSurfaces };
