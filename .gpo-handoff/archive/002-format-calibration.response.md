# Decision
Implement Part 60 as an append-only, versioned store for StructuredDeliverables with evidence links and approval gating. Key design choices: deterministic DeliverableId, hash-chained version history, and contract-aware merge pipeline from scaffolds to committed versions. This preserves existing structured-deliverables, contract-enforcement, and rendering while enabling remediation, traceability, and board-grade approvals without breaking raw text fallback.

# Key Types (paste-ready, TypeScript)
export type DeliverableId = `${string}:${'newsroom'|'shopping'|'code'|'document'|'recommendation'|'schedule'|'creative'|'analysis'|'actionplan'}:${string}`; // project:kind:slug
export type VersionTag = `v${number}`;
export type ContentHash = `sha256:${string}`;

export interface EvidenceRef {
  kind: 'artifact'|'trace'|'url';
  ref: string; // artifactId|traceId|https://...
  label?: string;
}

export interface DeliverableVersionMeta {
  id: DeliverableId;
  kind: StructuredDeliverable['kind'];
  version: VersionTag;
  parent?: VersionTag;        // previous version tag if any
  hash: ContentHash;          // hash of normalized content + meta
  createdAt: string;
  createdBy: 'agent'|'operator'|'system';
  sourceRunId?: string;
  notes?: string;
  evidence: EvidenceRef[];
  status: 'draft'|'proposed'|'approved'|'rejected'|'superseded';
}

export interface StoredDeliverable {
  meta: DeliverableVersionMeta;
  content: StructuredDeliverable; // from structured-deliverables.ts
}

# Module Decomposition
app/lib/deliverable-store.ts → Append-only persistence for deliverable versions
- putInitial(id: DeliverableId, content: StructuredDeliverable, meta: Omit<DeliverableVersionMeta,'version'|'hash'|'parent'|'status'>): StoredDeliverable
- putVersion(prev: StoredDeliverable, content: StructuredDeliverable, metaPatch: Partial<Omit<DeliverableVersionMeta,'id'|'kind'|'version'|'hash'>>): StoredDeliverable
- getLatest(id: DeliverableId): StoredDeliverable|undefined
- getByVersion(id: DeliverableId, version: VersionTag): StoredDeliverable|undefined
- listHistory(id: DeliverableId): StoredDeliverable[]
- computeHash(content: StructuredDeliverable, metaCore: Pick<DeliverableVersionMeta,'id'|'kind'|'parent'>): ContentHash

app/lib/deliverable-merge.ts → Contract-aware merge of scaffold/partials into canonical content
- mergeScaffold(base: StructuredDeliverable, patch: Partial<StructuredDeliverable>, policy?: MergePolicy): StructuredDeliverable
- diff(a: StructuredDeliverable, b: StructuredDeliverable): { path: string; from: unknown; to: unknown }[]
- validateComplete(content: StructuredDeliverable): { ok: boolean; missing: string[] }

app/lib/evidence-linker.ts → Link deliverables to existing Artifact Registry and Traceability
- attachEvidence(id: DeliverableId, version: VersionTag, refs: EvidenceRef[]): StoredDeliverable
- fetchEvidence(id: DeliverableId, version: VersionTag): EvidenceRef[]
- toArtifactRef(id: DeliverableId, version: VersionTag): { artifactId: string }

app/lib/approval-gates-deliverables.ts → Lightweight gate on top of contract-enforcement for versions
- propose(id: DeliverableId): StoredDeliverable
- approve(id: DeliverableId, version: VersionTag, approver: string): StoredDeliverable
- reject(id: DeliverableId, version: VersionTag, approver: string, reason: string): StoredDeliverable
- currentStatus(id: DeliverableId): DeliverableVersionMeta['status']

app/lib/deliverable-id.ts → Deterministic ID and slug helpers
- makeId(project: string, kind: StructuredDeliverable['kind'], slug: string): DeliverableId
- slugifyTitle(title: string): string
- parseId(id: DeliverableId): { project: string; kind: StructuredDeliverable['kind']; slug: string }

# Answers to Questions
1) Storage model: JSON-per-version under state/deliverables/{project}/{kind}/{slug}/{version}.json plus an index.json for latest and lineage. This aligns with current file-based persistence and keeps atomic writes small.
2) Versioning: monotonically incremented VersionTag v1..vn with parent pointer and content hash; no rewrites. Supersession is represented by status transitions, not file mutation.
3) Merge semantics: deep, field-aware merge using MergePolicy maps per deliverable kind (e.g., replace arrays for table rows by key, set union for tags, last-write-wins for scalars); unknown fields are preserved to remain forward-compatible.
4) Evidence: store only lightweight EvidenceRef; artifact bodies remain in existing Artifact Registry. We compute toArtifactRef to register/version a deliverable snapshot as an artifact when moving to proposed/approved.

# Risks + Mitigations
- Orphaned latest pointers if write fails mid-sequence → write temp file then atomic rename, update index last.
- Hash drift from unordered fields → normalize content (key sort, array stable sort where declared) before hashing.
- Merge policy bugs corrupt content → unit-test per kind with golden fixtures; fallback to replace-on-conflict.
- Cross-run ID collisions → deterministic slug + project scoping; refuse putInitial if id exists unless forceCreate is set by operator.
- Evidence ref rot → periodic validator leveraging audit hub; surface broken refs in UI badges.

# Integration Points
app/lib/structured-deliverables.ts: export normalize(content) for hashing; export kind→MergePolicy map hook.
app/lib/contract-enforcement.ts: call validateComplete before approve; gate transitions via approval-gates-deliverables.
app/lib/deliverable-rendering.ts: accept StoredDeliverable for rendering (meta badges, version switcher).
app/lib/chief-of-staff.ts: on Assemble/Validate, write putInitial/putVersion; attach evidence from execution graph.
app/server.js: add minimal routes to read listHistory/getLatest and post propose/approve/reject (guarded).
app/lib/types.ts: add the novel types above and MergePolicy shape.
state/: create deliverables/ tree and index.json per deliverable folder.
