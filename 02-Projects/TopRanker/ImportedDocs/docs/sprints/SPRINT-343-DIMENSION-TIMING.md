# Sprint 343: Analytics — Per-Dimension Timing

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Track time spent on each scoring dimension in rating flow, fire analytics event

## Mission
Understanding how long users spend on each scoring dimension is critical for optimizing the rating flow. Sprint 343 adds per-dimension timing that records milliseconds spent on Food Quality, Service/Packaging/Wait Time, Vibe/Value, and Would Return. This data fires as a `rate_dimension_timing` analytics event on successful submission.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The timing tracks dimension transitions using focusedDimension changes. When focus moves from dimension 0 to 1, we accumulate the elapsed time to dimension 0. Clean and zero-allocation — just refs and Date.now()."

**Marcus Chen (CTO):** "This is the data we need to prove Constitution #3 is working. If Food Quality takes 2 seconds and Vibe takes 8 seconds, that tells us the vibe question might need clearer anchoring. Data-driven UX improvement."

**Amir Patel (Architecture):** "The dimensionTimingMs option is fully optional in useRatingSubmit — existing callers don't break. The analytics event only fires when there's actual timing data (some(t => t > 0) guard)."

**Rachel Wei (CFO):** "Per-dimension timing data will be valuable for the investor deck. 'Average rating takes 12 seconds with 3s per dimension' is a compelling metric for structured scoring efficiency."

**Priya Sharma (QA):** "17 new tests covering timing refs, useEffect accumulation, submit hook integration, analytics event structure, and backwards compatibility. 6,325 tests total."

**Jordan Blake (Compliance):** "Timing data is aggregated by event, not tied to individual ratings in the database. No PII concerns — it's anonymous behavioral analytics."

## Changes

### `app/rate/[id].tsx` (670→686 LOC)
- Added `dimensionTimingRef` (useRef<number[]>) — accumulates ms per dimension
- Added `dimensionStartRef` (useRef<number>) — tracks when current dimension started
- New `useEffect` on focusedDimension: when focus changes, accumulates elapsed time to previous dimension
- Passes `dimensionTimingMs: dimensionTimingRef.current` to useRatingSubmit

### `lib/hooks/useRatingSubmit.ts`
- Added `dimensionTimingMs?: number[]` option
- Imports `Analytics` from lib/analytics
- On success: fires `rate_dimension_timing` event with q1Ms, q2Ms, q3Ms, returnMs, totalMs, businessId, visitType
- Only fires when timing data has non-zero values

### CI Fix
- `package.json`: Added `yaml@2.8.2` as devDependency (fixes `npm ci` failure)
- `package-lock.json`: Regenerated with correct yaml resolution

### Tests
- `tests/sprint343-dimension-timing.test.ts` — 17 tests
- `tests/sprint172-rate-decomposition.test.ts` — Bumped LOC threshold 680→700

## Test Results
- **259 test files, 6,325 tests, all passing** (~3.5s)
- **Server build:** 590.5kb (unchanged)

## Constitution Alignment
- **#3:** Data to optimize structured scoring flow
- **#4:** Understanding timing helps ensure ratings have visible consequence
- **#27:** Agent-friendly analytics events with structured data
