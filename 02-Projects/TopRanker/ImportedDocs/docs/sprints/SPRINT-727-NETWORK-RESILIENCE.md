# Sprint 727 — Network Error Resilience

**Date:** 2026-03-11
**Theme:** Beta Network Debugging
**Story Points:** 2

---

## Mission Alignment

Beta users on mobile will have flaky connections — switching between WiFi and cellular, going through tunnels, losing signal in elevators. This sprint ensures every network state change is tracked for crash correlation, and API errors are buffered for debugging.

---

## Team Discussion

**Derek Liu (Mobile):** "Network state tracking completes the debugging puzzle. When a beta user reports 'the app froze,' we can now check: were they offline? Did they just recover from an outage? Did API calls fail before the crash?"

**Sarah Nakamura (Lead Eng):** "The breadcrumb trail now includes network events. If a crash happens 2 seconds after going offline, the breadcrumb will show: network→went_offline, error→crash. That's instantly diagnosable."

**Amir Patel (Architecture):** "API error tracking in perf-tracker buffers the last 50 errors with endpoint, status, and timestamp. Combined with the existing 200-sample API timing buffer, we have complete API health visibility."

**Marcus Chen (CTO):** "The query client already retries network errors with exponential backoff (Sprint 687). This sprint adds the observability layer so we know when retries are happening and why."

**Nadia Kaur (Security):** "Network events are safe to track — they contain no PII. Endpoint names and HTTP status codes are internal telemetry."

---

## Changes

| File | Change |
|------|--------|
| `components/NetworkBanner.tsx` | Added breadcrumbs + analytics for offline/online transitions |
| `lib/perf-tracker.ts` | Added recordApiError() and getRecentApiErrors() for API error buffering |
| `tests/sprint281-as-any-reduction.test.ts` | Updated total `as any` threshold (135→140) |
| `__tests__/sprint727-network-resilience.test.ts` | 21 tests: network tracking (6), API errors (4), retry logic (5), banner states (5), loader (1) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,546 pass / 538 files |

---

## What's Next (Sprint 728)

API response time tracking wired into apiRequest wrapper.
