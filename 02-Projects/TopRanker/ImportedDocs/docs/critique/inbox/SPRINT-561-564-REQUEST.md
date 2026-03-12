# Critique Request: Sprints 561-564

**Date:** 2026-03-10
**Submitted by:** Marcus Chen (CTO)
**Scope:** Extraction Cycle + Integration Testing (HoursEditor, Owner API, Photo Carousel, Hours Pipeline)

## Sprint Summary

| Sprint | Feature |
|--------|---------|
| 561 | HoursEditor extraction — dashboard.tsx 592→492 LOC |
| 562 | Owner API extraction — api.ts 691→550 LOC |
| 563 | Photo carousel extraction — CollapsibleReviews 407→349 LOC |
| 564 | Hours integration end-to-end test — full pipeline validation |

## Current Metrics

- 10,630 tests across 454 files
- 711.4kb server build
- 71 consecutive A-range arch grades
- 16 files tracked in centralized thresholds
- 0 Low findings (first clean audit since #68)
- 299 LOC extracted from high-pressure files

## Questions for External Watcher

1. **Three extractions followed the same pattern: move component, add re-exports, redirect tests.** This is predictable and low-risk, but also means 37 test redirections across the cycle. Are test redirections a hidden maintenance cost? At what point should we consider restructuring tests to reference centralized component registries rather than per-sprint source assertions?

2. **api-owner.ts duplicates the apiFetch helper from api.ts** rather than importing it. This avoids exporting an internal, but creates code duplication. The same pattern already exists in api-admin.ts. With three API modules (api.ts, api-admin.ts, api-owner.ts), should we extract apiFetch to a shared utility, or is the duplication acceptable for module isolation?

3. **The hours integration test imports server code directly in a client test file.** The test at `__tests__/sprint564-hours-integration.test.ts` imports from `../server/hours-utils`. This works because Vitest runs in Node, but it creates a cross-boundary dependency. Should server-only functions have their own test directory (e.g., `server/__tests__/`), or is the current flat `__tests__/` structure acceptable?

4. **computeOpenStatus uses toLocaleString with "America/Chicago" timezone.** This is hardcoded for Dallas businesses. As we expand to other cities (OKC, Memphis, Nashville — all Central Time), this works. But if we ever expand to Eastern or Pacific time zones, it breaks. Should we parameterize the timezone now, or is YAGNI the right call until non-Central cities are on the roadmap?

5. **The extraction cycle freed 299 LOC but added 379 LOC in new files.** Net LOC increased by 80 (re-exports + imports + style duplication). Extractions improve file health metrics but don't reduce total codebase size. Is file-level LOC the right metric, or should we track total LOC across related modules? The risk: optimizing file health while total complexity grows.
