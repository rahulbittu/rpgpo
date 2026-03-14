// GPO Multi-Agent Conversation Fabric
// Structured, governed agent-to-agent collaboration.
// Agents exchange intermediate outputs, critique each other, and produce board records.
// Not free chat — typed turns with privacy enforcement.

import type {
  BoardConversation, AgentTurn, CritiqueRecord, FollowupQuestion,
  DissentRecord, SynthesisRecord, Domain, Provider, RiskLevel,
  AICallResult, BoardLifecyclePhase,
} from './types';

const { callOpenAI, callPerplexity, callGemini } = require('./ai') as {
  callOpenAI(sys: string, user: string, opts?: Record<string, unknown>): Promise<AICallResult>;
  callPerplexity(sys: string, user: string, opts?: Record<string, unknown>): Promise<AICallResult>;
  callGemini(sys: string, user: string, opts?: Record<string, unknown>): Promise<AICallResult>;
};
const costs = require('./costs') as { recordCost(e: Record<string, unknown>): unknown };
const instanceMod = require('./instance') as {
  isProviderAllowed(p: Provider): boolean;
  isMissionIsolated(d: Domain): boolean;
};
const contextEngine = require('./context') as { getContextForProvider(d: string, p: string): string | null };
const operatorProfile = require('./operator-profile') as { getOperatorContextForAgent(id: string): string };

function uid(): string { return 'cv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function tid(): string { return 'tn_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// In-memory conversation store (recent conversations)
const conversations: BoardConversation[] = [];

// ═══════════════════════════════════════════
// Conversation Lifecycle
// ═══════════════════════════════════════════

/** Start a new multi-agent conversation */
export function startConversation(taskId: string, domain: Domain): BoardConversation {
  const conv: BoardConversation = {
    id: uid(), task_id: taskId, domain,
    turns: [], critiques: [], followups: [], dissents: [],
    synthesis: null, status: 'active',
    started_at: new Date().toISOString(),
  };
  conversations.unshift(conv);
  if (conversations.length > 20) conversations.length = 20;
  return conv;
}

/** Get a conversation by ID */
export function getConversation(id: string): BoardConversation | null {
  return conversations.find(c => c.id === id) || null;
}

/** Get recent conversations */
export function getRecentConversations(limit: number = 10): BoardConversation[] {
  return conversations.slice(0, limit);
}

// ═══════════════════════════════════════════
// Agent Turns — Structured exchanges
// ═══════════════════════════════════════════

/** Add an agent's turn to a conversation */
export async function addTurn(
  convId: string, agentId: string, agentName: string,
  provider: Provider, phase: BoardLifecyclePhase, prompt: string
): Promise<AgentTurn | null> {
  const conv = getConversation(convId);
  if (!conv || conv.status !== 'active') return null;

  // Privacy check
  if (!instanceMod.isProviderAllowed(provider)) {
    console.log(`[conversations] Skipping ${agentName}: provider ${provider} not allowed`);
    return null;
  }
  if (instanceMod.isMissionIsolated(conv.domain) && provider !== 'claude') {
    console.log(`[conversations] Skipping ${agentName}: mission ${conv.domain} is isolated`);
    return null;
  }

  // Build context
  let inputContext = prompt;
  try {
    const ctx = contextEngine.getContextForProvider(conv.domain, provider);
    if (ctx) inputContext += `\n\nMission Context:\n${ctx}`;
  } catch { /* ignore */ }
  try {
    const opCtx = operatorProfile.getOperatorContextForAgent(agentId);
    if (opCtx) inputContext += `\n\nOperator Preferences:\n${opCtx}`;
  } catch { /* ignore */ }

  // Include previous turns as context
  if (conv.turns.length > 0) {
    const prevSummary = conv.turns.slice(-3).map(t => `${t.agent_name}: ${t.response.slice(0, 200)}`).join('\n');
    inputContext += `\n\nPrevious discussion:\n${prevSummary}`;
  }

  const sysPrompt = `You are ${agentName} in a governed private AI board. Phase: ${phase}. Be concise and specific. 2-4 sentences.`;
  const startTime = Date.now();

  try {
    let result: AICallResult;
    if (provider === 'openai') result = await callOpenAI(sysPrompt, inputContext, { maxTokens: 400 });
    else if (provider === 'gemini') result = await callGemini(sysPrompt, inputContext, { maxTokens: 400 });
    else if (provider === 'perplexity') result = await callPerplexity(sysPrompt, inputContext, { maxTokens: 400 });
    else return null;

    const cost = result.usage.cost || 0;
    costs.recordCost({
      provider, model: result.model,
      inputTokens: result.usage.inputTokens, outputTokens: result.usage.outputTokens,
      totalTokens: result.usage.totalTokens, cost,
      taskId: conv.task_id, taskType: 'conversation-turn', role: phase,
    });

    const turn: AgentTurn = {
      turn_id: tid(), agent_id: agentId, agent_name: agentName,
      provider, phase, input_context: prompt.slice(0, 500),
      response: result.text, tokens_used: result.usage.totalTokens,
      cost, duration_ms: Date.now() - startTime,
      timestamp: new Date().toISOString(),
    };

    conv.turns.push(turn);
    return turn;
  } catch (e: unknown) {
    console.log(`[conversations] Turn failed for ${agentName}: ${(e as Error).message.slice(0, 80)}`);
    return null;
  }
}

// ═══════════════════════════════════════════
// Critique & Dissent
// ═══════════════════════════════════════════

/** Add a critique of one agent's output by another */
export function addCritique(
  convId: string, fromAgent: string, aboutAgent: string,
  aboutTurn: string, critique: string, severity: CritiqueRecord['severity']
): void {
  const conv = getConversation(convId);
  if (!conv) return;
  conv.critiques.push({
    from_agent: fromAgent, about_agent: aboutAgent,
    about_turn: aboutTurn, critique, severity,
    timestamp: new Date().toISOString(),
  });
}

/** Record a dissenting view */
export function addDissent(
  convId: string, agentId: string, agentName: string,
  dissent: string, alternative: string
): void {
  const conv = getConversation(convId);
  if (!conv) return;
  conv.dissents.push({
    agent_id: agentId, agent_name: agentName,
    dissent, alternative, resolved: false,
    timestamp: new Date().toISOString(),
  });
}

/** Add a follow-up question */
export function addFollowup(
  convId: string, raisedBy: string, question: string,
  directedTo: string
): void {
  const conv = getConversation(convId);
  if (!conv) return;
  conv.followups.push({
    raised_by: raisedBy, question, directed_to: directedTo,
    answered: false, timestamp: new Date().toISOString(),
  });
}

// ═══════════════════════════════════════════
// Synthesis
// ═══════════════════════════════════════════

/** Synthesize a conversation into a final record */
export function synthesize(
  convId: string, synthesizedBy: string, recommendation: string,
  riskLevel: RiskLevel, confidence: SynthesisRecord['confidence']
): SynthesisRecord | null {
  const conv = getConversation(convId);
  if (!conv) return null;

  const synthesis: SynthesisRecord = {
    synthesized_by: synthesizedBy,
    recommendation, risk_level: riskLevel, confidence,
    incorporates: conv.turns.map(t => t.agent_name),
    unresolved: [
      ...conv.dissents.filter(d => !d.resolved).map(d => d.dissent),
      ...conv.followups.filter(f => !f.answered).map(f => f.question),
    ],
    timestamp: new Date().toISOString(),
  };

  conv.synthesis = synthesis;
  conv.status = 'synthesized';
  conv.completed_at = new Date().toISOString();

  return synthesis;
}

/** Run a full governed conversation — all 4 agents in sequence */
export async function runFullConversation(
  taskId: string, domain: Domain, taskPrompt: string
): Promise<BoardConversation> {
  const conv = startConversation(taskId, domain);

  // Phase 1: Chief interprets
  await addTurn(conv.id, 'openai-api', 'Chief of Staff', 'openai', 'interpret', taskPrompt);

  // Phase 2: Perplexity researches
  const chiefResponse = conv.turns[0]?.response || '';
  await addTurn(conv.id, 'perplexity-api', 'Research Analyst', 'perplexity', 'research',
    `${taskPrompt}\n\nChief's interpretation: ${chiefResponse}\n\nVerify and add fresh intelligence.`);

  // Phase 3: Gemini critiques
  const researchResponse = conv.turns[1]?.response || '';
  await addTurn(conv.id, 'gemini-api', 'Strategist', 'gemini', 'critique',
    `${taskPrompt}\n\nChief: ${chiefResponse}\nResearch: ${researchResponse}\n\nChallenge and propose alternatives.`);

  // Phase 4: Claude reviews technical feasibility
  // Claude CLI is the real Claude agent but is reserved for code execution.
  // For board discussion, we attempt real Claude CLI with a read-only prompt.
  // If unavailable, we honestly label it as a proxy.
  const stratResponse = conv.turns[2]?.response || '';
  const claudeReviewPrompt = `${taskPrompt}\n\nYou are reviewing as a technical implementation expert.\nChief: ${chiefResponse}\nResearch: ${researchResponse}\nStrategist: ${stratResponse}\n\nAssess technical feasibility and implementation risks. 2-3 sentences.`;

  let claudeParticipation: 'real_cli' | 'api_proxy' | 'skipped' = 'skipped';
  let claudeAvailable = false;

  // Try real Claude CLI first (read-only board participation, no file writes)
  try {
    const { execSync } = require('child_process') as typeof import('child_process');
    // Check if Claude CLI responds
    const testOut = execSync('claude --version 2>/dev/null || echo "unavailable"', { timeout: 3000, encoding: 'utf-8' });
    claudeAvailable = !testOut.includes('unavailable');
  } catch { claudeAvailable = false; }

  if (claudeAvailable) {
    // Real Claude CLI participation — read-only, no --dangerously-skip-permissions
    try {
      const { execSync } = require('child_process') as typeof import('child_process');
      const builderEnv = { ...process.env };
      Object.keys(builderEnv).filter(k => k.startsWith('CLAUDE')).forEach(k => delete builderEnv[k]);

      const claudeOut = execSync(
        `claude -p "${claudeReviewPrompt.replace(/"/g, '\\"').slice(0, 2000)}"`,
        { cwd: process.cwd(), timeout: 30000, encoding: 'utf-8', env: builderEnv }
      );
      if (claudeOut && claudeOut.trim().length > 10) {
        const turn: AgentTurn = {
          turn_id: tid(), agent_id: 'claude-local', agent_name: 'Claude (Technical Reviewer)',
          provider: 'claude', phase: 'review', input_context: claudeReviewPrompt.slice(0, 500),
          response: claudeOut.trim(), tokens_used: 0, cost: 0,
          duration_ms: 0, timestamp: new Date().toISOString(),
        };
        conv.turns.push(turn);
        claudeParticipation = 'real_cli';
        console.log(`[conversations] Claude participated via real CLI (${claudeOut.trim().length} chars)`);
      }
    } catch (e: unknown) {
      console.log(`[conversations] Real Claude CLI failed: ${(e as Error).message.slice(0, 80)}`);
      claudeAvailable = false;
    }
  }

  // Fallback: use OpenAI as honest proxy (clearly labeled)
  if (claudeParticipation === 'skipped' && instanceMod.isProviderAllowed('openai')) {
    await addTurn(conv.id, 'openai-as-reviewer', 'Technical Reviewer (proxy — Claude CLI unavailable)', 'openai', 'review',
      claudeReviewPrompt);
    claudeParticipation = 'api_proxy';
    console.log(`[conversations] Claude board participation: API proxy via OpenAI (Claude CLI not available)`);
  }

  // Record Claude participation metadata on the conversation
  (conv as unknown as Record<string, unknown>).claude_participation = {
    participation: claudeParticipation,
    reason: claudeParticipation === 'real_cli' ? 'Claude CLI responded'
      : claudeParticipation === 'api_proxy' ? 'Claude CLI unavailable — OpenAI proxy used (honestly labeled)'
      : 'Both Claude CLI and OpenAI proxy unavailable',
    cli_available: claudeAvailable,
    proxy_used: claudeParticipation === 'api_proxy',
    proxy_provider: claudeParticipation === 'api_proxy' ? 'openai' : undefined,
  };

  // Phase 5: Chief synthesizes
  const allResponses = conv.turns.map(t => `${t.agent_name}: ${t.response}`).join('\n\n');
  await addTurn(conv.id, 'openai-api', 'Chief of Staff', 'openai', 'synthesize',
    `Synthesize this board discussion.\n\n${allResponses}\n\nProduce: (1) Final recommendation, (2) Risk: green/yellow/red, (3) Key decision for operator, (4) Confidence: low/medium/high.`);

  // Extract risk level from synthesis
  const synthResponse = conv.turns[conv.turns.length - 1]?.response || '';
  const riskText = synthResponse.toLowerCase();
  const risk: RiskLevel = riskText.includes('red') ? 'red' : riskText.includes('yellow') ? 'yellow' : 'green';
  const confidence = conv.turns.length >= 4 ? 'high' : conv.turns.length >= 3 ? 'medium' : 'low';

  // Check for dissent
  if (conv.turns.length >= 3) {
    const chiefView = conv.turns[0]?.response || '';
    const stratView = conv.turns[2]?.response || '';
    if (chiefView.length > 20 && stratView.length > 20) {
      // Simple dissent detection — if strategist explicitly disagrees
      if (stratView.toLowerCase().includes('disagree') || stratView.toLowerCase().includes('however') || stratView.toLowerCase().includes('instead')) {
        addDissent(conv.id, 'gemini-api', 'Strategist', stratView.slice(0, 150), 'See strategist response for alternative');
      }
    }
  }

  synthesize(conv.id, 'Chief of Staff', synthResponse, risk, confidence as SynthesisRecord['confidence']);

  console.log(`[conversations] Full conversation complete: ${conv.turns.length} turns, ${conv.dissents.length} dissents`);
  return conv;
}

module.exports = {
  startConversation, getConversation, getRecentConversations,
  addTurn, addCritique, addDissent, addFollowup, synthesize,
  runFullConversation,
};
