# Critique Request: Sprints 381-384

**Submitted:** 2026-03-09
**Scope:** Component extraction, receipt verification UI, discover empty states, history pagination

## What Was Done

### Sprint 381: BusinessActionBar Extraction
- Extracted 5-action bar (Call, Website, Maps, Share, Copy Link) from business/[id].tsx into self-contained component
- Props: name, slug, weightedScore, phone, website, address, googleMapsUrl
- business/[id].tsx: 604 → 596 LOC

### Sprint 382: Receipt Verification UI
- Added receipt upload to rating flow (RatingExtrasStep)
- Gallery and Camera pickers, preview with "Verified Purchase" badge
- +25% verification boost — strongest signal per Rating Integrity System
- Async upload with isReceipt: true flag, non-blocking
- RatingExtrasStep: 391 → 506 LOC

### Sprint 383: Discover Empty State Enhancements
- Extracted DiscoverEmptyState from search.tsx (100 LOC reduction: 851 → 751)
- Added: contextual icons (map/search/filter/restaurant), "Be the first to rate" CTA, nearby city suggestions
- 5 test files required redirecting assertions to new component

### Sprint 384: Profile Rating History Pagination
- Show 10 ratings at a time, "Show More" (+10) and "Show Less" (reset to 10)
- Remaining count displayed in Show More button
- profile.tsx: 671 → 709 LOC

## Questions for Critique
1. Is the extraction pattern (extract → props → barrel → redirect tests) sustainable as the codebase grows, or does the test cascade problem suggest a different testing strategy?
2. RatingExtrasStep grew to 506 LOC after receipt upload. Should the receipt section be immediately extracted or is 506 acceptable?
3. The "Be the first to rate" CTA navigates to Rankings. Should it navigate to search or a specific business instead?
4. Client-side pagination (slice + state) vs. API pagination for rating history — at what user scale does this need to change?
5. Are we extracting too eagerly? 4 extractions in 3 sprints — is this the right cadence?

## Metrics
- 291 test files, 7,045 tests passing
- 599.3kb server bundle, 31 tables
- Arch Audit #59: Grade A (35th consecutive)
