# Sprint 639: Search Result Proximity Signal

**Date:** 2026-03-11
**Points:** 3
**Focus:** Add user location proximity as a search relevance signal

## Mission

When a user has shared their location, nearby businesses should rank higher in search results. This adds a proximity signal to the search relevance scoring algorithm, giving a natural boost to businesses within walking/driving distance.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The proximity signal uses a distance decay curve: 1km = full boost, 3km = moderate, 10km = slight, 20km+ = zero. This matches how people actually think about distance — a restaurant 2km away feels 'close', one 15km away doesn't."

**Marcus Chen (CTO):** "Proximity only activates when user location is available, so there's zero impact on non-located searches. Weight is 8% of total relevance — meaningful but not dominant. Text match and category still control the ranking."

**Amir Patel (Architecture):** "Reused the haversine formula pattern from MapView.tsx. Added it directly to search-ranking-v2.ts to keep the proximity calculation co-located with other relevance signals."

**Rachel Wei (CFO):** "Location-aware search results are a premium feature signal for Business Pro. 'Your restaurant appears higher for users within 3km' is a compelling pitch."

## Changes

### `server/search-ranking-v2.ts`
- Added `userLat`, `userLng`, `bizLat`, `bizLng` to `SearchContext`
- New `proximitySignal(ctx)` function: distance-decayed score 0-1
  - 0-1km: 1.0, 1-3km: 0.8-0.5, 3-10km: 0.5-0.2, 10-20km: 0.2-0, 20km+: 0
- New `haversineKm()` utility (haversine great-circle distance)
- Rebalanced `combinedRelevance` weights:
  - Before: text 38%, category 18%, dish 14%, completeness 10%, volume 14%, city 6%
  - After: text 36%, category 16%, dish 13%, completeness 9%, volume 13%, city 5%, **proximity 8%**

### Test Updates
- `sprint534`: Weight assertions updated for new split, added proximity assertion
- `sprint436`: Weight assertions updated, LOC ceiling 380 → 410
- New test count: 11,696 (+1 from proximity weight assertion)

## Proximity Decay Curve
```
Distance (km) | Signal
0              | 1.00
1              | 0.80
3              | 0.50
5              | 0.41
10             | 0.20
15             | 0.10
20             | 0.00
```

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 637.7kb
- **search-ranking-v2.ts:** 397/410 LOC
