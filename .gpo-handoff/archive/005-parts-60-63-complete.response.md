# ChatGPT Response

## Decision
Focus Part 64 on Release Candidate Assembly, Immutable Lockfiles, and Promotion Flow. This stitches the new deliverable store (Parts 60-63) into a governed, reproducible release mechanism with deterministic selection, manifest/lockfile generation, diffing against the current release, and a gated promotion path to mark a release as current per channel.

Why this next: 
- You now have deterministic deliverable IDs, versioned store, merge strategies, evidence, and approvals. 
- The next “thin and critical” layer is to assemble approved deliverables into an immutable, reproducible release unit, expose it via guarded APIs, provide a UI to build/diff/promote, and persist a per-channel current pointer.

Scope is tight (one part), fits existing architecture, and unlocks end-to-end use of deliverables in releases.

## Recommended Direction
Implement a release assembly pipeline that:
- Selects only approved deliverable versions in scope (project/channel/filters).
- Resolves collisions deterministically and optionally materializes merged outputs using the existing merge registry.
- Produces an immutable lockfile (content-hash pinned) and a human-readable manifest with provenance/evidence refs (no raw content).
- Stores candidates append-only; exposes list/get/diff/promote APIs with route guards and deep-redaction.
- Adds a lightweight promotion approval gate using existing approval workspace infra.
- Adds minimal UI elements to create/diff/promote candidates in the Releases tab.

Non-goals for Part 64:
- No binary bundle/zip export. We only generate JSON lockfile and manifest.
- No new generic approval framework; reuse existing workspace hooks.
- No content payload APIs; everything references contentHash/IDs only.

## Required Modules
Add the following TS modules in 04-Dashboard/app/lib/, wired to existing patterns and types.

1) release-types.ts
- Purpose: Centralize new types added to lib/types.ts but keep module-local helpers until types.ts is updated.
- Exports:
  - type ReleaseChannel = string; // validated against policy, not hardcoded union
  - interface LockfileEntry { key: string; type: DeliverableType; variant: string; source: { deliverableId: string; version: number } | { materializedId: string }; contentHash: string; evidenceRefs: string[]; provenance: { inputs: string[]; mergeStrategy?: string }; }
  - interface ReleaseLockfile { id: string; project: string; channel: ReleaseChannel; createdAt: string; createdBy: ActorRef; entries: LockfileEntry[]; entriesHash: string; // sha256 over canonicalized entries; meta: { selectionSpec: SelectionSpec; baseReleaseId?: string; } }
  - interface ReleaseCandidate { id: string; status: 'pending' | 'promoted' | 'rejected' | 'expired'; project: string; channel: ReleaseChannel; lockfileId: string; createdAt: string; createdBy: ActorRef; summary: { entryCount: number; newSinceBase: number; changed: number; removed: number }; }
  - interface ReleaseRecord { id: string; project: string; channel: ReleaseChannel; lockfileId: string; manifestId: string; createdAt: string; createdBy: ActorRef; supersedes?: string; }
  - interface SelectionSpec { includeKeys?: string[]; excludeKeys?: string[]; sinceReleaseId?: string; sinceTimestamp?: string; variants?: string[]; types?: DeliverableType[]; allowMerge?: boolean; }
  - interface DiffStat { added: number; removed: number; changed: number; unchanged: number; }
  - interface LockfileDiff { a: string; b: string; stat: DiffStat; changes: Array<{ key: string; type: DeliverableType; variant: string; from?: { contentHash: string }; to?: { contentHash: string } }> }

2) release-index.ts
- Purpose: Index and filesystem layout management for candidates/releases.
- Storage layout:
  - state/releases/index.json
  - state/releases/channels.json // { [project:channel]: releaseId }
  - state/releases/lockfiles/<lockfileId>.json
  - state/releases/manifests/<manifestId>.json
  - state/releases/candidates/index.json
  - state/releases/candidates/<candidateId>/lockfile.ref // points to lockfileId
  - state/releases/candidates/<candidateId>/selection.json
  - state/releases/candidates/<candidateId>/materials/*.json // optional materialized outputs
  - state/releases/diffs/<a>__vs__<b>.json // cached diffs (optional)
- Exports:
  - getCurrentRelease(project: string, channel: string): Promise<ReleaseRecord | null>
  - setCurrentRelease(rec: ReleaseRecord): Promise<void> // atomic channel pointer update + index append
  - persistLockfile(lockfile: ReleaseLockfile): Promise<string> // returns lockfileId, atomic write
  - getLockfile(lockfileId: string): Promise<ReleaseLockfile | null>
  - persistManifest(manifest: object): Promise<string>
  - getManifest(manifestId: string): Promise<any | null>
  - persistCandidate(candidate: ReleaseCandidate, selection: SelectionSpec): Promise<void>
  - getCandidate(candidateId: string): Promise<{ candidate: ReleaseCandidate; lockfile: ReleaseLockfile; selection: SelectionSpec } | null>
  - listCandidates(filter: { project?: string; channel?: string; status?: string }): Promise<ReleaseCandidate[]>
  - persistDiff(aId: string, bId: string, diff: LockfileDiff): Promise<void>
  - getDiff(aId: string, bId: string): Promise<LockfileDiff | null>

3) release-assembly.ts
- Purpose: Core assembly pipeline.
- Dependencies: deliverable-store.ts, deliverable-merge.ts, deliverable-id.ts, evidence-linker.ts, release-index.ts
- Exports:
  - buildReleaseCandidate(input: { project: string; channel: string; createdBy: ActorRef; selection: SelectionSpec }): Promise<{ candidate: ReleaseCandidate; lockfile: ReleaseLockfile }>
- Behavior:
  - Determine base release (from selection.sinceReleaseId or current release for project+channel).
  - Query deliverable-store for approved deliverables matching project, types, variants, and sinceTimestamp/sinceRelease baseline.
  - Group by target key (use deliverable key creation from deliverable-id.ts). For collisions on the same key:
    - If selection.allowMerge is true and deliverable-merge registry has a merge strategy for that deliverable type/variant, run materialization:
      - Apply merge-time enforcement already in deliverable-merge.ts.
      - Persist materialized output under candidates/<id>/materials/<materializedId>.json with contentHash computed deterministically.
      - Create LockfileEntry with source.materializedId.
    - Else, deterministically pick the highest approved version number for that key (tie-breaker by createdAt then ID) and record as source deliverable.
  - For each selected entry, aggregate evidenceRefs from evidence-linker.ts (do not inline content).
  - Deterministically sort entries (by type, variant, then key), compute entriesHash (sha256 over canonical JSON, stable key ordering).
  - Create ReleaseLockfile with meta.selectionSpec and baseReleaseId if present; persist via release-index.persistLockfile.
  - Compute summary diff vs base (if base exists) using release-diff.ts (see below).
  - Persist ReleaseCandidate (status=pending) and selection via release-index.persistCandidate.

4) release-diff.ts
- Purpose: Produce stable diff between two lockfiles.
- Exports:
  - diffLockfiles(a: ReleaseLockfile, b: ReleaseLockfile): LockfileDiff
- Behavior:
  - Key on (type, variant, key). Changed if contentHash differs. Added/removed computed from set differences. Deterministic ordering.

5) release-promotion.ts
- Purpose: Governed promotion flow. Uses existing approval workspace infra.
- Dependencies: approval-gates (generic) + approval-gates-deliverables if needed for evidence reuse.
- Exports:
  - proposePromotion(input: { candidateId: string; actor: ActorRef; reason?: string }): Promise<{ promotionId: string; approvalId: string; candidate: ReleaseCandidate }>
  - finalizePromotion(input: { approvalId: string; decision: 'approve' | 'reject'; actor: ActorRef; note?: string }): Promise<{ status: 'promoted' | 'rejected'; release?: ReleaseRecord }>
- Behavior:
  - proposePromotion: 
    - Load candidate+lockfile; validate candidate.status === 'pending'.
    - Open approval request in existing human approval workspace with summary and diff stats; attach evidenceRefs union for review context.
  - finalizePromotion (on approve):
    - Create manifest object:
      - { lockfileId, project, channel, createdAt, createdBy, entries: [{ key, type, variant, contentHash, evidenceRefs }], baseReleaseId?, entriesHash }
    - Persist manifest, create ReleaseRecord, append to releases index.
    - Atomically update channels.json pointer for project:channel to new releaseId.
    - Update candidate.status to 'promoted'.
  - finalizePromotion (on reject): Update candidate.status to 'rejected'.

6) release-policy.ts
- Purpose: Validation and governance checks for assembly/promotion.
- Exports:
  - validateChannel(project: string, channel: string): void // throws if not allowed per policy
  - validateSelection(selection: SelectionSpec): void // bounds checks (include/exclude length, variants/types allowed)
  - canAssemble(actor: ActorRef, project: string): boolean
  - canPromote(actor: ActorRef, project: string, channel: string): boolean
- Implementation uses existing provider governance/policies loaded in memory. Keep minimal; default allow if no policy found.

Note: After stabilizing, migrate types from release-types.ts into lib/types.ts.

## APIs
Add guarded, typed routes to server.js.

- POST /api/releases/candidates/build
  - Guard: protected, role: operator, scope: project
  - Body: { project: string; channel: string; selection?: SelectionSpec }
  - Returns: 201 { candidate: ReleaseCandidate; lockfile: { id, project, channel, createdAt, createdBy, entriesHash, entries: LockfileEntrySummary[] } }
    - LockfileEntrySummary omits provenance.inputs; only includes key, type, variant, contentHash, source.kind ('deliverable'|'materialized')
  - Errors: 400 (validation), 403 (policy), 409 (assembly in progress, optional), 500

- GET /api/releases/candidates
  - Guard: protected
  - Query: project?, channel?, status?
  - Returns: 200 { items: ReleaseCandidate[] }

- GET /api/releases/candidates/:id
  - Guard: protected
  - Returns: 200 { candidate: ReleaseCandidate; lockfile: ReleaseLockfileRedacted; selection: SelectionSpec }
    - Redacted: provenance.inputs redacted to IDs only; no content; evidenceRefs OK

- GET /api/releases/candidates/:id/diff/current
  - Guard: protected
  - Returns: 200 { base: ReleaseRecord | null; diff: LockfileDiff }

- POST /api/releases/candidates/:id/promote
  - Guard: protected + approval required
  - Body: { reason?: string }
  - Returns: 202 { promotionId: string; approvalId: string }

- POST /api/releases/promotions/:approvalId/decision
  - Guard: protected + approver role
  - Body: { decision: 'approve' | 'reject'; note?: string }
  - Returns: 200 { status: 'promoted' | 'rejected'; release?: ReleaseRecord }

- GET /api/releases/current
  - Guard: protected
  - Query: project: string; channel: string
  - Returns: 200 { release: ReleaseRecord | null; lockfile?: ReleaseLockfile }

- GET /api/releases/:id
  - Guard: protected
  - Returns: 200 { release: ReleaseRecord; lockfile: ReleaseLockfile; manifest: object }

- GET /api/releases/:id/diff/:otherId
  - Guard: protected
  - Returns: 200 { diff: LockfileDiff }

Notes:
- All responses pass through http-response-guard and deep-redaction. Do not return raw deliverable content; only IDs and hashes.
- Enforce input schema using existing validation middleware.

## UI
Extend 04-Dashboard/app/index.html + operator.js:

- Releases tab:
  - “Assemble Candidate” button: opens modal
    - Fields: Channel (dropdown), Variants (multi-select), Types (multi-select), Include keys, Exclude keys, Since (current release | timestamp), Allow Merge (checkbox)
    - On submit: POST /api/releases/candidates/build; show toast on success
  - Candidates list (new section above past releases): shows id, createdAt, actor, channel, entryCount, diff stat vs current
    - Row actions:
      - View details: opens panel with lockfile summary (no content), selection spec
      - Diff vs current: calls GET /api/releases/candidates/:id/diff/current, renders added/changed/removed counts and a detail list with keys
      - Promote: opens approval modal: POST /api/releases/candidates/:id/promote
  - Current release pill for channel; on click shows lockfile summary and manifest evidence counts.

- Operator UX:
  - Leverage existing inline approval workspace to show promotion requests. On approve/reject, automatically refresh candidate row state.

- CSS: reuse style.css classes for lists and detail panels. No heavy new components.

## Docs
Add to 04-Dashboard/docs/:

- ADR-0xx-release-lockfile.md
  - Problem: Deterministic, reproducible releases from approved deliverables.
  - Decision: Immutable lockfile with sorted entries and sha256 entriesHash; append-only candidates and releases; per-channel current pointer.
  - Alternatives considered: dynamic resolution at runtime; monolithic bundle.
  - Security/Privacy: only IDs/hashes exposed; evidence refs not content; channel policy validation.

- API/release-assembly.md
  - Request/response contracts for all endpoints.
  - Redaction notes and examples.
  - Error matrix.

- Runbooks/release-promotion.md
  - How to assemble, diff, and promote.
  - Approval steps in workspace.
  - Rollback procedure: promote an earlier candidate or recreate from a past lockfile; release records are immutable.

- Contracts/release-lockfile.json
  - JSON schema for ReleaseLockfile and LockfileEntry.

- QA/acceptance/release-assembly-cases.md
  - The acceptance scenarios listed below with sample payloads and expected outputs.

## Acceptance Criteria
Minimum viable acceptance set (add to your 150-suite as 12 new cases):

1) Deterministic assembly
- Given same selection spec and same deliverable store state, two assemblies produce identical entries and the same entriesHash.

2) Approved-only selection
- Unapproved or rejected deliverables are never included. Attempting to include an ID directly results in validation error.

3) Collision resolution without merge
- Two approved deliverables for same (type, variant, key) produce a single entry for the highest version when allowMerge=false.

4) Collision resolution with merge
- Same setup with allowMerge=true and a configured merge strategy results in a materialized output; LockfileEntry references materializedId; provenance lists inputs in sorted order; contentHash stable.

5) Evidence aggregation
- Entries include evidenceRefs aggregated from source deliverables; manifest summarizes counts.

6) Diff vs current
- Building candidate since current yields correct added/changed/removed counts. Swapping “a” and “b” in diff flips added/removed.

7) Promotion approval gating
- Propose promotion creates approval request with correct summary. Only approvers can finalize.

8) Promotion immutability and pointer update
- On approve: release record persisted, channels.json updated atomically. Re-fetch current returns the new release. Candidate status is “promoted.”

9) Rejection handling
- On reject: candidate status becomes “rejected”; no changes to channel pointer.

10) Redaction
- API responses never include raw content; only IDs/hashes and evidenceRefs. Deep redaction middleware masks any unexpected fields (inject test payload to verify).

11) Concurrency and idempotency
- Two build requests with identical spec within a short window return distinct candidate IDs but identical lockfileId and entriesHash. Promotion double-submit on same approvalId is idempotent.

12) Failure recovery
- Crash between manifest persist and channel pointer update leaves consistent state: release record exists, pointer eventually updated on retry or via repair script. No partial/corrupt files (temp files cleaned).

## Hardening Notes
- Atomic writes: Use write-to-temp-then-rename for all persist* operations. Persist manifest and release record before updating channel pointer. Only after both succeed, update pointer atomically.
- File locking: Use a simple lock file per project:channel during promotion to prevent concurrent pointer updates. Timeout and clear stale locks with caution.
- Id validation: 
  - project, channel: /^[a-z0-9-_]{1,64}$/i
  - Include/exclude key arrays capped at 200 entries. Variants/types lists capped as well.
- Memory/IO limits: Stream JSON where possible; do not load very large materialized artifacts into memory. Materials are JSON only for now; cap size (e.g., 1 MB) and reject oversize merges.
- Deterministic JSON: Canonicalize JSON (sorted keys) before hashing. Reuse deliverable-id canonicalizer if available.
- Tamper detection: On read, recompute entriesHash and warn/log if mismatch. Do not silently serve tampered data.
- Policy hooks:
  - validateChannel checks configured allowed channels per project if present (00-Governance); fallback allow-all if absent.
  - canPromote gated by operator role + project ACL.
- Provenance privacy: provenance.inputs list only IDs, not content. Strip any fields flagged as sensitive via deep-redaction.
- Cross-project isolation: Ensure selection queries are strictly constrained to the project scope; no cross-project deliverables allowed.
- Index rebuild: Add a repair script entry point (optional in this part) to rebuild candidates index from filesystem if index.json missing. Document in runbook; schedule for a later part if needed.
- Logging: Emit structured events (info) on candidate build, diff computed, promotion proposed, promotion finalized/rejected with correlation IDs. Reuse existing observability hooks.

This part keeps surface area tight, leverages your new deliverables foundation, and yields an enterprise-grade, reproducible release lifecycle with minimal UI additions and fully typed, guardable APIs.
