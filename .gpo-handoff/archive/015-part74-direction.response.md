```text
You are ChatGPT acting as the GPO/RPGPO builder. Implement Part 74.

Title: Part 74 — Comprehensive Integration Test Suite + Acceptance Harness

Context:
- Repo: /Users/rpgpo/Projects/RPGPO
- App: 04-Dashboard/app
- Baseline complete: Parts 19-73, 115+ TS modules, ~858 API routes, ~530+ types, 283 unit tests passing
- Recently added: Structured output pipeline + board/worker integration (67-68), Observability + cost tracking (69), Parallel DAG runner + queue/backpressure (70), Workflow orchestrator 14-stage (71), TopRanker engine (72), Mission Control + in-app notifications (73)

Problem:
- Lacks end-to-end integration coverage that exercises the complete pipeline: intake → deliberation → schedule → execute → merge → validate → approve → release
- No load testing, chaos testing, or operator-grade acceptance harness
- Individual modules have unit tests, but cross-module wiring is unvalidated

Goal:
- Build a deterministic, contract-driven, end-to-end integration and acceptance harness that:
  - Spins up isolated test sandboxes (state, config, providers)
  - Simulates providers with deterministic, contract-conforming outputs and controllable failure modes
  - Exercises multi-engine workflows through all 14 orchestrator stages to release
  - Verifies deliverables, approvals, releases, metrics, cost accounting, events, redaction, and route guards
  - Can run as: targeted scenarios, suite, load runs, chaos runs
  - Produces machine-readable reports (JUnit XML + JSON) and human summaries
  - Runs locally and in CI without network calls to real providers

Constraints:
- Do not break existing functionality; all current 283 tests must still pass
- Keep CommonJS + TypeScript pattern; no new external dependencies
- All new code must be typed, enterprise-grade, contract-driven
- Test harness must not mutate production state; isolate under a temp sandbox dir
- Simulated providers must honor prompt contracts from Parts 67-68
- Follow repo conventions for modules, exports, and docs

High-level deliverables:
1) Acceptance harness modules (lib/test/*)
2) Provider simulator with behaviors and contract-aware output
3) Scenario DSL + 20 initial end-to-end scenarios across at least 5 engines (incl. TopRanker)
4) Deterministic state sandbox and clock
5) Chaos and load runners (configurable concurrency, error rates, latency)
6) CLI entry points and npm scripts
7) CI integration and JUnit/JSON reports
8) Docs and runbooks
9) Golden snapshots and fixtures
10) Hardening: redaction, route-guard validation, isolation, reproducibility

Repository changes (create/modify):

A) New Types
- 04-Dashboard/app/lib/test/types.ts
  - export interface AcceptanceScenario {
      id: string;                 // e.g., "topranker-basic-happy"
      title: string;
      seed: number;
      engines: string[];          // engine IDs involved
      intake: IntakeSpec;         // intake payload to start the workflow
      workflow: WorkflowSpec;     // optional orchestrator overrides
      chaos?: ChaosSpec;          // failure/latency injection
      load?: LoadSpec;            // optional concurrency settings
      expectations: Expectations; // contracts to verify
    }
  - export interface IntakeSpec {
      tenantId: string;
      projectId: string;
      type: "task" | "mission" | "release";
      payload: Record<string, unknown>;
    }
  - export interface WorkflowSpec {
      autopilot?: boolean;        // auto-approve gates for tests
      approver?: string;          // simulated approver principal
      timeouts?: Partial<Record<OrchestratorStage, number>>;
      capacity?: { maxWorkers?: number; queueSize?: number };
    }
  - export type OrchestratorStage = 
      | "IntakeRegistered" | "Planned" | "Scheduled" | "Executing" | "Merged"
      | "Validated" | "AwaitingApproval" | "Approved" | "Assembled" | "Locked"
      | "ReadyForRelease" | "Released" | "Completed" | "Archived";
  - export interface ChaosSpec {
      providerErrorRate?: number;      // 0..1
      providerSlowRate?: number;       // 0..1
      providerInvalidJsonRate?: number;// 0..1
      jitterMs?: { min: number; max: number };
      hardFailStages?: OrchestratorStage[]; // force failures at specific stages
    }
  - export interface LoadSpec {
      runs: number;             // total workflows to start
      concurrency: number;      // simultaneous workflows
      rampUpMs?: number;        // spread starts over time
    }
  - export interface Expectations {
      stages: OrchestratorStage[]; // required visited stages in order
      deliverables: ExpectedDeliverable[]; // by contract + values
      approvals?: ExpectedApproval[];
      release?: ExpectedRelease;
      metrics?: ExpectedMetrics;
      costs?: ExpectedCosts;
      events?: ExpectedEventAssertion[];
      httpGuards?: ExpectedHttpGuard[];    // for route guard/redaction checks
    }
  - export interface ExpectedDeliverable {
      contractId: string;    // e.g., "topranker.rankings.v1"
      variant?: string;      // policy variant if used
      fields?: Record<string, FieldExpectation>;
      minArtifacts?: number;
      approved?: boolean;
    }
  - export type FieldExpectation =
      | { equals: unknown }
      | { contains: string }
      | { matches: RegExpString } // represent regex as string literal and compile
      | { notEmpty: true }
      | { range: { min?: number; max?: number } };
  - export type RegExpString = string;
  - export interface ExpectedApproval {
      gateId: string;
      approver: string;
      status: "approved" | "rejected";
    }
  - export interface ExpectedRelease {
      hasLockfile: boolean;
      componentCountMin?: number;
      notesContains?: string[];
    }
  - export interface ExpectedMetrics {
      totalTasksMin?: number;
      totalSubtasksMin?: number;
      p95LatencyMsMax?: number;
      errorRateMax?: number;
    }
  - export interface ExpectedCosts {
      providerTotalsMaxUSD?: number;
      perProviderMaxUSD?: Record<string, number>;
    }
  - export interface ExpectedEventAssertion {
      topic: string;              // event name/topic from observability layer
      countMin?: number;
      payloadContains?: string[];
    }
  - export interface ExpectedHttpGuard {
      route: string;
      method: "GET" | "POST" | "PUT" | "DELETE";
      expectStatus: number;
      redactFields?: string[];    // fields that must be masked/stripped
    }

B) Provider Simulator
- 04-Dashboard/app/lib/test/provider-sim.ts
  - export interface ProviderSimOptions {
      seed: number;
      behavior?: {
        errorRate?: number;
        slowRate?: number;
        invalidJsonRate?: number;
        minLatencyMs?: number;
        maxLatencyMs?: number;
      };
    }
  - export function createProviderSim(opts: ProviderSimOptions): ProviderRegistry
    - Returns a ProviderRegistry implementation compatible with existing provider governance layer (Parts 31-40, 69).
    - For each provider ID ("openai", "anthropic", "gemini", "perplexity"), implement:
      - deterministic, contract-aware responses using seed + prompt + contract schema hash
      - honor behavior toggles (error, slow, invalid json)
      - emit observability events and cost metrics consistent with configured model pricing (fake, but stable)
    - Generation rules:
      - If prompt includes deliverable schema (from Part 67 contract-aware prompts), emit strict JSON matching required fields.
      - If invalidJsonRate triggers, return corrupted JSON once, then recover on retry.
      - Attach "providerTraceId" to response metadata for correlation.

C) Test Sandbox and Utilities
- 04-Dashboard/app/lib/test/state-sandbox.ts
  - export interface Sandbox {
      id: string;
      dir: string;     // distinct /state sandbox path for this run
      config: TestConfig;
      cleanup(): Promise<void>;
    }
  - export interface TestConfig {
      tenantId: string;
      projectId: string;
      autopilot: boolean;
      seed: number;
      overrides?: Partial<AppConfig>; // use existing config type; support provider registry injection
    }
  - export async function createSandbox(cfg: TestConfig): Promise<Sandbox>
    - Creates a temporary state directory under 04-Dashboard/app/state-test/<id>/
    - Clones baseline state seeds needed for runs (users, policies, engines, contracts)
    - Installs provider-sim registry
    - Ensures isolation: no writes escape sandbox dir
- 04-Dashboard/app/lib/test/clock-sim.ts
  - export function createClock(seed: number): Clock
    - Deterministic monotonic clock interface used by orchestrator, if injectable; otherwise polyfill wrappers as needed
- 04-Dashboard/app/lib/test/event-capture.ts
  - export interface EventCapture {
      subscribe(topics?: string[]): Unsubscribe;
      all(): ObservedEvent[];
      find(predicate: (e: ObservedEvent) => boolean): ObservedEvent | undefined;
    }
  - ObservedEvent includes timestamp, topic, payload (redacted), traceIds

D) Acceptance Runner and Load/Chaos
- 04-Dashboard/app/lib/test/acceptance-runner.ts
  - export interface RunOptions {
      scenario: AcceptanceScenario;
      sandbox?: Sandbox;
      reporters?: Reporter[];
      mode?: "single" | "suite" | "load" | "chaos";
    }
  - export interface RunResult {
      scenarioId: string;
      passed: boolean;
      failures: FailureDetail[];
      metrics: CollectedMetrics;
      timeline: TimelineEvent[];
      artifactsDir: string;
      junitXmlPath: string;
      jsonReportPath: string;
    }
  - export async function runScenario(opts: RunOptions): Promise<RunResult>
    - Steps:
      1) Create sandbox if not provided; wire provider-sim, clock-sim, event-capture
      2) Start in-process server in test mode (random port), or bypass HTTP by invoking orchestrator APIs directly based on scenario flag
      3) Register intake (HTTP or in-proc), obtain workflowId
      4) Drive orchestrator through all stages (respecting 14-stage machine) with autopilot approval
      5) Wait for DAG runner completion (observe backpressure/capacity per scenario)
      6) Verify deliverables per contract fields and artifact counts
      7) Verify approvals, release assembly, lockfiles, and final release state
      8) Verify observability metrics and costs collected (69)
      9) Exercise http-response-guard on selected routes and verify deep redaction (Existing modules: http-response-guard.ts, deep-redaction.ts)
      10) Save artifacts: logs, traces, merged outputs, release manifests, event stream
      11) Emit JUnit XML + JSON report and human-readable summary
      12) Cleanup if ephemeral; retain artifacts on failure
  - Add support functions:
    - startTestServer(sandbox): Promise<{ port: number; stop: () => Promise<void> }>
    - invokeHttpGuardCheck(port, ExpectedHttpGuard): Promise<void>
    - waitForStages(workflowId, stages[], timeoutMs): Promise<void>

- 04-Dashboard/app/lib/test/load-runner.ts
  - export interface LoadRunOptions {
      baseScenario: AcceptanceScenario;
      runs: number;
      concurrency: number;
      rampUpMs?: number;
      chaos?: ChaosSpec;
    }
  - export async function runLoad(opts: LoadRunOptions): Promise<AggregateRunResult>
    - Launch multiple scenarios with shared sandbox or per-run sandboxes (configurable)
    - Aggregate metrics: throughput, p50/p95/p99 latency, error rate, queue depth max, backpressure activations
    - Enforce SLO assertions if provided

- 04-Dashboard/app/lib/test/chaos-injector.ts
  - export function withChaos<T>(scenario: AcceptanceScenario, fn: () => Promise<T>): Promise<T>
    - Wrap provider-sim and selected orchestration stages to inject failures/timeouts according to ChaosSpec
    - Ensure retries/exponential backoff paths are exercised

E) Scenarios and Fixtures
- 04-Dashboard/app/tests/acceptance/scenarios/topranker-basic.ts
  - Happy path: single-engine TopRanker, 1 deliverable (rankings.v1), approved, released
- 04-Dashboard/app/tests/acceptance/scenarios/topranker-multi-template.ts
  - Multi-template generation (3 templates), merge policy variants, approval gate
- 04-Dashboard/app/tests/acceptance/scenarios/multi-engine-research-release.ts
  - Planning + Research + Synthesis engines, combined deliverables, assembled release
- 04-Dashboard/app/tests/acceptance/scenarios/parallel-dag-capacity.ts
  - 10 subtasks across 3 engines, capacity=3, backpressure validated
- 04-Dashboard/app/tests/acceptance/scenarios/chaos-retry-recovery.ts
  - provider error rate 0.2, invalid JSON injections, eventual success, override ledger entry check
- 04-Dashboard/app/tests/acceptance/scenarios/redaction-route-guard.ts
  - Exercise protected routes; verify field masks/strips on sensitive fields
- 04-Dashboard/app/tests/acceptance/scenarios/release-lockfile-assembly.ts
  - Verify lockfiles and component counts with approvals
- 04-Dashboard/app/tests/acceptance/scenarios/cost-metrics-bounds.ts
  - Cost ceilings enforced; metrics produced; provider totals within bounds
- 04-Dashboard/app/tests/acceptance/scenarios/load-50-concurrent.ts
  - Load: 200 runs, concurrency 50, p95 under threshold, error rate under threshold
- 04-Dashboard/app/tests/acceptance/scenarios/autopilot-approve.ts
  - Autopilot on, gates auto-approved

- 04-Dashboard/app/tests/fixtures/*
  - Seed payloads for intakes, expected skeletons, golden snapshots
  - Golden outputs under 04-Dashboard/app/tests/golden/<scenarioId>/* for snapshot comparisons

F) CLI Entrypoints and Scripts
- 04-Dashboard/app/scripts/test-acceptance.ts
  - CLI usage:
    - node dist/scripts/test-acceptance.js --scenario <id>
    - node dist/scripts/test-acceptance.js --suite all
    - node dist/scripts/test-acceptance.js --load --scenario load-50-concurrent
    - Flags: --reportDir, --keepSandboxes, --http, --seed, --junit, --json
  - Discovers scenarios in tests/acceptance/scenarios/*.ts and executes with acceptance-runner
- Update package.json (in 04-Dashboard or root as appropriate)
  - "scripts": {
      "build": "tsc -p 04-Dashboard/app",
      "test:acceptance": "node 04-Dashboard/app/dist/scripts/test-acceptance.js --suite all",
      "test:acceptance:load": "node 04-Dashboard/app/dist/scripts/test-acceptance.js --scenario load-50-concurrent",
      "test:integration": "npm run build && npm run test:acceptance"
    }

G) Server Test Mode
- 04-Dashboard/app/server.js and lib/config.ts
  - Add test mode toggle via env GPO_TEST_MODE=1 and config override
  - If test mode: 
    - listen on random port
    - reduce noisy logging to trace file inside sandbox
    - ensure provider registry and state path injected from sandbox
  - Export startServer(configOverride): Promise<{ port, stop }>

H) Docs
- 04-Dashboard/app/docs/testing/Part-74-AcceptanceHarness.md
  - Overview, architecture, how to run locally and in CI
  - How provider-sim works and how to add scenarios
  - Scenario DSL reference
  - Interpreting reports and artifacts
  - Load and chaos guidance
- 04-Dashboard/app/docs/runbooks/acceptance-failures.md
  - Triage guide, common failures, where to find artifacts
- ADR: 04-Dashboard/app/docs/adr/ADR-00X-acceptance-harness.md
  - Decision to implement custom harness over external frameworks

I) Reporting
- 04-Dashboard/app/lib/test/reporters/junit-reporter.ts
  - export function writeJUnit(result: RunResult, outDir: string): Promise<string>
- 04-Dashboard/app/lib/test/reporters/json-reporter.ts
  - export function writeJson(result: RunResult, outDir: string): Promise<string>
- 04-Dashboard/app/lib/test/reporters/summary.ts
  - export function printSummary(result: RunResult): void

J) CI
- 03-Operations/ci/test-acceptance.yml (if CI configs exist)
  - Run build, spin acceptance suite, publish artifacts and JUnit for CI

Integration points and contracts:
- Provider governance: Ensure createProviderSim returns a registry compatible with existing provider resolution and budget enforcement. If a ProviderRegistry type exists, extend it; otherwise, define an adapter.
- Orchestrator (Part 71): Expose programmatic start/await APIs if not present (e.g., startWorkflow(intake): workflowId; waitForCompletion(workflowId): final state).
- DAG runner (Part 70): Export hooks to await quiescence in tests; capture queue stats.
- Observability (Part 69): Provide accessors for captured metrics per sandbox; expose p95 calculation utilities for assertions.
- Deliverables (Parts 59-66): Leverage contract schemas to validate provider-sim output and final stored artifacts.
- Route guard/redaction: Use existing http-response-guard.ts + deep-redaction.ts; add test route hits validating expected masks.

Implementation steps:
1) Types and test utilities
   - Implement lib/test/types.ts, state-sandbox.ts, clock-sim.ts, event-capture.ts
2) Provider simulator
   - Implement provider-sim.ts with deterministic, contract-aware response generation
   - Wire cost accounting hooks to produce plausible, bounded costs
3) Acceptance runner
   - Implement acceptance-runner.ts using sandbox + provider-sim
   - Add report writers and artifact persistence
4) Scenarios
   - Implement at least 10 scenarios listed above; ensure a minimum of 20 assertions per scenario covering stages, deliverables, approvals, release, metrics, costs, events, and http guards
   - Include 5 engines minimum: TopRanker, Research/Synthesis, Planner, Summarizer, ReleaseAssembler (or equivalents present)
5) Load and chaos
   - Implement load-runner.ts and chaos-injector.ts; add "load-50-concurrent" scenario
6) Server test mode
   - Add startServer export with test overrides; integrate with runner for HTTP-mode validation
7) Scripts and CI
   - Add test-acceptance.ts CLI; update package.json scripts; add CI workflow if applicable
8) Docs and ADR
   - Author documentation and runbooks

Acceptance criteria:
- New scripts:
  - npm run test:acceptance runs full suite locally; all pass
  - npm run test:acceptance:load executes load-50-concurrent and prints throughput/latency summary
- Minimum scenarios:
  - 10 implemented, covering: happy path, multi-template, multi-engine, parallel capacity/backpressure, chaos retry, redaction guard, release lockfiles, cost/metrics bounds, load, autopilot approvals
- Coverage:
  - All 14 orchestrator stages observed across scenarios
  - At least 5 distinct engines exercised (including TopRanker from Part 72)
- Determinism:
  - Re-running with same seed yields identical artifacts and reports
- Provider-sim:
  - Generates contract-valid JSON for structured prompts; supports error/slow/invalid modes per ChaosSpec
- Metrics and costs:
  - p95 latency under configurable bound in load scenario (set initial bound to 5s)
  - Error rate under 5% with chaos enabled at 20% transient errors due to retries
- Guards and redaction:
  - Selected routes verified to redact specified sensitive fields; mismatches fail scenario
- Artifacts:
  - For each scenario, artifacts saved under state-test/<runId>/artifacts with: event stream, merged outputs, release manifests, metrics.json, junit.xml, report.json
- No regressions:
  - Existing 283 unit tests continue to pass
- Docs:
  - Part-74-AcceptanceHarness.md explains usage; acceptance-failures.md provides triage steps

Hardening notes:
- Ensure sandbox isolation: never write to production state/ directories during tests
- Mask secrets in all captured artifacts; enforce deep-redaction on event payload persistence
- Use strict type checks and exhaustiveness in scenario validation
- Implement timeout guards for each stage to avoid hanging tests; include diagnostics on timeout
- Ensure clean stop of servers and workers to prevent port leaks between scenarios
- Backpressure verification: assert queue depth never exceeds configured limit; record max observed
- Include retry policy assertions: count retries for transient provider failures under chaos

Edits to existing modules (surgical):
- lib/config.ts: Add test-mode overrides and injectable provider registry
- server.js: Export startServer(testOverrides) without altering default startup path
- Orchestrator/DAG modules: If not already present, expose awaitQuiescence/workflowWaiters used by test harness
- Observability: Expose APIs to read collected metrics/events per tenant/project in test mode

Deliverable check-in plan:
- Commit 1: Types + sandbox + provider-sim
- Commit 2: Acceptance runner + reporters
- Commit 3: Core scenarios (5)
- Commit 4: Chaos + load + additional scenarios (5+)
- Commit 5: Server test mode + CLI + scripts
- Commit 6: Docs + ADR
- Commit 7: CI wiring and final green run

Now implement exactly as specified. Produce typed code, keep CommonJS modules, update exports, and ensure all new modules compile with existing tsconfig. Add scenario assertions that fail loud with clear diffs. Retain parity with existing coding style.
```
