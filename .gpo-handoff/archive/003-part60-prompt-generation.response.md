```
Implement Part 60 for GPO/RPGPO: Deliverable Store + Evidence Linking + Approval Gates + Merge Pipeline

Make deliverables first-class, versioned, evidence-linked artifacts governed by approval gates and contract-aware merge semantics. Preserve all existing functionality and rendering; add a deterministic deliverable ID scheme, a versioned store with provenance, merge-time contract enforcement, and a UI for history, diffs, approvals, and field-level traceability.

Requirements:
1) Deterministic Deliverable Identity:
   - Define a DeliverableKey composed of: projectId, taskId, deliverableVariant (one of the 9), contractId/version, and optional scopeKey if the task can produce multiple distinct deliverables of the same variant.
   - Compute deliverableId deterministically as dlv_{projectId}_{taskId}_{variant}_{shortHash}, where shortHash is a stable base32/hex of canonicalized DeliverableKey (include contractId/version; exclude volatile data).
   - Provide a pure function computeDeliverableId(DeliverableKey) used across server, CoS, and structured-deliverables pipeline. No randomness or timestamps in ID generation.

2) Deliverable Store (Versioned, Append-Only):
   - Create a versioned store in state/deliverables-store/:
     - state/deliverables-store/index.json: index of { deliverableId: { key, latestVersion, approvedVersion, status, createdAt, updatedAt } }.
     - state/deliverables-store/{deliverableId}/v0001.json, v0002.json, ...: each file is a full version payload (see requirement 3).
     - state/deliverables-store/{deliverableId}/meta.json: immutable key, contract metadata, and compact history vector (version, status, actor, timestamps, contentHash).
   - Provide atomic write with temp + rename and fsync; never overwrite prior versions. On write, update meta and index synchronously.
   - Maintain O(1) reads for latest and latest approved via index.json; keep index.json size bounded (store minimal metadata).

3) Version Record Shape and Provenance:
   - Each version record must include:
     - version (int, monotonic), status (Draft|Proposed|Approved|Rejected|Superseded|Archived), createdAt, createdBy, contentHash.
     - contract: { id, version }, variant: one of the 9, renderModel pointer (from deliverable-rendering).
     - content: the typed deliverable payload per variant (must pass contract-enforcement plan-time + completion-time + merge-time).
     - provenance: field-level map: { [fieldPath: string]: EvidenceChain[] }, where EvidenceChain entries include: subtaskId, engine, tool, artifactId(s) from Artifact Registry, sourceUri (if any), span/selector (optional), stepType (Assemble|Validate|Merge|HumanEdit), decisionId (if from approval/review), and a fieldHash for that contribution.
     - mergeSummary: structured description of strategies applied per field (see requirement 7), conflicts detected, and resolutions chosen.
     - traceabilityRefs: links into the traceability ledger ids created/updated for this version.
   - Ensure provenance paths are compatible with nested field paths (e.g., sections[2].bullets[1].text).

4) Migration from Flat Store:
   - Migrate existing state/deliverables/:taskId.json (flat scaffold) into the new store:
     - For each existing record, compute DeliverableKey and deliverableId.
     - Create v0001 as status=Approved if the previous deliverable had been surfaced as final; otherwise status=Draft.
     - Seed provenance with a single EvidenceChain per field marked as stepType=Migrate with fieldHash of the field’s current value; link artifactId(s) if discoverable; otherwise leave artifact refs empty but add a migrationNote.
     - Update index.json and meta.json. Maintain a migration log at state/deliverables-store/migration-YYYYMMDD.json.
   - Provide an idempotent migration function that can be safely re-run (detect existing deliverableId and skip or verify).

5) Merge Pipeline (Contract-Aware):
   - Implement a merge pipeline invoked to assemble a new version from subtask outputs:
     - Input: DeliverableKey, candidate fragments from subtasks (already typed/validated by their engines), and prior approved/proposed version if any.
     - Output: A content object matching the variant contract, a provenance map, and a mergeSummary.
   - Per-field strategies (minimum set; extensible via registry):
     - scalarText: pick-best (scored by validation confidence, recency, and engine trust), else append with separators; record losers in mergeSummary.discarded with reasons.
     - richText/markdown: structural merge using sentence/paragraph boundaries; preserve citations to artifacts.
     - list: union-dedupe by key selector (configurable per field), maintain stable order using weight (priority from engines) and recency.
     - map/dict: keyed merge with conflict detection; conflicting keys require explicit resolution strategy (preferApproved, preferLatest, or custom comparator).
     - code blocks: prefer syntactically valid candidates; run linter/validator if available; include failing candidates in discarded.
     - references: union artifact references; validate against Artifact Registry; drop unknowns with warning in mergeSummary.
   - All strategies must attach EvidenceChain entries per field contribution, capturing subtaskId, engine, artifactIds, and fieldHash.

6) Merge-Time Contract Enforcement:
   - Extend contract-enforcement to validate the merged content:
     - Ensure all required fields present; types correct; enumerations respected; field cardinalities enforced.
     - Enforce variant-specific constraints (e.g., Newsroom: headline non-empty; CodeChange: diff present and applies; Schedule: times valid, tz normalized).
     - On violation, surface a structured error and do not create a new version; provide a remediation hint in response.

7) Merge Strategy Registry:
   - Provide a registry mapping variant.fieldPath → strategy key + configuration.
   - Predefine mappings for all 9 variants covering their top-level and nested fields.
   - Allow override hooks in Chief of Staff to supply custom strategies per task.

8) Evidence Linking and Traceability:
   - For every version creation:
     - Upsert Artifact Registry links for all artifactIds referenced in provenance; add backward links from artifacts to deliverableId/version.
     - Append entries to the traceability ledger: one entry per fieldPath with { deliverableId, version, fieldPath, evidenceHash, artifactId(s), subtaskId, engine, createdAt }.
     - Ensure evidenceHash is derived from canonicalized field value + EvidenceChain inputs.
   - Provide an evidence query API (see APIs) to fetch all contributing artifacts and subtasks per field and version.

9) Approval Lifecycle Integration:
   - States: Draft → Proposed → Approved|Rejected; Approved may be Superseded by a later Approved; Rejected remains visible, not mergeable into default render.
   - Transitions:
     - propose: Draft → Proposed (idempotent if contentHash unchanged).
     - approve: Proposed → Approved (record approver, note, decision id).
     - reject: Proposed → Rejected (record reason, reviewer).
   - Integrate with the existing Approval Workspace (Part 33):
     - On propose: create an approval request entry referencing deliverableId/version.
     - On approve/reject: close the request with decision, link decisionId into provenance for any human-edited fields.
   - Enforce policy: rendering and any downstream release/workflow consumers should use latest Approved by default; Proposed can be previewed explicitly.

10) Concurrency, Idempotency, and Locking:
   - Writes must be guarded with per-deliverable file locks to avoid race conditions (atomic lock file in the deliverable folder).
   - Support an Idempotency-Key header for propose/merge routes; if a request with same key and payload contentHash was processed, return the original response.
   - Version numbers are strictly monotonic per deliverable; reject creation if latest write is newer than the caller’s If-Match/version precondition (optimistic concurrency).

11) Route Protection and Mutation Guards:
   - All new mutation routes must be wired through existing middleware and http-response-guard.
   - Expand protected path coverage to include all deliverable store routes (aim for +3 guarded routes to reach 25/25).
   - Apply deep redaction to any artifact URIs, PII, or secrets within provenance when sent to clients.

12) Rendering Selection:
   - deliverable-rendering must prefer the latest Approved version; if none exists, allow explicit query param to render Proposed/Draft.
   - Expose render metadata (version, status, createdAt) alongside rendered output.

13) UI: Deliverables Panel and Workflow:
   - Add a Deliverables panel in the operator dashboard for a selected task:
     - Shows deliverableId, variant, latest status, approvedVersion, latestVersion.
     - Timeline/history list of versions with status badges, actor, timestamps, and contentHash short.
     - Actions: Propose (from Draft), Approve/Reject (on Proposed, permission-gated), Preview Render, View Diff, View Provenance.
   - Version Diff Viewer:
     - Field-aware diff for selected vA..vB; show changes, additions, removals per fieldPath; highlight conflicts resolved in mergeSummary.
   - Provenance Inspector:
     - For a given version, show field-level provenance with linked artifacts (open artifact details), subtask origins, and evidence hashes.
     - Tooltips/callouts on fields in the rendered view indicate evidence sources and approval state.
   - Approval Workspace Linking:
     - From Deliverables panel, deep-link to the approval request; from approvals list, deep-link back to the deliverable version.

14) Chief of Staff Integration:
   - Update structured-deliverables orchestration to:
     - Resolve DeliverableKey → deliverableId at plan time.
     - After subtask completion, call the merge pipeline to produce a candidate Draft; if auto-propose policy is enabled, move to Proposed.
     - Record evidence links for each subtask’s contribution.
   - Ensure no impact on existing task execution except enriched persistence and lifecycle.

15) Backfill/Indexing Tools:
   - Provide a maintenance endpoint and CLI-like op:
     - /deliverables/reindex: rebuild index.json and meta.json from folder contents; verify checksums; return summary.
     - /deliverables/migrate-flat: run the migration (require admin capability).
   - Add lightweight integrity checker: verify version sequence, contentHash match, and traceability linkage counts.

16) Policy Controls:
   - Configurable per-tenant/per-project policy:
     - autoProposeOnMerge: boolean (default false).
     - requireTwoPersonApproval: boolean (default false) — if true, enforce 2 distinct approvers before status=Approved.
     - allowedApproverRoles: list (map to existing role/perm model).
     - renderDefaultStatus: Approved|Proposed (default Approved).
   - Enforce policies at transition time and in rendering selection.

17) Events and Observability:
   - Emit events: DeliverableVersionCreated, DeliverableProposed, DeliverableApproved, DeliverableRejected, DeliverableSuperseded, EvidenceLinked, MergeFailed, ContractViolation.
   - Log merge metrics per variant: fields merged, conflicts, discarded, time taken.
   - Add counters to observability: total deliverables, total versions, approval rates, average time to approval.

18) Performance and Limits:
   - Cap versions per deliverable by policy (default 200); auto-archive oldest Rejected/Proposed beyond cap with pointers preserved in meta.
   - Keep meta.json under 256KB by storing a compact history vector and trimming verbose details to the per-version files.
   - Ensure GETs for latest and approved are O(1) by using the index and not scanning the folder.

19) Security and Privacy:
   - Enforce authorization on propose/approve/reject (e.g., only Operators/Board with appropriate permission can approve).
   - Redact provenance details deemed sensitive (source URIs, spans) according to deep redaction rules before sending to client, preserving hashes.
   - Confirm cross-project isolation: no deliverable from another project is accessible via ID lookup unless tenant/project matches.

20) Error Handling and UX Feedback:
   - Provide structured error responses for: merge contract violations, missing artifacts, invalid transitions, concurrency conflicts (409), and unauthorized actions (403).
   - In UI, surface clear remediation steps (e.g., which field failed validation and how to fix).

21) Compatibility:
   - Do not break existing output surfacing: if no Deliverable Store record exists, legacy rendering paths still work.
   - If both legacy and new exist, prefer the new store; log a deprecation notice for legacy usage.

22) Testing and Acceptance:
   - Add acceptance scenarios expanding the 150 suite with at least 12 new cases:
     - Deterministic ID repeatability.
     - Migration creates v0001 and marks approved/draft correctly.
     - Merge creates Draft with correct provenance and mergeSummary.
     - Propose idempotency with same contentHash.
     - Approve transition gated by policy and role.
     - Reject transition records reason and prevents default rendering.
     - Diff shows correct field-level changes for at least 3 variants.
     - Provenance API returns correct artifacts and subtask links.
     - Rendering selects latest Approved by default and Proposed when requested.
     - Concurrency: concurrent propose results in one new version; the other gets 409 + retry hint.
     - Reindex reconstructs index and validates hashes.
     - Deep redaction applied to provenance in responses.

23) Documentation:
   - Architecture doc: Deliverable Identity, Store Layout, and Lifecycle.
   - Contract doc: Merge-Time Enforcement Rules per Variant (mapping table).
   - Governance doc: Approval Policies, Roles, and Transitions.
   - Runbook: Migration and Reindex Procedures; Recovery from Partial Writes.
   - API reference: endpoints, request/response shapes, errors, and permission matrix.
   - UI Operator Guide: Using Deliverables panel, diffs, and provenance.

24) Acceptance Gates and Safeguards:
   - Wire new routes through existing middleware, route guards, mutation guards, and deep redaction.
   - Add inline assertions to ensure that merge-time content passes contract-enforcement before writing a version file.
   - Verify no PII or secrets are persisted in provenance beyond artifacts’ governed metadata.

APIs:
- GET /deliverables/:deliverableId
  - Returns minimal meta, latestVersion summary, approvedVersion summary, currentStatus.
  - Guarded read; redaction applied.

- GET /deliverables/:deliverableId/versions
  - Returns list of versions with status, actor, timestamps, contentHash short, and brief mergeSummary stats.

- GET /deliverables/:deliverableId/versions/:version
  - Returns full version (content, provenance, mergeSummary); redact sensitive provenance fields.

- POST /deliverables/:deliverableId/merge
  - Body: fragments from subtasks, options (autoPropose override), Idempotency-Key header supported.
  - Effect: run merge pipeline → create Draft version (or no-op if identical by contentHash).
  - Returns: version number, status, contentHash, contract validation results.
  - Guarded mutation; mutation guard + concurrency checks.

- POST /deliverables/:deliverableId/propose
  - Body: { note? } and If-Match or explicit version to propose.
  - Effect: Draft → Proposed (idempotent if contentHash unchanged).
  - Side effects: create Approval Workspace entry.
  - Returns: updated status, approvalRequestId.

- POST /deliverables/:deliverableId/approve
  - Body: { version, note }, permission required; supports two-person approval policy.
  - Effect: Proposed → Approved; mark prior Approved as Superseded; update index approvedVersion.
  - Returns: new approvedVersion pointer, decisionId.

- POST /deliverables/:deliverableId/reject
  - Body: { version, reason }, permission required.
  - Effect: Proposed → Rejected; do not change approvedVersion pointer.

- GET /deliverables/:deliverableId/diff/:vA..:vB
  - Returns field-aware diff, counts of additions/removals/changes, and conflicts resolved.

- GET /deliverables/:deliverableId/provenance/:version
  - Returns provenance for that version, with artifact links and subtask references.

- POST /deliverables/reindex
  - Admin-only; rebuilds index/meta and verifies hashes; returns summary.

- POST /deliverables/migrate-flat
  - Admin-only; migrates legacy flat records; idempotent.

- GET /deliverables/search?projectId=&variant=&status=
  - Optional: return deliverables filtered by meta; return minimal metadata.

All routes must pass through http-response-guard and existing middleware; add explicit route protection for propose/approve/reject/migrate/reindex (admin/role-gated).

UI:
- Operator Dashboard:
  - Add Deliverables panel in the task view:
    - Header: deliverableId, variant, contract id/version, status badges for latest and approved.
    - History list: versions with status, actor, createdAt, contentHash short; click to view/compare.
    - Actions:
      - Propose (enabled on Draft; disabled if policy autoPropose is true).
      - Approve/Reject (visible on Proposed; gated by role/policy; two-person flow if enabled).
      - Preview Render (toggle Approved vs Proposed vs specific version).
      - View Diff (select two versions).
      - View Provenance (for selected version).
  - Diff Viewer:
    - Field-level tree view; change badges per field; show resolved conflicts from mergeSummary.
  - Provenance Inspector:
    - FieldPath → list of EvidenceChain entries; clickable artifact links; subtask IDs; evidence hashes; redacted fields masked.
  - Approval Workspace:
    - Show deliverable-linked requests with deep-link back to Deliverables panel.

Docs:
- 04-Dashboard/docs/architecture/deliverables-store.md: Identity, storage layout, version record shape, locks, atomicity.
- 04-Dashboard/docs/contracts/merge-enforcement.md: per-variant field strategy table, validation rules, failure modes.
- 04-Dashboard/docs/governance/deliverable-approvals.md: lifecycle, policies (two-person rule), permissions, transitions, events.
- 04-Dashboard/docs/runbooks/deliverables-migration-reindex.md: step-by-step, idempotency, verification, rollback.
- 04-Dashboard/docs/api/deliverables.md: endpoint specs, request/response examples, errors, guards, redaction behavior.
- 04-Dashboard/docs/ui/operator-deliverables.md: panel usage, diffs, provenance, approval actions.

Verification:
- Unit tests:
  - computeDeliverableId determinism for identical keys; uniqueness for differing keys.
  - Merge strategy behaviors per field type; provenance linking on contributions.
  - Contract-enforcement at merge-time rejects invalid content and returns remediation hints.
  - Versioning monotonicity; idempotent propose with same contentHash.
  - Approval transitions, including two-person policy.
  - Concurrency: lock behavior and If-Match handling (409).
  - Redaction on provenance responses.

- Integration tests (HTTP):
  - Migrate legacy record → v0001 created; index/meta updated; Approved default rendering correct.
  - Create Draft via merge; Propose; Approve; Supersede prior approved.
  - Reject a Proposed; ensure rendering defaults to prior Approved.
  - Diff between v1 and v2 shows correct field-level changes for Newsroom, CodeChange, and Schedule.
  - Provenance endpoint returns artifact and subtask links; redaction masks sensitive spans.
  - Reindex rebuilds index/meta and validates hashes.

- UI e2e flows:
  - Operator views Deliverables panel, history, diff, provenance.
  - Propose/Approve with correct permissions; two-person flow if enabled.
  - Default render uses Approved; toggling shows Proposed.

- Performance checks:
  - Latest/approved GETs are O(1) and do not scan version files.
  - Index/meta stay within size thresholds.

Return:
- Updated server routes and middleware wiring for all APIs above, with route protection and mutation guards applied.
- New/updated TS modules implementing:
  - Deterministic ID computation, versioned store read/write with atomicity and locking.
  - Merge pipeline with strategy registry and merge-time contract enforcement.
  - Evidence linking to Artifact Registry and Traceability Ledger.
  - Approval lifecycle transitions integrated with Approval Workspace.
  - Chief of Staff hooks to orchestrate merge/propose during task execution.
- State store files and migration tooling (idempotent).
- UI updates (index.html, app.js, operator.js, CSS) for Deliverables panel, diff, provenance, and approval actions.
- Docs as specified.
- Tests (unit, integration, e2e) and updated acceptance scenarios (at least 12 new).
- Verification notes demonstrating all acceptance criteria pass and no regressions in existing functionality.
```
