// RPGPO Domain Types — Single source of truth for all typed objects
// Every concept in the system is defined here.

// ═══════════════════════════════════════════
// Enums & Literal Types
// ═══════════════════════════════════════════

/** Canonical task lifecycle states */
export type TaskStatus =
  | 'intake'
  | 'deliberating'
  | 'planned'
  | 'executing'
  | 'waiting_approval'
  | 'waiting_human'
  | 'blocked'
  | 'done'
  | 'failed'
  | 'canceled';

/** Canonical subtask lifecycle states */
export type SubtaskStatus =
  | 'proposed'
  | 'queued'
  | 'running'
  | 'builder_running'
  | 'waiting_approval'
  | 'builder_fallback'
  | 'waiting_human'
  | 'blocked'
  | 'done'
  | 'failed'
  | 'canceled';

/** Risk classification for subtasks and tasks */
export type RiskLevel = 'green' | 'yellow' | 'red';

/** Urgency levels for intake tasks */
export type Urgency = 'low' | 'normal' | 'high' | 'critical';

/** Mission domains — each maps to a pluggable mission context */
export type Domain =
  | 'topranker'
  | 'careeregine'
  | 'founder2founder'
  | 'wealthresearch'
  | 'newsroom'
  | 'screenwriting'
  | 'music'
  | 'personalops'
  | 'general';

/** AI provider identifiers */
export type Provider = 'claude' | 'openai' | 'perplexity' | 'gemini';

/** Models available per provider */
export type ModelId =
  | 'claude'
  | 'gpt-4o'
  | 'gpt-4o-mini'
  | 'sonar'
  | 'sonar-pro'
  | 'gemini-2.5-flash-lite'
  | 'gemini-2.5-flash'
  | string; // extensible

/** Provider connectivity state */
export type ProviderReadiness = 'ready' | 'missing' | 'auth_failed' | 'quota_unavailable' | 'model_unavailable';

/** Builder execution outcome — honest classification of what happened */
export type BuilderOutcome =
  | 'code_applied'
  | 'no_changes'
  | 'builder_fallback_prompt_created'
  | 'builder_timeout'
  | 'blocked_missing_context'
  | 'manual_execution_confirmed'
  | 'code_applied_approved'
  | 'no_changes_approved'
  | 'rejected'
  | null;

/** Builder execution phases */
export type BuilderPhase =
  | 'inspecting'
  | 'launching'
  | 'preflight'
  | 'running'
  | 'diffing'
  | 'classifying'
  | 'reporting'
  | 'review'
  | 'fallback'
  | 'complete'
  | 'blocked'
  | null;

/** Subtask stages from deliberation */
export type SubtaskStage =
  | 'audit'
  | 'decide'
  | 'implement'
  | 'build'
  | 'code'
  | 'locate_files'
  | 'report'
  | 'research'
  | 'review'
  | 'strategy'
  | 'approve'
  | string; // extensible

/** Subtask outcome classification */
export type OutcomeType =
  | 'code_applied'
  | 'files_written'
  | 'text_only_build'
  | 'text_output'
  | 'blocked_missing_context'
  | null;

/** Queue task status */
export type QueueTaskStatus = 'queued' | 'running' | 'done' | 'failed';

/** Queue task types */
export type QueueTaskType =
  | 'refresh-state'
  | 'morning-loop'
  | 'evening-loop'
  | 'board-run'
  | 'deliberate'
  | 'execute-subtask'
  | 'execute-builder'
  | 'launch_builder'
  | 'ai-channel'
  | string; // extensible

// ═══════════════════════════════════════════
// Core Domain Objects
// ═══════════════════════════════════════════

/** Intake task — the top-level work unit */
export interface IntakeTask {
  task_id: string;
  title: string;
  raw_request: string;
  domain: Domain;
  desired_outcome?: string;
  constraints?: string;
  success_criteria?: string;
  urgency: Urgency;
  risk_level: RiskLevel;
  status: TaskStatus;
  board_deliberation: BoardDeliberation | null;
  execution_plan: ExecutionPlan | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

/** Board deliberation result — produced by the deliberation engine */
export interface BoardDeliberation {
  interpreted_objective: string;
  expected_outcome: string;
  key_unknowns: string[];
  recommended_strategy: string;
  risk_level: RiskLevel;
  is_code_task: boolean;
  target_files_identified: boolean;
  approval_points: string[];
  subtasks: SubtaskDefinition[];
  repo_grounding: RepoGrounding | null;
  model_used: string;
  tokens_used: number;
}

/** Subtask definition from deliberation (not yet materialized) */
export interface SubtaskDefinition {
  title: string;
  stage: SubtaskStage;
  assigned_role: string;
  assigned_model: string;
  expected_output: string;
  prompt: string;
  files_to_read: string[];
  files_to_write: string[];
  risk_level: RiskLevel;
  approval_required: boolean;
  depends_on: (number | string)[];
  _blocked_no_files?: boolean;
}

/** Execution plan — the structured decomposition of a task */
export interface ExecutionPlan {
  subtask_ids: string[];
  dependency_graph: Record<string, string[]>;
  created_at: string;
}

/** Subtask — an individual unit of work within a task */
export interface Subtask {
  subtask_id: string;
  parent_task_id: string;
  title: string;
  domain: Domain;
  stage: SubtaskStage;
  assigned_role: string;
  assigned_model: string;
  expected_output: string;
  prompt: string;
  files_to_read: string[];
  files_to_write: string[];
  risk_level: RiskLevel;
  approval_required: boolean;
  depends_on: string[];
  order: number;
  status: SubtaskStatus;
  output: string | null;
  error: string | null;
  cost: CostEntry | null;
  created_at: string;
  updated_at: string;

  // Builder-specific fields
  builder_outcome: BuilderOutcome;
  builder_phase: BuilderPhase;
  outcome_type: OutcomeType;
  code_modified: boolean | null;
  files_changed: string[];
  file_scope: FileScope | null;
  diff_summary: string | null;
  diff_detail: string | null;
  target_files: { real: string[]; missing: string[] } | null;
  report_file: string | null;
  prompt_file: string | null;
  what_done: string | null;
  builder_diagnostics: BuilderDiagnostics | null;
  revision_notes: string | null;

  // Grounding metadata
  _stripped_paths?: string[];
  _is_locate_files?: boolean;
}

/** File scope classification for changed files */
export interface FileScope {
  rpgpo: string[];
  topranker: string[];
  other: string[];
  summary: string;
  onlyRpgpo: boolean;
}

/** Builder runtime diagnostics */
export interface BuilderDiagnostics {
  startedAt: string;
  cwd: string;
  hardTimeoutMs: number;
  inactivityTimeoutMs: number;
  targetFiles: string[];
  totalOutputBytes: number;
  totalLines: number;
  lastOutputAt: string | null;
  killedReason: string | null;
  exitCode: number | null;
  durationMs: number;
  preflightOk?: boolean;
  preflightError?: string;
  filesChanged?: number;
}

// ═══════════════════════════════════════════
// Provider & AI Types
// ═══════════════════════════════════════════

/** State of an AI provider */
export interface ProviderState {
  state: ProviderReadiness;
  type?: 'local' | 'api';
  model?: string;
}

/** AI call result */
export interface AICallResult {
  text: string;
  provider: Provider;
  model: string;
  usage: TokenUsage;
}

/** Token usage from AI call */
export interface TokenUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost?: number;
}

// ═══════════════════════════════════════════
// Cost Tracking
// ═══════════════════════════════════════════

/** Single cost ledger entry */
export interface CostEntry {
  ts: string;
  date: string;
  provider: Provider | string;
  model: string;
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  cost: number;
  taskId?: string;
  taskType?: string;
  role?: string;
  boardRunId?: string;
  intakeTaskId?: string;
  subtaskId?: string;
  domain?: string;
}

/** Cost summary aggregates */
export interface CostSummary {
  today: CostAggregate;
  week: CostAggregate;
  lastBoardRun: CostAggregate | null;
  byProvider: Record<string, CostAggregate>;
  byModel: Record<string, CostAggregate>;
  byDay: Record<string, CostAggregate>;
  totalEntries: number;
}

/** Cost aggregate for a time period or category */
export interface CostAggregate {
  cost: number;
  calls: number;
  tokens: number;
}

/** Budget configuration */
export interface BudgetSettings {
  geminiModel: string;
  geminibudgetLimit: number | null;
  warningThreshold: number | null;
  disableAfterThreshold: boolean;
  builderTimeoutMinutes: number;
}

/** Budget check result */
export interface BudgetCheck {
  ok: boolean;
  reason?: string;
  todayCost?: number;
  limit?: number;
}

// ═══════════════════════════════════════════
// Queue & Task Execution
// ═══════════════════════════════════════════

/** Worker queue task */
export interface QueueTask {
  id: string;
  type: QueueTaskType;
  label: string;
  status: QueueTaskStatus;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
  output: string | null;
  error: string | null;
  filesWritten: string[];
}

/** Result from queue task execution */
export interface TaskExecutionResult {
  output: string;
  builderOutcome?: BuilderOutcome;
  filesWritten?: string[];
  diagnostics?: BuilderDiagnostics;
  deliberation?: BoardDeliberation;
  subtasksCreated?: number;
  boardResult?: unknown;
  costs?: CostEntry[];
}

// ═══════════════════════════════════════════
// Workflow Engine
// ═══════════════════════════════════════════

/** Result of onSubtaskComplete */
export interface WorkflowResult {
  action: 'error' | 'failed' | 'noop' | 'complete' | 'needs_approval' | 'auto_continue';
  message: string;
  next_subtask_ids: string[];
  approval_needed?: string[];
}

/** Task progress summary */
export interface TaskProgress {
  total: number;
  proposed: number;
  queued: number;
  running: number;
  waiting_approval: number;
  done: number;
  failed: number;
  blocked: number;
  canceled: number;
}

// ═══════════════════════════════════════════
// Repo Grounding
// ═══════════════════════════════════════════

/** Repo grounding result */
export interface RepoGrounding {
  grounded: boolean;
  tree?: string;
  candidates: RepoCandidate[];
  targetAreas: TargetArea[];
  projectRelRoot?: string;
  totalFiles?: number;
  totalDirs?: number;
  candidateCount?: number;
  reason?: string;
}

/** A candidate file from repo scanning */
export interface RepoCandidate {
  path: string;
  area: string;
  reason: string;
}

/** Inferred target area from task text */
export interface TargetArea {
  area: string;
  dirs: string[];
  reason: string;
}

/** Path validation result */
export interface PathValidation {
  valid: boolean;
  missing: string[];
}

// ═══════════════════════════════════════════
// Events & Activity
// ═══════════════════════════════════════════

/** Structured activity event */
export interface ActivityEvent {
  ts: string;
  actor: 'claude' | 'openai' | 'gemini' | 'perplexity' | 'rahul' | 'system' | 'worker';
  action: string;
  result?: 'done' | 'failed' | 'queued' | 'approval' | null;
  taskId?: string;
  subtaskId?: string;
  domain?: Domain;
  detail?: string;
}

/** Dashboard SSE event types */
export type SSEEventType = 'connected' | 'activity' | 'task' | 'intake-update';

// ═══════════════════════════════════════════
// Mission System
// ═══════════════════════════════════════════

/** Mission status file model */
export interface Mission {
  mission: string;
  objective: string;
  status: string;
  metrics: string;
  progress: string;
  blockers: string;
  risks: string;
  nextActions: string;
  owner: string;
}

/** Mission plugin context — what each mission provides to the system */
export interface MissionContext {
  domain: Domain;
  name: string;
  description: string;
  keyFiles: string[];
  governedLoop: string[];
  specialists: Record<string, string>;
  sourceRepo?: string;
  defaultModel?: string;
  approvalRules?: ApprovalRule[];
  boardRoles?: string[];
  templateDir?: string;
}

/** Approval rule for a mission */
export interface ApprovalRule {
  stage: SubtaskStage;
  riskLevel: RiskLevel;
  requiresApproval: boolean;
  reason: string;
}

/** Mission memory — persistent context for a mission */
export interface MissionMemory {
  domain: Domain;
  lastRunAt: string | null;
  recentDecisions: string[];
  knownIssues: string[];
  artifacts: string[];
  customContext: Record<string, unknown>;
}

// ═══════════════════════════════════════════
// Operator / Dashboard
// ═══════════════════════════════════════════

/** What the Needs Rahul hero shows */
export interface NeedsRahulItem {
  type: 'approval' | 'plan_review' | 'deliberation' | 'manual_action';
  title: string;
  description: string;
  context: string;
  subtaskId?: string;
  taskId?: string;
  actions: NeedsRahulAction[];
}

/** Action button for Needs Rahul */
export interface NeedsRahulAction {
  label: string;
  style: 'primary' | 'secondary';
  handler: string; // function name to call
}

/** Dashboard state snapshot */
export interface DashboardState {
  top_priorities: string[];
  last_refresh: string;
  [key: string]: unknown;
}

/** Current task focus data from API */
export interface CurrentTaskFocus {
  task: IntakeTask | null;
  subtasks: Subtask[];
  progress: TaskProgress | null;
  pendingApprovals: Subtask[];
  activeSubtask: Subtask | null;
  nextBlocking: Subtask | null;
  builderActive: Subtask | null;
  reviewReady: Subtask[];
}

// ═══════════════════════════════════════════
// API Response Types
// ═══════════════════════════════════════════

export interface ApiOk<T = unknown> {
  ok: true;
  [key: string]: unknown;
}

export interface ApiError {
  ok: false;
  error: string;
}

export type ApiResponse<T = unknown> = ApiOk<T> | ApiError;

/** Approval continuation response */
export interface ApprovalResponse {
  ok: boolean;
  resumed?: string;
  action?: 'approved_and_continued' | 'approved';
  nextQueued?: Array<{ id: string; title: string }>;
  workflowAction?: string;
  message?: string;
  parentTask?: string;
}

// ═══════════════════════════════════════════
// Model Pricing
// ═══════════════════════════════════════════

export interface ModelPricing {
  input: number;  // cost per 1M input tokens
  output: number; // cost per 1M output tokens
}

// ═══════════════════════════════════════════
// GPO Instance Model
// ═══════════════════════════════════════════

/** A GPO instance — one private office for one operator */
export interface GPOInstance {
  instance_id: string;
  instance_name: string;
  operator_name: string;
  enabled_missions: Domain[];
  enabled_capabilities: string[];
  provider_settings: InstanceProviderSettings;
  repo_mappings: Record<Domain, string>;        // domain → relative path to source repo
  policy: PrivacyPolicy;
  budget: BudgetSettings;
  notification_settings: NotificationSettings;
  local_settings: LocalSettings;
  created_at: string;
  updated_at: string;
}

/** Provider configuration scoped to an instance */
export interface InstanceProviderSettings {
  claude: { enabled: boolean; mode: 'local' | 'api' };
  openai: { enabled: boolean; model: string };
  perplexity: { enabled: boolean; model: string };
  gemini: { enabled: boolean; model: string };
  [provider: string]: { enabled: boolean; [key: string]: unknown };
}

/** Notification preferences */
export interface NotificationSettings {
  enabled: boolean;
  channels: ('dashboard' | 'webhook' | 'email')[];
  webhook_url?: string;
  notify_on: ('approval_needed' | 'task_done' | 'task_failed' | 'builder_complete' | 'budget_warning')[];
}

/** Local/offline settings */
export interface LocalSettings {
  storage_root: string;        // absolute path to instance state directory
  offline_capable: boolean;
  auto_refresh_interval_ms: number;
  builder_timeout_minutes: number;
  operator_mode_default: boolean;
}

// ═══════════════════════════════════════════
// Privacy & Policy Framework
// ═══════════════════════════════════════════

/** Privacy policy for an instance — controls data boundaries */
export interface PrivacyPolicy {
  /** All data stays on this machine / within this instance */
  local_only: boolean;
  /** Which providers are allowed to receive data */
  allowed_providers: Provider[];
  /** Never send content from these missions to external APIs */
  mission_isolation: Domain[];
  /** Redact these patterns from all logs and external calls */
  log_redaction_patterns: string[];
  /** Fields that must never appear in exports or external calls */
  sensitive_fields: string[];
  /** Allow exporting task/subtask data */
  allow_export: boolean;
  /** Allow importing data from external sources */
  allow_import: boolean;
  /** Secret storage scope — where API keys live */
  secret_scope: 'env' | 'keychain' | 'vault';
  /** Memory/context is scoped to instance — never shared */
  memory_scope: 'instance';
}

/** Access class for data categorization */
export type AccessClass = 'A' | 'B' | 'C' | 'D';

/** Data classification for privacy enforcement */
export interface DataClassification {
  class: AccessClass;
  label: string;
  description: string;
  allowed_actions: string[];
}

// ═══════════════════════════════════════════
// Capability / Skill Framework
// ═══════════════════════════════════════════

/** A reusable capability that GPO provides */
export interface Capability {
  id: string;
  name: string;
  description: string;
  /** Category for grouping */
  category: 'execution' | 'research' | 'analysis' | 'creative' | 'operations' | 'integration';
  /** Which providers this capability can use */
  supported_providers: Provider[];
  /** Required for this capability to function */
  requires: string[];
  /** Whether this capability is enabled by default */
  default_enabled: boolean;
  /** Whether this capability can modify files/code */
  modifies_state: boolean;
  /** Subtask stages this capability handles */
  handles_stages: SubtaskStage[];
}

/** Instance-level capability override */
export interface CapabilityOverride {
  capability_id: string;
  enabled: boolean;
  custom_config?: Record<string, unknown>;
}

// ═══════════════════════════════════════════
// Enhanced Mission Plugin (GPO-level)
// ═══════════════════════════════════════════

/** Full mission plugin definition — extends MissionContext with GPO fields */
export interface MissionPlugin extends MissionContext {
  /** Unique mission identifier */
  id: string;
  /** Privacy scope for this mission's data */
  privacy_scope: 'shared' | 'isolated';
  /** Capabilities this mission depends on */
  required_capabilities: string[];
  /** Custom context hooks this mission provides */
  context_hooks: MissionContextHook[];
  /** Artifact types this mission produces */
  artifact_types: string[];
  /** Whether this mission has its own repo */
  has_repo: boolean;
}

/** A hook that a mission can register to inject context */
export interface MissionContextHook {
  hook_id: string;
  trigger: 'before_deliberation' | 'before_execution' | 'after_completion' | 'on_approval';
  description: string;
}

// ═══════════════════════════════════════════
// Plan-gated Features (future product tiers)
// ═══════════════════════════════════════════

/** Product plan tiers — for future subscription gating */
export type PlanTier = 'personal' | 'pro' | 'team';

/** Plan limits — enforced per instance */
export interface PlanLimits {
  tier: PlanTier;
  max_missions: number;
  max_tasks_per_day: number;
  max_subtasks_per_task: number;
  max_providers: number;
  max_builder_minutes_per_day: number;
  max_cost_per_day_usd: number;
  features: string[];
}

// ═══════════════════════════════════════════
// Context Engine
// ═══════════════════════════════════════════

/** Operator profile — preferences, style, patterns */
export interface OperatorProfile {
  instance_id: string;
  name: string;
  decision_style: 'cautious' | 'balanced' | 'aggressive';
  communication_style: 'terse' | 'balanced' | 'detailed';
  approval_threshold: 'strict' | 'normal' | 'relaxed';
  preferred_providers: Provider[];
  recurring_priorities: string[];
  risk_tolerance: RiskLevel;
  custom_notes: string;
  updated_at: string;
}

/** Per-mission structured context */
export interface MissionContextRecord {
  instance_id: string;
  domain: Domain;
  objective: string;
  current_status: string;
  recent_decisions: DecisionRecord[];
  open_questions: OpenQuestion[];
  constraints: ConstraintRecord[];
  key_artifacts: ArtifactRef[];
  approval_patterns: ApprovalPattern[];
  next_actions: string[];
  known_issues: string[];
  context_summary: string;
  updated_at: string;
}

/** A recorded decision */
export interface DecisionRecord {
  id: string;
  domain: Domain;
  category: 'strategy' | 'technical' | 'design' | 'process' | 'approval' | 'budget';
  title: string;
  decision: string;
  reasoning: string;
  impact: string;
  task_id?: string;
  subtask_id?: string;
  made_at: string;
}

/** An open question needing resolution */
export interface OpenQuestion {
  id: string;
  domain: Domain;
  question: string;
  context: string;
  priority: 'low' | 'medium' | 'high';
  raised_at: string;
  resolved_at?: string;
  resolution?: string;
}

/** A recorded constraint */
export interface ConstraintRecord {
  id: string;
  domain: Domain;
  constraint: string;
  reason: string;
  source: 'operator' | 'deliberation' | 'system';
  active: boolean;
  created_at: string;
}

/** Reference to an artifact */
export interface ArtifactRef {
  id: string;
  domain: Domain;
  type: 'report' | 'code_change' | 'analysis' | 'prompt' | 'summary' | 'config';
  title: string;
  path: string;
  created_at: string;
  task_id?: string;
}

/** Observed approval pattern */
export interface ApprovalPattern {
  domain: Domain;
  stage: SubtaskStage;
  outcome: 'approved' | 'rejected' | 'revised';
  count: number;
  last_at: string;
}

/** Per-project/repo context (legacy — repo-level) */
export interface RepoProjectContext {
  instance_id: string;
  domain: Domain;
  repo_path: string;
  stack: string;
  recent_changes: string[];
  known_issues: string[];
  key_files: string[];
  updated_at: string;
}

/** Style preference record */
export interface StylePreference {
  category: string;
  preference: string;
  confidence: number;
  observed_count: number;
  updated_at: string;
}

/** Compact context summary for injection into prompts */
export interface ContextSnapshot {
  operator_summary: string;
  mission_summary: string;
  recent_decisions: string[];
  active_constraints: string[];
  open_questions: string[];
  key_artifacts: string[];
  approval_patterns: string[];
  next_actions: string[];
}

/** Result from context retrieval */
export interface ContextRetrievalResult {
  snapshot: ContextSnapshot;
  mission_context: MissionContextRecord | null;
  project_context: ProjectContext | null;
  decisions: DecisionRecord[];
  artifacts: ArtifactRef[];
  operator: OperatorProfile;
}

/** Context source adapter interface — for future extensibility */
export interface ContextSourceAdapter {
  id: string;
  name: string;
  type: 'repo' | 'email' | 'document' | 'note' | 'upload';
  extract(input: unknown): Promise<Record<string, unknown>>;
}

// ═══════════════════════════════════════════
// Governed Autonomy
// ═══════════════════════════════════════════

/** Why work was stopped — every blocker has a typed reason */
export type BlockerReason =
  | 'approval_required'
  | 'code_review_required'
  | 'builder_fallback'
  | 'revision_requested'
  | 'missing_context'
  | 'budget_exceeded'
  | 'provider_unavailable'
  | 'privacy_restricted'
  | 'policy_blocked'
  | 'rate_limited'
  | 'manual_action_required';

/** A blocker that requires operator attention */
export interface Blocker {
  id: string;
  reason: BlockerReason;
  title: string;
  description: string;
  domain: Domain;
  task_id?: string;
  subtask_id?: string;
  resume_action: string;
  resume_label: string;
  created_at: string;
  resolved_at?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

/** Continuation decision — what to do after an event */
export interface ContinuationDecision {
  action: 'continue' | 'stop' | 'escalate' | 'skip';
  reason: string;
  blocker?: Blocker;
  next_subtask_ids: string[];
}

/** Pre-execution check result */
export interface PreExecutionCheck {
  can_execute: boolean;
  blockers: Blocker[];
  warnings: string[];
}

// ═══════════════════════════════════════════
// Mission Loops
// ═══════════════════════════════════════════

/** Health status of a mission loop */
export type LoopHealth = 'healthy' | 'active' | 'paused' | 'blocked' | 'degraded' | 'idle';

/** A governed mission loop definition */
export interface MissionLoop {
  domain: Domain;
  name: string;
  stages: string[];
  auto_continue_stages: string[];
  approval_stages: string[];
  common_task_types: MissionTaskTemplate[];
  health: LoopHealth;
  last_activity_at: string | null;
  current_blocker: Blocker | null;
  tasks_completed: number;
  tasks_failed: number;
  updated_at: string;
}

/** A template for common tasks within a mission loop */
export interface MissionTaskTemplate {
  id: string;
  title: string;
  description: string;
  prompt_prefix: string;
  domain: Domain;
  urgency: Urgency;
  likely_stages: string[];
  likely_artifacts: string[];
  auto_deliberate: boolean;
}

/** Loop status summary for dashboard display */
export interface LoopStatusSummary {
  domain: Domain;
  name: string;
  health: LoopHealth;
  blocker_summary: string | null;
  tasks_completed: number;
  last_activity: string | null;
  next_action: string | null;
}

// ═══════════════════════════════════════════
// Notification Hooks
// ═══════════════════════════════════════════

/** Notification channel types */
export type NotificationChannel = 'dashboard' | 'webhook' | 'email' | 'telegram' | 'push';

/** A notification event ready for dispatch */
export interface NotificationPayload {
  id: string;
  channel: NotificationChannel;
  event_type: NotificationEventType;
  title: string;
  body: string;
  severity: 'info' | 'warning' | 'critical';
  domain?: Domain;
  task_id?: string;
  subtask_id?: string;
  action_url?: string;
  created_at: string;
  delivered_at?: string;
}

/** Events that can trigger notifications */
export type NotificationEventType =
  | 'approval_needed'
  | 'task_done'
  | 'task_failed'
  | 'builder_complete'
  | 'builder_fallback'
  | 'budget_warning'
  | 'budget_exceeded'
  | 'provider_down'
  | 'loop_blocked'
  | 'loop_degraded';

/** Hook point for external agent interaction */
export interface AgentHook {
  id: string;
  name: string;
  type: 'inbound' | 'outbound';
  protocol: 'webhook' | 'api' | 'cli' | 'queue';
  enabled: boolean;
  endpoint?: string;
  auth_method?: 'none' | 'bearer' | 'hmac';
  privacy_scope: 'instance' | 'mission';
  created_at: string;
}

/** External execution handoff */
export interface ExecutionHandoff {
  id: string;
  subtask_id: string;
  target_agent: string;
  payload: Record<string, unknown>;
  status: 'pending' | 'accepted' | 'completed' | 'failed';
  result?: Record<string, unknown>;
  created_at: string;
  completed_at?: string;
}

// ═══════════════════════════════════════════
// Product Plans & Provisioning
// ═══════════════════════════════════════════

/** Product plan definition */
export interface ProductPlan {
  id: PlanTier;
  name: string;
  description: string;
  limits: PlanLimits;
  allowed_capabilities: string[];
  allowed_providers: Provider[];
  privacy_features: PlanPrivacyFeatures;
  deployment_modes: DeploymentMode[];
}

/** Privacy features gated by plan */
export interface PlanPrivacyFeatures {
  local_only_mode: boolean;
  mission_isolation: boolean;
  log_redaction: boolean;
  export_control: boolean;
  self_host: boolean;
}

/** Supported deployment modes */
export type DeploymentMode = 'hosted' | 'local' | 'self-hosted' | 'offline';

/** Instance provisioning request */
export interface ProvisioningRequest {
  instance_name: string;
  operator_name: string;
  plan: PlanTier;
  missions?: Domain[];
  capabilities?: string[];
  privacy_preset?: 'open' | 'balanced' | 'strict' | 'local-only';
}

/** Instance provisioning result */
export interface ProvisioningResult {
  success: boolean;
  instance: GPOInstance | null;
  errors: string[];
  warnings: string[];
}

/** Instance health check */
export interface InstanceHealth {
  instance_id: string;
  status: 'healthy' | 'degraded' | 'error';
  checks: HealthCheck[];
  plan: PlanTier;
  missions_active: number;
  providers_ready: number;
  blockers: number;
  storage_mb: number;
}

/** Individual health check */
export interface HealthCheck {
  name: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

/** Instance export format — safe for transfer */
export interface InstanceExport {
  version: string;
  exported_at: string;
  instance: Omit<GPOInstance, 'policy'> & {
    policy: Omit<PrivacyPolicy, 'log_redaction_patterns'>;
  };
  context_summary: Record<string, unknown>;
  loop_state: Record<string, unknown>;
}

/** Product admin summary — for instance settings surface */
export interface ProductAdminSummary {
  instance_id: string;
  instance_name: string;
  operator_name: string;
  plan: ProductPlan;
  capabilities: Array<{ id: string; name: string; enabled: boolean; allowed: boolean }>;
  missions: Array<{ domain: Domain; name: string; enabled: boolean; allowed: boolean }>;
  providers: Array<{ id: string; enabled: boolean; allowed: boolean; status: string }>;
  privacy: {
    local_only: boolean;
    isolated_missions: Domain[];
    redaction_active: boolean;
    export_allowed: boolean;
    secret_scope: string;
  };
  budget: BudgetSettings;
  autonomy: {
    loops_active: number;
    loops_blocked: number;
    total_blockers: number;
  };
  storage: {
    root: string;
    offline_capable: boolean;
  };
}

// ═══════════════════════════════════════════
// Agent Interoperability
// ═══════════════════════════════════════════

/** An agent that can participate in GPO workflows */
export interface AgentDefinition {
  agent_id: string;
  name: string;
  provider: Provider | 'external';
  role: AgentRole;
  capabilities: string[];
  execution_boundary: AgentExecutionBoundary;
  privacy_scope: AgentPrivacyScope;
  status: AgentInteropStatus;
  endpoint?: string;
  auth_method?: 'none' | 'bearer' | 'hmac' | 'mutual_tls';
  created_at: string;
}

/** Role an agent plays in the system */
export type AgentRole = 'executor' | 'reasoner' | 'reviewer' | 'specialist' | 'orchestrator' | 'builder' | 'critic' | 'researcher' | 'strategist';

/** What an agent is allowed to do */
export interface AgentExecutionBoundary {
  can_read_files: boolean;
  can_write_files: boolean;
  can_execute_code: boolean;
  can_access_network: boolean;
  can_access_context: boolean;
  max_runtime_ms: number;
  allowed_stages: SubtaskStage[];
  requires_approval: boolean;
}

/** Privacy scope for agent data access */
export interface AgentPrivacyScope {
  scope: 'instance' | 'mission' | 'task';
  allowed_missions: Domain[];
  can_see_operator_profile: boolean;
  can_see_decisions: boolean;
  can_see_artifacts: boolean;
  redact_before_send: boolean;
}

/** Agent readiness status */
export type AgentInteropStatus = 'available' | 'busy' | 'offline' | 'disabled' | 'pending_approval';

/** Request to hand off work to an agent */
export interface AgentHandoffRequest {
  id: string;
  from_agent: string;
  to_agent: string;
  task_id: string;
  subtask_id: string;
  stage: SubtaskStage;
  prompt: string;
  context_snapshot: ContextSnapshot | null;
  files_to_read: string[];
  files_to_write: string[];
  execution_boundary: AgentExecutionBoundary;
  privacy_scope: AgentPrivacyScope;
  timeout_ms: number;
  requires_approval: boolean;
  created_at: string;
}

/** Result returned from an agent handoff */
export interface AgentHandoffResult {
  id: string;
  handoff_id: string;
  agent_id: string;
  status: 'completed' | 'failed' | 'timeout' | 'rejected';
  output: string;
  files_changed: string[];
  error?: string;
  usage?: TokenUsage;
  duration_ms: number;
  completed_at: string;
}

/** System map node — for visual system overview */
export interface SystemMapNode {
  id: string;
  label: string;
  type: 'core' | 'instance' | 'mission' | 'capability' | 'provider' | 'engine' | 'layer';
  status: 'active' | 'idle' | 'blocked' | 'disabled';
  detail?: string;
  children?: string[];
  connections?: string[];
}

/** System map data — complete view for dashboard */
export interface SystemMapData {
  nodes: SystemMapNode[];
  instance_id: string;
  plan: string;
  health: string;
  blockers: number;
  missions_active: number;
  providers_ready: number;
  capabilities_enabled: number;
}

// ═══════════════════════════════════════════
// Real Board of AI — Multi-Agent Deliberation
// ═══════════════════════════════════════════

/** A single agent's contribution to a board deliberation */
export interface BoardVoice {
  agent_id: string;
  agent_name: string;
  role: AgentRole;
  provider: Provider | 'external';
  response: string;
  tokens_used: number;
  cost: number;
  duration_ms: number;
  timestamp: string;
}

/** Structured board exchange — the full multi-agent discussion */
export interface BoardExchange {
  task_id: string;
  domain: Domain;
  phases: BoardPhase[];
  synthesis: string;
  final_recommendation: string;
  risk_level: RiskLevel;
  total_cost: number;
  total_tokens: number;
  duration_ms: number;
  agents_participated: string[];
  timestamp: string;
}

/** A phase in the board discussion */
export interface BoardPhase {
  phase: 'interpret' | 'critique' | 'specialize' | 'research' | 'synthesize';
  voices: BoardVoice[];
  summary: string;
}

// ═══════════════════════════════════════════
// GitOps Layer
// ═══════════════════════════════════════════

/** Current Git repository state */
export interface GitState {
  branch: string;
  clean: boolean;
  changed_files: GitChangedFile[];
  recent_commits: GitCommitSummary[];
  has_unpushed: boolean;
}

/** A changed file in the working tree */
export interface GitChangedFile {
  path: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked';
  staged: boolean;
}

/** Summary of a recent commit */
export interface GitCommitSummary {
  hash: string;
  message: string;
  author: string;
  date: string;
}

/** A prepared commit/release summary */
export interface ReleaseSummary {
  commit_message: string;
  pr_title: string;
  pr_body: string;
  release_note: string;
  changed_files: string[];
  affected_modules: string[];
  affected_missions: string[];
  requires_approval: boolean;
}

// ═══════════════════════════════════════════
// Environment Lanes
// ═══════════════════════════════════════════

/** Deployment environment */
export type Environment = 'dev' | 'beta' | 'prod';

/** Environment-specific configuration */
export interface EnvironmentConfig {
  env: Environment;
  instance_id: string;
  state_root: string;
  active: boolean;
  promoted_from?: Environment;
  promoted_at?: string;
  release_version?: string;
  release_notes?: string;
  config_overrides: Partial<GPOInstance>;
}

/** Promotion request between environments */
export interface PromotionRequest {
  from_env: Environment;
  to_env: Environment;
  release_version: string;
  release_notes: string;
  changed_since_last: string[];
  requires_approval: boolean;
}

/** Promotion result */
export interface PromotionResult {
  success: boolean;
  from_env: Environment;
  to_env: Environment;
  release_version: string;
  errors: string[];
  warnings: string[];
  promoted_at?: string;
}

/** Environment status summary */
export interface EnvironmentStatus {
  env: Environment;
  active: boolean;
  release_version: string;
  last_promoted: string | null;
  state_root: string;
  instance_id: string;
}

// ═══════════════════════════════════════════
// Adaptive Operator Profile
// ═══════════════════════════════════════════

/** Extended operator profile with learned preferences */
export interface AdaptiveOperatorProfile extends OperatorProfile {
  /** Approval behavior patterns */
  approval_patterns: {
    avg_review_time_ms: number;
    approval_rate: number;
    revision_rate: number;
    rejection_rate: number;
    total_decisions: number;
  };
  /** Preferred providers by task type */
  provider_preferences: Record<string, Provider>;
  /** Preferred output detail level */
  detail_preference: 'minimal' | 'standard' | 'detailed';
  /** Common correction patterns from revisions */
  correction_patterns: string[];
  /** Preferred output shapes */
  output_preferences: {
    prefer_code_diffs: boolean;
    prefer_summaries: boolean;
    prefer_structured_reports: boolean;
    max_output_lines: number;
  };
  /** Per-agent working preferences */
  agent_preferences: Record<string, AgentWorkingPreference>;
}

/** How the operator prefers to work with a specific agent */
export interface AgentWorkingPreference {
  agent_id: string;
  trust_level: 'low' | 'medium' | 'high';
  auto_approve_green: boolean;
  preferred_detail: 'minimal' | 'standard' | 'detailed';
  custom_instructions: string;
  last_interaction_at: string | null;
  interactions_count: number;
}

// ═══════════════════════════════════════════
// Full Board Discipline
// ═══════════════════════════════════════════

/** Extended board phase with full lifecycle */
export type BoardLifecyclePhase =
  | 'interpret'
  | 'research'
  | 'critique'
  | 'synthesize'
  | 'decide'
  | 'handoff'
  | 'review'
  | 'report';

/** Board decision — the final output of a disciplined board run */
export interface BoardDecision {
  task_id: string;
  domain: Domain;
  exchange: BoardExchange;
  decision: string;
  risk_level: RiskLevel;
  execution_plan_summary: string;
  approval_required: boolean;
  estimated_cost: number;
  estimated_duration_minutes: number;
  confidence: 'low' | 'medium' | 'high';
  dissenting_views: string[];
  open_questions: string[];
  decided_at: string;
}

// ═══════════════════════════════════════════
// Release Discipline
// ═══════════════════════════════════════════

/** A release candidate prepared for promotion */
export interface ReleaseCandidate {
  id: string;
  version: string;
  from_env: Environment;
  to_env: Environment;
  summary: string;
  changed_modules: string[];
  changed_files_count: number;
  blockers: PromotionBlocker[];
  ready: boolean;
  created_at: string;
  promoted_at?: string;
}

/** A blocker preventing promotion */
export interface PromotionBlocker {
  type: 'test_failure' | 'pending_approval' | 'active_blocker' | 'budget_exceeded' | 'missing_config' | 'manual_hold';
  description: string;
  severity: 'blocking' | 'warning';
  resolvable_by: string;
}

/** Summary of what changed between environments */
export interface PromotionSummary {
  from_env: Environment;
  to_env: Environment;
  from_version: string;
  to_version: string;
  modules_changed: string[];
  capabilities_changed: string[];
  missions_affected: string[];
  release_notes: string;
  blockers: PromotionBlocker[];
  ready: boolean;
}

/** Rollback metadata */
export interface RollbackRecord {
  id: string;
  env: Environment;
  from_version: string;
  to_version: string;
  reason: string;
  rolled_back_at: string;
  rolled_back_by: string;
}

// ═══════════════════════════════════════════
// Multi-Agent Conversation Fabric
// ═══════════════════════════════════════════

/** A structured multi-agent conversation */
export interface BoardConversation {
  id: string;
  task_id: string;
  domain: Domain;
  turns: AgentTurn[];
  critiques: CritiqueRecord[];
  followups: FollowupQuestion[];
  dissents: DissentRecord[];
  synthesis: SynthesisRecord | null;
  status: 'active' | 'synthesized' | 'decided' | 'archived';
  started_at: string;
  completed_at?: string;
}

/** A single agent's turn in a conversation */
export interface AgentTurn {
  turn_id: string;
  agent_id: string;
  agent_name: string;
  provider: Provider | 'external';
  phase: BoardLifecyclePhase;
  input_context: string;
  response: string;
  tokens_used: number;
  cost: number;
  duration_ms: number;
  timestamp: string;
}

/** A critique from one agent about another's output */
export interface CritiqueRecord {
  from_agent: string;
  about_agent: string;
  about_turn: string;
  critique: string;
  severity: 'minor' | 'significant' | 'blocking';
  timestamp: string;
}

/** A follow-up question raised during conversation */
export interface FollowupQuestion {
  raised_by: string;
  question: string;
  directed_to: string | 'operator' | 'any';
  answered: boolean;
  answer?: string;
  timestamp: string;
}

/** A dissenting view from an agent */
export interface DissentRecord {
  agent_id: string;
  agent_name: string;
  dissent: string;
  alternative: string;
  resolved: boolean;
  resolution?: string;
  timestamp: string;
}

/** Synthesis of a multi-agent conversation */
export interface SynthesisRecord {
  synthesized_by: string;
  recommendation: string;
  risk_level: RiskLevel;
  confidence: 'low' | 'medium' | 'high';
  incorporates: string[];
  unresolved: string[];
  timestamp: string;
}

// ═══════════════════════════════════════════
// Architecture Decision Records
// ═══════════════════════════════════════════

/** An Architecture Decision Record */
export interface ArchitectureDecisionRecord {
  id: string;
  title: string;
  status: 'proposed' | 'accepted' | 'deprecated' | 'superseded';
  context: string;
  decision: string;
  consequences: string;
  alternatives: string[];
  related_modules: string[];
  decided_at: string;
  decided_by: string;
}

// ═══════════════════════════════════════════
// Claude Board Participation
// ═══════════════════════════════════════════

/** How Claude participated in a board run */
export type ClaudeParticipation = 'real_cli' | 'api_proxy' | 'skipped' | 'unavailable';

/** Claude board participation record */
export interface ClaudeBoardRecord {
  participation: ClaudeParticipation;
  reason: string;
  cli_available: boolean;
  proxy_used: boolean;
  proxy_provider?: Provider;
}

// ═══════════════════════════════════════════
// Release Operations
// ═══════════════════════════════════════════

/** A commit package ready for review */
export interface CommitPackage {
  id: string;
  message: string;
  files: string[];
  modules_affected: string[];
  missions_affected: string[];
  requires_approval: boolean;
  approved: boolean;
  created_at: string;
}

/** A push candidate */
export interface PushCandidate {
  id: string;
  branch: string;
  commits: GitCommitSummary[];
  remote: string;
  requires_approval: boolean;
  approved: boolean;
  created_at: string;
}

/** Release operation status */
export interface ReleaseOpsStatus {
  git_state: GitState;
  commit_ready: boolean;
  push_ready: boolean;
  promote_ready: boolean;
  current_env: Environment;
  blockers: PromotionBlocker[];
  pending_approvals: number;
  last_commit: GitCommitSummary | null;
  last_release: ReleaseCandidate | null;
}

// ═══════════════════════════════════════════
// Documentation Health
// ═══════════════════════════════════════════

/** Documentation health status */
export interface DocsHealth {
  total_docs: number;
  auto_generated: number;
  adrs: number;
  stale_docs: string[];
  missing_docs: string[];
  last_generated_at: string | null;
  refresh_recommended: boolean;
}

/** Documentation refresh trigger */
export interface DocsRefreshTrigger {
  trigger: 'module_change' | 'capability_change' | 'release' | 'adr_created' | 'manual';
  affected_docs: string[];
  timestamp: string;
}

// ═══════════════════════════════════════════
// Board-First Task Inception
// ═══════════════════════════════════════════

/** Full task inception output — what the board thinks about a new task */
export interface TaskInception {
  task_id: string;
  domain: Domain;
  inception_context: InceptionContext;
  recommendation: InceptionRecommendation;
  routing: InceptionRoutingDecision;
  capability_match: InceptionCapabilityMatch[];
  value_summary: InceptionValueSummary;
  risks: InceptionRisk[];
  created_at: string;
}

/** Fused context used for inception decision */
export interface InceptionContext {
  operator_summary: string;
  mission_summary: string;
  recent_decisions: string[];
  open_questions: string[];
  active_constraints: string[];
  current_blockers: string[];
  agent_availability: Array<{ agent: string; available: boolean; reason?: string }>;
  budget_status: string;
  privacy_restrictions: string[];
}

/** Board's recommendation for how to handle the task */
export interface InceptionRecommendation {
  interpretation: string;
  recommended_path: InceptionRoute;
  reasoning: string;
  expected_value: string;
  preferred_output_shape: string;
  detail_level: 'minimal' | 'standard' | 'detailed';
  confidence: 'low' | 'medium' | 'high';
}

/** Risk identified during inception */
export interface InceptionRisk {
  type: 'technical' | 'privacy' | 'budget' | 'scope' | 'dependency' | 'unknown';
  description: string;
  severity: 'low' | 'medium' | 'high';
  mitigation: string;
}

/** Where to route the task */
export type InceptionRoute =
  | 'direct_answer'
  | 'board_deliberation'
  | 'research_heavy'
  | 'builder_heavy'
  | 'review_report'
  | 'clarification_needed'
  | 'blocked';

/** Routing decision with explanation */
export interface InceptionRoutingDecision {
  route: InceptionRoute;
  reason: string;
  agents_recommended: string[];
  stages_recommended: string[];
  auto_deliberate: boolean;
  requires_operator_input: boolean;
}

/** Capability match for the task */
export interface InceptionCapabilityMatch {
  capability_id: string;
  capability_name: string;
  relevance: 'primary' | 'supporting' | 'optional';
  available: boolean;
  reason?: string;
}

/** What "high value" means for this specific task+operator */
export interface InceptionValueSummary {
  high_value_answer: string;
  low_value_answer: string;
  operator_preference: string;
  key_tradeoffs: string[];
}

// ═══════════════════════════════════════════
// Project Layer Inside Missions
// ═══════════════════════════════════════════

/** A project within a mission — the working unit that holds tasks */
export interface Project {
  project_id: string;
  domain: Domain;
  project_name: string;
  status: 'active' | 'paused' | 'archived' | 'completed';
  objective: string;
  summary: string;
  repo_mappings: string[];
  artifacts: ArtifactRef[];
  decisions: DecisionRecord[];
  open_questions: OpenQuestion[];
  constraints: ConstraintRecord[];
  next_actions: string[];
  known_issues: string[];
  context_summary: string;
  tasks_completed: number;
  tasks_failed: number;
  created_at: string;
  updated_at: string;
}

/** Project context — sharper working memory than mission-level */
export interface ProjectContext {
  project_id: string;
  domain: Domain;
  objective: string;
  recent_decisions: DecisionRecord[];
  open_questions: OpenQuestion[];
  constraints: ConstraintRecord[];
  key_artifacts: ArtifactRef[];
  known_issues: string[];
  next_actions: string[];
  recent_completions: string[];
  context_summary: string;
  updated_at: string;
}

/** Project creation request */
export interface CreateProjectRequest {
  domain: Domain;
  project_name: string;
  objective?: string;
  repo_path?: string;
}

/** Project summary for listing */
export interface ProjectSummary {
  project_id: string;
  domain: Domain;
  project_name: string;
  status: Project['status'];
  objective: string;
  tasks_completed: number;
  has_blockers: boolean;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Engine / Category Layer
// ═══════════════════════════════════════════

/** An engine — the broad work category that contains projects */
export interface Engine {
  engine_id: string;
  domain: Domain;
  display_name: string;
  description: string;
  default_capabilities: string[];
  default_board_roles: string[];
  default_loop_stages: string[];
  common_templates: string[];
  context_patterns: string[];
  created_at: string;
}

/** Engine-level context — broad domain memory */
export interface EngineContext {
  engine_id: string;
  domain: Domain;
  long_term_objective: string;
  recurring_themes: string[];
  cross_project_decisions: DecisionRecord[];
  cross_project_patterns: string[];
  active_projects_summary: string;
  context_summary: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Layered Context
// ═══════════════════════════════════════════

/** Explicitly layered context for board/inception use */
export interface LayeredContext {
  operator: {
    summary: string;
    decision_style: string;
    communication_style: string;
    risk_tolerance: string;
    priorities: string[];
    detail_preference: string;
    correction_patterns: string[];
  };
  engine: {
    domain: Domain;
    display_name: string;
    long_term_objective: string;
    recurring_themes: string[];
    cross_project_decisions: string[];
    context_summary: string;
  };
  project: {
    project_id: string;
    project_name: string;
    objective: string;
    recent_decisions: string[];
    open_questions: string[];
    constraints: string[];
    known_issues: string[];
    next_actions: string[];
    context_summary: string;
  } | null;
  recent: {
    blockers: string[];
    budget_status: string;
    privacy_restrictions: string[];
    agent_availability: Array<{ agent: string; available: boolean }>;
  };
}

/** Compact layered context for prompt injection */
export interface LayeredContextBlock {
  operator_block: string;
  engine_block: string;
  project_block: string;
  recent_block: string;
  combined: string;
}

// ═══════════════════════════════════════════
// Context Enrichment
// ═══════════════════════════════════════════

/** A context enrichment source */
export interface EnrichmentSource {
  id: string;
  name: string;
  type: 'repo_history' | 'artifact_scan' | 'document' | 'thread' | 'channel' | 'manual';
  scope: 'operator' | 'engine' | 'project';
  enabled: boolean;
  last_run_at: string | null;
  schedule?: 'on_demand' | 'daily' | 'weekly';
  privacy_safe: boolean;
}

/** Result of an enrichment run */
export interface EnrichmentResult {
  source_id: string;
  patterns_found: string[];
  decisions_extracted: string[];
  artifacts_found: string[];
  summary: string;
  run_at: string;
}

/** Enrichment job definition — for periodic/on-prem use */
export interface EnrichmentJob {
  id: string;
  name: string;
  type: 'profile_refinement' | 'pattern_extraction' | 'summary_improvement' | 'artifact_clustering' | 'context_quality';
  scope: 'operator' | 'engine' | 'project';
  target_id?: string;
  enabled: boolean;
  schedule: 'on_demand' | 'daily' | 'weekly';
  last_run_at: string | null;
}

/** Operator behavioral/logical profile */
export interface OperatorBehavioralProfile {
  decision_patterns: Array<{ pattern: string; frequency: number; confidence: number }>;
  communication_preferences: Array<{ preference: string; strength: number }>;
  value_priorities: Array<{ priority: string; weight: number }>;
  correction_tendencies: Array<{ tendency: string; frequency: number }>;
  detail_expectations: { default_level: 'minimal' | 'standard' | 'detailed'; varies_by_domain: Record<string, string> };
  updated_at: string;
}

// ═══════════════════════════════════════════
// Enrichment Runtime
// ═══════════════════════════════════════════

/** Status of an enrichment job execution */
export type EnrichmentJobStatus = 'idle' | 'running' | 'completed' | 'failed' | 'skipped';

/** Runtime state for a tracked enrichment job */
export interface EnrichmentJobState {
  job_id: string;
  status: EnrichmentJobStatus;
  last_run_at: string | null;
  last_result: EnrichmentResult | null;
  last_error: string | null;
  next_due_at: string | null;
  run_count: number;
  enabled: boolean;
}

/** Enrichment execution request */
export interface EnrichmentRunRequest {
  job_id: string;
  force: boolean;
  dry_run: boolean;
}

/** Enrichment execution response */
export interface EnrichmentRunResponse {
  job_id: string;
  status: EnrichmentJobStatus;
  result: EnrichmentResult | null;
  error: string | null;
  duration_ms: number;
  privacy_check_passed: boolean;
}

/** Canonical engine identifier mapping */
export interface EngineMapping {
  engine_key: string;
  domain: Domain;
  display_name: string;
  description: string;
}

// ═══════════════════════════════════════════
// Mission Statements
// ═══════════════════════════════════════════

/** Mission statement scope level */
export type MissionStatementLevel = 'operator' | 'engine' | 'project';

/** A mission statement at any level */
export interface MissionStatement {
  id: string;
  level: MissionStatementLevel;
  /** For engine/project level — the domain or project_id */
  scope_id: string;
  statement: string;
  objectives: string[];
  values: string[];
  success_criteria: string[];
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Chief of Staff
// ═══════════════════════════════════════════

/** Priority level for next actions */
export type ActionPriority = 'critical' | 'high' | 'medium' | 'low';

/** A recommended next action from the Chief of Staff */
export interface NextAction {
  id: string;
  title: string;
  why: string;
  priority: ActionPriority;
  level: MissionStatementLevel;
  scope_id: string;
  domain?: Domain;
  mission_alignment: string;
  blocked: boolean;
  blocker_reason?: string;
  needs_approval: boolean;
  suggested_capability?: string;
  suggested_agent?: string;
  estimated_complexity: 'trivial' | 'small' | 'medium' | 'large';
}

/** Chief of Staff brief — the daily/on-demand operator summary */
export interface ChiefOfStaffBrief {
  generated_at: string;
  operator_summary: string;
  top_priorities: NextAction[];
  by_engine: EngineRecommendation[];
  blockers_summary: string[];
  mission_health: MissionHealthCheck[];
  focus_recommendation: string;
}

/** Per-engine recommendation set */
export interface EngineRecommendation {
  domain: Domain;
  engine_name: string;
  mission_statement?: string;
  actions: NextAction[];
  health: 'healthy' | 'needs_attention' | 'blocked' | 'idle';
  summary: string;
}

/** Mission health relative to its statement */
export interface MissionHealthCheck {
  level: MissionStatementLevel;
  scope_id: string;
  label: string;
  statement_snippet: string;
  alignment: 'on_track' | 'drifting' | 'stalled' | 'no_statement';
  reason: string;
}

// ═══════════════════════════════════════════
// Memory / Document Viewer
// ═══════════════════════════════════════════

/** A viewable document in the memory viewer */
export interface MemoryDocument {
  id: string;
  category: 'operator_profile' | 'engine_context' | 'project_context' | 'decision' | 'artifact' | 'report' | 'mission_statement' | 'board_exchange';
  title: string;
  domain?: Domain;
  summary: string;
  content: string;
  source_path?: string;
  created_at: string;
}

/** Full memory viewer payload for the UI */
export interface MemoryViewerData {
  operator: MemoryDocument[];
  engines: Record<Domain, MemoryDocument[]>;
  projects: MemoryDocument[];
  decisions: MemoryDocument[];
  artifacts: MemoryDocument[];
  reports: MemoryDocument[];
  mission_statements: MemoryDocument[];
  total_count: number;
}

// ═══════════════════════════════════════════
// Execution Graph
// ═══════════════════════════════════════════

/** Execution graph status */
export type GraphStatus = 'draft' | 'ready' | 'executing' | 'paused' | 'completed' | 'failed' | 'canceled';

/** Execution node status */
export type NodeStatus = 'pending' | 'ready' | 'running' | 'waiting_gate' | 'completed' | 'failed' | 'skipped' | 'canceled';

/** Execution mode for a graph or node group */
export type ExecutionMode = 'sequential' | 'parallel' | 'mixed';

/** Environment lane for execution */
export type Lane = 'dev' | 'beta' | 'prod';

/** An execution graph for a board-routed task */
export interface ExecutionGraph {
  graph_id: string;
  task_id: string;
  domain: Domain;
  project_id?: string;
  lane: Lane;
  status: GraphStatus;
  execution_mode: ExecutionMode;
  title: string;
  board_rationale: string;
  chief_of_staff_plan: string;
  nodes: string[];           // ExecutionNode IDs in order
  approval_gates: string[];  // ApprovalGate IDs
  review_contracts: string[];// ReviewContract IDs
  dossier_id?: string;       // PromotionDossier ID once generated
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

/** A single node in an execution graph */
export interface ExecutionNode {
  node_id: string;
  graph_id: string;
  subtask_id?: string;       // links to existing subtask if applicable
  title: string;
  description: string;
  stage: SubtaskStage;
  assigned_agent: string;
  execution_mode: ExecutionMode;
  depends_on: string[];      // other node IDs
  status: NodeStatus;
  risk_level: RiskLevel;
  output_summary?: string;
  error?: string;
  gate_ids: string[];        // gates that must pass before/after this node
  created_at: string;
  updated_at: string;
  completed_at?: string;
}

// ═══════════════════════════════════════════
// Approval Gates
// ═══════════════════════════════════════════

/** Gate types that can block execution */
export type GateType = 'operator' | 'board_recheck' | 'privacy_policy' | 'mission_alignment' | 'release';

/** Gate status */
export type GateStatus = 'pending' | 'approved' | 'rejected' | 'waived';

/** An approval gate attached to a graph or node */
export interface ApprovalGate {
  gate_id: string;
  graph_id: string;
  node_id?: string;          // if scoped to a specific node
  gate_type: GateType;
  title: string;
  description: string;
  blocking: boolean;         // if true, execution stops until resolved
  lane: Lane;
  status: GateStatus;
  resolved_by?: string;
  resolved_at?: string;
  resolution_notes?: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Review Contracts
// ═══════════════════════════════════════════

/** Review contract types */
export type ReviewType = 'architecture' | 'mission_alignment' | 'privacy_policy' | 'quality' | 'provider_disagreement' | 'release_readiness';

/** Review result verdict */
export type ReviewVerdict = 'pass' | 'fail' | 'waive';

/** A checklist item within a review */
export interface ReviewChecklistItem {
  item_id: string;
  label: string;
  checked: boolean;
  note?: string;
}

/** A review contract attached to a graph */
export interface ReviewContract {
  review_id: string;
  graph_id: string;
  review_type: ReviewType;
  title: string;
  description: string;
  checklist: ReviewChecklistItem[];
  verdict?: ReviewVerdict;
  reviewer?: string;
  review_notes?: string;
  completed_at?: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Promotion Dossiers
// ═══════════════════════════════════════════

/** Promotion recommendation */
export type PromotionRecommendation = 'promote' | 'hold' | 'rework';

/** A promotion dossier generated from a completed execution graph */
export interface PromotionDossier {
  dossier_id: string;
  graph_id: string;
  task_id: string;
  domain: Domain;
  lane: Lane;
  title: string;
  task_summary: string;
  board_rationale: string;
  chief_of_staff_plan: string;
  outputs_summary: string;
  review_results: DossierReviewResult[];
  risks: string[];
  unresolved_items: string[];
  mission_alignment_summary: string;
  privacy_summary: string;
  confidence_score: number;    // 0-100
  recommendation: PromotionRecommendation;
  promoted_at?: string;
  created_at: string;
}

/** Review result summary within a dossier */
export interface DossierReviewResult {
  review_type: ReviewType;
  verdict: ReviewVerdict;
  summary: string;
  checklist_passed: number;
  checklist_total: number;
}

// ═══════════════════════════════════════════
// Agent Envelopes — Structured handoff contracts
// ═══════════════════════════════════════════

/** Envelope wrapping work sent to an agent for execution */
export interface AgentExecutionEnvelope {
  envelope_id: string;
  graph_id: string;
  node_id: string;
  agent_id: string;
  task_context: string;
  execution_instructions: string;
  constraints: string[];
  expected_output_type: string;
  privacy_scope: 'instance' | 'mission' | 'task';
  created_at: string;
}

/** Envelope for agent-to-agent handoff */
export interface AgentHandoffEnvelope {
  handoff_id: string;
  from_agent: string;
  to_agent: string;
  graph_id: string;
  from_node_id: string;
  to_node_id: string;
  context_summary: string;
  artifacts_passed: string[];
  handoff_reason: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Provider Capability Registry
// ═══════════════════════════════════════════

/** Task kind for provider fit matching */
export type TaskKind = 'code' | 'research' | 'strategy' | 'creative' | 'analysis' | 'review' | 'general';

/** Fit promotion state */
export type FitState = 'experimental' | 'promoted' | 'deprecated';

/** Global provider capability profile */
export interface ProviderCapabilityProfile {
  provider_id: Provider;
  display_name: string;
  strengths: string[];
  weaknesses: string[];
  best_roles: AgentRole[];
  best_task_kinds: TaskKind[];
  privacy_class: 'local' | 'api_external';
  supports_code_execution: boolean;
  supports_file_access: boolean;
  max_context_tokens: number;
  cost_tier: 'free' | 'low' | 'medium' | 'high';
  updated_at: string;
}

/** Scoped provider fit — learned effectiveness at operator/engine/project level */
export interface ScopedProviderFit {
  fit_id: string;
  provider_id: Provider;
  role: AgentRole;
  task_kind: TaskKind;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  fit_score: number;         // 0-100
  confidence: number;        // 0-100 (rises with evidence)
  evidence_runs: number;
  success_runs: number;
  failure_runs: number;
  state: FitState;
  notes: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Collaboration Contracts
// ═══════════════════════════════════════════

/** A collaboration contract governing multi-agent handoffs */
export interface CollaborationContract {
  contract_id: string;
  title: string;
  description: string;
  from_role: AgentRole;
  to_role: AgentRole;
  allowed_pairs: ProviderPair[];
  required_handoff_fields: string[];
  escalation_triggers: string[];
  requires_reviewer: boolean;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/** An allowed provider pairing within a contract */
export interface ProviderPair {
  from_provider: Provider;
  to_provider: Provider;
  preferred: boolean;
}

/** A persisted execution handoff record */
export interface ExecutionHandoffRecord {
  handoff_id: string;
  graph_id: string;
  contract_id?: string;
  from_node_id: string;
  to_node_id: string;
  from_provider: Provider;
  to_provider: Provider;
  from_role: AgentRole;
  to_role: AgentRole;
  summary: string;
  artifacts: string[];
  open_questions: string[];
  confidence: number;        // 0-100
  accepted: boolean | null;
  created_at: string;
}

// ═══════════════════════════════════════════
// Prompt Recipes
// ═══════════════════════════════════════════

/** A reusable prompt recipe for a provider+role+task combination */
export interface PromptRecipe {
  recipe_id: string;
  provider_id: Provider;
  role: AgentRole;
  task_kind: TaskKind;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  title: string;
  template: string;
  context_keys: string[];
  success_rate: number;      // 0-100
  uses: number;
  state: FitState;
  source_graph_id?: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Reverse Prompting
// ═══════════════════════════════════════════

/** A reverse prompting run — analyzes a completed graph for learnings */
export interface ReversePromptingRun {
  run_id: string;
  graph_id: string;
  task_id: string;
  domain: Domain;
  success_factors: string[];
  failure_factors: string[];
  anti_patterns: string[];
  recipe_candidates: PromptRecipeCandidate[];
  fit_updates: FitUpdateRecommendation[];
  created_at: string;
}

/** Candidate prompt recipe from reverse prompting */
export interface PromptRecipeCandidate {
  provider_id: Provider;
  role: AgentRole;
  task_kind: TaskKind;
  template_sketch: string;
  rationale: string;
}

/** Recommendation to update a provider fit score */
export interface FitUpdateRecommendation {
  provider_id: Provider;
  role: AgentRole;
  task_kind: TaskKind;
  current_score: number;
  recommended_score: number;
  evidence: string;
}

// ═══════════════════════════════════════════
// Operator Preference Policies
// ═══════════════════════════════════════════

/** Policy areas the operator can configure */
export type PolicyArea =
  | 'execution_style'
  | 'review_strictness'
  | 'documentation_strictness'
  | 'provider_override_mode'
  | 'interruption_mode'
  | 'learning_promotion_mode'
  | 'board_recheck_bias';

/** Policy value — typed per area */
export type PolicyValue = 'permissive' | 'balanced' | 'strict' | 'off' | 'on' | 'advisory' | 'enforced';

/** An operator preference policy at any scope */
export interface OperatorPreferencePolicy {
  policy_id: string;
  area: PolicyArea;
  value: PolicyValue;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  enabled: boolean;
  rationale: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Autonomy Budgets
// ═══════════════════════════════════════════

/** An autonomy budget controlling what the system can do without operator intervention */
export interface AutonomyBudget {
  budget_id: string;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  lane: Lane;
  allowed_actions: string[];
  blocked_actions: string[];
  required_escalations: string[];
  auto_execute_green: boolean;
  auto_execute_yellow: boolean;
  auto_promote_experimental: boolean;
  auto_learn_from_evidence: boolean;
  max_retries: number;
  max_daily_cost_usd: number;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Escalation Governance
// ═══════════════════════════════════════════

/** Trigger conditions for escalation */
export type EscalationTrigger =
  | 'low_confidence'
  | 'review_conflict'
  | 'handoff_quality'
  | 'privacy_risk'
  | 'mission_conflict'
  | 'documentation_gap'
  | 'provider_mismatch'
  | 'retry_exhaustion'
  | 'promotion_attempt';

/** Actions the system takes on escalation */
export type EscalationAction =
  | 'notify_operator'
  | 'require_operator_approval'
  | 'board_reopen'
  | 'require_second_provider_review'
  | 'pause_execution'
  | 'downgrade_to_advisory';

/** An escalation rule */
export interface EscalationRule {
  rule_id: string;
  trigger: EscalationTrigger;
  action: EscalationAction;
  threshold?: number;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  enabled: boolean;
  description: string;
  created_at: string;
  updated_at: string;
}

/** A recorded escalation event */
export interface EscalationEvent {
  event_id: string;
  rule_id: string;
  trigger: EscalationTrigger;
  action: EscalationAction;
  graph_id?: string;
  node_id?: string;
  detail: string;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Documentation Governance
// ═══════════════════════════════════════════

/** Scope types for documentation requirements */
export type DocScopeType = 'architecture_part' | 'execution_graph' | 'promotion' | 'release';

/** Lane-aware blocking behavior */
export type DocBlockLevel = 'warn' | 'soft_block' | 'hard_block';

/** A documentation requirement */
export interface DocumentationRequirement {
  req_id: string;
  scope_type: DocScopeType;
  title: string;
  description: string;
  required_artifacts: string[];
  lane_behavior: Record<Lane, DocBlockLevel>;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/** A documentation artifact linked to a requirement */
export interface DocumentationArtifact {
  artifact_id: string;
  req_id?: string;
  scope_type: DocScopeType;
  related_id: string;
  title: string;
  path: string;
  status: 'draft' | 'complete' | 'outdated';
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Policy Simulation
// ═══════════════════════════════════════════

/** What kind of entity is being simulated */
export type SimulationScope = 'graph' | 'dossier' | 'release';

/** Overrides for a simulation scenario */
export interface SimulationOverrides {
  lane?: Lane;
  policies?: Partial<Record<PolicyArea, PolicyValue>>;
  auto_execute_green?: boolean;
  auto_execute_yellow?: boolean;
  max_retries?: number;
  documentation_present?: string[];
  documentation_missing?: string[];
  review_verdicts?: Record<string, ReviewVerdict>;
  provider_confidence?: number;
}

/** A simulation scenario */
export interface SimulationScenario {
  scenario_id: string;
  related_type: SimulationScope;
  related_id: string;
  lane: Lane;
  overrides: SimulationOverrides;
  created_at: string;
}

/** Result of running a simulation */
export interface SimulationResult {
  result_id: string;
  scenario_id: string;
  related_type: SimulationScope;
  related_id: string;
  lane: Lane;
  outcome: 'pass' | 'warn' | 'block';
  policy_violations: string[];
  budget_violations: string[];
  escalation_triggers: string[];
  missing_docs: string[];
  blocked_actions: string[];
  warnings: string[];
  summary: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Governance Testing
// ═══════════════════════════════════════════

/** A reusable governance test case */
export interface GovernanceTestCase {
  test_id: string;
  title: string;
  description: string;
  related_type: SimulationScope;
  related_id: string;
  scenario: SimulationOverrides;
  expected_outcome: 'pass' | 'warn' | 'block';
  actual_outcome?: 'pass' | 'warn' | 'block';
  passed?: boolean;
  last_run_at?: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Release Readiness
// ═══════════════════════════════════════════

/** Readiness recommendation */
export type ReadinessRecommendation = 'not_ready' | 'conditional' | 'ready';

/** A readiness rule contributing to the score */
export interface ReadinessRule {
  rule_id: string;
  category: string;
  title: string;
  weight: number;
  check_fn: string;
  enabled: boolean;
}

/** Release readiness score for a graph/dossier/release */
export interface ReleaseReadinessScore {
  score_id: string;
  related_type: SimulationScope;
  related_id: string;
  overall_score: number;
  category_scores: Record<string, { score: number; max: number; details: string }>;
  blockers: string[];
  warnings: string[];
  recommendation: ReadinessRecommendation;
  created_at: string;
}

// ═══════════════════════════════════════════
// Enforcement Engine
// ═══════════════════════════════════════════

/** Enforcement severity levels */
export type EnforcementLevel = 'allow' | 'warn' | 'soft_block' | 'hard_block' | 'override_required';

/** Actions that the enforcement engine evaluates */
export type EnforcementAction =
  | 'create_graph' | 'start_execution' | 'advance_node'
  | 'complete_review' | 'generate_dossier'
  | 'promote_to_beta' | 'promote_to_prod' | 'release';

/** An enforcement decision for a specific action */
export interface EnforcementDecision {
  decision_id: string;
  related_type: SimulationScope;
  related_id: string;
  action: EnforcementAction;
  lane: Lane;
  level: EnforcementLevel;
  reasons: string[];
  blockers: string[];
  warnings: string[];
  required_override_types: OverrideType[];
  triggered_rule_ids: string[];
  created_at: string;
}

/** A named enforcement rule */
export interface EnforcementRule {
  rule_id: string;
  action: EnforcementAction;
  condition: string;
  level: EnforcementLevel;
  description: string;
  enabled: boolean;
}

// ═══════════════════════════════════════════
// Override Ledger
// ═══════════════════════════════════════════

/** Override types that can be requested */
export type OverrideType =
  | 'promotion_block' | 'documentation_gap' | 'readiness_shortfall'
  | 'review_failure' | 'escalation_conflict' | 'provider_instability'
  | 'experimental_dependency';

/** Override request status */
export type OverrideStatus = 'pending' | 'approved' | 'rejected' | 'expired' | 'consumed';

/** An override entry in the ledger */
export interface OverrideEntry {
  override_id: string;
  related_type: SimulationScope;
  related_id: string;
  action: EnforcementAction;
  override_type: OverrideType;
  reason: string;
  notes: string;
  status: OverrideStatus;
  requested_by: string;
  resolved_by?: string;
  resolved_at?: string;
  expires_at?: string;
  remediation_items: string[];
  created_at: string;
}

// ═══════════════════════════════════════════
// Promotion Control
// ═══════════════════════════════════════════

/** Promotion decision result */
export type PromotionControlResult = 'allowed' | 'allowed_with_override' | 'blocked';

/** A promotion decision record */
export interface PromotionDecision {
  decision_id: string;
  dossier_id: string;
  target_lane: Lane;
  result: PromotionControlResult;
  enforcement_level: EnforcementLevel;
  readiness_score?: number;
  blockers: string[];
  overrides_used: string[];
  decided_at: string;
}

/** Promotion policy with lane-specific thresholds */
export interface PromotionPolicy {
  policy_id: string;
  target_lane: Lane;
  min_readiness_score: number;
  require_all_reviews_passed: boolean;
  require_documentation_complete: boolean;
  require_no_open_escalations: boolean;
  allow_override: boolean;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Exception Analytics
// ═══════════════════════════════════════════

/** A governance exception event */
export interface ExceptionEvent {
  event_id: string;
  category: 'override' | 'enforcement_block' | 'promotion_block' | 'simulation_failure' | 'readiness_shortfall' | 'escalation' | 'review_failure';
  severity: 'low' | 'medium' | 'high' | 'critical';
  lane?: Lane;
  domain?: Domain;
  project_id?: string;
  provider_id?: Provider;
  action?: EnforcementAction;
  blocker_type?: string;
  override_type?: OverrideType;
  detail: string;
  source_id: string;
  created_at: string;
}

/** Aggregated exception statistics */
export interface ExceptionAggregate {
  scope: string;
  total: number;
  by_category: Record<string, number>;
  by_severity: Record<string, number>;
  by_lane: Record<string, number>;
  by_domain: Record<string, number>;
  by_provider: Record<string, number>;
  hotspots: string[];
  trends: string[];
  window_start: string;
  window_end: string;
}

// ═══════════════════════════════════════════
// Governance Drift Detection
// ═══════════════════════════════════════════

/** A drift signal — mismatch between policy and behavior */
export interface DriftSignal {
  signal_id: string;
  category: string;
  severity: 'low' | 'medium' | 'high';
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  description: string;
  evidence_count: number;
  first_seen: string;
  last_seen: string;
}

/** A grouped drift report */
export interface DriftReport {
  report_id: string;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  signals: DriftSignal[];
  summary: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Adaptive Policy Tuning
// ═══════════════════════════════════════════

/** Tuning action types */
export type TuningAction = 'tighten' | 'loosen' | 'add' | 'deprecate' | 'rescope';

/** Tuning target types */
export type TuningTarget = 'operator_policy' | 'autonomy_budget' | 'escalation_rule' | 'documentation_requirement' | 'promotion_policy' | 'enforcement_rule' | 'provider_fit';

/** A policy tuning recommendation */
export interface PolicyTuningRecommendation {
  rec_id: string;
  target: TuningTarget;
  action: TuningAction;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  title: string;
  rationale: string;
  expected_impact: string;
  risk: 'low' | 'medium' | 'high';
  evidence_ids: string[];
  evidence_count: number;
  status: 'pending' | 'approved' | 'rejected' | 'applied';
  created_at: string;
}

/** A tuning decision record */
export interface TuningDecision {
  decision_id: string;
  rec_id: string;
  action: 'approve' | 'reject' | 'apply';
  decided_by: string;
  notes: string;
  decided_at: string;
}

/** Governance health snapshot */
export interface GovernanceHealthSnapshot {
  snapshot_id: string;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  exception_count: number;
  drift_signal_count: number;
  pending_tuning_count: number;
  override_rate: number;
  enforcement_block_rate: number;
  health: 'healthy' | 'drifting' | 'degraded' | 'critical';
  summary: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Governance Operations Console
// ═══════════════════════════════════════════

/** Governance hotspot */
export interface GovernanceHotspot {
  scope: string;
  category: string;
  count: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'rising' | 'stable' | 'falling';
  detail: string;
}

/** Governance trend point */
export interface GovernanceTrendPoint {
  date: string;
  exceptions: number;
  drift_signals: number;
  overrides: number;
  blocks: number;
  health: string;
}

/** Governance ops filter */
export interface GovernanceOpsFilter {
  filter_id: string;
  name: string;
  lane?: Lane;
  domain?: Domain;
  project_id?: string;
  provider_id?: Provider;
  severity?: string;
  category?: string;
  time_window_days: number;
  created_at: string;
}

/** Governance watchlist entry */
export interface GovernanceWatchlistEntry {
  entry_id: string;
  scope: string;
  reason: string;
  active: boolean;
  created_at: string;
}

/** Unified governance ops view */
export interface GovernanceOpsView {
  health: GovernanceHealthSnapshot;
  hotspots: GovernanceHotspot[];
  pending_resolutions: number;
  pending_tuning: number;
  pending_overrides: number;
  unresolved_escalations: number;
  trends: GovernanceTrendPoint[];
  watchlist: GovernanceWatchlistEntry[];
}

// ═══════════════════════════════════════════
// Scoped Drift Resolution
// ═══════════════════════════════════════════

/** Actions for resolving drift */
export type ResolutionAction =
  | 'adjust_policy' | 'adjust_budget' | 'adjust_escalation'
  | 'adjust_doc_requirement' | 'adjust_promotion_policy'
  | 'adjust_enforcement_rule' | 'adjust_provider_fit'
  | 'require_review' | 'require_board_recheck' | 'monitor_only';

/** Resolution lifecycle */
export type ResolutionStatus = 'open' | 'approved' | 'applied' | 'verified' | 'closed' | 'rejected';

/** Scoped drift resolution */
export interface ScopedDriftResolution {
  resolution_id: string;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  drift_signal_ids: string[];
  root_cause: string;
  impacted_rules: string[];
  proposed_actions: ResolutionAction[];
  risk: 'low' | 'medium' | 'high';
  urgency: 'low' | 'medium' | 'high';
  evidence_ids: string[];
  owner: string;
  status: ResolutionStatus;
  verification_notes?: string;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Tuning Application Engine
// ═══════════════════════════════════════════

/** Plan for applying a tuning recommendation */
export interface TuningApplicationPlan {
  plan_id: string;
  rec_id: string;
  target: TuningTarget;
  action: TuningAction;
  scope: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  change_summary: string;
  risk: 'low' | 'medium' | 'high';
  dry_run: boolean;
  created_at: string;
}

/** Result of applying a tuning plan */
export interface TuningApplicationResult {
  result_id: string;
  plan_id: string;
  rec_id: string;
  applied: boolean;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  change_summary: string;
  approver: string;
  evidence_ids: string[];
  rollback_id?: string;
  created_at: string;
}

/** Rollback record for a tuning application */
export interface TuningRollback {
  rollback_id: string;
  result_id: string;
  plan_id: string;
  before_state: Record<string, unknown>;
  rolled_back_at?: string;
  status: 'available' | 'executed' | 'expired';
  created_at: string;
}

// ═══════════════════════════════════════════
// Runtime Enforcement
// ═══════════════════════════════════════════

/** Hook transition points */
export type HookTransition = 'graph_create' | 'node_queue' | 'node_start' | 'node_complete' | 'review_complete' | 'dossier_generate' | 'promotion_attempt';

/** Runtime enforcement hook outcome */
export type HookOutcome = 'proceed' | 'proceed_with_warning' | 'block' | 'require_override' | 'pause_for_escalation';

/** A runtime enforcement hook definition */
export interface RuntimeEnforcementHook {
  hook_id: string;
  transition: HookTransition;
  graph_id: string;
  enabled: boolean;
  created_at: string;
}

/** Result of executing a hook */
export interface HookExecutionResult {
  result_id: string;
  hook_id: string;
  transition: HookTransition;
  graph_id: string;
  node_id?: string;
  outcome: HookOutcome;
  enforcement_level: EnforcementLevel;
  reasons: string[];
  warnings: string[];
  blockers: string[];
  created_at: string;
}

/** Worker governance decision */
export interface WorkerGovernanceDecision {
  decision_id: string;
  graph_id: string;
  node_id?: string;
  action: string;
  outcome: HookOutcome;
  retry_allowed: boolean;
  max_retries_remaining: number;
  reasons: string[];
  created_at: string;
}

/** A record of execution being blocked at runtime */
export interface ExecutionBlockRecord {
  block_id: string;
  graph_id: string;
  node_id?: string;
  transition: HookTransition;
  reason: string;
  enforcement_level: EnforcementLevel;
  lane: Lane;
  domain?: Domain;
  project_id?: string;
  resolved: boolean;
  resolved_at?: string;
  created_at: string;
}

/** A runtime governance event for audit */
export interface RuntimeGovernanceEvent {
  event_id: string;
  transition: HookTransition;
  graph_id: string;
  node_id?: string;
  outcome: HookOutcome;
  detail: string;
  lane?: Lane;
  domain?: Domain;
  created_at: string;
}

/** Summary of runtime enforcement state */
export interface RuntimeEnforcementSummary {
  total_hooks: number;
  total_blocks: number;
  total_warnings: number;
  total_pauses: number;
  active_blocks: number;
  by_transition: Record<string, number>;
  by_lane: Record<string, number>;
  created_at: string;
}

// ═══════════════════════════════════════════
// Override Operations + Exception Lifecycle
// ═══════════════════════════════════════════

/** Exception lifecycle stages */
export type ExceptionLifecycleStage =
  | 'opened' | 'triaged' | 'assigned' | 'approved' | 'rejected'
  | 'in_remediation' | 'resolved' | 'verified' | 'expired' | 'consumed' | 'closed';

/** An exception case linking enforcement, overrides, blocks, and escalation */
export interface ExceptionCase {
  case_id: string;
  source_type: 'enforcement' | 'override' | 'runtime_block' | 'escalation' | 'promotion_block';
  source_id: string;
  title: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  stage: ExceptionLifecycleStage;
  owner?: string;
  due_date?: string;
  graph_id?: string;
  node_id?: string;
  dossier_id?: string;
  domain?: Domain;
  project_id?: string;
  lane?: Lane;
  linked_override_ids: string[];
  linked_block_ids: string[];
  linked_escalation_ids: string[];
  remediation_notes: string;
  resolution_outcome?: 'fixed' | 'accepted' | 'deferred' | 'wont_fix';
  created_at: string;
  updated_at: string;
}

/** A block resolution record */
export interface BlockResolutionRecord {
  resolution_id: string;
  block_id: string;
  graph_id: string;
  node_id?: string;
  outcome: 'resolved' | 'unresolved' | 'override_cleared';
  override_id?: string;
  notes: string;
  created_at: string;
}

/** Override consumption record */
export interface OverrideConsumptionRecord {
  consumption_id: string;
  override_id: string;
  decision_id: string;
  graph_id?: string;
  consumed_at: string;
}

/** Escalation pause record */
export interface EscalationPauseRecord {
  pause_id: string;
  graph_id: string;
  node_id?: string;
  escalation_event_id: string;
  reason: string;
  status: 'paused' | 'resumed' | 'resolved';
  resumed_at?: string;
  created_at: string;
}

/** Override operations view */
export interface OverrideOperationsView {
  pending: number;
  approved: number;
  rejected: number;
  expired: number;
  consumed: number;
  stale: number;
  total: number;
  by_type: Record<string, number>;
  by_lane: Record<string, number>;
  hotspots: string[];
}

// ═══════════════════════════════════════════
// Cross-Project Governance Isolation
// ═══════════════════════════════════════════

/** Cross-project access decision outcome */
export type CrossProjectAccessOutcome = 'allow' | 'deny' | 'allow_redacted' | 'require_operator_approval';

/** Artifact types subject to isolation */
export type IsolatedArtifactType = 'context' | 'governance' | 'override' | 'exception' | 'tuning' | 'provider_fit' | 'execution' | 'promotion' | 'pattern';

/** Project isolation policy */
export interface ProjectIsolationPolicy {
  policy_id: string;
  project_id: string;
  domain: Domain;
  default_access: CrossProjectAccessOutcome;
  allowed_targets: string[];
  denied_targets: string[];
  redact_fields: string[];
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

/** Isolation boundary between two projects */
export interface IsolationBoundary {
  boundary_id: string;
  source_project: string;
  target_project: string;
  artifact_type: IsolatedArtifactType;
  access: CrossProjectAccessOutcome;
  reason: string;
  created_at: string;
}

/** Cross-project access decision record */
export interface CrossProjectAccessDecision {
  decision_id: string;
  source_project: string;
  target_project: string;
  artifact_type: IsolatedArtifactType;
  action: string;
  outcome: CrossProjectAccessOutcome;
  reason: string;
  created_at: string;
}

/** Isolation violation record */
export interface IsolationViolationRecord {
  violation_id: string;
  source_project: string;
  target_project: string;
  artifact_type: IsolatedArtifactType;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  created_at: string;
}

// ═══════════════════════════════════════════
// Shared Pattern Exchange
// ═══════════════════════════════════════════

/** Pattern scope levels */
export type PatternScope = 'project_private' | 'engine_shared' | 'operator_global';

/** Pattern candidate types */
export type PatternCandidateType = 'prompt_recipe' | 'provider_heuristic' | 'escalation_lesson' | 'governance_mitigation' | 'documentation_template' | 'tuning_lesson';

/** A candidate pattern for sharing */
export interface PatternExchangeCandidate {
  candidate_id: string;
  source_project: string;
  source_domain: Domain;
  candidate_type: PatternCandidateType;
  title: string;
  content: string;
  redacted_content: string;
  artifact_ref: string;
  status: 'pending' | 'approved' | 'rejected' | 'promoted';
  target_scope: PatternScope;
  created_at: string;
}

/** A shared pattern available across projects */
export interface SharedPattern {
  pattern_id: string;
  candidate_id: string;
  pattern_type: PatternCandidateType;
  title: string;
  content: string;
  scope: PatternScope;
  source_domain: Domain;
  uses: number;
  state: FitState;
  created_at: string;
  updated_at: string;
}

/** Usage record for a shared pattern */
export interface SharedPatternUsageRecord {
  usage_id: string;
  pattern_id: string;
  project_id: string;
  context: string;
  created_at: string;
}

/** Redaction rule for pattern sanitization */
export interface PatternRedactionRule {
  rule_id: string;
  pattern: string;
  replacement: string;
  scope: 'global' | 'engine' | 'project';
  enabled: boolean;
}

/** Promotion policy for patterns */
export interface PatternPromotionPolicy {
  min_uses: number;
  require_approval: boolean;
  auto_promote_threshold: number;
}

// ═══════════════════════════════════════════
// Provider Reliability
// ═══════════════════════════════════════════

/** Provider health classification */
export type ProviderHealthState = 'healthy' | 'watch' | 'degraded' | 'unstable';

/** Provider reliability metrics */
export interface ProviderReliabilityMetric {
  success_count: number;
  failure_count: number;
  retry_count: number;
  override_linked_count: number;
  escalation_linked_count: number;
  review_failure_correlation: number;
  promotion_block_correlation: number;
  incident_count: number;
}

/** Provider reliability snapshot */
export interface ProviderReliabilitySnapshot {
  snapshot_id: string;
  provider_id: Provider;
  health: ProviderHealthState;
  success_rate: number;
  metrics: ProviderReliabilityMetric;
  window_days: number;
  created_at: string;
}

/** A provider incident record */
export interface ProviderIncident {
  incident_id: string;
  provider_id: Provider;
  incident_type: 'repeated_failure' | 'latency_spike' | 'governance_issue' | 'cost_spike' | 'reliability_drop';
  severity: 'low' | 'medium' | 'high' | 'critical';
  detail: string;
  domain?: Domain;
  project_id?: string;
  resolved: boolean;
  created_at: string;
}

// ═══════════════════════════════════════════
// Cost Governance
// ═══════════════════════════════════════════

/** Cost decision outcome */
export type CostDecisionOutcome = 'allow' | 'warn' | 'soft_block' | 'hard_block' | 'fallback_required';

/** Provider cost profile */
export interface ProviderCostProfile {
  provider_id: Provider;
  cost_per_1k_input: number;
  cost_per_1k_output: number;
  cost_tier: 'free' | 'low' | 'medium' | 'high';
  updated_at: string;
}

/** Cost governance decision */
export interface ProviderCostDecision {
  decision_id: string;
  provider_id: Provider;
  action: string;
  lane: Lane;
  estimated_cost: number;
  budget_remaining: number;
  outcome: CostDecisionOutcome;
  reason: string;
  created_at: string;
}

/** Budget window for cost tracking */
export interface ProviderBudgetWindow {
  window_id: string;
  lane: Lane;
  domain?: Domain;
  project_id?: string;
  daily_limit: number;
  spent_today: number;
  period_start: string;
}

// ═══════════════════════════════════════════
// Latency Governance
// ═══════════════════════════════════════════

/** Latency classification */
export type LatencyClass = 'fast' | 'acceptable' | 'slow' | 'degraded';

/** Latency decision outcome */
export type LatencyDecisionOutcome = 'proceed' | 'warn' | 'reroute' | 'fallback' | 'block';

/** Provider latency profile */
export interface ProviderLatencyProfile {
  provider_id: Provider;
  avg_latency_ms: number;
  p95_latency_ms: number;
  recent_samples: number;
  classification: LatencyClass;
  updated_at: string;
}

/** Latency governance decision */
export interface ProviderLatencyDecision {
  decision_id: string;
  provider_id: Provider;
  role: AgentRole;
  lane: Lane;
  current_latency_ms: number;
  threshold_ms: number;
  outcome: LatencyDecisionOutcome;
  reason: string;
  created_at: string;
}

/** Provider routing constraint */
export interface ProviderRoutingConstraint {
  provider_id: Provider;
  reliability_ok: boolean;
  cost_ok: boolean;
  latency_ok: boolean;
  overall: 'clear' | 'constrained' | 'blocked';
  fallback_provider?: Provider;
}

/** Provider governance summary */
export interface ProviderGovernanceSummary {
  provider_id: Provider;
  reliability: ProviderHealthState;
  cost_tier: string;
  latency_class: LatencyClass;
  routing: ProviderRoutingConstraint;
  incidents: number;
  created_at: string;
}

/** Provider fallback decision */
export interface ProviderFallbackDecision {
  decision_id: string;
  original_provider: Provider;
  fallback_provider: Provider;
  reason: string;
  trigger: 'reliability' | 'cost' | 'latency';
  created_at: string;
}

// ═══════════════════════════════════════════
// Artifact Registry
// ═══════════════════════════════════════════

/** Artifact type classification */
export type ArtifactType =
  | 'board_decision' | 'work_order' | 'execution_graph' | 'execution_node'
  | 'approval_gate' | 'review_contract' | 'promotion_dossier'
  | 'simulation_result' | 'readiness_score' | 'enforcement_decision'
  | 'override_entry' | 'exception_case' | 'tuning_recommendation'
  | 'tuning_application' | 'shared_pattern' | 'provider_incident'
  | 'documentation_artifact' | 'drift_resolution' | 'block_resolution'
  | 'cost_decision' | 'latency_decision' | 'reliability_snapshot';

/** Artifact scope */
export interface ArtifactScope {
  lane?: Lane;
  domain?: Domain;
  project_id?: string;
  isolation_level: 'public' | 'engine' | 'project';
}

/** A registered artifact in the system */
export interface RegisteredArtifact {
  artifact_id: string;
  source_id: string;
  type: ArtifactType;
  scope: ArtifactScope;
  related_task_id?: string;
  related_graph_id?: string;
  related_node_id?: string;
  related_dossier_id?: string;
  producer: string;
  title: string;
  retention: 'active' | 'archived' | 'expired';
  integrity: 'valid' | 'stale' | 'superseded';
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Evidence Chain
// ═══════════════════════════════════════════

/** Relationship type between evidence nodes */
export type EvidenceRelation = 'produced_by' | 'contributed_to' | 'blocked_by' | 'cleared_by' | 'influenced' | 'superseded';

/** An evidence node referencing a registered artifact */
export interface EvidenceNode {
  node_id: string;
  artifact_id: string;
  artifact_type: ArtifactType;
  title: string;
}

/** An edge between evidence nodes */
export interface EvidenceEdge {
  edge_id: string;
  source_id: string;
  target_id: string;
  relation: EvidenceRelation;
  notes: string;
  created_at: string;
}

/** A bundle of evidence for a decision point */
export interface EvidenceBundle {
  bundle_id: string;
  related_type: string;
  related_id: string;
  nodes: EvidenceNode[];
  edges: EvidenceEdge[];
  summary: string;
  created_at: string;
}

/** Lineage summary for an artifact */
export interface LineageSummary {
  artifact_id: string;
  upstream: Array<{ id: string; type: ArtifactType; relation: EvidenceRelation }>;
  downstream: Array<{ id: string; type: ArtifactType; relation: EvidenceRelation }>;
}

// ═══════════════════════════════════════════
// Traceability Ledger
// ═══════════════════════════════════════════

/** A traceability ledger entry (append-only) */
export interface TraceabilityLedgerEntry {
  entry_id: string;
  actor: string;
  action: string;
  target_type: string;
  target_id: string;
  scope: ArtifactScope;
  detail: string;
  linked_artifact_ids: string[];
  created_at: string;
}

// ═══════════════════════════════════════════
// Enterprise Audit Hub
// ═══════════════════════════════════════════

/** Audit query filters */
export interface AuditQuery {
  lane?: Lane;
  domain?: Domain;
  project_id?: string;
  provider_id?: Provider;
  artifact_type?: ArtifactType;
  action_type?: string;
  severity?: string;
  time_from?: string;
  time_to?: string;
  limit?: number;
}

/** Unified audit view */
export interface AuditView {
  artifacts: RegisteredArtifact[];
  ledger_entries: TraceabilityLedgerEntry[];
  evidence_count: number;
  total_results: number;
  query: AuditQuery;
  created_at: string;
}

/** An audit finding */
export interface AuditFinding {
  finding_id: string;
  category: string;
  severity: 'info' | 'warning' | 'issue' | 'critical';
  title: string;
  detail: string;
  related_artifact_ids: string[];
  created_at: string;
}

/** An audit package for a scoped entity */
export interface AuditPackage {
  package_id: string;
  scope_type: string;
  related_id: string;
  artifacts: RegisteredArtifact[];
  evidence: EvidenceBundle | null;
  ledger_entries: TraceabilityLedgerEntry[];
  findings: AuditFinding[];
  summary: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Compliance Export
// ═══════════════════════════════════════════

/** Compliance export scope */
export type ComplianceScope = 'graph' | 'dossier' | 'project' | 'release';

/** Compliance export request */
export interface ComplianceExportRequest {
  scope_type: ComplianceScope;
  related_id: string;
  include_evidence: boolean;
  include_policies: boolean;
  include_overrides: boolean;
  redact_sensitive: boolean;
}

/** A compliance artifact in the export */
export interface ComplianceArtifact {
  type: string;
  id: string;
  title: string;
  content_summary: string;
}

/** Compliance export result */
export interface ComplianceExportResult {
  export_id: string;
  scope_type: ComplianceScope;
  related_id: string;
  artifacts: ComplianceArtifact[];
  policy_versions: PolicyVersion[];
  evidence_summary: string;
  override_count: number;
  exception_count: number;
  readiness_score?: number;
  documentation_complete: boolean;
  created_at: string;
}

// ═══════════════════════════════════════════
// Policy History
// ═══════════════════════════════════════════

/** Policy target types for versioning */
export type PolicyTargetType = 'operator_policy' | 'autonomy_budget' | 'escalation_rule' | 'documentation_requirement' | 'promotion_policy' | 'enforcement_rule' | 'isolation_policy' | 'governance_boundary';

/** A versioned policy snapshot */
export interface PolicyVersion {
  version_id: string;
  target_type: PolicyTargetType;
  target_id: string;
  version: number;
  state: Record<string, unknown>;
  effective_from: string;
  superseded_at?: string;
}

/** A policy change record */
export interface PolicyChangeRecord {
  change_id: string;
  target_type: PolicyTargetType;
  target_id: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  actor: string;
  reason: string;
  linked_tuning_id?: string;
  created_at: string;
}

/** Policy history view for a target */
export interface PolicyHistoryView {
  target_type: PolicyTargetType;
  target_id: string;
  current_version: number;
  versions: PolicyVersion[];
  changes: PolicyChangeRecord[];
}

// ═══════════════════════════════════════════
// Human Approval Workspace
// ═══════════════════════════════════════════

/** Approval source types */
export type ApprovalSourceType = 'gate' | 'promotion' | 'override' | 'tuning' | 'exception' | 'policy_change';

/** Approval request status */
export type ApprovalRequestStatus = 'pending' | 'approved' | 'rejected' | 'overdue' | 'delegated' | 'blocked';

/** An approval request in the workspace */
export interface ApprovalRequest {
  request_id: string;
  source_type: ApprovalSourceType;
  source_id: string;
  title: string;
  description: string;
  domain?: Domain;
  project_id?: string;
  lane?: Lane;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: ApprovalRequestStatus;
  delegated_to?: string;
  sla_hours?: number;
  evidence_summary?: string;
  blockers: string[];
  created_at: string;
  updated_at: string;
}

/** Approval decision record */
export interface ApprovalDecisionRecord {
  decision_id: string;
  request_id: string;
  decision: 'approve' | 'reject' | 'request_evidence';
  decided_by: string;
  notes: string;
  created_at: string;
}

/** Approval workspace summary */
export interface ApprovalWorkspaceSummary {
  pending: number;
  approved: number;
  rejected: number;
  overdue: number;
  delegated: number;
  blocked: number;
  total: number;
}

// ═══════════════════════════════════════════
// Delegation Manager
// ═══════════════════════════════════════════

/** A delegation rule */
export interface DelegationRule {
  rule_id: string;
  approval_type: ApprovalSourceType;
  scope_level: MissionStatementLevel | 'global';
  scope_id: string;
  lane?: Lane;
  delegated_to: string;
  fallback_to: string;
  expires_at?: string;
  enabled: boolean;
  created_at: string;
}

// ═══════════════════════════════════════════
// Escalation Inbox
// ═══════════════════════════════════════════

/** Escalation inbox item status */
export type InboxItemStatus = 'new' | 'triaged' | 'in_review' | 'delegated' | 'resolved' | 'dismissed';

/** An escalation inbox item */
export interface EscalationInboxItem {
  item_id: string;
  source_type: string;
  source_id: string;
  title: string;
  detail: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: InboxItemStatus;
  owner?: string;
  domain?: Domain;
  project_id?: string;
  thread: EscalationThreadEntry[];
  created_at: string;
  updated_at: string;
}

/** Thread entry in an escalation item */
export interface EscalationThreadEntry {
  actor: string;
  action: string;
  notes: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Release Orchestration
// ═══════════════════════════════════════════

/** Release plan status */
export type ReleasePlanStatus = 'draft' | 'approved' | 'executing' | 'verifying' | 'completed' | 'halted' | 'rolled_back';

/** A release plan */
export interface ReleasePlan {
  plan_id: string;
  project_id: string;
  domain: Domain;
  target_lane: Lane;
  title: string;
  source_dossier_ids: string[];
  source_graph_ids: string[];
  status: ReleasePlanStatus;
  checkpoints: ReleaseCheckpoint[];
  created_at: string;
  updated_at: string;
}

/** A release checkpoint requiring evidence/approval */
export interface ReleaseCheckpoint {
  checkpoint_id: string;
  title: string;
  required: boolean;
  passed: boolean;
  evidence_ref?: string;
}

/** A release execution record */
export interface ReleaseExecution {
  execution_id: string;
  plan_id: string;
  status: 'executing' | 'verified' | 'failed' | 'rolled_back';
  started_at: string;
  completed_at?: string;
  verification_notes?: string;
  rollback_plan_id?: string;
}

// ═══════════════════════════════════════════
// Environment Promotion Pipeline
// ═══════════════════════════════════════════

/** Pipeline request status */
export type PipelineStatus = 'draft' | 'awaiting_approval' | 'approved' | 'executing' | 'verified' | 'blocked' | 'rolled_back' | 'completed';

/** An environment promotion request */
export interface EnvironmentPromotionRequest {
  request_id: string;
  dossier_id: string;
  source_lane: Lane;
  target_lane: Lane;
  project_id?: string;
  domain: Domain;
  status: PipelineStatus;
  blockers: string[];
  approvals_required: string[];
  approvals_obtained: string[];
  readiness_score?: number;
  docs_complete: boolean;
  exceptions_open: number;
  created_at: string;
  updated_at: string;
}

// ═══════════════════════════════════════════
// Rollback Control
// ═══════════════════════════════════════════

/** Rollback trigger types */
export type RollbackTrigger = 'failed_verification' | 'post_release_block' | 'provider_incident' | 'policy_violation' | 'manual_request';

/** A rollback plan */
export interface RollbackPlan {
  plan_id: string;
  release_execution_id: string;
  trigger: RollbackTrigger;
  description: string;
  affected_artifacts: string[];
  status: 'ready' | 'executing' | 'completed' | 'failed';
  created_at: string;
}

/** A rollback execution record */
export interface RollbackExecution {
  execution_id: string;
  plan_id: string;
  release_execution_id: string;
  before_state: Record<string, unknown>;
  after_state: Record<string, unknown>;
  executed_at: string;
}

// ═══════════════════════════════════════════
// Multi-Agent Collaboration Runtime
// ═══════════════════════════════════════════

/** Collaboration session status */
export type CollaborationSessionStatus = 'open' | 'negotiating' | 'consensus_reached' | 'unresolved' | 'escalated' | 'closed';

/** Collaboration role in a session */
export type CollaborationRole = 'strategist' | 'builder' | 'researcher' | 'critic' | 'verifier' | 'reviewer';

/** A multi-agent collaboration session */
export interface CollaborationSession {
  session_id: string;
  scope_type: string;
  scope_id: string;
  domain?: Domain;
  project_id?: string;
  participants: Array<{ provider_id: Provider; role: CollaborationRole }>;
  protocol_type: string;
  status: CollaborationSessionStatus;
  turns: CollaborationTurn[];
  proposals: AgentProposal[];
  consensus?: ConsensusDecision;
  created_at: string;
  updated_at: string;
}

/** A single turn in a collaboration session */
export interface CollaborationTurn {
  turn_id: string;
  provider_id: Provider;
  role: CollaborationRole;
  action: 'propose' | 'critique' | 'revise' | 'agree' | 'dissent' | 'evidence' | 'vote';
  content: string;
  confidence: number;
  created_at: string;
}

/** An agent proposal within a session */
export interface AgentProposal {
  proposal_id: string;
  session_id: string;
  provider_id: Provider;
  role: CollaborationRole;
  content: string;
  confidence: number;
  rationale: string;
  votes_for: number;
  votes_against: number;
  created_at: string;
}

// ═══════════════════════════════════════════
// Negotiation Protocols
// ═══════════════════════════════════════════

/** Protocol types */
export type NegotiationProtocolType = 'proposal_compare' | 'critique_and_revise' | 'evidence_challenge' | 'tie_break' | 'consensus_required' | 'majority_vote' | 'board_reopen';

/** Negotiation outcome */
export type NegotiationOutcomeType = 'accepted' | 'revision_required' | 'unresolved' | 'escalate_board' | 'escalate_operator';

/** A negotiation protocol definition */
export interface NegotiationProtocol {
  protocol_id: string;
  protocol_type: NegotiationProtocolType;
  max_rounds: number;
  requires_evidence: boolean;
  escalation_on_deadlock: boolean;
  created_at: string;
}

/** A negotiation round */
export interface NegotiationRound {
  round_number: number;
  proposals_submitted: number;
  votes_cast: number;
  outcome?: NegotiationOutcomeType;
}

/** Negotiation outcome record */
export interface NegotiationOutcome {
  session_id: string;
  protocol_type: NegotiationProtocolType;
  rounds_completed: number;
  outcome: NegotiationOutcomeType;
  winning_proposal_id?: string;
  reason: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Agent Consensus
// ═══════════════════════════════════════════

/** Consensus level */
export type ConsensusLevel = 'unanimous' | 'majority' | 'split' | 'blocked';

/** A consensus decision */
export interface ConsensusDecision {
  session_id: string;
  level: ConsensusLevel;
  winning_proposal_id?: string;
  total_votes: number;
  votes_for: number;
  votes_against: number;
  abstentions: number;
  rationale: string;
  created_at: string;
}

/** An agent vote */
export interface AgentVote {
  vote_id: string;
  session_id: string;
  proposal_id: string;
  provider_id: Provider;
  vote: 'for' | 'against' | 'abstain';
  confidence: number;
  rationale: string;
  created_at: string;
}

/** A collaboration dissent record */
export interface CollaborationDissentRecord {
  dissent_id: string;
  session_id: string;
  provider_id: Provider;
  role: CollaborationRole;
  dissent_reason: string;
  proposal_opposed_id: string;
  alternative_proposal?: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Productization / Tenant Admin
// ═══════════════════════════════════════════

/** Tenant plan tier */
export type TenantPlanTier = 'personal' | 'pro' | 'team' | 'enterprise';

/** A tenant profile */
export interface TenantProfile {
  tenant_id: string;
  name: string;
  plan: TenantPlanTier;
  enabled_engines: Domain[];
  enabled_modules: string[];
  environment: TenantEnvironment;
  governance_defaults: Record<string, unknown>;
  isolation_state: 'strict' | 'shared' | 'custom';
  created_at: string;
  updated_at: string;
}

/** Tenant environment config */
export interface TenantEnvironment {
  lanes_enabled: Lane[];
  storage_root: string;
  deployment_target: 'local' | 'cloud' | 'self_hosted';
  auto_refresh_interval_ms: number;
}

/** Tenant config policy */
export interface TenantConfigPolicy {
  tenant_id: string;
  policy_area: string;
  value: string;
  overridable: boolean;
}

// ═══════════════════════════════════════════
// Subscription Operations
// ═══════════════════════════════════════════

/** Subscription record */
export interface SubscriptionRecord {
  subscription_id: string;
  tenant_id: string;
  plan: TenantPlanTier;
  status: 'active' | 'trial' | 'expired' | 'suspended';
  started_at: string;
  expires_at?: string;
}

/** Feature entitlement */
export interface SubscriptionEntitlement {
  feature: string;
  entitled: boolean;
  limit?: number;
  used?: number;
}

/** Usage meter record */
export interface UsageMeter {
  meter_id: string;
  tenant_id: string;
  meter_type: string;
  amount: number;
  period: string;
  created_at: string;
}

/** Billing event */
export interface BillingEvent {
  event_id: string;
  tenant_id: string;
  event_type: 'charge' | 'credit' | 'usage_recorded' | 'plan_change';
  amount: number;
  detail: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Deployment Readiness
// ═══════════════════════════════════════════

/** Deployment readiness dimension */
export interface DeploymentRequirement {
  dimension: string;
  score: number;
  max_score: number;
  status: 'ready' | 'partial' | 'not_ready';
  details: string;
}

/** Deployment risk */
export interface DeploymentRisk {
  category: string;
  severity: 'low' | 'medium' | 'high';
  description: string;
}

/** Deployment readiness report */
export interface DeploymentReadinessReport {
  report_id: string;
  scope_type: string;
  scope_id: string;
  overall_score: number;
  dimensions: DeploymentRequirement[];
  blockers: string[];
  warnings: string[];
  risks: DeploymentRisk[];
  recommended_fixes: string[];
  created_at: string;
}

// ═══════════════════════════════════════════
// Secret Governance
// ═══════════════════════════════════════════

/** Secret scope */
export type SecretScope = 'tenant' | 'environment' | 'engine' | 'project' | 'provider';

/** Secret access decision */
export type SecretAccessOutcome = 'allow' | 'deny' | 'redacted' | 'require_approval';

/** A secret metadata record (never stores raw value) */
export interface SecretRecord {
  secret_id: string;
  name: string;
  scope: SecretScope;
  scope_id: string;
  provider_id?: Provider;
  key_prefix: string;
  created_at: string;
  rotated_at?: string;
  expires_at?: string;
  age_days: number;
  rotation_policy_days: number;
  status: 'active' | 'stale' | 'expired' | 'rotated';
}

/** Secret access decision record */
export interface SecretAccessDecision {
  decision_id: string;
  secret_id: string;
  actor: string;
  action: string;
  outcome: SecretAccessOutcome;
  reason: string;
  created_at: string;
}

/** Secret usage event */
export interface SecretUsageEvent {
  event_id: string;
  secret_id: string;
  actor: string;
  action: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Security Hardening
// ═══════════════════════════════════════════

/** A security control */
export interface SecurityControl {
  control_id: string;
  name: string;
  category: string;
  status: 'implemented' | 'partial' | 'not_implemented';
  details: string;
}

/** A security finding */
export interface SecurityFinding {
  finding_id: string;
  severity: 'blocker' | 'high' | 'medium' | 'low';
  category: string;
  title: string;
  remediation: string;
  affected_scope: string;
  evidence_refs: string[];
  created_at: string;
}

/** Security posture report */
export interface SecurityPostureReport {
  report_id: string;
  scope_type: string;
  scope_id: string;
  overall: 'strong' | 'acceptable' | 'weak' | 'critical';
  controls: SecurityControl[];
  findings: SecurityFinding[];
  secret_health: { total: number; stale: number; expired: number };
  boundary_health: { violations: number; enforced: boolean };
  created_at: string;
}

/** Hardening checklist item */
export interface HardeningChecklistItem {
  item_id: string;
  category: string;
  title: string;
  completed: boolean;
  details: string;
}

// ═══════════════════════════════════════════
// Data Boundary Controls
// ═══════════════════════════════════════════

/** Boundary access decision */
export type BoundaryAccessOutcome = 'allow' | 'deny' | 'redact' | 'require_approval';

/** Data boundary policy */
export interface DataBoundaryPolicy {
  policy_id: string;
  source_scope: string;
  target_scope: string;
  artifact_type: string;
  outcome: BoundaryAccessOutcome;
  enabled: boolean;
  created_at: string;
}

/** Boundary access decision record */
export interface BoundaryAccessDecision {
  decision_id: string;
  source_scope: string;
  target_scope: string;
  artifact_type: string;
  action: string;
  outcome: BoundaryAccessOutcome;
  reason: string;
  created_at: string;
}

/** Boundary violation record */
export interface BoundaryViolationRecord {
  violation_id: string;
  source_scope: string;
  target_scope: string;
  artifact_type: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  detail: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Observability + Reliability + SLO/SLA
// ═══════════════════════════════════════════

/** Telemetry event */
export interface TelemetryEvent {
  event_id: string;
  category: string;
  action: string;
  outcome: 'success' | 'failure' | 'blocked' | 'warning';
  duration_ms?: number;
  lane?: Lane;
  domain?: Domain;
  project_id?: string;
  provider_id?: Provider;
  created_at: string;
}

/** Telemetry metric aggregate */
export interface TelemetryMetric {
  metric: string;
  value: number;
  unit: string;
  scope: string;
  window: string;
}

/** Reliability incident */
export interface ReliabilityIncident {
  incident_id: string;
  subsystem: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  detail: string;
  affected_scope: string;
  remediation: string;
  resolved: boolean;
  created_at: string;
}

/** Reliability snapshot per subsystem */
export interface ReliabilitySnapshot {
  subsystem: string;
  status: 'healthy' | 'watch' | 'degraded' | 'critical';
  success_rate: number;
  incident_count: number;
  details: string;
}

/** SLO definition */
export interface SLODefinition {
  slo_id: string;
  name: string;
  target: number;
  unit: string;
  scope: string;
  lane?: Lane;
}

/** SLO current status */
export interface SLOStatus {
  slo_id: string;
  name: string;
  target: number;
  current: number;
  unit: string;
  met: boolean;
  budget_remaining: number;
}

/** Alert rule */
export interface AlertRule {
  rule_id: string;
  condition: string;
  threshold: number;
  action: string;
  enabled: boolean;
}

/** Alert event */
export interface AlertEvent {
  alert_id: string;
  rule_id: string;
  severity: 'info' | 'warning' | 'critical';
  detail: string;
  created_at: string;
}

/** Service health view */
export interface ServiceHealthView {
  overall: 'healthy' | 'degraded' | 'critical';
  subsystems: ReliabilitySnapshot[];
  slo_statuses: SLOStatus[];
  active_incidents: number;
  active_alerts: number;
  created_at: string;
}

// ═══════════════════════════════════════════
// Agent Skill Packs + Engine Templates
// ═══════════════════════════════════════════

/** Skill pack readiness state */
export type SkillPackState = 'draft' | 'experimental' | 'stable' | 'deprecated';

/** A reusable governed capability package */
export interface SkillPack {
  pack_id: string;
  name: string;
  description: string;
  version: number;
  state: SkillPackState;
  capabilities: SkillPackCapability[];
  constraints: string[];
  dependencies: string[];
  scope: MissionStatementLevel | 'global' | 'tenant';
  compatibility: string[];
  created_at: string;
  updated_at: string;
}

/** A capability within a skill pack */
export interface SkillPackCapability {
  capability_id: string;
  type: 'prompt_recipe' | 'provider_preference' | 'collaboration_pattern' | 'review_requirement' | 'policy_default' | 'documentation_template' | 'release_default' | 'observability_hook' | 'security_expectation';
  name: string;
  config: Record<string, unknown>;
}

/** A binding of a skill pack to a scope */
export interface SkillPackBinding {
  binding_id: string;
  pack_id: string;
  scope_type: string;
  scope_id: string;
  active: boolean;
  created_at: string;
}

/** A domain-specific engine template */
export interface EngineTemplate {
  template_id: string;
  name: string;
  domain_type: string;
  description: string;
  version: number;
  mission_defaults: Record<string, unknown>;
  default_projects: string[];
  recommended_skill_packs: string[];
  provider_strategy: Record<string, unknown>;
  governance_defaults: Record<string, unknown>;
  approval_defaults: Record<string, unknown>;
  docs_starters: string[];
  created_at: string;
  updated_at: string;
}

/** Record of a template instantiation */
export interface TemplateInstantiationRecord {
  instantiation_id: string;
  template_id: string;
  tenant_id: string;
  engine_id: string;
  domain: Domain;
  created_at: string;
}

/** Capability composition plan */
export interface CapabilityCompositionPlan {
  plan_id: string;
  engine_id: string;
  project_id?: string;
  active_capabilities: Array<{ name: string; source: string; stable: boolean }>;
  blocked_capabilities: Array<{ name: string; reason: string }>;
  template_source?: string;
  skill_pack_sources: string[];
  override_count: number;
  created_at: string;
}

// ═══════════════════════════════════════════
// Extension Framework + Marketplace + Integration Governance
// ═══════════════════════════════════════════

/** Extension trust level */
export type ExtensionTrustLevel = 'untrusted' | 'community' | 'verified' | 'official';

/** Extension permission types */
export type ExtensionPermission = 'read_context' | 'write_state' | 'call_provider' | 'modify_governance' | 'access_secrets' | 'cross_project';

/** An extension package */
export interface ExtensionPackage {
  extension_id: string;
  name: string;
  description: string;
  version: number;
  trust_level: ExtensionTrustLevel;
  permissions: ExtensionPermission[];
  provides: string[];
  dependencies: string[];
  sandbox_policy: 'strict' | 'standard' | 'permissive';
  state: 'draft' | 'published' | 'installed' | 'disabled' | 'deprecated';
  tenant_compatibility: string[];
  created_at: string;
  updated_at: string;
}

/** Extension install record */
export interface ExtensionInstallRecord {
  install_id: string;
  extension_id: string;
  tenant_id: string;
  scope_type: string;
  scope_id: string;
  installed_at: string;
  uninstalled_at?: string;
}

/** Marketplace listing */
export interface MarketplaceListing {
  listing_id: string;
  asset_type: 'extension' | 'skill_pack' | 'engine_template' | 'shared_asset';
  asset_ref: string;
  name: string;
  description: string;
  owner: string;
  version: number;
  trust_level: ExtensionTrustLevel;
  permissions: ExtensionPermission[];
  status: 'draft' | 'review' | 'approved' | 'rejected' | 'deprecated';
  plan_availability: string[];
  docs_complete: boolean;
  created_at: string;
  updated_at: string;
}

/** Integration connector */
export interface IntegrationConnector {
  integration_id: string;
  name: string;
  category: 'provider_api' | 'storage' | 'docs_knowledge' | 'messaging' | 'deployment' | 'observability';
  trust_level: ExtensionTrustLevel;
  permissions: ExtensionPermission[];
  secret_scope: string;
  tenant_ids: string[];
  enabled: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

/** Integration access decision */
export interface IntegrationAccessDecision {
  decision_id: string;
  integration_id: string;
  tenant_id: string;
  action: string;
  outcome: 'allow' | 'deny' | 'require_approval';
  reason: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// UI Surface Audit + Readiness
// ═══════════════════════════════════════════

/** UI surface classification */
export type UISurfaceStatus = 'complete' | 'partial' | 'empty' | 'dead' | 'api_only' | 'hidden';

/** A UI surface definition */
export interface UISurfaceDefinition {
  surface_id: string;
  area: string;
  tab: string;
  panel: string;
  exists_in_ui: boolean;
  visible_in_nav: boolean;
  renders_data: boolean;
  uses_real_backend: boolean;
  supports_action: boolean;
  has_empty_state: boolean;
  has_loading_state: boolean;
  status: UISurfaceStatus;
}

/** UI surface audit result */
export interface UISurfaceAuditResult {
  audit_id: string;
  surfaces: UISurfaceDefinition[];
  total: number;
  complete: number;
  partial: number;
  empty: number;
  dead: number;
  api_only: number;
  hidden: number;
  top_gaps: string[];
  created_at: string;
}

/** UI wiring gap */
export interface UIWiringGap {
  area: string;
  surface: string;
  gap_type: 'no_data' | 'no_navigation' | 'no_detail' | 'no_action' | 'summary_only' | 'no_empty_state';
  description: string;
  fix: string;
}

/** UI readiness report */
export interface UIReadinessReport {
  report_id: string;
  overall_score: number;
  area_scores: Record<string, { score: number; max: number; status: string }>;
  blocking_gaps: string[];
  e2e_checks: Array<{ flow: string; status: 'pass' | 'partial' | 'fail'; detail: string }>;
  created_at: string;
}

// ═══════════════════════════════════════════
// E2E Workflow Activation
// ═══════════════════════════════════════════

/** Workflow activation state */
export type WorkflowState = 'not_started' | 'partially_activated' | 'activated' | 'blocked' | 'broken';

/** An activated workflow definition */
export interface ActivatedWorkflow {
  workflow_id: string;
  name: string;
  area: string;
  entry_point: string;
  api_endpoints: string[];
  steps: WorkflowStepState[];
  state: WorkflowState;
  blockers: string[];
}

/** State of a single workflow step */
export interface WorkflowStepState {
  step: string;
  ui_visible: boolean;
  api_connected: boolean;
  state_mutates: boolean;
  result_visible: boolean;
}

/** Workflow activation report */
export interface WorkflowActivationReport {
  report_id: string;
  workflows: ActivatedWorkflow[];
  total: number;
  activated: number;
  partial: number;
  blocked: number;
  top_blockers: string[];
  created_at: string;
}

/** Operator action definition */
export interface OperatorActionDefinition {
  action_id: string;
  area: string;
  label: string;
  api_endpoint: string;
  method: 'GET' | 'POST';
  requires_input: boolean;
  visible_in_ui: boolean;
  entitlement_required?: string;
}

/** E2E flow run result */
export interface E2EFlowRun {
  run_id: string;
  flow_id: string;
  flow_name: string;
  steps: Array<{ step: string; status: 'pass' | 'partial' | 'fail' | 'skip'; detail: string }>;
  overall: 'pass' | 'partial' | 'fail';
  created_at: string;
}

// ═══════════════════════════════════════════
// Part 43: Action Visibility + Runtime Completion
// ═══════════════════════════════════════════

/** A visible operator action with UI state */
export interface VisibleOperatorAction {
  action_id: string;
  area: string;
  label: string;
  api_endpoint: string;
  visible: boolean;
  has_loading: boolean;
  has_error: boolean;
  has_refresh: boolean;
  activation: 'full' | 'partial' | 'hidden';
}

/** Runtime enforcement completion state */
export type RuntimeCompletionState = 'fully_enforced' | 'partially_enforced' | 'advisory_only';

/** Runtime completion report */
export interface RuntimeCompletionReport {
  report_id: string;
  paths: Array<{ path: string; state: RuntimeCompletionState; detail: string }>;
  fully_enforced: number;
  partially_enforced: number;
  advisory_only: number;
  total: number;
  created_at: string;
}

/** Action visibility gap */
export interface ActionVisibilityGap {
  action_id: string;
  area: string;
  label: string;
  gap: string;
  priority: 'high' | 'medium' | 'low';
}

/** Mutation refresh result */
export interface MutationRefreshResult {
  area: string;
  panels_refreshed: number;
  apis_called: string[];
  created_at: string;
}

// ═══════════════════════════════════════════
// Part 44: UX Polish + Navigation + Targeted Refresh
// ═══════════════════════════════════════════

/** Navigation map entry */
export interface NavigationMapEntry {
  tab: string;
  panels: string[];
  drilldowns: string[];
  actions: string[];
  reachable: boolean;
}

/** Navigation gap */
export interface NavigationGap {
  feature: string;
  expected_tab: string;
  issue: string;
  fix: string;
}

/** Targeted refresh plan */
export interface TargetedRefreshPlan {
  area: string;
  trigger_actions: string[];
  refresh_endpoints: string[];
  panel_selectors: string[];
}

/** Drilldown definition */
export interface DrilldownDefinition {
  area: string;
  entity_type: string;
  panel: string;
  shows_state: boolean;
  shows_evidence: boolean;
  shows_actions: boolean;
  shows_history: boolean;
}

/** UX consistency report */
export interface UXConsistencyReport {
  report_id: string;
  navigation_entries: number;
  navigation_gaps: number;
  refresh_plans: number;
  drilldowns: number;
  journey_pass: number;
  journey_partial: number;
  journey_fail: number;
  overall: 'consistent' | 'partial' | 'inconsistent';
  created_at: string;
}

/** Operator journey check */
export interface OperatorJourney {
  journey_id: string;
  name: string;
  steps: Array<{ step: string; discoverable: boolean; actionable: boolean; has_feedback: boolean; has_refresh: boolean }>;
  overall: 'pass' | 'partial' | 'fail';
}

// ═══════════════════════════════════════════
// Part 45: Real Telemetry + Measured Reliability + Alert Routing
// ═══════════════════════════════════════════

/** Telemetry wiring state */
export type TelemetryWiringState = 'fully_wired' | 'partially_wired' | 'missing';

/** Telemetry wiring report */
export interface TelemetryWiringReport {
  report_id: string;
  flows: Array<{ flow: string; state: TelemetryWiringState; detail: string }>;
  fully_wired: number;
  partially_wired: number;
  missing: number;
  total: number;
  created_at: string;
}

/** Measured reliability report */
export interface MeasuredReliabilityReport {
  report_id: string;
  scope: string;
  metrics: Array<{ name: string; value: number; unit: string; measured: boolean; window: string }>;
  regressions: Array<{ metric: string; previous: number; current: number; delta: number }>;
  overall_health: 'healthy' | 'watch' | 'degraded' | 'critical';
  created_at: string;
}

/** Alert routing decision */
export interface AlertRoutingDecision {
  alert_id: string;
  category: string;
  severity: 'info' | 'warning' | 'critical';
  target: 'escalation_inbox' | 'approval_workspace' | 'admin_workspace' | 'operator_home';
  detail: string;
  delivered: boolean;
  deduped: boolean;
  created_at: string;
}

/** SLO breach record */
export interface SLOBreachRecord {
  breach_id: string;
  slo_id: string;
  slo_name: string;
  target: number;
  actual: number;
  unit: string;
  severity: 'warning' | 'critical';
  routed_to: string;
  created_at: string;
}

// ═══════════════════════════════════════════
// Part 46: Isolation + Entitlement + Boundary Enforcement
// ═══════════════════════════════════════════

/** Tenant isolation decision */
export interface TenantIsolationDecision {
  decision_id: string;
  source_tenant: string;
  target_tenant: string;
  action: string;
  outcome: 'allow' | 'deny' | 'redact';
  reason: string;
  created_at: string;
}

/** API entitlement decision */
export interface APIEntitlementDecision {
  decision_id: string;
  route: string;
  tenant_id: string;
  feature: string;
  outcome: 'allowed' | 'denied' | 'denied_upgrade_required' | 'denied_scope_violation';
  reason: string;
  created_at: string;
}

/** Route protection rule */
export interface RouteProtectionRule {
  route_pattern: string;
  required_feature: string;
  min_plan: string;
  enforced: boolean;
}

/** Boundary enforcement result */
export interface BoundaryEnforcementResult {
  result_id: string;
  request_type: string;
  source_scope: string;
  target_scope: string;
  artifact_type: string;
  outcome: 'allowed' | 'blocked' | 'redacted';
  reason: string;
  created_at: string;
}

/** Isolation enforcement report */
export interface IsolationEnforcementReport {
  report_id: string;
  total_decisions: number;
  allowed: number;
  denied: number;
  redacted: number;
  protected_routes: number;
  enforced_routes: number;
  boundary_blocks: number;
  leak_risks: string[];
  created_at: string;
}

// ═══════════════════════════════════════════
// Part 47: Runtime Capability Activation
// ═══════════════════════════════════════════

/** Activation source type */
export type ActivationSource = 'skill_pack' | 'engine_template' | 'extension' | 'operator_override' | 'platform_default';

/** Activation decision */
export type ActivationDecisionType = 'allow' | 'allow_with_override' | 'block' | 'block_dependency_missing' | 'block_conflict';

/** An activated runtime capability */
export interface ActivatedCapability {
  capability_id: string;
  name: string;
  type: string;
  source: ActivationSource;
  source_id: string;
  engine_id: string;
  project_id?: string;
  active: boolean;
  decision: ActivationDecisionType;
  config: Record<string, unknown>;
  created_at: string;
}

/** Runtime binding record for a template */
export interface RuntimeBindingRecord {
  binding_id: string;
  template_id: string;
  engine_id: string;
  project_id?: string;
  bindings_applied: string[];
  created_at: string;
}

/** Extension permission decision */
export interface ExtensionPermissionDecision {
  decision_id: string;
  extension_id: string;
  permission: ExtensionPermission;
  action: string;
  outcome: 'granted' | 'denied' | 'denied_trust' | 'denied_entitlement' | 'denied_isolation';
  reason: string;
  created_at: string;
}

/** Capability conflict record */
export interface CapabilityConflictRecord {
  conflict_id: string;
  engine_id: string;
  capability_name: string;
  source_a: string;
  source_b: string;
  conflict_type: string;
  resolution: 'source_a_wins' | 'source_b_wins' | 'unresolved' | 'merged';
  created_at: string;
}

/** Runtime activation report */
export interface RuntimeActivationReport {
  report_id: string;
  total_capabilities: number;
  activated: number;
  blocked: number;
  conflicts: number;
  template_bindings: number;
  extension_grants: number;
  extension_denials: number;
  created_at: string;
}

// ═══════════════════════════════════════════
// Part 48: Production Readiness Closure
// ═══════════════════════════════════════════

/** Closure dimension status */
export type ClosureStatus = 'closed' | 'mostly_closed' | 'partial' | 'blocked';

/** Production readiness closure report */
export interface ProductionReadinessClosureReport {
  report_id: string;
  dimensions: Array<{ name: string; status: ClosureStatus; score: number; max: number; detail: string }>;
  overall_score: number;
  ship_blockers: string[];
  closure_priorities: string[];
  ship_decision: 'go' | 'conditional_go' | 'no_go';
  created_at: string;
}

/** Live integration status */
export interface LiveIntegrationStatus {
  area: string;
  state: 'design_only' | 'evaluated' | 'enforced' | 'consumed_runtime';
  detail: string;
}

/** Operator acceptance result */
export interface OperatorAcceptanceRun {
  run_id: string;
  checks: Array<{ name: string; status: 'usable' | 'partially_usable' | 'broken' | 'blocked_backend' | 'blocked_ui'; detail: string }>;
  usable: number;
  partial: number;
  broken: number;
  blocked: number;
  created_at: string;
}

/** Ship readiness decision */
export interface ShipReadinessDecision {
  decision: 'go' | 'conditional_go' | 'no_go';
  readiness_score: number;
  deployment_score: number;
  security_posture: string;
  operator_acceptance_rate: number;
  ship_blockers: string[];
  created_at: string;
}

// ═══════════════════════════════════════════
// Part 49: Ship Blocker Closure
// ═══════════════════════════════════════════

/** A ship blocker */
export interface ShipBlocker {
  blocker_id: string;
  name: string;
  severity: 'critical' | 'high' | 'medium';
  scope: string;
  reason: string;
  status: 'open' | 'in_progress' | 'resolved';
  resolution_evidence?: string;
  created_at: string;
  resolved_at?: string;
}

/** Middleware enforcement result */
export interface MiddlewareEnforcementResult {
  area: string;
  route_count: number;
  enforced_count: number;
  state: 'enforced' | 'partially_enforced' | 'missing';
  detail: string;
}

/** Workflow completion state */
export interface WorkflowCompletionState {
  workflow_id: string;
  name: string;
  status: 'usable' | 'partially_usable' | 'blocked' | 'broken';
  has_ui_entry: boolean;
  has_actions: boolean;
  has_feedback: boolean;
  has_refresh: boolean;
  detail: string;
}

/** Workflow completion report */
export interface WorkflowCompletionReport {
  report_id: string;
  workflows: WorkflowCompletionState[];
  usable: number;
  partial: number;
  blocked: number;
  total: number;
  created_at: string;
}

// ═══════════════════════════════════════════
// Part 50: Go-Live Closure + Reconciliation
// ═══════════════════════════════════════════

/** Go-live closure report */
export interface GoLiveClosureReport {
  report_id: string;
  blockers: Array<{ name: string; status: 'closed' | 'partial' | 'blocked'; evidence: string }>;
  closed: number;
  partial: number;
  blocked: number;
  total: number;
  remaining_risk: string[];
  recommendation: 'go' | 'conditional_go' | 'no_go';
  created_at: string;
}

/** Release provider gating decision */
export interface ReleaseProviderGatingDecision {
  decision_id: string;
  release_id: string;
  provider_health: string;
  cost_ok: boolean;
  latency_ok: boolean;
  incidents: number;
  outcome: 'clear' | 'warning' | 'blocked';
  detail: string;
  created_at: string;
}

/** Readiness reconciliation result */
export interface ReadinessReconciliationResult {
  report_id: string;
  workflow_completion: number;
  middleware_coverage: number;
  blocker_closure: number;
  operator_acceptance: number;
  reconciled_score: number;
  stale_contradictions_resolved: number;
  ship_decision: 'go' | 'conditional_go' | 'no_go';
  created_at: string;
}

// ── Part 51: Middleware Enforcement Completion + Real Protected Path Validation ──

/** A protected path definition */
export interface ProtectedPath {
  path_id: string;
  name: string;
  description: string;
  route: string;
  protection_type: 'entitlement' | 'boundary' | 'redaction' | 'extension_permission' | 'provider_gate' | 'tenant_isolation';
  expected_outcome: 'deny' | 'allow' | 'redact';
  scenario: string;
}

/** Result of a single protected path step validation */
export interface ProtectedPathStepResult {
  step: string;
  middleware_invoked: string;
  decision: 'deny' | 'allow' | 'redact' | 'error';
  payload_observed: string;
  matched_expectation: boolean;
}

/** A full protected path validation run */
export interface ProtectedPathValidationRun {
  run_id: string;
  path_id: string;
  path_name: string;
  steps: ProtectedPathStepResult[];
  overall: 'validated' | 'partially_validated' | 'failed' | 'not_wired';
  evidence_id: string;
  created_at: string;
}

/** Wire state of a middleware area */
export interface MiddlewareWireState {
  area: string;
  state: 'design_only' | 'evaluated_only' | 'wired' | 'executed_and_verified';
  route_count: number;
  enforced_count: number;
  verified_count: number;
  detail: string;
}

/** Evidence of a middleware actually executing */
export interface MiddlewareExecutionEvidence {
  evidence_id: string;
  middleware: string;
  route: string;
  decision: string;
  response_effect: string;
  scope_type: string;
  scope_id: string;
  timestamp: string;
}

/** Durable enforcement evidence record */
export interface EnforcementEvidenceRecord {
  record_id: string;
  area: string;
  middleware_ran: string;
  decision_made: string;
  response_effect: string;
  scope_type: string;
  scope_id: string;
  route: string;
  linked_path_id: string;
  created_at: string;
}

/** Record of a route guard execution */
export interface RouteGuardExecution {
  guard_id: string;
  route: string;
  guard_type: string;
  outcome: 'pass' | 'block' | 'redact';
  tenant_id: string;
  detail: string;
  created_at: string;
}

/** Record of a redaction execution */
export interface RedactionExecutionRecord {
  redaction_id: string;
  route: string;
  source_scope: string;
  target_scope: string;
  fields_redacted: string[];
  reason: string;
  created_at: string;
}

/** Summary of protected path validation */
export interface ProtectedPathSummary {
  total_paths: number;
  validated: number;
  partially_validated: number;
  failed: number;
  not_wired: number;
  validation_runs: ProtectedPathValidationRun[];
  created_at: string;
}

/** Middleware truth report — what is actually enforced vs claimed */
export interface MiddlewareTruthReport {
  report_id: string;
  areas: MiddlewareWireState[];
  total_areas: number;
  executed_and_verified: number;
  wired: number;
  evaluated_only: number;
  design_only: number;
  truth_score: number;
  created_at: string;
}

/** Enforcement closure state */
export interface EnforcementClosureState {
  closure_id: string;
  evidence_records: number;
  validated_paths: number;
  total_paths: number;
  truth_score: number;
  blockers: ProtectedPathBlocker[];
  ship_ready: boolean;
  created_at: string;
}

/** A blocker from protected path validation */
export interface ProtectedPathBlocker {
  path_id: string;
  path_name: string;
  blocker_type: 'not_wired' | 'failed_validation' | 'no_evidence';
  detail: string;
}

// ── Part 52: Final Ship Decision Reconciliation + HTTP Middleware Validation ──

/** HTTP middleware validation case */
export interface HTTPValidationCase {
  case_id: string;
  name: string;
  route: string;
  method: string;
  scenario: string;
  expected_status: number;
  expected_effect: 'allow' | 'deny' | 'redact';
  middleware_chain: string[];
}

/** HTTP validation result */
export interface HTTPValidationResult {
  case_id: string;
  case_name: string;
  route: string;
  expected_status: number;
  actual_status: number;
  expected_effect: string;
  actual_effect: string;
  payload_sample: string;
  middleware_executed: string[];
  passed: boolean;
  validation_type: 'http' | 'function';
  detail: string;
}

/** HTTP middleware validation run */
export interface HTTPMiddlewareValidationRun {
  run_id: string;
  results: HTTPValidationResult[];
  passed: number;
  failed: number;
  total: number;
  http_validated: number;
  function_validated: number;
  created_at: string;
}

/** Final blocker state */
export interface FinalBlockerState {
  blocker_id: string;
  name: string;
  source: string;
  status: 'open' | 'partially_closed' | 'closed' | 'stale';
  evidence: string;
  reconciled_from: string[];
  last_updated: string;
}

/** Blocker reconciliation report */
export interface BlockerReconciliationReport {
  report_id: string;
  blockers: FinalBlockerState[];
  open: number;
  partially_closed: number;
  closed: number;
  stale: number;
  total: number;
  stale_contradictions_resolved: number;
  created_at: string;
}

/** Redaction behavior record */
export interface RedactionBehaviorRecord {
  record_id: string;
  route: string;
  source_scope: string;
  target_scope: string;
  artifact_type: string;
  policy_outcome: 'deny' | 'redact' | 'allow';
  actual_outcome: 'deny' | 'redact' | 'allow';
  correct: boolean;
  detail: string;
  created_at: string;
}

/** Final workflow closure report */
export interface FinalWorkflowClosureReport {
  report_id: string;
  workflows: Array<{ workflow_id: string; name: string; status: 'usable' | 'partially_usable' | 'blocked' | 'broken'; detail: string }>;
  usable: number;
  partial: number;
  blocked: number;
  broken: number;
  total: number;
  closed_in_this_pass: string[];
  created_at: string;
}

/** Final ship decision report */
export interface FinalShipDecisionReport {
  report_id: string;
  decision: 'go' | 'conditional_go' | 'no_go';
  evidence: FinalDecisionEvidence[];
  blocker_reconciliation_score: number;
  workflow_closure_score: number;
  middleware_truth_score: number;
  http_validation_score: number;
  operator_acceptance_score: number;
  security_posture: string;
  measured_reliability_score: number;
  overall_score: number;
  remaining_gaps: string[];
  created_at: string;
}

/** Evidence supporting the final ship decision */
export interface FinalDecisionEvidence {
  dimension: string;
  score: number;
  max: number;
  status: 'pass' | 'conditional' | 'fail';
  detail: string;
}

/** Final go-live gate */
export interface FinalGoLiveGate {
  gate_id: string;
  name: string;
  required: boolean;
  passed: boolean;
  detail: string;
}

// ── Part 53: Network-Level HTTP Validation + Reliability Closure + Clean-State Go ──

/** Network HTTP validation case */
export interface NetworkHTTPCase {
  case_id: string;
  name: string;
  route: string;
  method: string;
  scenario: string;
  expected_status: number;
  expected_effect: 'allow' | 'deny' | 'redact';
  middleware_chain: string[];
}

/** Network HTTP validation result */
export interface NetworkHTTPResult {
  case_id: string;
  case_name: string;
  route: string;
  method: string;
  expected_status: number;
  actual_status: number;
  expected_effect: string;
  actual_effect: string;
  response_sample: string;
  middleware_executed: string[];
  passed: boolean;
  validation_level: 'network' | 'function_fallback';
  detail: string;
  evidence_id: string;
}

/** Network HTTP validation run */
export interface NetworkHTTPValidationRun {
  run_id: string;
  harness_state: ValidationHarnessState;
  results: NetworkHTTPResult[];
  passed: number;
  failed: number;
  total: number;
  network_validated: number;
  function_fallback: number;
  created_at: string;
}

/** Validation harness state */
export interface ValidationHarnessState {
  server_reachable: boolean;
  base_url: string;
  port: number;
  latency_ms: number;
  detail: string;
}

/** Reliability metric closure */
export interface ReliabilityMetricClosure {
  metric_name: string;
  status: 'fully_measured' | 'partially_measured' | 'proxy_only';
  value: number;
  unit: string;
  source: string;
  detail: string;
}

/** Reliability closure report */
export interface ReliabilityClosureReport {
  report_id: string;
  metrics: ReliabilityMetricClosure[];
  fully_measured: number;
  partially_measured: number;
  proxy_only: number;
  total: number;
  closure_score: number;
  created_at: string;
}

/** Clean state issue */
export interface CleanStateIssue {
  file: string;
  issue: string;
  severity: 'info' | 'warn' | 'stale';
  detail: string;
}

/** Clean state verification run */
export interface CleanStateVerificationRun {
  run_id: string;
  issues: CleanStateIssue[];
  state_files_checked: number;
  stale_detected: number;
  clean: boolean;
  detail: string;
  created_at: string;
}

/** Verification confidence */
export interface VerificationConfidence {
  dimension: string;
  level: 'high' | 'medium' | 'low';
  evidence_count: number;
  detail: string;
}

/** Go evidence bundle */
export interface GoEvidenceBundle {
  network_validation: { passed: number; total: number; all_pass: boolean };
  blocker_reconciliation: { closed: number; total: number; all_closed: boolean };
  workflow_closure: { usable: number; total: number; all_usable: boolean };
  middleware_truth: { score: number; all_verified: boolean };
  reliability_closure: { score: number; no_proxy_gaps: boolean };
  clean_state: { clean: boolean; stale_count: number };
  operator_acceptance: { score: number };
  security_posture: string;
}

/** Final production decision */
export interface FinalProductionDecision {
  report_id: string;
  decision: 'go' | 'conditional_go' | 'no_go';
  confidence: VerificationConfidence[];
  evidence_bundle: GoEvidenceBundle;
  overall_score: number;
  gates: FinalGoLiveGate[];
  remaining_gaps: string[];
  created_at: string;
}

/** Final Go verification report */
export interface FinalGoVerificationReport {
  report_id: string;
  production_decision: FinalProductionDecision;
  network_validation: NetworkHTTPValidationRun | null;
  reliability_closure: ReliabilityClosureReport | null;
  clean_state: CleanStateVerificationRun | null;
  created_at: string;
}

// ── Part 54: Live Server Proof + Final Production Go Authorization ──

/** Live HTTP proof case */
export interface LiveHTTPProofCase {
  case_id: string;
  name: string;
  route: string;
  method: string;
  scenario: string;
  expected_status: number;
  expected_effect: 'allow' | 'deny' | 'redact';
}

/** Live HTTP proof result */
export interface LiveHTTPProofResult {
  case_id: string;
  case_name: string;
  route: string;
  http_status: number;
  response_bytes: number;
  expected_effect: string;
  middleware_effect: string;
  passed: boolean;
  proof_level: 'live_network' | 'function_only' | 'not_run';
  evidence_id: string;
  detail: string;
}

/** Live server proof run */
export interface LiveServerProofRun {
  run_id: string;
  environment: ValidationEnvironmentState;
  results: LiveHTTPProofResult[];
  passed: number;
  failed: number;
  total: number;
  live_proven: number;
  function_only: number;
  proof_complete: boolean;
  created_at: string;
}

/** Validation environment state */
export interface ValidationEnvironmentState {
  server_running: boolean;
  host: string;
  port: number;
  latency_ms: number;
  validation_mode: 'live_network' | 'function_only' | 'not_available';
  timestamp: string;
}

/** Validation harness execution */
export interface ValidationHarnessExecution {
  execution_id: string;
  environment: ValidationEnvironmentState;
  phases: Array<{ phase: string; status: 'passed' | 'failed' | 'skipped'; detail: string }>;
  proof_run: LiveServerProofRun | null;
  created_at: string;
}

/** Live route evidence */
export interface LiveRouteEvidence {
  evidence_id: string;
  route: string;
  http_status: number;
  response_sample: string;
  middleware_decision: string;
  proof_level: string;
  created_at: string;
}

/** Final proof gap */
export interface FinalProofGap {
  area: string;
  gap_type: 'no_live_proof' | 'fallback_only' | 'failed_case' | 'stale_evidence';
  detail: string;
}

/** Go authorization gate */
export interface GoAuthorizationGate {
  gate_id: string;
  name: string;
  required_for_go: boolean;
  passed: boolean;
  proof_level: 'live_network' | 'function_only' | 'not_run';
  detail: string;
}

/** Go authorization confidence */
export interface GoAuthorizationConfidence {
  overall: 'fully_proven' | 'partially_proven' | 'not_proven';
  live_proof_cases: number;
  total_cases: number;
  detail: string;
}

/** Go authorization decision */
export interface GoAuthorizationDecision {
  decision_id: string;
  decision: 'go' | 'conditional_go' | 'no_go';
  confidence: GoAuthorizationConfidence;
  gates: GoAuthorizationGate[];
  proof_gaps: FinalProofGap[];
  overall_score: number;
  created_at: string;
}

/** Release authorization record */
export interface ReleaseAuthorizationRecord {
  record_id: string;
  decision: string;
  proof_level: string;
  gates_passed: number;
  gates_total: number;
  created_at: string;
}

/** Production authorization report */
export interface ProductionAuthorizationReport {
  report_id: string;
  authorization: GoAuthorizationDecision;
  live_proof: LiveServerProofRun | null;
  harness: ValidationHarnessExecution | null;
  created_at: string;
}

// ── Part 55: Inline Route Middleware Enforcement + Final Unconditional Go Proof ──

/** Route middleware binding */
export interface RouteMiddlewareBinding {
  route: string;
  method: string;
  guard_type: 'entitlement' | 'boundary' | 'isolation' | 'extension' | 'provider';
  tenant_param: string;
  enforced: boolean;
}

/** Route enforcement execution */
export interface RouteEnforcementExecution {
  route: string;
  guard_type: string;
  tenant_id: string;
  outcome: 'allow' | 'deny' | 'redact';
  http_status: number;
  detail: string;
  created_at: string;
}

/** HTTP guard decision */
export interface HTTPGuardDecision {
  allowed: boolean;
  status: number;
  outcome: 'allow' | 'deny' | 'redact';
  payload: unknown;
  reason: string;
}

/** Guarded route result */
export interface GuardedRouteResult {
  route: string;
  guard_applied: boolean;
  outcome: string;
  http_status: number;
  payload_redacted: boolean;
}

/** Route-level validation case */
export interface RouteLevelValidationCase {
  case_id: string;
  name: string;
  route: string;
  method: string;
  tenant_override: string;
  project_override: string;
  expected_status: number;
  expected_effect: 'allow' | 'deny' | 'redact';
}

/** Route-level validation run */
export interface RouteLevelValidationRun {
  run_id: string;
  server_running: boolean;
  results: Array<{
    case_id: string;
    case_name: string;
    route: string;
    expected_status: number;
    actual_status: number;
    expected_effect: string;
    actual_effect: string;
    response_sample: string;
    proof_level: 'route_proven' | 'partially_proven' | 'failed';
    evidence_id: string;
  }>;
  route_proven: number;
  partially_proven: number;
  failed: number;
  total: number;
  created_at: string;
}

/** Route proof evidence */
export interface RouteProofEvidence {
  evidence_id: string;
  route: string;
  http_status: number;
  guard_outcome: string;
  payload_sample: string;
  created_at: string;
}

/** Response guard effect */
export interface ResponseGuardEffect {
  route: string;
  effect: 'allowed' | 'denied_403' | 'redacted_200';
  reason: string;
}

/** Middleware binding coverage */
export interface MiddlewareBindingCoverage {
  total_protected: number;
  total_enforced: number;
  bindings: RouteMiddlewareBinding[];
  coverage_percent: number;
  created_at: string;
}

/** Final proof confidence */
export interface FinalProofConfidence {
  level: 'unconditional' | 'conditional' | 'insufficient';
  route_proven: number;
  total_cases: number;
  detail: string;
}

/** Final proof blocker */
export interface FinalProofBlocker {
  area: string;
  detail: string;
}

/** Unconditional Go report */
export interface UnconditionalGoReport {
  report_id: string;
  decision: 'unconditional_go' | 'conditional_go' | 'no_go';
  confidence: FinalProofConfidence;
  route_validation: RouteLevelValidationRun | null;
  middleware_coverage: MiddlewareBindingCoverage;
  proof_blockers: FinalProofBlocker[];
  overall_score: number;
  created_at: string;
}

// ── Part 56: Broad Route Protection Expansion + Mutation Guarding + Deep Redaction ──

/** Expanded route binding */
export interface ExpandedRouteBinding {
  route: string;
  method: string;
  guard_type: string;
  category: 'ship_critical' | 'sensitive_noncritical' | 'low_risk';
  status: 'fully_guarded' | 'partially_guarded' | 'not_guarded' | 'not_applicable';
}

/** Mutation guard rule */
export interface MutationGuardRule {
  route_pattern: string;
  method: 'POST' | 'PUT' | 'DELETE';
  guard_types: string[];
  enforced: boolean;
}

/** Mutation guard decision */
export interface MutationGuardDecision {
  route: string;
  method: string;
  allowed: boolean;
  outcome: 'allow' | 'deny' | 'redact_response' | 'require_approval';
  reason: string;
}

/** Redaction field rule */
export interface RedactionFieldRule {
  field_pattern: string;
  action: 'strip' | 'mask' | 'hash';
  reason: string;
}

/** Redaction rule set */
export interface RedactionRuleSet {
  category: string;
  fields: RedactionFieldRule[];
}

/** Redaction execution */
export interface RedactionExecution {
  record_id: string;
  route: string;
  fields_stripped: string[];
  fields_masked: string[];
  rule_applied: string;
  created_at: string;
}

/** Sensitive route category */
export interface SensitiveRouteCategory {
  category: string;
  routes: string[];
  guard_coverage: number;
}

/** Protection coverage delta */
export interface ProtectionCoverageDelta {
  before: number;
  after: number;
  new_guards: number;
  detail: string;
}

/** Route protection expansion report */
export interface RouteProtectionExpansionReport {
  report_id: string;
  bindings: ExpandedRouteBinding[];
  fully_guarded: number;
  partially_guarded: number;
  not_guarded: number;
  total: number;
  coverage_percent: number;
  categories: SensitiveRouteCategory[];
  delta: ProtectionCoverageDelta;
  created_at: string;
}

/** Mutation protection report */
export interface MutationProtectionReport {
  report_id: string;
  rules: MutationGuardRule[];
  enforced: number;
  total: number;
  coverage_percent: number;
  created_at: string;
}

/** Deep redaction report */
export interface DeepRedactionReport {
  report_id: string;
  rule_sets: RedactionRuleSet[];
  executions: RedactionExecution[];
  fields_stripped_total: number;
  fields_masked_total: number;
  created_at: string;
}

/** Protection regression check */
export interface ProtectionRegressionCheck {
  check_id: string;
  area: string;
  passed: boolean;
  detail: string;
}

// ── Part 57: Product UX Consolidation + Final Output Surfacing + Shippable App Shell ──

/** Product shell section */
export interface ProductShellSection {
  id: string;
  name: string;
  role: 'primary' | 'advanced' | 'operator_only';
  tab: string;
  has_content: boolean;
  state: 'shippable' | 'usable_but_noisy' | 'incomplete' | 'broken';
  detail: string;
}

/** Product shell route */
export interface ProductShellRoute {
  path: string;
  section: string;
  role: string;
}

/** Final task output */
export interface FinalTaskOutput {
  task_id: string;
  task_title: string;
  status: string;
  final_answer: string | null;
  summary: string | null;
  artifacts: FinalOutputArtifact[];
  report_paths: string[];
  files_changed: string[];
  created_at: string;
}

/** Final output artifact */
export interface FinalOutputArtifact {
  type: 'report' | 'code_change' | 'answer' | 'approval';
  title: string;
  path: string;
  preview: string;
}

/** Task result surface */
export interface TaskResultSurface {
  has_final_answer: boolean;
  has_artifacts: boolean;
  has_report: boolean;
  surfacing_quality: 'good' | 'partial' | 'missing';
}

/** Task experience state */
export interface TaskExperienceState {
  task_id: string;
  lifecycle_stage: 'request' | 'deliberation' | 'plan' | 'approvals' | 'execution' | 'result';
  has_board_interpretation: boolean;
  has_plan: boolean;
  has_final_result: boolean;
  result_surfaced: boolean;
}

/** Entry point definition */
export interface EntryPointDefinition {
  name: string;
  tab: string;
  role: 'primary' | 'advanced' | 'operator_only';
  description: string;
}

/** Primary workflow step */
export interface PrimaryWorkflowStep {
  step: number;
  name: string;
  surface: string;
  description: string;
}

/** Shell clutter issue */
export interface ShellClutterIssue {
  tab: string;
  issue: string;
  severity: 'high' | 'medium' | 'low';
  fix: string;
}

/** Output surfacing report */
export interface OutputSurfacingReport {
  report_id: string;
  tasks_checked: number;
  with_final_answer: number;
  missing_answer: number;
  surfacing_quality: string;
  issues: string[];
  created_at: string;
}

/** UX consolidation report */
export interface UXConsolidationReport {
  report_id: string;
  sections: ProductShellSection[];
  entry_points: EntryPointDefinition[];
  primary_workflow: PrimaryWorkflowStep[];
  clutter_issues: ShellClutterIssue[];
  shippable: number;
  total: number;
  created_at: string;
}

/** Shippable surface state */
export interface ShippableSurfaceState {
  tab: string;
  shippable: boolean;
  reason: string;
}

// ── Part 58: Engine Catalog + Output Contracts + Mission Acceptance Suite ──

/** Engine definition */
export interface EngineDefinition {
  engine_id: string;
  name: string;
  description: string;
  capabilities: string[];
  default_output: DeliverableType;
  approval_model: 'auto' | 'operator_review' | 'explicit_approval';
  icon: string;
}

/** Engine capability */
export interface EngineCapability {
  capability: string;
  description: string;
}

/** Engine default output */
export interface EngineDefaultOutput {
  engine_id: string;
  output_type: DeliverableType;
  fields: string[];
}

/** Deliverable type */
export type DeliverableType = 'ranked_list' | 'document' | 'code_change' | 'recommendation' | 'schedule' | 'creative_draft' | 'analysis' | 'action_plan';

/** Output contract */
export interface OutputContract {
  engine_id: string;
  required_fields: string[];
  optional_fields: string[];
  approval_required: boolean;
  final_action: string;
  example_deliverable: string;
}

/** Deliverable contract */
export interface DeliverableContract {
  type: DeliverableType;
  required_visible: string[];
  approval_gate: boolean;
}

/** Approval requirement */
export interface ApprovalRequirement {
  engine_id: string;
  when: string;
  type: 'operator_review' | 'explicit_approval' | 'auto';
}

/** Final action contract */
export interface FinalActionContract {
  engine_id: string;
  action: string;
  requires_approval: boolean;
}

/** Task closure state */
export type TaskClosureState = 'final_deliverable_visible' | 'awaiting_operator_approval' | 'blocked_with_remediation' | 'action_executed_with_proof' | 'failed_with_reason';

/** Task deliverable status */
export interface TaskDeliverableStatus {
  task_id: string;
  engine_id: string;
  closure_state: TaskClosureState;
  deliverable_visible: boolean;
  contract_satisfied: boolean;
  missing_fields: string[];
  remediation: string | null;
  best_partial: string | null;
}

/** Mission acceptance case */
export interface MissionAcceptanceCase {
  case_id: string;
  engine_id: string;
  request: string;
  expected_deliverable: string;
  expected_approval: string;
  expected_action: string;
  required_tools: string[];
  failure_if: string;
  status: 'seeded' | 'passed' | 'failed' | 'not_run';
}

/** Mission acceptance run */
export interface MissionAcceptanceRun {
  run_id: string;
  engine_id: string;
  cases_total: number;
  cases_passed: number;
  cases_failed: number;
  cases_not_run: number;
  created_at: string;
}

/** Acceptance expectation */
export interface AcceptanceExpectation {
  field: string;
  required: boolean;
  present: boolean;
}

/** Acceptance failure mode */
export interface AcceptanceFailureMode {
  case_id: string;
  reason: string;
  remediation: string;
}

/** Engine test scenario */
export interface EngineTestScenario {
  scenario_id: string;
  engine_id: string;
  description: string;
  input: string;
  expected_output_type: DeliverableType;
}

/** Result contract validation */
export interface ResultContractValidation {
  task_id: string;
  engine_id: string;
  contract_met: boolean;
  violations: string[];
}

/** Deliverable visibility report */
export interface DeliverableVisibilityReport {
  report_id: string;
  tasks_checked: number;
  visible: number;
  invisible: number;
  blocked: number;
  violations: Array<{ task_id: string; engine_id: string; issue: string }>;
  created_at: string;
}

/** Engine catalog summary */
export interface EngineCatalogSummary {
  engines: EngineDefinition[];
  total: number;
  with_contracts: number;
  acceptance_cases: number;
  created_at: string;
}

// ── Part 59: Structured Deliverables + Contract Enforcement + Rendering ──

export interface NewsroomDeliverable { kind: 'newsroom'; engineId: string; title: string; generatedAt: string; rankedItems: Array<{ rank: number; headline: string; summary: string; source: { name: string; url: string }; score?: number; tags?: string[] }>; methodology?: string; }
export interface ShoppingDeliverable { kind: 'shopping'; engineId: string; title: string; generatedAt: string; items: Array<{ name: string; price: { amount: number; currency: string }; url?: string; pros: string[]; cons: string[]; specs?: Record<string, string | number | boolean>; score?: number }>; comparisonKeys: string[]; }
export interface CodeChangeDeliverable { kind: 'code_change'; engineId: string; title: string; generatedAt: string; diffs: Array<{ filePath: string; changeType: 'add' | 'modify' | 'delete' | 'rename'; before?: string; after?: string; hunks?: Array<{ header: string; lines: string[] }>; rationale?: string }>; testNotes?: string; }
export interface DocumentDeliverable { kind: 'document'; engineId: string; title: string; generatedAt: string; sections: Array<{ heading: string; content: string; anchors?: string[] }>; references?: Array<{ label: string; url?: string }>; }
export interface RecommendationDeliverable { kind: 'recommendation'; engineId: string; title: string; generatedAt: string; recommendations: Array<{ label: string; rationale: string; confidence?: number; action?: { type: string; payload?: Record<string, unknown> } }>; }
export interface ScheduleDeliverable { kind: 'schedule'; engineId: string; title: string; generatedAt: string; events: Array<{ start: string; end: string; title: string; location?: string; attendees?: string[] }>; }
export interface CreativeDraftDeliverable { kind: 'creative_draft'; engineId: string; title: string; generatedAt: string; artifacts: Array<{ type: 'poem' | 'script' | 'lyrics' | 'story' | 'beat_sheet' | 'premise'; content: string }>; }
export interface AnalysisDeliverable { kind: 'analysis'; engineId: string; title: string; generatedAt: string; findings: Array<{ label: string; detail: string }>; charts?: Array<{ type: string; data: unknown }>; }
export interface ActionPlanDeliverable { kind: 'action_plan'; engineId: string; title: string; generatedAt: string; steps: Array<{ id: string; description: string; owner?: string; eta?: string; status?: 'todo' | 'in_progress' | 'done' }>; risks?: Array<{ risk: string; mitigation: string }>; }

export type StructuredDeliverable = NewsroomDeliverable | ShoppingDeliverable | CodeChangeDeliverable | DocumentDeliverable | RecommendationDeliverable | ScheduleDeliverable | CreativeDraftDeliverable | AnalysisDeliverable | ActionPlanDeliverable;

export type RendererKey = 'newsroom_list' | 'shopping_table' | 'code_diff' | 'document_sections' | 'recommendation_list' | 'schedule_timeline' | 'creative_view' | 'analysis_brief' | 'action_plan_steps';

export interface RenderModel { rendererKey: RendererKey; title: string; meta?: Record<string, string | number | boolean>; items?: Array<Record<string, unknown>>; table?: { columns: string[]; rows: Array<Record<string, unknown>> }; diffs?: Array<{ filePath: string; changeType: string; hunks?: Array<{ header: string; lines: string[] }> }>; sections?: Array<{ heading: string; content: string }>; steps?: Array<{ id: string; description: string; status?: string }>; timeline?: Array<{ start: string; end: string; title: string; location?: string }>; badges?: string[]; }
export interface DeliverableRendererDef { key: RendererKey; render(model: RenderModel, opts?: { compact?: boolean }): string; }
export interface ContractEnforcementResult { status: 'pass' | 'soft_fail' | 'hard_fail'; missingFields: string[]; details?: Array<{ field: string; message: string }>; suggestions?: string[]; }
export interface BoardContractContext { engineId: string; outputType: DeliverableType; contractVersion: string; requiredFields: string[]; examples?: Array<{ description: string; json: unknown }>; rubric?: string; }
export interface RemediationChecklist { items: Array<{ id: string; label: string; fixHint: string; owner: 'agent' | 'operator' }>; }

// ── Part 60: Deliverable Identity + Versioned Store + Migration ──

export type DeliverableStatus = 'draft' | 'proposed' | 'approved' | 'rejected' | 'superseded';

export interface DeliverableKey {
  projectId: string;
  taskId: string;
  variant: StructuredDeliverable['kind'];
  contractVersion: string;
}

export interface DeliverableVersionMeta {
  deliverableId: string;
  version: number;
  status: DeliverableStatus;
  contentHash: string;
  createdAt: string;
  createdBy: 'agent' | 'operator' | 'system';
  parentVersion: number | null;
  note?: string;
}

export interface StoredDeliverable {
  meta: DeliverableVersionMeta;
  content: StructuredDeliverable;
  provenance: Record<string, Array<{ subtaskId: string; stepType: string; fieldHash: string }>>;
}

export interface DeliverableIndexEntry {
  deliverableId: string;
  key: DeliverableKey;
  latestVersion: number;
  approvedVersion: number | null;
  status: DeliverableStatus;
  createdAt: string;
  updatedAt: string;
}

export interface DeliverableStoreIndex {
  entries: Record<string, DeliverableIndexEntry>;
  totalDeliverables: number;
  totalVersions: number;
}

export interface MigrationResult {
  migrated: number;
  skipped: number;
  errors: string[];
  created_at: string;
}

// ── Part 61: Merge Pipeline + Merge-Time Enforcement + Strategy Registry ──

export type MergeStrategyKey = 'replace' | 'append' | 'union_dedupe' | 'pick_best' | 'structural_merge';

export interface MergeStrategy {
  key: MergeStrategyKey;
  description: string;
}

export interface MergePolicy {
  variant: StructuredDeliverable['kind'];
  fieldStrategies: Record<string, MergeStrategyKey>;
}

export interface MergeResult {
  merged: StructuredDeliverable;
  fieldsUpdated: string[];
  fieldsSkipped: string[];
  conflicts: Array<{ field: string; reason: string; resolution: string }>;
  provenance: Record<string, Array<{ subtaskId: string; stepType: string; fieldHash: string }>>;
}

export interface MergeFragment {
  subtaskId: string;
  engine: string;
  content: Record<string, unknown>;
  stepType: string;
}

export interface MergeTimeEnforcementResult {
  passed: boolean;
  violations: Array<{ field: string; message: string }>;
  warnings: Array<{ field: string; message: string }>;
}

// ── Part 62: Evidence Linking + Deliverable Approval Lifecycle ──

export interface EvidenceRef {
  kind: 'artifact' | 'trace' | 'url' | 'subtask';
  ref: string;
  label?: string;
}

export interface DeliverableApprovalRequest {
  request_id: string;
  deliverable_id: string;
  version: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  decided_at?: string;
  decided_by?: string;
  reason?: string;
}

export interface EvidenceLinkReport {
  deliverable_id: string;
  version: number;
  total_refs: number;
  artifact_refs: number;
  subtask_refs: number;
  url_refs: number;
}

// ── Part 64: Release Candidate Assembly + Lockfiles + Diff ──

export interface LockfileEntry {
  key: string;
  type: DeliverableType;
  variant: string;
  deliverableId: string;
  version: number;
  contentHash: string;
  evidenceRefs: string[];
}

export interface ReleaseLockfile {
  lockfile_id: string;
  project: string;
  channel: string;
  entries: LockfileEntry[];
  entries_hash: string;
  created_at: string;
  created_by: string;
  base_release_id?: string;
}

export interface AssemblyCandidate {
  candidate_id: string;
  status: 'pending' | 'promoted' | 'rejected';
  project: string;
  channel: string;
  lockfile_id: string;
  entry_count: number;
  created_at: string;
  created_by: string;
}

export interface ReleaseDiffStat {
  added: number;
  removed: number;
  changed: number;
  unchanged: number;
}

export interface ReleaseLockfileDiff {
  a_id: string;
  b_id: string;
  stat: ReleaseDiffStat;
  changes: Array<{ key: string; type: string; from_hash?: string; to_hash?: string; change: 'added' | 'removed' | 'changed' | 'unchanged' }>;
}

export interface ReleaseRecord {
  release_id: string;
  project: string;
  channel: string;
  lockfile_id: string;
  created_at: string;
  created_by: string;
  supersedes?: string;
}

// ── Part 65: Runtime Pipeline Integration ──

export type ContractSatisfactionStatus = 'pending' | 'partial' | 'satisfied' | 'violated';

export interface RuntimeDeliverableState {
  task_id: string;
  deliverable_id: string;
  engine_id: string;
  scaffold_created: boolean;
  fields_populated: string[];
  fields_missing: string[];
  contract_status: ContractSatisfactionStatus;
  merge_count: number;
  last_merge_at: string | null;
  created_at: string;
}

export interface RuntimeDeliverableSummary {
  total_tasks: number;
  with_deliverables: number;
  satisfied: number;
  partial: number;
  pending: number;
  violated: number;
}

// ── Part 67: Contract-Aware Prompt Augmentation + Structured Output Extraction ──

export type GPO_StructuredMode = 'native-json' | 'tool-call' | 'mime-json' | 'prompt-sentinel';

export interface GPO_SchemaEnvelope {
  contractId: string;
  version: string;
  schemaHash: string;
  jsonSchema: any;
  schemaSummary: string;
}

export interface GPO_PromptEnvelope {
  promptId: string;
  mode: GPO_StructuredMode;
  system: string;
  user: string;
  instructions: string;
  sentinelStart?: string;
  sentinelEnd?: string;
  providerHints?: Record<string, any>;
}

export interface GPO_StructuredExtraction<T = any> {
  ok: boolean;
  value?: T;
  errors?: string[];
  raw: string;
  usedMode: GPO_StructuredMode;
  schema: GPO_SchemaEnvelope;
  promptId: string;
  tokensIn?: number;
  tokensOut?: number;
  durationMs?: number;
  attempts: number;
}

export interface GPO_FieldMappingResult {
  updatedFields: string[];
  skippedFields: string[];
  rejectedFields: string[];
  diffs: Record<string, { before: any; after: any }>;
}

export interface GPO_ContractAwareConfig {
  enabled: boolean;
  acceptNonStrict: boolean;
  maxParseAttempts: number;
  maxResponseBytes: number;
  providerModes: Partial<Record<string, GPO_StructuredMode>>;
  sentinel: { start: string; end: string };
  boardStructuredEnabled?: boolean;
  workerStructuredEnabled?: boolean;
  providerRouting?: 'force-config' | 'capability-preferred' | 'legacy';
  backoffMs?: number;
  backoffMultiplier?: number;
  backoffJitter?: number;
  exposeStatusToOperator?: boolean;
  allowManualRetry?: boolean;
}

// ── Part 68: Board + Worker Structured Integration + Retry + Provider-Aware Routing ──

export type GPO_ProviderMode = 'native-json' | 'mime-json' | 'prompt-sentinel';

export interface GPO_ProviderCapability {
  id: string;
  modes: GPO_ProviderMode[];
  supportsStructured: boolean;
  supportsNativeJson: boolean;
  supportsMimeJson: boolean;
  supportsPromptSentinel: boolean;
  maxJsonTokens?: number;
  notes?: string;
}

export interface GPO_ProviderRoutingDecision {
  providerId: string;
  mode: GPO_ProviderMode;
  structuredPath: boolean;
  featureFlagActive: boolean;
  parseRetriesPlanned: number;
  reason: string;
}

export interface GPO_StructuredIOAttempt {
  attempt: number;
  mode: GPO_ProviderMode;
  providerId: string;
  startedAt: string;
  endedAt?: string;
  durationMs?: number;
  success: boolean;
  errorCode?: string;
  errorMessage?: string;
  fieldsExtracted?: number;
  fieldsMissing?: string[];
  evidenceId?: string;
}

export interface GPO_StructuredIOStatus {
  enabled: boolean;
  taskId: string;
  phase?: string;
  providerId: string;
  providerMode: GPO_ProviderMode;
  attempts: GPO_StructuredIOAttempt[];
  maxAttempts: number;
  status: 'idle' | 'in-progress' | 'partial' | 'complete' | 'failed' | 'disabled' | 'fallback';
  fieldsExtracted?: number;
  fieldsMissing?: string[];
  lastErrorCode?: string;
  lastErrorMessage?: string;
  totalDurationMs?: number;
}

export interface GPO_BoardPhaseOutput {
  phase: BoardLifecyclePhase;
  summary: string;
  decisions?: string[];
  risks?: string[];
  subtasks?: any[];
  requiredFieldsCovered?: string[];
  missingFields?: string[];
  contractHints?: Record<string, any>;
}

// ── Part 69: Structured I/O Observability + Metrics + Provider Learning + Evidence Lifecycle ──

export interface StructuredIoEvent {
  id: string;
  taskId: string | null;
  subtaskId: string | null;
  deliverableId: string | null;
  schemaId: string;
  phase: 'scaffold' | 'plan' | 'deliberate' | 'execute' | 'merge' | 'validate' | 'complete';
  providerKey: string;
  capability: 'native-json' | 'mime-json' | 'sentinel';
  attempt: number;
  startedAt: number;
  endedAt: number;
  latencyMs: number;
  outcome: 'success' | 'parse_failure' | 'provider_error' | 'timeout' | 'rate_limited' | 'cancelled';
  errorCode?: string;
  errorMessageRedacted?: string;
  retryCount: number;
  inputTokens?: number;
  outputTokens?: number;
  costUsd?: number;
}

export interface ProviderMetrics {
  providerKey: string;
  totalCalls: number;
  successRate: number;
  parseFailureRate: number;
  providerErrorRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  avgAttempts: number;
  totalCostUsd: number;
  dynamicScore: number;
  samples: number;
  circuitOpen: boolean;
  lastUpdated: number;
}

export interface SchemaMetrics {
  schemaId: string;
  totalCalls: number;
  successRate: number;
  avgLatencyMs: number;
  avgAttempts: number;
}

export interface StructuredIoMetricsSnapshot {
  windowStart: number;
  windowEnd: number;
  totalCalls: number;
  successRate: number;
  parseFailureRate: number;
  providerErrorRate: number;
  avgLatencyMs: number;
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  retryRate: number;
  avgAttempts: number;
  totalCostUsd: number;
  byProvider: Record<string, ProviderMetrics>;
  bySchema: Record<string, SchemaMetrics>;
}

export interface ProviderLearningConfig {
  weights: { successRate: number; latency: number; cost: number };
  minSamples: number;
  decay: 'ewma' | 'sliding';
  alpha: number;
  circuitBreaker: {
    failureRateThreshold: number;
    minimumCalls: number;
    sleepWindowMs: number;
  };
}

export interface StructuredIoConfig {
  metrics: {
    latencyBucketsMs: number[];
    aggregationWindowMinutes: number;
    retentionHours: number;
  };
  providerLearning: ProviderLearningConfig;
  evidence: {
    ttlDays: number;
    cleanupIntervalMinutes: number;
    maxBytes: number;
  };
  alerts: {
    parseFailureRateThreshold: number;
    providerErrorRateThreshold: number;
    minCalls: number;
    evaluationIntervalMinutes: number;
    cooldownMinutes: number;
  };
  cost: {
    providerPricing: Record<string, { inputPer1k: number; outputPer1k: number }>;
    defaultPricing: { inputPer1k: number; outputPer1k: number };
  };
}

export interface StructuredIoAlert {
  id: string;
  kind: 'parse_spike' | 'provider_error_spike' | 'cost_spike';
  providerKey?: string;
  windowStart: number;
  windowEnd: number;
  observedRate?: number;
  threshold: number;
  totalCalls: number;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: number;
  details: string;
}

// ── Part 70: Parallel Execution Engine + Resource-Aware Scheduling + Backpressure ──

export type ProviderKey = 'openai' | 'anthropic' | 'google' | 'perplexity' | string;
export type QueuePriority = 'critical' | 'high' | 'normal' | 'low';

export interface SchedulerFeatureFlags {
  enabled: boolean;
  enableFairSharing: boolean;
  enableDeadLetter: boolean;
  enableDynamicBackpressure: boolean;
}

export interface SchedulerConfig {
  version: 1;
  featureFlags: SchedulerFeatureFlags;
  globalMaxConcurrent: number;
  defaultTimeoutMs: number;
  perProviderMaxConcurrent: Record<ProviderKey, number>;
  perTenantMaxConcurrent: Record<string, number>;
  perProjectMaxConcurrent: Record<string, number>;
  queueCapacity: number;
  inFlightLeaseMs: number;
  maxAttempts: number;
  initialRetryDelayMs: number;
  maxRetryDelayMs: number;
  fairnessWeights: {
    tenant: Record<string, number>;
    project: Record<string, number>;
  };
}

export interface BackpressureSignal {
  provider: ProviderKey;
  reason: 'p95_slow' | 'error_spike' | 'breaker_open' | 'rate_limited' | 'budget_throttle';
  factor: number;
  observed: {
    p95LatencyMs?: number;
    errorRate?: number;
    open?: boolean;
    lastStatusCodes?: number[];
    budgetRemaining?: number;
  };
  ttlMs: number;
  at: string;
}

export interface CapacityWindow {
  provider: ProviderKey;
  baseLimit: number;
  dynamicLimit: number;
  inUse: number;
  available: number;
  signals: BackpressureSignal[];
}

export interface QueueItemKey {
  runId: string;
  nodeId: string;
}

export interface ExecutionAttemptRecord {
  attemptId: string;
  startedAt: string;
  finishedAt?: string;
  status: 'in_progress' | 'succeeded' | 'failed' | 'canceled' | 'expired';
  errorCode?: string;
  errorMessage?: string;
  provider?: ProviderKey;
  durationMs?: number;
}

export interface QueueItem {
  id: string;
  key: QueueItemKey;
  projectId: string;
  tenantId: string;
  provider: ProviderKey;
  priority: QueuePriority;
  enqueuedAt: string;
  leasedBy?: string;
  leaseExpiresAt?: string;
  attempts: ExecutionAttemptRecord[];
  status: 'queued' | 'in_flight' | 'done' | 'dead_letter' | 'canceled';
  reason?: string;
  payloadRef: {
    contractId: string;
    subtaskSpecRef: string;
  };
  deps: string[];
  dependents: string[];
  ready: boolean;
  timeoutMs?: number;
  costEstimateCents?: number;
}

export interface QueueStats {
  total: number;
  queued: number;
  inFlight: number;
  done: number;
  deadLetter: number;
  byProvider: Record<ProviderKey, { queued: number; inFlight: number }>;
  byPriority: Record<QueuePriority, number>;
  byTenant: Record<string, number>;
  byProject: Record<string, number>;
  capacityWindows: CapacityWindow[];
  saturation: number;
  avgWaitMs?: number;
  p95WaitMs?: number;
}

export interface SchedulerStateSnapshot {
  config: SchedulerConfig;
  stats: QueueStats;
  paused: boolean;
  updatedAt: string;
}

export interface RunProgress {
  runId: string;
  graphNodes: number;
  completed: number;
  blocked: number;
  ready: number;
  failed: number;
  criticalPathMs?: number;
  startedAt: string;
  updatedAt: string;
}

// ── Part 72: TopRanker Engine Deep Integration ──

export interface TopRankerCategory { id: string; name: string; slug: string; }

export interface TopRankerLeaderboardEntry {
  businessId: string; name: string; rank: number; score: number; confidence: number;
  city: string; category: string;
  verificationStatus: 'unverified' | 'pending' | 'verified';
  signals: { reviews: number; avgRating: number; recencyBias: number; wilsonScore: number; volumeWeight: number; };
  rationale: string; computedAt: string;
}

export interface TopRankerBusinessScorecard {
  businessId: string; name: string; city: string; category: string;
  kpis: { trust: number; responsiveness: number; satisfaction: number; consistency: number; };
  riskFlags: { suspiciousActivity: boolean; conflictingInfo: boolean; lowVolume: boolean; };
  notes: string[]; computedAt: string;
}

export interface TopRankerReviewAggregation {
  businessId: string;
  period: { from: string; to: string; windowDays: number; };
  sources: Array<{ source: 'google' | 'yelp' | 'facebook' | 'opentable' | 'other'; count: number; avgRating: number; lastReviewAt?: string; }>;
  sentiment: { positive: number; neutral: number; negative: number; };
  sampleSnippets: Array<{ text: string; sentiment: 'positive' | 'neutral' | 'negative'; source: string; capturedAt: string; }>;
  aggregationMethod: 'bayesian' | 'wilson' | 'hybrid'; computedAt: string;
}

export interface TopRankerReleaseArtifact {
  artifactId: string; repoPath: string; commitSha?: string; buildNumber?: string;
  platform: 'server' | 'mobile' | 'web'; filePath: string;
  sizeBytes: number; checksumSha256: string; createdAt: string;
}

// ── Part 73: Mission Control Dashboard + Operator Notifications ──

export type MCHealth = 'green' | 'yellow' | 'red';

export interface MissionControlSummary {
  timestamp: number;
  health: MCHealth;
  counts: {
    workflowsActive: number; workflowsStuck: number; pendingApprovals: number;
    openAlerts: number; recentDeliverables: number; providersDegraded: number;
    queueDepth: number; runningTasks: number;
  };
  notes?: string[];
}

export type NotificationSeverity = 'low' | 'medium' | 'high' | 'urgent';

export type NotificationType =
  | 'approval.requested' | 'alert.fired' | 'provider.circuit.open' | 'provider.circuit.closed'
  | 'workflow.stuck' | 'workflow.failed' | 'deliverable.pending-approval' | 'release.ready' | 'system.info';

export interface NotificationAction {
  label: string;
  action: 'viewWorkflow' | 'viewApproval' | 'viewAlerts' | 'viewDeliverable' | 'viewRelease' | 'noop';
  ref?: { kind: string; id: string };
}

export interface GPO_Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  createdAt: number;
  readAt?: number;
  acknowledgedAt?: number;
  actions?: NotificationAction[];
}

export interface NotificationBadgeCounts {
  unread: number;
  unackedAlerts: number;
  pendingApprovals: number;
}

export interface MissionControlPayload {
  summary: MissionControlSummary;
  workflows: any[];
  providers: any[];
  scheduler: any;
  alerts: any[];
  deliverables: any[];
  approvals: any[];
  badgeCounts: NotificationBadgeCounts;
}
