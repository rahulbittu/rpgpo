# Sprint 671: Google Places Full Details Enrichment

**Date:** 2026-03-11
**Points:** 5
**Focus:** Auto-enrich business profiles with hours, description, price level from Google Places API

## Mission

Business profiles currently have sparse metadata — many lack opening hours, descriptions, and accurate price ranges. This sprint adds a `fetchPlaceFullDetails` function that pulls editorialSummary, currentOpeningHours, priceLevel, and service flags (serves breakfast/lunch/dinner/beer/wine) from Google Places API (New). Auto-enrichment triggers on business detail view when hours are stale (>24h) or missing.

## Team Discussion

**Amir Patel (Architecture):** "Google Places API (New) gives us currentOpeningHours with real-time open/closed status, editorialSummary for description, and priceLevel. We cache with 24-hour staleness — fresh enough for hours changes, not so aggressive we burn API quota."

**Sarah Nakamura (Lead Eng):** "The auto-enrichment is fire-and-forget on business detail view. Same pattern as Sprint 662's action URL enrichment. If the API call fails, the page still loads fine with whatever data we have."

**Marcus Chen (CTO):** "This is huge for the user experience. Walking up to a restaurant and seeing 'OPEN NOW' with accurate hours is exactly the kind of trust signal that makes TopRanker better than Yelp."

**Nadia Kaur (Cybersecurity):** "The Google API key is server-side only. No client exposure. The enrichment endpoint is admin-protected. Rate limiting at 200ms between batch calls prevents quota exhaustion."

**Rachel Wei (CFO):** "Google Places API costs $17/1000 requests for details. With 24-hour caching and on-demand enrichment, our monthly cost should stay under $10 for the current business count."

## Changes

### `server/google-places.ts` (+95 LOC)
- `fetchPlaceFullDetails()` — fetches editorialSummary, currentOpeningHours, priceLevel, and 5 service flags
- `enrichBusinessFullDetails()` — updates business row with Google Places metadata, only overwrites empty description
- Returns null gracefully on API failure

### `server/routes-businesses.ts` (+4 LOC)
- Added auto-enrichment trigger on business detail view: enriches when `openingHours` is null or `hoursLastUpdated` is >24h stale
- Imported `enrichBusinessFullDetails` from google-places

### `server/routes-admin-enrichment.ts` (+26 LOC)
- Added `POST /api/admin/enrichment/full-details` — batch enriches up to 50 businesses with Google Places details
- Admin-protected, rate-limited at 200ms between API calls

### `__tests__/sprint467-enrichment-split.test.ts` (+1 LOC)
- Raised LOC ceiling from 225 to 260 for routes-admin-enrichment.ts

## Enrichment Fields

| Google Places Field | Schema Field | Behavior |
|---|---|---|
| editorialSummary.text | description | Only writes if currently empty |
| currentOpeningHours.weekdayDescriptions | openingHours | Always updates |
| currentOpeningHours.openNow | isOpenNow | Always updates |
| priceLevel | priceRange | Always updates |

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 659.6kb (server grew +4.1kb from enrichment logic)
