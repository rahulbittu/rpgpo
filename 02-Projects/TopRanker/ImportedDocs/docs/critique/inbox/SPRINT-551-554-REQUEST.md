# Critique Request: Sprints 551-554

**Date:** 2026-03-10
**Submitted by:** Marcus Chen (CTO)
**Scope:** Technical Debt + Feature Cycle (Schema Compression, Photo Carousel, Filter Extraction, Hours Update)

## Sprint Summary

| Sprint | Feature |
|--------|---------|
| 551 | Schema compression — TOC + blank lines + divider reduction (996→935 LOC) |
| 552 | Rating photo carousel — tappable photo/receipt badges open modal viewer |
| 553 | Leaderboard filter chip extraction — index.tsx 505→443 via LeaderboardFilterChips |
| 554 | Business hours owner update — PUT endpoint + HoursEditor in dashboard |

## Current Metrics

- 10,415 tests across 443 files
- 708.7kb server build
- 69 consecutive A-range arch grades
- 11 cities (5 active TX + 6 beta)
- 45+ admin endpoints
- Schema at 935/1000 LOC (61 freed)

## Questions for External Watcher

1. **Schema compression freed 61 LOC but removed structural documentation:** The 44-line TOC with numbered entries and circular dependency notes was replaced with a 3-line compressed header. The section dividers were shortened from `// ── CORE ────────────` to `// ── CORE ──`. Is this compression worth the readability trade-off? Should the original TOC be preserved in a separate markdown file, or is the inline compressed version sufficient for developer navigation?

2. **Photo carousel is rendered inside each RatingRow (per-rating modal):** Each RatingRow has its own PhotoCarouselModal instance, meaning N rating rows create N modal components. While only one is visible at a time (controlled by state), is this wasteful? Should the carousel be lifted to a single shared modal in the parent CollapsibleReviews component, with the active rating passed as a prop?

3. **17 threshold redirections in 4 sprints (up from 12 in 546-549):** The test redirect overhead continues to grow. Sprint 558 plans a centralized threshold config. The question: should thresholds even be in per-sprint tests? Would a single `file-health.test.ts` with all thresholds be better than scattered assertions across 50+ test files? What are the trade-offs of centralization vs. per-sprint contracts?

4. **HoursEditor uses default placeholder hours, not existing business data:** The editor initializes with "11:00 AM – 10:00 PM" for all 7 days instead of fetching the business's current openingHours from the API. This means the first save overwrites Google Places data with defaults if the owner doesn't manually correct all fields. Is this a data integrity risk worth blocking the feature for, or is it acceptable for V1?

5. **dashboard.tsx grew 80 LOC in one sprint (489→569) without extraction:** This parallels the index.tsx growth in Sprint 549 (423→505) that required a later extraction sprint. Should we adopt a "same-sprint extraction" rule for any component gaining 50+ LOC, or is a 1-2 sprint delay acceptable as long as extraction is scheduled?
