// GPO Workflow Store — File-backed persistence with idempotency

import type { WorkflowInstance, WorkflowStage, TimelineEntry } from './workflow-types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');
const crypto = require('crypto') as typeof import('crypto');

const STATE_FILE = path.resolve(__dirname, '..', '..', 'state', 'workflows.json');

function readStore(): WorkflowInstance[] {
  try {
    if (fs.existsSync(STATE_FILE)) return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  } catch { /* */ }
  return [];
}

function writeStore(instances: WorkflowInstance[]): void {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(instances, null, 2));
}

export function generateId(): string {
  const ts = Date.now().toString(36);
  const rand = crypto.randomBytes(4).toString('hex');
  return `wf_${ts}_${rand}`;
}

export function create(instance: WorkflowInstance): WorkflowInstance {
  const all = readStore();
  if (all.find(w => w.id === instance.id)) return instance; // idempotent
  all.push(instance);
  writeStore(all);
  return instance;
}

export function get(id: string): WorkflowInstance | null {
  return readStore().find(w => w.id === id) || null;
}

export function list(filter?: { tenantId?: string; projectId?: string; state?: WorkflowStage[] }): WorkflowInstance[] {
  let results = readStore();
  if (filter?.tenantId) results = results.filter(w => w.tenantId === filter.tenantId);
  if (filter?.projectId) results = results.filter(w => w.projectId === filter.projectId);
  if (filter?.state?.length) results = results.filter(w => filter.state!.includes(w.state));
  return results;
}

export function update(instance: WorkflowInstance, options?: { idempotencyKey?: string }): WorkflowInstance {
  if (options?.idempotencyKey && instance.idempotencyKeys.includes(options.idempotencyKey)) {
    return instance; // already applied
  }
  if (options?.idempotencyKey) {
    instance.idempotencyKeys.push(options.idempotencyKey);
    if (instance.idempotencyKeys.length > 100) instance.idempotencyKeys = instance.idempotencyKeys.slice(-50);
  }
  instance.updatedAt = new Date().toISOString();

  const all = readStore();
  const idx = all.findIndex(w => w.id === instance.id);
  if (idx >= 0) all[idx] = instance;
  else all.push(instance);
  writeStore(all);
  return instance;
}

export function appendTimeline(id: string, entry: TimelineEntry): WorkflowInstance | null {
  const instance = get(id);
  if (!instance) return null;
  instance.timeline.push(entry);
  return update(instance);
}

export function recoverDangling(): { recovered: string[]; stale: string[] } {
  const all = readStore();
  const recovered: string[] = [];
  const stale: string[] = [];
  const now = Date.now();
  const staleThreshold = 30 * 60000; // 30 min

  for (const w of all) {
    if (['executing', 'scheduled', 'merging', 'validating'].includes(w.state)) {
      const lastUpdate = new Date(w.updatedAt).getTime();
      if (now - lastUpdate > staleThreshold) {
        stale.push(w.id);
      }
    }
  }

  return { recovered, stale };
}

module.exports = { generateId, create, get, list, update, appendTimeline, recoverDangling };
