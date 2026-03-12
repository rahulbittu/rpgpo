# Sprint 788 — Logout Session Destroy

**Date:** 2026-03-12
**Theme:** Properly destroy session and clear cookie on logout
**Story Points:** 1 (security hardening)

---

## Mission Alignment

- **Session management:** Logout should fully invalidate the session, not leave stale records
- **OWASP compliance:** Proper session termination is part of A07:2021

---

## Problem

The logout endpoint only called `req.logout()` (Passport's de-authentication), but did NOT:
1. Destroy the server-side session record in PostgreSQL
2. Clear the `connect.sid` cookie from the browser

This meant:
- The session record persisted in the `session` table until it expired (30 days)
- The browser still had the session cookie, which could theoretically be reused
- Server resources wasted storing dead session records

## Fix

After `req.logout()`, now calls `req.session.destroy()` to remove the server-side record, then `res.clearCookie("connect.sid")` to clear the browser cookie.

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "This completes the session lifecycle hardening from Sprint 787. Regenerate on login, destroy on logout — full coverage."

**Amir Patel (Architecture):** "The destroy call cleans up the PostgreSQL session table. Without it, we'd accumulate stale session records for 30 days per logout."

**Derek Okonkwo (Mobile):** "On mobile, users often logout before switching accounts. The stale cookie could cause confusion if the old session wasn't fully cleared."

**Sarah Nakamura (Lead Eng):** "Small fix, big impact. Sprint 787 + 788 together give us a complete session security story."

---

## Changes

| File | Change |
|------|--------|
| `server/routes-auth.ts` | Added session.destroy() + clearCookie on logout |
| `__tests__/sprint788-logout-session-destroy.test.ts` | 6 tests |

---

## Tests

- **New:** 6 tests in `__tests__/sprint788-logout-session-destroy.test.ts`
- **Total:** 13,339 tests across 593 files — all passing
- **Build:** 666.8kb (max 750kb)
