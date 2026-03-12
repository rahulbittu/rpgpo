# Critique Request — Sprints 726-729

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 726-729
**Theme:** Beta Observability Stack Completion

---

## Summary of Changes

### Sprint 726: Error Boundary Analytics
- `components/ErrorBoundary.tsx`: Added breadcrumb on crash (`addBreadcrumb("error_boundary", ...)`), analytics events for crash/retry/go-home, component stack capture (top 3 frames)
- 15 tests verifying error boundary instrumentation

### Sprint 727: Network Resilience
- `components/NetworkBanner.tsx`: Added breadcrumbs for offline/online transitions, analytics for `network_lost`/`network_recovered`
- `lib/perf-tracker.ts`: Added `recordApiError()` and `getRecentApiErrors()` — 50-entry buffer for API failure tracking
- 21 tests verifying network resilience tracking

### Sprint 728: API Timing Wiring
- `lib/query-client.ts`: Wired `recordApiCall()`, `recordApiError()`, and `addBreadcrumb()` into `apiRequest()` and query function
- Network-level failures recorded with status 0 (distinguishes "server error" from "no network")
- 12 tests verifying API timing wiring

### Sprint 729: Feedback Diagnostics + Console Hygiene
- `app/feedback.tsx`: Added `getPerfSummary()`, `getRecentApiErrors(5)`, and `getRecentBreadcrumbs(15)` to feedback submission payload
- `lib/sentry.ts`: All 5 console.log/error calls guarded with `__DEV__`
- `app/_layout.tsx`: Push token log guarded with `__DEV__`
- `vitest.config.ts`: Added `define: { __DEV__: true }` for test compatibility
- 17 tests verifying diagnostics and console hygiene

---

## Questions for Reviewer

1. **Diagnostic payload size:** Feedback now includes perf summary + 5 API errors + 15 breadcrumbs. Is this too much data per submission, or should we increase/decrease the limits?

2. **Sentry stub strategy:** All observability flows through a console stub. When we add a real Sentry DSN, the stubs become real without code changes. Is this the right abstraction, or should we have a more explicit "provider" pattern?

3. **Status 0 for network errors:** We use `recordApiError(endpoint, 0)` for network failures. Is status 0 a clean convention, or would a string like "NETWORK" be less ambiguous?

4. **Error Boundary component stack truncation:** We capture only the top 3 stack frames. Is this sufficient for debugging, or should we capture more?

5. **Console hygiene completeness:** We guarded sentry.ts and _layout.tsx push token log. Are there other production console statements we should audit?

---

## Health Metrics

| Metric | Sprint 725 | Sprint 729 | Delta |
|--------|-----------|-----------|-------|
| Tests | 12,510 | 12,575 | +65 |
| Test files | 536 | 540 | +4 |
| Build size | 662.3kb | 662.3kb | 0 |
| Schema LOC | 911 | 911 | 0 |

---

## Awaiting Response

Response expected in: `docs/critique/outbox/SPRINT-726-729-RESPONSE.md`
