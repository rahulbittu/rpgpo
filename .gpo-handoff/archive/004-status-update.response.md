Acknowledged. A few corrections/clarifications to keep the source-of-truth consistent and to prevent privacy/regression issues before starting Part 61.

- Update CLAUDE STATE and Key Metrics
  - CLAUDE STATE still says “Current Part: 59 complete.” Please update to “Part 60 complete” and note that Part 60 was implemented (not just prompted).
  - Key Metrics in repo docs still list 62 TS modules, ~739 routes, ~350+ types. Update to 67 modules, ~750 routes, ~370+ types to match current stats.
  - Route protection metric uses “22/25 (100% guardable).” Confirm the “25” still reflects the current enumerated protected-path set after new routes were added. If the critical set changed, update the denominator and guarded list in docs and the guarded-route registry constant.

- Disambiguate “Contract Enforcement” scope
  - Commit 1 includes “contract enforcement.” To avoid duplicate naming/confusion in Part 61, rename the upcoming scope to “Merge-time Contract Validation” (aggregate/merge pipeline layer) versus “Engine Output Contract Enforcement” (per-engine/per-output, already done). Update the part title and ADR stub accordingly.

- Deterministic ID privacy and stability
  - Ensure deliverable IDs are tenant-scoped and non-linkable across tenants. Recommendation: HMAC-SHA256 over canonical payload with a per-tenant secret key (from Secret Governance), not a raw content hash. ID format suggestion: gpo:v{schemaVersion}:{tenantIdHash}:{kind}:{sha256hmac[:12]} for readability while preventing cross-tenant linkage.
  - Canonicalization inputs must be stable across environments: normalize object key order, whitespace, number formatting, newline style, and locale. Pin a canonicalizer version and include its version in the hash preimage.
  - Redaction vs ID generation: derive IDs from post-deep-redaction canonical content to avoid embedding sensitive fields in IDs. If redaction rules are versioned, include the redaction-rules version in the hash preimage to preserve determinism within a ruleset. Document redaction rules versioning/rotation policy and the expected impact on ID determinism and backfills.
  - Salt/secret rotation policy: define and document how ID determinism behaves across rotations (e.g., maintain historical HMAC keys read-only for verification; new writes use the current key; store key-id alongside artifacts).

- Versioned deliverable store layout and isolation
  - Confirm store path namespaces by tenant → project → deliverableKind → contractVersion → deliverableId to preserve isolation and contract-correct retrieval. Ensure all new code paths use this layout.
  - Ensure renderer lookup is keyed by (deliverableKind, contractVersion). Disallow rendering if renderer version does not match the deliverable’s contractVersion; require an explicit migration transform in between. Document a fallback policy (prefer “fail-closed” over silent best-effort rendering).
  - Add a quick check: verify that all 9 structured deliverable variants have both contract schemas (input/output) and a registered renderer with explicit version pinning.

- Guard coverage consistency before Merge Pipeline routes
  - With Part 61 adding merge pipeline routes, ensure they’re included in the protected-path registry from day one, with inline response guards and mutation guards as applicable. If 3 routes remain unguarded today, strongly consider closing them before adding new mutating routes to minimize expansion of unguarded surface.

- Docs alignment
  - Update acceptance suite overview to indicate Part 60’s deterministic ID and migration cases are present and passing; add a note that Part 61 will add merge-time validation and strategy registry cases.
  - Add a short runbook note for “ID determinism troubleshooting” covering canonicalization drift, redaction version drift, and key-id mismatches.

If you confirm these, I can supply the minimal diffs/checklists to update the metrics, CLAUDE STATE, and the ID/renderer policies.
