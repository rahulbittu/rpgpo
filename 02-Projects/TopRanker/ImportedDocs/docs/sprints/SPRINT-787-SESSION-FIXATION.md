# Sprint 787 — Session Fixation Prevention

**Date:** 2026-03-12
**Theme:** Regenerate session ID on all authentication endpoints
**Story Points:** 2 (security hardening)

---

## Mission Alignment

- **OWASP Top 10:** Session fixation is A07:2021 (Identification and Authentication Failures)
- **TestFlight readiness:** App Store review scrutinizes auth security
- **Trust:** Users must trust that their sessions cannot be hijacked

---

## Problem

All 4 authentication endpoints (signup, login, Google, Apple) called `req.login()` directly without regenerating the session ID. This is a **session fixation vulnerability**:

1. Attacker obtains a valid session ID (by visiting the site)
2. Attacker tricks victim into authenticating with that session ID
3. Victim's authenticated session now uses the attacker's known session ID
4. Attacker accesses the victim's account using the pre-known session ID

## Fix

Created a `safeLogin()` helper that calls `req.session.regenerate()` before `req.login()`. This issues a new session ID upon authentication, invalidating any pre-existing session ID.

Applied to all 4 login paths:
- `POST /api/auth/signup`
- `POST /api/auth/login`
- `POST /api/auth/google`
- `POST /api/auth/apple`

Graceful degradation: if `regenerate()` fails (rare), login proceeds with a warning log rather than blocking the user.

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "This is a textbook OWASP fix. Session fixation is one of those vulnerabilities that's easy to overlook because it requires a specific attack chain, but when exploited, it gives full account access. Regenerating the session ID on login is the standard mitigation."

**Amir Patel (Architecture):** "Good pattern with the `safeLogin` wrapper — it centralizes the fix so future auth endpoints automatically get session regeneration. The graceful degradation on regeneration failure is pragmatic."

**Sarah Nakamura (Lead Eng):** "Four auth endpoints, one helper function, zero risk of missing a path. The test verifies that `req.login` is only called inside `safeLogin` — any direct `req.login` in the future will fail the test."

**Jordan Blake (Compliance):** "Session management is specifically called out in SOC 2 Type II. This fix addresses a gap that would have been flagged in our next audit."

---

## Changes

| File | Change |
|------|--------|
| `server/routes-auth.ts` | Added `safeLogin()` helper with session.regenerate() |
| `server/routes-auth.ts` | Updated all 4 login endpoints to use safeLogin |
| `__tests__/sprint787-session-fixation.test.ts` | 10 tests |

---

## Tests

- **New:** 10 tests in `__tests__/sprint787-session-fixation.test.ts`
- **Total:** 13,333 tests across 592 files — all passing
- **Build:** 666.6kb (max 750kb)
