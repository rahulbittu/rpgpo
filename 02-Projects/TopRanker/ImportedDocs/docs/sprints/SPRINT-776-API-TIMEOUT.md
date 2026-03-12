# Sprint 776 — API Request Timeout

**Date:** 2026-03-12
**Theme:** Add request timeout for mobile network resilience
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **TestFlight readiness:** Mobile users on cellular networks need graceful timeout handling
- **Constitution #3:** Fast structured input — can't be fast if requests hang forever

---

## Problem

`fetch()` calls in `lib/query-client.ts` had no timeout. On slow or dead connections, requests would hang indefinitely, freezing the UI with no feedback to the user.

## Fix

Added 15-second `AbortController` timeout to both `apiRequest()` and `getQueryFn()` fetch calls. On timeout:
- Throws descriptive "Request timed out after 15s" error
- Records breadcrumb distinguishing TIMEOUT from NETWORK_ERROR
- React Query retry logic kicks in (1 retry for non-4xx errors)

---

## Team Discussion

**Derek Okonkwo (Mobile):** "This is critical for TestFlight. Beta testers on cellular will hit slow connections. Without timeout, the app just spins forever."

**Sarah Nakamura (Lead Eng):** "15 seconds is a good balance — long enough for slow API responses, short enough that users don't wait forever. The retry logic gives a second chance."

**Amir Patel (Architecture):** "AbortController is the right pattern. Clean, standard, and works with both web and React Native fetch implementations."

**Marcus Chen (CTO):** "Good that the breadcrumb distinguishes timeout from network error. When we review Sentry logs, we'll know if users are experiencing slow responses vs. no connection."

---

## Changes

| File | Change |
|------|--------|
| `lib/query-client.ts` | Added `API_TIMEOUT_MS` constant, `AbortController` to both fetch paths, timeout-specific error messaging |
| `__tests__/sprint776-api-timeout.test.ts` | 12 tests |

---

## Tests

- **New:** 12 tests in `__tests__/sprint776-api-timeout.test.ts`
- **Total:** 13,236 tests across 582 files — all passing
- **Build:** 665.8kb (max 750kb)
