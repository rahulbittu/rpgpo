# Critique Request — Sprints 795-799

**Date:** 2026-03-12
**Scope:** Governance + hardening closure + observability (Sprints 795-799)
**Requestor:** TopRanker Engineering

---

## Context

Sprint 800 is a milestone. We've run 24 consecutive hardening/polish sprints (776-799) taking security from ~85/100 to 98/100. All audit findings except one dev-only LOW are closed. The SLT has approved transition to reactive/user-feedback-driven mode post-TestFlight.

## Changes for Review

### Sprint 795 — Governance
- SLT-795 meeting, Arch Audit #795, critique request

### Sprint 796 — Push Token Store Size Limit
- `MAX_TOKENS_PER_MEMBER = 10` with oldest-eviction via `shift()`
- Closes Audit M1 (unbounded in-memory growth)

### Sprint 797 — Email FROM to config.ts
- Moved hardcoded `FROM_ADDRESS` to `config.emailFrom`
- All env-dependent server values now flow through config.ts

### Sprint 798 — Health Check Enhancements
- `/_ready`: Added `dbLatencyMs` (measures SELECT 1 round-trip)
- `/api/health`: Added `environment` and `push` stats

### Sprint 799 — Error Rate Tracking
- Logger counters: `errorCount`, `warnCount`, `lastErrorAt`, `lastWarnAt`
- Exposed via `getLogStats()` in `/api/health`

---

## Questions for External Review

1. **Push token eviction strategy:** We evict the oldest token via `shift()`. Should we instead evict the least-recently-used (by `lastUsed` timestamp)? The difference matters if a user has a mix of active and stale devices.

2. **Health endpoint information exposure:** `/api/health` is public and now returns error counts, push stats, and environment. Is any of this information a security risk? Should it be admin-only?

3. **Logger counter accuracy:** Counters increment even when `shouldLog()` returns false (i.e., debug-level messages that are suppressed in production). We intentionally count all errors regardless of output level. Is this the right design?

4. **DB latency measurement:** We use `Date.now()` which has ~1ms resolution. For a health probe, is this sufficient, or should we use `performance.now()` for sub-millisecond precision?

5. **Transition to reactive mode:** With 24 hardening sprints complete and 98/100 security score, the SLT has approved shifting to user-feedback-driven fixes. Are there any obvious gaps we should address before real users touch the app?

6. **routes.ts at 412/420 LOC:** The health endpoint enhancements pushed routes.ts close to its threshold. Should we extract health/readiness routes into a separate `routes-health.ts` module?

---

## Metrics

- **Tests:** 13,437 across 601 files (all passing)
- **Build:** 669.1kb (max 750kb)
- **Security Score:** 98/100
- **Audit Grade:** A (8+ consecutive)
- **Open Findings:** 1 LOW (dev-only seed.ts Unsplash URLs)
