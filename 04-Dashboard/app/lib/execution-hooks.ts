// GPO Execution Hooks — Reusable hook layer between graph transitions and execution
// Supports before_transition hooks that are typed, inspectable, and auditable.

import type {
  RuntimeEnforcementHook, HookTransition, HookExecutionResult,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const HOOKS_FILE = path.resolve(__dirname, '..', '..', 'state', 'execution-hooks.json');

function uid(): string { return 'eh_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function readJson<T>(f: string, fb: T): T { try { return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, 'utf-8')) : fb; } catch { return fb; } }
function writeJson(f: string, d: unknown): void { const dir = path.dirname(f); if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); fs.writeFileSync(f, JSON.stringify(d, null, 2)); }

const ALL_TRANSITIONS: HookTransition[] = [
  'graph_create', 'node_queue', 'node_start', 'node_complete',
  'review_complete', 'dossier_generate', 'promotion_attempt',
];

/** Attach enforcement hooks to a graph for all transition points */
export function attachHooks(graphId: string): RuntimeEnforcementHook[] {
  const existing = getHooksForGraph(graphId);
  if (existing.length > 0) return existing; // already attached

  const hooks: RuntimeEnforcementHook[] = ALL_TRANSITIONS.map(transition => ({
    hook_id: uid(),
    transition,
    graph_id: graphId,
    enabled: true,
    created_at: new Date().toISOString(),
  }));

  const all = readJson<RuntimeEnforcementHook[]>(HOOKS_FILE, []);
  all.unshift(...hooks);
  if (all.length > 500) all.length = 500;
  writeJson(HOOKS_FILE, all);

  return hooks;
}

/** Get hooks for a graph */
export function getHooksForGraph(graphId: string): RuntimeEnforcementHook[] {
  return readJson<RuntimeEnforcementHook[]>(HOOKS_FILE, []).filter(h => h.graph_id === graphId);
}

/** Execute all enabled hooks for a transition */
export function executeHooks(transition: HookTransition, graphId: string, nodeId?: string): HookExecutionResult[] {
  const hooks = getHooksForGraph(graphId).filter(h => h.transition === transition && h.enabled);
  const results: HookExecutionResult[] = [];

  for (const hook of hooks) {
    try {
      const re = require('./runtime-enforcement') as {
        checkTransition(t: string, gid: string, nid?: string, hid?: string): HookExecutionResult;
      };
      const result = re.checkTransition(transition, graphId, nodeId, hook.hook_id);
      results.push(result);
    } catch { /* */ }
  }

  // If no hooks are attached, still run a check
  if (hooks.length === 0) {
    try {
      const re = require('./runtime-enforcement') as {
        checkTransition(t: string, gid: string, nid?: string): HookExecutionResult;
      };
      results.push(re.checkTransition(transition, graphId, nodeId));
    } catch { /* */ }
  }

  return results;
}

/** Check if all hooks pass for a transition */
export function allHooksPass(transition: HookTransition, graphId: string, nodeId?: string): boolean {
  const results = executeHooks(transition, graphId, nodeId);
  return results.every(r => r.outcome === 'proceed' || r.outcome === 'proceed_with_warning');
}

module.exports = {
  attachHooks, getHooksForGraph,
  executeHooks, allHooksPass,
};
