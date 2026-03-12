# Sprint 687 — Network Error Handling & Retry Logic

**Date:** 2026-03-11
**Theme:** Smart Retry Logic for First TestFlight Beta
**Story Points:** 3

---

## Mission Alignment

Before TestFlight goes to real users, network errors need to be handled gracefully. A user on a flaky cellular connection shouldn't see cryptic errors or infinite loading spinners. This sprint adds intelligent retry logic that distinguishes between recoverable network failures and permanent client errors.

---

## Team Discussion

**Marcus Chen (CTO):** "The difference between a polished app and a frustrating one often comes down to how it handles the unhappy path. Users on DART or sitting in Frisco traffic will hit network blips constantly. Smart retry turns those invisible — but we must never retry a 401 or 404, that's just wasting battery and annoying the user."

**Sarah Nakamura (Lead Eng):** "The `shouldRetry` function is clean — two lines of logic that cover all cases. Client errors (4xx) bail immediately, everything else gets two attempts with exponential backoff capped at 5 seconds. React Query's retry infrastructure does the heavy lifting."

**Amir Patel (Architecture):** "I like that error messages now carry the status code prefix (`401: Unauthorized`). That pattern lets `shouldRetry` parse the error category without needing a custom error class. The `throwIfResNotOk` function already formats errors this way, so no new plumbing was needed."

**Dev Sharma (Mobile):** "Exponential backoff with a 5-second cap is the right call. First retry at 1s, second at 2s, then we give up. For a restaurant ranking app, anything longer means the user has already swiped away. The cap prevents absurd waits on repeated failures."

**Nadia Kaur (Security):** "Important that mutations don't retry — a failed POST to submit a rating should not silently re-submit. Only reads (queries) get the retry treatment. This prevents duplicate rating submissions from network retries."

---

## Changes

| File | Change |
|------|--------|
| `lib/query-client.ts` | Added `shouldRetry()` function — skips 4xx, limits to 2 attempts |
| `lib/query-client.ts` | Exponential backoff: `2^attemptIndex * 1000ms`, capped at 5000ms |
| `lib/query-client.ts` | Mutations explicitly set `retry: false` |

### Smart Retry Decision Matrix

| Error Type | Example | Retry? | Reason |
|-----------|---------|--------|--------|
| Network failure | Failed to fetch | Yes (2x) | Transient, likely recoverable |
| 5xx server error | 500: Internal Server Error | Yes (2x) | Server may recover |
| 401 Unauthorized | 401: Unauthorized | No | Auth issue, retry won't help |
| 403 Forbidden | 403: Forbidden | No | Permission issue |
| 404 Not Found | 404: Not Found | No | Resource doesn't exist |
| 422 Validation | 422: Validation failed | No | Client sent bad data |
| Mutation failure | POST /api/ratings | No | Prevent duplicate submissions |

### Retry Timing

| Attempt | Delay | Cumulative |
|---------|-------|------------|
| 1st retry | 1,000ms | 1s |
| 2nd retry | 2,000ms | 3s |
| Give up | — | 3s total |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 11,898 pass / 506 files |

---

## What's Next (Sprint 688)

NetworkBanner polish — animate transitions, add offline detection with NetInfo, and wire up the banner to the app layout.
