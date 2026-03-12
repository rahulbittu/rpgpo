# Sprint 662: Auto-Fetch Action URLs from Google Places

**Date:** 2026-03-11
**Points:** 3
**Focus:** Auto-populate DoorDash, Uber Eats, menu, and Google Maps URLs — no owner input required

## Mission

Business owners shouldn't have to manually enter DoorDash/Uber Eats/menu URLs. This sprint auto-enriches businesses with:
1. **Website + Google Maps URL** from Google Places API (New)
2. **DoorDash search URL** constructed from business name + city
3. **Uber Eats search URL** constructed from business name + city
4. **Menu URL** falls back to the restaurant's website

Enrichment happens automatically on business detail page view when action URLs are missing.

## Team Discussion

**Marcus Chen (CTO):** "This is the right approach. Owners won't fill in these URLs. We fetch what Google has (website, Maps link) and construct delivery platform search links. The user taps 'Order on DoorDash' and lands on the DoorDash search page for that restaurant."

**Amir Patel (Architecture):** "The enrichment is fire-and-forget on page view — doesn't block the response. First visit triggers the fetch and stores results. Second visit uses cached data. No API cost on repeat views."

**Jasmine Taylor (Marketing):** "Every business page now has actionable buttons from day one. No waiting for owners to claim and fill in data. This makes every business page feel complete and useful."

**Nadia Kaur (Cybersecurity):** "DoorDash/Uber Eats URLs are constructed search links, not deep links. No API keys or auth needed. Google Places fetch uses existing API key with field-level billing (websiteUri + googleMapsUri = 2 fields)."

**Sarah Nakamura (Lead Eng):** "Build size went from 647.1→650.1kb (+3kb) for the new fetch + enrichment functions. Well within the 750kb ceiling."

## Changes

### `server/google-places.ts` (234 → 326 LOC)
- **`fetchPlaceActionUrls(googlePlaceId, businessName, city)`** — fetches websiteUri + googleMapsUri from Google Places API (New), constructs DoorDash/Uber Eats search URLs
- **`enrichBusinessActionUrls(businessId, googlePlaceId, businessName, city)`** — calls fetchPlaceActionUrls and stores results via updateBusinessActions

### `server/routes-businesses.ts` (257 → 261 LOC)
- Added `enrichBusinessActionUrls` import
- Business detail endpoint auto-triggers enrichment when `googlePlaceId` exists but `menuUrl` and `doordashUrl` are null
- Fire-and-forget (`.catch(() => {})`) — doesn't block response

## URL Construction

| Platform | URL Pattern |
|----------|------------|
| DoorDash | `doordash.com/search/store/{name}+{city}/` |
| Uber Eats | `ubereats.com/search?q={name}+{city}` |
| Menu | Falls back to restaurant website from Google Places |
| Google Maps | Direct from Google Places `googleMapsUri` |

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 650.1kb (was 647.1kb — +3.0kb for enrichment functions)
