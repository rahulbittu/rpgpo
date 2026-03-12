# Sprint 576: Mock Data Router Extraction

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete

## Mission

Extract `getMockData` and related mock data state from `lib/api.ts` into a dedicated `lib/mock-router.ts` module. This reduces api.ts complexity, improves testability, and establishes the route-map pattern for mock data routing.

## Team Discussion

**Marcus Chen (CTO):** "The mock router was becoming a liability inside api.ts. Every new endpoint added prefix collision risk. Extracting to a dedicated module with the route-map pattern is the right structural fix."

**Amir Patel (Architecture):** "The EXACT_ROUTES array pattern gives us O(n) routing with explicit ordering. Most specific paths first, catch-alls last. This is the same pattern Express uses internally — battle-tested."

**Sarah Nakamura (Lead Eng):** "api.ts dropped from 573 to 517 LOC — that's a meaningful reduction. The mock-router module is tight at 77 lines with clear separation of concerns."

**Dev Okonkwo (Frontend):** "Re-exporting `isServingMockData` and `resetMockDataFlag` from api.ts preserves backward compatibility. No consumer changes needed."

**Nadia Kaur (Security):** "Mock data is dev-only behind `__DEV__` guard. The extraction doesn't change the security surface — good. No production code paths affected."

**Jordan Blake (Compliance):** "Clean separation of test infrastructure from production API layer. This makes audit scoping simpler."

## Changes

### New Files
- **`lib/mock-router.ts`** (77 LOC) — Mock data router with route-map pattern
  - `EXACT_ROUTES: MockRoute[]` — Ordered array of `{ prefix, handler }` entries
  - `getMockData(path)` — Iterates exact routes, then catch-alls
  - `searchHandler(path)` — Business search with query/city filtering
  - State helpers: `isServingMockData()`, `resetMockDataFlag()`, `setServingMockData()`

### Modified Files
- **`lib/api.ts`** (573→517 LOC, -56)
  - Removed: `getMockData` function, `_servingMockData` state, `searchHandler`, all `MOCK_*` imports from mock-data
  - Added: imports from `@/lib/mock-router`
  - Added: re-exports of `isServingMockData`, `resetMockDataFlag` for backward compatibility
  - Replaced all `_servingMockData = true` with `setServingMockData()`, `_servingMockData = false` with `resetMockDataFlag()`

### Test Files
- **`__tests__/sprint576-mock-router.test.ts`** (~22 tests)
  - Mock router module: exports, imports, route definitions, handler patterns, LOC
  - api.ts cleanup: imports from mock-router, re-exports, no local definitions
- **`__tests__/sprint574-dish-vote-streak.test.ts`** — Redirected getMockData fix tests to read `lib/mock-router.ts`

### Threshold Updates
- `shared/thresholds.json`: api.ts maxLOC 575→525 (current 517), added mock-router.ts maxLOC 85 (current 77), tests 10889→10912

## PRD Gaps Closed
- Mock data routing was fragile (prefix collision bugs in Sprints 574). Now structurally sound with route-map pattern.

## Test Results
- **10,912 tests** across 465 files, all passing in ~5.9s
- Server build: 712.1kb
