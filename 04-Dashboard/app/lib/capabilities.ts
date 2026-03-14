// GPO Capability / Skill Framework
// Reusable capabilities that GPO provides. Each can be enabled/disabled per instance.
// Capabilities are the building blocks that missions compose.

import type { Capability, CapabilityOverride, Provider, SubtaskStage } from './types';

// ═══════════════════════════════════════════
// Capability Registry
// ═══════════════════════════════════════════

const registry: Map<string, Capability> = new Map();

/** Register a capability */
export function registerCapability(cap: Capability): void {
  registry.set(cap.id, cap);
}

/** Get a capability by ID */
export function getCapability(id: string): Capability | undefined {
  return registry.get(id);
}

/** Get all registered capabilities */
export function getAllCapabilities(): Capability[] {
  return Array.from(registry.values());
}

/** Get capabilities by category */
export function getCapabilitiesByCategory(category: Capability['category']): Capability[] {
  return Array.from(registry.values()).filter(c => c.category === category);
}

/** Get the capability that handles a given subtask stage */
export function getCapabilityForStage(stage: SubtaskStage): Capability | undefined {
  return Array.from(registry.values()).find(c => c.handles_stages.includes(stage));
}

/** Check if a capability is available with given providers */
export function isCapabilityAvailable(id: string, enabledProviders: Provider[]): boolean {
  const cap = registry.get(id);
  if (!cap) return false;
  return cap.supported_providers.some(p => enabledProviders.includes(p));
}

// ═══════════════════════════════════════════
// Built-in Capabilities
// ═══════════════════════════════════════════

registerCapability({
  id: 'coding',
  name: 'Code Generation & Modification',
  description: 'Write, modify, and refactor code in project repositories',
  category: 'execution',
  supported_providers: ['claude'],
  requires: ['repo-grounding'],
  default_enabled: true,
  modifies_state: true,
  handles_stages: ['implement', 'build', 'code'],
});

registerCapability({
  id: 'research',
  name: 'Research & Analysis',
  description: 'Research topics, analyze data, and synthesize findings',
  category: 'research',
  supported_providers: ['openai', 'perplexity', 'gemini'],
  requires: [],
  default_enabled: true,
  modifies_state: false,
  handles_stages: ['research', 'audit'],
});

registerCapability({
  id: 'deliberation',
  name: 'Board Deliberation',
  description: 'Multi-model planning and strategy deliberation',
  category: 'analysis',
  supported_providers: ['openai', 'gemini'],
  requires: [],
  default_enabled: true,
  modifies_state: false,
  handles_stages: ['decide', 'strategy'],
});

registerCapability({
  id: 'repo-grounding',
  name: 'Repository Grounding',
  description: 'Scan and understand repository structure for code tasks',
  category: 'execution',
  supported_providers: ['claude'],
  requires: [],
  default_enabled: true,
  modifies_state: false,
  handles_stages: ['locate_files'],
});

registerCapability({
  id: 'approval-handling',
  name: 'Approval Workflow',
  description: 'Route decisions to operator and handle approval/rejection flow',
  category: 'operations',
  supported_providers: [],
  requires: [],
  default_enabled: true,
  modifies_state: true,
  handles_stages: ['approve', 'review'],
});

registerCapability({
  id: 'builder-execution',
  name: 'Builder Execution',
  description: 'Execute Claude CLI for code generation with preflight, timeout, and diff detection',
  category: 'execution',
  supported_providers: ['claude'],
  requires: ['coding', 'repo-grounding'],
  default_enabled: true,
  modifies_state: true,
  handles_stages: ['implement', 'build', 'code'],
});

registerCapability({
  id: 'cost-tracking',
  name: 'Cost Tracking',
  description: 'Track AI provider costs, enforce budgets, and generate spend reports',
  category: 'operations',
  supported_providers: [],
  requires: [],
  default_enabled: true,
  modifies_state: false,
  handles_stages: [],
});

registerCapability({
  id: 'report-generation',
  name: 'Report Generation',
  description: 'Generate structured reports from task and subtask outputs',
  category: 'analysis',
  supported_providers: ['openai', 'gemini'],
  requires: [],
  default_enabled: true,
  modifies_state: false,
  handles_stages: ['report'],
});

registerCapability({
  id: 'creative-writing',
  name: 'Creative Writing',
  description: 'Screenplay, story, music, and creative content generation',
  category: 'creative',
  supported_providers: ['openai', 'claude'],
  requires: [],
  default_enabled: true,
  modifies_state: false,
  handles_stages: [],
});

registerCapability({
  id: 'context-memory',
  name: 'Context & Memory',
  description: 'Maintain and recall mission-specific context across sessions',
  category: 'operations',
  supported_providers: [],
  requires: [],
  default_enabled: true,
  modifies_state: true,
  handles_stages: [],
});

module.exports = {
  registerCapability,
  getCapability,
  getAllCapabilities,
  getCapabilitiesByCategory,
  getCapabilityForStage,
  isCapabilityAvailable,
};
