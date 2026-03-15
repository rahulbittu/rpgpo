```
Part 84 — Auto-Generated API Docs + Knowledge Hub

You are implementing Part 84 in RPGPO/GPO. Do not break existing functionality. Preserve all guards, redaction, and RBAC. Integrate with the raw Node.js HTTP server and typed contracts. Produce enterprise-grade, typed, contract-driven code with deterministic IDs and privacy-by-default.

Context baseline
- Repo: RPGPO
- App: 04-Dashboard/app/
- Server: raw Node HTTP in server.js (~970 routes)
- Types: lib/types.ts (~680+ types)
- Modules: 145+ TS modules
- State: JSON in state/
- Guards: http-response-guard.ts, deep-redaction.ts
- RBAC in place, tenant/project isolation enforced
- UI: index.html, app.js, operator.js, style.css, operator.css
- Docs scattered across repo (00-Governance, 03-Operations, 04-Dashboard/docs, etc.), 377+ files previously; expect more now
- Acceptance suite present; add new cases 84-01..84-20

Objective
- Build an auto-documentation system that:
  1) Scans server.js and generates structured API documentation for all routes (GET/POST/PUT/DELETE/OPTIONS), extracting route path, method, params, query, headers, body and response contracts (if known), guards, RBAC, side-effect safety, and example cURL.
  2) Exposes a read-only, privacy-safe interactive API Explorer UI in the dashboard with search, filtering, and “Try it” for safe GET routes only (default). Mutating routes are blocked by default and require explicit admin toggle per route.
  3) Creates a Knowledge Hub: indexes and renders all internal docs (ADRs, runbooks, contracts, readmes, acceptance specs). Provides full-text search with filters (kind, area, tags) and a doc viewer.
  4) Provides endpoints to export API docs JSON and perform guided re-indexing, with RBAC-guarded admin endpoints.
  5) All generated artifacts stored in state/docs/ with deterministic IDs and change history.

Non-goals
- Do not convert server to Express/Koa.
- Do not expose secrets or bodies of sensitive payloads in docs.
- Do not enable live mutation calls from the API Explorer by default.
- Do not introduce external SaaS search dependencies.

High-level deliverables
- New modules (TypeScript, CommonJS) for route introspection, API doc generation, registry, knowledge indexing/search, markdown rendering, and UI view models.
- New server routes under /api/docs/* and /api/knowledge/* with full guard/RBAC and redaction.
- New UI: “Docs” top-level tab with “API Explorer” and “Knowledge Hub” sub-tabs, including search and detail views.
- Deterministic, versioned JSON artifacts in state/docs/.
- Updated types/contracts in lib/types.ts.
- Docs and runbooks to operate and extend the system.
- Acceptance tests for core flows and privacy constraints.

Implementation plan

A) Data contracts (lib/types.ts)
- Add the following types, ensuring they are exported and namespaced appropriately:

export type ApiRouteId = string; // stable hash of METHOD + PATH
export type DocId = string; // stable hash of repo-relative path
export type DocKind = 'ADR' | 'Runbook' | 'Contract' | 'Architecture' | 'Readme' | 'DecisionLog' | 'Acceptance' | 'Policy' | 'Other';
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS';
export type ContentType = 'application/json' | 'text/plain' | 'text/markdown' | 'application/octet-stream' | 'application/x-www-form-urlencoded';

export interface ApiParameterDoc {
  name: string;
  in: 'path' | 'query' | 'header' | 'cookie';
  required: boolean;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'unknown';
  description?: string;
  example?: string | number | boolean;
}

export interface ApiSchemaField {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'object' | 'array' | 'null' | 'unknown';
  required: boolean;
  description?: string;
  redaction?: 'mask' | 'strip' | 'none';
  children?: ApiSchemaField[];
}

export interface ApiBodySchema {
  contentType: ContentType;
  fields: ApiSchemaField[];
  notes?: string;
}

export interface ApiResponseSchema {
  status: number;
  contentType: ContentType;
  fields?: ApiSchemaField[];
  notes?: string;
  redactionApplied?: boolean;
}

export interface ApiSecurityDoc {
  rbacRoles: string[]; // allowed roles
  guards: string[]; // guard module/function names
  tenantScoped: boolean;
  projectScoped: boolean;
  mutation: boolean; // true if route mutates state or external systems
}

export interface ApiExample {
  curl: string;
  requestExample?: unknown;
  responseExample?: unknown;
  redacted: boolean;
  notes?: string;
}

export interface ApiRouteDoc {
  id: ApiRouteId;
  method: HttpMethod;
  path: string; // exact pathname pattern
  description?: string;
  parameters: ApiParameterDoc[];
  requestBody?: ApiBodySchema;
  responses: ApiResponseSchema[];
  security: ApiSecurityDoc;
  tags: string[];
  lastDiscoveredAt: string; // ISO
  version: number; // increment on breaking change
  examples?: ApiExample[];
  source: { file: string; line: number };
  deprecation?: { isDeprecated: boolean; note?: string };
}

export interface ApiDocsIndex {
  generatedAt: string;
  totalRoutes: number;
  routes: Record<ApiRouteId, ApiRouteDoc>;
  version: number;
  openapi?: { href: string; version: string };
  checksum: string; // sha256 of canonical JSON
}

export interface KnowledgeDocMeta {
  id: DocId;
  kind: DocKind;
  title: string;
  path: string; // repo-relative
  tags: string[];
  summary: string;
  wordCount: number;
  lastModified: string; // ISO
}

export interface KnowledgeDocIndex {
  generatedAt: string;
  totalDocs: number;
  docs: Record<DocId, KnowledgeDocMeta>;
  indexVersion: number;
  checksum: string;
}

export interface KnowledgeSearchQuery {
  q: string;
  kinds?: DocKind[];
  tags?: string[];
  limit?: number;
  offset?: number;
}

export interface KnowledgeSearchResult {
  id: DocId;
  title: string;
  kind: DocKind;
  path: string;
  snippet: string;
  score: number;
  tags: string[];
}

export interface KnowledgeSearchResponse {
  query: KnowledgeSearchQuery;
  total: number;
  results: KnowledgeSearchResult[];
  tookMs: number;
}

export interface DocsConfig {
  api: {
    excludePaths: string[]; // route path prefixes to exclude
    unsafeMethodsBlockedByDefault: boolean; // default true
    manualOverridesPath: string; // path to overrides file
  };
  knowledge: {
    includeGlobs: string[]; // e.g., ["**/*.md"]
    excludeGlobs: string[]; // e.g., ["08-Archive/**", "05-Comms/**/private/**"]
    maxDocSizeKb: number; // safety bound
  };
  search: {
    minTokenLength: number;
    stopwords: string[];
  };
  security: {
    redactExamples: boolean; // default true
  };
  version: number;
}

B) New state and config
- Create state/docs/.gitkeep
- Create state/docs/config.json with sane defaults:
{
  "api": {
    "excludePaths": ["/health", "/metrics", "/favicon.ico"],
    "unsafeMethodsBlockedByDefault": true,
    "manualOverridesPath": "04-Dashboard/app/state/docs/api-docs-overrides.json"
  },
  "knowledge": {
    "includeGlobs": ["**/*.md"],
    "excludeGlobs": ["08-Archive/**", "05-Comms/**/private/**", "node_modules/**", "state/**", "dist/**"],
    "maxDocSizeKb": 1024
  },
  "search": {
    "minTokenLength": 2,
    "stopwords": ["the","a","and","to","of","in","for","on","at","by","with","is","it","this"]
  },
  "security": {
    "redactExamples": true
  },
  "version": 1
}
- Create state/docs/api-docs.json (generated)
- Create state/docs/knowledge-index.json (generated)
- Create state/docs/api-docs-overrides.json (empty defaults):
{
  "overrides": {
    // "GET /api/x": { "description": "...", "tags": ["..."], "security": { "mutation": false, "rbacRoles": ["operator"], "guards": ["..."] }, "requestBody": {...}, "responses": [...] }
  },
  "deprecations": {
    // "DELETE /api/legacy": { "note": "Use /api/new" }
  }
}

C) New modules (04-Dashboard/app/lib/)
1) lib/route-introspector.ts
- Purpose: Parse server.js, discover routes, extract method, path, source location, and heuristics for params/query. Apply overrides.
- Exports:
  - discoverRoutes(opts?: { serverFile?: string; config: DocsConfig }): Promise<ApiRouteDoc[]>
  - computeRouteId(method: HttpMethod, path: string): ApiRouteId
- Implementation notes:
  - Use fs.readFileSync to read server.js
  - Regex patterns to match blocks like: if (req.method === 'GET' && url.pathname === '/path')
  - Also handle param patterns like url.pathname.startsWith('/api/item/') and manual mapping via overrides when ambiguity
  - For each match, determine line number, create base ApiRouteDoc with minimal info
  - Attempt to infer mutation = method !== 'GET'
  - security.guards: attempt static string search for imported/wired guard names within block (e.g., http-response-guard)
  - rbacRoles: default ["operator"] unless overridden (allow override file to set)
  - parameters: infer ':id' style if path includes brackets or documented conventions; else []
  - tags: derive from first path segment (e.g., /api/projects -> ["projects"])
  - De-duplicate by method+path, prefer most specific match
  - Apply deprecations from overrides

2) lib/api-docs-generator.ts
- Purpose: Merge discovered routes with schemas/examples/redaction to produce ApiDocsIndex, write to state.
- Exports:
  - generateApiDocs(config: DocsConfig): Promise<ApiDocsIndex>
  - loadApiDocs(): Promise<ApiDocsIndex | null>
  - getApiRouteDocById(id: ApiRouteId): Promise<ApiRouteDoc | null>
- Implementation notes:
  - Load overrides; merge fields (description, requestBody, responses, security, examples, tags)
  - Integrate deep-redaction.ts: mark fields with redaction hints if known; ensure examples flagged redacted
  - Compute checksum sha256 of canonical JSON (stable sort of keys)
  - Persist to state/docs/api-docs.json atomically (write temp + rename)

3) lib/openapi-exporter.ts
- Purpose: Export ApiDocsIndex as OpenAPI 3.0 minimal doc for external tooling.
- Exports:
  - toOpenApi(doc: ApiDocsIndex): { openapi: string; info: { title: string; version: string }; paths: Record<string, any>; components: Record<string, any> }
- Notes: Best-effort mapping; schemas can be free-form when unknown

4) lib/knowledge-indexer.ts
- Purpose: Scan repo for markdown docs per config, extract title, summary, tags, kind; build index.
- Exports:
  - indexKnowledge(config: DocsConfig): Promise<KnowledgeDocIndex>
  - loadKnowledgeIndex(): Promise<KnowledgeDocIndex | null>
  - getDocMeta(id: DocId): Promise<KnowledgeDocMeta | null>
- Implementation notes:
  - Use glob (implement small glob matcher without adding deps) starting from repo root (two dirs up from app/)
  - Exclude per config
  - Title: first H1 or file name
  - Summary: first paragraph (truncate 300 chars)
  - Tags: derive from frontmatter (if present) or path segments
  - Kind: map from directory names: "00-Governance" -> 'Policy' | 'ADR', "03-Operations" -> 'Runbook'/'DecisionLog', "04-Dashboard/docs" -> 'Architecture'/'Contract', "02-Projects/**/README.md" -> 'Readme', "03-Operations/acceptance/**" -> 'Acceptance'
  - wordCount: naive token count
  - Deterministic id: sha1 of repo-relative path
  - Compute checksum and persist to state/docs/knowledge-index.json atomically

5) lib/knowledge-search.ts
- Purpose: Build and query an offline inverted index
- Exports:
  - buildSearchArtifacts(index: KnowledgeDocIndex, config: DocsConfig): Promise<void> // persist to state/docs/knowledge-search.json
  - search(query: KnowledgeSearchQuery): Promise<KnowledgeSearchResponse>
  - loadSearch(): Promise<any> // load artifacts
- Implementation notes:
  - Preprocess docs: normalize, remove stopwords, min token length
  - Compute TF-IDF scores; support kind/tags filters
  - Generate snippet with highlighted terms (basic)

6) lib/markdown-renderer.ts
- Purpose: Safe server-side markdown to HTML rendering for doc viewer
- Exports:
  - renderMarkdownToHtml(md: string): string
- Implementation notes:
  - Implement minimal markdown parsing: headings, bold/italic, code blocks, lists, links
  - Sanitize: strip script/style, no inline event handlers, rel="noopener noreferrer" on links

7) lib/docs-controller.ts
- Purpose: Orchestrate docs pipeline
- Exports:
  - reindexAll(config?: DocsConfig): Promise<{ apiDocs: ApiDocsIndex; knowledge: KnowledgeDocIndex }>
  - getConfig(): Promise<DocsConfig>
  - saveConfig(cfg: Partial<DocsConfig>): Promise<DocsConfig>
- Notes: Role-checking at server layer; controller is pure

D) Server endpoints (server.js)
Add guarded routes under /api/docs and /api/knowledge. Use existing middleware and http-response-guard. Enforce RBAC:
- GET /api/docs/index
  - Returns ApiDocsIndex
  - Cache-control: max-age=30
- POST /api/docs/reindex
  - Admin only
  - Triggers route introspection and doc generation; returns summary
- GET /api/docs/route/:id
  - Returns ApiRouteDoc
- GET /api/docs/openapi.json
  - Returns OpenAPI export
- GET /api/knowledge/index
  - Returns KnowledgeDocIndex (meta only)
- GET /api/knowledge/doc/:id
  - Streams rendered HTML for the doc (server-side render with markdown-renderer)
  - Apply path resolution securely; no traversal
- GET /api/knowledge/search?q=...&kinds=...&tags=...&limit=...&offset=...
  - Returns KnowledgeSearchResponse
- POST /api/knowledge/reindex
  - Admin only
  - Rebuild index and search artifacts
- POST /api/docs/config
  - Admin only
  - Update docs config (partial), persist, and optionally reindex if query ?reindex=1

Wire all responses through http-response-guard and deep-redaction where applicable. For endpoints returning docs, enforce per-tenant visibility rules as currently adopted (if any). Ensure no sensitive file contents are returned unless explicitly requested by auditor/admin via doc viewer.

E) UI — Dashboard additions
Files: 04-Dashboard/app/index.html, app.js, operator.js, style.css, operator.css
- Add a top-level tab “Docs” with two sub-tabs:
  1) API Explorer:
     - Left: search bar + filters (method checkboxes, tag chips)
     - Center: list of routes with method, path, tags, mutation badge, and RBAC badge
     - Right: detail panel showing:
       - Description
       - Parameters (table)
       - Request body schema (tree)
       - Responses (status tabs + schema tree)
       - Security (guards, roles)
       - Examples: cURL (copy button), request/response samples (redacted)
       - “Try It (GET only)” button:
         - Only enabled for GET routes not excluded by config and marked mutation=false
         - When clicked: executes in-browser fetch to the route with user’s current session; show response viewer with redaction applied and timing; block if route is tenant/project restricted and context missing
         - For unsafe routes, display tooltip: “Live calls disabled by policy”
  2) Knowledge Hub:
     - Top: search bar (full text)
     - Left: filters (kind multi-select, tags)
     - Center: result list with title, kind, snippet, score
     - Right: doc viewer: rendered HTML fetched from /api/knowledge/doc/:id
- Add robust empty/loading/error states, p95 latencies surfaced
- Respect RBAC: Hide reindex/admin actions for non-admin
- Admin controls (visible to admin only):
  - “Reindex API Docs” button -> POST /api/docs/reindex
  - “Reindex Knowledge” button -> POST /api/knowledge/reindex
  - “Docs Config” panel: view/edit config JSON with client-side validation; POST /api/docs/config
- Add deep-linking: #/docs/api?routeId=... and #/docs/knowledge?docId=...

F) Privacy, security, governance
- Redaction:
  - Ensure ApiExample.responseExample and any rendered samples pass through deep-redaction
  - Never include tokens, secrets, or PII in examples
- RBAC:
  - /reindex and /config endpoints require admin
  - Viewing doc content allowed for operator+, but restrict folders if future policy demands (leave hook)
- Mutation safety:
  - Block “Try It” for mutation=true routes by default; enable per-route override via overrides file (admin must opt-in)
  - Even when enabled, prompt confirmation and show clear warning
- Tenant/project isolation:
  - Do not leak cross-tenant paths or docs; the Knowledge Hub is internal and single-tenant in RPGPO, but keep structure ready for multi-tenant filters
- Size limits:
  - Enforce maxDocSizeKb on knowledge doc ingestion
  - Cap search results to 100 per query, default 20

G) Observability
- Log reindex operations with duration, counts, and checksums to 03-Operations/logs if applicable
- Expose lightweight health: augment existing /health detail with docs: { apiDocs: { routes, generatedAt }, knowledge: { docs, generatedAt } }
- Track UI timings for search and route detail render; send to existing telemetry if present

H) Performance budgets
- API docs generation: cold < 2000ms, warm < 500ms (cached read)
- Knowledge reindex: cold < 4000ms for ~1k docs, warm < 800ms (no changes)
- Search query p95 < 75ms for 3-term query, result set 20
- UI initial load of Docs tab < 300ms after API responses

I) Testing and acceptance
Add acceptance cases 84-01..84-20:

84-01: Route discovery finds representative GET, POST, PUT, DELETE routes with correct method/path and stable ids
84-02: Overrides file updates description and security; reflected in index
84-03: Redaction applied to example fields marked sensitive; no secrets present
84-04: ApiDocsIndex checksum changes only when docs change; stable across runs
84-05: OpenAPI export returns valid JSON with matching paths/methods counts
84-06: Knowledge index includes ADRs, runbooks, contracts; correct kinds inferred
84-07: Knowledge index respects excludeGlobs (e.g., private comms)
84-08: Search returns expected top results for query “release candidate lockfile”
84-09: Search filters by kind and tags
84-10: Doc viewer renders markdown to safe HTML (no scripts)
84-11: RBAC: non-admin cannot POST /api/docs/reindex
84-12: RBAC: non-admin cannot POST /api/knowledge/reindex or POST /api/docs/config
84-13: UI: API Explorer lists >= 90% of routes with correct method badges
84-14: UI: “Try It” disabled for mutation routes by default
84-15: UI: “Try It” for a safe GET route executes and displays response
84-16: State files written atomically; no partial writes on crash
84-17: Large knowledge doc truncated per maxDocSizeKb
84-18: Health shows docs status
84-19: Performance budgets met in CI profile
84-20: Multi-run stability: two reindex runs with no source changes produce identical checksums

J) Documentation
Add/Update:
- 04-Dashboard/docs/part-84-auto-docs.md: architecture, data contracts, flow diagrams, privacy model
- 04-Dashboard/docs/knowledge-hub-runbook.md: how to reindex, configure includes/excludes, troubleshoot
- 04-Dashboard/docs/api-docs-overrides.md: how to annotate routes, enable safe “Try It” for specific routes
- 03-Operations/acceptance/84-auto-docs/README.md: acceptance checklist and how to run
- 00-Governance/policies/docs-governance.md: redaction, RBAC, mutation safety policies for docs

K) Integration details
- server.js: Carefully add new route handlers without altering existing matches. Place under a distinct section “// Auto-Docs and Knowledge Hub” and ensure they pass through existing middleware and http-response-guard.
- lib/deep-redaction.ts: If needed, add helper to annotate schema fields with redaction hints.
- Build: No new external deps. Implement minimal glob and markdown safely in-house modules.
- Deterministic IDs: Use sha1/sha256 implemented via Node crypto to compute ids/checksums.

L) Rollout plan
- Default “unsafeMethodsBlockedByDefault”: true
- Initial overrides empty
- First run on server start: if no state/docs/api-docs.json or knowledge-index.json, generate; else lazy-load
- Expose reindex buttons to admin only; show toast with results and counts

M) Commit
- Single PR with logically grouped commits; example messages:
  - part(84): add route introspector and api docs generator with typed contracts
  - part(84): server endpoints for docs and knowledge hub with rbac and guards
  - part(84): knowledge indexer, search, and markdown renderer
  - part(84): dashboard UI — API Explorer and Knowledge Hub
  - part(84): docs, runbooks, and acceptance tests
- Update CHANGELOG with Part 84 summary

N) Code quality/hardening checklist
- Strict TypeScript types; no any unless absolutely necessary with justification
- Input validation on POST /api/docs/config; enforce schema
- Path traversal prevention for doc file serving
- Atomic writes to state files (write to .tmp then rename)
- Guard all new endpoints with http-response-guard and ensure redaction applied
- Unit tests for route-introspector regex on edge patterns
- Fallbacks: If parsing uncertain, mark fields as unknown and provide manual override hook
- Timeouts and error handling with helpful operator-facing messages

Execute
- Implement modules and server/UI changes as specified.
- Ensure all acceptance cases 84-01..84-20 pass.
- Preserve existing functionality and route behaviors.
- Provide concise inline comments referencing docs where helpful.
```
