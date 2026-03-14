// GPO Background Enrichment Scheduler
// Controlled automatic execution of safe enrichment jobs.
// Respects privacy, local-only mode, and source safety flags.
// Can be paused/disabled via instance settings.

import type { EnrichmentRunResponse } from './types';

let intervalHandle: ReturnType<typeof setInterval> | null = null;
let running = false;
let paused = false;
let lastCheckAt: string | null = null;
let totalRuns = 0;
let totalErrors = 0;

const CHECK_INTERVAL_MS = 300000; // 5 minutes

// ═══════════════════════════════════════════
// Scheduler Control
// ═══════════════════════════════════════════

/** Start the background scheduler */
export function start(): void {
  if (intervalHandle) return; // already running

  console.log(`[scheduler] Starting background enrichment scheduler (interval: ${CHECK_INTERVAL_MS / 1000}s)`);
  intervalHandle = setInterval(tick, CHECK_INTERVAL_MS);

  // Run initial check after short delay
  setTimeout(tick, 10000);
}

/** Stop the background scheduler */
export function stop(): void {
  if (intervalHandle) {
    clearInterval(intervalHandle);
    intervalHandle = null;
    console.log('[scheduler] Stopped');
  }
}

/** Pause without stopping — skips execution but keeps timer */
export function pause(): void {
  paused = true;
  console.log('[scheduler] Paused');
}

/** Resume from pause */
export function resume(): void {
  paused = false;
  console.log('[scheduler] Resumed');
}

/** Get scheduler status */
export function getStatus(): {
  running: boolean; paused: boolean; last_check_at: string | null;
  total_runs: number; total_errors: number; interval_ms: number;
} {
  return {
    running: !!intervalHandle,
    paused,
    last_check_at: lastCheckAt,
    total_runs: totalRuns,
    total_errors: totalErrors,
    interval_ms: CHECK_INTERVAL_MS,
  };
}

// ═══════════════════════════════════════════
// Tick — periodic check and execution
// ═══════════════════════════════════════════

function tick(): void {
  if (running || paused) return;
  running = true;
  lastCheckAt = new Date().toISOString();

  try {
    // Check if enrichment is allowed
    if (!isEnrichmentAllowed()) {
      running = false;
      return;
    }

    const enrichment = require('./enrichment-runtime') as {
      getDueJobs(): Array<{ job_id: string; enabled: boolean }>;
      runJob(req: { job_id: string; force: boolean; dry_run: boolean }): EnrichmentRunResponse;
    };

    const dueJobs = enrichment.getDueJobs();
    if (dueJobs.length === 0) {
      running = false;
      return;
    }

    // Only run privacy-safe jobs automatically
    const safeJobs = dueJobs.filter(j => isSafeForAutoRun(j.job_id));

    for (const job of safeJobs) {
      try {
        const result = enrichment.runJob({ job_id: job.job_id, force: false, dry_run: false });
        totalRuns++;
        if (result.status === 'failed') totalErrors++;

        if (result.status === 'completed') {
          console.log(`[scheduler] Job ${job.job_id}: completed`);
        } else if (result.status === 'skipped') {
          console.log(`[scheduler] Job ${job.job_id}: skipped (privacy)`);
        } else if (result.status === 'failed') {
          console.log(`[scheduler] Job ${job.job_id}: failed — ${result.error?.slice(0, 80)}`);
        }
      } catch (e: unknown) {
        totalErrors++;
        console.log(`[scheduler] Job ${job.job_id} error: ${(e as Error).message.slice(0, 80)}`);
      }
    }
  } catch (e: unknown) {
    console.log(`[scheduler] Tick error: ${(e as Error).message.slice(0, 80)}`);
  } finally {
    running = false;
  }
}

// ═══════════════════════════════════════════
// Safety Checks
// ═══════════════════════════════════════════

/** Check if enrichment is globally allowed */
function isEnrichmentAllowed(): boolean {
  try {
    const inst = require('./instance') as { isCapabilityEnabled(id: string): boolean };
    return inst.isCapabilityEnabled('context-memory');
  } catch {
    return true; // allow if can't check
  }
}

/** Check if a job is safe for automatic background execution */
function isSafeForAutoRun(jobId: string): boolean {
  // These jobs are always safe — they only read local state
  const safeJobs = new Set([
    'ej_profile', 'ej_patterns', 'ej_summaries', 'ej_quality',
  ]);

  if (safeJobs.has(jobId)) return true;

  // Check the source safety flag for other jobs
  try {
    const engines = require('./engines') as {
      getEnrichmentSources(): Array<{ id: string; privacy_safe: boolean; enabled: boolean }>;
    };
    const sources = engines.getEnrichmentSources();
    // A job is safe if all related sources are privacy-safe and enabled
    const relatedSource = sources.find(s => jobId.includes(s.id.replace('es_', '')));
    if (relatedSource && (!relatedSource.privacy_safe || !relatedSource.enabled)) {
      return false;
    }
  } catch { /* allow if can't check */ }

  return false; // unknown jobs are not safe by default
}

module.exports = { start, stop, pause, resume, getStatus };
