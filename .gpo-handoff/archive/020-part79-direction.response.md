```
You are the Builder for RPGPO Part 79.

Part 79: State Management + Backup + Export/Import

Goal
Implement a comprehensive, contract-driven state management layer that provides:
- Atomic full snapshots (quiesced, consistent copy)
- Incremental backups with CAS deduplication and retention
- Full export/import (portable operator data) with dry-run and remap controls
- State integrity verification (checksums, manifest, drift detection)
- Recovery tools (restore from snapshot/incremental with rollback)
- Governance-compliant auditing, redaction, isolation, and route protection
- Scheduling hooks for recurring backups
- UI for Operators to manage snapshots/backups/exports/imports

Constraints
- Preserve all existing functionality and acceptance suite; additive only.
- CommonJS + TypeScript; raw Node.js HTTP; no new external NPM deps.
- All new modules must be typed and governed by existing response guards, deep-redaction, and governance policies.
- File-based state in 04-Dashboard/state/ remains the source of truth.
- Create new storage roots: 04-Dashboard/backups/ and 04-Dashboard/exports/.
- Stream I/O (fs streams), streaming gzip (zlib) for packs, streaming SHA-256 (crypto).
- Atomic writes via tmp dir + rename.
- Tenant/project isolation enforced; no cross-tenant import without explicit allow and operator confirmation.
- Sensitive fields redacted per deep-redaction policies unless encryption is explicitly enabled.
- Quiesce mutations during snapshot/restore operations using a central quiesce guard integrated with existing mutation guards.
- Integrate with existing recurring scheduler from Part 77 for periodic backups.

Deliverables
1) New TypeScript modules under 04-Dashboard/app/lib/state/:
   - state-config.ts
     - Purpose: Central config/paths/retention and include/exclude policy.
     - Exports:
       - getStatePaths(): { root: string; stateRoot: string; backupsRoot: string; exportsRoot: string; casRoot: string; tmpRoot: string }
       - getBackupPolicy(): { fullIntervalDays: number; incrementalIntervalHours: number; retention: { snapshots: number; incrementals: number; exports: number } }
       - getIncludeGlobs(): string[]
       - getExcludeGlobs(): string[]
       - getRedactionPolicy(): { mode: 'strip'|'mask'|'none'; fields?: string[] }
       - getEncryptionPolicy(): { enabled: boolean; keyId?: string } // default disabled
       - isImportCrossTenantAllowed(): boolean // default false
       - getQuiesceTimeoutMs(): number // e.g., 5000
       - stateSchemaVersion: string // bump to "2.0.0" for this feature
   - quiesce.ts
     - Purpose: System-wide mutation quiesce flag and integration helpers.
     - Exports:
       - beginQuiesce(reason: string, timeoutMs?: number): Promise<{ token: string }>
       - endQuiesce(token: string): Promise<void>
       - isQuiesced(): boolean
       - withQuiesce<T>(reason: string, timeoutMs: number, fn: () => Promise<T>): Promise<T>
       - getQuiesceState(): { active: boolean; reason?: string; since?: string }
   - integrity.ts
     - Purpose: Streaming checksum and manifest construction/validation.
     - Types:
       - StateManifestEntry { path: string; size: number; sha256: string; mtimeMs: number; mode?: number }
       - StateManifest { id: string; createdAt: string; stateSchemaVersion: string; entries: StateManifestEntry[]; includeGlobs: string[]; excludeGlobs: string[]; redactionMode: string; encryption: boolean; type: 'snapshot'|'incremental'|'export'; baseId?: string }
       - VerifyIssue { path: string; kind: 'missing'|'hash-mismatch'|'extra'|'permission-mismatch'|'size-mismatch'; detail?: string }
       - VerifyReport { ok: boolean; issues: VerifyIssue[]; summary: { total: number; ok: number; mismatched: number; missing: number; extra: number } }
     - Exports:
       - hashFileStream(path: string): Promise<{ sha256: string; size: number }>
       - buildManifest(root: string, entries: string[], opts): Promise<StateManifest>
       - verifyAgainstManifest(root: string, manifest: StateManifest): Promise<VerifyReport>
   - cas-store.ts
     - Purpose: Content-addressed storage for dedup.
     - Exports:
       - putFileToCAS(absPath: string, algo?: 'sha256'): Promise<{ sha256: string; size: number; storedPath: string }>
       - hasBlob(sha256: string): Promise<boolean>
       - getBlobPath(sha256: string): string
       - pruneCAS(retainHashes: string[]): Promise<{ removed: number }>
   - scanner.ts
     - Purpose: Resolve include/exclude to concrete file list and classify deltas vs last snapshot.
     - Exports:
       - listStateFiles(): Promise<string[]> // absolute file paths respecting include/exclude
       - relativize(absPaths: string[]): string[] // relative to state root
       - diffManifests(base: StateManifest|null, currentFiles: string[]): Promise<{ added: string[]; changed: string[]; removed: string[]; unchanged: string[] }>
   - snapshot.ts
     - Purpose: Full snapshot creation to backupsRoot/snapshots/<id>/ with manifest and CAS pointers.
     - Types:
       - StateSnapshotMeta { id: string; createdAt: string; reason?: string; baseId?: string; by: string; quiesce: boolean; encryption: boolean; manifestPath: string; metaPath: string }
     - Exports:
       - createSnapshot(reason?: string, opts?: { quiesce?: boolean; encryption?: boolean }): Promise<StateSnapshotMeta>
       - listSnapshots(): Promise<StateSnapshotMeta[]>
       - getSnapshot(id: string): Promise<{ meta: StateSnapshotMeta; manifest: StateManifest }>
       - assembleSnapshotPack(id: string, opts?: { format: 'ndjson.gz' }): Promise<NodeJS.ReadableStream> // streams portable pack for download
   - incremental.ts
     - Purpose: Incremental backup from last snapshot using CAS, writes to backupsRoot/incrementals/<id>/ with manifest and baseId.
     - Types:
       - StateIncrementalMeta { id: string; baseId: string; createdAt: string; by: string; changes: { added: number; changed: number; removed: number } }
     - Exports:
       - createIncremental(reason?: string): Promise<StateIncrementalMeta>
       - listIncrementals(): Promise<StateIncrementalMeta[]>
       - getIncremental(id: string): Promise<{ meta: StateIncrementalMeta; manifest: StateManifest }>
   - exporter.ts
     - Purpose: Operator-focused export pack (portable), with redaction and optional encryption flag.
     - Types:
       - ExportMeta { id: string; createdAt: string; by: string; purpose?: string; redaction: string; encryption: boolean; entries: number; bytes: number }
     - Exports:
       - createExportPack(purpose?: string, opts?: { redact?: boolean; encryption?: boolean; include?: string[]; exclude?: string[] }): Promise<ExportMeta>
       - listExports(): Promise<ExportMeta[]>
       - getExportStream(id: string): Promise<NodeJS.ReadableStream> // ndjson.gz
   - importer.ts
     - Purpose: Import from portable pack (ndjson.gz) or directory snapshot; supports dry-run, tenant/project remap, and staging with rollback.
     - Types:
       - ImportPlan { id: string; createdAt: string; mode: 'portable-pack'|'snapshot-dir'; dryRun: boolean; remap?: { tenantId?: string; projectIds?: Record<string,string> }; summary: { willCreate: number; willOverwrite: number; willSkip: number; conflicts: number } }
       - ImportResult { id: string; applied: boolean; created: number; overwritten: number; skipped: number; conflicts: number; issues: string[] }
     - Exports:
       - planImportFromStream(stream: NodeJS.ReadableStream, opts): Promise<ImportPlan>
       - applyImportFromStream(stream: NodeJS.ReadableStream, plan: ImportPlan): Promise<ImportResult>
       - restoreFromSnapshot(id: string, opts?: { quiesce?: boolean; rollbackOnFailure?: boolean }): Promise<ImportResult>
   - pack-format.ts
     - Purpose: Define portable pack schema (ndjson), and read/write helpers.
     - Record types (each line):
       - { type: 'meta', id, createdAt, stateSchemaVersion, redaction, encryption }
       - { type: 'file', path, mode, size, sha256, chunks?: number }
       - { type: 'chunk', path, index, dataB64 }
       - { type: 'eof' }
     - Exports:
       - writePackFromManifest(manifest: StateManifest, opts): NodeJS.ReadableStream // produces ndjson.gz stream with file chunks (e.g., 1MB)
       - readPackToStaging(stream: NodeJS.ReadableStream, stagingRoot: string): Promise<{ manifest: StateManifest; files: Array<{ path: string; sha256: string; size: number }> }>
   - retention.ts
     - Purpose: Apply retention policy and pruning for snapshots/incrementals/exports and CAS.
     - Exports:
       - enforceRetention(): Promise<{ snapshotsRemoved: number; incrementalsRemoved: number; exportsRemoved: number; casRemoved: number }>
   - audit-hooks.ts
     - Purpose: Emit audit/evidence chain events for snapshot/backup/export/import.
     - Exports:
       - recordStateEvent(kind: 'snapshot'|'incremental'|'export'|'import'|'verify'|'restore', detail: any): Promise<void>

2) Types additions (04-Dashboard/app/lib/types.ts)
   - Add the new interfaces listed above: StateManifestEntry, StateManifest, VerifyIssue, VerifyReport, StateSnapshotMeta, StateIncrementalMeta, ExportMeta, ImportPlan, ImportResult.
   - Add union types for StateOperationKind and StatePackRecord.
   - Ensure fields include tenantId/projectId anchors when applicable.

3) Server routes (04-Dashboard/app/server.js)
   - All routes guarded by existing middleware and http-response-guard, authenticated operator-only. Mutation routes must respect quiesce state; add guard integration.
   - Routes (method path → handler):
     - GET /api/state/quiesce → getQuiesceStateHandler
     - POST /api/state/quiesce/start → startQuiesceHandler { reason, timeoutMs? }
     - POST /api/state/quiesce/end → endQuiesceHandler { token }
     - POST /api/state/snapshot → createSnapshotHandler { reason?, quiesce?: boolean, encryption?: boolean }
     - GET /api/state/snapshots → listSnapshotsHandler
     - GET /api/state/snapshots/:id → getSnapshotHandler
     - GET /api/state/snapshots/:id/download → downloadSnapshotPackHandler?format=ndjson.gz
     - POST /api/state/incremental → createIncrementalHandler { reason? }
     - GET /api/state/incrementals → listIncrementalsHandler
     - GET /api/state/incrementals/:id → getIncrementalHandler
     - POST /api/state/export → createExportHandler { purpose?, redact?: boolean, encryption?: boolean, include?: string[], exclude?: string[] }
     - GET /api/state/exports → listExportsHandler
     - GET /api/state/exports/:id/download → downloadExportHandler
     - POST /api/state/import/plan → planImportHandler multipart/form-data (file: pack.ndjson.gz), { dryRun: true, remap?: { tenantId, projectIds } }
     - POST /api/state/import/apply → applyImportHandler multipart/form-data (file: pack.ndjson.gz), { dryRun: false, remap?: { ... } }
     - POST /api/state/restore/snapshots/:id → restoreSnapshotHandler { quiesce?: true, rollbackOnFailure?: true }
     - POST /api/state/verify → verifyStateHandler { target?: 'current'|'snapshot'|'incremental', id?: string }
     - POST /api/state/retention/enforce → enforceRetentionHandler
   - Ensure streaming request handling for multipart without new dependencies (implement simple boundary parser for single file; size limits, backpressure).
   - Return typed JSON payloads conforming to types.ts additions; redact sensitive fields via deep-redaction before response.

4) Mutation guard integration
   - In server.js, integrate quiesce.ts so that:
     - All mutation routes (existing mutation guards) additionally check quiesce.isQuiesced() and reject with 503 and Retry-After header when active, except state control routes invoked by operator.
   - Provide small helper in quiesce.ts: shouldAllowMutation(routeId: string): boolean to whitelist state control endpoints.

5) Scheduler integration (Part 77)
   - Register recurring tasks:
     - backup:incremental hourly (respect policy incrementalIntervalHours)
     - backup:full daily (respect fullIntervalDays)
     - backup:retention daily
   - Use chief-of-staff orchestration hooks to create tasks, include audit-hooks recording.
   - Ensure tasks are idempotent; skip if a backup is in progress (quiesce active or lockfile present).

6) Integrity verification
   - Expose verify endpoint and implement verifyAgainstManifest for:
     - current state vs last snapshot
     - specific snapshot or incremental id
   - Provide drift summary in VerifyReport.

7) Recovery tooling
   - Implement atomic restoreFromSnapshot:
     - Steps: quiesce → build staging copy from snapshot (using CAS blobs) → verify staging → move current state to backups/rollbacks/<ts>-<id>/ → rename staging to state → verify current → end quiesce. On failure: rollback.
     - All moves via atomic rename; ensure permissions copied.
   - CLI entry points (04-Dashboard/app/tools/)
     - tools/state-recover.ts (compiled to js)
       - Commands:
         - list
         - snapshot --reason="..."
         - incremental
         - export --purpose="..." [--redact] [--encrypt]
         - verify [--target=snapshot|incremental] [--id=...]
         - restore --snapshot-id=... [--no-quiesce]
         - retention:enforce
       - Reuse same lib modules; print JSON output.

8) UI additions (04-Dashboard/app/)
   - Add Data & Backups panel under Settings:
     - Tabs: Snapshots, Incrementals, Exports, Verify/Restore, Settings
     - Snapshots: list with id, createdAt, by, reason, actions: Download, Verify, Restore
     - Incrementals: list with id, baseId, createdAt, changes summary
     - Exports: list with id, createdAt, purpose, redaction, actions: Download
     - Verify/Restore: buttons for Verify Now, Restore from snapshot (with modal confirm), Import Pack (file upload with Dry Run + Apply)
     - Settings: policy read-only display from state-config; show quiesce state; button to Start/End Quiesce
   - Wire UI to new endpoints via app.js/operator.js; follow existing fetch patterns; ensure route guards; show toasts and progress indicators for long-running streaming ops.

9) Docs
   - 04-Dashboard/docs/runbooks/state-management.md
     - Snapshot/backup/export/import concepts, formats, and commands.
     - Recovery procedures (with and without server online).
     - Security: redaction/encryption behaviors.
     - Retention policies and customization.
   - 04-Dashboard/docs/contracts/state-pack-format.md
     - NDJSON record schema, chunking, examples, checksums, and verification.
   - 04-Dashboard/docs/adr/ADR-00x-state-backup-export.md
     - Decision to use CAS + manifest + ndjson.gz, no external deps, quiesce model, retention.

10) Tests (add to acceptance suite; ~20 cases)
   - test/state/snapshot-basic.ts: Creates snapshot, lists, downloads pack, verifies manifest integrity.
   - test/state/incremental-changes.ts: Modifies files; incremental detects added/changed/removed; CAS dedup works (no duplicate blob files).
   - test/state/export-redaction.ts: Export with redact true masks/strips sensitive fields per deep-redaction; export without redact includes unredacted fields only when encryption enabled else blocked.
   - test/state/import-dryrun.ts: Dry-run import from export pack yields plan with correct counts; cross-tenant blocked by default.
   - test/state/import-apply.ts: Apply import writes files to state; manifest verifies; audit entries recorded.
   - test/state/verify-drift.ts: Introduce corruption; verify endpoint flags hash-mismatch; report contains issue detail.
   - test/state/restore-atomic.ts: Restore snapshot with induced failure mid-way triggers rollback; current state preserved; end state consistent.
   - test/state/quiesce-guard.ts: During quiesce, mutation routes return 503; state control routes allowed.
   - test/state/retention.ts: After exceeding retention thresholds, older backups and CAS blobs pruned; manifests for retained remain valid.
   - test/state/scheduler.ts: Recurring tasks trigger backups; lock prevents overlapping runs; audit entries include task ids.
   - test/state/pack-format.ts: Pack writer/reader round-trips a synthetic dataset with multi-chunk files; checksums match.
   - test/state/large-file-stream.ts: Stream backpressure respected; memory use bounded; timeouts not exceeded.
   - test/state/download-endpoints.ts: Snapshot/export download streams with correct content-type and content-disposition.
   - test/state/security-route-guard.ts: All new routes require operator role and pass through response guard; PII redaction applied in responses.

Implementation Details

A) Packaging format (ndjson.gz)
- Each line a JSON record as defined in pack-format.ts.
- Chunk size default 1 MiB for large files; base64-encode chunk data.
- Stream gzip using zlib.createGzip({ level: 6 }); apply backpressure.
- Meta record includes stateSchemaVersion and redaction/encryption flags.

B) CAS store
- backups/cas/<sha256[0..1]>/<sha256> to shard directory entries.
- Store raw file bytes gzipped to reduce disk footprint.
- putFileToCAS computes sha256 streaming, writes to tmp file + rename if not exists.
- Integrity: compare size and optionally verify by decompressing header; keep metadata JSON with original size/mode.

C) Snapshots and incrementals
- Snapshot:
  - Quiesce if requested; scan include/exclude; build manifest; put all files to CAS; write snapshot dir:
    - backups/snapshots/<id>/manifest.json
    - backups/snapshots/<id>/meta.json
    - backups/snapshots/<id>/files.jsonl (list of { path, sha256, size, mode })
  - assembleSnapshotPack uses pack-format with manifest entries and CAS blobs to stream portable pack on demand.
- Incremental:
  - Use last snapshot manifest as base; compute diff; put changed/added files to CAS; removed tracked in manifest; write incremental dir:
    - backups/incrementals/<id> with meta/manifest referencing baseId.

D) Import
- planImportFromStream:
  - Parse ndjson.gz; reconstruct manifest; stage files to imports/<planId>/staging; compute conflicts vs current state; build plan summary.
- applyImportFromStream:
  - Quiesce; verify staged content; atomic rename: move conflicting current files to backups/rollbacks/<ts>-<planId>/; copy/move staged to state; verify; end quiesce.
- restoreFromSnapshot:
  - Materialize from CAS into staging; follow same apply path.

E) Redaction and encryption
- Use deep-redaction.ts to strip/mask fields for export when redact=true.
- If encryption.enabled=false and redact=false: block export of sensitive domains; respond with 400 and guidance.
- Stub encryption policy (no crypto envelope implemented in this part); include metadata for future key management.

F) Route security and governance
- All new endpoints must:
  - Pass through http-response-guard
  - Emit audit-hooks events with correlation ids
  - Respect tenant/project isolation. Paths included in exports must be anchored to tenant/project scoping; if ambiguous, default-deny and require explicit include.

G) Telemetry
- Emit lightweight metrics: backup duration, files processed, bytes, CAS hits/misses, verify issues count.
- Attach to existing observability hooks.

H) File system safety
- Use fs.mkdtemp for tmp; fs.rename for atomicity.
- Implement lock files: backups/.lock with PID + op + startAt; guard against concurrent ops; clear on exit handlers.

I) IDs and naming
- Deterministic, monotonic ids: 2026-03-15T12-34-56Z-<shorthash>.
- shorthash derived from meta (op+timestamp+count) sha256 first 8.

J) Content types
- Snapshot/export download:
  - Content-Type: application/x-ndjson+gzip
  - Content-Disposition: attachment; filename="gpo-state-<id>.ndjson.gz"

K) UI details
- Use existing UI patterns and CSS; do not introduce frameworks.
- File upload for import uses streaming multipart with progress bar.
- All actions ask for confirmation; restore/import show dry-run diff with counts.

L) Acceptance readiness
- Add route docs to 04-Dashboard/docs/api/state.md with request/response examples.
- Update middleware truth docs to include quiesce behavior.

API Contracts (examples)

POST /api/state/snapshot
- Request: { reason?: string, quiesce?: boolean, encryption?: boolean }
- Response: { meta: StateSnapshotMeta, manifest: { id, createdAt, entriesCount: number } }

GET /api/state/snapshots
- Response: { items: StateSnapshotMeta[] }

GET /api/state/snapshots/:id/download
- Streams ndjson.gz

POST /api/state/incremental
- Request: { reason?: string }
- Response: { meta: StateIncrementalMeta, manifest: { id, baseId, changes: { added, changed, removed } } }

POST /api/state/export
- Request: { purpose?: string, redact?: boolean, encryption?: boolean, include?: string[], exclude?: string[] }
- Response: { meta: ExportMeta }

POST /api/state/import/plan
- Multipart: file=pack.ndjson.gz; fields: { dryRun: true, remap?: {...} }
- Response: { plan: ImportPlan }

POST /api/state/import/apply
- Multipart: file=pack.ndjson.gz; fields: { dryRun: false, remap?: {...} }
- Response: { result: ImportResult }

POST /api/state/verify
- Request: { target?: 'current'|'snapshot'|'incremental', id?: string }
- Response: { report: VerifyReport }

Non-goals
- Remote offsite backups; cloud integrations; real encryption KMS integration; cross-instance synchronization.

Execution Plan
1) Add new types to lib/types.ts; compile.
2) Implement state-config.ts with defaults and TODO markers for operator overrides.
3) Implement quiesce.ts and integrate a lightweight in-memory state + lockfile fallback; wire into server.js mutation guard.
4) Build integrity.ts (hashing, manifest, verify).
5) Build cas-store.ts and scanner.ts.
6) Implement snapshot.ts and incremental.ts.
7) Implement pack-format.ts (streaming ndjson.gz write/read).
8) Implement exporter.ts and importer.ts using pack-format and integrity.
9) Implement retention.ts.
10) Implement audit-hooks.ts and wire calls from all operations.
11) Add server routes and handlers with streaming parsing/writing; ensure guards.
12) Add scheduler hooks for recurring backups and retention.
13) Build CLI tools/state-recover.ts.
14) Build UI panel and wire endpoints.
15) Write docs (runbook, contracts, ADR, API).
16) Implement tests; ensure green across existing suites; run drift and rollback scenarios.

Hardening
- Enforce size limits on upload (e.g., 512MB default), with 413 responses.
- Validate pack meta stateSchemaVersion matches current; if not, require explicit override flag.
- Sanitize paths in import to prevent traversal; normalize to state root; reject absolute/.. segments.
- Handle partial uploads; clean staging dirs on fail.
- Ensure retention cannot delete currently referenced CAS blobs (compute live set).
- Ensure all responses redacted appropriately and no secret leakage.
- Timeouts and backpressure respected for long streams; do not buffer entire pack in memory.

Acceptance Criteria
- Operators can create/download/restore snapshots, run incrementals, export/import packs (with dry-run), verify integrity, and enforce retention via UI and API.
- Backups are deduplicated via CAS; retention successfully prunes old artifacts without breaking remaining restores.
- Quiesce blocks mutations during critical operations; non-state control routes unaffected outside quiesce window.
- Full recovery from empty state using latest snapshot + incrementals is proven via test.
- All new routes pass route guards and redaction; audit events emitted; docs updated.

Now implement Part 79 per above. Touch only specified files and related wiring. Maintain existing behavior and test suite. Add new tests and docs. Submit diffs for review.
```
