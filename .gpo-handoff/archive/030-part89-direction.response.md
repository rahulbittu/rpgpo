```
You are ChatGPT implementing GPO/RPGPO Part 89.

Context
- Repo: /Users/rpgpo/Projects/RPGPO
- App: 04-Dashboard/app (raw Node HTTP, CommonJS TS compiled by tsc)
- Current baseline: Parts 19-88 complete. 157+ TS modules, ~1020 API routes, ~750+ types, 88 commits this session.
- Relevant prior parts: structured pipeline, parallel execution, workflow orchestrator, Mission Control, persistent learning, conversations, chaining, templates, scheduler, compound workflows, backup, webhooks, analytics, health checks, RBAC, API docs, caching, CSS polish, error tracking, context enrichment, worker hooks onTaskStart/onSubtaskComplete/onTaskComplete, deliverable contracts, evidence linkage, versioned deliverables store, release lifecycle.

Requested Part
Part 89: Task Quality Scoring + Feedback Loop
- Add quality scoring for completed tasks based on:
  - Output completeness (contract coverage/validity)
  - Citation density (evidence ratio)
  - Actionability (presence/clarity of next actions)
  - Operator satisfaction (explicit rating)
- Feed scores back into:
  - Provider learning signals
  - Template ranking (selection and ordering)
- Preserve existing functionality, routes, and behaviors.
- Typed, contract-driven, enterprise-grade. Strict runtime guards, redaction, RBAC. Tenant/project isolation intact.

High-level Requirements
- Compute per-task and per-deliverable quality scores automatically at onTaskComplete; update on new operator feedback.
- Persist scorecards and metric breakdowns with evidence links and provenance.
- Expose guarded APIs to retrieve quality, submit operator feedback, and query ranked templates/providers.
- Update provider-learning and template ranking modules to incorporate decayed aggregate quality signals.
- UI: show quality score and metric breakdown on Task and Deliverable views; capture operator satisfaction; show ranked templates in the Templates catalog with quality badges.
- Analytics: emit events for scoring and feedback.
- Docs: ADR for scoring rubric/weights and feedback loop; API docs; runbook for recompute/backfill.

Strict Constraints
- Do not break or change existing outputs unless extending with strictly additive fields behind guards.
- Keep raw Node server.js routing style. Use existing http-response-guard, deep-redaction, middleware, and RBAC patterns.
- Types first: extend lib/types.ts with new, namespaced types. No any/unknown. Narrowed unions. JSDoc on all new public types/functions.
- State: JSON files under state/ preserving existing isolation conventions: per-tenant if system supports; otherwise project-isolated with clear keys.
- Deterministic IDs: use existing deterministic ID helper from deliverables (Part 60) where applicable.
- Privacy: do not persist raw model outputs; persist references and aggregates only. Redact operator comments per existing redaction policy.
- Backward compatibility: existing deliverables/tasks without citations must still score deterministically.
- Acceptance tests: add to existing 150+ suite, not ad-hoc scripts.

Implementation Plan

1) Types (lib/types.ts)
- Add the following types with full JSDoc:
  - QualityMetricName = 'completeness' | 'citation_density' | 'actionability' | 'operator_satisfaction'
  - QualityMetricScore { name: QualityMetricName; score: number; rationale?: string; evidenceRefs?: string[] }
  - QualityScorecard {
      id: string; // deterministic: `${taskId}:${deliverableId||'__task__'}`
      taskId: string;
      deliverableId?: string;
      templateId?: string;
      providerKey?: string; // ai provider used
      createdAt: string; updatedAt: string;
      aggregate: number; // 0..1
      metrics: Record<QualityMetricName, QualityMetricScore>;
      weights: Record<QualityMetricName, number>;
      inputs: { contractId?: string; requiredFieldCount?: number; validFieldCount?: number; tokenCount?: number; citationCount?: number; actionItemCount?: number };
      provenance: { computedBy: 'auto' | 'recompute' | 'operator_update'; version: string };
      tenantId?: string; projectId?: string;
    }
  - OperatorFeedback {
      id: string; taskId: string; deliverableId?: string;
      operatorId: string; rating: 1|2|3|4|5; thumb?: 'up'|'down';
      comment?: string;
      createdAt: string; updatedAt: string;
      redaction: { masked: boolean; fields: string[] };
      tenantId?: string; projectId?: string;
    }
  - ProviderLearningSignal {
      providerKey: string;
      emaQuality: number; // 0..1
      count: number;
      lastUpdated: string;
      history?: Array<{ t: string; q: number; w: number }>;
      tenantId?: string; projectId?: string;
    }
  - TemplateRankingSignal {
      templateId: string;
      emaQuality: number;
      count: number;
      lastUpdated: string;
      history?: Array<{ t: string; q: number; w: number }>;
      tenantId?: string; projectId?: string;
    }
  - QualityConfig {
      weightsDefault: Record<QualityMetricName, number>; // sum to 1.0
      emaAlpha: number; // e.g., 0.2
      minima: Record<QualityMetricName, number>; // floor clamps
      citationTargetPerKTokens: number; // target density
      actionabilityTargets: { minActions: number };
      satisfactionMapping: { '1': number, '2': number, '3': number, '4': number, '5': number, up: number, down: number };
    }

- Where appropriate, augment existing Task/Deliverable types to allow linking to latest QualityScorecard ID (optional field).

2) New Modules in 04-Dashboard/app/lib/
- lib/quality-config.ts
  - export getQualityConfig(tenantId?: string, projectId?: string): QualityConfig
  - Load from state/config/quality.json with defaults if missing; ensure validation and fallback.

- lib/quality-scoring.ts
  - export computeQualityScorecard(input: {
      task: Task; deliverable?: Deliverable;
      templateId?: string; providerKey?: string;
      evidence?: EvidenceLink[]; // existing type
      operatorFeedback?: OperatorFeedback[]; // for recalculation
      tenantId?: string; projectId?: string;
      provenance: QualityScorecard['provenance'];
    }): Promise<QualityScorecard>
  - Internal helpers:
    - scoreCompleteness(contract, deliverable): { score: number; rationale: string; inputs: { requiredFieldCount, validFieldCount } }
    - scoreCitationDensity(evidence, tokenCount, config): { score: number; rationale: string; inputs: { citationCount } }
    - scoreActionability(deliverable|task): { score: number; rationale: string; inputs: { actionItemCount } }
    - scoreOperatorSatisfaction(feedback[], config): { score: number; rationale: string }
    - aggregate(metrics, weights, minima): number
    - tokenizeCount(text|fields): number // reuse existing tokenizer if present; else simple estimate
    - extractActionItems(deliverable|task): string[] // heuristics: imperative verbs, checklists, steps, owners, deadlines
    - parseCitationsFromDeliverableOrEvidence(): number // prefer EvidenceLink registry; fallback to URL/bracket pattern
  - Ensure deterministic, side-effect-free scoring; pure functions except persistence done in store module.

- lib/quality-store.ts
  - JSON persistence in state/quality/
    - state/quality/scorecards.json
    - state/quality/operator-feedback.json
  - export upsertScorecard(card: QualityScorecard): Promise<void>
  - export getScorecardById(id: string): Promise<QualityScorecard|undefined>
  - export getScorecardsByTask(taskId: string): Promise<QualityScorecard[]>
  - export upsertOperatorFeedback(feedback: OperatorFeedback): Promise<void>
  - export getOperatorFeedback(taskId: string, deliverableId?: string, operatorId?: string): Promise<OperatorFeedback[]>
  - Implement file locks or reuse existing state IO helper with atomic writes.

- lib/feedback-loop.ts
  - export applyQualityFeedback(card: QualityScorecard): Promise<void>
  - Updates provider-learning and template-ranking signals via new store functions.

- lib/learning-store.ts
  - Persist provider/template signals in:
    - state/learning/providers-quality.json
    - state/learning/templates-quality.json
  - export updateProviderSignal(providerKey: string, q: number, tenantId?: string, projectId?: string): Promise<ProviderLearningSignal>
  - export updateTemplateSignal(templateId: string, q: number, tenantId?: string, projectId?: string): Promise<TemplateRankingSignal>
  - export getProviderSignals(): Promise<ProviderLearningSignal[]>
  - export getTemplateSignals(): Promise<TemplateRankingSignal[]>
  - EMA update with alpha from QualityConfig; initialize priors at 0.6 with count=0 to avoid cold-start starvation.

- lib/template-ranking.ts (augment existing if present)
  - export rankTemplates(catalog: Template[], signals: TemplateRankingSignal[]): Template[]
  - Rank by EMA quality, tie-break by recency or existing rank; expose GET API.

- lib/provider-learning.ts (augment existing if present)
  - export getProviderSelectionWeights(signals: ProviderLearningSignal[]): Record<string, number>
  - Normalize EMA to weights with floor to avoid collapse; expose GET API.

- lib/runtime-hooks-quality.ts
  - Wire into existing onTaskComplete (and onDeliverableApproved if needed):
    - When a task completes and deliverable validated, compute scorecard, persist, emit analytics, call applyQualityFeedback.
    - Recompute if operator feedback arrives; update existing scorecard accordingly (provenance 'operator_update').

3) Server routes (server.js)
- Add the following guarded routes. Use existing patterns: parse JSON, RBAC, tenant/project scoping via headers/params, http-response-guard wrapping, deep-redaction on comments.
  - GET  /api/tasks/:taskId/quality
    - Returns latest scorecard for task and list for each deliverable.
  - POST /api/tasks/:taskId/feedback
    - Body: { deliverableId?: string, rating: 1-5, thumb?: 'up'|'down', comment?: string }
    - RBAC: operator or admin; one feedback per operator per task+deliverable, allow update.
    - Redact comment fields via deep-redaction; store masked content with redaction metadata.
    - Side effects: upsert feedback, recompute quality, persist, update learning signals.
  - GET  /api/templates/ranked
    - Returns templates with quality badge info (ema, count).
  - GET  /api/providers/learning
    - Returns provider quality signals and computed selection weights.
  - POST /api/quality/recompute
    - Admin-only: body filters { taskId?: string, projectId?: string, tenantId?: string, limit?: number }
    - Recompute scorecards and refresh learning signals; idempotent.

- Ensure:
  - Inline route guards invoke http-response-guard; mutation guards in place.
  - All responses include trace IDs and adhere to existing response contract (wrap in { ok, data, error? } as used).
  - API docs entries created/updated.

4) UI (04-Dashboard/app/)
- operator.js and app.js:
  - Task Detail panel:
    - Show Quality score (0-100) and 4 sub-metric bars with tooltips (rationale).
    - Sparkline of past recomputes if multiple runs.
    - "Rate result" widget: 1-5 stars + thumbs up/down + optional comment (masked on send); POST to feedback route; toast on success.
  - Deliverable panel:
    - Same quality badge with metric breakdown per deliverable.
  - Templates view (Mission Control/Templates tab):
    - Show “Quality EMA” badge and count; sort option “By Quality”.
- style.css/operator.css:
  - Add minimal CSS for badges, bars, stars; align with existing CSS polish conventions; responsive and accessible.

5) Analytics & Observability
- Emit analytics events via existing telemetry module:
  - quality_scored: { taskId, deliverableId?, aggregate, metrics, providerKey, templateId }
  - operator_feedback_submitted: { taskId, deliverableId?, rating, thumb }
- Health checks: extend health to verify state files existence and parseability for new stores.

6) Docs
- 04-Dashboard/docs/adr/ADR-00xx-quality-scoring-and-feedback.md
  - Problem, options, chosen rubric, weights, EMA config, privacy considerations, rollback plan.
- 04-Dashboard/docs/api/quality.md
  - Document new endpoints, request/response, RBAC, examples.
- 04-Dashboard/docs/runbooks/quality-recompute.md
  - How to backfill/recompute; expected runtime; safeguards.
- Update README sections for Templates/Providers to mention quality-based ranking/selection.

7) Migrations & Backfill
- Create migration script in 04-Dashboard/app/scripts/backfill-quality.ts
  - Iterate last N tasks (configurable), compute scorecards, update learning signals; rate-limit IO.
- Add npm script entry in package.json: "backfill:quality": "ts-node app/scripts/backfill-quality.ts --limit=500"

8) Governance & Config
- Default weights in state/config/quality.json, example:
  {
    "weightsDefault": { "completeness": 0.4, "citation_density": 0.2, "actionability": 0.2, "operator_satisfaction": 0.2 },
    "emaAlpha": 0.2,
    "minima": { "completeness": 0, "citation_density": 0, "actionability": 0, "operator_satisfaction": 0 },
    "citationTargetPerKTokens": 4,
    "actionabilityTargets": { "minActions": 3 },
    "satisfactionMapping": { "1": 0.0, "2": 0.25, "3": 0.5, "4": 0.75, "5": 1.0, "up": 0.75, "down": 0.25 }
  }
- Ensure per-tenant/project overrides supported if existing config system supports scoping.

9) Security & Hardening
- RBAC: Only authenticated operators/admins can submit feedback; only authorized users can view detailed quality breakdown if policy requires.
- Redaction: Mask PII in operator comments using deep-redaction policies. Store masked comment and redact fields metadata.
- Rate limiting: Throttle feedback submissions to prevent abuse.
- Idempotency: Feedback upsert keyed by operatorId+taskId(+deliverableId).
- Data integrity: Validate rating range, thumbs union, comment length limits; sanitize inputs.
- Isolation: Include tenantId/projectId in stores if multi-tenant; isolate queries accordingly.
- Error handling: Use existing error tracking; add codes for QUALITY_COMPUTE_FAILED, FEEDBACK_INVALID, STORE_IO_ERROR.

10) Wiring into runtime
- In lib/chief-of-staff.ts or existing runtime pipeline hooks module:
  - After deliverable validation onTaskComplete, call runtime-hooks-quality.computeAndApply(task, deliverable?, templateId, providerKey).
  - Ensure non-blocking: failures to score should log and continue without failing task completion.
  - Debounce duplicate scoring calls per task completion.

11) Tests & Acceptance
- Add tests to existing acceptance suite:
  - Completeness:
    - Required fields filled → score >= 0.8; missing fields → score <= 0.5.
  - Citation density:
    - Deliverable with 5 citations and ~1k tokens → density near target → metric >= 0.8.
    - No citations → metric ~0.
  - Actionability:
    - Deliverable with 5 clear next actions (imperatives, owners, due dates) → metric >= 0.8.
    - Narrative only → metric <= 0.3.
  - Operator satisfaction:
    - Rating 5 + up → mapped ~1.0; Rating 2 + down → mapped ~0.25 or less.
  - Aggregate:
    - Weights respected; changing config updates aggregate accordingly.
  - Feedback loop:
    - Submitting feedback triggers recompute; provider/template EMA updated.
    - Provider selection weights reflect EMA; floor ensures no zero probability.
  - APIs:
    - POST /feedback validates RBAC, idempotent per operator; comment redaction applied.
    - GET /tasks/:id/quality returns scorecards; data masked as needed.
    - GET /templates/ranked sorted by EMA desc with ties stable.
    - POST /quality/recompute admin-only.
  - UI:
    - Quality panel visible; metrics render; stars interactive; network calls succeed; optimistic updates.
  - Persistence:
    - Stores files created if missing; atomic writes verified.

12) Deliverables
- Commits:
  - feat(quality): introduce types, config, scoring, stores
  - feat(feedback): operator feedback API, recompute, redaction
  - feat(learning): provider/template EMA signals and ranking
  - feat(ui): quality panels, rating widget, template quality badges
  - feat(api-docs): quality and feedback endpoints
  - chore(backfill): add quality backfill script and runbook
  - test(acceptance): add quality scoring and feedback cases
- Update API docs and ADR.
- Ensure lint/tsc/acceptance suite pass.

Edge Cases to Cover
- Tasks without deliverables: fall back to task summary text for tokens/actionability; completeness defaults to 0 unless minimal criteria met.
- Deliverables with optional fields only: completeness based on required fields list from contract; handle 0 required fields (score 1.0).
- Evidence linkage unavailable: citation density from pattern parsing; rationale notes fallback.
- Multiple deliverables per task: compute per-deliverable and a task-level aggregate (max or weighted by contract importance if available).
- Multiple operators feedback: use average mapped satisfaction for metric; include count in rationale.
- Re-runs: recompute new card with updated createdAt; keep history; latest is active.
- Config weights not summing to 1: normalize internally with warning.

Implementation Notes
- Follow existing module import/export style (CommonJS require/module.exports or TS export = as used).
- Reuse existing helpers: deterministic ID generator, tokenizer if present, state IO, redaction, analytics.
- Keep functions small and unit-testable; pure computation separated from IO.
- All new public functions/types documented with JSDoc and examples.

Now implement Part 89 end-to-end per above. Ensure all new routes are guarded, types are strict, UI updates are minimal but complete, and acceptance criteria pass.
```
