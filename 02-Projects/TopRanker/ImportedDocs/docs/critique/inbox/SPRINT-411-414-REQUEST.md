# Critique Request: Sprints 411-414

**Date:** 2026-03-09
**Requesting:** External review of Sprints 411-414

## Sprint Summary

### Sprint 411: Visit Type Extraction
- Extracted VisitTypeStep component (109 LOC) from rate/[id].tsx
- rate/[id].tsx dropped from 631→554 LOC (90%→79%)
- Cleared entire WATCH backlog — all 6 key files now at OK status
- getDimensionLabels function co-located with VisitTypeStep
- 2 test cascades, both one-line fixes

### Sprint 412: Search Results Sorting Indicators
- SortResultsHeader component shows result count + active sort + filter
- SORT_DESCRIPTIONS record with label/icon/hint per sort key
- SortChips enhanced to show sort-specific icon on active chip
- search.tsx: replaced plain text with SortResultsHeader (1 line changed)

### Sprint 413: Business Detail Photo Lightbox
- PhotoLightbox component (153 LOC) — fullscreen modal with paging, counter, close
- HeroCarousel photos now tappable via onPhotoPress callback
- PhotoGallery featured + grid photos now tappable
- business/[id].tsx grew by 18 LOC (476→494, 76%) for lightbox wiring

### Sprint 414: Profile Tier Progress Improvements
- CredibilityJourney enhanced (225→347 LOC) with progress bar, milestones, perks
- getNextTierPerks and getMilestones pure functions
- profile.tsx unchanged (680 LOC) — just passes 2 new props

## Questions for Reviewer

1. **PhotoLightbox uses a standard ScrollView for paging.** Should we consider react-native-reanimated for gesture-driven zoom/pan? What's the complexity trade-off?

2. **CredibilityJourney grew from 225→347 LOC.** It's a leaf component with no threshold, but is it approaching extraction territory? Should milestones/perks be separate components?

3. **SORT_DESCRIPTIONS has `hint` strings that are defined but never rendered.** Should we render them as accessibility hints, or is defining them premature?

4. **getMilestones uses simple thresholds (5 ratings, 15 ratings).** Should milestone logic be server-driven for personalization, or is client-side derivation sufficient?

5. **The photo lightbox contentOffset approach** (`contentOffset={{ x: initialIndex * SCREEN_W, y: 0 }}`) — is this reliable across platforms, or should we use a ref-based scrollTo on mount?

## Metrics

- 315 test files, 7,519 tests, all passing
- Server build: 601.1kb, 31 tables
- 41 consecutive A-range audits
- All 6 key files at OK status
- 0 medium findings in Audit #41
