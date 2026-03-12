# Sprint 338: Production Seed Refresh (Railway Enrichment)

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Enrich seed data with opening hours, leaderboard eligibility, and production-quality fields

## Mission
The seed data powers Railway production. Previously, businesses had static `isOpenNow` booleans and no `openingHours`, no `dineInCount`, and no `credibilityWeightedSum`. This sprint adds category-specific opening hours templates, calculates leaderboard eligibility from seed metrics, and sets `hoursLastUpdated` timestamps — making production data realistic and feature-complete.

## Team Discussion

**Marcus Chen (CTO):** "Seed data IS production data until we have real restaurants. Every field that exists in the schema but isn't populated in seeds is a gap that makes the app look incomplete. Opening hours are especially important — the isOpenNow badge on cards needs real data behind it."

**Amir Patel (Architecture):** "Six hours templates: restaurant, cafe, bar, bakery, fast_food, street_food. Each maps to realistic operating hours. The `getHoursForCategory` function keeps the mapping clean. Leaderboard eligibility is calculated from seed metrics: 60% of totalRatings as dine-in, weighted sum from score × ratings × 0.7."

**Sarah Nakamura (Lead Eng):** "The enrichment is additive — we're populating existing schema fields that were left null. No schema changes needed. The `hoursLastUpdated` timestamp ensures the hours-checking logic won't flag stale data."

**Rachel Wei (CFO):** "Production readiness is table stakes. If a user opens the app and sees 'Hours: Unknown' on every restaurant, we look like an empty directory. These hours are placeholders until Google Places enrichment, but they're better than nothing."

**Jasmine Taylor (Marketing):** "For WhatsApp sharing, knowing a restaurant's hours matters. 'Check out Spice Garden — rated 4.7/5, open until 10pm' is more actionable than just the rating."

**Priya Sharma (QA):** "18 new tests verifying: all 6 hours templates exist, all 7 days covered, seed insert populates openingHours/hoursLastUpdated/dineInCount/credibilityWeightedSum/leaderboardEligible, and category mapping is correct."

## Changes
- `server/seed.ts` — Added 6 opening hours templates (HOURS_RESTAURANT/CAFE/BAR/BAKERY/FAST_FOOD/STREET_FOOD), `getHoursForCategory()` mapping function, and enriched seed insert with openingHours, hoursLastUpdated, dineInCount, credibilityWeightedSum, leaderboardEligible

## Test Results
- **255 test files, 6,255 tests, all passing** (~3.5s)
- **Server build:** 590.5kb (under 700kb threshold)
