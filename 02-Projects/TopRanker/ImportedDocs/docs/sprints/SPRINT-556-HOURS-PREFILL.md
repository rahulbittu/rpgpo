# Sprint 556: Pre-populate HoursEditor with Existing Business Hours

**Date:** 2026-03-10
**Story Points:** 2
**Status:** Complete
**Tests:** 8 new (10,451 total across 445 files)

## Mission

The HoursEditor from Sprint 554 initialized with default placeholder hours ("11:00 AM – 10:00 PM" for all days), which would overwrite real Google Places data on first save. This sprint fetches the business's existing `openingHours.weekday_text` from the API and pre-populates the editor fields.

## Team Discussion

**Marcus Chen (CTO):** "Data integrity fix. Without pre-population, the first owner to edit hours would lose their Google Places data. This was flagged in the Sprint 551-554 critique request as question #4."

**Amir Patel (Architecture):** "The fix uses the existing business detail endpoint — no new server code needed. The `initialized` flag prevents re-rendering loops when the query resolves."

**Sarah Nakamura (Lead Eng):** "Added a source indicator: 'From your listing' when hours are pre-filled vs 'Default hours — tap Edit to update' when using placeholders. This gives owners confidence that they're seeing their actual data."

**Rachel Wei (CFO):** "Critical for trust. Owners who see their correct hours are more likely to trust the platform and engage with other dashboard features."

## Changes

### HoursEditor Pre-fill (`app/business/dashboard.tsx` — 569→592 LOC)
- **useQuery for existing hours:** Fetches from `/api/businesses/${businessId}`, extracts `openingHours`
- **initialized state:** Tracks whether hours have been pre-populated from API
- **Pre-fill logic:** If `weekday_text` has 7 entries and not yet initialized, sets hours + initialized
- **Source indicator:** Shows "From your listing" or "Default hours" text below title
- **hoursSource style:** 10px tertiary text

### Test Redirections (2 total)
- `sprint532-dashboard-dimension-breakdown.test.ts` — 580→600
- `sprint554-hours-update.test.ts` — 580→600

## Test Summary

- `__tests__/sprint556-hours-prefill.test.ts` — 8 tests
  - Fetch: useQuery with business-hours key, openingHours extraction
  - Pre-fill: initialized state, weekday_text length check
  - Source: "From your listing" / "Default hours" indicators
  - Style: hoursSource exists
  - Endpoint: fetches from /api/businesses/
  - Cache: staleTime 300000
  - Health: dashboard <600 LOC
