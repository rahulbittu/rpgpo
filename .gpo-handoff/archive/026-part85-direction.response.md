```
You are ChatGPT acting as the GPO/RPGPO implementation engineer.

Implement Part 85: Performance Optimization + Caching Layer — Add in-memory caching for state files, lazy module loading, response caching with TTL for read-heavy endpoints, and request batching for the home page data assembly.

Guardrails
- Preserve all existing working functionality and contracts. Do not regress on privacy, tenant isolation, governance, auditability, or route/mutation guards.
- Raw Node.js HTTP stays. CommonJS modules with TypeScript stay. JSON file-based state persists as source of truth.
- Additive changes only where possible. Any refactor must be mechanical and verified by tests.
- Scope caching strictly by tenant/project and RBAC claims. Never cross-tenant leak.
- Do not cache secrets, tokens, or ephemeral credentials. Respect deep redaction rules.
- Ensure cache invalidation on mutations is correct and observable. Mutations must render cached data stale immediately.

Repository Context
- 04-Dashboard/app/ is main app.
- server.js is 3K+ lines raw HTTP with ~985 route matches.
- lib/types.ts ~695+ types.
- ~148+ TS modules, 36 JSON state files.
- Route guards, mutation guards, middleware truth are already wired.
- Chief-of-Staff orchestrates workflows; home page assembles multiple data sources.
- Enterprise features: structured pipeline, parallel execution, orchestrator, catalogs, scheduler, webhooks, analytics, health checks, RBAC, API docs.

Objectives
1) In-memory state cache: Read-through JSON cache for state/*.json to avoid disk reads on every GET.
2) Response caching: TTL-based response cache for read-heavy, safe GET endpoints. Per-tenant, per-role scoped.
3) Lazy module loading: Load cold modules on first use to reduce startup cost and memory footprint.
4) Request batching/deduplication for home page data assembly: Coalesce concurrent identical requests and share the same promise/result.
5) Instrumentation: Metrics for hit/miss, eviction, memory, latency impact. Expose admin-inspectable stats (RBAC: admin only).
6) Configuration: Feature flags and TTL tuning via config + env.
7) Tests, docs, runbooks, ADR.

Deliverables
- New TS modules (under 04-Dashboard/app/lib/**) with typed contracts.
- Minimal surgical edits to server.js to wire middleware and endpoint-level caching.
- Module-by-module integration for read-heavy routes.
- Admin route(s) for cache stats and invalidation (RBAC protected).
- Unit + integration tests.
- Docs: ADR, runbook, operator guide updates.

Implementation Plan

A) Types and Config
1) lib/types.ts — add the following strongly-typed contracts:
   - CacheScope = 'Tenant' | 'Project' | 'Global'
   - CacheEntry<T> { key: string; value: T; createdAt: number; ttlMs: number; sizeBytes: number; scope: CacheScope; tenantId?: string; projectId?: string; tags?: string[] }
   - CacheStats { entries: number; bytes: number; hits: number; misses: number; evictions: number; staleGets: number; hitRate: number; lastReset: number }
   - ResponseCacheOptions { enabled: boolean; defaultTtlMs: number; maxEntries: number; maxBytes: number; varyHeaders?: string[] }
   - StateCacheOptions { enabled: boolean; defaultTtlMs: number; maxEntries: number; maxBytes: number; watchFilesystem: boolean }
   - ModuleLoadPolicy { preload: boolean; }
   - BatcherOptions { coalesceWindowMs: number; maxInFlightPerKey: number; maxQueueSize: number; }
   - TenantContext { tenantId: string; projectId?: string; roles: string[]; userId?: string; locale?: string }
   - CacheAdminSnapshot { response: CacheStats; state: CacheStats; keysSample: string[] }
   - ResponseCacheRecord { key: string; status: number; headers: Record<string, string>; body: Buffer; createdAt: number; ttlMs: number; scope: CacheScope; tenantId?: string }

2) config/perf.json (new) and env vars:
   - GPO_CACHE_ENABLED=true
   - GPO_CACHE_MAX_ENTRIES=5000
   - GPO_CACHE_MAX_BYTES=200000000 (200MB)
   - GPO_RESP_CACHE_ENABLED=true
   - GPO_RESP_CACHE_TTL_DEFAULT_MS=120000
   - GPO_STATE_CACHE_TTL_DEFAULT_MS=60000
   - GPO_CACHE_VARY_HEADERS="accept-language"
   - GPO_BATCH_COHORT_MS=20
   - GPO_CACHE_DEBUG=false
   Wire into existing config loader; ensure values are typed and have safe defaults.

B) Core Cache Modules
3) lib/cache/memory-cache.ts (new)
   - Generic in-memory TTL+LRU cache with size-based eviction.
   - API:
     - put<T>(entry: CacheEntry<T>): void
     - get<T>(key: string): T | undefined
     - getWithMeta<T>(key: string): { value: T; entry: CacheEntry<T> } | undefined
     - del(key: string): void
     - keys(prefix?: string): string[]
     - stats(): CacheStats
     - reset(): void
     - on(event: 'evict' | 'put' | 'hit' | 'miss' | 'stale', handler)
   - Eviction policy: LRU by last access; also evict oversized puts when exceeding maxBytes/maxEntries.
   - Clock: Date.now(). Ignore sub-millisecond.
   - Size: track approximate bytes (Buffer length for response bodies; JSON.stringify length for objects).
   - Respect scope scoping in keys but key construction done by cache-keys.

4) lib/cache/cache-keys.ts (new)
   - Helpers to construct canonical cache keys:
     - stateFileKey(tenantId: string, filePath: string): string
     - responseKey(ctx: TenantContext, method: string, urlPath: string, query: Record<string,string>, varyHeaders?: string[]): string
     - customKey(parts: (string|number)[], tags?: string[]): string
   - All keys must include a prefix namespace: "state:", "resp:" etc.

5) lib/state/state-cache.ts (new)
   - Read-through cache for JSON files under state/.
   - API:
     - readJson<T>(ctx: TenantContext, filePath: string, opts?: Partial<StateCacheOptions>): Promise<T>
     - prime<T>(ctx, filePath, value: T, ttlMs?: number): void
     - invalidate(ctx: TenantContext, filePath: string): void
     - invalidateByPrefix(prefix: string): void
     - stats(): CacheStats
   - Behavior:
     - On cache miss: read from disk, JSON.parse, store with TTL.
     - Invalidate immediately on mutation events (see mutation integration below).
     - Optionally watch filesystem (config.watchFilesystem) to invalidate on mtime change (debounced).
     - Only cache files under state/ and tenant/project-specific namespaces if applicable (maintain existing tenant isolation pathing).

6) lib/http/response-cache.ts (new)
   - Middleware-like helpers for GET response caching.
   - API:
     - shouldCache(req, res): boolean — only GET, 2xx, no Set-Cookie, not containing secrets, and not if req.headers['cache-control']='no-cache'
     - buildKey(ctx: TenantContext, req): string — include path, sorted query, vary headers (accept-language), roles (RBAC), and project/tenant.
     - tryGetCached(ctx, req): { hit: boolean; record?: ResponseCacheRecord }
     - store(ctx, req, record: ResponseCacheRecord): void
     - invalidateByTag(tag: string): void (optional future use)
     - stats(): CacheStats
   - TTL tiers (defaults, override per-route below):
     - volatile: 30s (e.g., tasks, live telemetry)
     - normal: 120s (e.g., catalogs, lists)
     - long: 600s (e.g., static docs lists)
   - Attach X-GPO-Cache: hit|miss and X-GPO-Cache-Expires headers on cached responses.

7) lib/loader/lazy-module-loader.ts (new)
   - Demand-load cold modules on first use; rely on Node require cache thereafter.
   - API:
     - getModule<T>(name: string, loader: () => T, policy?: ModuleLoadPolicy): T
   - Provide wrappers for known heavy modules to defer loading in server.js route handlers.

8) lib/batch/request-batcher.ts (new)
   - Deduplicate concurrent identical async tasks within a coalesce window.
   - API:
     - batch<T>(key: string, work: () => Promise<T>, opts?: Partial<BatcherOptions>): Promise<T>
   - Use a small coalesce window (default 20ms) and in-flight map keyed by normalized keys.

9) lib/metrics/cache-metrics.ts (new)
   - Expose counters and histograms: cache_hits, cache_misses, cache_evictions, cache_bytes, latency_before_ms, latency_after_ms.
   - Integrate with existing telemetry/analytics modules if present; else local no-op stubs with JSON dump to 03-Operations/ logs.

C) Integration: State I/O and Mutation Invalidation
10) lib/state/state-reader.ts and lib/state/state-writer.ts (existing or create if missing)
   - Ensure all JSON reads go through state-cache.readJson.
   - On every write/mutation (create/update/delete), emit invalidate events:
     - eventBus.emit('state:mutated', { tenantId, projectId, filePaths: string[], reason, actor })
   - Hook: Existing mutation guards should call an invalidate helper:
     - lib/state/invalidation.ts (new): onStateMutated(payload) → invalidates each filePath in state-cache and response-cache tags if mapped.

11) lib/events/bus.ts (new lightweight or reuse existing event hub)
   - Simple on/emit for 'state:mutated' and 'cache:reset' events.

D) Server Wiring: Response Cache and Batching
12) server.js edits (surgical):
   - Import response-cache and tenant context resolver (existing).
   - Wrap GET handlers for selected read-heavy endpoints with response cache:
     Initial coverage (verify actual routes with grep; implement where present):
     - GET /api/dashboard/home (or equivalent home assembly endpoint) — TTL: 15s volatile but with request batching.
     - GET /api/projects/list — TTL: 120s normal
     - GET /api/engines/catalog — TTL: 600s long
     - GET /api/releases/:id — TTL: 120s normal
     - GET /api/deliverables/:id — TTL: 120s normal
     - GET /api/audit/logs?range= — TTL: 30s volatile
     - GET /api/providers/catalog — TTL: 600s long
     - GET /api/docs/index — TTL: 600s long
   - Implementation pattern per route:
     - Build ctx: TenantContext from request (tenantId, roles, locale).
     - On request: tryGetCached(ctx, req). If hit, write headers/body and return early.
     - Else execute handler; capture status+headers+body; if shouldCache and content safe, store() with route-specific TTL. Send response.
     - Bypass cache if req.headers['cache-control'] includes 'no-cache'.
   - Add guard to never cache responses containing keys: ['X-Set-Secret', 'Authorization', 'Set-Cookie'] or bodies flagged by deep-redaction policy as containing secret markers.

13) Home page request batching:
   - Identify the home data assembly route (grep for 'home', 'dashboard', 'mission-control').
   - Wrap its core assembly function call in request-batcher.batch with a key derived from ctx.tenantId + sorted query + roles hash.
   - Set coalesce window 20ms; maxInFlightPerKey: 1; maxQueueSize: 100.
   - Within the assembly code, ensure all state JSON reads use state-cache.

E) Lazy Module Loading
14) Replace direct eager requires for heavy/rare modules with lazy loader:
   - Candidates: artifact registry, marketplace, compliance export, security scanners, acceptance suite runner.
   - In server.js and chief-of-staff calls on cold paths, switch to getModule('artifactRegistry', () => require('./lib/artifact-registry')) pattern.
   - Only apply to ≤ 10 cold-path modules to minimize diff; do not refactor hot paths in Part 85.

F) Admin APIs for Cache Ops
15) New admin-only endpoints (RBAC: role=admin; enforce with existing route guards):
   - GET /api/admin/cache/stats → CacheAdminSnapshot { response, state, keysSample }
   - POST /api/admin/cache/reset → clears both caches; returns stats after reset
   - POST /api/admin/cache/invalidate
     - body: { scope: 'response'|'state'|'both', keys?: string[], prefixes?: string[], tenantId?: string }
     - effect: targeted invalidation; returns { invalidated: number }
   Ensure these are documented in API docs and hidden from non-admin UI.

G) Endpoint-Specific TTL Policy
16) Create lib/http/route-cache-policy.ts (new)
   - Map of route matchers to TTL category:
     - '/api/dashboard/home' → 15000
     - '/api/projects/list' → 120000
     - '/api/engines/catalog' → 600000
     - '/api/releases/:id' → 120000
     - '/api/deliverables/:id' → 120000
     - '/api/audit/logs' → 30000
     - '/api/providers/catalog' → 600000
     - '/api/docs/index' → 600000
   - Helper: ttlFor(req): number

H) Security, Privacy, and Isolation
17) Cache scoping:
   - All keys must include tenantId. If route is project-scoped, also include projectId.
   - Include RBAC roles hash into response cache key to avoid privilege bleed.
   - Include Accept-Language if present to support localized responses.
   - Do not cache responses set with header 'X-GPO-Do-Not-Cache: 1' (reserve for modules).
   - Respect existing deep-redaction: only cache the redacted body that is actually sent over the wire.

18) Invalidation Triggers
   - On 'state:mutated' event, compute affected cache keys:
     - Invalidate state-cache for each filePath for that tenant.
     - Invalidate response-cache for dependent routes (map state file patterns to routes; add a config map lib/state/invalidation-map.ts that links e.g., 'state/projects.json' → ['/api/projects/list']).
   - Also invalidate by tag if you add tagging later; for now route-based list is sufficient.
   - On release promotion or deliverable approval events (if event bus emits), invalidate deliverables/releases/details endpoints.

I) Observability
19) Add lightweight perf timing to server.js for selected routes:
   - Measure pre-cache and post-cache latency, log improvements.
   - Emit metrics via cache-metrics.ts.
   - Add X-GPO-Latency-ms header for admin users when GPO_CACHE_DEBUG=true.

J) UI
20) No UI changes needed for operator screens. Optional: Admin panel can surface cache stats later (not in scope). Ensure operator flows unchanged.

K) Docs
21) 04-Dashboard/docs/adr/ADR-00XX-caching-layer.md (new)
   - Rationale, scope, TTL policy, scoping rules, invalidation strategy, risks, roll-back plan.
22) 04-Dashboard/docs/runbooks/cache-operations.md (new)
   - How to inspect stats, invalidate, reset, tune TTLs, and diagnose cache issues.
23) 04-Dashboard/docs/api/admin-cache.md (new)
   - Document admin endpoints, RBAC, examples.
24) Update existing architecture and middleware docs to note response cache integration points.

L) Tests
25) Unit tests:
   - memory-cache.ts: TTL expiry, LRU eviction, size-based eviction, hit/miss accounting.
   - cache-keys.ts: deterministic key ordering and scoping.
   - state-cache.ts: read-through and invalidation on event.
   - response-cache.ts: vary headers effect, bypass on no-cache, secret header exclusion.
   - request-batcher.ts: coalescing behavior and error propagation.
26) Integration tests:
   - GET /api/projects/list returns cached response (X-GPO-Cache: hit on second call).
   - After creating/updating a project, subsequent GET reflects changes (cache invalidated).
   - Home endpoint: two concurrent requests resolve from single batch promise; verify only one underlying assembly executed (use spy).
   - RBAC isolation: different roles yield separate cache entries; no cross-role leakage.
   - Tenant isolation: tenant A cache does not serve tenant B.
   - TTL expiry: after TTL, miss then hit again.
   - Admin endpoints: stats visible; reset clears; targeted invalidation works.
27) Performance acceptance:
   - Baseline vs post-optimization latency for cached endpoints: ≥40% median reduction on second hit.
   - Disk read reduction: for projects list under steady-state load, successive 100 GETs produce ≤5 disk reads.

M) Acceptance Criteria
- Response cache integrated for at least 8 named GET endpoints with correct TTLs and headers.
- State cache wraps all JSON reads used by the above endpoints.
- Home data assembly request batching coalesces concurrent requests (verified via logs or spies).
- Cache invalidation fires on all mutations affecting cached endpoints; no stale reads post-mutation.
- Admin cache APIs exist, RBAC protected, and documented.
- Telemetry shows meaningful cache hit rate and eviction stats; headers expose hit/miss.
- No regressions in privacy, tenant isolation, or governance; route and mutation guards remain intact.
- All new modules are fully typed and pass TypeScript checks; tests passing.

N) Hardening
- Memory guard: if total cache bytes exceed maxBytes hard limit, auto-disable response caching and log critical alert; state cache still bounded by LRU.
- Circuit breaker: env var GPO_CACHE_ENABLED=false disables all caches at runtime without code changes.
- Protect against cache stampede: batcher ensures only one recomputation per key at a time; add jitter (±10%) to TTLs to avoid synchronized expiry thundering herds.
- Ensure safe shutdown: server 'close' handler resets caches and stops fs watchers.
- Validate that compressed responses (if any) are cached in the same representation that is served; or cache uncompressed body and compress per-response consistently.

O) Step-by-step Task List
1) Add types and config (A1-A2).
2) Implement memory-cache.ts and cache-keys.ts (B3-B4).
3) Implement state-cache.ts and wire into state-reader; add events bus and invalidation plumbing (B5, C10-C11).
4) Implement response-cache.ts and route-cache-policy.ts (B6, G16).
5) Wire response cache into targeted GET routes in server.js (D12).
6) Implement request-batcher.ts and apply to home assembly route (D13, B8).
7) Implement lazy-module-loader.ts and convert ≤10 cold modules (E14).
8) Implement cache-metrics.ts and basic perf headers (I19).
9) Add admin cache endpoints and RBAC wiring (F15).
10) Write unit/integration tests (L25-L26).
11) Write ADR and runbooks (K21-K24).
12) Execute performance acceptance suite (L27, M).
13) Commit with message: "Part 85: Performance Optimization + Caching Layer — state + response cache, lazy loader, home batching, admin cache ops, metrics, docs, tests".

Constraints and Notes
- Keep diffs to server.js localized: a small helper wrapping pattern is preferred over sweeping refactor.
- Do not cache POST/PUT/DELETE or any non-idempotent endpoints.
- Only cache 2xx responses; exclude 206, 3xx, 4xx, 5xx.
- Respect 'no-cache' headers from clients.
- Ensure deep-redaction runs before response body is cached.
- Maintain compatibility with existing deep redaction, route/mutation guards, middleware ordering.

Deliverable Validation
- Provide before/after latency numbers in 03-Operations/reports/perf-cache-baseline.json and perf-cache-post.json.
- Provide a JSON dump of CacheAdminSnapshot from /api/admin/cache/stats after a traffic warmup run.
- Include screenshots or logs showing X-GPO-Cache headers on targeted endpoints.

Begin implementation now. Return a PR-ready set of commits touching only 04-Dashboard/app (plus docs under 04-Dashboard/docs and config/perf.json). Do not change other top-level repos.
```
