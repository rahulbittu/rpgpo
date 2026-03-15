```markdown
Part 83 — Role-Based Access Control + API Key Management

Context
- Repo: 04-Dashboard/app
- Server: raw Node.js HTTP (server.js)
- Types: lib/types.ts
- Route guards: lib/http-response-guard.ts, deep-redaction.ts
- State: JSON in state/
- Current: single-operator mode, 142+ TS modules, ~960 routes, ~670+ types
- Goal: Enterprise-ready multi-user foundation with RBAC, API key scoping, audit trail, and engine-level access control, without breaking current single-operator flows.

Constraints
- CommonJS + TypeScript, no new frameworks.
- Preserve all existing working functionality and acceptance cases.
- Additively layer RBAC; default principal remains current operator to avoid breakage.
- JSON-backed state with versioned schemas and migrations.
- All new code fully typed; contract-driven; redaction-safe; consistent with existing guard patterns.

Scope
1) RBAC domain model and types
2) API key management with scopes and expiration
3) Request authentication and principal resolution
4) Authorization: action-to-permission mapping, policy evaluation
5) Engine-level access enforcement
6) Audit trail (allow/deny) with tamper-evident chain and redaction
7) Admin APIs and minimal UI surface to manage users/roles/keys/policies
8) Docs, ADR, runbooks
9) Acceptance tests and hardening

Deliverables
Implement the following modules, server wiring, APIs, UI, docs, and tests.

New/Updated Types (lib/types.ts)
- Add the following types and enums. Use readonly where appropriate; prefer string literal unions over open strings.

  export type PrincipalKind = 'user' | 'api-key' | 'service' | 'system';

  export interface Principal {
    readonly kind: PrincipalKind;
    readonly id: string;               // userId | apiKeyId | serviceId | 'system'
    readonly displayName: string;
    readonly roleIds: readonly string[]; // resolved roles
    readonly scopes?: readonly string[]; // for api keys
    readonly engineAllow?: readonly string[]; // engine ids allowed by key
    readonly tenantId?: string;           // reserved for future
    readonly isInternal?: boolean;        // service/system principals
  }

  export type RoleId = string;
  export type PermissionAction =
    | 'system.admin'
    | 'user.manage'
    | 'role.manage'
    | 'apikey.manage'
    | 'audit.view'
    | 'engine.use'
    | 'engine.manage'
    | 'project.view'
    | 'project.edit'
    | 'deliverable.view'
    | 'deliverable.edit'
    | 'task.create'
    | 'task.view'
    | 'task.mutate'
    | 'workflow.run'
    | 'release.manage'
    | 'state.export'
    | 'state.import'
    | 'analytics.view'
    | 'template.manage'
    | 'conversation.view'
    | 'conversation.post'
    | 'scheduler.manage'
    | 'integration.manage';

  export type ResourceKind = 'route' | 'engine' | 'project' | 'deliverable' | 'workflow' | 'release' | 'conversation' | 'file' | 'system';

  export interface ResourceSelector {
    readonly kind: ResourceKind;
    readonly id?: string;                 // optional: specific resource id
    readonly pattern?: string;            // optional: glob/regex pattern depending on kind
    readonly projectId?: string;
  }

  export interface Permission {
    readonly action: PermissionAction;
    readonly resource?: ResourceSelector;
    readonly condition?: {
      readonly timeBefore?: string;           // ISO
      readonly timeAfter?: string;            // ISO
      readonly allowEngines?: readonly string[];
      readonly denyEngines?: readonly string[];
      readonly projects?: readonly string[];
    };
    readonly effect: 'allow' | 'deny';
    readonly note?: string;
  }

  export interface Role {
    readonly id: RoleId;
    readonly name: string;
    readonly description?: string;
    readonly permissions: readonly Permission[];
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly system?: boolean;
  }

  export interface User {
    readonly id: string;
    readonly email: string;
    readonly displayName: string;
    readonly roleIds: readonly RoleId[];
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly status: 'active' | 'disabled';
    readonly system?: boolean;
  }

  export interface ApiKey {
    readonly id: string;                  // uuid
    readonly name: string;
    readonly keyPrefix: string;           // first 10 chars
    readonly keyHash: string;             // base64 of hashed material
    readonly hashAlg: 'scrypt' | 'sha256';// start with sha256+hmac+salt
    readonly salt: string;                // base64
    readonly createdAt: string;
    readonly updatedAt: string;
    readonly expiresAt?: string;
    readonly status: 'active' | 'revoked';
    readonly ownerUserId?: string;
    readonly roleIds: readonly RoleId[];  // effective roles granted to API key
    readonly scopes: readonly string[];   // action patterns, e.g., ['task.*','deliverable.view']
    readonly engineAllow?: readonly string[]; // engine ids allowed explicitly
    readonly projectIds?: readonly string[];  // optional project scoping
    readonly lastUsedAt?: string;
  }

  export interface AccessRequest {
    readonly action: PermissionAction;
    readonly resource?: ResourceSelector;
    readonly route?: { readonly method: string; readonly path: string };
    readonly engineId?: string;
    readonly projectId?: string;
    readonly context?: Record<string, unknown>;
  }

  export interface AccessDecision {
    readonly allow: boolean;
    readonly reason: string;
    readonly matched?: Permission;
    readonly principal: Principal;
    readonly action: PermissionAction;
    readonly resource?: ResourceSelector;
    readonly correlationId: string;
    readonly at: string;
  }

  export interface AuditEvent {
    readonly id: string;
    readonly at: string;
    readonly actor: { readonly kind: PrincipalKind; readonly id: string; readonly roleIds: readonly string[]; readonly displayName: string };
    readonly action: PermissionAction | 'auth.login' | 'auth.logout' | 'apikey.create' | 'apikey.revoke' | 'role.assign' | 'role.remove' | 'engine.access.denied' | 'engine.access.allowed' | 'route.denied' | 'route.allowed';
    readonly resource?: ResourceSelector & { readonly route?: { readonly method: string; readonly path: string } };
    readonly decision?: { readonly allow: boolean; readonly reason: string };
    readonly requestId?: string;
    readonly engineId?: string;
    readonly projectId?: string;
    readonly ip?: string;
    readonly userAgent?: string;
    readonly prevHash?: string;
    readonly hash: string; // sha256(prevHash + canonical-json(event-without-hash))
    readonly redactions?: readonly string[]; // fields masked
  }

  export interface EngineAccessPolicy {
    readonly engineId: string;
    readonly allowedRoleIds?: readonly RoleId[];
    readonly allowedUserIds?: readonly string[];
    readonly deniedRoleIds?: readonly RoleId[];
    readonly deniedUserIds?: readonly string[];
    readonly createdAt: string;
    readonly updatedAt: string;
  }

State Files (state/)
- rbac.users.v1.json
- rbac.roles.v1.json
- rbac.apikeys.v1.json
- rbac.engine-access.v1.json
- audit.log.v1.jsonl (line-delimited JSON, rolling)
- rbac.meta.v1.json (schema version, counters)
- Add migration to seed default roles and users.

New Modules (lib/)
1) rbac-store.ts
   - JSON-backed CRUD for roles/users/engine-policies.
   - Functions:
     - loadRoles(): Promise<Role[]>
     - saveRoles(roles: Role[]): Promise<void>
     - loadUsers(): Promise<User[]>
     - saveUsers(users: User[]): Promise<void>
     - loadEnginePolicies(): Promise<EngineAccessPolicy[]>
     - saveEnginePolicies(policies: EngineAccessPolicy[]): Promise<void>
     - getSystemDefaultRoleIds(): RoleId[]
     - ensureSeedData(): Promise<void> // seeds admin/operator/viewer roles; admin user; service principals
   - Concurrency-safe writes (atomic temp file + rename).

2) api-key-store.ts
   - JSON-backed API key CRUD with hashing.
   - Functions:
     - createApiKey(input: { name: string; ownerUserId?: string; roleIds: RoleId[]; scopes: string[]; engineAllow?: string[]; projectIds?: string[]; expiresAt?: string }): Promise<{ apiKey: ApiKey; plaintext: string }>
     - revokeApiKey(id: string): Promise<ApiKey>
     - getApiKeyByPrefix(prefix: string): Promise<ApiKey | undefined>
     - verifyApiKey(plaintext: string): Promise<ApiKey | undefined> // constant-time compare
     - listApiKeys(): Promise<ApiKey[]>
     - touchApiKey(id: string, at: string): Promise<void>

3) principal.ts
   - Principal resolution and defaulting.
   - Functions:
     - resolvePrincipalFromRequest(req, headers): Promise<Principal> // Authorization: Bearer <token> or X-API-Key; fallback to single-operator admin principal
     - getSystemPrincipal(): Principal // {kind:'system', id:'system', ...}
     - getServicePrincipal(id: 'worker' | 'board' | 'engine-runner'): Principal
     - principalFromApiKey(apiKey: ApiKey): Principal

4) permission-evaluator.ts
   - Core authorization engine.
   - Functions:
     - mapRouteToAction(method: string, path: string): PermissionAction | undefined
     - isScopeSatisfied(scopes: readonly string[], action: PermissionAction): boolean // supports wildcards like 'task.*'
     - evaluate(principal: Principal, request: AccessRequest): Promise<AccessDecision>
     - requireAllow(decision: AccessDecision): void | never // throws typed error
   - Default-deny unless action is undefined and route is currently unclassified; for initial pass, do "report-only" on unclassified; enforce on classified critical routes.

5) engine-access.ts
   - Enforce engine-level access for invocations.
   - Functions:
     - checkEngineUse(principal: Principal, engineId: string, projectId?: string): Promise<AccessDecision>
     - requireEngineUse(principal: Principal, engineId: string, projectId?: string): Promise<void> // throws if denied

6) audit-log.ts
   - Append-only audit event writer with tamper-evident chaining and redaction.
   - Functions:
     - append(event: Omit<AuditEvent, 'id' | 'hash' | 'prevHash' | 'at'> & { at?: string }): Promise<AuditEvent>
     - getEvents(params: { limit?: number; afterId?: string; action?: string; actorId?: string; since?: string; until?: string }): Promise<AuditEvent[]>
     - redactSensitive(input: unknown): { safe: unknown; redactions: string[] }
     - computeHash(prevHash: string | undefined, payload: object): string // sha256
     - rotateIfNeeded(): Promise<void> // optional, leave stub
   - Ensure no API key plaintext is logged. Mask ip, userAgent if policy demands.

7) route-guard-rbac.ts
   - Integrate with server.js and http-response-guard.ts.
   - Functions:
     - guardRoute(method: string, path: string, req, res, actionOverride?: PermissionAction): Promise<AccessDecision> // calls evaluator, logs audit, returns decision; throws on deny for enforced routes
     - classifyCriticalRoutes(): { method: string; path: string; action: PermissionAction }[] // static list for initial enforcement coverage aligned with existing mutation/protected routes

Server Wiring (server.js)
- Import principal.ts, permission-evaluator.ts, route-guard-rbac.ts, audit-log.ts, engine-access.ts.
- On request start:
  - Resolve principal and attach to req.context.principal.
  - Generate correlationId and attach to req.context.correlationId.
- For critical/protected routes (existing 22/25 and 10/10 mutation guards):
  - Before handler logic, call guardRoute(method, path, req, res).
  - On allow/deny, write audit events: 'route.allowed'/'route.denied'.
- For engine invocations:
  - In engine dispatch path(s) (e.g., chief-of-staff orchestration and engine runner points), call requireEngineUse(principal, engineId, projectId).
  - Audit 'engine.access.allowed'/'engine.access.denied'.
- Do not break existing operator mode:
  - If no API key or user context is provided, principal resolves to seeded admin user 'operator-admin' with full rights; audit actor.kind='system' or 'user' depending on seeding choice.
  - Mark internal service calls with service principals (worker, board) where feasible: when board/worker is orchestrating internally, set req.context.principal = getServicePrincipal('worker') etc.

New Admin APIs
- All under /api/admin/*; all require 'system.admin' or specific manage permissions.

1) Users
  - GET /api/admin/users -> User[]
  - POST /api/admin/users -> create { email, displayName, roleIds } -> User
  - PUT /api/admin/users/:id -> update { displayName?, roleIds?, status? } -> User
  - DELETE /api/admin/users/:id -> soft-disable -> { ok: true }
  - POST /api/admin/users/:id/roles -> { roleId } -> User
  - DELETE /api/admin/users/:id/roles/:roleId -> User

2) Roles
  - GET /api/admin/roles -> Role[]
  - POST /api/admin/roles -> create { name, description?, permissions } -> Role
  - PUT /api/admin/roles/:id -> update { name?, description?, permissions? } -> Role
  - DELETE /api/admin/roles/:id -> { ok: true } (block if system role)
  - GET /api/admin/permissions/actions -> PermissionAction[] // discoverable list

3) API Keys
  - GET /api/admin/apikeys -> ApiKey[] (hash/prefix only; never return plaintext)
  - POST /api/admin/apikeys -> { name, ownerUserId?, roleIds, scopes, engineAllow?, projectIds?, expiresAt? } -> { apiKey: ApiKey, plaintext: string } // show plaintext once
  - POST /api/admin/apikeys/:id/revoke -> ApiKey
  - GET /api/admin/apikeys/:id -> ApiKey

4) Engine Access Policies
  - GET /api/admin/engine-policies -> EngineAccessPolicy[]
  - POST /api/admin/engine-policies -> { engineId, allowedRoleIds?, allowedUserIds?, deniedRoleIds?, deniedUserIds? } -> EngineAccessPolicy
  - PUT /api/admin/engine-policies/:engineId -> update -> EngineAccessPolicy
  - DELETE /api/admin/engine-policies/:engineId -> { ok: true }

5) RBAC Decisions
  - POST /api/admin/rbac/test -> { action, resource?, engineId?, projectId? } -> AccessDecision // test as current principal or impersonate via query ?as=user:<id>|apikey:<id>

6) Audit
  - GET /api/admin/audit -> supports query params: limit, afterId, action, actorId, since, until -> AuditEvent[]

Request Authentication
- Accept Authorization: Bearer <token> and X-API-Key: <token>.
- Token format: gpo_<randombase64> or any; store only hash. Keep adjustable.
- Reject revoked/expired keys; audit 'route.denied' with reason.
- For UI calls without tokens, fallback to 'operator-admin' seeded user; mark isInternal? false.

RBAC Seeding (rbac-store.ensureSeedData)
- Roles:
  - admin: full allow on all PermissionAction; system: true
  - operator: allow operational actions (task.*, deliverable.view|edit, workflow.run, project.view|edit, conversation.view|post, release.manage, analytics.view, template.manage); deny system.admin, user.manage, role.manage, apikey.manage, state.import
  - viewer: allow read-only actions (project.view, deliverable.view, task.view, analytics.view, conversation.view, audit.view denied)
- Users:
  - operator-admin user with admin role and email placeholder 'operator@local'
- Engine Policies:
  - Default: no explicit restrictions (open) but enforcement uses role permissions too.

Critical Route Classification (route-guard-rbac.classifyCriticalRoutes)
- Map at least:
  - All mutation routes (10/10) -> task.mutate | project.edit | deliverable.edit | release.manage | template.manage | scheduler.manage | integration.manage
  - Existing protected routes (22/25) -> assign actions appropriately
- For unclassified routes: log audit as "report-only" decision with reason "unclassified"; do not block.

Engine Enforcement Touchpoints
- In modules invoking engines (e.g., lib/engines/* and chief-of-staff or execution orchestrator):
  - Before engine call, call requireEngineUse(principal, engineId, projectId).
  - Map engine use to action 'engine.use' with resource {kind:'engine', id: engineId} inside evaluator.

Audit Logging
- Log both allow and deny decisions for:
  - Route guard checks
  - Engine access checks
  - API key creation/revocation
  - Role/user assignment changes
- Implement hash chaining with previous event hash persisted (in rbac.meta or last line of file).
- Redact:
  - Authorization headers, API key plaintext, secrets
  - Any payload fields named ['key','apiKey','token','secret','password'] -> mask to '***'
- Provide append() as the single write path; include correlationId/requestId if available.

UI Additions (index.html/app.js/operator.js/style)
- Add "Access Control" panel under an Admin-only tab in Mission Control:
  - Sections: Users, Roles, API Keys, Engine Policies, Audit (read-only paginated)
  - For this part, minimal UI:
    - List Users with roles; add/remove role (admin only)
    - List Roles; create/update permissions via simple textarea JSON editor
    - Create API Key form -> shows plaintext once in modal with copy button
    - Engine Policies table: per-engine allow/deny lists with role/user ids (JSON editor acceptable)
    - Audit stream: latest 200 events with filters (action, actorId)
- UI should gracefully hide admin controls when principal is not admin. In single-operator fallback, show admin.

Back-Compat and Migration
- On startup:
  - ensureSeedData() to create roles/users/policies if absent.
  - Create default 'operator-admin' if no users exist.
- Existing flows with no auth header continue to work using operator-admin principal.
- No breaking changes to existing APIs; RBAC only enforced for classified routes.

Security and Hardening
- Hash API keys using HMAC-SHA256 with per-key salt for now; isolate hashing to a module to allow scrypt later.
- Constant-time compare for key verification.
- Never log plaintext keys; show only once on creation.
- Default-deny for engine.use if engineAccessPolicy has explicit denies matching principal.
- Deny if key expired or revoked; include clear reason; do not leak sensitive policy details.
- Sanitize denial messages for client; retain full detail in audit event only.
- Ensure JSON state writes are atomic (write to .tmp then rename).
- Add rate-limit hooks as TODOs; not enforced in this part.

Tests and Acceptance
- Add 20 acceptance cases under 03-Operations or existing suite location:
  1) Seed roles/users created on fresh state
  2) Anonymous request resolves to operator-admin principal
  3) API key create -> plaintext visible once; subsequent get does not reveal
  4) API key validate works; lastUsedAt updated
  5) Expired key denied
  6) Revoked key denied
  7) Operator role cannot access /api/admin/roles (deny)
  8) Admin can create role; viewer cannot
  9) Route classified as task.mutate denies for viewer
  10) Deliverable.view allowed for viewer
  11) Engine access denied if policy denies role
  12) Engine access allowed for admin despite role deny if policy allows user directly
  13) Audit log records allow with hash chain continuity
  14) Audit redacts Authorization and token fields
  15) mapRouteToAction returns undefined for unclassified path; report-only log created
  16) /api/admin/rbac/test returns allow/deny with matched permission
  17) Assign role to user via admin API persists
  18) API key scopes restrict action (e.g., task.* allowed; deliverable.edit denied)
  19) Project-scoped key cannot access different project
  20) Engine allow list on key is enforced

Implementation Steps
1) Define new types in lib/types.ts; update barrel exports if any.
2) Implement rbac-store.ts with seeding and atomic JSON ops.
3) Implement api-key-store.ts with hashing utilities (use Node crypto).
4) Implement principal.ts to resolve principal from headers; attach to req context.
5) Implement permission-evaluator.ts, including:
   - scope matching with wildcard
   - role permission evaluation order: explicit deny > explicit allow > scope > default
   - route action mapping for critical routes
6) Implement engine-access.ts to enforce engine policies + evaluator with 'engine.use' action.
7) Implement audit-log.ts with chained hashing; integrate redactSensitive.
8) Implement route-guard-rbac.ts; wire into server.js before handlers for critical routes.
9) Add new admin API route handlers in server.js (raw Node routing); use existing patterns and http-response-guard.ts for response shaping and deep redaction.
10) UI: minimal admin panel; fetch lists; forms for create/update; hide when not admin.
11) Docs: add 04-Dashboard/docs/security/RBAC-ADR.md and 04-Dashboard/docs/runbooks/rbac-api-keys.md.
12) Add acceptance cases and update any test harness.
13) Smoke test: existing scenarios run unchanged; now produce audit events.

API Contract Details
- All admin endpoints require action checks:
  - users endpoints -> user.manage
  - roles endpoints -> role.manage
  - apikeys endpoints -> apikey.manage
  - engine-policies endpoints -> engine.manage
  - audit GET -> audit.view or system.admin
- Error shape: maintain current http-response-guard.ts contract; include correlationId and a sanitized reason.

Edge Cases
- When both role permissions and scopes are present, deny precedence: any matching deny overrides allow.
- If principal.kind is service/system, bypass scope checks but still subject to engine policy unless isInternal is true and policy.systemBypass=true (not in this part; default false).
- If roles missing or empty, treat as least-privileged (viewer-like).
- If resource.projectId present and key has projectIds constraint, require inclusion.

Non-Goals (for this part)
- UI multi-user login session system
- SSO/OIDC integration
- Rate limiting and quotas
- Per-field data redaction beyond existing deep-redaction

Acceptance-of-Done
- All new modules compiled; no regressions in existing acceptance suite.
- Critical routes (existing 22/25 protected and 10/10 mutations) are enforced by RBAC.
- Engine invocations check and audit engine access.
- Admin can manage users/roles/keys and see audit stream.
- API key plaintext never stored or logged.

Commit Guidance
- Granular commits:
  - types + stores
  - evaluator + engine access
  - audit logging
  - server wiring + route classification
  - admin APIs
  - UI
  - docs + tests
- Update CHANGELOG and ADR with rationale and tradeoffs.

Now implement Part 83 per above. Do not remove or alter existing working routes or behaviors other than adding RBAC enforcement to the classified set. Maintain single-operator productivity by seeding an admin principal and defaulting to it when no auth is provided.
```
