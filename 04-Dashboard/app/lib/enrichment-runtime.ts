// GPO Enrichment Runtime — Real controlled enrichment execution
// Evaluates due jobs, runs allowed enrichments, updates context.
// Privacy-preserving: skips unsafe sources, respects instance policy.

import type {
  EnrichmentJob, EnrichmentSource, EnrichmentResult,
  EnrichmentJobState, EnrichmentRunRequest, EnrichmentRunResponse,
  EnrichmentJobStatus, Domain,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const STATE_FILE = path.resolve(__dirname, '..', '..', 'state', 'enrichment-state.json');

function readState(): Record<string, EnrichmentJobState> {
  try { return fs.existsSync(STATE_FILE) ? JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')) : {}; } catch { return {}; }
}

function writeState(state: Record<string, EnrichmentJobState>): void {
  const dir = path.dirname(STATE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// ═══════════════════════════════════════════
// Job State Management
// ═══════════════════════════════════════════

/** Get all job states */
export function getAllJobStates(): EnrichmentJobState[] {
  const engines = require('./engines') as { getEnrichmentJobs(): EnrichmentJob[] };
  const jobs = engines.getEnrichmentJobs();
  const state = readState();

  return jobs.map(job => state[job.id] || {
    job_id: job.id, status: 'idle' as EnrichmentJobStatus,
    last_run_at: null, last_result: null, last_error: null,
    next_due_at: calculateNextDue(job), run_count: 0, enabled: job.enabled,
  });
}

/** Get a single job state */
export function getJobState(jobId: string): EnrichmentJobState | null {
  const states = getAllJobStates();
  return states.find(s => s.job_id === jobId) || null;
}

/** Get jobs that are due for execution */
export function getDueJobs(): EnrichmentJobState[] {
  const now = Date.now();
  return getAllJobStates().filter(s => {
    if (!s.enabled) return false;
    if (s.status === 'running') return false;
    if (!s.next_due_at) return true; // never run → due
    return new Date(s.next_due_at).getTime() <= now;
  });
}

function calculateNextDue(job: EnrichmentJob): string | null {
  if (job.schedule === 'on_demand') return null;
  const now = Date.now();
  const lastRun = job.last_run_at ? new Date(job.last_run_at).getTime() : 0;
  const interval = job.schedule === 'daily' ? 86400000 : job.schedule === 'weekly' ? 604800000 : 0;
  if (!interval) return null;
  return new Date(Math.max(now, lastRun + interval)).toISOString();
}

// ═══════════════════════════════════════════
// Enrichment Execution
// ═══════════════════════════════════════════

/** Run an enrichment job */
export function runJob(request: EnrichmentRunRequest): EnrichmentRunResponse {
  const startTime = Date.now();
  const engines = require('./engines') as {
    getEnrichmentJobs(): EnrichmentJob[];
    getEnrichmentSources(): EnrichmentSource[];
  };

  const jobs = engines.getEnrichmentJobs();
  const job = jobs.find(j => j.id === request.job_id);
  if (!job) {
    return { job_id: request.job_id, status: 'failed', result: null, error: 'Job not found', duration_ms: 0, privacy_check_passed: false };
  }

  // Privacy check
  const privacyPassed = checkPrivacy(job);
  if (!privacyPassed) {
    updateJobState(job.id, { status: 'skipped', last_error: 'Privacy check failed' });
    return { job_id: job.id, status: 'skipped', result: null, error: 'Privacy check failed — job scope or source not allowed', duration_ms: Date.now() - startTime, privacy_check_passed: false };
  }

  if (request.dry_run) {
    return { job_id: job.id, status: 'idle', result: null, error: null, duration_ms: Date.now() - startTime, privacy_check_passed: true };
  }

  // Mark running
  updateJobState(job.id, { status: 'running' });

  try {
    const result = executeJob(job);
    updateJobState(job.id, {
      status: 'completed', last_run_at: new Date().toISOString(),
      last_result: result, last_error: null,
      next_due_at: calculateNextDue({ ...job, last_run_at: new Date().toISOString() }),
      run_count: (getJobState(job.id)?.run_count || 0) + 1,
    });

    // Apply result to context
    applyEnrichmentResult(job, result);

    console.log(`[enrichment] Job ${job.id} completed: ${result.patterns_found.length} patterns, ${result.decisions_extracted.length} decisions`);
    return { job_id: job.id, status: 'completed', result, error: null, duration_ms: Date.now() - startTime, privacy_check_passed: true };
  } catch (e: unknown) {
    const error = (e as Error).message.slice(0, 200);
    updateJobState(job.id, { status: 'failed', last_error: error });
    console.log(`[enrichment] Job ${job.id} failed: ${error}`);
    return { job_id: job.id, status: 'failed', result: null, error, duration_ms: Date.now() - startTime, privacy_check_passed: true };
  }
}

/** Run all due jobs */
export function runDueJobs(): EnrichmentRunResponse[] {
  const due = getDueJobs();
  const results: EnrichmentRunResponse[] = [];
  for (const job of due) {
    results.push(runJob({ job_id: job.job_id, force: false, dry_run: false }));
  }
  return results;
}

// ═══════════════════════════════════════════
// Job Executors — real enrichment logic
// ═══════════════════════════════════════════

function executeJob(job: EnrichmentJob): EnrichmentResult {
  switch (job.type) {
    case 'profile_refinement': return executeProfileRefinement(job);
    case 'pattern_extraction': return executePatternExtraction(job);
    case 'summary_improvement': return executeSummaryImprovement(job);
    case 'context_quality': return executeContextQuality(job);
    case 'artifact_clustering': return executeArtifactClustering(job);
    default: return { source_id: job.id, patterns_found: [], decisions_extracted: [], artifacts_found: [], summary: 'Unknown job type', run_at: new Date().toISOString() };
  }
}

function executeProfileRefinement(_job: EnrichmentJob): EnrichmentResult {
  const patterns: string[] = [];
  const decisions: string[] = [];

  try {
    const profile = require('./operator-profile') as { getProfile(): { approval_patterns: { approval_rate: number; revision_rate: number; total_decisions: number }; correction_patterns: string[] } };
    const p = profile.getProfile();
    if (p.approval_patterns.total_decisions > 5) {
      if (p.approval_patterns.approval_rate > 0.9) patterns.push('High approval rate — operator trusts agent output');
      if (p.approval_patterns.revision_rate > 0.2) patterns.push('Frequent revisions — operator refines output iteratively');
    }
    if (p.correction_patterns.length > 3) {
      patterns.push(`Common corrections: ${p.correction_patterns.slice(0, 3).join(', ')}`);
    }
  } catch { /* ignore */ }

  return { source_id: 'profile', patterns_found: patterns, decisions_extracted: decisions, artifacts_found: [], summary: `Refined operator profile: ${patterns.length} pattern(s) found`, run_at: new Date().toISOString() };
}

function executePatternExtraction(job: EnrichmentJob): EnrichmentResult {
  const patterns: string[] = [];
  const decisions: string[] = [];

  try {
    const context = require('./context') as { getDecisions(d: string): Array<{ category: string; title: string }> };
    // Extract patterns across all domains
    const domains = ['topranker', 'careeregine', 'general'];
    for (const d of domains) {
      const decs = context.getDecisions(d);
      if (decs.length > 3) {
        const categories = decs.map(dec => dec.category);
        const catCounts: Record<string, number> = {};
        for (const c of categories) catCounts[c] = (catCounts[c] || 0) + 1;
        const topCat = Object.entries(catCounts).sort((a, b) => b[1] - a[1])[0];
        if (topCat) patterns.push(`${d}: Most common decision type is "${topCat[0]}" (${topCat[1]} times)`);
      }
    }
  } catch { /* ignore */ }

  return { source_id: 'patterns', patterns_found: patterns, decisions_extracted: decisions, artifacts_found: [], summary: `Pattern extraction: ${patterns.length} pattern(s)`, run_at: new Date().toISOString() };
}

function executeSummaryImprovement(job: EnrichmentJob): EnrichmentResult {
  const patterns: string[] = [];

  try {
    const projects = require('./projects') as { getAllProjects(): Array<{ project_id: string; project_name: string; decisions: unknown[]; artifacts: unknown[]; context_summary: string }> };
    for (const p of projects.getAllProjects()) {
      if (!p.context_summary && (p.decisions.length > 0 || p.artifacts.length > 0)) {
        patterns.push(`Project "${p.project_name}" has ${p.decisions.length} decisions and ${p.artifacts.length} artifacts but no context summary — could be generated`);
      }
    }
  } catch { /* ignore */ }

  return { source_id: 'summaries', patterns_found: patterns, decisions_extracted: [], artifacts_found: [], summary: `Summary check: ${patterns.length} improvement(s) suggested`, run_at: new Date().toISOString() };
}

function executeContextQuality(_job: EnrichmentJob): EnrichmentResult {
  const patterns: string[] = [];

  try {
    const docsGen = require('./docs-generator') as { getDocsHealth(): { stale_docs: string[]; missing_docs: string[]; refresh_recommended: boolean } };
    const health = docsGen.getDocsHealth();
    if (health.refresh_recommended) patterns.push('Documentation refresh recommended');
    if (health.stale_docs.length > 0) patterns.push(`${health.stale_docs.length} stale doc(s)`);
    if (health.missing_docs.length > 0) patterns.push(`${health.missing_docs.length} missing doc(s)`);
  } catch { /* ignore */ }

  return { source_id: 'quality', patterns_found: patterns, decisions_extracted: [], artifacts_found: [], summary: `Context quality: ${patterns.length} finding(s)`, run_at: new Date().toISOString() };
}

function executeArtifactClustering(_job: EnrichmentJob): EnrichmentResult {
  return { source_id: 'clustering', patterns_found: [], decisions_extracted: [], artifacts_found: [], summary: 'Artifact clustering: not yet implemented', run_at: new Date().toISOString() };
}

// ═══════════════════════════════════════════
// Privacy Check
// ═══════════════════════════════════════════

function checkPrivacy(job: EnrichmentJob): boolean {
  try {
    const inst = require('./instance') as { getInstance(): { policy: { local_only: boolean } } };
    const policy = inst.getInstance().policy;

    // If local-only, only allow privacy-safe sources
    if (policy.local_only) {
      const engines = require('./engines') as { getEnrichmentSources(): EnrichmentSource[] };
      const sources = engines.getEnrichmentSources();
      const relatedSource = sources.find(s => s.id.includes(job.type.split('_')[0]));
      if (relatedSource && !relatedSource.privacy_safe) return false;
    }
  } catch { /* allow if can't check */ }

  return true;
}

// ═══════════════════════════════════════════
// Result Application
// ═══════════════════════════════════════════

function applyEnrichmentResult(job: EnrichmentJob, result: EnrichmentResult): void {
  if (job.type === 'profile_refinement' && result.patterns_found.length > 0) {
    try {
      const profile = require('./operator-profile') as { updateProfile(u: Record<string, unknown>): void };
      // Don't overwrite — just log that patterns were found
      console.log(`[enrichment] Profile patterns: ${result.patterns_found.join('; ')}`);
    } catch { /* ignore */ }
  }

  if (job.type === 'pattern_extraction' && result.patterns_found.length > 0) {
    try {
      const engines = require('./engines') as { updateEngineContext(d: string, u: Record<string, unknown>): void };
      // Update engine context with found patterns
      for (const pattern of result.patterns_found) {
        const domainMatch = pattern.match(/^(\w+):/);
        if (domainMatch) {
          const domain = domainMatch[1];
          engines.updateEngineContext(domain, {
            cross_project_patterns: result.patterns_found.filter(p => p.startsWith(domain)),
          });
        }
      }
    } catch { /* ignore */ }
  }
}

// ═══════════════════════════════════════════
// State Helpers
// ═══════════════════════════════════════════

function updateJobState(jobId: string, updates: Partial<EnrichmentJobState>): void {
  const state = readState();
  if (!state[jobId]) {
    state[jobId] = { job_id: jobId, status: 'idle', last_run_at: null, last_result: null, last_error: null, next_due_at: null, run_count: 0, enabled: true };
  }
  Object.assign(state[jobId], updates);
  writeState(state);
}

module.exports = {
  getAllJobStates, getJobState, getDueJobs,
  runJob, runDueJobs,
};
