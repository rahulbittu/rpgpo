// GPO Board-First Task Inception
// Every meaningful task enters through a governed board gate.
// The board sees operator context, learned behavior, mission state, constraints.
// It decides how to create maximum value before execution proceeds.

import type {
  IntakeTask, TaskInception, InceptionContext, InceptionRecommendation,
  InceptionRoutingDecision, InceptionCapabilityMatch, InceptionValueSummary,
  InceptionRisk, InceptionRoute, Domain, Provider,
} from './types';

// ═══════════════════════════════════════════
// Context Fusion — compact, structured, not a memory dump
// ═══════════════════════════════════════════

/** Build the fused inception context for a task — uses layered context system */
export function buildInceptionContext(task: IntakeTask): InceptionContext {
  const domain = task.domain as Domain;
  const projectId = (task as IntakeTask & { project_id?: string }).project_id;

  // Use the layered context system for structured fusion
  const layered = require('./layered-context') as {
    buildLayeredContext(d: Domain, pid?: string): import('./types').LayeredContext;
  };
  const lc = layered.buildLayeredContext(domain, projectId);

  return {
    operator_summary: lc.operator.summary,
    mission_summary: lc.project?.context_summary || lc.engine.context_summary || `Engine: ${lc.engine.display_name}`,
    recent_decisions: lc.project?.recent_decisions || lc.engine.cross_project_decisions,
    open_questions: lc.project?.open_questions || [],
    active_constraints: lc.project?.constraints || [],
    current_blockers: lc.recent.blockers,
    agent_availability: lc.recent.agent_availability,
    budget_status: lc.recent.budget_status,
    privacy_restrictions: lc.recent.privacy_restrictions,
  };
}

// ═══════════════════════════════════════════
// Inception Routing — local, no API call needed
// ═══════════════════════════════════════════

/** Determine the best route for a task based on content and context */
export function determineRoute(task: IntakeTask, context: InceptionContext): InceptionRoutingDecision {
  const text = (task.raw_request || '').toLowerCase();
  const domain = task.domain;

  // Check for blocks first
  if (context.privacy_restrictions.some(r => r.includes('Local-only') || r.includes('isolated'))) {
    const hasLocalAgent = context.agent_availability.some(a => a.agent.includes('Claude') && a.available);
    if (!hasLocalAgent) {
      return {
        route: 'blocked', reason: 'Privacy restrictions prevent execution and local agent unavailable',
        agents_recommended: [], stages_recommended: [],
        auto_deliberate: false, requires_operator_input: true,
      };
    }
  }

  // Code/build tasks → builder-heavy
  const codeKeywords = ['implement', 'build', 'code', 'fix bug', 'add feature', 'refactor', 'optimize', 'performance', 'startup', 'component', 'endpoint', 'api', 'migration', 'schema'];
  if (codeKeywords.some(k => text.includes(k))) {
    return {
      route: 'builder_heavy',
      reason: 'Task involves code changes — requires repo grounding and builder execution',
      agents_recommended: ['Claude (Builder)', 'OpenAI (Chief of Staff)'],
      stages_recommended: ['audit', 'locate_files', 'implement', 'report'],
      auto_deliberate: true,
      requires_operator_input: false,
    };
  }

  // Research tasks
  const researchKeywords = ['research', 'investigate', 'analyze', 'compare', 'evaluate', 'assess', 'study', 'explore'];
  if (researchKeywords.some(k => text.includes(k))) {
    return {
      route: 'research_heavy',
      reason: 'Task requires research and analysis across multiple sources',
      agents_recommended: ['Perplexity (Research)', 'OpenAI (Chief)', 'Gemini (Strategist)'],
      stages_recommended: ['research', 'audit', 'strategy', 'report'],
      auto_deliberate: true,
      requires_operator_input: false,
    };
  }

  // Review/audit tasks
  const reviewKeywords = ['review', 'audit', 'check', 'verify', 'inspect', 'report', 'summary', 'status'];
  if (reviewKeywords.some(k => text.includes(k))) {
    return {
      route: 'review_report',
      reason: 'Task is a review or report generation request',
      agents_recommended: ['OpenAI (Chief of Staff)'],
      stages_recommended: ['audit', 'report'],
      auto_deliberate: true,
      requires_operator_input: false,
    };
  }

  // Strategy/planning tasks → full board deliberation
  const strategyKeywords = ['strategy', 'plan', 'decide', 'prioritize', 'roadmap', 'vision', 'approach'];
  if (strategyKeywords.some(k => text.includes(k))) {
    return {
      route: 'board_deliberation',
      reason: 'Task requires strategic deliberation across multiple perspectives',
      agents_recommended: ['OpenAI (Chief)', 'Gemini (Strategist)', 'Perplexity (Research)'],
      stages_recommended: ['research', 'strategy', 'decide', 'report'],
      auto_deliberate: true,
      requires_operator_input: false,
    };
  }

  // Short/simple requests → direct answer may suffice
  if (text.length < 80 && !text.includes('\n')) {
    return {
      route: 'direct_answer',
      reason: 'Short request — may be answerable without full deliberation',
      agents_recommended: ['OpenAI (Chief of Staff)'],
      stages_recommended: ['audit'],
      auto_deliberate: false,
      requires_operator_input: false,
    };
  }

  // Default → board deliberation
  return {
    route: 'board_deliberation',
    reason: 'General task — full board deliberation recommended',
    agents_recommended: ['OpenAI (Chief)', 'Gemini (Strategist)', 'Perplexity (Research)'],
    stages_recommended: ['audit', 'decide', 'implement', 'report'],
    auto_deliberate: true,
    requires_operator_input: false,
  };
}

// ═══════════════════════════════════════════
// Capability Matching
// ═══════════════════════════════════════════

/** Match task to available capabilities */
export function matchCapabilities(task: IntakeTask, routing: InceptionRoutingDecision): InceptionCapabilityMatch[] {
  const matches: InceptionCapabilityMatch[] = [];

  try {
    const caps = require('./capabilities') as { getAllCapabilities(): Array<{ id: string; name: string; handles_stages: string[] }> };
    const inst = require('./instance') as { isCapabilityEnabled(id: string): boolean };

    for (const cap of caps.getAllCapabilities()) {
      const stageOverlap = cap.handles_stages.some(s => routing.stages_recommended.includes(s));
      if (!stageOverlap && cap.handles_stages.length > 0) continue; // skip irrelevant

      const enabled = inst.isCapabilityEnabled(cap.id);
      matches.push({
        capability_id: cap.id,
        capability_name: cap.name,
        relevance: stageOverlap ? 'primary' : 'supporting',
        available: enabled,
        reason: !enabled ? 'Disabled in instance settings' : undefined,
      });
    }
  } catch { /* ignore */ }

  return matches;
}

// ═══════════════════════════════════════════
// Value Derivation — operator-aware
// ═══════════════════════════════════════════

/** Determine what "high value" means for this task+operator */
export function deriveValue(task: IntakeTask, context: InceptionContext, routing: InceptionRoutingDecision): InceptionValueSummary {
  const operatorParts = context.operator_summary.split('|').map(s => s.trim());
  const commStyle = operatorParts.find(p => p.includes('communication'))?.includes('terse') ? 'terse' : 'detailed';
  const detailPref = operatorParts.find(p => p.includes('Detail'))?.split(':')[1]?.trim() || 'standard';

  const isCode = routing.route === 'builder_heavy';
  const isResearch = routing.route === 'research_heavy';

  const highValue = isCode
    ? 'Working code changes applied to the correct files with clear diff summary'
    : isResearch
      ? 'Actionable findings with specific recommendations backed by current data'
      : 'Clear, structured answer with concrete next steps';

  const lowValue = isCode
    ? 'Vague analysis without actual code changes or wrong file targets'
    : isResearch
      ? 'Generic summary without specific findings or actionable recommendations'
      : 'Verbose explanation without clear next steps or concrete output';

  const preference = commStyle === 'terse'
    ? 'Operator prefers concise output — lead with the answer, not the reasoning'
    : 'Operator prefers detailed analysis — include reasoning and tradeoffs';

  const tradeoffs: string[] = [];
  if (isCode) tradeoffs.push('Speed vs thoroughness — operator may prefer quick fix over full audit');
  if (context.current_blockers.length > 0) tradeoffs.push(`${context.current_blockers.length} existing blocker(s) may need resolution first`);
  if (context.active_constraints.length > 0) tradeoffs.push(`Active constraints: ${context.active_constraints[0]}`);

  return { high_value_answer: highValue, low_value_answer: lowValue, operator_preference: preference, key_tradeoffs: tradeoffs };
}

// ═══════════════════════════════════════════
// Risk Assessment
// ═══════════════════════════════════════════

/** Identify inception-level risks */
export function assessRisks(task: IntakeTask, context: InceptionContext, routing: InceptionRoutingDecision): InceptionRisk[] {
  const risks: InceptionRisk[] = [];

  if (context.privacy_restrictions.length > 0) {
    risks.push({
      type: 'privacy', description: context.privacy_restrictions[0],
      severity: 'medium', mitigation: 'Use local-only agents or adjust privacy policy',
    });
  }

  if (context.current_blockers.length > 0) {
    risks.push({
      type: 'dependency', description: `${context.current_blockers.length} active blocker(s) may interfere`,
      severity: 'medium', mitigation: 'Resolve blockers before starting or proceed in parallel',
    });
  }

  if (routing.route === 'builder_heavy') {
    risks.push({
      type: 'technical', description: 'Code changes require repo grounding and review',
      severity: 'low', mitigation: 'Builder will stop for code review before committing',
    });
  }

  if (context.budget_status.includes('limit')) {
    risks.push({
      type: 'budget', description: 'Budget limit is active — may restrict multi-agent deliberation',
      severity: 'low', mitigation: 'Monitor cost during execution',
    });
  }

  return risks;
}

// ═══════════════════════════════════════════
// Full Inception — the board-first gate
// ═══════════════════════════════════════════

/** Run full board-first inception for a task */
export function runInception(task: IntakeTask): TaskInception {
  const context = buildInceptionContext(task);
  const routing = determineRoute(task, context);
  const capabilities = matchCapabilities(task, routing);
  const value = deriveValue(task, context, routing);
  const risks = assessRisks(task, context, routing);

  // Build recommendation
  const recommendation: InceptionRecommendation = {
    interpretation: `Task "${task.title}" in ${task.domain} domain — ${routing.reason}`,
    recommended_path: routing.route,
    reasoning: routing.reason,
    expected_value: value.high_value_answer,
    preferred_output_shape: routing.route === 'builder_heavy' ? 'code changes + diff summary'
      : routing.route === 'research_heavy' ? 'structured findings + recommendations'
      : routing.route === 'review_report' ? 'structured report'
      : 'concise answer with next steps',
    detail_level: (context.operator_summary.includes('terse') ? 'minimal' : 'standard') as InceptionRecommendation['detail_level'],
    confidence: capabilities.filter(c => c.available && c.relevance === 'primary').length >= 2 ? 'high'
      : capabilities.filter(c => c.available).length >= 1 ? 'medium' : 'low',
  };

  const inception: TaskInception = {
    task_id: task.task_id,
    domain: task.domain as Domain,
    inception_context: context,
    recommendation,
    routing,
    capability_match: capabilities,
    value_summary: value,
    risks,
    created_at: new Date().toISOString(),
  };

  console.log(`[inception] Task ${task.task_id}: route=${routing.route}, confidence=${recommendation.confidence}, risks=${risks.length}`);
  return inception;
}

module.exports = {
  buildInceptionContext, determineRoute, matchCapabilities,
  deriveValue, assessRisks, runInception,
};
