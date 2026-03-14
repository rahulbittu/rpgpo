// GPO Product Plans — Tier definitions and enforcement
// Plans govern what an instance can do. RPGPO defaults to 'pro'.
// Billing is not implemented — plan structure is real.

import type {
  PlanTier, PlanLimits, ProductPlan, PlanPrivacyFeatures,
  DeploymentMode, Provider, Domain,
} from './types';

// ═══════════════════════════════════════════
// Plan Registry
// ═══════════════════════════════════════════

const plans: Map<PlanTier, ProductPlan> = new Map();

plans.set('personal', {
  id: 'personal',
  name: 'Starter',
  description: 'Personal private office — essential capabilities',
  limits: {
    tier: 'personal',
    max_missions: 3,
    max_tasks_per_day: 10,
    max_subtasks_per_task: 4,
    max_providers: 2,
    max_builder_minutes_per_day: 30,
    max_cost_per_day_usd: 1.00,
    features: ['intake', 'deliberation', 'execution', 'cost-tracking'],
  },
  allowed_capabilities: [
    'research', 'deliberation', 'approval-handling', 'cost-tracking',
  ],
  allowed_providers: ['claude', 'openai'],
  privacy_features: {
    local_only_mode: false,
    mission_isolation: false,
    log_redaction: true,
    export_control: false,
    self_host: false,
  },
  deployment_modes: ['hosted'],
});

plans.set('pro', {
  id: 'pro',
  name: 'Pro',
  description: 'Full private office — all capabilities, all providers',
  limits: {
    tier: 'pro',
    max_missions: 10,
    max_tasks_per_day: 50,
    max_subtasks_per_task: 8,
    max_providers: 4,
    max_builder_minutes_per_day: 120,
    max_cost_per_day_usd: 10.00,
    features: ['intake', 'deliberation', 'execution', 'cost-tracking', 'builder', 'context-engine', 'autonomy', 'notifications'],
  },
  allowed_capabilities: [
    'coding', 'research', 'deliberation', 'repo-grounding',
    'approval-handling', 'builder-execution', 'cost-tracking',
    'report-generation', 'creative-writing', 'context-memory',
  ],
  allowed_providers: ['claude', 'openai', 'perplexity', 'gemini'],
  privacy_features: {
    local_only_mode: true,
    mission_isolation: true,
    log_redaction: true,
    export_control: true,
    self_host: false,
  },
  deployment_modes: ['hosted', 'local'],
});

plans.set('team', {
  id: 'team',
  name: 'Private',
  description: 'Full private office with self-host and advanced privacy',
  limits: {
    tier: 'team',
    max_missions: 20,
    max_tasks_per_day: 200,
    max_subtasks_per_task: 12,
    max_providers: 6,
    max_builder_minutes_per_day: 480,
    max_cost_per_day_usd: 50.00,
    features: ['intake', 'deliberation', 'execution', 'cost-tracking', 'builder', 'context-engine', 'autonomy', 'notifications', 'self-host', 'webhooks', 'agent-hooks'],
  },
  allowed_capabilities: [
    'coding', 'research', 'deliberation', 'repo-grounding',
    'approval-handling', 'builder-execution', 'cost-tracking',
    'report-generation', 'creative-writing', 'context-memory',
  ],
  allowed_providers: ['claude', 'openai', 'perplexity', 'gemini'],
  privacy_features: {
    local_only_mode: true,
    mission_isolation: true,
    log_redaction: true,
    export_control: true,
    self_host: true,
  },
  deployment_modes: ['hosted', 'local', 'self-hosted', 'offline'],
});

// ═══════════════════════════════════════════
// Plan Access
// ═══════════════════════════════════════════

/** Get a plan by tier */
export function getPlan(tier: PlanTier): ProductPlan {
  return plans.get(tier) || plans.get('personal')!;
}

/** Get all available plans */
export function getAllPlans(): ProductPlan[] {
  return Array.from(plans.values());
}

// ═══════════════════════════════════════════
// Plan Enforcement
// ═══════════════════════════════════════════

/** Check if a capability is allowed under a plan */
export function isCapabilityAllowed(tier: PlanTier, capabilityId: string): boolean {
  const plan = getPlan(tier);
  return plan.allowed_capabilities.includes(capabilityId);
}

/** Check if a provider is allowed under a plan */
export function isProviderAllowed(tier: PlanTier, provider: Provider): boolean {
  const plan = getPlan(tier);
  return plan.allowed_providers.includes(provider);
}

/** Check if a mission count is within plan limits */
export function isMissionCountAllowed(tier: PlanTier, count: number): boolean {
  return count <= getPlan(tier).limits.max_missions;
}

/** Check if daily task count is within limits */
export function isTaskCountAllowed(tier: PlanTier, todayCount: number): boolean {
  return todayCount < getPlan(tier).limits.max_tasks_per_day;
}

/** Check if subtask count is within limits for a task */
export function isSubtaskCountAllowed(tier: PlanTier, count: number): boolean {
  return count <= getPlan(tier).limits.max_subtasks_per_task;
}

/** Check if a feature is included in a plan */
export function isFeatureIncluded(tier: PlanTier, feature: string): boolean {
  return getPlan(tier).limits.features.includes(feature);
}

/** Check if a deployment mode is supported */
export function isDeploymentModeAllowed(tier: PlanTier, mode: DeploymentMode): boolean {
  return getPlan(tier).deployment_modes.includes(mode);
}

/** Check if a privacy feature is available */
export function isPrivacyFeatureAvailable(tier: PlanTier, feature: keyof PlanPrivacyFeatures): boolean {
  return getPlan(tier).privacy_features[feature];
}

/** Get plan limits */
export function getPlanLimits(tier: PlanTier): PlanLimits {
  return getPlan(tier).limits;
}

module.exports = {
  getPlan, getAllPlans,
  isCapabilityAllowed, isProviderAllowed,
  isMissionCountAllowed, isTaskCountAllowed, isSubtaskCountAllowed,
  isFeatureIncluded, isDeploymentModeAllowed, isPrivacyFeatureAvailable,
  getPlanLimits,
};
