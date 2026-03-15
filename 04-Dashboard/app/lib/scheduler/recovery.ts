// GPO Scheduler Recovery — Lease expiration, crash recovery, DLQ promotion

import type { SchedulerConfig } from '../types';

const workQueue = require('./work-queue');

/**
 * Sweep for expired leases and promote to DLQ after maxAttempts.
 */
export function sweep(nowIso: string, config: SchedulerConfig): { leasesRecovered: number; movedToDLQ: number } {
  const leasesRecovered = workQueue.recoverLeases(nowIso);
  let movedToDLQ = 0;

  // Check queue for items that have exceeded maxAttempts
  const queue = workQueue.getQueue();
  for (const item of queue) {
    if (item.attempts.length >= config.maxAttempts) {
      workQueue.markCanceled(item.id, `Max attempts (${config.maxAttempts}) exceeded`);
      movedToDLQ++;
    }
  }

  return { leasesRecovered, movedToDLQ };
}

/**
 * Graceful drain: stop dequeue, wait for in-flight to complete or timeout.
 */
export async function drainGraceful(timeoutMs: number): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const inflight = workQueue.getInflight();
    if (inflight.length === 0) return;
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  // Timeout: requeue remaining
  const remaining = workQueue.getInflight();
  for (const item of remaining) {
    workQueue.ackFailure(item.id, '', 'DRAIN_TIMEOUT', 'Graceful drain timeout', true);
  }
}

/**
 * Cancel a run: move all queued/in-flight items to canceled.
 */
export function cancelRun(runId: string, reason: string): number {
  const dagRunner = require('./dag-runner');
  const canceled = dagRunner.cancelRun(runId);
  // Also cancel in queue
  const queue = workQueue.getQueue();
  for (const item of queue) {
    if (item.key.runId === runId) {
      workQueue.markCanceled(item.id, reason);
    }
  }
  return canceled.length;
}

module.exports = { sweep, drainGraceful, cancelRun };
