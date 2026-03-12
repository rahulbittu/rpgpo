# Sprint 564: Hours Integration End-to-End Test

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 23 new (10,630 total across 454 files)

## Mission

Add comprehensive integration tests covering the full hours pipeline: submit weekday_text → convert to periods via weekdayTextToPeriods → verify computeOpenStatus returns correct open/closed status. This closes the testing gap identified in the Sprint 560 retro: "Still no end-to-end test for hours flow."

## Team Discussion

**Marcus Chen (CTO):** "This is the first feature sprint in four — after three consecutive extractions. The hours pipeline has been building across Sprints 554-559, and now we finally have a single test that validates the entire chain from HoursEditor submission to open/closed status computation."

**Sarah Nakamura (Lead Eng):** "23 runtime tests covering: 7-day conversion, AM/PM boundaries, overnight hours, Closed days, 24-hour operation, roundtrip fidelity, and the actual computeOpenStatus function with real timestamps. This is the most thorough runtime test suite we've added since Sprint 557's conversion tests."

**Amir Patel (Architecture):** "The test imports from server/hours-utils.ts directly — no source-based assertions for the core pipeline. We're testing actual behavior: does weekdayTextToPeriods produce the right periods? Does computeOpenStatus return the right open/closed status? The source verification section covers the wiring: route auto-conversion, storage persistence, editor submission."

**Rachel Wei (CFO):** "The hours pipeline spans 6 sprints of work: PUT endpoint (554), pre-fill (556), conversion (557), wiring (559), and now integration test (564). This test validates the investment. If any piece breaks, this test catches it."

**Nadia Kaur (Cybersecurity):** "Good edge case coverage: null hours, empty periods, AM/PM boundaries (12:00 AM = 0000, 12:00 PM = 1200), overnight closing times. These are the cases that break time logic in production."

## Changes

### New File: `__tests__/sprint564-hours-integration.test.ts` (23 tests)
- **Pipeline tests (8):** weekday_text → periods conversion for all 7 days, computeOpenStatus during business hours, before opening, after closing, with todayHours
- **Roundtrip tests (3):** Standard hours roundtrip, Closed days preservation, 24-hour days preservation
- **Edge cases (5):** Overnight hours, null hours, empty periods, 12:00 PM boundary, 12:00 AM boundary
- **Route wiring (3):** Auto-conversion check, missing periods guard, import verification
- **Full pipeline source verification (4):** HoursEditor → route → storage → computeOpenStatus chain

### Modified: `shared/thresholds.json`
- Test count: 10,468 → 10,630

## Test Summary

- `__tests__/sprint564-hours-integration.test.ts` — 23 tests
  - Pipeline: 8 tests (conversion correctness, computeOpenStatus with real timestamps)
  - Roundtrip: 3 tests (standard, closed days, 24-hour)
  - Edge cases: 5 tests (overnight, null, empty, AM/PM boundaries)
  - Route wiring: 3 tests (auto-conversion, guard, import)
  - Full pipeline: 4 tests (editor → route → storage → status)
