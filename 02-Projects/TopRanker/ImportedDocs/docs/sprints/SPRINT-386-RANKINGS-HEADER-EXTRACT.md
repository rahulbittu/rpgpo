# Sprint 386: Rankings ListHeader Extraction

**Date:** 2026-03-09
**Type:** Component Extraction / Code Health (P0 from SLT-385)
**Story Points:** 5

## Mission

Extract the FlatList ListHeaderComponent from Rankings (`index.tsx`) into a `RankingsListHeader` component. index.tsx was at 572/600 LOC (95%) — the highest threshold percentage in the codebase, flagged as ACTION in Arch Audit #59.

## Team Discussion

**Marcus Chen (CTO):** "This was P0 from SLT-385. index.tsx at 95% meant one more feature would breach the threshold. The extraction buys us ~180 lines of headroom."

**Sarah Nakamura (Lead Eng):** "Biggest extraction yet — 154 lines removed from index.tsx, 7 test files needed updates. The test cascade was significant but predictable."

**Amir Patel (Architecture):** "RankingsListHeader encapsulates category chips, cuisine filter, dish shortcuts, welcome banner, hero card, and rankings summary. All styles moved with it. The parent just passes props and callbacks."

**Priya Sharma (Frontend):** "14 props is a lot, but they're all simple — strings, booleans, arrays, callbacks. No complex objects. The component is genuinely self-contained."

**Jasmine Taylor (Marketing):** "The Rankings header is the first thing users see. Having it as an isolated component makes it easier to A/B test different layouts later."

## Changes

### New Files
- `components/leaderboard/RankingsListHeader.tsx` (230 LOC) — Extracted header with all sub-sections and styles

### Modified Files
- `app/(tabs)/index.tsx` — Replaced 100-line inline ListHeaderComponent with `<RankingsListHeader>`, removed 54 lines of styles, cleaned up unused imports (572 → 419 LOC, **-153**)
- 7 test files redirected assertions to RankingsListHeader.tsx:
  - sprint299, sprint302, sprint306, sprint323, sprint325, sprint327, sprint331

## Test Results
- **291 files**, **7,045 tests**, all passing
- Server build: **599.3kb**, 31 tables

## Key Metrics
- index.tsx: 572 → 419 LOC (70% of 600 threshold — excellent headroom)
- Largest single extraction: -153 lines
- Test cascade: 7 files (highest yet, but manageable)

## Architecture Notes
After this sprint, all key files are comfortable:
| File | LOC | Threshold | % |
|------|-----|-----------|---|
| index.tsx | 419 | 600 | 70% |
| search.tsx | 751 | 900 | 83% |
| profile.tsx | 709 | 800 | 89% |
| rate/[id].tsx | 625 | 700 | 89% |
| business/[id].tsx | 596 | 650 | 92% |
| challenger.tsx | 479 | 550 | 87% |
