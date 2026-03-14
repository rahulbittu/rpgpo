// GPO Deliverable ID — Deterministic identity for deliverables

import type { DeliverableKey, StructuredDeliverable } from './types';

const crypto = require('crypto') as typeof import('crypto');

/** Compute a deterministic deliverable ID from a key */
export function computeDeliverableId(key: DeliverableKey): string {
  const canonical = `${key.projectId}:${key.taskId}:${key.variant}:${key.contractVersion}`;
  const hash = crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 8);
  return `dlv_${slugify(key.projectId)}_${slugify(key.taskId)}_${key.variant}_${hash}`;
}

/** Create a DeliverableKey from task context */
export function makeKey(projectId: string, taskId: string, variant: StructuredDeliverable['kind'], contractVersion: string = 'v1'): DeliverableKey {
  return { projectId, taskId, variant, contractVersion };
}

/** Parse a deliverable ID back to components (best-effort) */
export function parseId(id: string): { projectId: string; taskId: string; variant: string; hash: string } | null {
  const parts = id.replace('dlv_', '').split('_');
  if (parts.length < 4) return null;
  const hash = parts[parts.length - 1];
  const variant = parts[parts.length - 2];
  const taskId = parts[parts.length - 3];
  const projectId = parts.slice(0, parts.length - 3).join('_');
  return { projectId, taskId, variant, hash };
}

/** Slugify a string for use in IDs */
function slugify(s: string): string {
  return s.replace(/[^a-zA-Z0-9]/g, '').slice(0, 16).toLowerCase() || 'default';
}

/** Compute content hash for a deliverable */
export function computeContentHash(content: unknown): string {
  const canonical = JSON.stringify(content, Object.keys(content as Record<string, unknown>).sort());
  return crypto.createHash('sha256').update(canonical).digest('hex').slice(0, 16);
}

module.exports = { computeDeliverableId, makeKey, parseId, computeContentHash };
