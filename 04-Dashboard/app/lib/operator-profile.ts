// GPO Adaptive Operator Profile — Learns how the operator works
// Structured, instance-scoped, privacy-aware. Not raw memory spam.
// Each agent gets a curated, scoped view of operator preferences.

import type {
  AdaptiveOperatorProfile, AgentWorkingPreference,
  Provider, Domain, OperatorProfile,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

const PROFILE_FILE = path.resolve(__dirname, '..', '..', 'state', 'context', 'adaptive-profile.json');

function readProfile(): AdaptiveOperatorProfile {
  try {
    if (fs.existsSync(PROFILE_FILE)) {
      return JSON.parse(fs.readFileSync(PROFILE_FILE, 'utf-8'));
    }
  } catch { /* use default */ }
  return createDefault();
}

function writeProfile(profile: AdaptiveOperatorProfile): void {
  const dir = path.dirname(PROFILE_FILE);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  profile.updated_at = new Date().toISOString();
  fs.writeFileSync(PROFILE_FILE, JSON.stringify(profile, null, 2));
}

function createDefault(): AdaptiveOperatorProfile {
  let name = 'Operator';
  try {
    const inst = require('./instance') as { getOperatorName(): string };
    name = inst.getOperatorName();
  } catch { /* not loaded yet */ }

  return {
    instance_id: 'rpgpo',
    name,
    decision_style: 'balanced',
    communication_style: 'terse',
    approval_threshold: 'normal',
    preferred_providers: ['claude', 'openai'],
    recurring_priorities: [],
    risk_tolerance: 'yellow',
    custom_notes: '',
    updated_at: new Date().toISOString(),
    approval_patterns: {
      avg_review_time_ms: 0,
      approval_rate: 0,
      revision_rate: 0,
      rejection_rate: 0,
      total_decisions: 0,
    },
    provider_preferences: {},
    detail_preference: 'standard',
    correction_patterns: [],
    output_preferences: {
      prefer_code_diffs: true,
      prefer_summaries: true,
      prefer_structured_reports: true,
      max_output_lines: 200,
    },
    agent_preferences: {
      'claude-local': defaultAgentPref('claude-local', 'high'),
      'openai-api': defaultAgentPref('openai-api', 'medium'),
      'gemini-api': defaultAgentPref('gemini-api', 'medium'),
      'perplexity-api': defaultAgentPref('perplexity-api', 'medium'),
    },
  };
}

function defaultAgentPref(agentId: string, trust: 'low' | 'medium' | 'high'): AgentWorkingPreference {
  return {
    agent_id: agentId,
    trust_level: trust,
    auto_approve_green: trust === 'high',
    preferred_detail: 'standard',
    custom_instructions: '',
    last_interaction_at: null,
    interactions_count: 0,
  };
}

// ═══════════════════════════════════════════
// Profile Access
// ═══════════════════════════════════════════

/** Get the full adaptive profile */
export function getProfile(): AdaptiveOperatorProfile {
  return readProfile();
}

/** Update profile fields */
export function updateProfile(updates: Partial<AdaptiveOperatorProfile>): AdaptiveOperatorProfile {
  const current = readProfile();
  const updated = { ...current, ...updates };
  writeProfile(updated);
  return updated;
}

// ═══════════════════════════════════════════
// Adaptive Learning — called by context-updater on events
// ═══════════════════════════════════════════

/** Record an approval decision to learn patterns */
export function recordApprovalDecision(
  outcome: 'approved' | 'rejected' | 'revised',
  reviewTimeMs: number,
  agentId?: string
): void {
  const profile = readProfile();
  const p = profile.approval_patterns;

  p.total_decisions++;
  // Rolling average for review time
  p.avg_review_time_ms = Math.round(
    (p.avg_review_time_ms * (p.total_decisions - 1) + reviewTimeMs) / p.total_decisions
  );

  // Update rates
  const total = p.total_decisions;
  if (outcome === 'approved') p.approval_rate = (p.approval_rate * (total - 1) + 1) / total;
  else p.approval_rate = (p.approval_rate * (total - 1)) / total;

  if (outcome === 'revised') p.revision_rate = (p.revision_rate * (total - 1) + 1) / total;
  else p.revision_rate = (p.revision_rate * (total - 1)) / total;

  if (outcome === 'rejected') p.rejection_rate = (p.rejection_rate * (total - 1) + 1) / total;
  else p.rejection_rate = (p.rejection_rate * (total - 1)) / total;

  // Update agent interaction
  if (agentId && profile.agent_preferences[agentId]) {
    profile.agent_preferences[agentId].interactions_count++;
    profile.agent_preferences[agentId].last_interaction_at = new Date().toISOString();
  }

  writeProfile(profile);
}

/** Record a correction/revision pattern */
export function recordCorrectionPattern(pattern: string): void {
  const profile = readProfile();
  if (!profile.correction_patterns.includes(pattern)) {
    profile.correction_patterns.unshift(pattern);
    if (profile.correction_patterns.length > 20) profile.correction_patterns.length = 20;
    writeProfile(profile);
  }
}

/** Record provider preference for a task type */
export function recordProviderPreference(taskType: string, provider: Provider): void {
  const profile = readProfile();
  profile.provider_preferences[taskType] = provider;
  writeProfile(profile);
}

// ═══════════════════════════════════════════
// Agent-Specific Operator Context
// ═══════════════════════════════════════════

/** Get curated operator context for a specific agent — privacy-scoped */
export function getOperatorContextForAgent(agentId: string): string {
  const profile = readProfile();
  const agentPref = profile.agent_preferences[agentId];

  // Build curated context block — not raw profile dump
  const lines: string[] = [];

  lines.push(`Operator: ${profile.name}`);
  lines.push(`Style: ${profile.decision_style} decisions, ${profile.communication_style} communication`);
  lines.push(`Risk tolerance: ${profile.risk_tolerance}`);

  if (profile.recurring_priorities.length > 0) {
    lines.push(`Priorities: ${profile.recurring_priorities.slice(0, 3).join(', ')}`);
  }

  if (agentPref) {
    lines.push(`Trust level with you: ${agentPref.trust_level}`);
    if (agentPref.custom_instructions) {
      lines.push(`Special instructions: ${agentPref.custom_instructions}`);
    }
    lines.push(`Detail preference: ${agentPref.preferred_detail}`);
  }

  if (profile.approval_patterns.total_decisions > 5) {
    lines.push(`Approval rate: ${Math.round(profile.approval_patterns.approval_rate * 100)}%`);
    if (profile.approval_patterns.revision_rate > 0.1) {
      lines.push(`Frequently requests revisions (${Math.round(profile.approval_patterns.revision_rate * 100)}% rate)`);
    }
  }

  if (profile.correction_patterns.length > 0) {
    lines.push(`Common corrections: ${profile.correction_patterns.slice(0, 3).join('; ')}`);
  }

  // Agent-specific output preferences
  if (profile.output_preferences) {
    const prefs: string[] = [];
    if (profile.output_preferences.prefer_code_diffs) prefs.push('prefers code diffs');
    if (profile.output_preferences.prefer_summaries) prefs.push('prefers summaries');
    if (prefs.length) lines.push(`Output: ${prefs.join(', ')}`);
  }

  return lines.join('\n');
}

/** Get agent working preference */
export function getAgentPreference(agentId: string): AgentWorkingPreference | null {
  const profile = readProfile();
  return profile.agent_preferences[agentId] || null;
}

/** Update agent-specific preference */
export function updateAgentPreference(agentId: string, updates: Partial<AgentWorkingPreference>): void {
  const profile = readProfile();
  if (!profile.agent_preferences[agentId]) {
    profile.agent_preferences[agentId] = defaultAgentPref(agentId, 'medium');
  }
  Object.assign(profile.agent_preferences[agentId], updates);
  writeProfile(profile);
}

module.exports = {
  getProfile, updateProfile,
  recordApprovalDecision, recordCorrectionPattern, recordProviderPreference,
  getOperatorContextForAgent, getAgentPreference, updateAgentPreference,
};
