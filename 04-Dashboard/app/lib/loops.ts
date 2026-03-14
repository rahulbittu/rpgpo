// GPO Mission Loops — Governed loop definitions and health tracking
// Each mission has a defined operating loop with auto-continue and approval gates.

import type {
  Domain, MissionLoop, MissionTaskTemplate, LoopHealth,
  LoopStatusSummary, Blocker, Urgency,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const LOOPS_FILE = path.resolve(__dirname, '..', '..', 'state', 'loops.json');

// ═══════════════════════════════════════════
// Loop Registry
// ═══════════════════════════════════════════

const loopDefs: Map<Domain, MissionLoop> = new Map();

function ensureFile(): void {
  const dir = path.dirname(LOOPS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  if (!fs.existsSync(LOOPS_FILE)) fs.writeFileSync(LOOPS_FILE, '{}');
}

function readLoopState(): Record<string, Partial<MissionLoop>> {
  ensureFile();
  try { return JSON.parse(fs.readFileSync(LOOPS_FILE, 'utf-8')); } catch { return {}; }
}

function writeLoopState(state: Record<string, Partial<MissionLoop>>): void {
  ensureFile();
  fs.writeFileSync(LOOPS_FILE, JSON.stringify(state, null, 2));
}

/** Register a mission loop definition */
export function defineLoop(loop: MissionLoop): void {
  loopDefs.set(loop.domain, loop);
  // Merge with persisted state
  const state = readLoopState();
  if (state[loop.domain]) {
    loop.health = (state[loop.domain].health as LoopHealth) || loop.health;
    loop.tasks_completed = state[loop.domain].tasks_completed || 0;
    loop.tasks_failed = state[loop.domain].tasks_failed || 0;
    loop.last_activity_at = state[loop.domain].last_activity_at || null;
  }
}

/** Get a loop by domain */
export function getLoop(domain: Domain): MissionLoop | undefined {
  return loopDefs.get(domain);
}

/** Get all loops */
export function getAllLoops(): MissionLoop[] {
  return Array.from(loopDefs.values());
}

/** Get compact status summaries for dashboard */
export function getLoopSummaries(): LoopStatusSummary[] {
  return Array.from(loopDefs.values()).map(l => ({
    domain: l.domain,
    name: l.name,
    health: l.health,
    blocker_summary: l.current_blocker ? l.current_blocker.title : null,
    tasks_completed: l.tasks_completed,
    last_activity: l.last_activity_at,
    next_action: l.current_blocker ? l.current_blocker.resume_label : null,
  }));
}

// ═══════════════════════════════════════════
// Loop Health Updates
// ═══════════════════════════════════════════

/** Update loop health after an event */
export function updateLoopHealth(domain: Domain, health: LoopHealth, blocker?: Blocker | null): void {
  const loop = loopDefs.get(domain);
  if (!loop) return;
  loop.health = health;
  loop.current_blocker = blocker || null;
  loop.updated_at = new Date().toISOString();
  persistLoop(domain, loop);
}

/** Record task completion in loop */
export function recordLoopCompletion(domain: Domain, success: boolean): void {
  const loop = loopDefs.get(domain);
  if (!loop) return;
  if (success) loop.tasks_completed++;
  else loop.tasks_failed++;
  loop.last_activity_at = new Date().toISOString();
  loop.health = 'active';
  loop.current_blocker = null;
  persistLoop(domain, loop);
}

/** Mark loop as blocked */
export function blockLoop(domain: Domain, blocker: Blocker): void {
  updateLoopHealth(domain, 'blocked', blocker);
}

/** Mark loop as idle */
export function idleLoop(domain: Domain): void {
  updateLoopHealth(domain, 'idle', null);
}

function persistLoop(domain: Domain, loop: MissionLoop): void {
  const state = readLoopState();
  state[domain as string] = {
    health: loop.health,
    tasks_completed: loop.tasks_completed,
    tasks_failed: loop.tasks_failed,
    last_activity_at: loop.last_activity_at,
    current_blocker: loop.current_blocker,
    updated_at: loop.updated_at,
  };
  writeLoopState(state);
}

// ═══════════════════════════════════════════
// Built-in Loop Definitions
// ═══════════════════════════════════════════

function tpl(id: string, title: string, desc: string, domain: Domain, prompt: string, stages: string[], artifacts: string[], autoDelib = false): MissionTaskTemplate {
  return { id, title, description: desc, prompt_prefix: prompt, domain, urgency: 'normal' as Urgency, likely_stages: stages, likely_artifacts: artifacts, auto_deliberate: autoDelib };
}

defineLoop({
  domain: 'topranker', name: 'TopRanker',
  stages: ['audit', 'locate_files', 'implement', 'report', 'review'],
  auto_continue_stages: ['audit', 'locate_files', 'report'],
  approval_stages: ['implement', 'review'],
  common_task_types: [
    tpl('tr-build', 'Build Feature', 'Implement a new feature', 'topranker', 'In TopRanker, implement: ', ['audit', 'locate_files', 'implement', 'report'], ['code_change', 'report']),
    tpl('tr-perf', 'Optimize Performance', 'Improve startup/render performance', 'topranker', 'Audit and optimize TopRanker ', ['audit', 'locate_files', 'implement', 'report'], ['analysis', 'code_change']),
    tpl('tr-fix', 'Fix Bug', 'Fix a reported issue', 'topranker', 'In TopRanker, fix: ', ['audit', 'locate_files', 'implement'], ['code_change']),
    tpl('tr-audit', 'Code Audit', 'Review code quality', 'topranker', 'Audit TopRanker code for: ', ['audit', 'report'], ['report', 'analysis']),
  ],
  health: 'idle', last_activity_at: null, current_blocker: null,
  tasks_completed: 0, tasks_failed: 0, updated_at: new Date().toISOString(),
});

defineLoop({
  domain: 'careeregine', name: 'Career Engine',
  stages: ['research', 'strategy', 'implement', 'report'],
  auto_continue_stages: ['research', 'report'],
  approval_stages: ['strategy', 'implement'],
  common_task_types: [
    tpl('ce-strat', 'Career Strategy', 'Develop career strategy', 'careeregine', 'Develop a career strategy for: ', ['research', 'strategy', 'report'], ['analysis', 'report']),
    tpl('ce-resume', 'Resume Review', 'Review and optimize resume', 'careeregine', 'Review and optimize resume for: ', ['audit', 'report'], ['report']),
  ],
  health: 'idle', last_activity_at: null, current_blocker: null,
  tasks_completed: 0, tasks_failed: 0, updated_at: new Date().toISOString(),
});

defineLoop({
  domain: 'founder2founder', name: 'Founder2Founder',
  stages: ['research', 'strategy', 'report'],
  auto_continue_stages: ['research', 'report'],
  approval_stages: ['strategy'],
  common_task_types: [
    tpl('f2f-research', 'Community Research', 'Research community topic', 'founder2founder', 'Research for F2F community: ', ['research', 'report'], ['report']),
  ],
  health: 'idle', last_activity_at: null, current_blocker: null,
  tasks_completed: 0, tasks_failed: 0, updated_at: new Date().toISOString(),
});

defineLoop({
  domain: 'wealthresearch', name: 'Wealth Research',
  stages: ['research', 'audit', 'strategy', 'report'],
  auto_continue_stages: ['research', 'audit'],
  approval_stages: ['strategy', 'report'],
  common_task_types: [
    tpl('wr-analysis', 'Investment Analysis', 'Analyze investment opportunity', 'wealthresearch', 'Analyze investment: ', ['research', 'audit', 'strategy', 'report'], ['analysis', 'report']),
  ],
  health: 'idle', last_activity_at: null, current_blocker: null,
  tasks_completed: 0, tasks_failed: 0, updated_at: new Date().toISOString(),
});

defineLoop({
  domain: 'newsroom', name: 'Newsroom',
  stages: ['research', 'audit', 'report'],
  auto_continue_stages: ['research', 'audit'],
  approval_stages: ['report'],
  common_task_types: [
    tpl('nr-brief', 'News Brief', 'Compile a news analysis', 'newsroom', 'Compile news brief on: ', ['research', 'report'], ['report']),
  ],
  health: 'idle', last_activity_at: null, current_blocker: null,
  tasks_completed: 0, tasks_failed: 0, updated_at: new Date().toISOString(),
});

defineLoop({
  domain: 'screenwriting', name: 'Screenwriting',
  stages: ['research', 'strategy', 'implement', 'review'],
  auto_continue_stages: ['research'],
  approval_stages: ['strategy', 'implement', 'review'],
  common_task_types: [
    tpl('sw-outline', 'Story Outline', 'Develop story outline', 'screenwriting', 'Outline a screenplay about: ', ['research', 'strategy', 'report'], ['report']),
  ],
  health: 'idle', last_activity_at: null, current_blocker: null,
  tasks_completed: 0, tasks_failed: 0, updated_at: new Date().toISOString(),
});

defineLoop({
  domain: 'music', name: 'Music',
  stages: ['research', 'strategy', 'implement'],
  auto_continue_stages: ['research'],
  approval_stages: ['strategy', 'implement'],
  common_task_types: [
    tpl('mu-compose', 'Composition', 'Compose music', 'music', 'Compose: ', ['research', 'strategy'], ['report']),
  ],
  health: 'idle', last_activity_at: null, current_blocker: null,
  tasks_completed: 0, tasks_failed: 0, updated_at: new Date().toISOString(),
});

defineLoop({
  domain: 'personalops', name: 'Personal Ops',
  stages: ['audit', 'strategy', 'implement', 'report'],
  auto_continue_stages: ['audit', 'report'],
  approval_stages: ['strategy', 'implement'],
  common_task_types: [
    tpl('po-plan', 'Planning', 'Plan personal task', 'personalops', 'Plan: ', ['audit', 'strategy', 'report'], ['report']),
  ],
  health: 'idle', last_activity_at: null, current_blocker: null,
  tasks_completed: 0, tasks_failed: 0, updated_at: new Date().toISOString(),
});

defineLoop({
  domain: 'general', name: 'General',
  stages: ['audit', 'implement', 'report'],
  auto_continue_stages: ['audit', 'report'],
  approval_stages: ['implement'],
  common_task_types: [
    tpl('gen-task', 'General Task', 'General purpose task', 'general', '', ['audit', 'report'], ['report']),
  ],
  health: 'idle', last_activity_at: null, current_blocker: null,
  tasks_completed: 0, tasks_failed: 0, updated_at: new Date().toISOString(),
});

module.exports = {
  defineLoop, getLoop, getAllLoops, getLoopSummaries,
  updateLoopHealth, recordLoopCompletion, blockLoop, idleLoop,
};
