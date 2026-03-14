// GPO Reverse Prompting — Evidence-backed learning from completed execution graphs
// Inspects task request, board rationale, work order, graph nodes, provider choices,
// handoffs, reviews, dossier recommendation.
// Generates prompt recipe candidates and provider fit update recommendations.

import type {
  Domain, Provider, AgentRole, TaskKind,
  ReversePromptingRun, PromptRecipeCandidate, FitUpdateRecommendation,
  ExecutionGraph, ExecutionNode,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const RUNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'reverse-prompting-runs.json');

function uid(): string {
  return 'rp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function readJson<T>(file: string, fallback: T): T {
  try { return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : fallback; } catch { return fallback; }
}

function writeJson(file: string, data: unknown): void {
  const dir = path.dirname(file);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ═══════════════════════════════════════════
// Stage → TaskKind mapping
// ═══════════════════════════════════════════

function stageToTaskKind(stage: string): TaskKind {
  const map: Record<string, TaskKind> = {
    implement: 'code', build: 'code', code: 'code', locate_files: 'code',
    research: 'research', audit: 'analysis', review: 'review',
    strategy: 'strategy', decide: 'strategy', report: 'analysis',
  };
  return map[stage] || 'general';
}

function agentToProvider(agent: string): Provider {
  if (agent.includes('claude')) return 'claude';
  if (agent.includes('openai') || agent.includes('gpt')) return 'openai';
  if (agent.includes('gemini')) return 'gemini';
  if (agent.includes('perplexity') || agent.includes('sonar')) return 'perplexity';
  return 'openai';
}

function agentToRole(agent: string, stage: string): AgentRole {
  if (agent.includes('claude')) return 'builder';
  if (agent.includes('perplexity')) return 'researcher';
  if (agent.includes('gemini')) return 'critic';
  const stageRoles: Record<string, AgentRole> = {
    research: 'researcher', audit: 'reviewer', review: 'reviewer',
    strategy: 'strategist', decide: 'strategist', implement: 'builder',
    build: 'builder', code: 'builder', report: 'specialist',
  };
  return stageRoles[stage] || 'reasoner';
}

// ═══════════════════════════════════════════
// Reverse Prompting Run
// ═══════════════════════════════════════════

/** Run reverse prompting analysis on a completed execution graph */
export function runReversePrompting(graphId: string): ReversePromptingRun | null {
  let graph: ExecutionGraph | null;
  let nodes: ExecutionNode[];

  try {
    const eg = require('./execution-graph') as {
      getGraph(id: string): ExecutionGraph | null;
      getNodesForGraph(id: string): ExecutionNode[];
    };
    graph = eg.getGraph(graphId);
    nodes = eg.getNodesForGraph(graphId);
  } catch { return null; }

  if (!graph) return null;

  // Gather handoffs
  let handoffs: import('./types').ExecutionHandoffRecord[] = [];
  try {
    const cc = require('./collaboration-contracts') as {
      getHandoffsForGraph(id: string): import('./types').ExecutionHandoffRecord[];
    };
    handoffs = cc.getHandoffsForGraph(graphId);
  } catch { /* no handoffs */ }

  // Gather reviews
  let reviews: import('./types').ReviewContract[] = [];
  try {
    const rc = require('./review-contracts') as {
      getReviewsForGraph(id: string): import('./types').ReviewContract[];
    };
    reviews = rc.getReviewsForGraph(graphId);
  } catch { /* no reviews */ }

  // Gather dossier
  let dossier: import('./types').PromotionDossier | null = null;
  try {
    const pd = require('./promotion-dossiers') as {
      getDossierForGraph(id: string): import('./types').PromotionDossier | null;
    };
    dossier = pd.getDossierForGraph(graphId);
  } catch { /* no dossier */ }

  // Analyze success/failure factors
  const successFactors: string[] = [];
  const failureFactors: string[] = [];
  const antiPatterns: string[] = [];

  const completedNodes = nodes.filter(n => n.status === 'completed');
  const failedNodes = nodes.filter(n => n.status === 'failed');

  for (const node of completedNodes) {
    const provider = agentToProvider(node.assigned_agent);
    const taskKind = stageToTaskKind(node.stage);
    successFactors.push(`${provider} succeeded at ${taskKind} (${node.title})`);
  }

  for (const node of failedNodes) {
    const provider = agentToProvider(node.assigned_agent);
    const taskKind = stageToTaskKind(node.stage);
    failureFactors.push(`${provider} failed at ${taskKind} (${node.title}): ${node.error || 'unknown error'}`);
  }

  // Detect anti-patterns
  if (failedNodes.length > completedNodes.length) {
    antiPatterns.push('More failures than successes — consider different provider assignments');
  }

  const failedReviews = reviews.filter(r => r.verdict === 'fail');
  if (failedReviews.length > 0) {
    for (const r of failedReviews) {
      antiPatterns.push(`Review failed: ${r.review_type} — ${r.review_notes || 'no notes'}`);
    }
  }

  // Check for provider mismatches
  for (const node of failedNodes) {
    const provider = agentToProvider(node.assigned_agent);
    const profile = getProviderProfile(provider);
    if (profile) {
      const taskKind = stageToTaskKind(node.stage);
      if (!profile.best_task_kinds.includes(taskKind)) {
        antiPatterns.push(`Provider mismatch: ${provider} used for ${taskKind} but best at ${profile.best_task_kinds.join(', ')}`);
      }
    }
  }

  if (handoffs.length > 0) {
    const lowConfHandoffs = handoffs.filter(h => h.confidence < 50);
    if (lowConfHandoffs.length > 0) {
      antiPatterns.push(`${lowConfHandoffs.length} handoff(s) with low confidence — consider tighter collaboration contracts`);
    }
  }

  // Generate recipe candidates from successful patterns
  const recipeCandidates: PromptRecipeCandidate[] = [];
  for (const node of completedNodes) {
    const provider = agentToProvider(node.assigned_agent);
    const role = agentToRole(node.assigned_agent, node.stage);
    const taskKind = stageToTaskKind(node.stage);

    recipeCandidates.push({
      provider_id: provider,
      role,
      task_kind: taskKind,
      template_sketch: `For ${taskKind} tasks in ${graph.domain}: ${node.title}. Output: ${node.output_summary || node.description}`,
      rationale: `Node "${node.title}" completed successfully with ${provider} in role ${role}`,
    });
  }

  // Generate fit update recommendations
  const fitUpdates: FitUpdateRecommendation[] = [];

  // Get current fits for comparison
  let currentFits: import('./types').ScopedProviderFit[] = [];
  try {
    const pr = require('./provider-registry') as {
      getAllFits(): import('./types').ScopedProviderFit[];
    };
    currentFits = pr.getAllFits();
  } catch { /* no fits */ }

  for (const node of [...completedNodes, ...failedNodes]) {
    const provider = agentToProvider(node.assigned_agent);
    const role = agentToRole(node.assigned_agent, node.stage);
    const taskKind = stageToTaskKind(node.stage);
    const succeeded = node.status === 'completed';

    const currentFit = currentFits.find(f =>
      f.provider_id === provider && f.role === role && f.task_kind === taskKind
    );
    const currentScore = currentFit?.fit_score || 50;
    const delta = succeeded ? 5 : -10;
    const recommended = Math.max(0, Math.min(100, currentScore + delta));

    if (Math.abs(recommended - currentScore) >= 5) {
      fitUpdates.push({
        provider_id: provider,
        role,
        task_kind: taskKind,
        current_score: currentScore,
        recommended_score: recommended,
        evidence: `Node "${node.title}" ${succeeded ? 'succeeded' : 'failed'} in graph ${graphId}`,
      });
    }
  }

  const run: ReversePromptingRun = {
    run_id: uid(),
    graph_id: graphId,
    task_id: graph.task_id,
    domain: graph.domain,
    success_factors: successFactors,
    failure_factors: failureFactors,
    anti_patterns: antiPatterns,
    recipe_candidates: recipeCandidates,
    fit_updates: fitUpdates,
    created_at: new Date().toISOString(),
  };

  const runs = readJson<ReversePromptingRun[]>(RUNS_FILE, []);
  runs.unshift(run);
  if (runs.length > 100) runs.length = 100;
  writeJson(RUNS_FILE, runs);

  // Apply fit updates as experimental evidence
  try {
    const pr = require('./provider-registry') as {
      upsertFit(opts: Record<string, unknown>): unknown;
    };
    for (const update of fitUpdates) {
      pr.upsertFit({
        provider_id: update.provider_id,
        role: update.role,
        task_kind: update.task_kind,
        scope_level: 'engine',
        scope_id: graph.domain,
        fit_score: update.recommended_score,
        notes: `Auto-updated from reverse prompting run ${run.run_id}`,
      });
    }
  } catch { /* provider registry not loaded */ }

  return run;
}

// Helper to access provider profiles for anti-pattern detection
function getProviderProfile(providerId: Provider): import('./types').ProviderCapabilityProfile | null {
  try {
    const pr = require('./provider-registry') as {
      getProviderProfile(id: Provider): import('./types').ProviderCapabilityProfile | null;
    };
    return pr.getProviderProfile(providerId);
  } catch { return null; }
}

// ═══════════════════════════════════════════
// Run Retrieval
// ═══════════════════════════════════════════

export function getRunsForGraph(graphId: string): ReversePromptingRun[] {
  return readJson<ReversePromptingRun[]>(RUNS_FILE, []).filter(r => r.graph_id === graphId);
}

export function getAllRuns(): ReversePromptingRun[] {
  return readJson<ReversePromptingRun[]>(RUNS_FILE, []);
}

export function getRun(runId: string): ReversePromptingRun | null {
  return readJson<ReversePromptingRun[]>(RUNS_FILE, []).find(r => r.run_id === runId) || null;
}

module.exports = {
  runReversePrompting,
  getRunsForGraph, getAllRuns, getRun,
};
