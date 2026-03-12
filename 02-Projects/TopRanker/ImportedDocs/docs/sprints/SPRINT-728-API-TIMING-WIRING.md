# Sprint 728 — API Timing + Error Wiring

**Date:** 2026-03-11
**Theme:** Performance Observability
**Story Points:** 2

---

## Mission Alignment

Sprint 718 created the perf-tracker and Sprint 727 added API error buffering, but neither was wired into the actual API request layer. This sprint connects all the dots: every API call is now timed, every error is recorded, and every failure adds a breadcrumb.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This is the wiring sprint. recordApiCall and recordApiError existed but weren't called. Now every apiRequest and every React Query fetch records timing and errors automatically."

**Derek Liu (Mobile):** "Network-level failures (no response at all) get status 0 in the error buffer. This distinguishes 'server returned 500' from 'couldn't reach the server' — critical for mobile debugging."

**Amir Patel (Architecture):** "The breadcrumb on error responses includes the endpoint, status, and duration. If a user reports a problem, we can see: 'GET /api/leaderboard → 500 (2340ms)' in the breadcrumb trail."

**Marcus Chen (CTO):** "With this sprint, the performance monitoring pipeline is fully wired: startup timing (Sprint 718), API timing (Sprint 728), error buffering (Sprint 727), and breadcrumbs on every failure. Zero gaps."

---

## Changes

| File | Change |
|------|--------|
| `lib/query-client.ts` | Wired recordApiCall, recordApiError, and addBreadcrumb into apiRequest and query function |
| `__tests__/sprint728-api-timing-wiring.test.ts` | 12 tests: imports (3), apiRequest timing (6), query function timing (2), loader (1) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,558 pass / 539 files |

---

## What's Next (Sprint 729)

Final pre-beta polish or Sprint 730 governance.
