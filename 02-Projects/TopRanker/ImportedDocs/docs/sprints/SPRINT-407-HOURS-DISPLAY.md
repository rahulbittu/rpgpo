# Sprint 407: Business Hours Display Improvements

**Date:** 2026-03-09
**Type:** Feature Enhancement
**Story Points:** 3

## Mission

Enhance the OpeningHoursCard on business detail pages with a week overview, next-opening-time intelligence, duration display, and relative time formatting. Help users decide *when* to visit — not just see raw hours text.

## Team Discussion

**Jasmine Taylor (Marketing):** "This is the 'When should I go?' feature. Raw hours text is informational. But week dots, 'Opens tomorrow at 9 AM,' and 'Opens in 45min' are actionable. Users can glance and decide."

**Priya Sharma (Design):** "The week overview dots are 7 small circles — green for open, red for closed, amber ring for today. It's a compact weekly pattern that Instagram and Google Maps both use. At a glance you know if a restaurant is open on Sundays."

**Amir Patel (Architecture):** "All logic is client-side — parsing the existing weekday_text array from Google Places. No API changes. The getNextOpenInfo function walks up to 7 days ahead to find the next open day when a business is currently closed."

**Marcus Chen (CTO):** "Three improvements that compound: (1) week dots for weekly pattern, (2) 'Opens tomorrow at 9 AM' instead of just 'Closed now', (3) 'Opens in 45min' for near-future openings. Each tells a different story about the same hours data."

**Sarah Nakamura (Lead Eng):** "Zero cascades. OpeningHoursCard is a leaf component — no other files import its internals. The enhanced getTodayStatus now takes hours array and todayIdx as additional params, but that's internal refactoring."

**Jordan Blake (Compliance):** "Hours accuracy depends on the Google Places data being current. The 'Opens in X' relative display recalculates on render, so it's as fresh as the last data fetch."

## Changes

### Modified Files
- `components/business/OpeningHoursCard.tsx` (150→205 LOC, +55)
  - Added DAY_NAMES/DAY_ABBREVS constants for 7-day parsing
  - Added `isDayOpen()` — checks if hours line indicates open
  - Added `getOpeningTime()` — extracts opening time from hours line
  - Added `getNextOpenInfo()` — finds next open day+time when closed
  - Added `getHoursDuration()` — computes open-to-close duration
  - Enhanced `getTodayStatus()` — shows next-open-time when closed, relative time when opening within 2h
  - Added `WeekOverviewDots` sub-component — compact S-M-T-W-T-F-S dots
  - Added duration row with hourglass icon in collapsed state when open
  - 11 new styles: weekDots, weekDotCol, weekDotLabel, weekDotLabelToday, weekDot, weekDotOpen, weekDotClosed, weekDotToday, durationRow, durationText

### Test Files
- `__tests__/sprint407-hours-display.test.ts` — 25 tests: week dots, next-open-time, duration, relative time, helper functions, existing functionality

## Test Results
- **309 files**, **7,388 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 0 test cascades
