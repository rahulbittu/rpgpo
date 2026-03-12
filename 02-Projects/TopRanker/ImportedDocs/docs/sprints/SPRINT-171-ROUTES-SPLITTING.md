# Sprint 171: routes.ts Domain Splitting

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Split routes.ts from 961 lines into domain-specific route modules

---

## Mission Alignment
Clean architecture enables fast iteration. A 961-line routes.ts was approaching the 1000 LOC CI limit and made route discovery difficult. Domain splitting makes each module independently readable and testable.

---

## Team Discussion

**Marcus Chen (CTO):** "This was the #1 P0 item from the SLT meeting. routes.ts has been a Medium finding in 6 consecutive audits. Today we close it permanently — 961 lines down to 324."

**Amir Patel (Architecture):** "Three new modules extracted: routes-auth.ts (256 lines — auth + GDPR), routes-members.ts (248 lines — all member endpoints), routes-businesses.ts (162 lines — business CRUD + dashboard). routes.ts retains SSE, leaderboard, featured, ratings, challengers, trending, and orchestration."

**Sarah Nakamura (Lead Eng):** "The extraction pattern is identical to our existing routes-admin.ts, routes-dishes.ts, routes-payments.ts, routes-badges.ts, and routes-experiments.ts. Each domain module exports a `registerXRoutes(app)` function. 11 test files needed updates to reference the new file paths — all 2387 tests pass."

**Nadia Kaur (Security):** "Auth rate limiting, requireAuth middleware, and GDPR compliance all preserved exactly. No security posture change from this refactor."

**Jordan Blake (Compliance):** "GDPR endpoints (export, deletion, cancellation) are now co-located in routes-auth.ts with the auth flow. This makes compliance auditing easier — one file to review for all account lifecycle endpoints."

**Priya Sharma (Design):** "No UI changes this sprint. Clean backend-only refactor."

---

## Changes

### Extracted Route Modules
| Module | Endpoints | Lines |
|--------|-----------|-------|
| routes-auth.ts | signup, login, google, logout, /auth/me, export, deletion (6 GDPR endpoints) | 256 |
| routes-members.ts | avatar, me, email, profile update, username, impact, push-token, notifications (9 endpoints) | 248 |
| routes-businesses.ts | search, slug, ratings, claim, dashboard, rank-history (6 endpoints) | 162 |

### routes.ts (core orchestrator)
- **Before:** 961 lines
- **After:** 324 lines (66% reduction)
- **Retained:** SSE, health, leaderboard, featured, categories, ratings, challengers, trending, category suggestions, webhooks, misc
- **Imports:** All 8 extracted route modules registered via `registerXRoutes(app)` pattern

### Test Updates
- 11 test files updated to reference correct route module files
- server/tier-staleness.ts TIER_SEMANTICS file references updated for routes-members.ts and routes-auth.ts

---

## Test Results
- **53 new tests** for route splitting verification (file sizes, exports, endpoint coverage)
- Full suite: **2,387 tests** across 104 files — all passing, 1.78s
