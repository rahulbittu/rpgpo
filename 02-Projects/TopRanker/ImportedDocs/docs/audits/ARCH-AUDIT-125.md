# Architectural Audit #125 — Sprint 670

**Date:** 2026-03-11
**Auditor:** Amir Patel (Architecture)
**Previous audit:** #120 (Sprint 665) — Grade A

---

## Automated Checks

| Metric | Value | Limit | Status |
|--------|-------|-------|--------|
| Server build size | 655.5kb | 750kb (87.4%) | PASS |
| Tests passing | 11,697 | — | PASS |
| Test files | 501 | — | PASS |
| Schema LOC | 935 | 950 | PASS |
| Tracked files | 33 | — | PASS |
| Tracked file violations | 0 | 0 | PASS |
| `as any` count | ≤130 | 130 | PASS |

All automated checks passing.

---

## Findings

| ID | Severity | Finding | Recommendation |
|----|----------|---------|----------------|
| A125-M1 | Medium | EAS project ID is placeholder `"topranker"`, not real Expo UUID | CEO needs to run `eas init` to get real project ID before any store submission |
| A125-M2 | Medium | `.env` file has production DATABASE_URL (Railway) in local dev config | Should use separate local DB for development; production credentials should not be in local `.env` |
| A125-L1 | Low | Notification push token uses placeholder projectId `"topranker"` | Update to real Expo project UUID after `eas init` completes |
| A125-L2 | Low | No environment-specific config switching (dev vs prod API URLs baked at build time) | EAS env vars handle this for native builds; web uses `window.location`. Formalize once UAT exists |

---

## Module Health

### New Since Audit #120

- **offline-sync-service.ts** (85 LOC) — Clean service with queue/persist/sync cycle. 3-retry cap is reasonable. No memory leaks detected.
- **EAS preview profile** — Properly configured in `eas.json`. Points to production API (acceptable until UAT exists).
- **Native gesture configs** — Extracted `modalOpts`/`cardOpts` shared configs reduce duplication across screen options.
- **Apple JWKS verification** — 1-hour cache TTL, kid matching, issuer validation. Follows Apple's recommended verification flow.

### Auth Surface (Complete)

- Google OAuth (web + iOS client IDs)
- Apple Sign-In (JWKS verification, signup + login)
- Email/password (bcrypt hashing, session cookies)

### Areas Unchanged

- Rating integrity engine: stable, no modifications since Sprint 665
- Score calculation: weighted average pipeline unchanged
- City context + bookmarks: no changes
- Search/discover: stable at 588/600 LOC

---

## Technical Debt

| Item | Priority | Notes |
|------|----------|-------|
| EAS project ID placeholder | P1 | Blocks real push notifications and store submission |
| Production DB in local .env | P1 | Risk of accidental local writes to production |
| Environment config formalization | P2 | Blocked on CEO setting up Railway dev/UAT |
| In-memory session store | P2 | Known since Audit #115, acceptable for current scale |

---

## Summary

- **Critical:** 0
- **High:** 0
- **Medium:** 2
- **Low:** 2

**Grade: A** (73rd consecutive)

**Grade trajectory:** ...A → A → A → A → A → A

The codebase remains clean. The two medium findings are both environment/config issues that resolve once the CEO completes EAS setup and Railway environment provisioning. No architectural concerns with the new modules — offline sync and Apple auth are well-scoped and properly tested.

---

**Next audit:** Sprint 675 (Audit #130)
