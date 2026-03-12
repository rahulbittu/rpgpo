# Sprint 558: Centralized Threshold Config — shared/thresholds.json

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 26 new (10,494 total across 448 files)

## Mission

Test threshold redirections have been growing: 12 in cycle 546-549, 17 in cycle 551-554. Each redirect requires finding and editing the specific per-sprint test that checks a file's LOC. This sprint creates a centralized `shared/thresholds.json` config and a single `file-health.test.ts` that dynamically checks all files. Future sprints update one JSON file instead of hunting through dozens of test files.

## Team Discussion

**Marcus Chen (CTO):** "The threshold redirect problem was flagged in Retros 550, 553, 554, and 555 — and in critique question #3 for 551-554. This is the fix. One file, one update, all thresholds."

**Amir Patel (Architecture):** "The thresholds.json schema tracks maxLOC, current LOC, and notes for each file. Plus build size and test count floors. The file-health.test.ts iterates dynamically — no new test code needed when adding files."

**Sarah Nakamura (Lead Eng):** "This doesn't remove old per-sprint threshold tests — they still serve as sprint contracts. But future sprints should reference thresholds.json instead of inline numbers. Over time, the old tests become historical artifacts."

**Rachel Wei (CFO):** "Process improvement sprint. Reduces maintenance overhead, which frees engineering time for features."

## Changes

### Threshold Config (`shared/thresholds.json` — new, 13 files tracked)
- **files:** 13 key files with maxLOC, current, notes
  - schema.ts (950), routes.ts (400), businesses.ts (620), api.ts (710), index.tsx (460), dashboard.tsx (610), CollapsibleReviews.tsx (420), etc.
- **build:** maxSizeKb: 720, currentSizeKb: 708.7
- **tests:** minCount: 10400, currentCount: 10468

### File Health Test (`__tests__/file-health.test.ts` — new)
- Dynamically iterates `thresholds.files` entries
- Each file gets a `${filePath} is under ${maxLOC} LOC` test
- Build size check from `thresholds.build.maxSizeKb`
- Test count floor from `thresholds.tests.minCount`
- 15 auto-generated tests from 13 files + build + count

### Sprint Test (`__tests__/sprint558-threshold-config.test.ts` — new)
- Validates thresholds.json structure: files section, ≥10 entries, maxLOC/current pairs, key files
- Validates file-health.test.ts reads from JSON, iterates dynamically, checks build + tests
- 11 tests

## Test Summary

- `__tests__/file-health.test.ts` — 15 tests (dynamic from thresholds.json)
- `__tests__/sprint558-threshold-config.test.ts` — 11 tests
  - Config: files section, ≥10 tracked, maxLOC/current pairs, build, tests, key files, notes
  - Health test: reads JSON, iterates entries, build check, test count
