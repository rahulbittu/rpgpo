// GPO System Map — Visual architecture data for the dashboard
// Produces the structured data that the frontend renders as the system map.

import type { SystemMapNode, SystemMapData, Domain } from './types';

const instanceMod = require('./instance') as {
  getInstance(): import('./types').GPOInstance;
  getPlanTier(): string;
};
const capsMod = require('./capabilities') as {
  getAllCapabilities(): Array<{ id: string; name: string; category: string }>;
};
const missionsMod = require('./missions') as {
  getAllMissions(): Array<{ domain: Domain; name: string }>;
};
const loopsMod = require('./loops') as {
  getLoopSummaries(): Array<{ domain: Domain; name: string; health: string; blocker_summary: string | null; tasks_completed: number }>;
};
const autonomyMod = require('./autonomy') as {
  getAllBlockers(): Array<{ id: string; title: string; severity: string; domain: Domain }>;
};
const agentsMod = require('./agents') as {
  getAllAgents(): Array<{ agent_id: string; name: string; provider: string; role: string; status: string; capabilities: string[] }>;
};

/** Build the complete system map data for the dashboard */
export function buildSystemMap(): SystemMapData {
  const inst = instanceMod.getInstance();
  const plan = instanceMod.getPlanTier();
  const allCaps = capsMod.getAllCapabilities();
  const allMissions = missionsMod.getAllMissions();
  const loopSummaries = loopsMod.getLoopSummaries();
  const blockers = autonomyMod.getAllBlockers();
  const agents = agentsMod.getAllAgents();

  const nodes: SystemMapNode[] = [];

  // GPO Core node
  nodes.push({
    id: 'gpo-core', label: 'GPO Core', type: 'core', status: 'active',
    detail: 'Govern Private Office — platform engine',
    children: ['workflow', 'context', 'autonomy', 'providers', 'builder'],
  });

  // Instance node
  nodes.push({
    id: 'instance', label: inst.instance_name, type: 'instance', status: 'active',
    detail: `${inst.operator_name}'s Private Office | Plan: ${plan}`,
    children: inst.enabled_missions.map(d => `mission-${d}`),
  });

  // Engine nodes
  nodes.push({
    id: 'workflow', label: 'Workflow Engine', type: 'engine', status: 'active',
    detail: 'Task intake, deliberation, execution, approval continuation',
    connections: ['context', 'autonomy', 'builder'],
  });

  nodes.push({
    id: 'context', label: 'Context Engine', type: 'engine', status: 'active',
    detail: 'Operator profile, mission memory, decisions, artifacts',
    connections: ['workflow'],
  });

  const blockerCount = blockers.length;
  nodes.push({
    id: 'autonomy', label: 'Autonomy', type: 'engine',
    status: blockerCount > 0 ? 'blocked' : 'active',
    detail: blockerCount > 0 ? `${blockerCount} blocker(s)` : 'Governed auto-continue active',
    connections: ['workflow'],
  });

  nodes.push({
    id: 'builder', label: 'Builder', type: 'engine', status: 'active',
    detail: 'Claude CLI code execution, preflight, diff, review',
    connections: ['workflow'],
  });

  // Provider layer
  const providerKeys = ['claude', 'openai', 'perplexity', 'gemini'] as const;
  let providersReady = 0;
  for (const p of providerKeys) {
    const enabled = inst.provider_settings[p]?.enabled || false;
    if (enabled) providersReady++;
    nodes.push({
      id: `provider-${p}`, label: p.charAt(0).toUpperCase() + p.slice(1),
      type: 'provider',
      status: enabled ? 'active' : 'disabled',
      detail: p === 'claude' ? 'Local execution' : (enabled ? 'API ready' : 'Disabled'),
    });
  }

  nodes.push({
    id: 'providers', label: 'Providers', type: 'layer', status: 'active',
    detail: `${providersReady} providers ready`,
    children: providerKeys.map(p => `provider-${p}`),
  });

  // Capability nodes
  for (const cap of allCaps) {
    const enabled = inst.enabled_capabilities.includes(cap.id);
    nodes.push({
      id: `cap-${cap.id}`, label: cap.name, type: 'capability',
      status: enabled ? 'active' : 'disabled',
      detail: cap.category,
    });
  }

  // Mission nodes
  for (const m of allMissions) {
    const enabled = inst.enabled_missions.includes(m.domain);
    const loop = loopSummaries.find(l => l.domain === m.domain);
    const missionBlockers = blockers.filter(b => b.domain === m.domain);

    nodes.push({
      id: `mission-${m.domain}`, label: m.name, type: 'mission',
      status: missionBlockers.length > 0 ? 'blocked' : (loop?.health === 'active' ? 'active' : enabled ? 'idle' : 'disabled'),
      detail: loop ? `${loop.health} | ${loop.tasks_completed} completed` + (missionBlockers.length ? ` | ${missionBlockers.length} blocker(s)` : '') : 'No loop data',
    });
  }

  // Agent nodes
  for (const ag of agents) {
    nodes.push({
      id: `agent-${ag.agent_id}`, label: ag.name, type: 'capability',
      status: ag.status === 'available' ? 'active' : ag.status === 'disabled' ? 'disabled' : 'idle',
      detail: `${ag.role} | ${ag.capabilities.join(', ')}`,
    });
  }

  // Check instance health
  let healthStatus = 'healthy';
  try {
    const prov = require('./provisioning') as { checkInstanceHealth(): { status: string } };
    healthStatus = prov.checkInstanceHealth().status;
  } catch { /* ignore */ }

  return {
    nodes,
    instance_id: inst.instance_id,
    plan,
    health: healthStatus,
    blockers: blockerCount,
    missions_active: loopSummaries.filter(l => l.health === 'active').length,
    providers_ready: providersReady,
    capabilities_enabled: inst.enabled_capabilities.length,
  };
}

/** Build a mission-specific map */
export function buildMissionMap(domain: Domain): Record<string, unknown> {
  const inst = instanceMod.getInstance();
  const loop = loopsMod.getLoopSummaries().find(l => l.domain === domain);
  const blockers = autonomyMod.getAllBlockers().filter(b => b.domain === domain);
  const agents = agentsMod.getAllAgents().filter(a =>
    a.capabilities.some(c => {
      const missionCaps: Record<string, string[]> = {
        topranker: ['coding', 'repo-grounding', 'research'],
        general: ['research', 'deliberation'],
      };
      return (missionCaps[domain] || missionCaps.general || []).includes(c);
    })
  );

  // Get recent task data for this mission
  let activeTasks: unknown[] = [];
  let recentCompletions: unknown[] = [];
  try {
    const intake = require('./intake') as {
      getAllTasks(): Array<{ task_id: string; title: string; domain: string; status: string; created_at: string }>;
    };
    const tasks = intake.getAllTasks().filter(t => t.domain === domain);
    activeTasks = tasks.filter(t => !['done', 'failed', 'canceled'].includes(t.status)).slice(0, 5);
    recentCompletions = tasks.filter(t => t.status === 'done').slice(0, 5);
  } catch { /* ignore */ }

  // Get context summary
  let contextSummary: unknown = null;
  try {
    const ctx = require('./context') as { buildContextSnapshot(d: string): unknown };
    contextSummary = ctx.buildContextSnapshot(domain);
  } catch { /* ignore */ }

  return {
    domain,
    enabled: inst.enabled_missions.includes(domain),
    loop: loop || null,
    blockers,
    agents: agents.map(a => ({ id: a.agent_id, name: a.name, role: a.role, status: a.status })),
    active_tasks: activeTasks,
    recent_completions: recentCompletions,
    context: contextSummary,
    repo: inst.repo_mappings[domain] || null,
  };
}

module.exports = { buildSystemMap, buildMissionMap };
