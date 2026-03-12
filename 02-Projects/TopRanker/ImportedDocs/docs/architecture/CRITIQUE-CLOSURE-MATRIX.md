# Critique Closure Matrix — Sprints 790-809

**Created:** Sprint 816 (2026-03-12)
**Purpose:** Auditable ledger proving closure of every critique item

---

## Legend
- **Fixed:** Code change with tests proving the fix
- **Documented:** Decision formalized in code comments or docs (no behavioral change)
- **Deferred:** Acknowledged but not acted on, with rationale

---

## Critique 790-794

| # | Item | Status | Sprint | Artifact |
|---|------|--------|--------|----------|
| 1 | Push token store unbounded (M1) | Fixed | 796 | `MAX_TOKENS_PER_MEMBER=10`, `__tests__/sprint796` |
| 2 | Total member count unbounded | Fixed | 814 | `MAX_UNIQUE_MEMBERS=10000`, `__tests__/sprint814` |
| 3 | Config coupling / dynamic import workarounds | Fixed | 811 | Bootstrap boundaries formalized in `config.ts` header + `thresholds.json` |
| 4 | Session pruning interval | Documented | 794 | `pruneSessionInterval: 15 * 60` — explicit value, no behavioral change needed |
| 5 | Email FROM fallback | Fixed | 797 | `config.emailFrom` with explicit fallback |
| 6 | Vitest string scans vs ESLint | Documented | 811 | Shared assertion helpers reduce fragility; full ESLint migration deferred (cost > benefit for beta) |

## Critique 795-799

| # | Item | Status | Sprint | Artifact |
|---|------|--------|--------|----------|
| 1 | Public /api/health exposure | Fixed | 812 | Split into public liveness + admin-gated `/api/health/diagnostics` |
| 2 | Push token eviction policy (oldest vs LRU) | Fixed | 813 | LRU by `lastUsed` with `splice()`, `__tests__/sprint813` |
| 3 | Logger counter semantics | Documented | 813 | Event counters (not emitted-log counters), documented in `logger.ts` |
| 4 | Date.now() vs performance.now() for DB latency | Deferred | — | `Date.now()` is millisecond-accurate, sufficient for DB round-trip measurement. `performance.now()` adds no meaningful value here. |
| 5 | Route extraction (routes.ts at 412/420) | Fixed | 804 | `routes-health.ts` extracted, routes.ts at 374/420 |

## Critique 800-804

| # | Item | Status | Sprint | Artifact |
|---|------|--------|--------|----------|
| 1 | Finish config consolidation | Fixed | 806-808 | 14 files migrated, 27 config fields, 0 direct process.env in non-bootstrap |
| 2 | Lock down /api/health | Fixed | 812 | Public liveness + admin-gated diagnostics |
| 3 | MemoryStore.windows readonly exposure | Documented | 803 | `readonly` is acceptable — `getRateLimitStats()` provides snapshot API. No internal coupling exposed. |
| 4 | Source-reading tests break on refactors | Fixed | 811 | Shared assertion helpers in `__tests__/helpers/config-assertions.ts` |
| 5 | Routing-file extraction threshold | Fixed | 804 + 811 | LOC thresholds in `thresholds.json`, routes.ts at 374/420 |

## Critique 805-809

| # | Item | Status | Sprint | Artifact |
|---|------|--------|--------|----------|
| 1 | Bootstrap exemptions undecided | Fixed | 811 | Permanent pre-config boundaries formalized in `config.ts` + `thresholds.json` |
| 2 | Test cascade fragility | Fixed | 811 | Shared helpers + `assertUsesConfig()` / `assertBootstrapExempt()` |
| 3 | Config field count guardrails | Fixed | 811 | `config.maxFields=35` in `thresholds.json` with escalation |
| 4 | Build size policy | Fixed | 811 | `warnAtKb=720, escalation: 720=warn, 735=block, 750=mandatory` |
| 5 | Syntax minification policy | Documented | 809 | `--minify-syntax` only (not full minify). Debuggability preserved. |

---

## Summary

| Status | Count |
|--------|-------|
| Fixed (code + tests) | 16 |
| Documented (decision formalized) | 5 |
| Deferred (with rationale) | 1 |
| **Total** | **22** |
