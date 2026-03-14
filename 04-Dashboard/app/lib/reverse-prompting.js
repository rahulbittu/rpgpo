"use strict";
// GPO Reverse Prompting — Evidence-backed learning from completed execution graphs
// Inspects task request, board rationale, work order, graph nodes, provider choices,
// handoffs, reviews, dossier recommendation.
// Generates prompt recipe candidates and provider fit update recommendations.
Object.defineProperty(exports, "__esModule", { value: true });
exports.runReversePrompting = runReversePrompting;
exports.getRunsForGraph = getRunsForGraph;
exports.getAllRuns = getAllRuns;
exports.getRun = getRun;
const fs = require('fs');
const path = require('path');
const RUNS_FILE = path.resolve(__dirname, '..', '..', 'state', 'reverse-prompting-runs.json');
function uid() {
    return 'rp_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}
function readJson(file, fallback) {
    try {
        return fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf-8')) : fallback;
    }
    catch {
        return fallback;
    }
}
function writeJson(file, data) {
    const dir = path.dirname(file);
    if (!fs.existsSync(dir))
        fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}
// ═══════════════════════════════════════════
// Stage → TaskKind mapping
// ═══════════════════════════════════════════
function stageToTaskKind(stage) {
    const map = {
        implement: 'code', build: 'code', code: 'code', locate_files: 'code',
        research: 'research', audit: 'analysis', review: 'review',
        strategy: 'strategy', decide: 'strategy', report: 'analysis',
    };
    return map[stage] || 'general';
}
function agentToProvider(agent) {
    if (agent.includes('claude'))
        return 'claude';
    if (agent.includes('openai') || agent.includes('gpt'))
        return 'openai';
    if (agent.includes('gemini'))
        return 'gemini';
    if (agent.includes('perplexity') || agent.includes('sonar'))
        return 'perplexity';
    return 'openai';
}
function agentToRole(agent, stage) {
    if (agent.includes('claude'))
        return 'builder';
    if (agent.includes('perplexity'))
        return 'researcher';
    if (agent.includes('gemini'))
        return 'critic';
    const stageRoles = {
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
function runReversePrompting(graphId) {
    let graph;
    let nodes;
    try {
        const eg = require('./execution-graph');
        graph = eg.getGraph(graphId);
        nodes = eg.getNodesForGraph(graphId);
    }
    catch {
        return null;
    }
    if (!graph)
        return null;
    // Gather handoffs
    let handoffs = [];
    try {
        const cc = require('./collaboration-contracts');
        handoffs = cc.getHandoffsForGraph(graphId);
    }
    catch { /* no handoffs */ }
    // Gather reviews
    let reviews = [];
    try {
        const rc = require('./review-contracts');
        reviews = rc.getReviewsForGraph(graphId);
    }
    catch { /* no reviews */ }
    // Gather dossier
    let dossier = null;
    try {
        const pd = require('./promotion-dossiers');
        dossier = pd.getDossierForGraph(graphId);
    }
    catch { /* no dossier */ }
    // Analyze success/failure factors
    const successFactors = [];
    const failureFactors = [];
    const antiPatterns = [];
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
    const recipeCandidates = [];
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
    const fitUpdates = [];
    // Get current fits for comparison
    let currentFits = [];
    try {
        const pr = require('./provider-registry');
        currentFits = pr.getAllFits();
    }
    catch { /* no fits */ }
    for (const node of [...completedNodes, ...failedNodes]) {
        const provider = agentToProvider(node.assigned_agent);
        const role = agentToRole(node.assigned_agent, node.stage);
        const taskKind = stageToTaskKind(node.stage);
        const succeeded = node.status === 'completed';
        const currentFit = currentFits.find(f => f.provider_id === provider && f.role === role && f.task_kind === taskKind);
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
    const run = {
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
    const runs = readJson(RUNS_FILE, []);
    runs.unshift(run);
    if (runs.length > 100)
        runs.length = 100;
    writeJson(RUNS_FILE, runs);
    // Apply fit updates as experimental evidence
    try {
        const pr = require('./provider-registry');
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
    }
    catch { /* provider registry not loaded */ }
    return run;
}
// Helper to access provider profiles for anti-pattern detection
function getProviderProfile(providerId) {
    try {
        const pr = require('./provider-registry');
        return pr.getProviderProfile(providerId);
    }
    catch {
        return null;
    }
}
// ═══════════════════════════════════════════
// Run Retrieval
// ═══════════════════════════════════════════
function getRunsForGraph(graphId) {
    return readJson(RUNS_FILE, []).filter(r => r.graph_id === graphId);
}
function getAllRuns() {
    return readJson(RUNS_FILE, []);
}
function getRun(runId) {
    return readJson(RUNS_FILE, []).find(r => r.run_id === runId) || null;
}
module.exports = {
    runReversePrompting,
    getRunsForGraph, getAllRuns, getRun,
};
//# sourceMappingURL=reverse-prompting.js.map