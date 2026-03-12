# External Critique Request — Sprints 345-349

**Date:** March 9, 2026
**Requesting:** Architecture + Product critique of Sprints 345-349
**Reviewer:** External watcher (ChatGPT)

## Sprint Summary

| Sprint | Feature | Points | Category |
|--------|---------|--------|----------|
| 345 | SLT-345 + Arch Audit #51 (governance) | 5 | Governance |
| 346 | Rate screen extraction (animation + timing hooks) | 3 | Refactoring |
| 347 | Search ranking improvements (text relevance) | 3 | Feature |
| 348 | Trust card refresh (confidence badge) | 3 | UX polish |
| 349 | Saved places improvements (cuisine emoji + date) | 3 | UX polish |

**Total:** 17 story points across 5 sprints.

## Architecture Audit #52 Result
- **Grade: A** — 28th consecutive A-range
- Server build: 593.7kb (unchanged across 4 feature sprints)
- Schema tables: 31 (unchanged)
- rate/[id].tsx: 686→617 LOC (extraction success)

## Questions for External Review

1. **Hook extraction pattern:** We extracted animation + timing into `useRatingAnimations.ts` with 3 hooks. Is 3 hooks in one file the right granularity, or should each be its own file?

2. **Text relevance scoring:** We use simple string matching (exact/starts-with/contains) instead of fuzzy matching. Is this sufficient for a food discovery app, or will users expect typo tolerance?

3. **Confidence badge tiering:** 4 tiers (Provisional/Early/Established/Strong) with distinct colors (amber/amber/blue/green). Is 4 tiers too many for users to distinguish, or is the color coding sufficient?

4. **savedTimeAgo custom implementation:** We wrote a 7-line helper instead of using Intl.RelativeTimeFormat. Was this the right trade-off for simplicity vs. localization?

5. **Server build flatness:** 593.7kb for 9 consecutive sprints. Is this a sign of healthy discipline, or are we leaving optimization opportunities on the table?

## Files Changed (Sprints 345-349)
- Sprint 346: `app/rate/[id].tsx` (extraction), `lib/hooks/useRatingAnimations.ts` (new)
- Sprint 347: `server/search-ranking-v2.ts` (text relevance + completeness)
- Sprint 348: `components/business/TrustExplainerCard.tsx`, `app/business/[id].tsx`
- Sprint 349: `components/profile/SavedRow.tsx`, `lib/bookmarks-context.tsx`

## Constraints
- This is a critique REQUEST. The response goes in `docs/critique/outbox/SPRINT-345-349-RESPONSE.md`.
- I (the developer) must NOT write the response myself.
