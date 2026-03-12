# SLT Backlog Meeting — Sprint 550

**Date:** 2026-03-10
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng)
**Previous:** SLT-545 (Sprint 545)

## Sprint 546-549 Review

| Sprint | Feature | Tests | Status |
|--------|---------|-------|--------|
| 546 | Query deduplication — recent/popular search overlap removal | 20 | Complete |
| 547 | Share domain alignment — topranker.app → topranker.com | 18 | Complete |
| 548 | Rating photo indicators — photo/receipt verification badges | 28 | Complete |
| 549 | Leaderboard filters — neighborhood + price range filter chips | 35 | Complete |

**Key outcomes:**
- Popular queries panel now deduplicates against recent searches (Set-based, case-insensitive)
- All share URLs aligned to topranker.com — WhatsApp deeplinks now work correctly
- Rating cards show "Photo Verified" (amber) and "Receipt Verified" (green) badges
- Leaderboard supports server-side neighborhood + priceRange filtering with horizontal chip UI
- 10,314 tests across 438 files, zero regressions

## Current Metrics

- **Tests:** 10,314 across 438 files
- **Server build:** 707.1kb
- **Arch grade:** A (68th consecutive A-range, pending Audit #68)
- **Schema:** 996/1000 LOC (unchanged — no new tables this cycle)
- **Admin endpoints:** 44+ (added neighborhoods)
- **Cities:** 11 (5 active TX + 6 beta)

## Roadmap: Sprints 551-555

| Sprint | Feature | Points | Owner |
|--------|---------|--------|-------|
| 551 | Schema compression — extract indexes to reduce schema.ts LOC | 5 | Sarah |
| 552 | Rating photo carousel — expand-to-view photos in rating detail | 5 | Sarah |
| 553 | Leaderboard filter chip extraction — move chips to component | 3 | Sarah |
| 554 | Business hours owner update — owners can edit their hours | 5 | Sarah |
| 555 | Governance (SLT-555 + Audit #69 + Critique) | 3 | Sarah |

## Key Decisions

1. **Schema compression is now P0:** schema.ts at 996/1000 LOC has been Watch status for 2 audits. The next feature requiring a table will be blocked. Sprint 551 must address this before any new table additions.

2. **Share domain alignment unblocks WhatsApp campaign:** With Sprint 547 fixing topranker.app → topranker.com, Jasmine's WhatsApp group campaign can proceed. All deeplinks now trigger correct in-app navigation.

3. **Leaderboard filter chip extraction needed:** index.tsx grew from 423→505 LOC in Sprint 549. The filter chip UI should be extracted to its own component to prevent the file from approaching its 600 LOC soft threshold.

4. **Rating photo carousel is next integrity UX step:** Sprint 548 added badges but not actual photos. The fetchRatingPhotos API is ready — Sprint 552 will add the expand-to-view carousel.

## Team Notes

**Marcus Chen:** "This cycle was well-balanced: 1 UX polish (query dedup), 1 launch blocker fix (share domain), 1 integrity feature (photo badges), and 1 discovery feature (leaderboard filters). The roadmap continues to strengthen both the core loop and the user experience."

**Rachel Wei:** "WhatsApp campaign is now unblocked. Jasmine can start seeding 'Best biryani in Irving' controversy links in WhatsApp groups. The neighborhood filters make these links even more specific: 'Best biryani in Las Colinas'."

**Amir Patel:** "Server build at 707.1kb is within acceptable range but approaching the 720kb threshold. Schema compression in Sprint 551 is the highest-priority technical debt item. I recommend extracting index definitions — Drizzle supports this with proper imports."

**Sarah Nakamura:** "Test count is growing healthily at 10,314. The threshold redirect pattern (bumping LOC assertions) is working but creating maintenance overhead — 7 redirections in Sprint 549 alone. We should consider a centralized threshold config to reduce this."
