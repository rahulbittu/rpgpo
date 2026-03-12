# Sprint 172: rate/[id].tsx Decomposition

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Decompose rate/[id].tsx from 898 to under 500 LOC

---

## Mission Alignment
The rating flow is the core action of TopRanker. A 900-line monolithic screen makes it hard to iterate on the rating UX. Decomposition enables focused changes without touching unrelated code.

---

## Team Discussion

**Marcus Chen (CTO):** "Second P0 from the SLT meeting closed. rate/[id].tsx drops from 898 to 450 lines — 50% reduction. Both recurring Medium audit findings are now resolved."

**Sarah Nakamura (Lead Eng):** "Two extractions: useRatingSubmit hook (129 lines — mutation, optimistic updates, badge detection, error mapping) and RatingExtrasStep component (302 lines — step 2 UI with dish selection, note, photo, score summary). The main screen now focuses on flow control and step 1 scoring."

**Priya Sharma (Design):** "Step 1 stays inline because it's the core scoring interaction — tight coupling with the main screen's state. Step 2 is self-contained 'extras' that can evolve independently. Clean separation."

**Amir Patel (Architecture):** "The useRatingSubmit hook follows the same pattern as useBadgeContext — custom hook in lib/hooks/. The RatingExtrasStep follows the existing components/rate/ pattern alongside SubComponents.tsx. No new patterns introduced."

**Nadia Kaur (Security):** "All error messages and validation logic preserved in the hook. The mutation's optimistic update rollback on error is unchanged. Security posture identical."

---

## Changes

### Extracted Modules
| Module | Lines | Content |
|--------|-------|---------|
| `lib/hooks/useRatingSubmit.ts` | 129 | Rating mutation, optimistic updates, error mapping, badge detection |
| `components/rate/RatingExtrasStep.tsx` | 302 | Step 2 UI: dish selection, note, photo upload, score summary |

### rate/[id].tsx (main screen)
- **Before:** 898 lines
- **After:** 450 lines (50% reduction, under 500 target)
- **Retained:** Step 1 scoring, flow control, animations, navigation, confirmation render

### Test Updates
- `tests/sprint159-rate-gating-ux.test.ts` updated to read error messages from `useRatingSubmit.ts`

---

## Test Results
- **22 new tests** for decomposition verification
- Full suite: **2,409 tests** across 105 files — all passing
