// GPO Mission Framework — Core plugin system
// This is the GPO platform layer. It owns the registry, memory, and helpers.
// Instance-specific mission definitions are loaded separately (see rpgpo-missions.ts).

import type {
  Domain,
  MissionContext,
  MissionMemory,
  ApprovalRule,
  SubtaskStage,
  RiskLevel,
} from './types';

// ═══════════════════════════════════════════
// Mission Registry (GPO Core)
// ═══════════════════════════════════════════

const registry: Map<Domain, MissionContext> = new Map();

/** Register a mission context */
export function registerMission(context: MissionContext): void {
  registry.set(context.domain, context);
}

/** Get mission context by domain */
export function getMissionContext(domain: Domain): MissionContext {
  return registry.get(domain) || registry.get('general')!;
}

/** Get all registered missions */
export function getAllMissions(): MissionContext[] {
  return Array.from(registry.values());
}

/** Check if a domain is registered */
export function hasMission(domain: Domain): boolean {
  return registry.has(domain);
}

/** Unregister a mission (for reconfiguration) */
export function unregisterMission(domain: Domain): void {
  registry.delete(domain);
}

/** Default approval rules — shared across missions unless overridden */
export const DEFAULT_APPROVAL_RULES: ApprovalRule[] = [
  { stage: 'implement', riskLevel: 'yellow', requiresApproval: true, reason: 'Code changes require review' },
  { stage: 'build', riskLevel: 'yellow', requiresApproval: true, reason: 'Build tasks require review' },
  { stage: 'code', riskLevel: 'yellow', requiresApproval: true, reason: 'Code changes require review' },
];

// ═══════════════════════════════════════════
// Mission Memory (GPO Core — instance-scoped)
// ═══════════════════════════════════════════

const memoryCache: Map<Domain, MissionMemory> = new Map();

/** Get or create mission memory */
export function getMissionMemory(domain: Domain): MissionMemory {
  if (memoryCache.has(domain)) return memoryCache.get(domain)!;
  const memory: MissionMemory = {
    domain,
    lastRunAt: null,
    recentDecisions: [],
    knownIssues: [],
    artifacts: [],
    customContext: {},
  };
  memoryCache.set(domain, memory);
  return memory;
}

/** Update mission memory */
export function updateMissionMemory(domain: Domain, updates: Partial<MissionMemory>): MissionMemory {
  const existing = getMissionMemory(domain);
  const updated = { ...existing, ...updates };
  memoryCache.set(domain, updated);
  return updated;
}

/** Clear all mission memory (for instance reset) */
export function clearMissionMemory(): void {
  memoryCache.clear();
}

// ═══════════════════════════════════════════
// Mission-aware helpers (GPO Core)
// ═══════════════════════════════════════════

/** Check if a subtask needs approval based on mission rules */
export function requiresApproval(domain: Domain, stage: SubtaskStage, riskLevel: RiskLevel): boolean {
  const context = getMissionContext(domain);
  if (!context.approvalRules) return riskLevel !== 'green';

  const rule = context.approvalRules.find(r => r.stage === stage && r.riskLevel === riskLevel);
  if (rule) return rule.requiresApproval;

  // Default: yellow/red always require approval
  return riskLevel === 'yellow' || riskLevel === 'red';
}

/** Get the source repo path for a domain (if any) */
export function getSourceRepoPath(domain: Domain): string | undefined {
  const context = getMissionContext(domain);
  return context.sourceRepo;
}

/** Get domain display name */
export function getDomainDisplayName(domain: Domain): string {
  const context = registry.get(domain);
  return context ? context.name : domain;
}

// ═══════════════════════════════════════════
// Bootstrap — load instance-specific missions
// The 'general' mission is always registered as a platform default.
// ═══════════════════════════════════════════

registerMission({
  domain: 'general',
  name: 'General',
  description: 'General-purpose tasks not specific to any mission',
  keyFiles: [],
  governedLoop: ['Plan', 'Execute', 'Review'],
  specialists: { 'General': 'General-purpose analysis and execution' },
  approvalRules: DEFAULT_APPROVAL_RULES,
});

// Load RPGPO instance missions — this is the only instance-specific import.
// In a multi-tenant future, this would be driven by instance config.
require('./rpgpo-missions');

module.exports = {
  registerMission,
  getMissionContext,
  getAllMissions,
  hasMission,
  unregisterMission,
  DEFAULT_APPROVAL_RULES,
  getMissionMemory,
  updateMissionMemory,
  clearMissionMemory,
  requiresApproval,
  getSourceRepoPath,
  getDomainDisplayName,
};
