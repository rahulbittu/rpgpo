// GPO Agent Interoperability — Governed multi-agent foundation
// Manages agent definitions, handoff contracts, and privacy-scoped execution.
// Future: Claude, ChatGPT, and external services participate through here.

import type {
  AgentDefinition, AgentRole, AgentExecutionBoundary, AgentPrivacyScope,
  AgentInteropStatus, AgentHandoffRequest, AgentHandoffResult,
  Domain, Provider, SubtaskStage, ContextSnapshot,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const AGENTS_FILE = path.resolve(__dirname, '..', '..', 'state', 'agents.json');

function uid(): string { return 'agt_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
function hid(): string { return 'hnd_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }

// ═══════════════════════════════════════════
// Agent Registry
// ═══════════════════════════════════════════

function readAgents(): AgentDefinition[] {
  try {
    if (!fs.existsSync(AGENTS_FILE)) return [];
    return JSON.parse(fs.readFileSync(AGENTS_FILE, 'utf-8'));
  } catch { return []; }
}

function writeAgents(agents: AgentDefinition[]): void {
  const dir = path.dirname(AGENTS_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(AGENTS_FILE, JSON.stringify(agents, null, 2));
}

/** Register the built-in agents (Claude, OpenAI, etc.) */
function ensureBuiltins(): void {
  const agents = readAgents();
  const builtinIds = new Set(agents.map(a => a.agent_id));

  const builtins: AgentDefinition[] = [
    {
      agent_id: 'claude-local', name: 'Claude (Local Builder)', provider: 'claude',
      role: 'executor', capabilities: ['coding', 'repo-grounding', 'builder-execution'],
      execution_boundary: {
        can_read_files: true, can_write_files: true, can_execute_code: true,
        can_access_network: false, can_access_context: true,
        max_runtime_ms: 600000, allowed_stages: ['implement', 'build', 'code', 'locate_files'],
        requires_approval: true,
      },
      privacy_scope: {
        scope: 'instance', allowed_missions: [],
        can_see_operator_profile: false, can_see_decisions: true,
        can_see_artifacts: true, redact_before_send: false,
      },
      status: 'available', created_at: new Date().toISOString(),
    },
    {
      agent_id: 'openai-api', name: 'OpenAI (API)', provider: 'openai',
      role: 'reasoner', capabilities: ['research', 'deliberation', 'report-generation'],
      execution_boundary: {
        can_read_files: false, can_write_files: false, can_execute_code: false,
        can_access_network: true, can_access_context: true,
        max_runtime_ms: 60000, allowed_stages: ['audit', 'research', 'decide', 'strategy', 'report', 'locate_files'],
        requires_approval: false,
      },
      privacy_scope: {
        scope: 'task', allowed_missions: [],
        can_see_operator_profile: true, can_see_decisions: true,
        can_see_artifacts: false, redact_before_send: true,
      },
      status: 'available', created_at: new Date().toISOString(),
    },
    {
      agent_id: 'gemini-api', name: 'Gemini (API)', provider: 'gemini',
      role: 'specialist', capabilities: ['research', 'deliberation'],
      execution_boundary: {
        can_read_files: false, can_write_files: false, can_execute_code: false,
        can_access_network: true, can_access_context: true,
        max_runtime_ms: 60000, allowed_stages: ['audit', 'research', 'strategy', 'report'],
        requires_approval: false,
      },
      privacy_scope: {
        scope: 'task', allowed_missions: [],
        can_see_operator_profile: false, can_see_decisions: false,
        can_see_artifacts: false, redact_before_send: true,
      },
      status: 'available', created_at: new Date().toISOString(),
    },
    {
      agent_id: 'perplexity-api', name: 'Perplexity (API)', provider: 'perplexity',
      role: 'specialist', capabilities: ['research'],
      execution_boundary: {
        can_read_files: false, can_write_files: false, can_execute_code: false,
        can_access_network: true, can_access_context: false,
        max_runtime_ms: 60000, allowed_stages: ['research'],
        requires_approval: false,
      },
      privacy_scope: {
        scope: 'task', allowed_missions: [],
        can_see_operator_profile: false, can_see_decisions: false,
        can_see_artifacts: false, redact_before_send: true,
      },
      status: 'available', created_at: new Date().toISOString(),
    },
  ];

  let changed = false;
  for (const b of builtins) {
    if (!builtinIds.has(b.agent_id)) {
      agents.push(b);
      changed = true;
    }
  }
  if (changed) writeAgents(agents);
}

// Initialize builtins on load
ensureBuiltins();

/** Get all registered agents */
export function getAllAgents(): AgentDefinition[] {
  return readAgents();
}

/** Get an agent by ID */
export function getAgent(agentId: string): AgentDefinition | null {
  return readAgents().find(a => a.agent_id === agentId) || null;
}

/** Register a new external agent */
export function registerAgent(def: Omit<AgentDefinition, 'agent_id' | 'created_at'>): AgentDefinition {
  const agents = readAgents();
  const agent: AgentDefinition = { ...def, agent_id: uid(), created_at: new Date().toISOString() };
  agents.push(agent);
  writeAgents(agents);
  return agent;
}

/** Update an agent's status */
export function updateAgentStatus(agentId: string, status: AgentInteropStatus): void {
  const agents = readAgents();
  const agent = agents.find(a => a.agent_id === agentId);
  if (agent) { agent.status = status; writeAgents(agents); }
}

/** Get agents that can handle a specific stage */
export function getAgentsForStage(stage: SubtaskStage): AgentDefinition[] {
  return readAgents().filter(a =>
    a.status === 'available' && a.execution_boundary.allowed_stages.includes(stage)
  );
}

// ═══════════════════════════════════════════
// Handoff Management
// ═══════════════════════════════════════════

const handoffs: AgentHandoffRequest[] = [];
const results: AgentHandoffResult[] = [];

/** Create a handoff request (governed — checks privacy and approval) */
export function createHandoff(
  fromAgent: string, toAgent: string,
  taskId: string, subtaskId: string, stage: SubtaskStage,
  prompt: string, files: { read: string[]; write: string[] }
): AgentHandoffRequest | { error: string } {
  const agent = getAgent(toAgent);
  if (!agent) return { error: `Agent "${toAgent}" not found` };
  if (agent.status !== 'available') return { error: `Agent "${toAgent}" is ${agent.status}` };

  // Check stage is allowed
  if (!agent.execution_boundary.allowed_stages.includes(stage)) {
    return { error: `Agent "${toAgent}" cannot handle stage "${stage}"` };
  }

  // Check privacy
  let contextSnap: ContextSnapshot | null = null;
  if (agent.execution_boundary.can_access_context) {
    try {
      const ctx = require('./context') as { buildContextSnapshot(d: string): ContextSnapshot };
      const intake = require('./intake') as { getSubtask(id: string): { domain: string } | null };
      const st = intake.getSubtask(subtaskId);
      if (st) contextSnap = ctx.buildContextSnapshot(st.domain as Domain);
    } catch { /* context unavailable */ }
  }

  const handoff: AgentHandoffRequest = {
    id: hid(), from_agent: fromAgent, to_agent: toAgent,
    task_id: taskId, subtask_id: subtaskId, stage, prompt,
    context_snapshot: contextSnap,
    files_to_read: files.read, files_to_write: files.write,
    execution_boundary: agent.execution_boundary,
    privacy_scope: agent.privacy_scope,
    timeout_ms: agent.execution_boundary.max_runtime_ms,
    requires_approval: agent.execution_boundary.requires_approval,
    created_at: new Date().toISOString(),
  };

  handoffs.push(handoff);
  if (handoffs.length > 100) handoffs.shift();
  console.log(`[agents] Handoff created: ${handoff.id} (${fromAgent} → ${toAgent}, stage=${stage})`);
  return handoff;
}

/** Record a handoff result */
export function recordResult(result: AgentHandoffResult): void {
  results.push(result);
  if (results.length > 100) results.shift();
}

/** Get recent handoffs */
export function getRecentHandoffs(limit: number = 20): AgentHandoffRequest[] {
  return handoffs.slice(-limit);
}

/** Get recent results */
export function getRecentResults(limit: number = 20): AgentHandoffResult[] {
  return results.slice(-limit);
}

module.exports = {
  getAllAgents, getAgent, registerAgent, updateAgentStatus, getAgentsForStage,
  createHandoff, recordResult, getRecentHandoffs, getRecentResults,
};
