```
You are ChatGPT acting as Senior Platform Engineer for RPGPO. Implement Part 90 end-to-end.

Part 90: Task Dependency Graph Visualization + Critical Path Analysis

Goal
- Add typed, contract-driven visualization data for task execution DAGs.
- Compute critical path using CPM, compute per-node slack, and detect bottlenecks.
- Expose secure APIs for operator UI, update on runtime events, and render an interactive graph showing blockers and optimal execution path.
- Preserve all existing functionality and governance controls.

Constraints
- Keep CommonJS + TypeScript patterns used in 04-Dashboard/app/lib.
- Raw Node.js HTTP in server.js, wire via existing guard/middleware patterns.
- Tenant/project isolation and deep redaction must hold.
- Deterministic IDs, versioned payloads, and immutability for computed artifacts persisted to state/.
- O(V+E) algorithms, handle up to 1500 nodes, 10k edges.

Key Definitions
- DAG source of truth: the existing planned execution graph from Board/Chief-of-Staff task orchestration, including subtasks, approvals, engine steps, and cross-engine dependencies.
- Duration: actual if finished; else estimated from engine configs and historical metrics.

Deliverables (files to add/modify)
- 04-Dashboard/app/lib/types.ts (extend types)
- 04-Dashboard/app/lib/graph/graph-builder.ts (new)
- 04-Dashboard/app/lib/graph/critical-path.ts (new)
- 04-Dashboard/app/lib/graph/bottleneck.ts (new)
- 04-Dashboard/app/lib/graph/serialization.ts (new)
- 04-Dashboard/app/lib/graph/state-cache.ts (new)
- 04-Dashboard/app/lib/graph/events.ts (new)
- 04-Dashboard/app/server.js (routes + SSE stream)
- 04-Dashboard/app/app.js (operator UI: panel + rendering + SSE)
- 04-Dashboard/app/operator.js (hook into task detail)
- 04-Dashboard/app/style.css (+operator.css) (styles)
- 04-Dashboard/app/state/graphs/.gitkeep (ensure folder)
- 04-Dashboard/app/state/metrics/.gitkeep (ensure folder)
- 04-Dashboard/docs/adr/ADR-0xx-task-graph-and-cpm.md
- 04-Dashboard/docs/runbooks/task-graph-analysis.md
- 04-Dashboard/docs/api/task-graph.md
- 03-Operations/logs/ (ensure new log categories if needed)
- 04-Dashboard/app/tests/acceptance/task-graph-*.json (12 cases)

Types (add to lib/types.ts; do not break existing exports)
- Export new namespaces and interfaces. Use readonly where possible.

  export type TaskNodeId = string & { readonly __brand: "TaskNodeId" };
  export type TaskEdgeId = string & { readonly __brand: "TaskEdgeId" };
  export type TaskGraphVersion = "graph.v1";
  export type GraphMetricVersion = "metrics.v1";

  export interface TaskNodeRef {
    readonly id: TaskNodeId;
    readonly taskId: string;           // parent top-level task id
    readonly subtaskId?: string;       // if a subtask
    readonly phase?: string;           // planning|execution|approval|merge|release
    readonly engine?: string;          // engine id/name
  }

  export interface TaskNodeTiming {
    readonly plannedDurationMs?: number;     // from plan
    readonly expectedDurationMs?: number;    // heuristic/engine-based
    readonly historicalDurationMsP50?: number;
    readonly historicalDurationMsP90?: number;
    readonly startedAt?: string;             // ISO
    readonly completedAt?: string;           // ISO
  }

  export type TaskNodeStatus =
    | "planned"
    | "ready"
    | "running"
    | "waiting-approval"
    | "blocked"
    | "completed"
    | "failed"
    | "skipped"
    | "on-hold";

  export interface TaskNodeAttributes {
    readonly status: TaskNodeStatus;
    readonly priority?: number;               // lower number = higher priority
    readonly autonomyBudget?: number;
    readonly costSoFarUsd?: number;
    readonly riskScore?: number;              // 0-1
    readonly blockingReasons?: ReadonlyArray<string>; // approval, dependency, quota, policy, etc.
    readonly deliverableIds?: ReadonlyArray<string>;
  }

  export interface TaskGraphNode {
    readonly ref: TaskNodeRef;
    readonly label: string;
    readonly timing: TaskNodeTiming;
    readonly attrs: TaskNodeAttributes;
  }

  export interface TaskGraphEdge {
    readonly id: TaskEdgeId;
    readonly from: TaskNodeId;
    readonly to: TaskNodeId;
    readonly type: "hard" | "soft" | "approval" | "data" | "merge";
    readonly label?: string;
  }

  export interface TaskGraph {
    readonly version: TaskGraphVersion;
    readonly graphId: string;
    readonly taskId: string;
    readonly nodes: ReadonlyArray<TaskGraphNode>;
    readonly edges: ReadonlyArray<TaskGraphEdge>;
    readonly createdAt: string;
    readonly source: "plan" | "runtime" | "reconstructed";
    readonly sourceHash: string; // stable hash of inputs for cache
  }

  export interface CriticalPathNodeMetrics {
    readonly nodeId: TaskNodeId;
    readonly durationMs: number;           // actual or expected
    readonly est: number;                  // earliest start
    readonly eft: number;                  // earliest finish
    readonly lst: number;                  // latest start
    readonly lft: number;                  // latest finish
    readonly slackMs: number;
    readonly isCritical: boolean;
  }

  export interface CriticalPathResult {
    readonly version: GraphMetricVersion;
    readonly taskId: string;
    readonly graphId: string;
    readonly totalDurationMs: number;          // length of CP
    readonly criticalPath: ReadonlyArray<TaskNodeId>;
    readonly perNode: ReadonlyArray<CriticalPathNodeMetrics>;
    readonly hasCycle: boolean;
    readonly cycleInfo?: {
      readonly nodeIds: ReadonlyArray<TaskNodeId>;
      readonly edges: ReadonlyArray<TaskEdgeId>;
    };
    readonly computedAt: string;
    readonly algorithm: "CPM-Kahn-Topo";
    readonly inputsHash: string;
  }

  export interface BottleneckMetric {
    readonly nodeId: TaskNodeId;
    readonly reason: "high-slack-consumer" | "queue-wait" | "approval-gate" | "quota" | "engine-latency" | "fan-in" | "fan-out" | "policy-hold";
    readonly score: number; // 0-1 normalized severity
    readonly details?: string;
  }

  export interface BottleneckAnalysis {
    readonly version: GraphMetricVersion;
    readonly taskId: string;
    readonly graphId: string;
    readonly bottlenecks: ReadonlyArray<BottleneckMetric>;
    readonly computedAt: string;
    readonly inputsHash: string;
  }

  export interface TaskGraphBundle {
    readonly graph: TaskGraph;
    readonly cpm: CriticalPathResult;
    readonly bottlenecks: BottleneckAnalysis;
  }

Modules

1) lib/graph/state-cache.ts
- Purpose: deterministic file-backed cache for graph and metrics.
- API:
  - loadGraph(taskId: string): Promise<TaskGraph | null>
  - saveGraph(graph: TaskGraph): Promise<void>
  - loadCP(taskId: string, graphId?: string): Promise<CriticalPathResult | null>
  - saveCP(result: CriticalPathResult): Promise<void>
  - loadBottlenecks(taskId: string, graphId?: string): Promise<BottleneckAnalysis | null>
  - saveBottlenecks(result: BottleneckAnalysis): Promise<void>
  - computeInputsHash(inputs: unknown): string // stable hash
- Files:
  - state/graphs/{taskId}.{graphId}.graph.v1.json
  - state/metrics/{taskId}.{graphId}.cpm.v1.json
  - state/metrics/{taskId}.{graphId}.bottlenecks.v1.json
- Requirements:
  - Atomic writes, fsync, and safe temp file -> rename.
  - Enforce tenant isolation via existing isolation helpers.
  - Integrate deep redaction on persisted attrs that may contain sensitive contents.

2) lib/graph/graph-builder.ts
- Purpose: build a normalized TaskGraph from the plan/runtime.
- Inputs:
  - taskId: string
  - sources: from existing Chief-of-Staff/board orchestration, deliverable registry, runtime hooks, approval queue. Reuse existing module APIs; do not duplicate logic.
- API:
  - buildTaskGraph(taskId: string): Promise<TaskGraph>
- Behavior:
  - Deterministic node/edge IDs: stable across runs given same plan. Use taskId + subtask id + phase + engine + edge kind hashed into hex.
  - Edge types: "hard" for must-finish deps, "approval" for approval gating, "data" when output->input dependency is registered, "merge" for deliverable merges, "soft" for advisory ordering.
  - Node timing:
    - durationMs actual = completedAt - startedAt if both exist and status completed/failed.
    - expectedDurationMs:
      1) prefer plan.plannedDurationMs
      2) else engine latency profile for that step (existing engine catalog)
      3) else historical median for this node signature (engine+opType)
      4) else default 60_000
  - Node attrs: status from runtime; blockingReasons from gates, quotas, holds, unmet deps.
  - sourceHash: include plan version id + runtime counters relevant to deps.

3) lib/graph/critical-path.ts
- Purpose: compute CPM via topological sort (Kahn).
- API:
  - computeCriticalPath(graph: TaskGraph): CriticalPathResult
- Details:
  - Build adjacency and indegree.
  - For each node, determine durationMs = actual or expected.
  - Earliest times (EST/EFT) via topo order.
  - Latest times (LST/LFT) via reverse topo, initialize project duration as max EFT across exits (nodes with outdegree 0).
  - Slack = LST - EST (in ms).
  - Critical nodes where slackMs === 0 (tolerate +/- 1ms rounding).
  - Cycle detection: if processed nodes < total nodes; attempt to extract a cycle subgraph; set hasCycle and cycleInfo.
  - totalDurationMs = max EFT.
  - Deterministic ordering: tie-break topo queue by nodeId lexicographic.

4) lib/graph/bottleneck.ts
- Purpose: compute heuristic bottleneck scores.
- API:
  - analyzeBottlenecks(graph: TaskGraph, cpm: CriticalPathResult): BottleneckAnalysis
- Heuristics (sum clipped 0-1):
  - approval-gate: status waiting-approval with many downstream dependents (fan-out > 3): base 0.4 + 0.05*fan-out
  - queue-wait: status ready for > threshold time but not started: 0.3..0.8 scaled by wait duration vs expected
  - engine-latency: expectedDurationMs P90 >> P50: 0.2..0.6
  - quota: blockingReasons includes quota/limit: 0.5
  - policy-hold: includes policy/governance hold: 0.6
  - fan-in: indegree > 4 and upstreams not completed: 0.1*indegree
  - high-slack-consumer: upstream is critical and this node has large slack (> 2x median): 0.2..0.6
- Include details for operator.

5) lib/graph/serialization.ts
- Purpose: shape data for UI JSON, stable versioning and redaction.
- API:
  - toUiBundle(bundle: TaskGraphBundle): any // JSON ready, version-tagged
  - redactNodeForUi(node: TaskGraphNode): TaskGraphNode // ensure fields with PII masked via deep redaction policy

6) lib/graph/events.ts
- Purpose: wire recomputation into runtime events.
- API:
  - onTaskEvent(event: { type: "start"|"subtask-complete"|"complete"|"approval-change"|"hold-change"; taskId: string; subtaskId?: string }): Promise<void>
- Behavior:
  - Rebuild graph, recompute CPM + bottlenecks on events.
  - Save to state cache.
  - Push updates to SSE stream clients if any.

Server APIs (server.js)
- All routes must be wired through existing http-response-guard.ts and redaction middleware. Ensure access control aligns with existing operator permissions. No unguarded routes.

1) GET /api/v1/tasks/:taskId/graph
- Response: { ok: true, bundle: TaskGraphBundle } with versioned objects; redacted for UI.
- Query: ?fresh=1 to force rebuild.
- Caching: default serve cached if computedAt within 15s; else recompute async and return cached.

2) GET /api/v1/tasks/:taskId/graph/metrics
- Response: { ok: true, metrics: { cpm: CriticalPathResult, bottlenecks: BottleneckAnalysis } }
- Same caching rules.

3) POST /api/v1/tasks/:taskId/graph/recompute
- Body: { reason?: string }
- Forces rebuild + recompute; returns { ok: true, graphId }.
- Rate limit: max 1/5s per taskId.

4) GET /api/v1/tasks/:taskId/graph/stream
- SSE stream. Event types:
  - graph:update -> TaskGraph (redacted)
  - metrics:update -> { cpm, bottlenecks }
- Heartbeat every 15s.
- Disconnect idle after 15 minutes.

Server Implementation Notes
- Do not block event loop with heavy compute; use setImmediate batching and chunk arrays if needed.
- For compute operations, timebox to 200ms per 2k nodes; if exceeded, yield to loop.
- Log to 03-Operations with category "graph" and "cpm".

UI (app.js/operator.js/style.css)
- Operator Task Detail: add a new tab “Graph”.
- Rendering:
  - Use <svg> in the panel; no external libraries.
  - Minimal layout: rank by topological level (longest path to node), horizontal lanes by level, edges as paths with arrowheads.
  - Colors:
    - Critical path nodes: bold border + red edges.
    - Blocked/hold: node fill amber/red.
    - Completed: green fill.
    - Running: blue border pulse.
  - Legend + toolbar:
    - Toggle: Show only critical path
    - Toggle: Show bottlenecks heatmap
    - Toggle: Show labels
    - Button: Recompute
  - Side panel on node hover/click: shows status, timing (actual/expected), slack, blockingReasons, deliverables links (click to open existing deliverables panel).
- Data:
  - Fetch /graph on tab open; connect SSE to /graph/stream.
  - Optimistically update UI on SSE messages.
  - Handle redacted fields gracefully.
- Accessibility:
  - Keyboard nav across nodes within a level.
  - Tooltips with aria labels.

Governance and Redaction
- Use deep-redaction.ts to mask deliverable content references, secret names, PII fields.
- Ensure tenant/project isolation checks apply: cannot load graph for tasks outside operator’s project/tenant.
- Respect route/mutation guards. These routes are read-only except recompute; recompute only manipulates cached analysis artifacts.

Runtime Hooks
- In lib/chief-of-staff.ts or existing runtime pipeline hooks (onTaskStart/onSubtaskComplete/onTaskComplete):
  - Call lib/graph/events.onTaskEvent for:
    - onTaskStart -> type "start"
    - onSubtaskComplete -> type "subtask-complete"
    - approval updates -> "approval-change"
    - holds/quota -> "hold-change"
    - onTaskComplete -> "complete"

Performance & Determinism
- All IDs deterministic: build using stable hashing of ref fields (taskId/subtaskId/phase/engine) and for edges (from->to + type).
- Sorting: default sort nodes by (isCritical desc, slack asc, level asc, label asc).
- Memory: Avoid retaining large deliverable payloads; store only ids/labels.
- Large graphs: virtualize drawing by culling off-screen nodes; cap edges rendered per frame.

Error Handling
- Cycles:
  - Return hasCycle=true; include cycleInfo; set warning in UI panel.
  - Emit governance event to audit hub; do not attempt to schedule until operator resolves.
- Missing durations:
  - Use fallback expectedDurationMs and label node “est.” in UI.
- API failures:
  - Show toast and present cached snapshot with timestamp.

Docs
- ADR-0xx-task-graph-and-cpm.md
  - Problem, context, alternatives, chosen approach (CPM Kahn), tradeoffs, performance.
- runbooks/task-graph-analysis.md
  - How to debug graph, recompute, resolve cycles, adjust estimates.
- api/task-graph.md
  - Route specs, payload schemas, versioning, examples.

Acceptance Criteria (add 12 cases in tests/acceptance/)
1) Simple linear chain A->B->C: CP = [A,B,C], total = sum durations.
2) Fork-join: A -> {B,C} -> D. Longest branch wins; slack computed correctly.
3) Zero-duration node (approval): not affect CP unless it gates.
4) Missing durations: expected used; UI marks as estimated; CPM still computed.
5) Cycle introduced erroneously: hasCycle=true; cycle nodes enumerated; UI shows warning.
6) Soft dependency edges do not affect CPM; hard edges do.
7) Bottleneck approval gate with high fan-out scored highest.
8) Quota hold node flagged as bottleneck; details mention quota.
9) Recompute API updates state files and broadcasts SSE; UI updates without reload.
10) Redaction: deliverable ids present; no payload contents leak in API.
11) Large graph 800 nodes, 4k edges computed < 500ms and UI responsive; no OOM.
12) Multi-tenant isolation: user from tenant A cannot fetch graph for tenant B task; 403 returned.

Security/Hardening
- Apply http-response-guard.ts to all 4 routes.
- Enforce input validation on :taskId (length, charset).
- SSE guards: verify session each heartbeat; terminate if revoked.
- Rate limit recompute to 1/5s per task; 429 otherwise.
- Logs: no sensitive data; include graphId, counts, compute time.
- Persisted files: include version, createdAt/computedAt, inputsHash; never overwrite different inputsHash without new files.

Implementation Steps
1) Extend lib/types.ts with new interfaces above.
2) Implement lib/graph/state-cache.ts with atomic file IO and hashing.
3) Implement lib/graph/graph-builder.ts: gather data via existing orchestration modules; produce TaskGraph with deterministic IDs and timing/attrs.
4) Implement lib/graph/critical-path.ts with CPM (Kahn topo) and cycle detection.
5) Implement lib/graph/bottleneck.ts using heuristic scoring.
6) Implement lib/graph/serialization.ts to package TaskGraphBundle for UI and apply redaction.
7) Implement lib/graph/events.ts to orchestrate recompute and SSE notifications.
8) Wire server.js routes and SSE stream; guard and redact.
9) Add UI tab/panel in app.js/operator.js; implement SVG renderer and controls; connect SSE.
10) Add docs (ADR, runbook, API).
11) Add acceptance tests (12 cases) and run the 150+ scenario suite; ensure no regressions.
12) Profile on a synthetic 1k node graph; verify CPU/memory budget; add micro-optimizations if needed.

Testing Notes
- Unit test CPM with frozen small graphs; assert est/eft/lst/lft/slack.
- Snapshot test serialization payloads with version tags.
- Simulate runtime events and verify SSE message order and debouncing.
- Chaos: insert bogus node references; builder must omit invalid edges and log.

Success Criteria
- Operators can open any task, view a responsive graph with critical path and bottlenecks highlighted.
- Metrics recompute on runtime events and via explicit recompute, streaming to the UI.
- No data leaks; all routes properly guarded; performance acceptable at stated scale.
- State artifacts are deterministic and versioned; docs explain operation and troubleshooting.

Do
- Reuse existing engine latency and historical metrics modules.
- Use existing isolation, redaction, and guard utilities.
- Keep APIs stable and versioned; future-proof via version fields.

Don’t
- Introduce third-party visualization libs.
- Block the event loop for long computations.
- Store raw deliverable contents in graph artifacts.

Output
- Open a PR titled: Part 90 — Task Dependency Graph + Critical Path + Bottlenecks
- Include before/after screenshots of UI and example JSON payloads in the PR description.
```
