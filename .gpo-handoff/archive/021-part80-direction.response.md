```
You are RPGPO’s builder. Implement Part 80: Integration Gateway + Webhooks — Build an inbound/outbound webhook system with event routing, external trigger support, and result delivery to external channels.

Guardrails
- Do not break existing working functionality. Keep APIs/back-compat stable.
- Raw Node.js HTTP (no Express), CommonJS modules with TypeScript.
- All new code must be typed, contract-driven, and respect route guards, deep redaction, tenant/project isolation, autonomy budgets, and audit/evidence pipelines.
- Wire through http-response-guard.ts and deep-redaction.ts consistently.
- Persist state in state/ with migration-safe, deterministic IDs and versioned records.
- Integrate with existing hooks (onTaskStart/onSubtaskComplete/onTaskComplete) and deliverable lifecycle.
- Keep external deps minimal. Any new dep must be optional, wrapped, and failure-isolated.
- Preserve privacy-first principles: least data, redaction-by-default on logs/artifacts.

High-level
- Add an Integration Gateway providing:
  1) Inbound webhooks: Receive, verify, normalize, dedupe, route external events (Slack, GitHub, generic webhook; optional pollers for non-webhook sources are pluggable but not required now).
  2) Outbound deliveries: Deliver results (task completion, deliverable approved, report generated) to Slack, Email (SMTP), and generic webhooks with retries, DLQ, idempotency, and evidence logging.
  3) Plugin-style connector framework: typed registry, connector contracts, subscription-based routing rules, and destination delivery drivers.
  4) Operator UI for configuration, subscriptions, event/attempt visibility, replays, and test sends.
  5) Security: signature verification, request freshness, rate limiting, IP allowlists (configurable), redaction, secret governance.

Scope for Part 80
- Minimum inbound connectors: Slack (Slash Command + Events API verify and URL challenge), GitHub (webhooks: PR, issue_comment), Generic inbound webhook.
- Minimum outbound connectors: Slack (chat.postMessage via webhook or Bot token), Email (SMTP via wrapper), Generic outbound webhook.
- Event routing: subscriptions to map connector+eventType+filters → internal actions (create task from template, start workflow, post operator note).
- Outbound triggers: onTaskComplete, onDeliverableApproved (if available), manual “Send to…” from Deliverables panel.
- Observability: Integration-specific audit trail, evidence link to artifacts, structured metrics.
- Tests: 30+ targeted tests (unit + route + integration), including signature verification, idempotency, retry/DLQ, routing correctness.

Repository Changes

1) Types (04-Dashboard/app/lib/types.ts)
- Add strictly typed contracts. Use branded IDs and versioned records.

  export type IntegrationConnectorKind = 'slack' | 'github' | 'webhook' | 'email';

  export interface IntegrationConnectorId extends String { __brand: 'IntegrationConnectorId' }
  export interface IntegrationSubscriptionId extends String { __brand: 'IntegrationSubscriptionId' }
  export interface IntegrationEventId extends String { __brand: 'IntegrationEventId' }
  export interface IntegrationDeliveryId extends String { __brand: 'IntegrationDeliveryId' }

  export interface IntegrationConnectorBase {
    id: IntegrationConnectorId;
    kind: IntegrationConnectorKind;
    name: string;
    projectId?: ProjectId; // optional scoping
    tenantId: TenantId;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    enabled: boolean;
    // Secrets are referenced, not stored inline
    secretRefIds?: string[]; // resolve via secret governance
    configVersion: number;
  }

  export interface SlackConnectorConfig {
    signingSecretRefId: string;
    botTokenRefId?: string;   // for chat.postMessage
    defaultChannel?: string;
    mode: 'webhook' | 'bot';
    ipAllowlist?: string[];   // CIDRs
  }
  export interface GitHubConnectorConfig {
    appWebhookSecretRefId: string;
    repoAllowlist?: string[]; // owner/repo patterns
    ipAllowlist?: string[];
  }
  export interface WebhookConnectorConfig {
    // Inbound: none specific; Outbound: delivery target
    url?: string;
    method?: 'POST' | 'PUT';
    hmacSigning?: { algorithm: 'sha256' | 'sha1'; secretRefId: string; header: string };
    staticHeaders?: Record<string, string>;
    ipAllowlist?: string[];
  }
  export interface EmailConnectorConfig {
    mode: 'smtp';
    smtpHost: string;
    smtpPort: number;
    secure: boolean;
    userRefId?: string;
    passRefId?: string;
    from: string;
    ipAllowlist?: string[];
  }

  export type IntegrationConnector =
    | (IntegrationConnectorBase & { kind: 'slack'; config: SlackConnectorConfig })
    | (IntegrationConnectorBase & { kind: 'github'; config: GitHubConnectorConfig })
    | (IntegrationConnectorBase & { kind: 'webhook'; config: WebhookConnectorConfig })
    | (IntegrationConnectorBase & { kind: 'email'; config: EmailConnectorConfig });

  export type InboundProviderEventType =
    | 'slack:slash_command'
    | 'slack:url_verification'
    | 'slack:event_callback'
    | 'github:pull_request'
    | 'github:issue_comment'
    | 'webhook:generic';

  export interface InboundEventEnvelope {
    id: IntegrationEventId;
    connectorId: IntegrationConnectorId;
    kind: IntegrationConnectorKind;
    providerEventType: InboundProviderEventType;
    receivedAt: ISODateString;
    requestMeta: {
      ip: string;
      userAgent?: string;
      headers: Record<string, string | string[] | undefined>;
      signature?: string;
      timestampHeader?: string;
    };
    raw: unknown; // redacted at rest per policy
    normalized: NormalizedEvent | null; // after verification+normalization
    verified: boolean;
    dedupKey?: string;
    projectId?: ProjectId;
    tenantId: TenantId;
    status: 'received' | 'verified' | 'rejected' | 'routed' | 'failed';
    // Evidence links
    evidenceIds?: EvidenceId[];
    error?: string;
    version: number;
  }

  export interface NormalizedEvent {
    source: IntegrationConnectorKind;
    type: string; // logical type e.g., 'pull_request.opened', 'message.created'
    subject: string; // human readable subject
    summary?: string;
    actor?: { id?: string; username?: string; display?: string };
    context: {
      repo?: string;
      branch?: string;
      prNumber?: number;
      channel?: string;
      threadTs?: string;
      url?: string;
      externalId?: string; // X-GitHub-Delivery, Slack event_id, etc.
    };
    payload: Record<string, unknown>; // filtered/minimal
  }

  export type IntegrationActionKind = 'createTask' | 'startWorkflow' | 'postOperatorNote';

  export interface IntegrationSubscription {
    id: IntegrationSubscriptionId;
    name: string;
    tenantId: TenantId;
    projectId?: ProjectId;
    connectorId: IntegrationConnectorId;
    match: {
      providerEventType: InboundProviderEventType | '*';
      type?: string; // normalized.type wildcard or exact
      filters?: Array<{ path: string; op: 'eq'|'ne'|'in'|'nin'|'regex'; value: unknown }>;
    };
    action: (
      | { kind: 'createTask'; templateId: TemplateId; inputs?: Record<string, unknown> }
      | { kind: 'startWorkflow'; workflowId: WorkflowId; inputs?: Record<string, unknown> }
      | { kind: 'postOperatorNote'; channel?: 'cos' | 'board' | 'operations'; title?: string; body?: string }
    );
    enabled: boolean;
    createdAt: ISODateString;
    updatedAt: ISODateString;
    version: number;
  }

  export type OutboundDestinationKind = 'slack' | 'email' | 'webhook';

  export interface DeliveryRequest {
    id: IntegrationDeliveryId;
    createdAt: ISODateString;
    tenantId: TenantId;
    projectId?: ProjectId;
    trigger: 'manual' | 'onTaskComplete' | 'onDeliverableApproved';
    deliverableId?: DeliverableId;
    taskId?: TaskId;
    destinations: Array<
      | { kind: 'slack'; connectorId: IntegrationConnectorId; channel?: string; threadTs?: string }
      | { kind: 'email'; connectorId: IntegrationConnectorId; to: string[]; cc?: string[]; subject?: string }
      | { kind: 'webhook'; connectorId: IntegrationConnectorId; path?: string; headers?: Record<string,string> }
    >;
    payload: Record<string, unknown>; // contract-shaped summary
    attempts: DeliveryAttempt[];
    status: 'pending' | 'inflight' | 'succeeded' | 'failed' | 'deadlettered';
    nextAttemptAt?: ISODateString;
    evidenceIds?: EvidenceId[];
    error?: string;
    version: number;
  }

  export interface DeliveryAttempt {
    n: number;
    startedAt: ISODateString;
    finishedAt?: ISODateString;
    status: 'queued' | 'sending' | 'ok' | 'error';
    http?: { url: string; code?: number; durationMs?: number };
    error?: string;
  }

2) New Modules (04-Dashboard/app/lib/)
- lib/integration-gateway.ts
  - Responsibilities: façade for registration, inbound receipt, verification, normalization, routing, and outbound delivery orchestration.
  - Exports:
    - registerConnector(connector: IntegrationConnector): Promise<IntegrationConnector>
    - listConnectors(filter?): Promise<IntegrationConnector[]>
    - updateConnector(id, patch): Promise<IntegrationConnector>
    - deleteConnector(id): Promise<void>
    - receiveInbound(connectorKind, connectorId, reqMeta, rawBody, headers): Promise<InboundEventEnvelope>
    - verifyAndNormalize(eventId): Promise<InboundEventEnvelope>
    - routeEvent(eventId): Promise<{ subscriptionIds: IntegrationSubscriptionId[] }>
    - createSubscription(sub: IntegrationSubscription): Promise<IntegrationSubscription>
    - listSubscriptions(filter?): Promise<IntegrationSubscription[]>
    - updateSubscription(id, patch): Promise<IntegrationSubscription>
    - deleteSubscription(id): Promise<void>
    - enqueueDelivery(req: DeliveryRequest): Promise<DeliveryRequest>
    - processPendingDeliveries(now: ISODateString): Promise<{ processed: number }>
    - retryDelivery(id): Promise<DeliveryRequest>
    - replayEvent(id): Promise<InboundEventEnvelope>
    - testDelivery(test: Omit<DeliveryRequest,'id'|'createdAt'|'attempts'|'status'>): Promise<DeliveryRequest>

- lib/integrations/registry.ts
  - Keep runtime registry of connector handlers and schemas. Provide get/set/list; ensure persisted to state/integrations/connectors.json.
  - Deterministic ID creation (hash of kind+name+tenantId+projectId with salt).

- lib/integrations/inbound.ts
  - Verification and normalization per provider.
  - Exports verifySlack, normalizeSlack; verifyGitHub, normalizeGitHub; verifyGeneric, normalizeGeneric.
  - Implement signature checks:
    - Slack: v0 signature using signing secret, timestamp freshness (±5 min).
    - GitHub: X-Hub-Signature-256; ensure delivery id dedupe using X-GitHub-Delivery.
  - IP allowlist enforcement if configured.
  - produce dedupKey and set verified flag.

- lib/integrations/router.ts
  - Match normalized events to subscriptions based on providerEventType/type/filters (dot-path access).
  - Actions:
    - createTask: use Chief of Staff to create a task from a template; map normalized.payload into inputs (merge with subscription.inputs); capture evidence.
    - startWorkflow: invoke workflow runner with inputs.
    - postOperatorNote: append to COS/Board/Operations streams.
  - Emit audit artifacts and evidence chain links.

- lib/integrations/outbound.ts
  - Delivery dispatcher with per-destination drivers:
    - Slack: either webhook URL or Bot token chat.postMessage; support channel and threadTs; redact token in logs.
    - Email: SMTP via optional nodemailer dependency (wrap in try/catch; if not installed, provide clear instruction and fallback to file-outbox state/integrations/outbox/email-YYYYMMDD.ndjson for offline dev). Support text and minimal HTML.
    - Webhook: generic HTTP(S) with optional HMAC signing header; support method, headers, per-destination path override.
  - Exponential backoff (e.g., 1m, 5m, 15m, 1h, 6h), max 5 attempts before DLQ.
  - Persist deliveries in state/integrations/deliveries.json and DLQ in state/integrations/dlq.json.

- lib/integrations/signing.ts
  - HMAC utilities: compute/verify Slack/GitHub HMAC; constant-time compare.

- lib/integrations/idempotency.ts
  - Dedup store: state/integrations/idempotency.json with TTL per provider (24-72h). Upsert with dedupKey and reject duplicates.

- lib/integrations/rate-limit.ts
  - Lightweight token-bucket per connectorId and IP; persist counters to state/integrations/ratelimits.json.

- lib/integrations/secrets.ts
  - Resolve secretRefIds via existing governance secret manager patterns. Never log secret values.

- lib/integrations/audit.ts
  - Helper to record artifacts/evidence for inbound events and outbound attempts, referencing artifact registry and audit hub.

- lib/integrations/mapping.ts
  - Helpers to map NormalizedEvent to template inputs or workflow inputs with safe picking and defaulting from subscription.action.inputs.

3) State Files (04-Dashboard/app/state/)
- Create directory: state/integrations/
  - connectors.json { version, items: IntegrationConnector[] }
  - subscriptions.json { version, items: IntegrationSubscription[] }
  - inbound-events.jsonl (append-only log for received/verified/routed events; store redacted/raw pointers)
  - deliveries.json { version, items: DeliveryRequest[] }
  - dlq.json { version, items: DeliveryRequest[] }
  - idempotency.json { version, keys: Record<string, { firstSeenAt: ISODateString; expiresAt: ISODateString }> }
  - ratelimits.json { version, buckets: ... }
  - outbox/ (for offline email fallback)

4) Server Routes (04-Dashboard/app/server.js)
- Register new guarded routes. Use existing http-response-guard and middleware truth. All handlers must:
  - Authenticate/operator where appropriate for management routes.
  - Enforce tenant/project isolation per connector.projectId/tenantId.
  - Redact request bodies/headers before logging/audit according to deep-redaction.ts.

- Inbound webhook endpoints (no auth; rely on signature + rate limit + IP allowlist + CSRF not applicable)
  - POST /api/integrations/inbound/slack
  - POST /api/integrations/inbound/github
  - POST /api/integrations/inbound/webhook
  - Each must:
    - Locate enabled connector(s) of that kind by header hints or query param connectorId. If multiple, use connectorId param required.
    - Apply rate limit + IP allowlist
    - Read raw body for signature calc (do not JSON.parse before verify)
    - Call integration-gateway.receiveInbound → verifyAndNormalize → routeEvent
    - Slack URL verification: echo challenge body accordingly.
    - Respond 200 quickly (ack), optionally with minimal JSON { ok: true } to avoid provider retries.

- Management routes (authz required)
  - GET /api/integrations/connectors
  - POST /api/integrations/connectors
  - PUT /api/integrations/connectors/:id
  - DELETE /api/integrations/connectors/:id
  - GET /api/integrations/subscriptions
  - POST /api/integrations/subscriptions
  - PUT /api/integrations/subscriptions/:id
  - DELETE /api/integrations/subscriptions/:id
  - GET /api/integrations/events
  - GET /api/integrations/events/:id
  - POST /api/integrations/events/:id/replay
  - GET /api/integrations/deliveries
  - GET /api/integrations/deliveries/:id
  - POST /api/integrations/deliveries/:id/retry
  - POST /api/integrations/test-delivery

- Outbound trigger wiring
  - Hook into existing runtime pipeline:
    - onTaskComplete: if subscriptions/destinations configured for project/tenant defaults, enqueueDelivery with deliverable/task summary payload.
    - onDeliverableApproved (if available): same.
  - Also add internal route:
    - POST /api/integrations/deliver (authz) → enqueueDelivery (used by UI “Send to…”)

5) Chief of Staff integration (04-Dashboard/app/lib/chief-of-staff.ts)
- Expose helper createTaskFromIntegration(normalizedEvent, subscription) calling existing task creation APIs and evidence linking.
- Ensure created tasks reference integrationEventId and subscriptionId in metadata for traceability.

6) UI (04-Dashboard/app/)
- operator.js/operator.css and index.html
  - Add “Integrations” tab under Settings or Operations:
    - Connectors list: name, kind, status, project scope, last used.
    - Create/Edit connector modal forms with fields per kind. Secret fields use secretRefIds (no plain secret values).
    - Subscriptions list: name, source connector, match rules, action summary, enabled toggle.
    - Inbound Events panel: recent events (time, kind, type, status), details modal with redacted payload and routing outcome.
    - Deliveries panel: pending/inflight/succeeded/failed/DLQ with attempt history, retry button.
    - Test delivery: choose destination, compose payload via template (deliverable summary), send test.
  - In Deliverables panel: “Send to…” button → small modal to choose destination(s) and overrides (Slack channel, email to).

- Accessibility, state persistence, and UI reuse patterns consistent with existing dashboard.

7) Docs (04-Dashboard/docs/)
- ADR: 80-adr-integration-gateway.md — goals, decisions (webhooks + plugin connectors), alternatives, security model.
- Runbooks:
  - integrations-slack.md — create Slack app, signing secret, slash commands, Events API, bot token, channel naming, connector setup.
  - integrations-github.md — webhook secret, selecting events, repository scopes, signature verification, routing examples.
  - integrations-email.md — SMTP config, optional nodemailer install, offline outbox mode, templates.
  - integrations-webhook.md — generic inbound/outbound, HMAC signing, retries.
- API docs: integrations-api.md — all new routes, request/response contracts, examples.
- Security note: integrations-security.md — signature, IP allowlist, rate limits, redaction, secret handling.

8) Tests (04-Dashboard/app/)
- Add 30+ tests across:
  - Signature verification: Slack and GitHub happy/bad-signature/stale-timestamp.
  - Inbound routing: subscription match on providerEventType/type/filters.
  - Idempotency: duplicate delivery IDs ignored.
  - Rate limiting buckets function and reset.
  - Outbound delivery: Slack (webhook and bot token; simulate HTTP), Email (mock SMTP or outbox fallback), Webhook (HMAC header).
  - Retry and DLQ behavior with exponential backoff.
  - Route guards redaction of sensitive fields in logs/responses.
  - UI: basic smoke for connectors/subscriptions create/edit, “Send to…” flow.

9) Security & Hardening
- Signature verification mandatory for Slack/GitHub; reject unsigned/invalid.
- Timestamp freshness check; configurable skew window.
- IP allowlist optional/enforced if set.
- Dedup by provider delivery id + body hash + timestamp bucket.
- Rate limits per connector and IP; 429 backoff with Retry-After.
- Timeouts on outbound HTTP; circuit-breaker per destination on repeated failures.
- Redact secrets and PII fields from inbound/outbound payloads at rest and in logs (use deep-redaction.ts with new provider-aware rules).
- Evidence chain: each inbound event and outbound attempt emits artifact and links to tasks/deliverables.
- Tenancy: enforce that connector.projectId/tenantId gates both inbound routing and outbound delivery.

10) Migration & Seeds
- Initialize state/integrations/* files with version: 1 and empty items.
- Optional seed:
  - Slack outbound connector (name: “ops-slack”, mode: webhook, defaultChannel from env var ref).
  - Webhook outbound connector for generic receiver (url from env var ref).
  - Example subscription: GitHub PR opened → createTask using “Code Review” template in TopRanker.

11) Implementation Notes
- Keep raw body available for signature verification: adjust server.js parsing pathway for these three inbound routes to capture Buffer before JSON parse.
- Handle Slack URL verification by short-circuiting on type=url_verification.
- For email: implement email-sender.ts wrapper that tries nodemailer if available (requireOptional('nodemailer')), else writes to state/integrations/outbox/email-*.ndjson with clear notice; tests exercise both paths.
- Ensure http-response-guard.ts is used for every new route. Expand guards to cover new response shapes and add redaction schema for Integration* types.

12) Acceptance Criteria
- Slack inbound:
  - Configure connector with signing secret. Send a valid slash command payload (simulated). System verifies signature, normalizes event, matches subscription, creates a task from template, returns 200 quickly.
  - Outbound: on task completion, a Slack message is sent to the configured channel containing task summary and deliverable link; failures retry and can be manually retried from UI.
- GitHub inbound:
  - On pull_request opened with valid signature, system verifies, normalizes (prNumber, repo, branch), routes to create a "Code Review" task under relevant project; idempotency prevents duplicate task on webhook retry.
- Generic webhook inbound:
  - Accepts arbitrary JSON, normalizes as webhook:generic, subscription filter on a JSON path matches and starts a workflow.
- Email outbound:
  - On deliverable approved, an email is delivered (SMTP or outbox fallback) to specified recipients with subject/body from a default template; visible in Deliveries panel with attempt logs.
- UI:
  - Operator can add/edit connectors and subscriptions, view inbound events and deliveries, retry failed deliveries, and manually “Send to…” from a deliverable.
- Security:
  - Invalid signatures and IPs are rejected with 401/403; sensitive fields never appear in logs or UI; rate limits enforced; audit artifacts recorded.

Deliverables
- Code for all modules, server routes, and UI updates.
- Updated types.ts with new contracts.
- State files and migrations with versioning.
- Docs and runbooks.
- Tests passing. No regressions to existing suites.
- Changelog in 03-Operations and Part 80 entry in 02-Projects/ if applicable.

Commit Structure
- Part 80A: Types + state scaffolding + registry
- Part 80B: Inbound endpoints + verification + router
- Part 80C: Outbound drivers + queue + retries + hooks
- Part 80D: UI panels + Send-to action
- Part 80E: Docs + runbooks + tests + hardening pass

Now implement Part 80 end-to-end as specified. Ensure all new routes are guard-protected, deeply redacted, and fully typed. Integrate with existing pipeline hooks and evidence chain.
```
