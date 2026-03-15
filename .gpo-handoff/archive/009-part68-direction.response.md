```markdown
GPO Implementation Prompt — Part 68
Title: Board + Worker Structured Integration + Retry + Provider-Aware Routing

Context
- Baseline: Parts 19–67 complete. 84 TS modules, ~815 API routes, ~446+ types.
- Part 67 delivered structured pipeline: engine contract → JSON Schema → prompt injection → provider call → 4-stage parse → field-level merge → evidence recording.
- Provider modes: native-json (OpenAI/Anthropic), mime-json (Gemini), prompt-sentinel (Perplexity/unknown).
- Feature-flagged via state/config/ai-io.json; revertible without code changes.
- Gap: Board 7-phase lifecycle in lib/board.ts still runs plain-text calls; worker execution graph bypasses structured path; Chief of Staff doesn’t surface structured extraction status; maxParseAttempts not wired; provider selection not capability-aware.

Objectives
1) Wire structured output pipeline into Board 7-phase deliberation and Worker execution graph.
2) Implement parse retry with configurable exponential backoff + jitter, honoring maxParseAttempts from config.
3) Make provider selection capability-aware and mode-aware for structured output.
4) Surface structured extraction status in Chief of Staff briefs and operator UI.
5) Preserve feature-flagged reversibility. Keep existing plain-text path intact when disabled or upon exhausted retries.
6) Add API endpoints to introspect structured I/O status and trigger safe admin retry.
7) Expand tests, docs, and guards.

Non-Goals
- Changing contract schemas or deliverable merge logic (use existing).
- Adding new engines or providers.
- Replacing evidence or redaction frameworks.

Constraints
- CommonJS + TypeScript style consistent with repo.
- Raw Node.js HTTP server; add guarded routes via http-response-guard.
- Privacy-first, redaction on raw model outputs; avoid leaking PII.
- Preserve passing test suite; add new tests; no regressions.

Work Plan

A) Types and Config
1) Update lib/types.ts
- Add interfaces:
  - ProviderMode = 'native-json' | 'mime-json' | 'prompt-sentinel'
  - ProviderCapability {
      id: string; // 'openai'|'anthropic'|'gemini'|'perplexity'|custom
      modes: ProviderMode[];
      supportsStructured: boolean;
      supportsNativeJson: boolean;
      supportsMimeJson: boolean;
      supportsPromptSentinel: boolean;
      maxJsonTokens?: number;
      notes?: string;
    }
  - ProviderRoutingDecision {
      providerId: string;
      mode: ProviderMode;
      structuredPath: boolean;
      featureFlagActive: boolean;
      parseRetriesPlanned: number;
      reason: string;
    }
  - StructuredIOAttempt {
      attempt: number;
      mode: ProviderMode;
      providerId: string;
      startedAt: string;
      endedAt?: string;
      durationMs?: number;
      success: boolean;
      errorCode?: string;
      errorMessage?: string;
      fieldsExtracted?: number;
      fieldsMissing?: string[];
      evidenceId?: string; // link to evidence/structured record
    }
  - StructuredIOStatus {
      enabled: boolean;
      taskId: string;
      phase?: string; // for board phases
      providerId: string;
      providerMode: ProviderMode;
      attempts: StructuredIOAttempt[];
      maxAttempts: number;
      status: 'idle'|'in-progress'|'partial'|'complete'|'failed'|'disabled'|'fallback';
      fieldsExtracted?: number;
      fieldsMissing?: string[];
      lastErrorCode?: string;
      lastErrorMessage?: string;
      lastRawSampleId?: string; // redacted sample reference, not raw content
      totalDurationMs?: number;
    }
  - BoardPhase = 'understanding'|'constraints'|'plan'|'decomposition'|'risks'|'review'|'decision'
  - BoardPhaseOutput { phase: BoardPhase; summary: string; decisions?: string[]; risks?: string[]; subtasks?: any[]; requiredFieldsCovered?: string[]; missingFields?: string[]; contractHints?: Record<string, any>; }

2) Config: state/config/ai-io.json (migration v2)
- Add/ensure:
  - "boardStructuredEnabled": true
  - "workerStructuredEnabled": true
  - "providerRouting": "capability-preferred" // 'force-config'|'capability-preferred'|'legacy'
  - "maxParseAttempts": 3
  - "backoffMs": 250
  - "backoffMultiplier": 1.7
  - "backoffJitter": 0.2
  - "exposeStatusToOperator": true
- Implement migration script:
  - lib/migrations/2026-03-14-ai-io-config-v2.ts: idempotent merge with defaults; write to state/config/ai-io.json
  - Wire migration into existing migration runner if present; else invoke during server bootstrap before config load.

B) Provider Capability & Routing
1) New module: lib/ai/provider-capabilities.ts
- Export getProviderCapabilities(): ProviderCapability[]
- Hardcode current known caps consistent with Part 67:
  - openai, anthropic: supportsStructured=true, modes=['native-json','prompt-sentinel'], supportsNativeJson=true
  - gemini: supportsStructured=true, modes=['mime-json','prompt-sentinel'], supportsMimeJson=true
  - perplexity: supportsStructured= false (native), modes=['prompt-sentinel'], supportsPromptSentinel=true
- Export decideProviderRouting(preferredProviderId: string|undefined, config, taskContext?): ProviderRoutingDecision
  - If config.providerRouting==='legacy' => structuredPath=false (unless subtask structured already in Part 67, keep behavior), pick preferredProviderId or default.
  - If 'capability-preferred' => select provider with structured support; prefer preferredProviderId if capable; else fallback to best capable; choose mode based on provider's best structured mode.
  - Include featureFlagActive from config (boardStructuredEnabled/workerStructuredEnabled depending on caller).
  - Compute parseRetriesPlanned = config.maxParseAttempts

2) Update lib/ai/providers.ts
- Accept mode hint in provider call API to set JSON mode headers/parameters (native-json, mime-json). Preserve existing calls.
- Ensure prompt-sentinel mode wraps prompt with sentinel framing from Part 67 (reuse prompt/contract-aware patterns).

C) Backoff + Retry
1) New module: lib/ai/backoff.ts
- export computeBackoffMs({baseMs, multiplier, jitter, attempt}): number
  - jitter: add +/- jitter% randomization.
- Unit tests for deterministic mode using seeded RNG (if available) or clamp jitter=0 in tests.

2) Update lib/ai/structured-output.ts
- Add executeWithParseRetry(args): { providerDecision, attempts: StructuredIOAttempt[], finalResult?, error? }
  - Loops up to maxParseAttempts from config.
  - For each attempt: selects provider/mode via decideProviderRouting; calls provider; runs 4-stage parse; records attempt result; writes evidence via evidence/structured.ts; waits backoffMs before retry if failed and more attempts left.
  - On final failure: return error; caller can fallback to plain text path if allowed.
- Preserve existing simple executeStructuredSubtask() by delegating to executeWithParseRetry() and returning best successful parsed result (or error).

D) Board 7-Phase Structured Integration
1) New module: lib/contracts/board-phase.ts
- Export getBoardPhaseSchema(phase: BoardPhase): JSONSchema for BoardPhaseOutput minimal fields.
- This is used when there is no task deliverable contract or as supplemental hints during early phases.

2) Update lib/board.ts
- Identify the 7-phase lifecycle functions. Do not break signatures. Introduce structured wrappers:
  - function executeBoardPhaseStructured(taskCtx, phase: BoardPhase, deliverableSchema?: JSONSchema): { outputJson?: BoardPhaseOutput; rawText?: string; status: StructuredIOStatus; evidenceIds: string[]; }
- For each phase:
  - If config.boardStructuredEnabled:
    - Build prompt via lib/prompt/contract-aware.ts combining: phase prompt, deliverableSchema if available, and board-phase schema from lib/contracts/board-phase.ts.
    - Call executeWithParseRetry(); on success, parse JSON mapped to BoardPhaseOutput; on failure and after retries, fallback to legacy plain-text path and mark status=fallback. Record both evidence types.
  - Else use legacy path unchanged.
- Ensure when a task has an engine deliverable contract, include its JSON Schema via contracts/schema-encoder.ts in the prompt injection for all phases after 'understanding', especially 'plan','decomposition','decision'.
- Return StructuredIOStatus per phase and persist into evidence/structured.ts.

3) Ensure any downstream logic depending on phase outputs accepts the structured result where available; otherwise consumes raw text unchanged.

E) Worker Execution Graph Integration
1) Update lib/worker.ts
- Route root task execution through structured path when config.workerStructuredEnabled.
- If subtask execution already uses executeStructuredSubtask(), unify so both subtask and root task call a common helper executeTaskStructured() that delegates to executeWithParseRetry().
- Ensure field-level merge via merge/field-populator.ts is invoked when JSON result aligns with deliverable contract; otherwise maintain legacy heuristic merge.

F) Chief of Staff Surfacing
1) Update lib/chief-of-staff.ts
- In operator brief/next-actions composition functions, append structured I/O status summary when config.exposeStatusToOperator:
  - Show per-phase status for current task: providerId/mode, attempts (n/N), status, fieldsExtracted vs required, last error code, and whether fell back.
  - Provide human-legible hints: “Structured extraction active via OpenAI native-json; attempt 1/3 succeeded; 12/15 fields populated.”
- Export getStructuredIOStatus(taskId): StructuredIOStatus[] aggregated across phases/subtasks.

G) APIs
Update 04-Dashboard/app/server.js and lib/http-response-guard.ts to register and guard new routes.

1) GET /api/ai-io/status/:taskId
- Returns: { taskId, statuses: StructuredIOStatus[] }
- Query opts: ?phase=... to filter; ?includeAttempts=true for operator; ?includeSamples=true for admin only (redacted sample references only; no raw content).
- Guard: operator_read; redact error messages to sanitized form.

2) POST /api/ai-io/retry/:taskId
- Body: { phase?: BoardPhase }
- Effect: Triggers one additional parse attempt if previous attempts < max and last status failed/partial; queues work via existing worker mechanism or runs inline if safe.
- Guard: operator_action + admin_only toggle in config.ai-io.json (add "allowManualRetry": false default). If not allowed → 403.
- Response: Updated StructuredIOStatus.

3) GET /api/providers/capabilities
- Returns: ProviderCapability[] and current routing defaults.
- Guard: operator_read.

- Ensure deep-redaction.ts masks any raw provider outputs and only returns status metadata. Add new redaction rules for StructuredIOStatus.lastErrorMessage, lastRawSampleId values to avoid linking to raw storage without permission.

H) UI
1) Update 04-Dashboard/app/operator.js and operator.css
- In Board/Task panels, add “Structured I/O” badge:
  - Shows ON/OFF, provider icon, mode tag (JSON/MIME/Sentinel), attempts bar (e.g., 1/3), status color (complete=green, partial=amber, failed=red, fallback=gray).
  - Tooltip: fields extracted, missing fields, last error code (sanitized).
- Add optional “Retry parse” button when allowed by config and status=failed/partial and attempts<max.
- Poll /api/ai-io/status/:taskId on task detail view; update reactively.

2) Update 04-Dashboard/app/app.js if brief rendering occurs there; ensure brief includes structured status snippets produced by chief-of-staff.ts.

I) Evidence & Telemetry
1) Use evidence/structured.ts to record each attempt; link evidenceIds on StructuredIOAttempt.
2) Add counters/timers to observability module (if present) or write lightweight metrics JSON under 03-Operations (e.g., 03-Operations/metrics/ai-io/yyyymmdd.json) with:
  - attempts, successes, failures, fallback count, duration histograms per provider/mode.

J) Tests
Add ~24 tests; keep all existing 72 tests passing.

1) Unit
- tests/lib/ai/provider-capabilities.spec.ts
  - capability listing correctness
  - routing decision logic across config modes and preferred provider
- tests/lib/ai/backoff.spec.ts
  - computeBackoffMs deterministic behaviors; jitter bounds
- tests/lib/ai/structured-output-retry.spec.ts
  - retry loop triggers; stops at success; stops at max; returns attempts array

2) Board
- tests/lib/board/board-structured.spec.ts
  - per-phase structured path when enabled; fallback to legacy when disabled
  - inclusion of deliverable contract schema into later phases
  - evidence recorded per attempt

3) Worker
- tests/lib/worker/worker-structured.spec.ts
  - root task uses structured path when enabled; subtask path unchanged but now unified helper
  - merge/field-populator invoked on JSON success; heuristic otherwise

4) Chief of Staff
- tests/lib/chief-of-staff/structured-status.spec.ts
  - brief includes structured status; sanitization of errors

5) API
- tests/api/ai-io-status.spec.ts
  - GET status redaction, filtering by phase, permission checks
- tests/api/ai-io-retry.spec.ts
  - POST retry respects config allowManualRetry; increments attempts; blocks when max reached
- tests/api/providers-capabilities.spec.ts
  - returns capabilities; guarded

6) UI (if UI test harness exists)
- tests/ui/operator-structured-badge.spec.ts
  - renders badge; updates on polling; retry button visibility

K) Docs
Add/Update (04-Dashboard/docs/)
- ADR: 068-board-worker-structured-integration.md
  - Decision, options, rationale, roll-back plan
- Runbook: ai-io-ops.md
  - Toggling flags, interpreting statuses, retry policy, provider routing modes
- API: ai-io-status.md, providers-capabilities.md, ai-io-retry.md
- Security: redaction-and-ttl-for-structured-io.md
  - No raw model content exposure; evidence references only; TTL policies if applicable

L) Guards, Redaction, and Hardening
- Extend http-response-guard.ts to protect new routes under operator_read/operator_action scopes.
- deep-redaction.ts:
  - Mask lastErrorMessage to sanitized classification (e.g., 'ParseError:UnexpectedToken') without raw snippets.
  - Do not emit raw model outputs; only evidence IDs or redacted sample IDs.
- Enforce maxParseAttempts at server level; reject manual retry if exhausted.
- Backoff sleep should be non-blocking if async; ensure worker throughput unaffected (consider scheduling retries rather than blocking the event loop).
- Ensure provider timeouts are reasonable; do not retry on deterministic schema errors due to invalid contract (short-circuit).
- Log override ledger entries if config toggles changed at runtime (if such mechanism exists).

M) Rollout Plan
- Default boardStructuredEnabled/workerStructuredEnabled=true per migration; if instability occurs, toggle to false to revert to legacy path without code change.
- providerRouting=capability-preferred default; can revert to legacy.
- AllowManualRetry=false default.

N) Acceptance Criteria
- When boardStructuredEnabled=true, all 7 phases route through structured path with contract-aware prompts; on success, JSON is parsed and mapped to BoardPhaseOutput; on failure after N attempts, legacy text path is used and status=fallback recorded.
- Worker root task uses structured path when enabled; subtask path remains functional; field-level merge occurs when structured JSON succeeds.
- Provider selection prefers structured-capable provider/mode; Gemini uses mime-json; OpenAI/Anthropic use native-json; Perplexity uses prompt-sentinel; decisions exposed by /api/providers/capabilities.
- Parse retry honors maxParseAttempts with exponential backoff and jitter; attempts recorded in evidence; metrics written.
- Chief of Staff brief shows structured I/O status; operator UI displays badge with provider/mode/attempts/status; retry button appears only when allowed.
- New APIs are guarded, redacted, and documented; redaction masks error details; no raw model outputs leak.
- All new tests pass; existing tests remain green.

Implementation Hints
- Reuse prompt/contract-aware.ts from Part 67; compose phase prompts + deliverable schema + board-phase schema.
- Use evidence/structured.ts for attempt logging; include provider/mode and outcome.
- Ensure time measurements around provider calls and parsing are captured for telemetry.

Deliverables
- Code changes across modules listed.
- Migration script applied.
- New tests (24) and updated CI config if needed.
- Docs (ADR + runbook + API + security notes).
- Updated UI with structured status badge.

Execution
- Implement iteratively: provider routing + retry core → board integration → worker integration → surfacing + APIs → UI → tests → docs.
- Run full test suite; verify acceptance criteria via 2–3 manual scenarios: OpenAI native-json success, Gemini mime-json success, Perplexity sentinel fallback with retries.
```
