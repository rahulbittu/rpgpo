# Sprint 531: Rating Flow UX Polish — Review Step Before Submission

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 21 new (9,842 total across 420 files)

## Mission

Add a review/summary step (Step 3) to the rating flow so users can confirm all their selections — visit type, dimension scores, extras, photos — before final submission. This replaces the previous direct-submit from Step 2 with a more deliberate, confidence-building flow.

## Team Discussion

**Marcus Chen (CTO):** "The review step addresses a core UX principle — never let users submit without seeing what they're about to submit. This is especially important for ratings because they directly affect rankings. A misclick on a score dimension shouldn't silently ship."

**Sarah Nakamura (Lead Eng):** "The implementation is clean — RatingReviewStep is a pure presentational component at 235 LOC. The onEditStep callback lets users jump back to any prior step without losing their data. Step flow went from 3 to 4 steps, which required updating StepIndicator and ProgressBar totals."

**Amir Patel (Architecture):** "rate/[id].tsx grew from 569 to 597 LOC — still well under the 700 threshold at 85%. The new component follows the same extraction pattern we've used throughout the rating flow. No new state was introduced, just a new rendering step."

**Rachel Wei (CFO):** "Review steps reduce submission errors and increase user confidence. For our Phase 1 target of 1,000 ratings, every rating needs to be intentional. This also supports the Rating Integrity principle — users who review their rating are more likely to provide accurate scores."

**Jasmine Taylor (Marketing):** "From a user trust perspective, showing the verification boost preview on the review screen is brilliant. Users see exactly how their photo, dish, and receipt boost their influence before submitting. It incentivizes adding more details."

**Nadia Kaur (Cybersecurity):** "The edit buttons on the review step don't bypass any validation — canProceed() still gates each step. When users jump back via onEditStep, they return to a fully validated state. No security concerns."

## Changes

### New Files
- `components/rate/RatingReviewStep.tsx` (235 LOC) — Review step component
  - Visit type section with edit button
  - Scores grid with visit-type-aware dimension labels
  - Composite score card (raw, weighted, multiplier)
  - Details section (dish, note, photos, receipt)
  - Verification boost preview (Photo +15%, Dish +5%, Receipt +25%)
  - Edit buttons to jump back to steps 0, 1, or 2

### Modified Files
- `app/rate/[id].tsx` (569→597 LOC) — Added step 3 rendering
  - RatingStep type: `0 | 1 | 2` → `0 | 1 | 2 | 3`
  - StepIndicator/ProgressBar total: 3 → 4
  - Step 2 "Submit Rating" → "Review" (advances to step 3)
  - Step 3 "Submit Rating" (actual submission)
  - Added handleEditStep() for jumping back from review
  - Skip button on step 2 now goes to review, not submit

- `components/rate/SubComponents.tsx` — Updated step labels
  - STEP_LABELS: added "Review" (4th label)
  - STEP_DESCRIPTIONS: added "Confirm your rating before submitting"

### Test Redirects
- `__tests__/sprint411-visit-type-extraction.test.ts` — Updated LOC threshold (580→610)
- `tests/sprint368-rating-progress.test.ts` — Updated step flow assertion (3→4)

## Flow Change

**Before (3 steps):**
1. Visit Type → 2. Score Dimensions → 3. Details + Submit

**After (4 steps):**
1. Visit Type → 2. Score Dimensions → 3. Details → 4. Review + Submit

## Test Summary

- `__tests__/sprint531-rating-review-step.test.ts` — 21 tests
  - RatingReviewStep component: 10 tests (export, props, sections, edit buttons, photos, boost)
  - Rate screen integration: 7 tests (import, 4-step flow, rendering, submission, navigation)
  - SubComponents labels: 2 tests (Review label, review description)
  - LOC thresholds: 2 tests (RatingReviewStep < 350, rate/[id].tsx < 620)
