# Tier/Credibility Path Audit — Sprint 141

**Date:** 2026-03-08
**Auditor:** Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Scope:** Every read, write, and compute path that touches `credibilityTier` or `credibilityScore`

---

## Summary

Enumerated **19 distinct code paths** that read, write, or compute member tier/credibility data. Before this sprint, **5 paths** could serve stale tier data because they read from the database or session without invoking `checkAndRefreshTier` or `recalculateCredibilityScore`. All 5 gaps have been closed.

---

## WRITE Paths (tier/score persisted to DB)

| # | Location | Function | Freshness Check | Status |
|---|----------|----------|----------------|--------|
| W1 | `server/storage/members.ts:213-216` | `recalculateCredibilityScore` — writes `credibilityScore` + `credibilityTier` after full recalc | `checkAndRefreshTier` called at line 207; `getTierFromScore` gate at line 193 | OK |
| W2 | `server/storage/members.ts:100-109` | `updateMemberStats` — writes `totalRatings`, `totalCategories`, etc. (no tier write) | N/A — does not touch tier fields | OK |
| W3 | `server/tier-staleness.ts:90-94` | `refreshStaleTiers` (batch) — corrects stale tiers in DB | Uses `isTierStale` + `getCredibilityTier` | OK |
| W4 | `server/storage/ratings.ts:216` | `submitRating` — calls `recalculateCredibilityScore` which writes tier | Inherits W1 freshness | OK |

## READ Paths (tier/score returned to client)

| # | Location | Endpoint / Function | Freshness Check | Status |
|---|----------|---------------------|----------------|--------|
| R1 | `server/routes.ts:617-654` | `GET /api/members/me` | `recalculateCredibilityScore` + `checkAndRefreshTier` | OK |
| R2 | `server/routes.ts:576-615` | `POST /api/ratings` (response) | `submitRating` calls `recalculateCredibilityScore`; route adds `checkAndRefreshTier` guard | OK |
| R3 | `server/routes.ts:656-674` | `GET /api/members/:username` | **GAP CLOSED (Sprint 141)** — added `checkAndRefreshTier` | FIXED |
| R4 | `server/routes.ts:246-251` | `GET /api/auth/me` | Returns `req.user` from session. Session populated by deserializer (see R9). | OK (via R9) |
| R5 | `server/routes.ts:178-196` | `POST /api/auth/signup` (response) | Reads from freshly created member (default tier, score=10). Correct by construction. | OK |
| R6 | `server/routes.ts:210-237` | `POST /api/auth/google` (response) | Reads from DB or freshly created member. For existing members, session refresh via R9 on next request. | ACCEPTABLE |
| R7 | `server/routes.ts:256-291` | `GET /api/account/export` | **GAP CLOSED (Sprint 141)** — added `checkAndRefreshTier` | FIXED |
| R8 | `server/routes-admin.ts:140-144` | `GET /api/admin/members` | **GAP CLOSED (Sprint 141)** — added `checkAndRefreshTier` per member | FIXED |
| R9 | `server/auth.ts:86-104` | `passport.deserializeUser` (populates `req.user` for every authenticated request) | **GAP CLOSED (Sprint 141)** — added `checkAndRefreshTier` | FIXED |
| R10 | `server/storage/businesses.ts:310-326` | `getBusinessRatings` — joins `members.credibilityTier` as `memberTier` | Display-only field on rating cards. Acceptable lag; freshness not required for historical ratings. | ACCEPTABLE |
| R11 | `server/storage/badges.ts:80-94` | `getBadgeLeaderboard` — joins `members.credibilityTier` | Display-only on leaderboard. Acceptable lag. | ACCEPTABLE |
| R12 | `server/routes.ts:556-557` | `GET /api/businesses/:slug/dashboard` — shows `memberTier` on recent ratings | Inherits from R10 (display-only on historical ratings) | ACCEPTABLE |

## COMPUTE Paths (tier/score used in calculations)

| # | Location | Usage | Freshness Check | Status |
|---|----------|-------|----------------|--------|
| C1 | `server/storage/ratings.ts:126` | `submitRating` — `getVoteWeight(member.credibilityScore)` for rating weight | Score read from DB just before use; `recalculateCredibilityScore` runs after. Weight uses current DB value. | OK |
| C2 | `server/storage/members.ts:193` | `recalculateCredibilityScore` — `getTierFromScore(score, ...)` for gate-based tier | Computed from live data within the recalc function | OK |
| C3 | `server/storage/members.ts:207` | `recalculateCredibilityScore` — `checkAndRefreshTier(member.credibilityTier, score)` for staleness log | Pure function, runs every recalc | OK |
| C4 | `shared/credibility.ts:11` | `getVoteWeight(credibilityScore)` — pure function used by C1 | Stateless pure function; correctness depends on caller providing fresh score | OK |
| C5 | `lib/badges.ts:775-777` | Badge evaluation — uses `credibilityScore` for tier badges | Client-side; data comes from `/api/members/me` which has freshness check | OK |

## Email / Async Paths (tier data consumed but not mutated)

| # | Location | Usage | Freshness | Status |
|---|----------|-------|-----------|--------|
| E1 | `server/email-weekly.ts:22-44` | Weekly digest — displays `credibilityTier` | Caller must provide fresh data. If called after `recalculateCredibilityScore`, correct. | ACCEPTABLE |
| E2 | `server/email-drip.ts:137-172` | Day-30 email — displays `currentTier` and `credibilityScore` | Caller must provide fresh data. | ACCEPTABLE |

## Client-Side Paths (read-only, display)

| # | Location | Usage | Status |
|---|----------|-------|--------|
| CL1 | `app/(tabs)/profile.tsx:73,83,87` | Profile screen — reads `profile.credibilityTier/Score` | Data from `GET /api/members/me` (R1, freshness-checked) | OK |
| CL2 | `app/(tabs)/challenger.tsx:399-408` | Challenger screen — displays user tier weight | Data from auth context (R4 -> R9, freshness-checked) | OK |
| CL3 | `app/business/[id].tsx:467` | Business detail — shows user tier | Data from auth context | OK |
| CL4 | `app/rate/[id].tsx:80,113-114,283-284` | Rating screen — shows user tier/weight | Data from auth context + `getCredibilityTier` pure function | OK |
| CL5 | `app/admin/index.tsx:366-368` | Admin panel — shows member tiers | Data from `GET /api/admin/members` (R8, freshness-checked) | OK |

---

## Gaps Found and Closed

### GAP 1: `GET /api/members/:username` (R3)
**Risk:** Public profile returned `member.credibilityTier` directly from DB without freshness check. If score changed but tier wasn't recalculated, stale tier was served.
**Fix:** Added `checkAndRefreshTier(member.credibilityTier, member.credibilityScore)` before returning.
**File:** `server/routes.ts`

### GAP 2: `GET /api/account/export` (R7)
**Risk:** GDPR data export included raw `credibilityTier` from DB. A stale tier in an export could be a compliance issue if tier affects data interpretation.
**Fix:** Added `checkAndRefreshTier` call before building export payload.
**File:** `server/routes.ts`

### GAP 3: `GET /api/admin/members` (R8)
**Risk:** Admin member list showed raw tier from DB. Admins making decisions based on stale tier data could lead to incorrect actions.
**Fix:** Added `checkAndRefreshTier` per member in the response mapping.
**File:** `server/routes-admin.ts`

### GAP 4: `passport.deserializeUser` (R9)
**Risk:** Every authenticated request populated `req.user.credibilityTier` from DB without freshness check. This meant `GET /api/auth/me` and any code reading `req.user` could use a stale tier.
**Fix:** Added `checkAndRefreshTier` in the deserializer so all session-based tier reads are fresh.
**File:** `server/auth.ts`

### GAP 5 (Accepted): `getBusinessRatings` and `getBadgeLeaderboard` (R10, R11)
**Risk:** Historical rating cards and badge leaderboard show `memberTier` from DB join. Could be stale.
**Decision:** ACCEPTED. These are display-only contexts showing historical data. Adding freshness checks here would require N additional function calls per page load with minimal user impact. The batch `refreshStaleTiers` job covers this in steady state.

---

## Conclusion

All **5 identified gaps** have been addressed:
- 4 gaps closed with targeted `checkAndRefreshTier` calls
- 1 gap accepted as low-risk display-only context

The tier staleness integration is now **CLOSED**. Every code path that returns tier data to a client either:
1. Runs `recalculateCredibilityScore` (which includes freshness checks), or
2. Runs `checkAndRefreshTier` on the stored tier before returning, or
3. Is a display-only historical context where staleness is acceptable
