# Architecture Audit #46 — Sprint 440

**Date:** 2026-03-10
**Auditor:** Amir Patel (Architecture)
**Scope:** Sprints 436–439
**Grade:** A

---

## Scorecard

| Severity | Count | Details |
|----------|-------|---------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 2 | profile.tsx at 87.4%; photo moderation in-memory |
| Low | 1 | Re-export accumulation (2 files) |

**Grade: A** — 46th consecutive A-range audit.

---

## Findings

### M-1: profile.tsx at 87.4% of 800 LOC threshold (WATCH)

**File:** `app/(tabs)/profile.tsx` — 699 LOC / 800 threshold = 87.4%
**Risk:** Medium — grew +9 LOC from Sprint 437 (ActivityTimeline integration)
**History:** 684 (Audit #44) → 690 (Audit #45) → 699 (now)
**Trigger:** Extract at 720 LOC (set in Retro 435)
**Recommendation:** Sprint 443 will extract rating history section. Should reduce to ~650 LOC.

### M-2: Photo moderation in-memory store (NEW)

**File:** `server/photo-moderation.ts` — uses `Map<string, PhotoSubmission>`
**Risk:** Medium — server restart loses all pending photo submissions
**Context:** Sprint 438 added community photo upload that routes through this queue
**Recommendation:** Sprint 441 will migrate to DB persistence. P1 before marketing push.

### L-1: Re-export pattern accumulation (unchanged)

**Files:** search/SubComponents re-exports MapView, leaderboard/SubComponents re-exports RankedCard
**Risk:** Low — manageable at 2 re-exports
**Threshold:** Forced migration at 3 re-exports

---

## Resolved from Audit #45

| Finding | Resolution | Sprint |
|---------|-----------|--------|
| None — no findings required resolution | — | — |

(Audit #45 had M-1 profile.tsx and L-1 re-export — both unchanged, monitoring continues.)

---

## New Components (Sprints 436–439)

| Component | LOC | Purpose |
|-----------|-----|---------|
| components/profile/ActivityTimeline.tsx | 344 | Unified timeline: ratings + bookmarks + achievements (Sprint 437) |
| components/business/PhotoUploadSheet.tsx | 349 | Community photo upload: picker, preview, submit (Sprint 438) |

| Modified | LOC Change | Purpose |
|----------|-----------|---------|
| server/search-ranking-v2.ts | 168→~260 | Multi-signal relevance scoring (Sprint 436) |
| components/rate/VisitTypeStep.tsx | 110→216 | Dimension tooltips with weights (Sprint 439) |
| server/routes-businesses.ts | 231→282 | Community photo upload endpoint (Sprint 438) |

All new components well-sized, single-responsibility.

---

## File Health Summary

### Screen Files

| File | LOC | Threshold | % | Status | Change |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | OK | = |
| profile.tsx | 699 | 800 | 87.4% | WATCH | +9 |
| rate/[id].tsx | 567 | 700 | 81% | OK | +13 |
| business/[id].tsx | 504 | 650 | 77.5% | OK | +10 |
| index.tsx | 423 | 600 | 70.5% | OK | +1 |
| challenger.tsx | 142 | 575 | 24.7% | OK | = |

### SubComponents

| File | LOC | Extract At | Status | Change |
|------|-----|-----------|--------|--------|
| search/SubComponents | 396 | 700 | OK | = |
| leaderboard/SubComponents | 313 | 650 | OK | = |
| rate/SubComponents | 593 | 650 | OK | = |
| rate/RatingExtrasStep | 514 | 600 | OK | = |
| rate/VisitTypeStep | 216 | 350 | OK | +106 |

### Type Safety

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| `as any` (non-test) | 53 | <60 | OK |
| `as any` (client) | 12 | <15 | OK |

---

## Test Health

| Metric | Value | Change from #45 |
|--------|-------|-----------------|
| Test files | 334 | +4 |
| Tests | 7,985 | +163 |
| Duration | ~4.3s | Stable |
| Server build | 608.6kb | +7.5kb |
| DB tables | 31 | = |

---

## Recommendations for 441–445

1. **Photo moderation DB migration (Sprint 441)** — P1, production requirement
2. **Profile extraction (Sprint 443)** — extract rating history section before 720 LOC trigger
3. **Monitor rate/SubComponents** — stable at 593/650 (91.2%), no change this cycle
4. **IoniconsName deduplication** — now in 4 files; consider central export
5. **Server build monitoring** — 608.6kb, growing ~4kb/cycle; still healthy but track trend

---

**Next audit:** Sprint 445
