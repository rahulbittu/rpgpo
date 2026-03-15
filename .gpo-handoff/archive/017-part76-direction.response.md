```
You are the GPO/RPGPO implementation agent. Implement Part 76 end-to-end.

Title: Part 76 — Conversational Task Refinement + Task Chaining

Do not change or break existing working functionality. Preserve route guards, deep redaction, state formats, and governance. Use existing patterns: raw Node.js HTTP, CommonJS TypeScript, JSON file state, inline guards, deep redaction, Chief of Staff orchestration, worker hooks. Prefer typed, contract-driven designs. Add only the modules, routes, types, and UI specified. Ensure all tests pass.

Baseline
- Repo: RPGPO/04-Dashboard/app
- Current: 120+ TS modules, ~870 routes, ~560+ types, 211+ tests
- Pipeline: submit → auto-deliberate → auto-approve → execute → report (context injection, subtask chaining)
- Part 75 ongoing: persistent learning store, provider perf learning, prompt pattern learning, operator decision patterns, knowledge base, cross-session persistence
- UI: operator.js/css, COS brief, 12 templates, inline reports, proactive suggestions

Goals
1) Real-time conversation per task
   - Operator can converse with AI while a task is executing
   - AI streams reasoning highlights, progress, questions, and interim outputs
   - Operator can refine, redirect, pause/resume/cancel with policy enforcement
   - Conversation is part of evidence and audit chain; redaction and guards apply
2) Task chaining
   - Define chain rules/spec per task
   - Automatically create/schedule follow-up tasks when a task completes
   - Clean mapping of completed task outputs/deliverables to next task inputs
   - Visible in UI; operator can trigger, approve, or edit chained tasks

Non-goals
- No WebSockets. Use SSE with long-poll fallback.
- No database migration; continue file-based state.
- No change to existing task execution semantics unless gated behind feature flags.

Feature flags
- settings/state/features.json: { "conversationalRefinement": true, "taskChaining": true }
- Implement flags in modules and server routes to allow safe disable.

Modules — Add
1) lib/sse.ts
   - Exports:
     - createSSEStream(res: http.ServerResponse, opts: { heartbeatMs?: number }): SSEStream
     - sendSSE(stream: SSEStream, event: string, data: unknown): void
     - closeSSE(stream: SSEStream): void
   - Types:
     - interface SSEStream { id: string; res: http.ServerResponse; closed: boolean; heartbeat?: NodeJS.Timeout }
   - Behavior:
     - Sets headers for text/event-stream; keep-alive; no-cache; CORS consistent with server
     - Heartbeat comment frames every opts.heartbeatMs (default 15s)
     - Integrate with http-response-guard for finalization

2) lib/conversation.ts
   - Responsibilities: per-task conversation lifecycle, message validation, persistence, integration with redaction/audit, event emission to SSE
   - Exports:
     - openConversation(taskId: string, by: Actor): ConversationThread
     - appendMessage(taskId: string, msg: ConversationMessage, by: Actor): ConversationMessage
     - getConversation(taskId: string): ConversationThread
     - streamEvents(taskId: string, stream: SSEStream, by: Actor): void
     - publishEvent(taskId: string, evt: ConversationEvent): void
     - applyDirective(taskId: string, directive: RuntimeDirective, by: Actor): DirectiveResult
   - Internal:
     - file paths: state/task-conversations/{taskId}.json, state/task-conversations/{taskId}-events.log
     - redact outbound content via deep-redaction.ts based on route visibility and actor
     - link each message/event to evidence chain (artifact/evidence ids)
     - persist idempotently using deterministic IDs (hash of taskId + timestamp + by + body)

3) lib/runtime-directives.ts
   - Responsibilities: represent and validate operator directives that can affect a running task
   - Exports:
     - validateDirective(d: RuntimeDirective, task: Task): ValidationResult
     - mergeDirectiveIntoPlan(taskId: string, d: RuntimeDirective): MergeResult
     - computePromptAugmentations(taskId: string): PromptAugmentationBundle
   - Integrates with Part 67 contract-aware prompt builder if present (fallback to heuristic merge)
   - Enforces budgets, provider governance, and route/mutation guards

4) lib/task-refinement.ts
   - Responsibilities: turn conversation messages into refinements, approvals, or constraints
   - Exports:
     - inferRefinementFromMessage(msg: ConversationMessage): RuntimeDirective | null
     - recordRefinement(taskId: string, directive: RuntimeDirective, by: Actor): DirectiveResult
   - Side effects:
     - Updates task runtime state: state/tasks/{taskId}.json runtime.patch
     - Notifies worker via publishEvent

5) lib/task-chaining.ts
   - Responsibilities: chain spec management, rule validation, chaining execution
   - Exports:
     - upsertChainSpec(taskId: string, spec: TaskChainSpec, by: Actor): TaskChainSpec
     - getChainSpec(taskId: string): TaskChainSpec | null
     - evaluateChainOnCompletion(task: Task, deliverables: Deliverable[]): ChainEvaluationResult
     - createChainedTasks(parentTaskId: string, result: ChainEvaluationResult, by: Actor): ChainedTaskResult
   - Files:
     - state/task-chains/{taskId}.json
     - Links: child tasks store parent linkage in state/tasks/{childTaskId}.json parentTaskId + link metadata
   - Integrates with artifact registry; copies evidence refs

6) lib/chain-executor.ts
   - Responsibilities: orchestrate post-completion chain execution, approvals, and scheduling
   - Exports:
     - onTaskCompleteForChaining(taskId: string): Promise<void>
   - Wires into existing onTaskComplete hook (Part 65)

7) lib/conversation-renderer.ts
   - Responsibilities: transform system/worker events into operator-visible summaries
   - Exports:
     - toOperatorEvent(evt: ConversationEvent, role: 'operator' | 'system'): OperatorEvent
     - summarizeReasoning(evt: ConversationEvent): string

Modules — Modify
1) lib/types.ts
   - Add:
     - type ConversationRole = 'operator' | 'assistant' | 'system' | 'tool' | 'policy'
     - interface ConversationMessage {
         id: string; taskId: string; createdAt: string; role: ConversationRole;
         content: string; contentFormat: 'text' | 'json' | 'markdown';
         attachments?: { type: 'artifact' | 'evidence'; id: string; label?: string }[];
         redaction?: { strategy: 'strip' | 'mask'; fields: string[] };
         meta?: { provider?: string; model?: string; cost?: number; latencyMs?: number; subtaskId?: string; };
         by: Actor; // existing type
       }
     - interface ConversationEvent {
         id: string; taskId: string; at: string; kind: 'progress' | 'reason' | 'question' | 'intermediate-output' | 'subtask' | 'policy' | 'directive' | 'error' | 'complete';
         payload: unknown; // ensure redaction before emit
         relatedMessageId?: string; subtaskId?: string; severity?: 'info' | 'warn' | 'error';
       }
     - interface ConversationThread {
         taskId: string; openedAt: string; openedBy: Actor; messages: ConversationMessage[]; status: 'open' | 'closed';
       }
     - type DirectiveKind = 'pause' | 'resume' | 'cancel' | 'redirect' | 'set-constraint' | 'approve' | 'reject' | 'add-subtask' | 'set-budget' | 'set-provider' | 'augment-prompt' | 'answer-question';
     - interface RuntimeDirective {
         id: string; taskId: string; at: string; by: Actor; kind: DirectiveKind;
         payload: Record<string, unknown>; rationale?: string;
       }
     - interface ValidationResult { ok: boolean; errors?: string[]; warnings?: string[]; }
     - interface MergeResult { ok: boolean; planPatch?: Record<string, unknown>; applied: boolean; }
     - interface PromptAugmentationBundle {
         systemAddendum?: string; userAddendum?: string; toolContext?: Record<string, unknown>;
         contractFields?: Record<string, unknown>; // align with deliverable schema
       }
     - interface TaskChainSpec {
         id: string; taskId: string; createdAt: string; createdBy: Actor;
         rules: ChainRule[]; autoExecute: boolean; requireApproval: boolean; name?: string; description?: string;
       }
     - interface ChainRule {
         id: string; name: string; when: { deliverableType?: string; status?: 'validated' | 'approved' | 'any'; predicate?: string; /* safe JS expr with sandbox */ };
         produce: {
           templateId?: string; // reuse 12 templates if set
           task: { title: string; description: string; projectId?: string; labels?: string[]; };
           inputMapping: Array<{ from: 'deliverable' | 'field' | 'artifact' | 'static'; path?: string; key?: string; value?: unknown }>;
           constraints?: { budgetUsd?: number; provider?: string; deadline?: string; };
         };
         approval?: { required: boolean; approverRole?: string };
       }
     - interface ChainEvaluationResult {
         rulesEvaluated: number; matches: Array<{ ruleId: string; mappedInput: Record<string, unknown>; templateId?: string }>;
       }
     - interface ChainedTaskResult {
         createdTaskIds: string[]; parentTaskId: string; links: Array<{ childTaskId: string; ruleId: string }>;
       }
     - interface OperatorEvent { id: string; at: string; event: string; text?: string; data?: unknown; }

2) lib/chief-of-staff.ts
   - Add exports:
     - registerDirectiveListener(fn: (taskId: string, d: RuntimeDirective) => void): void
     - applyRuntimeDirective(taskId: string, d: RuntimeDirective, by: Actor): DirectiveResult
   - Wire directive handling into runtime planning and prompt augmentation
   - Ensure policy budget and escalation integration

3) lib/worker.ts (or the worker module in place)
   - Emit ConversationEvents during:
     - Task start, provider call start/finish, subtask propose/execute, deliverable merge/validate, errors, completion
   - Listen for directives via a shared in-memory bus + persisted queue:
     - lib/conversation.ts publishEvent/applyDirective to post messages; worker loop checks for directives on interval (250ms) or event-driven via EventEmitter
   - Enforce pause/resume/cancel semantics
   - Modify prompt construction to include PromptAugmentationBundle from runtime-directives

4) lib/deliberation.ts (if present)
   - Include conversation-derived augmentations and contract fields in provider prompt
   - Emit 'question' events when missing information; await operator answer if policy requires

5) lib/audit.ts / lib/evidence.ts
   - Ensure conversation messages and directives are recorded as evidence entries with deterministic IDs

Server — Add Routes (server.js)
Follow existing patterns: method switch, path parse, input validation, http-response-guard, deep-redaction, auth check (operator only), idempotency headers (Idempotency-Key), and JSON content type.

- POST /api/tasks/:taskId/conversation/open
  - Body: { by: Actor }
  - Returns: ConversationThread
  - Creates thread if not exists; links to evidence/audit

- GET /api/tasks/:taskId/conversation/history
  - Returns: ConversationThread (redacted by actor)

- GET /api/tasks/:taskId/conversation/stream
  - SSE stream for ConversationEvents and synthesized OperatorEvents
  - Query: ?lastEventId=... for replay from log tail
  - Heartbeat every 15s; close on task complete or after 12h idle

- POST /api/tasks/:taskId/conversation/message
  - Body: { role: 'operator' | 'assistant', content: string, contentFormat?: 'text'|'json'|'markdown', attachments?: [] }
  - Validates length <= 16k, strips HTML/script, runs deep redaction
  - Appends message, may infer directive (via task-refinement) and apply

- POST /api/tasks/:taskId/conversation/directive
  - Body: RuntimeDirective
  - Validates via runtime-directives.validateDirective, merges into plan, publishes event
  - Allowed kinds enforced; disallow cancel if task already terminal

- POST /api/tasks/:taskId/refine
  - Body: { instructions?: string, constraints?: {...}, provider?: string, budgetUsd?: number }
  - Converts to RuntimeDirective(s), applies

- POST /api/tasks/:taskId/chain
  - Body: TaskChainSpec
  - Upserts spec; validates rules (no cross-tenant/project by default); store in state/task-chains

- GET /api/tasks/:taskId/chain
  - Returns TaskChainSpec or 404

- POST /api/tasks/:taskId/chain/execute
  - Body: { force?: boolean }
  - Evaluates current deliverables and creates child tasks according to spec; honors requireApproval flag

Server — Route Guards and Redaction
- All routes use http-response-guard.ts, deep-redaction.ts, and existing auth middleware
- Only operator (or configured approver role) can post messages/directives/chain specs
- Enforce rate limiting: max 10 messages/min per task per actor; 5 directives/min
- Enforce size: message content <= 16k, attachments <= 10 entries
- Redact secrets, PII fields as configured
- Log to audit hub with event types: 'conversation.message', 'conversation.directive', 'conversation.stream', 'task.chain.upsert', 'task.chain.execute'

State Files
- state/task-conversations/{taskId}.json
  {
    "taskId": "T123",
    "openedAt": "2026-03-15T12:00:00Z",
    "openedBy": { "id": "op", "role": "operator" },
    "messages": [ ConversationMessage, ... ],
    "status": "open"
  }
- state/task-conversations/{taskId}-events.log
  - line-delimited JSON of ConversationEvent; append-only
- state/task-chains/{taskId}.json
  { TaskChainSpec }

Worker Wiring
- On task start: publishEvent(kind: 'progress', payload: { phase: 'start' })
- On provider call: publishEvent(kind: 'reason'/'progress') with partial reasoning highlights (respect redaction)
- On missing info: publishEvent(kind: 'question', payload: { question, neededBy })
- On subtask propose/execute: publishEvent(kind: 'subtask', payload: {...})
- On deliverable intermediate: publishEvent(kind: 'intermediate-output', payload: { field, preview })
- On policy/budget changes: publishEvent(kind: 'policy', payload: {...})
- On error: publishEvent(kind: 'error', ...)
- On complete: publishEvent(kind: 'complete', ...)
- Directive handling:
  - pause: suspend provider calls and queue; publish 'policy' event
  - resume: resume execution
  - cancel: abort remaining work; mark task terminal; publish 'policy'
  - redirect: change goal/description; re-plan subtasks
  - set-constraint: update budgets/providers/deadlines
  - add-subtask: append subtask to plan and execute per governance
  - answer-question: inject content into next provider prompt
- Ensure merge into prompt uses PromptAugmentationBundle; if no provider call is currently active, apply to next call; if active and provider supports tool messages, inject as tool/system message according to Part 67 builder

Task Chaining
- Chain evaluation trigger: in chain-executor.onTaskCompleteForChaining or manual POST /chain/execute
- Evaluate rules against:
  - deliverables (validated/approved)
  - artifact metadata
  - task labels/status
  - optional predicate sandbox (safe-eval with whitelist; timeouts)
- For each match:
  - Map inputs according to inputMapping (deliverable path, field, artifact id, static)
  - Create child tasks:
    - If templateId provided, instantiate template with mapped inputs
    - Else create adhoc task with provided task fields
  - Link parent→child with ruleId; copy evidence refs; record in audit
  - If requireApproval: create draft child task, publish 'policy' event asking for approval
  - If autoExecute and permitted: submit child tasks into pipeline
- Write links into both parent and children task state files

UI — index.html/operator.js/operator.css
- Conversation panel in Task Detail view:
  - Message list with roles (operator/assistant/system/policy)
  - Input box with send, plus quick-action buttons: Pause, Resume, Cancel, Approve, Reject, Add Subtask
  - Streaming area connected to /conversation/stream (SSE) with fallback to long-polling GET /history every 5s
  - Inline rendering of 'question' events with "Answer" CTA (posts directive kind 'answer-question')
  - Show interim outputs with copy buttons and "Promote to field" where applicable (posts set-constraint/augment-prompt)
- Chain section:
  - View/edit chain spec JSON with schema-aware form (minimal: textarea with live validation)
  - Toggle autoExecute, requireApproval
  - Button "Evaluate & Preview" (calls GET chain + local evaluation if deliverables available)
  - Button "Execute Now"
  - List of created chained tasks with status and links
- Operator.js additions:
  - connectTaskConversationStream(taskId)
  - postConversationMessage(taskId, payload)
  - postDirective(taskId, directive)
  - loadConversationHistory(taskId)
  - loadChainSpec(taskId), saveChainSpec(taskId, spec), executeChain(taskId)
  - Renderers for ConversationEvent → DOM updates (debounced)
- CSS additions for roles, event types, and streaming states

Governance, Security, Compliance
- All messages/events pass through deep-redaction with field-level masks/strips
- Enforce tenant/project isolation: no cross-project mapping unless explicit allowlist in ChainRule and operator confirmation
- Limits:
  - Max 5k events per task; rotate log with -events-1.log, -events-2.log if exceeded
  - SSE stream lifetime 12h; heartbeat to keep connection
- Audit:
  - Record evidence entries for each message and directive
  - Link to release artifacts if a directive changes deliverable content
- Rate limiting and abuse prevention as above
- Idempotency: honor Idempotency-Key on POST endpoints

Docs
- 04-Dashboard/docs/adr/ADR-0XX-conversation-and-chaining-sse.md
  - Decision: SSE over WebSockets; rationale; fallbacks; limitations
- 04-Dashboard/docs/runbooks/operating-conversations.md
  - How to open streams, send directives, interpret events
- 04-Dashboard/docs/contracts/conversation-contract.md
  - Message and event schemas; directive kinds; enforcement notes
- 04-Dashboard/docs/user/operator-task-chaining.md
  - Authoring ChainRule with examples and constraints
- Update system-prompt.md with a short section on using operator answers and directives in deliberation

Tests (add ~24)
- tests/server/conversation.test.ts
  - open conversation → 201; idempotent re-open
  - post message normalizes and redacts PII
  - SSE stream emits heartbeat and events on task start/progress/error/complete
  - rate limits enforced
  - directives validate and apply; pause/resume semantics persisted
  - cancel disallowed after terminal state
  - message → inferred refine → provider prompt contains augmentation
- tests/server/chaining.test.ts
  - upsert valid chain spec
  - reject invalid cross-project mapping
  - evaluate after completion matches rules
  - create child tasks with correct parent linkage and input mapping
  - requireApproval path creates drafts and waits for approve directive
  - autoExecute path submits immediately
- tests/ui/conversation.ui.test.ts
  - render stream events; answer question CTA posts directive
  - pause/resume/cancel buttons wired and states reflected
- tests/regression/pipeline-unchanged.test.ts
  - baseline tasks without conversation/chaining behave identically when flags disabled
- tests/security/conversation-security.test.ts
  - unauthorized access blocked
  - deep redaction strips secret fields from streamed events

Acceptance Criteria
1) Operator sees live streaming progress and reasons while a task runs via SSE; heartbeat every 15s
2) Operator message results in prompt augmentation in the next provider call; visible in audit and evidence
3) Pause directive halts further provider calls until resume; reflected in UI and worker state
4) Cancel directive aborts remaining subtasks and marks terminal state; emits 'policy' and 'complete' events
5) Redirect directive updates task description and re-plans subtasks within governance
6) System emits 'question' events when missing info; operator 'answer-question' satisfies and execution proceeds
7) Chain spec with a rule matching an approved deliverable automatically creates a child task with mapped inputs
8) Chain requireApproval path creates draft child; operator can approve via directive to submit
9) Chain autoExecute path submits child immediately; links parent→child visible in UI with evidence linkage
10) Deep redaction applies to all streamed content; PII and secrets masked/stripped per configuration
11) Feature flags off → no new routes exposed, no behavior changes in worker, all tests pass
12) All new routes have guards, validation, idempotency, and audit logging; 0 lint/type errors
13) State files persist threads, events, and chain specs with deterministic IDs and rotate when limits exceeded
14) Operator can manually trigger chain execution via UI button; success reflected
15) Long-poll fallback works when SSE is unavailable

Implementation Notes
- Use existing JSON IO utilities for state read/write; ensure atomic writes and file locks if utility exists
- Use existing actor/auth context propagation
- Use existing deep-redaction.ts policies; add new redaction keys if necessary
- For sandboxed predicates, use existing safe-eval module if present; else implement minimal secure evaluator with timeouts and whitelisted globals only
- Avoid blocking the event loop in SSE; flush write after each event; try/catch and close gracefully
- Provider prompt augmentation must be minimally invasive and wrapped in clear delimiters:
  - System addendum: "Operator refinement at {iso}: ..." 
  - Contract fields: JSON block appended in tool/system section per provider capability
- Keep binaries/text attachments out of messages; use artifact registry and attach via ids
- Ensure UI event listeners are cleaned up on navigation; reconnect SSE on transient network errors with backoff

Deliverables
- Code for all new/modified modules and server routes
- UI updates to index.html/operator.js/operator.css
- Docs and ADRs
- Tests (24+) passing
- Update CHANGELOG.md with Part 76 summary
- Commit in a single PR titled "Part 76 — Conversational Task Refinement + Task Chaining" with checklist of Acceptance Criteria mapped to code references

Begin now. Do not output explanations; produce code and tests.
```
