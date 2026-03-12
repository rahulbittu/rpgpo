# Sprint 623: "Best In" Links Fix + Google Places API Fallback

**Date:** 2026-03-11
**Type:** Core Loop — CEO Feedback (Navigation Fix + Empty State)
**Story Points:** 5
**Status:** COMPLETE

## Mission

Fix broken "Best In" category navigation by registering the `dish/[slug]` route in the Stack Navigator. Also fix missing `share/[slug]` route. Add Google Places API fallback when TopRanker has no local data for a city — CEO wanted 10-20 restaurants shown on-the-fly from Google.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The root cause was trivial but critical — `dish/[slug]` existed as a page file but was never registered in `_layout.tsx`. Same for `share/[slug]`. Expo Router silently fails on unregistered routes. Two lines fixed the entire 'Best In links don't work' bug."

**Amir Patel (Architecture):** "The Google Places fallback uses the existing `searchNearbyRestaurants()` function from Sprint 187 — zero new external API code needed. We just wired it through a new `/api/google-places-fallback` route and a client-side component."

**Marcus Chen (CTO):** "The GooglePlacesFallback component is smart about showing Google attribution ('via Google'), and each place has a 'Rate' CTA that pushes users toward rating. This turns an empty state into a conversion opportunity."

**Priya Sharma (Design):** "The fallback shows Google star ratings with the yellow color (#FBBC04) to make it clear these are external ratings, not TopRanker scores. The 'Be the first!' messaging reinforces our value prop."

**Jasmine Taylor (Marketing):** "This is critical for our WhatsApp campaign. When new users land in cities we haven't seeded yet, they'll see restaurants immediately instead of a blank screen. Huge for first-impression retention."

## Changes

### Navigation Fixes
- `app/_layout.tsx` — Added `dish/[slug]` (slide_from_right) and `share/[slug]` (fade) Stack.Screen registrations

### New Files
- `components/search/GooglePlacesFallback.tsx` (142 LOC) — Google Places fallback UI
  - Loading state with ActivityIndicator
  - Place rows with name, address, Google rating, price level
  - "Rate" CTA per place
  - "via Google" attribution header

### New Route
- `server/routes.ts` (+10 LOC) — `/api/google-places-fallback` endpoint
  - Accepts city, category, limit params
  - Delegates to `searchNearbyRestaurants()`
  - Returns `{ data, source: "google_places" }`

### Modified Files
- `lib/api.ts` (+19 LOC) — `fetchGooglePlacesFallback()` + `GooglePlaceResult` type
- `components/search/DiscoverEmptyState.tsx` (+4 LOC) — Renders GooglePlacesFallback in list variant

## Verification
- 11,504 tests passing across 492 files
- Server build: 627.3kb (< 750kb ceiling)
- 30 tracked files, 0 threshold violations
- routes.ts: 377/400 LOC (94.3%)
- api.ts: 544/560 LOC (97.1%)
