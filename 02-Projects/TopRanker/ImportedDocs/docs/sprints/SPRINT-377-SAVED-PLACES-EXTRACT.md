# Sprint 377: Extract SavedPlacesSection from Profile

**Date:** March 10, 2026
**Story Points:** 2
**Focus:** Proactive extraction of saved places section to reduce profile.tsx from 95% to 84% of threshold

## Mission
profile.tsx was at 756/800 LOC (95% of threshold) for 2 consecutive audits (Audits #56 and #57). Following the lesson from challenger.tsx (which sat at 99% for 2 cycles before extraction), this sprint proactively extracts the SavedPlacesSection — header, summary stats, saved list, and empty state — into a self-contained component.

## Team Discussion

**Amir Patel (Architecture):** "profile.tsx dropped from 756 to 671 LOC — 84% of the 800 threshold. The extracted component is 113 LOC with header, summary stats, list, empty state, and all 11 related styles. Clean separation."

**Sarah Nakamura (Lead Eng):** "SavedPlacesSection accepts just 2 props: savedList (BookmarkEntry[]) and bookmarkCount (number). It imports SavedRow internally. profile.tsx no longer needs to import SavedRow directly."

**Priya Sharma (QA):** "19 new tests for the extraction. Updated sprint369 and sprint181 tests to check SavedPlacesSection instead of profile.tsx for saved-related assertions. 285 test files, 6,916 tests, all passing."

**Marcus Chen (CTO):** "This is the governance learning applied: don't wait for 99% like we did with challenger.tsx. Extract at 95% when you have 2 consecutive audit flags. profile.tsx now has 129 lines of headroom."

## Changes

### `components/profile/SavedPlacesSection.tsx` (NEW — 113 LOC)
- `SavedPlacesSectionProps` interface: savedList, bookmarkCount
- `SavedPlacesSection` component: header with View All link, summary stats row, saved list, empty state with Discover CTA
- Self-contained styles: sectionHeader, sectionTitle, sectionCount, viewAllLink, savedSummary, savedSummaryItem, savedSummaryValue, savedSummaryLabel, savedSummaryDivider, emptyState, emptyText, emptySubtext, savedCtaButton, savedCtaText

### `app/(tabs)/profile.tsx` (756→671 LOC, -85 lines)
- Replaced inline saved places section with `<SavedPlacesSection>`
- Removed SavedRow from SubComponents import
- Added SavedPlacesSection import
- Removed 7 saved-related style definitions

### `components/profile/SubComponents.tsx` (+2 lines)
- Added barrel exports for SavedPlacesSection and SavedPlacesSectionProps

### Test updates
- `tests/sprint377-saved-places-extract.test.ts` (NEW — 19 tests)
- `tests/sprint369-saved-places.test.ts` — Redirected assertions to SavedPlacesSection
- `tests/sprint181-profile-decomposition.test.ts` — Updated to check SavedPlacesSection instead of SavedRow

## Test Results
- **285 test files, 6,916 tests, all passing** (~3.7s)
- **Server build:** 599.3kb (unchanged)
