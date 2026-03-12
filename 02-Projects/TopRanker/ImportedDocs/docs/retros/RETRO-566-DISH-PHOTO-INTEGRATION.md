# Retro 566: Dish Leaderboard Photo Integration

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "First feature sprint since 560. Real food photos in dish leaderboards make the entries more authentic. This builds on two existing systems — ratingPhotos (Sprint 548) and dish votes (Sprint 166) — connecting them for the first time."

**Sarah Nakamura:** "The storage changes were surgical: 26 lines added to a 550+ LOC file. The photo preference logic (rating photo > business photo) is clean — one conditional check. And the `dishPhotoCount` enrichment uses a simple join that leverages existing indexes."

**Amir Patel:** "Build size grew only 0.7kb. The feature touches server and client, which is rare — most recent sprints were client-only extractions. Good to exercise the full stack."

## What Could Improve

- **dishPhotoCount query runs per-entry** — The `getDishLeaderboardWithEntries` function runs N queries for N entries. Could batch into a single query with GROUP BY. Not urgent (leaderboards typically have <20 entries).
- **No photo carousel from DishEntryCard** — The badge shows the count but doesn't open a carousel on tap yet. Could reuse PhotoCarouselModal from Sprint 563.
- **Build threshold bumped** — Two old governance tests checked `lessThan(710)`. Build growth should be tracked more centrally via thresholds.json, not per-sprint assertions.

## Action Items

- [ ] Sprint 567: Rating velocity dashboard widget — **Owner: Sarah**
- [ ] Consider batch photo count query for performance — **Owner: Amir** (low priority)
- [ ] Add carousel on DishEntryCard photo tap (future sprint) — **Owner: Sarah**

## Team Morale
**9/10** — Feature work feels great after the extraction cycle. Dish photos are a visible, user-facing improvement that supports the marketing strategy ("see the actual biryani").
