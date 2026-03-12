# Sprint 411: Rate Flow Visit Type Extraction

**Date:** 2026-03-09
**Type:** Architecture — Component Extraction
**Story Points:** 3

## Mission

Extract the visit type selection step and dimension label logic from rate/[id].tsx into a standalone `VisitTypeStep` component. rate/[id].tsx was at 90% of its 700 LOC threshold — the last remaining WATCH file. This extraction drops it to 79%, clearing the entire WATCH backlog.

## Team Discussion

**Amir Patel (Architecture):** "rate/[id].tsx at 90% has been in WATCH for 3 audit cycles. This extraction removes 77 lines — the visit type JSX (23 LOC), getDimensionLabels function (12 LOC), and 7 visit-type styles (42 LOC). The extracted component is 109 LOC — compact and self-contained."

**Sarah Nakamura (Lead Eng):** "631→554 LOC is the biggest single-sprint reduction for rate/[id].tsx since Sprint 172's original decomposition. Two test cascades — sprint409 (visit type accessibility now in extracted component) and sprint172 (Value for Money now in VisitTypeStep). Both one-line fixes."

**Marcus Chen (CTO):** "This clears the entire WATCH backlog. All 6 key files are now OK status. Total LOC across screens: 3,039 → 2,962. The extraction strategy has systematically brought every file under safe thresholds."

**Jordan Blake (Compliance):** "The extracted VisitTypeStep has all the accessibility attributes from Sprint 409 — role, label, state on every card. Extraction preserved accessibility. This also makes it individually testable with VoiceOver."

**Priya Sharma (Design):** "Zero visual changes. The visit type cards render identically. Users won't notice the extraction — it's pure architecture."

## Changes

### New Files
- `components/rate/VisitTypeStep.tsx` (109 LOC) — Extracted visit type step with 3 option cards, getDimensionLabels function, VisitType type export

### Modified Files
- `app/rate/[id].tsx` (631→554 LOC, -77) — Replaced inline visit type step with VisitTypeStep, replaced inline getDimensionLabels with imported function, removed 7 visit-type styles, removed local VisitType type
- `__tests__/sprint409-accessibility-audit.test.ts` — Updated visit type accessibility assertion
- `tests/sprint172-rate-decomposition.test.ts` — Updated dimension label assertion

### Test Files
- `__tests__/sprint411-visit-type-extraction.test.ts` — 18 tests: component structure, props, visit types, dimension labels, accessibility, parent cleanup

## Test Results
- **312 files**, **7,450 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 2 test cascades (sprint409, sprint172) — both fixed

## File Health After Sprint 411

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 690 | 900 | 77% | = | OK |
| profile.tsx | 680 | 800 | 85% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | -77 | OK (improved) |
| business/[id].tsx | 476 | 650 | 73% | = | OK |
| index.tsx | 420 | 600 | 70% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status — first time since tracking began.**
