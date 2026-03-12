# Sprint 346: Rate Screen Extraction

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Extract animation + timing hooks from rate/[id].tsx to reduce LOC

## Mission
rate/[id].tsx reached 686 LOC in Sprint 343, dangerously close to the 700 threshold. SLT-345 mandated extraction before any new features. Sprint 346 extracts the dimension highlight animations, dimension timing tracking, and confirmation animations into `lib/hooks/useRatingAnimations.ts`.

## Team Discussion

**Amir Patel (Architecture):** "69 lines removed from rate/[id].tsx — from 686 down to 617. That's well under the 650 threshold. The extracted hook is 107 lines, but that's dedicated animation logic that doesn't need to live in the screen component."

**Sarah Nakamura (Lead Eng):** "Three clean hooks: `useDimensionHighlight` returns 4 animated styles, `useDimensionTiming` returns a ref with accumulated ms, and `useConfirmationAnimations` returns the 3 confirmation animated styles. Each hook has a single responsibility."

**Marcus Chen (CTO):** "This is Constitution #76 in action — focus often requires subtraction. We didn't add a feature this sprint. We made the code healthier so future features have room to grow."

**Priya Sharma (QA):** "24 new tests for the extraction, plus updated 5 existing test files to check the hook instead of inline code. 6,376 total tests passing."

**Rachel Wei (CFO):** "Zero user-visible changes, zero risk. Pure refactoring sprint. These are the sprints that prevent technical debt from compounding."

## Changes

### New: `lib/hooks/useRatingAnimations.ts` (107 LOC)
- `useDimensionHighlight()` — 4 shared values + interpolateColor animated styles
- `useDimensionTiming()` — Ref-based per-dimension ms tracking
- `useConfirmationAnimations()` — Spring/timing animations for confirmation screen

### Modified: `app/rate/[id].tsx` (686→617 LOC, -69 lines)
- Removed inline animation shared values, useEffects, and useAnimatedStyle calls
- Removed `pct` and `TIER_SCORE_RANGES` imports (now in hook)
- Replaced with 3 hook calls: `useDimensionHighlight`, `useDimensionTiming`, `useConfirmationAnimations`

### Test updates
- `tests/sprint346-rate-extraction.test.ts` — 24 tests (hook exports, integration, LOC reduction, backwards compat)
- Updated: sprint342, sprint334, sprint343, sprint172 test files to check hook instead of inline code

## Test Results
- **261 test files, 6,376 tests, all passing** (~3.6s)
- **Server build:** 593.7kb (unchanged — client-only refactor)

## Constitution Alignment
- **#76:** Focus often requires subtraction — removed 69 lines from critical file
- **#21:** Don't build for applause — no new features, just code health
