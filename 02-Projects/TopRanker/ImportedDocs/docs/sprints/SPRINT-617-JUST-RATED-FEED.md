# Sprint 617: Just-Rated Feed Section in Discover

**Date:** 2026-03-11
**Type:** Core Loop — Social Proof & Engagement
**Story Points:** 3
**Status:** COMPLETE

## Mission

Add a "Just Rated" feed section to the Discover tab showing businesses that received community ratings in the last 24 hours. This creates social proof ("others are rating too") and drives exploration of recently-active businesses.

## Team Discussion

**Marcus Chen (CTO):** "This closes the feedback loop between rating and discovery. When someone rates a restaurant, it bubbles up in the Just Rated feed, which encourages others to rate the same place — creating a virtuous cycle. The 24-hour window keeps it fresh and creates urgency."

**Amir Patel (Architecture):** "Full vertical slice: storage query → cached with 5-min TTL → API route → client fetch → component → integration. The query uses a subquery to find distinct business IDs from recent ratings, then joins to businesses. The cache-aside pattern prevents DB hammering."

**Sarah Nakamura (Lead Eng):** "The component follows the TrendingSection pattern exactly — same thumbnail layout, same navigation, same accessibility. The only difference is the 'New rating' amber badge instead of the rank delta badge. Consistent visual language."

**Jasmine Taylor (Marketing):** "This is huge for early growth. When we have 20-30 ratings per day in Dallas, this section shows real activity. It's social proof that the platform is alive. 'People are rating restaurants right now' is powerful for new users."

**Priya Sharma (Design):** "Flash icon for the header — lightning bolt communicates 'just happened, fresh activity.' The amber 'New rating' badge on each card is a subtle call-to-action without being pushy. The 'last 24 hours' subtitle sets expectations."

**Nadia Kaur (Security):** "The endpoint is public with a 5-minute cache — no auth required for discovery. The 24-hour window and limit=10 cap prevent data leakage concerns. No user information is exposed, only business data."

## Changes

### New Files
- `components/search/JustRatedSection.tsx` (122 LOC) — Feed section component
  - Flash icon header, "last 24 hours" subtitle
  - Business cards with photo, rank, score, category, "New rating" badge
  - SafeImage with branded fallback
  - Returns null when empty

### Server Changes
- `server/storage/businesses.ts` (600→624 LOC, +24) — `getJustRatedBusinesses()` with 24h cutoff, 5-min cache
- `server/storage/index.ts` — Re-export getJustRatedBusinesses
- `server/routes.ts` (353→367 LOC, +14) — `/api/just-rated` endpoint with limit cap
- `server/cache-headers.ts` — Cache rule: 5-min maxAge, 1-min stale-while-revalidate

### Client Changes
- `lib/api.ts` (518→525 LOC, +7) — `fetchJustRated()` function
- `app/(tabs)/search.tsx` (561→568 LOC, +7) — useQuery for just-rated, pass to DiscoverSections
- `components/search/DiscoverSections.tsx` (155→159 LOC, +4) — Import, prop, render JustRatedSection

### Test Updates
- `__tests__/sprint617-just-rated-feed.test.ts` — 32 assertions across component, server, client, integration
- 5 stale LOC ceiling tests updated (sprint498, 500, 505, 549, 576)

### Thresholds
- `shared/thresholds.json` — Added JustRatedSection (maxLOC 140), updated businesses.ts (620→650), api.ts, routes.ts, search.tsx, DiscoverSections, tracked files 27→28, tests 11347→11379, build 733.4→734.9kb

## Verification
- 11,379 tests passing across 486 files (6.0s)
- Server build: 734.9kb (< 750kb ceiling)
- 28 tracked files, 0 threshold violations

## PRD Gaps Closed
- No "recently rated" social proof in Discover — now shows active community behavior
