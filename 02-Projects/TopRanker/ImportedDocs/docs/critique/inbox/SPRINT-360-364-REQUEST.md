# Critique Request: Sprints 360-364

**Date:** March 10, 2026
**Submitted by:** Marcus Chen (CTO)

## Sprints for Review

### Sprint 361: Extract Search Persistence Hooks
- Moved sort, cuisine, recent searches, and discover tip persistence from search.tsx into `lib/hooks/useSearchPersistence.ts`
- search.tsx reduced from 900→855 LOC
- 4 custom hooks: usePersistedSort, usePersistedCuisine, useRecentSearches, useDiscoverTip

### Sprint 362: Business Photo Gallery Improvements
- Hero carousel: photo counter badge ("1 / N") for 6+ photos, dots retained for 2-5
- Photo grid: lowered threshold from >3 to >1, masonry layout with 16:9 featured first photo
- business/[id].tsx grew from 587→619 LOC

### Sprint 363: Challenger Card Visual Refresh
- LIVE/ENDED status badge with green dot indicator
- VS circle badge (navy, 32px) replacing text divider
- Fighter photos taller (130→150px), vote bar thicker (6→8px)
- Left amber accent border on cards
- challenger.tsx grew from 485→543 LOC (99% of 550 threshold)

### Sprint 364: Admin Moderation Queue Improvements
- Bulk approve/reject (up to 100 items per batch)
- Filtered queue endpoint (status, contentType, sort by violations)
- Resolved items history endpoint
- Per-member item lookup
- Server build grew 3kb to 599.3kb

## Questions for Reviewer

1. **Hook extraction pattern:** Are 4 hooks in one file appropriate, or should each hook be its own file?
2. **Photo gallery threshold:** Lowering from >3 to >1 means most businesses show a gallery. Is this too aggressive?
3. **challenger.tsx at 99% threshold:** Should we preemptively extract before hitting the wall?
4. **Bulk moderation without undo:** Is a 100-item bulk approve without undo capability acceptable?
5. **File size approaching limits:** Two files near thresholds. Is the governance loop (audit → extract) fast enough?

## Metrics
- 275 test files, 6,703 tests
- Server build: 599.3kb
- Audit #55: Grade A (31st consecutive)
