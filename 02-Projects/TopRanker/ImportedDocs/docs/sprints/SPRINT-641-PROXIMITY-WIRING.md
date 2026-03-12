# Sprint 641: Wire Proximity Signal to Search Pipeline

**Date:** 2026-03-11
**Points:** 2
**Focus:** Connect user location coordinates to the proximity signal in search results

## Mission

Sprint 639 added the proximity signal algorithm to search-ranking-v2, but the search-result-processor wasn't passing user/business coordinates to the SearchContext. This sprint completes the wiring.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "One-line change in the right place. The search pipeline already had `opts.userLat`/`opts.userLng` and `b.lat`/`b.lng` — just needed to pass them into the SearchContext."

**Amir Patel (Architecture):** "The frontend was already sending lat/lng via the search API query params. Server was already parsing them in routes-search.ts. The only gap was the SearchContext construction in search-result-processor.ts."

**Marcus Chen (CTO):** "Good example of how sprint splitting works well. Sprint 639 = algorithm, Sprint 641 = wiring. Clean separation of concerns."

## Changes

### `server/search-result-processor.ts`
- Added `userLat`, `userLng`, `bizLat`, `bizLng` to SearchContext construction in `enrichSearchResults()`
- `userLat`/`userLng` from `opts` (passed from search request query params)
- `bizLat`/`bizLng` from business record (`b.lat`, `b.lng` parsed to float)

## End-to-End Flow
```
search.tsx (user taps search)
  → fetchBusinessSearch(query, city, { lat: userLocation.lat, lng: userLocation.lng })
    → API: GET /api/businesses/search?q=biryani&city=dallas&lat=32.8&lng=-96.7
      → routes-search.ts: parseFloat(req.query.lat), parseFloat(req.query.lng)
        → enrichSearchResults(businesses, photos, { userLat, userLng, ... })
          → SearchContext { userLat, userLng, bizLat, bizLng }
            → proximitySignal() → 0-1 score
              → combinedRelevance() → weighted 8% into total relevance
```

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 637.9kb
