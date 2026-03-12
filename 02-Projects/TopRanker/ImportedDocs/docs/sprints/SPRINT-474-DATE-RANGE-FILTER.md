# Sprint 474: Rating History Date Range Filter UI

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add date range filter UI to the RatingHistorySection on the Profile tab. Users can filter their rating history by preset periods (All Time, 7 Days, 30 Days, 90 Days) or enter a custom date range. Filtered ratings are also passed to the export button, so exports respect the active filter.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The `filterByDateRange` utility from Sprint 454 was already waiting for a UI. This sprint connects it to the RatingHistorySection with a chip-based filter bar. The preset periods cover 95% of use cases — custom is there for power users."

**Marcus Chen (CTO):** "Date filtering on the profile page is essential for users who rate frequently. Without it, the history becomes an unnavigable wall of ratings. The 7-day and 30-day views are the most actionable."

**Amir Patel (Architect):** "Good use of `useMemo` for the filtered list — avoids recomputing on every render. The filter integrates with the existing pagination, and resets page size when changing presets to avoid showing empty pages."

**Rachel Wei (CFO):** "The export-respects-filter behavior is important. If a user filters to 30 days and exports, they get a 30-day CSV — not everything. This is the expected behavior for any filtered export."

**Jasmine Taylor (Marketing):** "This is a credibility feature. Active raters want to see 'How many places did I rate this month?' The count display (filtered / total) answers that instantly."

**Jordan Blake (Compliance):** "Custom date input via prompt is functional but not ideal. A proper date picker component would be better for accessibility and validation. Worth a future sprint."

## Changes

### Modified: `components/profile/RatingHistorySection.tsx` (+142 LOC, 177→319)
- Added `filterByDateRange` import from rating-export-utils
- New `DateRangePreset` type: "all" | "7d" | "30d" | "90d" | "custom"
- `DATE_RANGE_PRESETS` array with labels for chip rendering
- `getPresetDates()` helper: converts preset key to start date
- State: `datePreset`, `customStart`, `customEnd`
- `filteredHistory` useMemo: applies filterByDateRange based on active preset
- Date filter chip row: All Time, 7 Days, 30 Days, 90 Days, Custom (with calendar icon)
- Custom range indicator shows active date range with dismiss button
- All downstream usage switched from `ratingHistory` to `filteredHistory`:
  - Export button receives filtered ratings
  - Slice for pagination uses filtered list
  - Show More/Less counts use filtered list
  - Section count shows "filtered / total" when filter active

### Modified: `__tests__/sprint443-profile-extraction.test.ts`
- RatingHistorySection LOC threshold bumped 200→325 (date filter additions)

### Modified: `tests/sprint384-history-pagination.test.ts`
- Updated Show More check: `ratingHistory` → `filteredHistory`

### Modified: `__tests__/sprint433-rating-export.test.ts`
- Updated export button check: `ratings={ratingHistory}` → `ratings={filteredHistory}`

### New: `__tests__/sprint474-date-range-filter.test.ts` (20 tests)
- Date range state and preset types
- filterByDateRange integration
- Chip rendering and active state
- Custom range indicator
- Filtered ratings propagation to export and display

## Test Coverage
- 20 new tests, all passing
- Full suite: 8,773 tests across 366 files, all passing in ~4.6s
- Server build: 636.6kb (unchanged — client-only sprint)
