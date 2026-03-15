```
You are ChatGPT acting as the GPO/RPGPO repository implementer. Implement Part 72: TopRanker Engine Deep Integration.

Context
- Repo root: /Users/rpgpo/Projects/RPGPO
- App: 04-Dashboard/app (raw Node HTTP server.js, CommonJS + TypeScript, JSON state store)
- Current baseline: Parts 19-71 complete. 109+ TS modules, ~849 API routes, ~500+ types, 249 tests passing.
- Structured output pipeline (67), board/worker structured integration and provider backoff (68), observability and circuit breaker (69), parallel execution engine/DAG runner and backpressure (70), end-to-end workflow orchestration with 14-stage state machine, autopilot controller, approval gates, release trigger, evidence trails (71).
- Gap: TopRanker engine not integrated end-to-end. No TopRanker-specific contracts or templates. TopRanker source repo (02-Projects/TopRanker/source-repo) build/deploy not connected. No TopRanker domain template.

Objective (Part 72)
- Define TopRanker-specific structured output contracts.
- Create TopRanker engine template with domain-specific prompts and deliverable schemas.
- Connect TopRanker source repo build pipeline to the workflow orchestrator.
- Run an end-to-end test of the full pipeline (intake → deliverable → release) for a TopRanker task.

Non-goals
- Do not refactor server.js routing model.
- Do not change existing deliverables or engine contracts.
- Do not introduce external services; all build/test actions must run locally and be mockable/simulated in CI.

Global constraints
- CommonJS modules, TypeScript typing on all new modules.
- Preserve existing behavior; all current 249 tests must pass.
- Use existing governance layers: route guards, deep redaction, autonomy budgets, provider semaphores, observability tags.
- Every new route must register with http-response-guard and deep-redaction.
- Deterministic IDs for deliverables; versioned schemas; evidence linking on each pipeline transition.
- End-to-end must be runnable offline using simulated providers and a “dry-run” build mode.

High-level deliverables
1) New contracts: TopRanker leaderboard, business scorecard, review aggregation, release artifact.
2) New engine: TopRankerEngine with schema-aware prompts and structured outputs.
3) Integration: Source repo build adapter + workflow bridge to orchestrator.
4) API + UI: Minimal TopRanker task trigger and deliverable viewer panel.
5) Tests: Contract validation, engine structured extraction, repo adapter (dry-run), full E2E.
6) Docs: Architecture, contracts, runbook, E2E walkthrough.

Implementation plan (make these precise repository edits)

1. Types and contracts
- Edit 04-Dashboard/app/lib/types.ts
  - Add interfaces (with JSDoc):
    - TopRankerCategory { id: string; name: string; slug: string; }
    - TopRankerLeaderboardEntry { businessId: string; name: string; rank: number; score: number; confidence: number; city: string; category: string; verificationStatus: 'unverified'|'pending'|'verified'; signals: { reviews: number; avgRating: number; recencyBias: number; wilsonScore: number; volumeWeight: number; }; rationale: string; computedAt: string; }
    - TopRankerBusinessScorecard { businessId: string; name: string; city: string; category: string; kpis: { trust: number; responsiveness: number; satisfaction: number; consistency: number; }; riskFlags: { suspiciousActivity: boolean; conflictingInfo: boolean; lowVolume: boolean; }; notes: string[]; computedAt: string; }
    - TopRankerReviewAggregation { businessId: string; period: { from: string; to: string; windowDays: number; }; sources: Array<{ source: 'google'|'yelp'|'facebook'|'opentable'|'other'; count: number; avgRating: number; lastReviewAt?: string; }>; sentiment: { positive: number; neutral: number; negative: number; }; sampleSnippets: Array<{ text: string; sentiment: 'positive'|'neutral'|'negative'; source: string; capturedAt: string; }>; aggregationMethod: 'bayesian'|'wilson'|'hybrid'; computedAt: string; }
    - TopRankerReleaseArtifact { artifactId: string; repoPath: string; commitSha?: string; buildNumber?: string; platform: 'server'|'mobile'|'web'; filePath: string; sizeBytes: number; checksumSha256: string; createdAt: string; }
  - Add discriminated union entries in any existing DeliverableVariant/EngineDeliverables types if present.

- Create 04-Dashboard/app/lib/contracts/topranker.contracts.ts
  - CommonJS export with:
    - CONTRACT_IDS:
      - 'topranker.leaderboard.v1'
      - 'topranker.scorecard.v1'
      - 'topranker.review-aggregation.v1'
      - 'topranker.release-artifact.v1'
    - JSON Schemas (draft-07) for each, matching interfaces above. Include $id, title, description, type, properties, required, additionalProperties: false.
    - Export functions:
      - getTopRankerContracts(): { id: string; version: string; schema: object; }[]
      - validateTopRankerPayload(id: string, payload: unknown): { valid: boolean; errors?: Array<{ path: string; message: string }>; }
    - Use existing central AJV instance if present; otherwise wire to the same utility used by other deliverables (do not spin a new validator if shared exists).
  - Register these contracts with the versioned deliverable store/registry created in Parts 59-66:
    - addTopRankerContractsToRegistry(registry: DeliverableContractRegistry): void
    - Ensure deterministic IDs and schema version pinning.

- Update any central deliverables catalog if present:
  - 04-Dashboard/app/state/deliverables-catalog.json: append TopRanker contract entries with metadata {engine: 'topranker', active: true, version: 'v1'}.

2. Engine template
- Create 04-Dashboard/app/lib/engines/topranker-engine.ts
  - Export TopRankerEngine implementing the project’s Engine interface (align to existing engines signature: key, name, getTemplates, planSubtasks, buildPrompt, merge, mapToDeliverables, metrics tags).
  - key: 'topranker'
  - getTemplates(): return array of task templates:
    - 'topranker.weekly-leaderboard' input: { category: string; city: string; windowDays: number; topN?: number }
    - 'topranker.scorecards' input: { businessIds: string[]; city: string; category: string }
    - 'topranker.review-aggregation' input: { businessId: string; period: { from: string; to: string } }
  - buildPrompt(): use Part 67 structured output pipeline. Inject the correct JSON Schema for expected deliverable:
    - For weekly leaderboard: require a JSON object { entries: TopRankerLeaderboardEntry[], evidence: string[] }
    - For scorecards: { scorecards: TopRankerBusinessScorecard[], evidence: string[] }
    - For review aggregation: { aggregations: TopRankerReviewAggregation[], evidence: string[] }
    - Embed domain context: Expo/React Native + Express + PostgreSQL stack, community ranking algorithms (Bayesian average, Wilson score interval), business verification flow. Include hard governance instructions: no scraping external PII; rely on provided inputs and allowed datasets; return strictly JSON per schema; fence code where needed; cite rationale per entry; never invent reviews; record uncertainties in rationale.
    - Use provider capability negotiation from Part 68: prefer JSON mode; fallback to Markdown fenced JSON; apply retry with jittered backoff on schema violations.
  - merge(): align to Part 61/62 strategy; for arrays, de-dup by businessId; for leaderboard tie-breakers use higher confidence then alphabetic name.
  - mapToDeliverables(): convert parsed JSON to deliverable records with:
    - deliverableId deterministic from engine key + template + hash of sorted businessIds/category/city/period
    - link to evidence URIs (stored in artifact registry) from AI traces and build outputs
  - metrics: tag engine='topranker', template, provider, schemaVersion, payloadBytes, ewma-adjusted cost/latency.

- Register engine in 04-Dashboard/app/lib/engines/index.ts or registry file used by other engines
  - addEngine(TopRankerEngine)
  - Ensure Board/Worker can resolve 'topranker' by key.

3. Source repo build adapter and workflow bridge
- Create 04-Dashboard/app/lib/integrations/topranker-repo-adapter.ts
  - Purpose: connect 02-Projects/TopRanker/source-repo build steps into orchestrator with governance controls.
  - Exports:
    - detectTopRankerRepo(basePath = repoRoot): { exists: boolean; repoPath?: string; packageJson?: any }
    - prepareTopRankerEnv(opts: { dryRun: boolean; env: Record<string,string|undefined> }): { env: Record<string,string>; redactions: string[] }
    - runTopRankerBuild(opts: { dryRun?: boolean; steps?: Array<'install'|'build:server'|'build:web'|'test'>; timeoutMs?: number; cwd?: string; }): Promise<{ ok: boolean; artifacts: TopRankerReleaseArtifact[]; logsPath: string; errors?: string[] }>
    - collectTopRankerArtifacts(opts: { cwd: string }): Promise<TopRankerReleaseArtifact[]>
  - Behavior:
    - Resolve repo at 02-Projects/TopRanker/source-repo.
    - In dryRun: simulate outputs; create small dummy files under 02-Projects/TopRanker/artifacts/simulated/ with checksum.
    - In real run: use spawn with timeouts and resource caps. Default steps:
      - install: npm ci
      - build:server: npm run build (expects dist or build output)
      - build:web: if expo present: npx expo export --platform web --output-dir build-web (optional, do not fail if missing)
      - test: npm test -- --ci --reporter=json (optional controlled by steps)
    - Put logs at 03-Operations/logs/topranker-build-<ts>.log; redact env keys using deep-redaction.ts; attach evidence entries for log and artifact checksums.
    - Compute sha256 checksums; fill TopRankerReleaseArtifact with filePath relative to repo root.

- Create 04-Dashboard/app/lib/workflows/topranker-workflow.ts
  - Export runTopRankerWeeklyLeaderboardWorkflow(input: { category: string; city: string; windowDays?: number; topN?: number; dryRunBuild?: boolean }): Promise<{ workflowId: string; deliverables: string[]; releaseCandidateId: string; }>
  - Steps (use 14-stage orchestrator APIs):
    1) intake (record task with engine='topranker', template='weekly-leaderboard')
    2) plan (Board creates subtasks)
    3) execute (Worker invokes provider with structured schema; collect evidence)
    4) merge (apply TopRankerEngine merge)
    5) validate (contract validation)
    6) store (versioned deliverable store)
    7) approvals (apply gate policies; human if required)
    8) build (invoke runTopRankerBuild with dryRunBuild default true in CI)
    9) assemble (Release candidate assembly; link TopRankerReleaseArtifact deliverables)
    10) lock (lockfiles; promotion readiness)
    11) promotion gate (apply policy)
    12) release (create release entry)
    13) evidence TTL set
    14) complete (record state)
  - Record evidence at each transition; ensure cost/latency metrics and circuit breaker keys tagged by 'engine:topranker'.

4. API routes (server.js)
- Add guarded routes with middleware truth and deep redaction:
  - POST /api/topranker/tasks/run
    - body: { category: string; city: string; windowDays?: number; topN?: number; dryRunBuild?: boolean }
    - calls runTopRankerWeeklyLeaderboardWorkflow; returns workflowId, deliverableIds, releaseCandidateId
    - guard: operator role, tenant isolation, body schema validation; redact secrets in logs
  - POST /api/topranker/build
    - body: { steps?: string[]; dryRun?: boolean }
    - calls runTopRankerBuild; returns artifacts and logs path; operator-only
  - GET /api/topranker/contracts
    - returns getTopRankerContracts()
  - GET /api/topranker/deliverables?since=<iso>&limit=50
    - queries deliverable store filtered by engine='topranker'
- Ensure http-response-guard.ts wraps responses; all errors mapped to safe messages.

5. UI wiring
- Edit 04-Dashboard/app/index.html
  - Add “TopRanker” tab/panel under Projects section with:
    - Form: category (text), city (text), windowDays (number default 7), topN (number default 25), dryRunBuild (checkbox default true), Run button.
    - Sections: Latest Leaderboard Deliverables (table with rank, name, score, confidence, verification status), Scorecards (accordion), Review Aggregations (list), Release Artifacts (list with download/open).
- Edit 04-Dashboard/app/app.js (or operator.js if that’s the project UI controller)
  - Add handlers:
    - fetch('/api/topranker/contracts') on tab load; render schema versions.
    - on Run submit: POST /api/topranker/tasks/run; show workflowId; poll deliverables via /api/topranker/deliverables
  - Render pretty JSON fallback if no formatter exists.
- Edit 04-Dashboard/app/style.css and/or operator.css for minimal layout reuse; no new heavy styling.

6. Observability and governance integration
- Tag all new operations with:
  - metrics.dimensions: { engine: 'topranker', template, provider, schemaVersion }
  - cost tracking: provider tokens, build minutes (simulated as duration ms), artifact sizes bytes
  - circuit breaker key: 'engine:topranker:provider:<name>'
  - EWMA: update per-provider latency for TopRanker tasks
- Respect provider capacity semaphores; cap TopRanker parallel subtasks to default=2 (configurable).
- Backpressure: queue TopRanker work if semaphores saturated.

7. Route protection and redaction
- Add new routes to any existing allowlist/guard list with:
  - Required roles: 'operator'
  - Tenancy: enforce via existing tenant extraction
  - Redactions: POSTGRES_URL, DATABASE_URL, EXPO_TOKEN, any env keys detected in prepareTopRankerEnv.redactions

8. Test suite
- Add tests under 04-Dashboard/app/tests/topranker/
  - test-topranker-contracts.spec.ts
    - Load schemas, validate good and bad payloads; assert errors paths/messages.
  - test-topranker-engine-structured-output.spec.ts
    - Use provider simulator from Part 68/67 to return valid JSON per schema; assert parser maps to deliverables; assert merge de-dups and tie-breakers.
  - test-topranker-repo-adapter.spec.ts
    - Dry-run mode: produce artifacts and checksums; logs exist; redactions applied; validate TopRankerReleaseArtifact shape.
  - test-topranker-e2e-workflow.spec.ts
    - Spin a full workflow with dryRunBuild=true, provider simulator; assert 14-stage transitions, deliverables stored, release candidate assembled, evidence linked.
- Update any central acceptance manifest to include 4 new TopRanker scenarios; target total tests >= 255.
- Ensure tests run offline; skip real expo or network. Mock filesystem with temp dirs as needed but ensure default path resolution still works.

9. State and samples
- Create 04-Dashboard/app/state/samples/topranker/
  - sample-leaderboard.json
  - sample-scorecards.json
  - sample-review-aggregations.json
- Ensure samples pass contract validation; use in tests.

10. Docs
- Create 04-Dashboard/docs/topranker/architecture.md
  - Engine overview, schemas, prompts philosophy, merge policy.
- Create 04-Dashboard/docs/topranker/contracts.md
  - Full JSON Schemas with examples; change control/versioning notes.
- Create 04-Dashboard/docs/topranker/runbook.md
  - How to run /api/topranker/tasks/run; dry-run vs real; logs/arts locations; env vars; troubleshooting.
- Create 04-Dashboard/docs/topranker/e2e.md
  - Walkthrough from intake → release; evidence screenshots/URIs; expected outputs.

11. Commands and run instructions
- In root README or 04-Dashboard/app/README updates, add:
  - curl examples:
    - curl -X POST localhost:PORT/api/topranker/tasks/run -d '{"category":"Coffee","city":"Austin","windowDays":7,"topN":25,"dryRunBuild":true}' -H 'content-type: application/json'
    - curl localhost:PORT/api/topranker/contracts
  - How to run tests: npm run test:topranker (add script to run only new suite if test runner supports) and npm test for all.

12. Hardening
- Timeouts: AI calls 60s; build steps default 10m; configurable via env GPO_TOPRANKER_BUILD_TIMEOUT_MS.
- Budgets: cap tokens per TopRanker task via existing autonomy budgets (document key).
- Retry: exponential backoff 3 attempts on schema parse failures; jitter 100-500ms; respect circuit breaker open state.
- PII guard: forbid collecting user reviews raw text beyond sampleSnippets max 5 and redact emails/phones via deep-redaction.
- Evidence TTL: default 30 days for build logs; align to Part 69; document TTL policy.

Acceptance criteria
1) Four TopRanker contract IDs registered and discoverable via /api/topranker/contracts with JSON Schemas.
2) Structured AI responses for TopRanker templates are validated, parsed, merged, and stored as deliverables with deterministic IDs.
3) Board/Worker path can execute TopRanker weekly leaderboard end-to-end using provider simulator and produce at least one deliverable set and a release candidate.
4) Repo adapter dry-run produces at least one TopRankerReleaseArtifact with checksum and log evidence; real run is optional but must not break offline tests.
5) New API routes are guarded by http-response-guard, pass middleware truth, and redact sensitive values.
6) UI TopRanker panel can trigger a run and display resulting deliverables (table for entries, JSON fallback allowed).
7) Observability shows metrics tagged with engine='topranker'; EWMA and circuit breaker keys updated after run; costs recorded.
8) 255+ tests passing; no regression in existing suites.
9) Docs explain architecture, contracts, runbook, and e2e walkthrough; links from main docs index if present.
10) Backpressure and semaphores limit TopRanker concurrent provider calls to configured cap; queue visible in logs.
11) Evidence chain present at each stage; artifacts and logs entries linked with TTL.
12) All new code is TypeScript-typed, CommonJS-compatible, and adheres to repository lint/build checks.

Deliverables to produce in PR
- New/updated TS modules listed above with implementations.
- Updated server.js routes and guards.
- UI changes for TopRanker panel.
- New tests under tests/topranker with passing assertions.
- State samples for TopRanker.
- Docs under docs/topranker.
- Any updated state catalogs/registries.

Quality bar
- Enterprise-grade, contract-driven, typed; no TODOs; comments where integration assumptions are made.
- Zero flaky tests; offline-friendly; deterministic IDs.
- Preserve existing behavior; no global refactors.

Now implement. For each file you add or modify, include full file content in your response. For server.js, show precise route additions with guard wiring. For schemas, include complete JSON Schema objects. For tests, include full test code. For UI, include only the minimal diffs necessary to render the new panel and form handlers.
```
