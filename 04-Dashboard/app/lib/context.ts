// GPO Context Engine — Instance-scoped, privacy-first structured context
// Stores, retrieves, and manages context for all GPO operations.
// All context is scoped to the current instance. Never shared across instances.

import type {
  Domain,
  Provider,
  OperatorProfile,
  MissionContextRecord,
  RepoProjectContext,
  DecisionRecord,
  OpenQuestion,
  ConstraintRecord,
  ArtifactRef,
  ApprovalPattern,
  StylePreference,
  ContextSnapshot,
  ContextRetrievalResult,
  SubtaskStage,
  PrivacyPolicy,
} from './types';

const fs = require('fs') as typeof import('fs');
const path = require('path') as typeof import('path');

// ═══════════════════════════════════════════
// Storage Layout
// ═══════════════════════════════════════════

const STATE_ROOT = path.resolve(__dirname, '..', '..', 'state', 'context');

function contextPath(file: string): string {
  return path.join(STATE_ROOT, file);
}

function missionPath(domain: Domain, file: string): string {
  return path.join(STATE_ROOT, 'missions', domain, file);
}

function ensureDir(dir: string): void {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function readJson<T>(filePath: string, fallback: T): T {
  try {
    if (!fs.existsSync(filePath)) return fallback;
    return JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  } catch { return fallback; }
}

function writeJson(filePath: string, data: unknown): void {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

function uid(): string {
  return 'ctx_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

// ═══════════════════════════════════════════
// Operator Profile
// ═══════════════════════════════════════════

const OPERATOR_FILE = contextPath('operator-profile.json');

function defaultOperatorProfile(): OperatorProfile {
  let instanceId = 'rpgpo';
  let name = 'Operator';
  try {
    const inst = require('./instance') as { getInstanceId(): string; getOperatorName(): string };
    instanceId = inst.getInstanceId();
    name = inst.getOperatorName();
  } catch { /* not yet loaded */ }

  return {
    instance_id: instanceId,
    name,
    decision_style: 'balanced',
    communication_style: 'terse',
    approval_threshold: 'normal',
    preferred_providers: ['claude', 'openai'],
    recurring_priorities: [],
    risk_tolerance: 'yellow',
    custom_notes: '',
    updated_at: new Date().toISOString(),
  };
}

export function getOperatorProfile(): OperatorProfile {
  return readJson(OPERATOR_FILE, defaultOperatorProfile());
}

export function updateOperatorProfile(updates: Partial<OperatorProfile>): OperatorProfile {
  const current = getOperatorProfile();
  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
  writeJson(OPERATOR_FILE, updated);
  return updated;
}

// ═══════════════════════════════════════════
// Mission Context
// ═══════════════════════════════════════════

function defaultMissionContext(domain: Domain): MissionContextRecord {
  let instanceId = 'rpgpo';
  try {
    const inst = require('./instance') as { getInstanceId(): string };
    instanceId = inst.getInstanceId();
  } catch { /* not yet loaded */ }

  return {
    instance_id: instanceId,
    domain,
    objective: '',
    current_status: '',
    recent_decisions: [],
    open_questions: [],
    constraints: [],
    key_artifacts: [],
    approval_patterns: [],
    next_actions: [],
    known_issues: [],
    context_summary: '',
    updated_at: new Date().toISOString(),
  };
}

export function getMissionContext(domain: Domain): MissionContextRecord {
  return readJson(missionPath(domain, 'context.json'), defaultMissionContext(domain));
}

export function updateMissionContext(domain: Domain, updates: Partial<MissionContextRecord>): MissionContextRecord {
  const current = getMissionContext(domain);
  const updated = { ...current, ...updates, updated_at: new Date().toISOString() };
  writeJson(missionPath(domain, 'context.json'), updated);
  return updated;
}

// ═══════════════════════════════════════════
// Decisions
// ═══════════════════════════════════════════

export function getDecisions(domain: Domain, limit: number = 20): DecisionRecord[] {
  const ctx = getMissionContext(domain);
  return ctx.recent_decisions.slice(0, limit);
}

export function addDecision(decision: Omit<DecisionRecord, 'id' | 'made_at'>): DecisionRecord {
  const record: DecisionRecord = {
    ...decision,
    id: uid(),
    made_at: new Date().toISOString(),
  };
  const ctx = getMissionContext(decision.domain);
  ctx.recent_decisions.unshift(record);
  if (ctx.recent_decisions.length > 50) ctx.recent_decisions.length = 50;
  updateMissionContext(decision.domain, { recent_decisions: ctx.recent_decisions });
  return record;
}

// ═══════════════════════════════════════════
// Open Questions
// ═══════════════════════════════════════════

export function getOpenQuestions(domain: Domain): OpenQuestion[] {
  const ctx = getMissionContext(domain);
  return ctx.open_questions.filter(q => !q.resolved_at);
}

export function addOpenQuestion(question: Omit<OpenQuestion, 'id' | 'raised_at'>): OpenQuestion {
  const record: OpenQuestion = {
    ...question,
    id: uid(),
    raised_at: new Date().toISOString(),
  };
  const ctx = getMissionContext(question.domain);
  ctx.open_questions.unshift(record);
  if (ctx.open_questions.length > 30) ctx.open_questions.length = 30;
  updateMissionContext(question.domain, { open_questions: ctx.open_questions });
  return record;
}

export function resolveQuestion(domain: Domain, questionId: string, resolution: string): void {
  const ctx = getMissionContext(domain);
  const q = ctx.open_questions.find(q => q.id === questionId);
  if (q) {
    q.resolved_at = new Date().toISOString();
    q.resolution = resolution;
    updateMissionContext(domain, { open_questions: ctx.open_questions });
  }
}

// ═══════════════════════════════════════════
// Constraints
// ═══════════════════════════════════════════

export function getActiveConstraints(domain: Domain): ConstraintRecord[] {
  const ctx = getMissionContext(domain);
  return ctx.constraints.filter(c => c.active);
}

export function addConstraint(constraint: Omit<ConstraintRecord, 'id' | 'created_at'>): ConstraintRecord {
  const record: ConstraintRecord = {
    ...constraint,
    id: uid(),
    created_at: new Date().toISOString(),
  };
  const ctx = getMissionContext(constraint.domain);
  ctx.constraints.push(record);
  updateMissionContext(constraint.domain, { constraints: ctx.constraints });
  return record;
}

// ═══════════════════════════════════════════
// Artifacts
// ═══════════════════════════════════════════

export function getArtifacts(domain: Domain, type?: ArtifactRef['type']): ArtifactRef[] {
  const ctx = getMissionContext(domain);
  if (type) return ctx.key_artifacts.filter(a => a.type === type);
  return ctx.key_artifacts;
}

export function addArtifact(artifact: Omit<ArtifactRef, 'id' | 'created_at'>): ArtifactRef {
  const record: ArtifactRef = {
    ...artifact,
    id: uid(),
    created_at: new Date().toISOString(),
  };
  const ctx = getMissionContext(artifact.domain);
  ctx.key_artifacts.unshift(record);
  if (ctx.key_artifacts.length > 100) ctx.key_artifacts.length = 100;
  updateMissionContext(artifact.domain, { key_artifacts: ctx.key_artifacts });
  return record;
}

// ═══════════════════════════════════════════
// Approval Patterns
// ═══════════════════════════════════════════

export function recordApprovalPattern(
  domain: Domain, stage: SubtaskStage, outcome: 'approved' | 'rejected' | 'revised'
): void {
  const ctx = getMissionContext(domain);
  const existing = ctx.approval_patterns.find(p => p.domain === domain && p.stage === stage && p.outcome === outcome);
  if (existing) {
    existing.count++;
    existing.last_at = new Date().toISOString();
  } else {
    ctx.approval_patterns.push({ domain, stage, outcome, count: 1, last_at: new Date().toISOString() });
  }
  updateMissionContext(domain, { approval_patterns: ctx.approval_patterns });
}

export function getApprovalPatterns(domain: Domain): ApprovalPattern[] {
  return getMissionContext(domain).approval_patterns;
}

// ═══════════════════════════════════════════
// Project / Repo Context
// ═══════════════════════════════════════════

export function getProjectContext(domain: Domain): RepoProjectContext | null {
  return readJson(missionPath(domain, 'project.json'), null);
}

export function updateProjectContext(domain: Domain, updates: Partial<RepoProjectContext>): RepoProjectContext {
  const existing = getProjectContext(domain) || {
    instance_id: 'rpgpo', domain, repo_path: '', stack: '',
    recent_changes: [], known_issues: [], key_files: [],
    updated_at: new Date().toISOString(),
  };
  const updated = { ...existing, ...updates, updated_at: new Date().toISOString() };
  writeJson(missionPath(domain, 'project.json'), updated);
  return updated;
}

// ═══════════════════════════════════════════
// Context Snapshots — compact summaries for prompt injection
// ═══════════════════════════════════════════

export function buildContextSnapshot(domain: Domain): ContextSnapshot {
  const operator = getOperatorProfile();
  const mission = getMissionContext(domain);
  const project = getProjectContext(domain);

  return {
    operator_summary: `${operator.name} | Style: ${operator.decision_style}/${operator.communication_style} | Risk tolerance: ${operator.risk_tolerance}` +
      (operator.recurring_priorities.length ? ` | Priorities: ${operator.recurring_priorities.join(', ')}` : ''),
    mission_summary: mission.context_summary || mission.objective || `Mission: ${domain}`,
    recent_decisions: mission.recent_decisions.slice(0, 5).map(d => `[${d.category}] ${d.title}: ${d.decision}`),
    active_constraints: mission.constraints.filter(c => c.active).map(c => c.constraint),
    open_questions: mission.open_questions.filter(q => !q.resolved_at).slice(0, 3).map(q => q.question),
    key_artifacts: mission.key_artifacts.slice(0, 5).map(a => `[${a.type}] ${a.title}`),
    approval_patterns: mission.approval_patterns.slice(0, 5).map(p =>
      `${p.stage}: ${p.outcome} x${p.count}`
    ),
    next_actions: mission.next_actions.slice(0, 3),
  };
}

/** Build a compact text block for injection into AI prompts */
export function buildContextPromptBlock(domain: Domain): string {
  const snap = buildContextSnapshot(domain);
  const sections: string[] = [];

  sections.push(`## Operator: ${snap.operator_summary}`);

  if (snap.mission_summary) {
    sections.push(`## Mission Context\n${snap.mission_summary}`);
  }

  if (snap.recent_decisions.length > 0) {
    sections.push(`## Prior Decisions\n${snap.recent_decisions.map(d => `- ${d}`).join('\n')}`);
  }

  if (snap.active_constraints.length > 0) {
    sections.push(`## Active Constraints\n${snap.active_constraints.map(c => `- ${c}`).join('\n')}`);
  }

  if (snap.open_questions.length > 0) {
    sections.push(`## Open Questions\n${snap.open_questions.map(q => `- ${q}`).join('\n')}`);
  }

  if (snap.approval_patterns.length > 0) {
    sections.push(`## Approval Patterns\n${snap.approval_patterns.map(p => `- ${p}`).join('\n')}`);
  }

  if (snap.next_actions.length > 0) {
    sections.push(`## Recommended Next Actions\n${snap.next_actions.map(a => `- ${a}`).join('\n')}`);
  }

  return sections.join('\n\n');
}

// ═══════════════════════════════════════════
// Full Retrieval — for dashboard and deep inspection
// ═══════════════════════════════════════════

export function retrieveContext(domain: Domain): ContextRetrievalResult {
  return {
    snapshot: buildContextSnapshot(domain),
    mission_context: getMissionContext(domain),
    project_context: getProjectContext(domain) as unknown as import('./types').ProjectContext | null,
    decisions: getDecisions(domain),
    artifacts: getArtifacts(domain),
    operator: getOperatorProfile(),
  };
}

// ═══════════════════════════════════════════
// Privacy-aware context export
// ═══════════════════════════════════════════

/** Get context for provider injection — respects privacy policy */
export function getContextForProvider(domain: Domain, provider: Provider): string | null {
  let policy: PrivacyPolicy;
  try {
    const privacyMod = require('./privacy') as {
      canSendToProvider(p: Provider, d: Domain, pol: PrivacyPolicy): boolean;
      redact(text: string, pol: PrivacyPolicy): string;
    };
    const instanceMod = require('./instance') as { getPrivacyPolicy(): PrivacyPolicy };
    policy = instanceMod.getPrivacyPolicy();

    if (!privacyMod.canSendToProvider(provider, domain, policy)) {
      return null; // Privacy policy blocks this provider for this mission
    }

    const block = buildContextPromptBlock(domain);
    return privacyMod.redact(block, policy);
  } catch {
    // If privacy module not available, return unredacted context
    return buildContextPromptBlock(domain);
  }
}

// ═══════════════════════════════════════════
// Style / Pattern Storage
// ═══════════════════════════════════════════

const STYLES_FILE = contextPath('style-preferences.json');

export function getStylePreferences(): StylePreference[] {
  return readJson(STYLES_FILE, []);
}

export function recordStylePreference(category: string, preference: string): void {
  const prefs = getStylePreferences();
  const existing = prefs.find(p => p.category === category && p.preference === preference);
  if (existing) {
    existing.observed_count++;
    existing.confidence = Math.min(1, existing.confidence + 0.1);
    existing.updated_at = new Date().toISOString();
  } else {
    prefs.push({
      category,
      preference,
      confidence: 0.3,
      observed_count: 1,
      updated_at: new Date().toISOString(),
    });
  }
  if (prefs.length > 100) prefs.length = 100;
  writeJson(STYLES_FILE, prefs);
}

module.exports = {
  // Operator
  getOperatorProfile,
  updateOperatorProfile,
  // Mission context
  getMissionContext,
  updateMissionContext,
  // Decisions
  getDecisions,
  addDecision,
  // Open questions
  getOpenQuestions,
  addOpenQuestion,
  resolveQuestion,
  // Constraints
  getActiveConstraints,
  addConstraint,
  // Artifacts
  getArtifacts,
  addArtifact,
  // Approval patterns
  recordApprovalPattern,
  getApprovalPatterns,
  // Project/repo
  getProjectContext,
  updateProjectContext,
  // Snapshots & retrieval
  buildContextSnapshot,
  buildContextPromptBlock,
  retrieveContext,
  getContextForProvider,
  // Style/patterns
  getStylePreferences,
  recordStylePreference,
};
