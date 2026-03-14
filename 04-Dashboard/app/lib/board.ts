// GPO Board of AI — Full-discipline multi-agent deliberation
// 7-phase lifecycle: interpret → research → critique → synthesize → decide → handoff → review
// 4 agents: OpenAI (Chief), Gemini (Strategist), Perplexity (Research), Claude (Builder/Reviewer)
// Each agent sees privacy-scoped context + curated operator preferences.

import type {
  IntakeTask, BoardVoice, BoardExchange, BoardPhase, BoardDecision,
  Domain, Provider, RiskLevel, AICallResult, CostEntry,
  BoardLifecyclePhase,
} from './types';

const { callOpenAI, callPerplexity, callGemini } = require('./ai') as {
  callOpenAI(sys: string, user: string, opts?: Record<string, unknown>): Promise<AICallResult>;
  callPerplexity(sys: string, user: string, opts?: Record<string, unknown>): Promise<AICallResult>;
  callGemini(sys: string, user: string, opts?: Record<string, unknown>): Promise<AICallResult>;
};
const costs = require('./costs') as { recordCost(e: Partial<CostEntry>): CostEntry };
const contextEngine = require('./context') as { getContextForProvider(d: string, p: string): string | null };
const instanceMod = require('./instance') as {
  isProviderAllowed(p: Provider): boolean;
  isMissionIsolated(d: Domain): boolean;
};
const operatorProfile = require('./operator-profile') as {
  getOperatorContextForAgent(agentId: string): string;
};

// ═══════════════════════════════════════════
// Agent Role Definitions
// ═══════════════════════════════════════════

interface AgentRoleDef {
  provider: Provider;
  agentId: string;
  role: string;
  systemPrompt: string;
}

const ROLES: Record<string, AgentRoleDef> = {
  chief: {
    provider: 'openai', agentId: 'openai-api', role: 'Chief of Staff',
    systemPrompt: `You are the Chief of Staff in a governed private AI board.
- Interpret the task objective precisely
- Assess feasibility, risks, and unknowns
- Identify what needs the operator's decision
- Produce a clear, actionable interpretation
Be direct. No filler. 2-4 sentences.`,
  },
  strategist: {
    provider: 'gemini', agentId: 'gemini-api', role: 'Strategist',
    systemPrompt: `You are the Strategist in a governed private AI board.
- Challenge the Chief's interpretation
- Propose the strongest alternative approach
- Identify non-obvious risks or opportunities
- Recommend a concrete execution path
Be specific. 2-4 sentences.`,
  },
  researcher: {
    provider: 'perplexity', agentId: 'perplexity-api', role: 'Research Analyst',
    systemPrompt: `You are the Research Analyst in a governed private AI board.
- Verify assumptions with current knowledge
- Identify unknowns requiring investigation
- Flag anything outdated or incorrect
- Provide fresh intelligence relevant to the decision
Be factual. 2-4 sentences.`,
  },
  reviewer: {
    provider: 'openai', agentId: 'openai-api', role: 'Technical Reviewer',
    systemPrompt: `You are the Technical Reviewer (acting as implementation expert). After board discussion, evaluate:
- Is the plan technically sound?
- Are there implementation risks missed?
- What should the operator pay attention to during review?
Note: You are an API-based reviewer. Real code execution uses Claude CLI separately.
Be concrete. 2-3 sentences.`,
  },
};

// ═══════════════════════════════════════════
// Full Board Execution — 7-phase lifecycle
// ═══════════════════════════════════════════

/** Run a full-discipline board deliberation */
export async function runBoard(task: IntakeTask): Promise<BoardExchange> {
  const domain = task.domain as Domain;
  const startTime = Date.now();
  const phases: BoardPhase[] = [];
  const allVoices: BoardVoice[] = [];
  let totalCost = 0;
  let totalTokens = 0;

  const taskPrompt = `Task: ${task.raw_request}\nDomain: ${task.domain}\nUrgency: ${task.urgency}\nDesired outcome: ${task.desired_outcome || 'Infer from request'}`;

  // ── Phase 1: INTERPRET ──
  console.log(`[board] Phase 1/7: Interpret`);
  const chiefVoice = await callAgent('chief', domain, taskPrompt, task.task_id);
  pushPhase(phases, 'interpret', chiefVoice, 'Chief of Staff interpretation');
  accum(chiefVoice, allVoices, totalCost, totalTokens);
  if (chiefVoice) { totalCost += chiefVoice.cost; totalTokens += chiefVoice.tokens_used; }

  // ── Phase 2: RESEARCH ──
  console.log(`[board] Phase 2/7: Research`);
  const researchPrompt = `${taskPrompt}\n\nChief of Staff: ${chiefVoice?.response || 'N/A'}\n\nProvide fresh research and verify assumptions.`;
  const researchVoice = await callAgent('researcher', domain, researchPrompt, task.task_id);
  pushPhase(phases, 'research', researchVoice, 'Research findings');
  if (researchVoice) { allVoices.push(researchVoice); totalCost += researchVoice.cost; totalTokens += researchVoice.tokens_used; }

  // ── Phase 3: CRITIQUE ──
  console.log(`[board] Phase 3/7: Critique`);
  const critiquePrompt = `${taskPrompt}\n\nChief: ${chiefVoice?.response || 'N/A'}\nResearch: ${researchVoice?.response || 'N/A'}\n\nChallenge assumptions. Propose the strongest alternative strategy.`;
  const stratVoice = await callAgent('strategist', domain, critiquePrompt, task.task_id);
  pushPhase(phases, 'critique', stratVoice, 'Strategic critique');
  if (stratVoice) { allVoices.push(stratVoice); totalCost += stratVoice.cost; totalTokens += stratVoice.tokens_used; }

  // ── Phase 4: SYNTHESIZE ──
  console.log(`[board] Phase 4/7: Synthesize`);
  const synthPrompt = `Synthesize this board discussion into a final recommendation.

Task: ${task.raw_request}
Domain: ${task.domain}

Chief of Staff: ${chiefVoice?.response || 'N/A'}
Research Analyst: ${researchVoice?.response || 'N/A'}
Strategist: ${stratVoice?.response || 'N/A'}

Produce: (1) Final recommendation (2-3 sentences), (2) Risk level: green/yellow/red, (3) Key decision for operator, (4) Estimated complexity: low/medium/high.`;
  const synthVoice = await callAgent('chief', domain, synthPrompt, task.task_id);
  pushPhase(phases, 'synthesize', synthVoice, 'Board synthesis');
  if (synthVoice) { allVoices.push(synthVoice); totalCost += synthVoice.cost; totalTokens += synthVoice.tokens_used; }

  // ── Phase 5: DECIDE ──
  // Decision is derived from synthesis — no extra API call needed
  const synthText = (synthVoice?.response || '').toLowerCase();
  const riskLevel: RiskLevel = synthText.includes('red') ? 'red' : synthText.includes('yellow') ? 'yellow' : 'green';
  const dissenting = stratVoice && chiefVoice && stratVoice.response !== chiefVoice.response
    ? [stratVoice.response.slice(0, 100)] : [];
  phases.push({
    phase: 'decide' as BoardLifecyclePhase as BoardPhase['phase'],
    voices: [],
    summary: `Risk: ${riskLevel}. ${dissenting.length ? 'Dissent noted.' : 'Board aligned.'}`,
  });

  // ── Phase 6: REVIEW (technical check) ──
  console.log(`[board] Phase 6/7: Review`);
  const reviewPrompt = `Review this board decision before handoff to execution.\n\nSynthesis: ${synthVoice?.response || 'N/A'}\nRisk: ${riskLevel}\n\nAre there implementation risks missed? What should the operator watch for?`;
  const reviewVoice = await callAgent('reviewer', domain, reviewPrompt, task.task_id);
  pushPhase(phases, 'review' as BoardPhase['phase'], reviewVoice, 'Technical review');
  if (reviewVoice) { allVoices.push(reviewVoice); totalCost += reviewVoice.cost; totalTokens += reviewVoice.tokens_used; }

  // ── Phase 7: REPORT ──
  // Report phase is the final packaged output — no API call
  phases.push({
    phase: 'report' as BoardLifecyclePhase as BoardPhase['phase'],
    voices: [],
    summary: `Board complete. ${allVoices.length} agents participated. Cost: $${totalCost.toFixed(4)}. Risk: ${riskLevel}.`,
  });

  const exchange: BoardExchange = {
    task_id: task.task_id, domain, phases,
    synthesis: synthVoice?.response || 'Board discussion incomplete',
    final_recommendation: synthVoice?.response || phases.map(p => p.summary).join(' | '),
    risk_level: riskLevel,
    total_cost: totalCost, total_tokens: totalTokens,
    duration_ms: Date.now() - startTime,
    agents_participated: [...new Set(allVoices.map(v => v.agent_name))],
    timestamp: new Date().toISOString(),
  };

  console.log(`[board] Complete: ${allVoices.length} voices, ${exchange.agents_participated.length} agents, $${totalCost.toFixed(4)}, ${Math.round(exchange.duration_ms / 1000)}s`);
  return exchange;
}

/** Build a BoardDecision from an exchange (for structured consumption) */
export function exchangeToDecision(task: IntakeTask, exchange: BoardExchange): BoardDecision {
  const openQuestions: string[] = [];
  for (const phase of exchange.phases) {
    if (phase.phase === 'research' && phase.summary.includes('unknown')) {
      openQuestions.push(phase.summary.slice(0, 100));
    }
  }

  return {
    task_id: task.task_id,
    domain: task.domain as Domain,
    exchange,
    decision: exchange.final_recommendation,
    risk_level: exchange.risk_level,
    execution_plan_summary: exchange.synthesis,
    approval_required: exchange.risk_level !== 'green',
    estimated_cost: exchange.total_cost * 3, // rough estimate: board cost × 3 for execution
    estimated_duration_minutes: 5 + (exchange.phases.length * 2),
    confidence: exchange.agents_participated.length >= 3 ? 'high' : exchange.agents_participated.length >= 2 ? 'medium' : 'low',
    dissenting_views: [],
    open_questions: openQuestions,
    decided_at: new Date().toISOString(),
  };
}

// ═══════════════════════════════════════════
// Agent Calling — Privacy-scoped + operator context
// ═══════════════════════════════════════════

async function callAgent(
  roleKey: string, domain: Domain, prompt: string, taskId: string
): Promise<BoardVoice | null> {
  const role = ROLES[roleKey];
  if (!role) return null;

  // Privacy checks
  if (!instanceMod.isProviderAllowed(role.provider)) {
    console.log(`[board] Skipping ${role.role}: provider ${role.provider} not allowed`);
    return null;
  }
  if (instanceMod.isMissionIsolated(domain) && role.provider !== 'claude') {
    console.log(`[board] Skipping ${role.role}: mission ${domain} is isolated`);
    return null;
  }

  // Build privacy-scoped context
  let contextBlock = '';
  try {
    const ctx = contextEngine.getContextForProvider(domain, role.provider);
    if (ctx) contextBlock = `\n\nMission Context:\n${ctx}`;
  } catch { /* no context */ }

  // Inject agent-specific operator preferences
  let operatorBlock = '';
  try {
    const opCtx = operatorProfile.getOperatorContextForAgent(role.agentId);
    if (opCtx) operatorBlock = `\n\nOperator Preferences:\n${opCtx}`;
  } catch { /* no profile */ }

  const fullPrompt = prompt + contextBlock + operatorBlock;
  const startTime = Date.now();

  try {
    let result: AICallResult;
    if (role.provider === 'openai') {
      result = await callOpenAI(role.systemPrompt, fullPrompt, { maxTokens: 500 });
    } else if (role.provider === 'gemini') {
      result = await callGemini(role.systemPrompt, fullPrompt, { maxTokens: 500 });
    } else if (role.provider === 'perplexity') {
      result = await callPerplexity(role.systemPrompt, fullPrompt, { maxTokens: 500 });
    } else {
      return null;
    }

    const cost = result.usage.cost || 0;
    costs.recordCost({
      provider: role.provider, model: result.model,
      inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens,
      totalTokens: result.usage.totalTokens, cost,
      taskId, taskType: 'board-voice', role: roleKey,
    });

    return {
      agent_id: role.agentId, agent_name: role.role,
      role: roleKey === 'chief' ? 'orchestrator' : roleKey === 'researcher' ? 'specialist' : 'reasoner',
      provider: role.provider,
      response: result.text, tokens_used: result.usage.totalTokens,
      cost, duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };
  } catch (e: unknown) {
    console.log(`[board] ${role.role} failed: ${(e as Error).message.slice(0, 100)}`);
    return null;
  }
}

// ═══════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════

function pushPhase(phases: BoardPhase[], phase: BoardPhase['phase'], voice: BoardVoice | null, label: string): void {
  phases.push({
    phase,
    voices: voice ? [voice] : [],
    summary: voice?.response || `${label}: no response`,
  });
}

function accum(voice: BoardVoice | null, all: BoardVoice[], _cost: number, _tokens: number): void {
  if (voice) all.push(voice);
}

module.exports = { runBoard, exchangeToDecision };
