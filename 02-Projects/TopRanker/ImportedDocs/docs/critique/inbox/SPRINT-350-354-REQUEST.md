# External Critique Request — Sprints 350-354

**Date:** March 9, 2026
**Requesting:** Architecture + Product critique of Sprints 350-354
**Reviewer:** External watcher (ChatGPT)

## Sprint Summary

| Sprint | Feature | Points | Category |
|--------|---------|--------|----------|
| 350 | SLT-350 + Arch Audit #52 (governance) | 5 | Governance |
| 351 | Wire cuisine into bookmark creation sites | 2 | Bug fix |
| 352 | Search suggestions UI refresh | 3 | UX polish |
| 353 | Rating distribution chart improvements | 3 | UX polish |
| 354 | Admin dashboard dimension timing display | 3 | Feature |

**Total:** 16 story points across 5 sprints.

## Architecture Audit #53 Result
- **Grade: A** — 29th consecutive A-range
- Server build: 596.3kb (+2.6kb from timing endpoints)
- Schema tables: 31 (unchanged)
- search.tsx: 892 LOC (up 30 from suggestion refresh)

## Questions for External Review

1. **Cuisine wiring gap**: The cuisine field was added to BookmarkEntry in Sprint 349 but wasn't populated at call sites until Sprint 351 (2 sprints later). Should the audit process catch data-flow gaps sooner?

2. **In-memory timing store**: Dimension timing is stored in-memory with a 1,000 entry cap. For production, should this be persisted to DB immediately, or is the in-memory approach acceptable until we have enough volume to justify DB writes?

3. **Search suggestions label**: We show "Popular in {city}" above suggestion chips. Is this better than no label, or does it set expectations that the data is real-time/current when it's actually cached for 2 minutes?

4. **Rating distribution trust percentage**: We show "X% trusted raters" which can be misleading for low-count businesses (e.g., "67% trusted" from 3 ratings where 2 are trusted). Should we add a minimum count before showing trust percentage?

5. **Server build trajectory**: 593.7→593.7→593.7→593.8→596.3kb over 5 sprints. The timing store caused the first notable jump. Is this growth pattern healthy or should we be more aggressive about tree-shaking?

## Files Changed (Sprints 351-354)
- Sprint 351: `lib/bookmarks-context.tsx`, `app/business/[id].tsx`, `components/search/SubComponents.tsx`, `components/leaderboard/SubComponents.tsx`
- Sprint 352: `app/(tabs)/search.tsx`, `components/search/SearchOverlays.tsx`, `lib/api.ts`, `server/storage/businesses.ts`
- Sprint 353: `components/business/RatingDistribution.tsx`
- Sprint 354: `server/routes-admin-analytics.ts`, `app/admin/dashboard.tsx`

## Constraints
- This is a critique REQUEST. The response goes in `docs/critique/outbox/SPRINT-350-354-RESPONSE.md`.
- I (the developer) must NOT write the response myself.
