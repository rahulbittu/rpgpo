# Sprint 139: wrapAsync Applied + Tier Staleness + Animation Integration

**Date:** 2026-03-08
**Sprint Duration:** 1 day
**Story Points Completed:** 21
**Theme:** Direct response to Sprint 138 external critique (3/10 score) — all 3 priorities closed

---

## Mission Alignment

This sprint exists because Sprint 138's external critique scored us 3/10. The critique identified three concrete gaps: wrapAsync was created but never applied, tier staleness had no detection mechanism, and animation components sat unused. Sprint 139 closes all three. Every change serves the trust mission — clean error handling protects users from leaking internals, tier staleness ensures vote weights reflect real credibility, and animations make the trust system tangible in the UI.

---

## Team Discussion (8 Members)

**Marcus Chen (CTO):** "This is the sprint that was supposed to happen last time. wrapAsync is now actually deployed, not just created. Every route file is covered. The error handling surface is clean and consistent. When I review the route files now, I see business logic — not 60 copies of the same catch block. That's what architecture work is supposed to deliver."

**Amir Patel (Architecture):** "Tier staleness detection is the right primitive. The pure function separation — `isTierStale` and `checkAndRefreshTier` — means we can unit test without DB mocks, and the batch refresh via `refreshStaleTiers` is ready for a cron job. I'd recommend running it on a daily schedule. The separation between pure logic and DB operations follows the same pattern we used in the shared credibility module."

**Sarah Nakamura (Lead Eng):** "60+ catch blocks removed across 5 files. The diff is -728/+1136 but net complexity is way down. Routes read like business logic now, not error-handling boilerplate. The 4 routes that keep inner try/catch — auth signup, Google return, ratings, and category suggestions — do so intentionally because they return specific HTTP status codes (400, 403, 409) that wrapAsync's generic 500 would mask."

**Elena Rodriguez (Design):** "The animations are finally in the product. ScoreCountUp on the profile credibility score is exactly what I specced in Sprint 136. RankMovementPulse on business detail gives immediate visual feedback for rank changes. The staggered FadeInView on Rankings cards creates a reveal sequence that feels intentional, not instant. This is real UX, not scaffolding sitting in a components folder."

**Nadia Kaur (Cybersecurity):** "wrapAsync's headersSent check is the safety net I wanted. If a handler partially writes a response and then throws, we don't crash the process trying to write headers twice. Routes with custom auth error codes — 400 for bad credentials, 403 for suspended users — correctly keep their inner handlers. No security-relevant error paths were changed. The generic catch blocks we removed were actually a risk because they leaked `err.message` to clients."

**David Kim (QA):** "16 new tests, 1570 total across 71 files, all passing. Tier staleness tests cover every boundary crossing — promotion, demotion, exact boundaries, zero score, max score. The vote weight consistency regression tests ensure the shared credibility module stays correct as we add staleness detection on top of it. No flaky tests, no timeouts."

**Jasmine Taylor (Marketing):** "Finally can demo the app with animations. The staggered card reveals on the Rankings tab feel premium — like each restaurant is being presented, not dumped on screen. ScoreCountUp on the profile gives a 'your score matters' moment. When we demo to investors, the first 3 seconds of the app now communicate quality."

**Jordan Blake (Compliance):** "Tier staleness checks directly support our trust mission. If a user's tier changes and their old votes still carry the wrong weight, that's a data integrity issue. This module makes it auditable — `findStaleTierMembers` gives us a compliance query we can run on demand. GDPR doesn't require this, but trust transparency does."

---

## Changes Made

### 1. wrapAsync Applied to All Route Files (Architecture Cleanup Complete)

Applied `wrapAsync` from `server/wrap-async.ts` to ALL 5 route files:

| Route File | Handlers Converted | Catch Blocks Removed |
|---|---|---|
| `server/routes.ts` | 29 | 25 |
| `server/routes-admin.ts` | 21 | all |
| `server/routes-payments.ts` | 4 | all |
| `server/routes-badges.ts` | 4 | all |
| `server/routes-experiments.ts` | 2 | all |
| **Total** | **60** | **60+** |

**Exceptions (intentional inner try/catch retained):**
- Auth signup — returns 400 for invalid credentials
- Google OAuth return — returns 400 for failed OAuth
- Ratings submission — returns 403 (suspended) and 409 (duplicate)
- Category suggestions — returns 400 for malformed input

These 4 routes keep inner try/catch for custom HTTP status codes, with wrapAsync as the outer safety net for unexpected errors.

**Net result:** Zero generic `res.status(500).json({ error: err.message })` patterns remain. All unhandled errors flow through wrapAsync's centralized handler with headersSent protection.

### 2. Tier Data Staleness Detection (`server/tier-staleness.ts`)

New module with four functions:

- **`isTierStale(storedTier, currentScore)`** — Pure function. Returns boolean. Detects when a member's stored tier doesn't match the tier derived from their current credibility score.
- **`checkAndRefreshTier(storedTier, currentScore)`** — Pure function. Returns the correct tier for a given score. Used for single-member checks.
- **`findStaleTierMembers()`** — DB query. Returns all members whose stored tier doesn't match their score-derived tier. Ready for compliance audits.
- **`refreshStaleTiers()`** — Batch update. Corrects all stale tiers in one pass. Designed for cron job integration.

**Why this matters:** Vote weights are tier-dependent. If a user earns enough credibility to move from Silver to Gold but their stored tier isn't updated, their votes carry Silver weight. This module detects and corrects that drift, ensuring vote weights always reflect current credibility.

### 3. Animation Integration into Core Screens

**Rankings tab (`app/(tabs)/index.tsx`):**
- FadeInView with staggered delays (100ms increments) on leaderboard cards
- EmptyStateAnimation for categories with no ranked businesses

**Profile tab (`app/(tabs)/profile.tsx`):**
- ScoreCountUp for credibility score display (animates from 0 to current score)
- FadeInView on tier card
- SlideUpView on rating history section

**Business detail (`app/business/[id].tsx`):**
- ScoreCountUp for weighted trust score
- RankMovementPulse for rank delta indicator (green pulse up, red pulse down)
- SlideUpView with staggered delays for section reveals (reviews, photos, details)

---

## Testing

- **16 new tests** for tier staleness:
  - Boundary crossings (Silver→Gold, Gold→Platinum, etc.)
  - Exact boundary values (score exactly at tier threshold)
  - Demotions (tier stored higher than score warrants)
  - Edge cases (zero score, max score, negative score)
  - Vote weight consistency (stale tier produces wrong weight, refreshed tier produces correct weight)
- **1570 tests** across **71 files**, all passing

---

## External Critique Response

| Priority from Sprint 138 Critique | Status | Evidence |
|---|---|---|
| Apply wrapAsync to all routes | **CLOSED** | 60 handlers wrapped, 60+ catch blocks removed across 5 files |
| Tier data staleness checks | **CLOSED** | `server/tier-staleness.ts` with pure + DB functions, 16 tests |
| Integrate design components into core trust loop | **CLOSED** | ScoreCountUp, RankMovementPulse, FadeInView, SlideUpView integrated into Rankings, Profile, Business Detail |

**Critique score addressed:** All 3 items that contributed to the 3/10 score are now resolved with shipped code and tests.

---

## PRD Gaps Closed

- **P2:** Duplicated error handling across routes (flagged in Audit #11) — wrapAsync now applied everywhere
- **P2:** Client/server credibility logic drift (shared module completed Sprint 138, routes cleaned Sprint 139)
- **P2:** Tier data staleness for personalized vote weight (flagged in Retro 135 and external critique)

---

## Next Sprint Preview (Sprint 140 — SLT Meeting Sprint)

Sprint 140 falls on the SLT + Architecture meeting cadence (every 5 sprints: 105, 110, 115, 120, 125, 130, 135, 140).

**Meeting agenda:**
- Review Sprint 135-139 progress (shared credibility, wrapAsync, tier staleness, animations)
- Prioritize next 5 sprints (141-145)
- Consider: Hook tier staleness into credibility recalculation flow
- Consider: Add cron job for `refreshStaleTiers()` daily execution
- Consider: Architectural audit #12 (last was #11 at Sprint 135)
- Assess: External critique score improvement trajectory
