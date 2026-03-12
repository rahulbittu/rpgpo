# Sprint 296: badges.ts Extraction

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Extract badge definitions from badges.ts to badge-definitions.ts

## Mission
badges.ts has been at 886 LOC for 4 consecutive audits — 114 LOC from the 1000 FAIL threshold. Extract the badge definition arrays (USER_BADGES, BUSINESS_BADGES, ALL_BADGES) to a separate `lib/badge-definitions.ts` file, keeping evaluation logic and utilities in `badges.ts`.

## Team Discussion

**Amir Patel (Architecture):** "886 → 240 LOC. That's a 73% reduction. The badge data arrays are pure data — no logic, no dependencies beyond the Badge type. Perfect extraction candidate. badge-definitions.ts is 661 LOC of pure data, and badges.ts keeps all the evaluation logic."

**Marcus Chen (CTO):** "This was our longest-running medium finding — 4 consecutive audit cycles. Finally resolved. The re-export pattern means zero consumer changes: anyone importing from `@/lib/badges` gets exactly the same API."

**Sarah Nakamura (Lead Eng):** "Clean circular-dependency avoidance: badge-definitions imports the `Badge` type from badges.ts, badges.ts imports the data arrays from badge-definitions. TypeScript handles this correctly because the type import is type-only."

**Priya Sharma (QA):** "18 tests including runtime correctness — actual import and evaluation of badge functions. Plus all 28 existing badge tests still pass. Zero regressions."

**Jordan Blake (Compliance):** "No functional changes, no API changes, no behavioral changes. Pure code organization. Lowest-risk sprint possible."

## Changes
- `lib/badge-definitions.ts` — NEW: 661 LOC containing USER_BADGES (38 badges), BUSINESS_BADGES (20 badges), ALL_BADGES
- `lib/badges.ts` — Reduced from 886 → 240 LOC. Imports and re-exports badge arrays. Retains types, evaluation functions, helpers.
- 18 tests in `tests/sprint296-badges-extraction.test.ts`

## Test Results
- **217 test files, 5,756 tests, all passing** (~3.0s)
