# Sprint 404: Discover Trending Section Refresh

**Date:** 2026-03-09
**Type:** Feature Enhancement + Extraction
**Story Points:** 3

## Mission

Extract and enhance the trending section from search.tsx with photo thumbnails, score display, time context ("this week"), and mover count. Constitution #5: "Live leaderboard is the product." Trending shows the leaderboard in motion — businesses that are rising right now.

## Team Discussion

**Marcus Chen (CTO):** "Trending was inline in search.tsx — 35 LOC of JSX + 12 styles. Extracting it reduces search.tsx from 752→688 LOC (76% of threshold, down from 84%). That's the architecture win. The UX win is richer trending rows with photos, scores, and time context."

**Jasmine Taylor (Marketing):** "'Up 3 this week' with a photo thumbnail is immediately shareable. Users screenshot trending sections and share in WhatsApp groups — 'Look who's rising in Dallas!' We need to make that screenshot look good."

**Amir Patel (Architecture):** "TrendingSection is a clean extraction — single prop (trending: MappedBusiness[]), self-contained styles, no side effects. search.tsx lost 64 LOC net. Zero test cascades because no existing tests targeted the inline trending JSX directly."

**Priya Sharma (Frontend):** "Photo thumbnails with emoji placeholders match our SafeImage pattern. Score + rank + category in a meta row gives users the full picture without tapping in. The delta badge with 'this week' label adds temporal context."

**Sarah Nakamura (Lead Eng):** "search.tsx at 688 LOC / 76% is the healthiest it's been since Sprint 361. The extraction pattern continues to work — extract inline sections into dedicated components when enhancing them."

## Changes

### New Files
- `components/search/TrendingSection.tsx` — Extracted trending section with photo thumbnails, score display, rank delta with time context, mover count header. ~145 LOC.
- `tests/sprint404-trending-section.test.ts` — 14 tests

### Modified Files
- `app/(tabs)/search.tsx` — Replaced inline trending section with TrendingSection component, removed 10 trending styles. -64 LOC (752→688).

## Test Results
- **307 files**, **7,346 tests**, all passing
- Server build: **601.1kb**, 31 tables
