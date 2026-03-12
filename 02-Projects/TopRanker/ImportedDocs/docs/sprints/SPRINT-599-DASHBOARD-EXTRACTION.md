# Sprint 599: Dashboard ReviewCard Extraction + Dead Code Removal

**Date:** 2026-03-11
**Owner:** Sarah Nakamura (Lead Eng)
**Points:** 3
**Status:** Complete

## Mission

Extract ReviewCard component from dashboard.tsx into `components/dashboard/ReviewCard.tsx`, remove dead MiniChart component (replaced by SparklineChart in Sprint 487), and remove sprint comments. Reduce dashboard.tsx from 502 to 397 LOC (-105 lines, 21% reduction).

## Team Discussion

**Sarah Nakamura (Lead Eng):** "ReviewCard was the largest inline component at 39 lines of JSX plus 20 lines of styles. Extracting it along with its `timeAgo` utility and tier color/name maps creates a clean, self-contained module. Dashboard.tsx drops from 502 to 397 — that's 123 lines of headroom under the 520 ceiling."

**Amir Patel (Architecture):** "MiniChart has been dead code since Sprint 487 when SparklineChart replaced it. Retro 487 explicitly flagged it for removal. That's 30 lines of code that was never called — classic extraction debt. Glad we finally cleaned it up."

**Marcus Chen (CTO):** "Build size unchanged at 729.9kb since the bundler tree-shakes dead code. But the LOC savings are the real win — dashboard.tsx went from 18 lines of headroom to 123. That's room for 3-4 new features."

**James Park (Frontend):** "The ReviewCard extraction follows the same pattern as HoursEditor (Sprint 561), SparklineChart, and VolumeBarChart. All dashboard sub-components now live in `components/dashboard/`. The parent file is pure composition — it assembles child components and manages data fetching."

**Priya Sharma (QA):** "Only one test needed updating — sprint561's minimum LOC floor dropped from 450 to 350. All 11,320 tests pass. The extraction is functionally transparent."

## Changes

### New Files
- `components/dashboard/ReviewCard.tsx` (88 LOC) — Extracted ReviewCard with timeAgo utility, tier color/name maps, and all review styles

### Modified Files
- `app/business/dashboard.tsx` — 502→397 LOC (-105 lines). Removed: ReviewCard component + styles, MiniChart dead code, timeAgo utility, 4 sprint comments. Added: ReviewCard import.
- `shared/thresholds.json` — Updated dashboard.tsx current (503→397)
- `__tests__/sprint561-hours-editor-extraction.test.ts` — Updated min LOC floor (450→350)

## Metrics

- **dashboard.tsx:** 502→397 LOC (105 lines freed, 123 lines headroom to 520 ceiling)
- **Server build:** 729.9kb (unchanged)
- **Tests:** 11,320 passing (484 files)
- **Dashboard components:** Now 7 extracted components in `components/dashboard/`
