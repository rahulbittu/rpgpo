// GPO Provider Capabilities — Structured output capability registry + routing decisions

import type { GPO_ProviderCapability, GPO_ProviderRoutingDecision, GPO_ProviderMode, GPO_ContractAwareConfig } from '../types';

const CAPABILITIES: GPO_ProviderCapability[] = [
  {
    id: 'openai', modes: ['native-json', 'prompt-sentinel'],
    supportsStructured: true, supportsNativeJson: true, supportsMimeJson: false, supportsPromptSentinel: true,
    maxJsonTokens: 128000, notes: 'GPT-4o supports response_format json_object',
  },
  {
    id: 'anthropic', modes: ['native-json', 'prompt-sentinel'],
    supportsStructured: true, supportsNativeJson: true, supportsMimeJson: false, supportsPromptSentinel: true,
    maxJsonTokens: 200000, notes: 'Claude supports structured output via strong prompting',
  },
  {
    id: 'gemini', modes: ['mime-json', 'prompt-sentinel'],
    supportsStructured: true, supportsNativeJson: false, supportsMimeJson: true, supportsPromptSentinel: true,
    maxJsonTokens: 1000000, notes: 'Gemini supports response_mime_type application/json',
  },
  {
    id: 'google', modes: ['mime-json', 'prompt-sentinel'],
    supportsStructured: true, supportsNativeJson: false, supportsMimeJson: true, supportsPromptSentinel: true,
    maxJsonTokens: 1000000, notes: 'Alias for gemini',
  },
  {
    id: 'perplexity', modes: ['prompt-sentinel'],
    supportsStructured: false, supportsNativeJson: false, supportsMimeJson: false, supportsPromptSentinel: true,
    maxJsonTokens: 28000, notes: 'No native JSON mode; uses sentinel extraction',
  },
];

export function getProviderCapabilities(): GPO_ProviderCapability[] {
  return [...CAPABILITIES];
}

export function getProviderCapability(id: string): GPO_ProviderCapability | null {
  return CAPABILITIES.find(c => c.id === id) || null;
}

/**
 * Decide provider routing based on capability and config.
 * @param preferredProviderId - The provider preferred by the caller (e.g., from engine config)
 * @param config - Current ai-io config
 * @param context - Optional context: 'board' | 'worker' | 'subtask'
 */
export function decideProviderRouting(
  preferredProviderId: string | undefined,
  config: GPO_ContractAwareConfig,
  context: 'board' | 'worker' | 'subtask' = 'subtask'
): GPO_ProviderRoutingDecision {
  const routing = config.providerRouting || 'capability-preferred';

  // Check feature flags
  const featureFlag = context === 'board'
    ? (config.boardStructuredEnabled !== false)
    : (config.workerStructuredEnabled !== false);

  if (!config.enabled || !featureFlag || routing === 'legacy') {
    return {
      providerId: preferredProviderId || 'openai',
      mode: 'prompt-sentinel',
      structuredPath: false,
      featureFlagActive: false,
      parseRetriesPlanned: 0,
      reason: routing === 'legacy' ? 'Legacy routing mode' : 'Structured output disabled',
    };
  }

  if (routing === 'force-config') {
    const providerId = preferredProviderId || 'openai';
    const mode = (config.providerModes[providerId] as GPO_ProviderMode) || 'prompt-sentinel';
    return {
      providerId, mode,
      structuredPath: true,
      featureFlagActive: true,
      parseRetriesPlanned: config.maxParseAttempts,
      reason: `Force-config: ${providerId} with ${mode}`,
    };
  }

  // capability-preferred: prefer the requested provider if capable, else find best
  const preferred = preferredProviderId ? getProviderCapability(preferredProviderId) : null;

  if (preferred && preferred.supportsStructured) {
    const mode = preferred.supportsNativeJson ? 'native-json'
      : preferred.supportsMimeJson ? 'mime-json'
      : 'prompt-sentinel';
    return {
      providerId: preferred.id, mode,
      structuredPath: true,
      featureFlagActive: true,
      parseRetriesPlanned: config.maxParseAttempts,
      reason: `Capability-preferred: ${preferred.id} supports ${mode}`,
    };
  }

  // Preferred not capable — find best alternative
  const bestStructured = CAPABILITIES.find(c => c.supportsStructured && c.supportsNativeJson)
    || CAPABILITIES.find(c => c.supportsStructured);

  if (bestStructured) {
    const mode = bestStructured.supportsNativeJson ? 'native-json'
      : bestStructured.supportsMimeJson ? 'mime-json'
      : 'prompt-sentinel';
    return {
      providerId: bestStructured.id, mode,
      structuredPath: true,
      featureFlagActive: true,
      parseRetriesPlanned: config.maxParseAttempts,
      reason: `Capability-fallback: ${bestStructured.id} (preferred ${preferredProviderId || 'none'} not capable)`,
    };
  }

  // No structured-capable provider
  return {
    providerId: preferredProviderId || 'openai',
    mode: 'prompt-sentinel',
    structuredPath: true,
    featureFlagActive: true,
    parseRetriesPlanned: config.maxParseAttempts,
    reason: 'No native structured provider; using prompt-sentinel',
  };
}

module.exports = { getProviderCapabilities, getProviderCapability, decideProviderRouting };
