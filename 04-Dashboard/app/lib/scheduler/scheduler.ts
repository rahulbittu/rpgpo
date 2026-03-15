// GPO Scheduler — Orchestrator loop for parallel execution

import type { SchedulerConfig, SchedulerStateSnapshot, QueuePriority } from '../types';

const schedulerStore = require('../state/scheduler-store');
const workQueue = require('./work-queue');
const providerCapacity = require('./provider-capacity');
const backpressure = require('./backpressure');
const dagRunner = require('./dag-runner');
const recovery = require('./recovery');
const { attemptId: genAttemptId } = require('./ids');

let _running = false;
let _timer: ReturnType<typeof setInterval> | null = null;

export async function start(): Promise<void> {
  if (_running) return;
  _running = true;
  workQueue.init();

  const config = schedulerStore.loadConfig();
  if (!config.featureFlags.enabled) {
    console.log('[scheduler] Feature flag disabled — running in serial mode');
    return;
  }

  console.log('[scheduler] Starting with globalMaxConcurrent=' + config.globalMaxConcurrent);
  _timer = setInterval(() => tick(), 250);
}

export async function stop(): Promise<void> {
  _running = false;
  if (_timer) { clearInterval(_timer); _timer = null; }
}

export function isPaused(): boolean {
  return schedulerStore.getPaused();
}

export function pause(): void {
  schedulerStore.setPaused(true);
  console.log('[scheduler] Paused');
}

export function resume(): void {
  schedulerStore.setPaused(false);
  console.log('[scheduler] Resumed');
}

export function state(): SchedulerStateSnapshot {
  const config = schedulerStore.loadConfig();
  const stats = workQueue.stats();
  const windows = providerCapacity.currentWindows(config);
  stats.capacityWindows = windows;

  const totalCapacity = windows.reduce((s: number, w: { dynamicLimit: number }) => s + w.dynamicLimit, 0) || 1;
  stats.saturation = stats.inFlight / totalCapacity;

  return {
    config, stats,
    paused: isPaused(),
    updatedAt: new Date().toISOString(),
  };
}

interface GraphNode {
  id?: string;
  node_id?: string;
  title?: string;
  assigned_model?: string;
  depends_on?: (string | number)[];
}

export function submitRun(runId: string, nodes: GraphNode[], ctx: { tenantId: string; projectId: string; priorityDefault?: QueuePriority }): void {
  const items = dagRunner.seedRun(runId, nodes, ctx);
  workQueue.enqueue(items);
  console.log(`[scheduler] Submitted run ${runId} with ${items.length} nodes, ${items.filter((i: { ready: boolean }) => i.ready).length} ready`);
}

async function tick(): Promise<void> {
  if (!_running || isPaused()) return;

  const config = schedulerStore.loadConfig();
  if (!config.featureFlags.enabled) return;

  try {
    // 1. Recovery sweep
    recovery.sweep(new Date().toISOString(), config);

    // 2. Evaluate backpressure
    if (config.featureFlags.enableDynamicBackpressure) {
      const signals = backpressure.evaluate();
      if (signals.length > 0) {
        providerCapacity.applyBackpressureSignals(signals);
      }
    }

    // 3. Dequeue ready items within capacity
    const available = config.globalMaxConcurrent - (workQueue.stats().inFlight || 0);
    if (available <= 0) return;

    const items = workQueue.dequeueReady('scheduler-main', Math.min(available, 5));

    for (const item of items) {
      if (!providerCapacity.tryAcquire(item, config)) {
        // Can't acquire capacity — put back
        workQueue.ackFailure(item.id, '', 'CAPACITY_FULL', 'No capacity', true);
        continue;
      }

      // Execute in background
      const aid = genAttemptId();
      item.attempts.push({
        attemptId: aid,
        startedAt: new Date().toISOString(),
        status: 'in_progress',
        provider: item.provider,
      });

      // Simulate execution (actual execution would call the structured pipeline)
      executeItem(item, aid, config).catch(() => {});
    }
  } catch (e) {
    console.log(`[scheduler] Tick error: ${(e as Error).message?.slice(0, 100)}`);
  }
}

async function executeItem(item: any, aid: string, config: SchedulerConfig): Promise<void> {
  const start = Date.now();
  try {
    // Use existing structured subtask execution
    const { executeStructuredSubtask } = require('../deliberation');
    const result = await executeStructuredSubtask({
      provider: item.provider,
      taskDescription: `Execute node ${item.key.nodeId}`,
      engineId: 'general',
      taskId: item.key.runId,
      subtaskId: item.key.nodeId,
    });

    const duration = Date.now() - start;
    workQueue.ackSuccess(item.id, aid);
    providerCapacity.release(item);

    // Notify DAG runner
    const unlocked = dagRunner.onNodeComplete(item.key.runId, item.key.nodeId);
    if (unlocked.length > 0) {
      // Mark newly ready items
      for (const nodeId of unlocked) {
        const queueItems = workQueue.getQueue();
        const qi = queueItems.find((q: any) => q.key.nodeId === nodeId && q.key.runId === item.key.runId);
        if (qi) workQueue.markReady(qi.id);
      }
    }
  } catch (e) {
    const duration = Date.now() - start;
    const retryable = item.attempts.length < config.maxAttempts;
    workQueue.ackFailure(item.id, aid, 'EXEC_ERROR', (e as Error).message?.slice(0, 200) || 'Unknown', retryable);
    providerCapacity.release(item);
  }
}

module.exports = { start, stop, isPaused, pause, resume, state, submitRun };
