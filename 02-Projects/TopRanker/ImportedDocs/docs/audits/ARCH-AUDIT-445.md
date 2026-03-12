# Architecture Audit #47 — Sprint 445

**Date:** 2026-03-10
**Auditor:** Amir Patel (Architecture)
**Scope:** Sprints 441–444
**Grade:** A

---

## Scorecard

| Severity | Count | Details |
|----------|-------|---------|
| Critical | 0 | — |
| High | 0 | — |
| Medium | 1 | rate/SubComponents at 91.2% (593/650) |
| Low | 1 | Re-export accumulation (2 files, unchanged) |

**Grade: A** — 47th consecutive A-range audit.

---

## Findings

### M-1: rate/SubComponents at 91.2% of 650 LOC threshold (WATCH)

**File:** `components/rate/SubComponents.tsx` — 593 LOC / 650 threshold = 91.2%
**Risk:** Medium — unchanged for 2 cycles, but approaching trigger
**History:** 593 (Audit #45) → 593 (Audit #46) → 593 (now)
**Trigger:** Extract at 620 LOC (or preemptively in Sprint 449)
**Recommendation:** Sprint 449 will extract dimension-specific components.

### L-1: Re-export pattern accumulation (unchanged)

**Files:** search/SubComponents re-exports MapView, leaderboard/SubComponents re-exports RankedCard
**Risk:** Low — manageable at 2 re-exports
**Threshold:** Forced migration at 3 re-exports

---

## Resolved from Audit #46

| Finding | Resolution | Sprint |
|---------|-----------|--------|
| M-1: profile.tsx at 87.4% | Extracted RatingHistorySection → 78.4% | 443 |
| M-2: Photo moderation in-memory | Migrated to DB (photo_submissions table) | 441 |

Both M findings from Audit #46 resolved in this cycle. Excellent closure rate.

---

## New Components (Sprints 441–444)

| Component | LOC | Purpose |
|-----------|-----|---------|
| components/profile/RatingHistorySection.tsx | 176 | Extracted from profile.tsx (Sprint 443) |
| components/business/ReviewSummaryCard.tsx | 281 | Aggregated review insights (Sprint 444) |

| Modified | LOC Change | Purpose |
|----------|-----------|---------|
| components/search/DiscoverFilters.tsx | 208→321 | DietaryTagChips + DistanceChips (Sprint 442) |
| server/photo-moderation.ts | 113→120 | DB-backed moderation (Sprint 441) |
| server/routes-businesses.ts | 282→323 | Haversine + dietary/distance filtering (Sprint 442) |
| shared/schema.ts | +25 | photoSubmissions table + dietaryTags column |

All new components well-sized, single-responsibility.

---

## File Health Summary

### Screen Files

| File | LOC | Threshold | % | Status | Change |
|------|-----|-----------|---|--------|--------|
| search.tsx | 711 | 900 | 79% | OK | +13 |
| profile.tsx | 627 | 800 | 78.4% | OK | -72 |
| rate/[id].tsx | 567 | 700 | 81% | OK | = |
| business/[id].tsx | 508 | 650 | 78.2% | OK | +4 |
| index.tsx | 423 | 600 | 70.5% | OK | = |
| challenger.tsx | 142 | 575 | 24.7% | OK | = |

### SubComponents

| File | LOC | Extract At | Status | Change |
|------|-----|-----------|--------|--------|
| search/SubComponents | 396 | 700 | OK | = |
| leaderboard/SubComponents | 313 | 650 | OK | = |
| rate/SubComponents | 593 | 650 | WATCH | = |
| rate/RatingExtrasStep | 514 | 600 | OK | = |
| rate/VisitTypeStep | 216 | 350 | OK | = |

### Type Safety

| Metric | Value | Threshold | Status |
|--------|-------|-----------|--------|
| `as any` (non-test) | 53 | <60 | OK |
| `as any` (client) | 12 | <15 | OK |

---

## Test Health

| Metric | Value | Change from #46 |
|--------|-------|-----------------|
| Test files | 339 | +5 |
| Tests | 8,152 | +167 |
| Duration | ~4.4s | Stable |
| Server build | 611.4kb | +2.8kb |
| DB tables | 32 | +1 (photo_submissions) |

---

## Recommendations for 446–450

1. **Dietary tag enrichment (Sprint 446)** — P1, search filters need data
2. **rate/SubComponents extraction (Sprint 449)** — preemptive, before 620 LOC trigger
3. **Monitor DiscoverFilters.tsx** — 321 LOC, growing; consider extraction if it crosses 400
4. **Monitor server build** — 611.4kb, growing ~3kb/cycle; healthy but track trend
5. **Re-export threshold** — still at 2, forced migration at 3

---

**Next audit:** Sprint 450
