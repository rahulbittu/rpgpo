```markdown
You are GPO Builder. Implement Part 88: Context Enrichment Pipeline — Auto-extract insights from completed tasks into the knowledge base, build a semantic index of findings, and inject relevant prior knowledge into new task deliberations.

Constraints and guardrails:
- Do not break or regress any existing behavior. Preserve all existing routes, governance, redaction, isolation, and pipeline hooks.
- Codebase is TypeScript compiled to CommonJS. No new external dependencies. Reuse existing engine/provider abstractions and runtime hooks.
- State remains JSON-file based in state/.
- All new modules must be typed and contract-driven. Extend lib/types.ts with explicit interfaces.
- All new routes must be guarded by existing middleware/response guards and honor tenant/project isolation.
- Redaction and policy enforcement must apply before any persistence or provider calls.
- Follow existing code style, logging, and evidence/traceability conventions.

Objectives:
1) Auto-extract structured insights from completed tasks and deliverables into a typed knowledge base.
2) Build and maintain a semantic index over extracted insights with search/retrieval APIs.
3) Inject relevant curated insights into new task deliberations to improve quality and reduce cost/latency.

Scope:
- Post-completion pipeline: hook onTaskComplete to extract insights from reports/deliverables, redact, store, index, and link evidence.
- Semantic index: embeddings via governed engine, on-disk vector store, scoring, reindex and backfill operations.
- Retrieval for deliberation: query-by-brief with scoring (semantic + recency + feedback), curation and size limits, JSON contract for prompt context.
- UI surfaces: Insights panel (browse/search), and suggested prior knowledge section in task composer/briefing area.
- APIs: admin/operator endpoints to search, fetch, reindex, and provide feedback.
- Docs, runbooks, and acceptance tests.

Non-goals:
- Cross-tenant sharing. Default scope is tenant isolated, and project-scoped retrieval unless operator widens to tenant scope.
- External DB or infra. Stay file-backed.
- Full-blown ontology. Use pragmatic entity/metric tagging with extendable types.

Required new/updated modules (04-Dashboard/app/lib):
1) lib/insight-schema.ts
   - Exports constants and helpers for insight contracts and validation.
   - New types will also live in lib/types.ts; this module centralizes schema versioning and defaults.

2) lib/insight-extractor.ts
   - Extract structured insights from task output/deliverables via AI provider under governed budgets.
   - Uses contract-aware prompting with JSON-only responses and strict parsing/validation.
   - Applies deep redaction policy "knowledge-indexing" prior to persistence.

3) lib/insights-repo.ts
   - Durable store for insights, manifests, feedback, and linkage to tasks/deliverables.
   - Deterministic IDs, manifest updates, evidence linking, versioning, and soft-deletes.

4) lib/semantic-index-insights.ts
   - Embedding generation via governed embeddings engine.
   - File-backed vector index with approximate top-k search (brute-force cosine is acceptable given scale; optimize later).
   - Upsert/remove operations and reindex/backfill flows.
   - Score blending: semantic + recency + feedback + kind-boosts.

5) lib/context-enrichment-pipeline.ts
   - Orchestrator for enrichment: from onTaskComplete to store/index, with retries and telemetry.
   - Backfill job runner for historical tasks.

6) lib/context-retrieval.ts
   - High-level retrieval for deliberation: query insights by brief/tags/scope, curate payload with limits, dedupe, and safety checks.
   - Returns ContextPack for injection in deliberation prompts.

7) lib/deliberation.ts (update)
   - Inject retrieved ContextPack in board/worker deliberation prompts, under token budgets.
   - Adds controls to enable/disable contextual injection per task/project config.

8) lib/http/insights-routes.ts
   - Route handlers for insights search, fetch-by-id, fetch-by-task, feedback, reindex/backfill.
   - Wire into server.js with guards and response normalization.

9) lib/config-knowledge.ts
   - Config and feature flags: enablement, limits, embedding provider, indexing batch sizes, redaction policy ids.

10) lib/guards/insights-guards.ts
   - Route guard helpers for RBAC and scope validation.

11) lib/telemetry/insights-metrics.ts
   - Counters, timings, costs for extraction and indexing, search QPS, injection coverage.

Type additions (04-Dashboard/app/lib/types.ts):
- enum InsightKind = 'finding' | 'recommendation' | 'data_point' | 'risk' | 'decision' | 'metric' | 'entity'
- interface InsightMetric { name: string; value: number | string; unit?: string }
- interface InsightEntity { type: string; name: string; externalId?: string; metadata?: Record<string, string> }
- interface InsightReference { type: 'task' | 'deliverable' | 'url' | 'file'; id?: string; path?: string; url?: string }
- interface InsightEmbedding { provider: string; dim: number; vector: number[]; hash: string }
- interface InsightRedaction { applied: boolean; policyId?: string; fieldsMasked: string[] }
- interface InsightModeration { status: 'clean' | 'flagged' | 'blocked'; reasons?: string[] }
- interface InsightSource { path: string; hash: string; offset?: number }
- interface InsightRecord {
    id: string; version: number;
    tenantId: string; projectId: string;
    taskId: string; deliverableId?: string;
    createdAt: string; updatedAt?: string;
    source: InsightSource;
    kind: InsightKind;
    title: string; summary: string; content: string;
    tags: string[];
    metrics?: InsightMetric[];
    entities?: InsightEntity[];
    references: InsightReference[];
    confidence: number; // 0..1
    embedding?: InsightEmbedding;
    redaction: InsightRedaction;
    moderation: InsightModeration;
  }
- interface InsightFeedback { insightId: string; upvotes: number; downvotes: number; lastUpdated: string }
- interface InsightSearchQuery { tenantId: string; projectId?: string; q: string; kinds?: InsightKind[]; k: number; scope: 'project' | 'tenant'; }
- interface InsightSearchHit { insightId: string; score: number; kind: InsightKind; title: string; summary: string; tags: string[]; createdAt: string; references: InsightReference[] }
- interface InsightSearchResult { query: InsightSearchQuery; hits: InsightSearchHit[]; total: number }
- interface ContextPack {
    insights: Array<{
      id: string; kind: InsightKind; title: string; summary: string;
      tags: string[]; metrics?: InsightMetric[]; entities?: InsightEntity[]; references: InsightReference[];
      createdAt: string; score: number;
    }>;
    scope: 'project' | 'tenant';
    charBudgetUsed: number; charBudgetMax: number;
    redactionApplied: boolean;
  }
- interface InsightExtractionRequest { tenantId: string; projectId: string; taskId: string; deliverableId?: string; sourcePath: string; text: string; }
- interface InsightExtractionResult { insights: InsightRecord[]; rawProviderResponse?: string; }

State additions (04-Dashboard/app/state/):
- state/insights/
  - manifest.json: { version: 1, lastReindexAt?: string, total: number, byProject: Record<string, number> }
  - <tenantId>/<projectId>/<insightId>.json: InsightRecord
  - feedback.json: Record<insightId, InsightFeedback>
- state/index/
  - insights-v1.jsonl: one entry per insight: { id, tenantId, projectId, createdAt, vector: number[], norm: number, kind, recencyScore, feedbackScore }
  - insights-lock.json: index lock for concurrency
- state/settings/knowledge.json: { enabled: boolean, defaultScope: 'project'|'tenant', maxInsightsPerInjection: number, injectionCharBudget: number, embedding: { provider: string, dim: number }, redactionPolicyId: string, kindBoosts: Record<InsightKind, number>, recencyHalfLifeDays: number, backfill: { enabled: boolean, batchSize: number } }

Implementation details:

A) Insight contract and validation
- lib/insight-schema.ts
  - export const INSIGHT_CONTRACT_V1 = { ... } // JSON schema-like shape
  - export function normalizeInsight(i: InsightRecord): InsightRecord
  - export function validateInsight(i: unknown): { ok: boolean; errors?: string[] }
  - export function deterministicInsightId(input: { tenantId, projectId, taskId, sourceHash, content }): string // use existing hashing util

B) Extraction pipeline
- lib/insight-extractor.ts
  - export async function extractInsightsFromTask(req: InsightExtractionRequest, opts?: { maxInsights?: number }): Promise<InsightExtractionResult>
    Steps:
    1. Redact req.text via deep-redaction.ts with policy from config-knowledge.ts.
    2. Construct contract-aware prompt:
       - System: "You are an analyst. Output ONLY JSON per INSIGHT_CONTRACT_V1 array. No prose."
       - Include schema summary and examples.
       - Include guardrails: max N items, confidence values, tags from text, concise summaries.
    3. Call governed provider (reuse existing engines infra) with JSON schema instruction and "json" response mode if supported.
    4. Parse JSON strictly; validate each item; normalize; attach tenantId/projectId/taskId/source; compute sourceHash.
    5. Drop items failing validation; set moderation = 'clean' by default; confidence clamp [0,1].
    6. Return list with rawProviderResponse stored for evidence chaining.
  - export async function embedInsights(insights: InsightRecord[], provider?: string): Promise<InsightRecord[]>
    - Call embeddings engine; attach embedding (provider, dim, vector, hash).

C) Repository and evidence
- lib/insights-repo.ts
  - export async function saveInsights(insights: InsightRecord[], opts?: { linkEvidence?: { providerResponse?: string, path?: string } }): Promise<void>
  - export async function getInsightById(tenantId: string, projectId: string, id: string): Promise<InsightRecord | null>
  - export async function listInsightsByTask(tenantId: string, projectId: string, taskId: string): Promise<InsightRecord[]>
  - export async function recordFeedback(tenantId: string, projectId: string, insightId: string, delta: { up?: number, down?: number }): Promise<InsightFeedback>
  - Maintains manifest.json counts and byProject.
  - Writes evidence link into each insight.references with type 'task' and 'deliverable' when present, following evidence linking conventions used in deliverables.

D) Semantic index
- lib/semantic-index-insights.ts
  - export async function upsertToIndex(insights: InsightRecord[]): Promise<void>
  - export async function removeFromIndex(insightIds: string[]): Promise<void>
  - export async function searchInsights(q: InsightSearchQuery): Promise<InsightSearchResult>
    - Query embedding from provider.
    - Brute-force cosine against vectors in state/index/insights-v1.jsonl filtered by tenantId and scope (and projectId when scope=project).
    - Score blending:
      final = 0.6*semantic + 0.2*recency + 0.15*feedback + 0.05*kindBoost
      where:
        recency = exp(-ageDays / recencyHalfLifeDays)
        feedback = sigmoid(upvotes - downvotes)
        kindBoost from settings.knowledge.kindBoosts
    - Return top-k with metadata for display and injection.
  - export async function rebuildIndexForProject(tenantId: string, projectId: string): Promise<void>
  - export async function backfillAll(opts?: { batchSize?: number }): Promise<void>
  - Ensure index lock to avoid concurrent writers (insights-lock.json).

E) Orchestration
- lib/context-enrichment-pipeline.ts
  - export async function runContextEnrichmentForTask(tenantId: string, projectId: string, taskId: string): Promise<{ extracted: number; indexed: number }>
    Steps:
    1. Load completed task, collect primary report text and deliverable texts. Skip if not final.
    2. Build InsightExtractionRequest(s) per source blob.
    3. extractInsightsFromTask; embedInsights; saveInsights; upsertToIndex.
    4. Telemetry and audit: record counts, costs, evidence chain.
  - export async function backfillProject(tenantId: string, projectId: string): Promise<void>
  - export async function backfillTenant(tenantId: string): Promise<void>

F) Retrieval and injection
- lib/context-retrieval.ts
  - export async function buildContextPackForBrief(input: { tenantId: string; projectId: string; brief: string; tags?: string[]; scope?: 'project'|'tenant' }, limits?: { maxInsights?: number; charBudget?: number }): Promise<ContextPack>
    - Search with blended query (brief + tags).
    - Deduplicate by taskId/title similarity; cap per-kind; obey char budget (summary + metrics/entities only).
    - Apply redaction again to be safe.
- lib/deliberation.ts (update)
  - At deliberation planning/creation, call buildContextPackForBrief and inject into the prompt as a structured "Prior Knowledge" section (JSON-serialized).
  - Ensure injection obeys token/char budgets from settings.knowledge.

G) HTTP routes (04-Dashboard/app/lib/http/insights-routes.ts, wired in server.js)
- GET /api/insights/search?tenant={id}&project={id?}&q={q}&k={k?}&scope={project|tenant}&kinds={csv?}
  - Returns InsightSearchResult
- GET /api/insights/:tenant/:project/:id
  - Returns InsightRecord (with sensitive fields masked via deep redaction)
- GET /api/insights/by-task/:tenant/:project/:taskId
  - Returns InsightRecord[]
- POST /api/insights/feedback
  - Body: { tenantId, projectId, insightId, up?: number, down?: number }
  - Returns updated InsightFeedback
- POST /api/insights/reindex
  - Body: { tenantId, projectId? } triggers rebuild for project or whole tenant
- POST /api/insights/backfill
  - Body: { tenantId, projectId?, batchSize? } triggers extraction+indexing over historical completed tasks
Guards:
- Read routes require read access to tenant/project and apply response guard.
- Write routes require operator/admin role and CSRF check (reuse existing mutation guards).
- Scope enforcement: project routes cannot cross other projects; tenant routes aggregate projects of same tenant only.

H) Hooks integration
- Use existing runtime pipeline hooks (Part 65) in chief-of-staff/worker wiring:
  - On onTaskComplete, enqueue runContextEnrichmentForTask with jitter/backoff to avoid thundering herd.
  - Respect autonomy budgets for provider calls; short-circuit if disabled in knowledge config.
  - Log to 03-Operations with per-task enrichment reports.

I) UI updates (04-Dashboard/app/)
- index.html
  - Add "Insights" section under Knowledge/Reports left-nav.
  - In Task Composer panel (where new tasks are created), add a collapsible "Suggested Prior Knowledge" with multi-select chips of top 5 insights and a "Refresh suggestions" button.
- app.js
  - Add client for /api/insights/search; render list with filters by kind and date.
  - Wire task composer to call /api/insights/search with brief text to prefetch suggestions; allow toggling scope project/tenant.
  - On selection, show preview (title, summary, tags, references).
- operator.js
  - Add feedback buttons (👍/👎) per insight; POST to /api/insights/feedback; update UI and local ranking.
- style.css/operator.css
  - Minimal styles for insights list, chips, and feedback controls.

J) Config and defaults
- lib/config-knowledge.ts
  - Defaults:
    enabled: true
    defaultScope: 'project'
    maxInsightsPerInjection: 8
    injectionCharBudget: 4000
    embedding: { provider: 'embeddings/default', dim: 1536 } // Use existing provider key if already present; otherwise add config entry.
    redactionPolicyId: 'knowledge-indexing'
    kindBoosts: { finding: 0.05, recommendation: 0.05, data_point: 0.02, risk: 0.03, decision: 0.04, metric: 0.02, entity: 0.01 }
    recencyHalfLifeDays: 21
    backfill: { enabled: true, batchSize: 50 }

K) Docs
- 04-Dashboard/docs/architecture/part-88-context-enrichment.md
  - Overview, data flow, contracts, index format, scoring, UI, APIs.
- 04-Dashboard/docs/contracts/insight-record.md
  - Full type contract, examples, validation rules, redaction behavior.
- 04-Dashboard/docs/runbooks/insights-indexing.md
  - Operating procedures: backfill, reindex, troubleshooting, budget tuning, lock recovery.
- 04-Dashboard/docs/adr/ADR-00X-insights-index-design.md
  - Decision to use file-backed vectors and blended scoring; alternatives and rollback.

L) Acceptance criteria
1. When a task completes with a report of >1k chars, enrichment runs automatically and persists >=1 InsightRecord with valid fields, redacted content, and evidence links to the task/deliverable.
2. Insights are stored under state/insights/<tenant>/<project>/<insightId>.json with deterministic id and version=1.
3. Embeddings are computed and index updated; state/index/insights-v1.jsonl grows by the number of insights.
4. Searching via /api/insights/search with q matching a known summary returns that insight as top-3.
5. Retrieval for a new task brief injects a ContextPack with <= maxInsightsPerInjection and within injectionCharBudget; charBudgetUsed reported.
6. UI "Insights" panel lists insights with search and kind filters; clicking opens details; feedback buttons update scores and influence ranking on subsequent searches.
7. Operator can trigger /api/insights/backfill for a project; after completion, /api/insights/search shows historical insights.
8. Tenant and project isolation: insights from other projects do not appear when scope=project; with scope=tenant, only same-tenant projects appear.
9. Redaction applied: secrets and PII are masked per deep-redaction policy. No raw secrets present in persisted insights or API responses.
10. Route guards and mutation guards active; attempts to access cross-tenant or write without permission are blocked with proper audit logs.
11. Observability: metrics for extraction count, indexing time, search QPS, injection coverage (%) are emitted and visible in telemetry logs.
12. Costs respect autonomy budgets; exceeding budget skips embeddings with a logged warning and stores unindexed insights; search excludes unindexed insights.

M) Hardening and failure modes
- Provider failures: retry with backoff; partial success allowed; record evidence and skip blocked items.
- Parsing failures: capture raw response into evidence file; do not persist invalid/partial insights; emit warning.
- Index corruption: detect on load; attempt rebuild; if lock present > X minutes, log and allow operator override via runbook.
- Feedback tampering: sanitize deltas; clamp to reasonable bounds; debounce client spam.
- Deduplication: hash of normalized(title+summary+content) per task; skip duplicates.
- Max file sizes: cap vector store file size rollovers (start insights-v1-<N>.jsonl when > 100MB); update manifest with shards. Implement shard routing minimal for now (single shard acceptable if complexity too high; document future sharding ADR).
- Injection safety: cap per-kind counts, ensure summaries only (no content blobs) in ContextPack, enforce final redaction, and add "Context Safety Note" header in deliberation prompt.

N) Server integration (server.js)
- Register insights routes; wrap with existing middleware and response guard.
- Wire onTaskComplete hook to runContextEnrichmentForTask.
- Ensure JSON body size limits are sufficient for search queries but small for feedback; reuse global parser.

O) Migration/backfill plan
- One-time backfill script via /api/insights/backfill or operations runner that:
  - Scans completed tasks in state/
  - Skips already enriched tasks (by presence of references)
  - Processes in batches with budget checks
  - Updates manifest and index incrementally

P) Test data and fixtures
- Seed 3 completed tasks into 01-Inbox/ or state/tasks/ (wherever existing tasks live) with realistic reports.
- Run backfill; verify index and search returning expected items.
- Add 10 acceptance cases under 03-Operations/acceptance/part-88-context-enrichment.json describing the assertions in L).

Delivery checklist:
- Code: new modules, updated deliberation.ts, server.js routing, UI files, and types.ts.
- State: new directories/files created on first run with defaults.
- Docs: 4 new files.
- Acceptance: 10 cases added and runnable with existing acceptance harness.
- Logs: enrichment run, counts, and any failures clearly visible in 03-Operations logs.

Branch and commits:
- Branch: part-88/context-enrichment
- Commits (squashable):
  1) feat(context): types, schema, repo, config scaffolding
  2) feat(context): extractor + embeddings + index with search
  3) feat(context): pipeline orchestration + hooks + telemetry
  4) feat(api): insights routes + guards + response shaping
  5) feat(ui): insights panel + task composer suggestions + feedback
  6) docs(context): architecture, contract, runbook, ADR
  7) chore(tests): acceptance cases + fixtures
  8) fix(hardening): redaction, budgets, dedupe, index lock

Acceptance gate:
- All criteria in L) pass locally.
- No regressions in existing suites.
- Security scan for data leakage across tenants/projects shows clean.
- Manual UI smoke for Insights and Task Composer suggestions works.

Implement now. Ensure deterministic IDs, deep redaction, governance compliance, and isolation guarantees are upheld end-to-end.
```
