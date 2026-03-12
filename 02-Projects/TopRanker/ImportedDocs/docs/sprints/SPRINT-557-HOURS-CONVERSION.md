# Sprint 557: Weekday Text ↔ Periods Conversion Utility

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 17 new (10,468 total across 446 files)

## Mission

The `computeOpenStatus` function uses Google Places `periods` format (day/time objects), but owner-submitted hours use `weekday_text` format ("Monday: 11:00 AM – 10:00 PM"). This sprint adds bidirectional conversion utilities so owner hours can be used for real-time open/closed computation.

## Team Discussion

**Marcus Chen (CTO):** "This bridges the gap between human-readable hours and machine-computable periods. Without it, owner-submitted weekday_text can't drive the isOpenNow status."

**Amir Patel (Architecture):** "Two pure functions: weekdayTextToPeriods and periodsToWeekdayText. No side effects, no database calls. They handle edge cases: Closed days, 24-hour, AM/PM, overnight periods. Build size unchanged — tree-shaking drops unused functions."

**Sarah Nakamura (Lead Eng):** "The runtime tests are the highlight. We actually import and run the conversion functions in vitest — not just source assertions. The 'converts standard hours to periods' test verifies real parsing with 7-day input."

**Rachel Wei (CFO):** "Utility sprint. Small investment, high leverage — once wired into the hours update flow, every owner edit will automatically update isOpenNow."

## Changes

### Hours Conversion (`server/hours-utils.ts` — 137→200 LOC)
- **weekdayTextToPeriods(weekdayText):** Parses "Day: H:MM AM – H:MM PM" format into periods array
  - Strips day prefix, handles Closed (skip), 24 hours (no close), standard AM/PM ranges
  - Maps Mon-Sun indices to period.day (0=Sun), detects overnight periods
  - Helpers: `to24()` for 12→24hr, `pad2()` for zero-padding
- **periodsToWeekdayText(periods):** Reverse conversion for display
  - Generates 7-day array (Mon-Sun) with "Day: HH:MM AM – HH:MM PM" format
  - Defaults to "Closed" for days without periods, "Open 24 hours" for no-close periods
  - Helper: `formatTime12()` for 24→12hr display

## Test Summary

- `__tests__/sprint557-hours-conversion.test.ts` — 17 tests
  - Source: function exports, Closed handling, 24h handling, AM/PM parsing, to24 helper, formatTime12, dayMap, overnight, prefix stripping
  - Runtime weekdayTextToPeriods: import, standard conversion (6 periods from 7 days), closed omission (1 of 7), 24-hour no-close
  - Runtime periodsToWeekdayText: standard conversion back, 24-hour display, Closed defaults
  - Health: hours-utils.ts <210 LOC
