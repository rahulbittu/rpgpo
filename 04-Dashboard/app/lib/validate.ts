// GPO Runtime Validation
// TypeScript types are compile-time only. This module validates data at runtime
// boundaries: disk reads, API payloads, provider responses, user input.
// Every function returns { valid, data, errors } — never throws.

import type {
  IntakeTask, Subtask, QueueTask, BoardDeliberation,
  CostEntry, BudgetSettings, GPOInstance, OperatorProfile,
  MissionContextRecord, DecisionRecord, TaskStatus, SubtaskStatus,
  RiskLevel, Domain, Urgency,
} from './types';

// ═══════════════════════════════════════════
// Result type
// ═══════════════════════════════════════════

export interface ValidationResult<T> {
  valid: boolean;
  data: T;
  errors: string[];
}

function ok<T>(data: T): ValidationResult<T> {
  return { valid: true, data, errors: [] };
}

function fail<T>(data: T, errors: string[]): ValidationResult<T> {
  return { valid: false, data, errors };
}

// ═══════════════════════════════════════════
// Primitive validators
// ═══════════════════════════════════════════

function isString(v: unknown): v is string { return typeof v === 'string'; }
function isNumber(v: unknown): v is number { return typeof v === 'number' && Number.isFinite(v); }
function isBool(v: unknown): v is boolean { return typeof v === 'boolean'; }
function isArray(v: unknown): v is unknown[] { return Array.isArray(v); }
function isObj(v: unknown): v is Record<string, unknown> { return v !== null && typeof v === 'object' && !Array.isArray(v); }

const TASK_STATUSES: Set<string> = new Set([
  'intake', 'deliberating', 'planned', 'executing', 'waiting_approval',
  'waiting_human', 'blocked', 'done', 'failed', 'canceled',
]);

const SUBTASK_STATUSES: Set<string> = new Set([
  'proposed', 'queued', 'running', 'builder_running', 'waiting_approval',
  'builder_fallback', 'waiting_human', 'blocked', 'done', 'failed', 'canceled',
]);

const RISK_LEVELS: Set<string> = new Set(['green', 'yellow', 'red']);
const URGENCIES: Set<string> = new Set(['low', 'normal', 'high', 'critical']);

const DOMAINS: Set<string> = new Set([
  'topranker', 'careeregine', 'founder2founder', 'wealthresearch',
  'newsroom', 'screenwriting', 'music', 'personalops', 'general',
]);

// ═══════════════════════════════════════════
// Domain validators
// ═══════════════════════════════════════════

/** Validate an IntakeTask loaded from disk or API */
export function validateTask(raw: unknown): ValidationResult<IntakeTask> {
  if (!isObj(raw)) return fail(raw as IntakeTask, ['Not an object']);
  const errors: string[] = [];
  const r = raw as Record<string, unknown>;

  if (!isString(r.task_id)) errors.push('Missing or invalid task_id');
  if (!isString(r.title)) errors.push('Missing or invalid title');
  if (!isString(r.raw_request)) errors.push('Missing or invalid raw_request');
  if (!isString(r.status) || !TASK_STATUSES.has(r.status as string)) {
    errors.push(`Invalid status: ${r.status}`);
    r.status = 'intake'; // safe default
  }
  if (r.domain && !DOMAINS.has(r.domain as string)) r.domain = 'general';
  if (r.urgency && !URGENCIES.has(r.urgency as string)) r.urgency = 'normal';
  if (r.risk_level && !RISK_LEVELS.has(r.risk_level as string)) r.risk_level = 'green';

  // Ensure required fields have safe defaults
  if (!isString(r.created_at)) r.created_at = new Date().toISOString();
  if (!isString(r.updated_at)) r.updated_at = new Date().toISOString();

  return errors.length > 0 ? fail(r as unknown as IntakeTask, errors) : ok(r as unknown as IntakeTask);
}

/** Validate a Subtask loaded from disk or API */
export function validateSubtask(raw: unknown): ValidationResult<Subtask> {
  if (!isObj(raw)) return fail(raw as Subtask, ['Not an object']);
  const errors: string[] = [];
  const r = raw as Record<string, unknown>;

  if (!isString(r.subtask_id)) errors.push('Missing or invalid subtask_id');
  if (!isString(r.parent_task_id)) errors.push('Missing or invalid parent_task_id');
  if (!isString(r.title)) errors.push('Missing or invalid title');
  if (!isString(r.status) || !SUBTASK_STATUSES.has(r.status as string)) {
    errors.push(`Invalid subtask status: ${r.status}`);
    r.status = 'proposed';
  }
  if (r.risk_level && !RISK_LEVELS.has(r.risk_level as string)) r.risk_level = 'green';

  // Safe defaults for arrays
  if (!isArray(r.files_to_read)) r.files_to_read = [];
  if (!isArray(r.files_to_write)) r.files_to_write = [];
  if (!isArray(r.files_changed)) r.files_changed = [];
  if (!isArray(r.depends_on)) r.depends_on = [];

  return errors.length > 0 ? fail(r as unknown as Subtask, errors) : ok(r as unknown as Subtask);
}

/** Validate a QueueTask */
export function validateQueueTask(raw: unknown): ValidationResult<QueueTask> {
  if (!isObj(raw)) return fail(raw as QueueTask, ['Not an object']);
  const errors: string[] = [];
  const r = raw as Record<string, unknown>;

  if (!isString(r.id)) errors.push('Missing id');
  if (!isString(r.type)) errors.push('Missing type');
  if (!isString(r.label)) errors.push('Missing label');
  if (!isString(r.status)) r.status = 'queued';
  if (!isArray(r.filesWritten)) r.filesWritten = [];

  return errors.length > 0 ? fail(r as unknown as QueueTask, errors) : ok(r as unknown as QueueTask);
}

/** Validate a BoardDeliberation from AI response */
export function validateDeliberation(raw: unknown): ValidationResult<BoardDeliberation> {
  if (!isObj(raw)) return fail(raw as BoardDeliberation, ['Not an object']);
  const errors: string[] = [];
  const r = raw as Record<string, unknown>;

  if (!isString(r.interpreted_objective)) errors.push('Missing interpreted_objective');
  if (!isArray(r.subtasks)) errors.push('Missing or invalid subtasks array');
  if (!isString(r.recommended_strategy)) r.recommended_strategy = '';
  if (!isString(r.expected_outcome)) r.expected_outcome = '';
  if (!isArray(r.key_unknowns)) r.key_unknowns = [];
  if (!isArray(r.approval_points)) r.approval_points = [];
  if (r.risk_level && !RISK_LEVELS.has(r.risk_level as string)) r.risk_level = 'green';

  // Validate each subtask definition
  if (isArray(r.subtasks)) {
    for (let i = 0; i < (r.subtasks as unknown[]).length; i++) {
      const st = (r.subtasks as unknown[])[i];
      if (!isObj(st)) {
        errors.push(`subtasks[${i}] is not an object`);
        continue;
      }
      const s = st as Record<string, unknown>;
      if (!isString(s.title)) s.title = `Subtask ${i + 1}`;
      if (!isString(s.stage)) s.stage = 'audit';
      if (!isString(s.assigned_model)) s.assigned_model = 'openai';
      if (!isString(s.prompt)) s.prompt = '';
      if (!isArray(s.files_to_read)) s.files_to_read = [];
      if (!isArray(s.files_to_write)) s.files_to_write = [];
      if (!isArray(s.depends_on)) s.depends_on = [];
      if (s.risk_level && !RISK_LEVELS.has(s.risk_level as string)) s.risk_level = 'green';
    }
  }

  return errors.length > 0
    ? fail(r as unknown as BoardDeliberation, errors)
    : ok(r as unknown as BoardDeliberation);
}

/** Validate a CostEntry */
export function validateCostEntry(raw: unknown): ValidationResult<CostEntry> {
  if (!isObj(raw)) return fail(raw as CostEntry, ['Not an object']);
  const r = raw as Record<string, unknown>;
  const errors: string[] = [];

  if (!isString(r.provider)) r.provider = 'unknown';
  if (!isString(r.model)) r.model = 'unknown';
  if (!isNumber(r.inputTokens)) r.inputTokens = 0;
  if (!isNumber(r.outputTokens)) r.outputTokens = 0;
  if (!isNumber(r.totalTokens)) r.totalTokens = 0;
  if (!isNumber(r.cost)) r.cost = 0;

  return errors.length > 0 ? fail(r as unknown as CostEntry, errors) : ok(r as unknown as CostEntry);
}

/** Validate BudgetSettings */
export function validateBudgetSettings(raw: unknown): ValidationResult<BudgetSettings> {
  if (!isObj(raw)) return fail({
    geminiModel: 'gemini-2.5-flash-lite',
    geminibudgetLimit: null,
    warningThreshold: null,
    disableAfterThreshold: false,
    builderTimeoutMinutes: 10,
  }, ['Not an object']);

  const r = raw as Record<string, unknown>;
  if (!isString(r.geminiModel)) r.geminiModel = 'gemini-2.5-flash-lite';
  if (!isNumber(r.builderTimeoutMinutes)) r.builderTimeoutMinutes = 10;
  if (!isBool(r.disableAfterThreshold)) r.disableAfterThreshold = false;

  return ok(r as unknown as BudgetSettings);
}

/** Validate a GPOInstance */
export function validateInstance(raw: unknown): ValidationResult<GPOInstance> {
  if (!isObj(raw)) return fail(raw as GPOInstance, ['Not an object']);
  const r = raw as Record<string, unknown>;
  const errors: string[] = [];

  if (!isString(r.instance_id)) errors.push('Missing instance_id');
  if (!isString(r.instance_name)) errors.push('Missing instance_name');
  if (!isString(r.operator_name)) errors.push('Missing operator_name');
  if (!isArray(r.enabled_missions)) r.enabled_missions = ['general'];
  if (!isArray(r.enabled_capabilities)) r.enabled_capabilities = [];
  if (!isObj(r.policy)) errors.push('Missing policy');

  return errors.length > 0 ? fail(r as unknown as GPOInstance, errors) : ok(r as unknown as GPOInstance);
}

/** Validate OperatorProfile */
export function validateOperatorProfile(raw: unknown): ValidationResult<OperatorProfile> {
  if (!isObj(raw)) return fail(raw as OperatorProfile, ['Not an object']);
  const r = raw as Record<string, unknown>;

  if (!isString(r.name)) r.name = 'Operator';
  if (!isString(r.decision_style)) r.decision_style = 'balanced';
  if (!isString(r.communication_style)) r.communication_style = 'balanced';
  if (!isArray(r.recurring_priorities)) r.recurring_priorities = [];

  return ok(r as unknown as OperatorProfile);
}

/** Validate a DecisionRecord */
export function validateDecision(raw: unknown): ValidationResult<DecisionRecord> {
  if (!isObj(raw)) return fail(raw as DecisionRecord, ['Not an object']);
  const r = raw as Record<string, unknown>;
  const errors: string[] = [];

  if (!isString(r.title)) errors.push('Missing title');
  if (!isString(r.decision)) errors.push('Missing decision');
  if (!isString(r.domain) || !DOMAINS.has(r.domain as string)) r.domain = 'general';

  return errors.length > 0 ? fail(r as unknown as DecisionRecord, errors) : ok(r as unknown as DecisionRecord);
}

/** Validate a MissionContextRecord */
export function validateMissionContext(raw: unknown): ValidationResult<MissionContextRecord> {
  if (!isObj(raw)) return fail(raw as MissionContextRecord, ['Not an object']);
  const r = raw as Record<string, unknown>;

  if (!isString(r.domain) || !DOMAINS.has(r.domain as string)) r.domain = 'general';
  if (!isArray(r.recent_decisions)) r.recent_decisions = [];
  if (!isArray(r.open_questions)) r.open_questions = [];
  if (!isArray(r.constraints)) r.constraints = [];
  if (!isArray(r.key_artifacts)) r.key_artifacts = [];
  if (!isArray(r.approval_patterns)) r.approval_patterns = [];
  if (!isArray(r.next_actions)) r.next_actions = [];
  if (!isArray(r.known_issues)) r.known_issues = [];

  return ok(r as unknown as MissionContextRecord);
}

// ═══════════════════════════════════════════
// Collection validators — for arrays loaded from disk
// ═══════════════════════════════════════════

/** Validate an array of tasks, filtering out invalid ones */
export function validateTaskArray(raw: unknown): IntakeTask[] {
  if (!isArray(raw)) return [];
  const results: IntakeTask[] = [];
  for (const item of raw) {
    const v = validateTask(item);
    if (v.valid) results.push(v.data);
    else {
      // Log but don't crash — return the patched version
      console.log(`[validate] Task validation warning: ${v.errors.join(', ')}`);
      results.push(v.data);
    }
  }
  return results;
}

/** Validate an array of subtasks, filtering out invalid ones */
export function validateSubtaskArray(raw: unknown): Subtask[] {
  if (!isArray(raw)) return [];
  const results: Subtask[] = [];
  for (const item of raw) {
    const v = validateSubtask(item);
    if (v.valid) results.push(v.data);
    else {
      console.log(`[validate] Subtask validation warning: ${v.errors.join(', ')}`);
      results.push(v.data);
    }
  }
  return results;
}

/** Validate an array of queue tasks */
export function validateQueueTaskArray(raw: unknown): QueueTask[] {
  if (!isArray(raw)) return [];
  return (raw as unknown[]).map(item => {
    const v = validateQueueTask(item);
    return v.data;
  });
}

/** Validate an array of cost entries */
export function validateCostArray(raw: unknown): CostEntry[] {
  if (!isArray(raw)) return [];
  return (raw as unknown[]).map(item => {
    const v = validateCostEntry(item);
    return v.data;
  });
}

// ═══════════════════════════════════════════
// API payload validators
// ═══════════════════════════════════════════

/** Validate an intake submission payload */
export function validateIntakeSubmission(body: unknown): ValidationResult<{ raw_request: string; domain?: string; urgency?: string; desired_outcome?: string }> {
  if (!isObj(body)) return fail({ raw_request: '' }, ['Not an object']);
  const b = body as Record<string, unknown>;

  if (!isString(b.raw_request) || !(b.raw_request as string).trim()) {
    return fail({ raw_request: '' }, ['Missing raw_request']);
  }
  if (b.domain && !DOMAINS.has(b.domain as string)) b.domain = undefined;
  if (b.urgency && !URGENCIES.has(b.urgency as string)) b.urgency = 'normal';

  return ok(b as { raw_request: string; domain?: string; urgency?: string; desired_outcome?: string });
}

/** Validate a subtask approval payload */
export function validateApprovalPayload(subtaskId: string, body: unknown): ValidationResult<{ subtaskId: string }> {
  if (!subtaskId || typeof subtaskId !== 'string') {
    return fail({ subtaskId: '' }, ['Invalid subtaskId']);
  }
  return ok({ subtaskId });
}

/** Validate a revision payload */
export function validateRevisionPayload(body: unknown): ValidationResult<{ notes: string }> {
  if (!isObj(body)) return fail({ notes: '' }, ['Not an object']);
  const b = body as Record<string, unknown>;
  if (!isString(b.notes) || !(b.notes as string).trim()) {
    return fail({ notes: '' }, ['Missing revision notes']);
  }
  return ok({ notes: b.notes as string });
}

module.exports = {
  // Single-item validators
  validateTask,
  validateSubtask,
  validateQueueTask,
  validateDeliberation,
  validateCostEntry,
  validateBudgetSettings,
  validateInstance,
  validateOperatorProfile,
  validateDecision,
  validateMissionContext,
  // Collection validators
  validateTaskArray,
  validateSubtaskArray,
  validateQueueTaskArray,
  validateCostArray,
  // API payload validators
  validateIntakeSubmission,
  validateApprovalPayload,
  validateRevisionPayload,
};
