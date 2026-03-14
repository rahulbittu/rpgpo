// GPO Layered Context — Explicit 3-tier context fusion
// Order: operator → engine → project → recent blockers/budget/privacy
// Produces structured and compact context for board/inception/deliberation.

import type {
  Domain, LayeredContext, LayeredContextBlock, IntakeTask,
} from './types';

// ═══════════════════════════════════════════
// Layer 1: Operator Context (broad, cross-engine)
// ═══════════════════════════════════════════

function buildOperatorLayer(): LayeredContext['operator'] {
  try {
    const profile = require('./operator-profile') as {
      getProfile(): {
        name: string; decision_style: string; communication_style: string;
        risk_tolerance: string; recurring_priorities: string[];
        detail_preference: string; correction_patterns: string[];
      };
    };
    const p = profile.getProfile();
    return {
      summary: `${p.name} | ${p.decision_style} decisions, ${p.communication_style} comms, risk: ${p.risk_tolerance}`,
      decision_style: p.decision_style,
      communication_style: p.communication_style,
      risk_tolerance: p.risk_tolerance,
      priorities: p.recurring_priorities.slice(0, 5),
      detail_preference: p.detail_preference || 'standard',
      correction_patterns: (p.correction_patterns || []).slice(0, 3),
    };
  } catch {
    return {
      summary: 'Operator', decision_style: 'balanced', communication_style: 'balanced',
      risk_tolerance: 'yellow', priorities: [], detail_preference: 'standard', correction_patterns: [],
    };
  }
}

// ═══════════════════════════════════════════
// Layer 2: Engine Context (broad domain memory)
// ═══════════════════════════════════════════

function buildEngineLayer(domain: Domain): LayeredContext['engine'] {
  try {
    const engines = require('./engines') as {
      getEngine(d: Domain): { display_name: string; description: string } | undefined;
      getEngineContext(d: Domain): {
        long_term_objective: string; recurring_themes: string[];
        cross_project_decisions: Array<{ decision: string }>; context_summary: string;
      };
    };

    const engine = engines.getEngine(domain);
    const ctx = engines.getEngineContext(domain);

    return {
      domain,
      display_name: engine?.display_name || domain,
      long_term_objective: ctx.long_term_objective || engine?.description || '',
      recurring_themes: ctx.recurring_themes.slice(0, 5),
      cross_project_decisions: ctx.cross_project_decisions.slice(0, 3).map(d => d.decision),
      context_summary: ctx.context_summary || '',
    };
  } catch {
    return {
      domain, display_name: domain, long_term_objective: '', recurring_themes: [],
      cross_project_decisions: [], context_summary: '',
    };
  }
}

// ═══════════════════════════════════════════
// Layer 3: Project Context (sharp working memory)
// ═══════════════════════════════════════════

function buildProjectLayer(domain: Domain, projectId?: string): LayeredContext['project'] {
  if (!projectId) {
    // Try to get default project
    try {
      const projects = require('./projects') as { getDefaultProject(d: Domain): { project_id: string } | null };
      const def = projects.getDefaultProject(domain);
      if (def) projectId = def.project_id;
    } catch { /* ignore */ }
  }

  if (!projectId) return null;

  try {
    const projects = require('./projects') as {
      getProjectContext(id: string): {
        project_id: string; objective: string; context_summary: string;
        recent_decisions: Array<{ title: string }>; open_questions: Array<{ question: string; resolved_at?: string }>;
        constraints: Array<{ constraint: string; active: boolean }>; known_issues: string[]; next_actions: string[];
      } | null;
      getProject(id: string): { project_name: string } | null;
    };

    const ctx = projects.getProjectContext(projectId);
    const project = projects.getProject(projectId);
    if (!ctx) return null;

    return {
      project_id: ctx.project_id,
      project_name: project?.project_name || ctx.project_id,
      objective: ctx.objective,
      recent_decisions: ctx.recent_decisions.slice(0, 5).map(d => d.title),
      open_questions: ctx.open_questions.filter(q => !q.resolved_at).slice(0, 3).map(q => q.question),
      constraints: ctx.constraints.filter(c => c.active).slice(0, 3).map(c => c.constraint),
      known_issues: ctx.known_issues.slice(0, 3),
      next_actions: ctx.next_actions.slice(0, 3),
      context_summary: ctx.context_summary || ctx.objective,
    };
  } catch {
    return null;
  }
}

// ═══════════════════════════════════════════
// Layer 4: Recent/Situational Context
// ═══════════════════════════════════════════

function buildRecentLayer(domain: Domain): LayeredContext['recent'] {
  let blockers: string[] = [];
  try {
    const autonomy = require('./autonomy') as { getAllBlockers(): Array<{ title: string; domain: Domain }> };
    blockers = autonomy.getAllBlockers().filter(b => b.domain === domain || !b.domain).slice(0, 3).map(b => b.title);
  } catch { /* ignore */ }

  let budgetStatus = 'OK';
  try {
    const costs = require('./costs') as { getSummary(): { today: { cost: number } }; getSettings(): { geminibudgetLimit: number | null } };
    const s = costs.getSummary();
    const settings = costs.getSettings();
    budgetStatus = `Today: $${s.today.cost.toFixed(2)}${settings.geminibudgetLimit ? ' / $' + settings.geminibudgetLimit.toFixed(2) + ' limit' : ''}`;
  } catch { /* ignore */ }

  let privacyRestrictions: string[] = [];
  try {
    const inst = require('./instance') as { getInstance(): { policy: { local_only: boolean; mission_isolation: Domain[]; allowed_providers: string[] } } };
    const p = inst.getInstance().policy;
    if (p.local_only) privacyRestrictions.push('Local-only mode');
    if (p.mission_isolation.includes(domain)) privacyRestrictions.push(`Mission "${domain}" isolated`);
  } catch { /* ignore */ }

  let agentAvailability: Array<{ agent: string; available: boolean }> = [];
  try {
    const agents = require('./agents') as { getAllAgents(): Array<{ name: string; status: string }> };
    agentAvailability = agents.getAllAgents().map(a => ({ agent: a.name, available: a.status === 'available' }));
  } catch { /* ignore */ }

  return { blockers, budget_status: budgetStatus, privacy_restrictions: privacyRestrictions, agent_availability: agentAvailability };
}

// ═══════════════════════════════════════════
// Full Layered Context Assembly
// ═══════════════════════════════════════════

/** Build the full 3-tier layered context */
export function buildLayeredContext(domain: Domain, projectId?: string): LayeredContext {
  return {
    operator: buildOperatorLayer(),
    engine: buildEngineLayer(domain),
    project: buildProjectLayer(domain, projectId),
    recent: buildRecentLayer(domain),
  };
}

/** Build a compact prompt-injection block from layered context */
export function buildLayeredContextBlock(domain: Domain, projectId?: string): LayeredContextBlock {
  const ctx = buildLayeredContext(domain, projectId);

  const operatorBlock = `Operator: ${ctx.operator.summary}` +
    (ctx.operator.priorities.length ? `\nPriorities: ${ctx.operator.priorities.join(', ')}` : '') +
    (ctx.operator.correction_patterns.length ? `\nCorrection patterns: ${ctx.operator.correction_patterns.join('; ')}` : '');

  const engineBlock = `Engine: ${ctx.engine.display_name}` +
    (ctx.engine.long_term_objective ? `\nObjective: ${ctx.engine.long_term_objective.slice(0, 100)}` : '') +
    (ctx.engine.recurring_themes.length ? `\nThemes: ${ctx.engine.recurring_themes.join(', ')}` : '') +
    (ctx.engine.cross_project_decisions.length ? `\nPrior decisions: ${ctx.engine.cross_project_decisions.join('; ')}` : '');

  let projectBlock = '';
  if (ctx.project) {
    projectBlock = `Project: ${ctx.project.project_name}` +
      (ctx.project.objective ? `\nObjective: ${ctx.project.objective}` : '') +
      (ctx.project.recent_decisions.length ? `\nDecisions: ${ctx.project.recent_decisions.join('; ')}` : '') +
      (ctx.project.open_questions.length ? `\nOpen questions: ${ctx.project.open_questions.join('; ')}` : '') +
      (ctx.project.constraints.length ? `\nConstraints: ${ctx.project.constraints.join('; ')}` : '') +
      (ctx.project.known_issues.length ? `\nKnown issues: ${ctx.project.known_issues.join('; ')}` : '');
  }

  let recentBlock = '';
  if (ctx.recent.blockers.length) recentBlock += `Blockers: ${ctx.recent.blockers.join('; ')}\n`;
  recentBlock += `Budget: ${ctx.recent.budget_status}`;
  if (ctx.recent.privacy_restrictions.length) recentBlock += `\nPrivacy: ${ctx.recent.privacy_restrictions.join('; ')}`;

  const combined = [operatorBlock, engineBlock, projectBlock, recentBlock].filter(Boolean).join('\n\n');

  return { operator_block: operatorBlock, engine_block: engineBlock, project_block: projectBlock, recent_block: recentBlock, combined };
}

/** Get layered context for provider injection — privacy-scoped */
export function getLayeredContextForProvider(domain: Domain, provider: string, projectId?: string): string | null {
  try {
    const privacyMod = require('./privacy') as {
      canSendToProvider(p: string, d: Domain, pol: import('./types').PrivacyPolicy): boolean;
      redact(text: string, pol: import('./types').PrivacyPolicy): string;
    };
    const instanceMod = require('./instance') as { getPrivacyPolicy(): import('./types').PrivacyPolicy };
    const policy = instanceMod.getPrivacyPolicy();

    if (!privacyMod.canSendToProvider(provider, domain, policy)) return null;

    const block = buildLayeredContextBlock(domain, projectId);
    return privacyMod.redact(block.combined, policy);
  } catch {
    return buildLayeredContextBlock(domain, projectId).combined;
  }
}

module.exports = {
  buildLayeredContext, buildLayeredContextBlock, getLayeredContextForProvider,
};
