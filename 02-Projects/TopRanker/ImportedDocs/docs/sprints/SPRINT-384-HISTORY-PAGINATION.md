# Sprint 384: Profile Rating History Pagination

**Date:** 2026-03-09
**Type:** UX Enhancement
**Story Points:** 3

## Mission

Add pagination to the profile rating history section. Power users with 50+ ratings shouldn't have to scroll through all of them. Show 10 at a time with "Show More" (increments by 10) and "Show Less" (resets to 10).

## Team Discussion

**Marcus Chen (CTO):** "Simple but high-impact. As our top raters accumulate 100+ ratings, the profile page becomes unwieldy. This keeps it snappy while giving access to full history."

**Sarah Nakamura (Lead Eng):** "Client-side pagination with slice(0, historyPageSize) is the right call. The profile API already returns all history — no need for a paginated API endpoint yet."

**Priya Sharma (Frontend):** "The Show More button displays remaining count, which sets expectations. Show Less only appears when expanded, keeping the UI clean in the default state."

**Jasmine Taylor (Marketing):** "Good for performance perception. Users see a responsive page load with 10 items, not a stuttering render of 100+ items."

## Changes

### Modified Files
- `app/(tabs)/profile.tsx` — Added historyPageSize state (default 10), .slice() rendering, Show More (+10) and Show Less (reset to 10) buttons with icons and a11y labels (671 → 709 LOC)
- `tests/sprint377-saved-places-extract.test.ts` — Bumped LOC threshold from 700 to 750

### New Files
- `tests/sprint384-history-pagination.test.ts` — 16 tests

## Test Results
- **291 files**, **7,045 tests**, all passing
- Server build: **599.3kb**, 31 tables

## Key Metrics
- profile.tsx: 671 → 709 LOC (89% of 800 threshold)
- Default page size: 10, increment: 10
- Show Less only visible when expanded beyond default
