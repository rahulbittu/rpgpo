# Sprint 781 — Mock Auth Guard

**Date:** 2026-03-12
**Theme:** Guard demo user fallback with __DEV__ check
**Story Points:** 1 (bug fix / hardening)

---

## Mission Alignment

- **TestFlight readiness:** Production users must never see fake demo data
- **Rating integrity:** A fake user could trigger real ratings in the system

---

## Problem

When the backend was unreachable (e.g., network error), `auth-context.tsx` fell back to a hardcoded "Alex Demo" user with `credibilityTier: "trusted"`. This was not guarded by `__DEV__`.

**Impact in production:** A TestFlight user who lost network for a moment would:
1. See "Alex Demo" as their profile name
2. Potentially submit ratings as a fake user
3. Have "trusted" tier credibility (0.70x weight) applied to those ratings

## Fix

Wrapped the demo user fallback in `if (__DEV__)`. Production now sets `user: null` (logged-out state) when the backend is unreachable, which shows the login screen.

---

## Team Discussion

**Nadia Kaur (Cybersecurity):** "This is a security issue. A fake trusted-tier user could submit ratings that carry 70% weight. That violates the entire credibility system."

**Sarah Nakamura (Lead Eng):** "Good catch. The catch block was added early for development convenience and never got a production guard. Classic 'it works on my machine' issue."

**Marcus Chen (CTO):** "One line of code could have undermined the entire rating system. This is why we do hardening sprints."

**Derek Okonkwo (Mobile):** "In TestFlight, this would manifest as a user seeing 'Alex Demo' briefly when toggling airplane mode. Confusing and breaks trust."

---

## Changes

| File | Change |
|------|--------|
| `lib/auth-context.tsx` | Demo user fallback guarded by `__DEV__`, production → `setUser(null)` |
| `__tests__/sprint781-mock-auth-guard.test.ts` | 6 tests |

---

## Tests

- **New:** 6 tests in `__tests__/sprint781-mock-auth-guard.test.ts`
- **Total:** 13,278 tests across 586 files — all passing
- **Build:** 666.0kb (max 750kb)
