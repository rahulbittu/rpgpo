# Sprint 406: Profile Breakdown Extraction

**Date:** 2026-03-09
**Type:** Architecture — Component Extraction
**Story Points:** 3

## Mission

Extract the Score Breakdown card from profile.tsx into a standalone `ScoreBreakdownCard` component. profile.tsx was at 92% of its 800 LOC threshold — the highest of any key file. This extraction drops it to 85%, creating headroom for future features.

## Team Discussion

**Amir Patel (Architecture):** "profile.tsx at 92% was our most urgent extraction target. The breakdown card was a natural boundary — self-contained state (expanded toggle), self-contained rendering (6 BreakdownRow components + total), self-contained styles (7 style entries). Clean extraction."

**Sarah Nakamura (Lead Eng):** "739→680 LOC, a 59-line reduction. The extracted ScoreBreakdownCard is 87 LOC — compact because it reuses the existing BreakdownRow component. The expanded/collapsed state moved cleanly since no parent needed to control it."

**Priya Sharma (Design):** "Zero visual changes. The breakdown card renders identically — same collapsible behavior under 5 ratings, same hint text, same breakdown rows. Extraction should be invisible to users."

**Marcus Chen (CTO):** "This is exactly the pattern we want — extraction that creates architectural headroom without touching the user experience. profile.tsx goes from WATCH to OK status. rate/[id].tsx at 90% is now the only remaining WATCH file."

**Jordan Blake (Compliance):** "One test cascade in sprint181 — the old decomposition test expected profile.tsx to import BreakdownRow directly. Updated to expect ScoreBreakdownCard instead. Clean fix."

## Changes

### New Files
- `components/profile/ScoreBreakdownCard.tsx` (87 LOC) — Extracted breakdown card with collapsible state, BreakdownRow usage, penalty handling, total display

### Modified Files
- `app/(tabs)/profile.tsx` (739→680 LOC, -59) — Replaced inline breakdown with ScoreBreakdownCard component, removed breakdownExpanded state, removed 7 breakdown styles, removed BreakdownRow import
- `components/profile/SubComponents.tsx` — Added ScoreBreakdownCard re-export
- `tests/sprint181-profile-decomposition.test.ts` — Updated assertion: BreakdownRow → ScoreBreakdownCard

### Test Files
- `__tests__/sprint406-profile-extraction.test.ts` — 17 tests: component structure, props interface, internal state, breakdown rows, barrel export, profile.tsx cleanup

## Test Results
- **308 files**, **7,363 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 1 test cascade (sprint181) — fixed

## File Health After Sprint 406

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| profile.tsx | 680 | 800 | 85% | -59 | OK (improved) |
| search.tsx | 688 | 900 | 76% | = | OK |
| rate/[id].tsx | 631 | 700 | 90% | = | WATCH |
| business/[id].tsx | 476 | 650 | 73% | = | OK |
| index.tsx | 420 | 600 | 70% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |
