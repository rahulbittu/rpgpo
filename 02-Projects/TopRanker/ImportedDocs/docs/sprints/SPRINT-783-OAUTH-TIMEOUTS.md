# Sprint 783 — OAuth Fetch Timeouts

**Date:** 2026-03-12
**Theme:** Add request timeouts to Google OAuth calls + fix missing logger import
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **TestFlight readiness:** OAuth calls without timeouts could hang the login flow indefinitely on poor networks
- **Consistency:** Apple JWKS already had 10s timeout; Google OAuth calls were unprotected

---

## Problem

`server/auth.ts` had two Google OAuth `fetch()` calls with no timeout:
1. `oauth2.googleapis.com/tokeninfo` — ID token verification (web flow)
2. `googleapis.com/oauth2/v3/userinfo` — access token user info (native flow)

If Google's servers are slow or unreachable, these calls would hang forever, blocking the auth response and potentially exhausting server connections.

Additionally, `log.tag("AppleAuth")` was used for Apple JWKS logging but the `log` import was missing — would cause a runtime error on first Apple Sign-In attempt.

## Fix

1. Added `AbortSignal.timeout(10000)` to both Google OAuth fetch calls (matching Apple JWKS pattern)
2. Added missing `import { log } from "./logger"` for Apple auth logging

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "Unbounded fetch calls are a denial-of-service vector. If Google's endpoint goes slow, every login attempt would pin a connection. 10 seconds is generous but correct for an auth flow."

**Amir Patel (Architecture):** "Good catch on the missing logger import. That would have been a silent crash on the first Apple Sign-In in production — caught before any user hit it."

**Derek Okonkwo (Mobile):** "On cellular networks, Google's tokeninfo endpoint can be unpredictable. Without a timeout, the login spinner would just spin forever. Users would kill the app."

**Sarah Nakamura (Lead Eng):** "This completes our fetch timeout audit — Sprint 776 added client-side timeouts, Sprint 783 closes server-side OAuth. Every external fetch now has a deadline."

---

## Changes

| File | Change |
|------|--------|
| `server/auth.ts` | Added `AbortSignal.timeout(10000)` to Google tokeninfo + userinfo fetch |
| `server/auth.ts` | Added missing `import { log } from "./logger"` |
| `__tests__/sprint783-oauth-timeouts.test.ts` | 8 tests |

---

## Tests

- **New:** 8 tests in `__tests__/sprint783-oauth-timeouts.test.ts`
- **Total:** 13,297 tests across 588 files — all passing
- **Build:** 665.9kb (max 750kb)
