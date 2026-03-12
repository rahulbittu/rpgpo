# Sprint 447: Hours-Based Search Filter

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add real-time hours-based filtering to the search experience. Replace the static `isOpenNow` boolean with dynamic computation from `openingHours` data, and add "Open Late" and "Open Weekends" filters for Dallas diners looking for specific availability.

## Team Discussion

**Marcus Chen (CTO):** "The static isOpenNow field is a lie — it's set at seed time and never updates. This sprint fixes that by computing open status in real-time from openingHours periods. For businesses with Google Places data, we get accurate open/close status. For businesses without hours data, we fall back to the existing static field."

**Rachel Wei (CFO):** "Open Late is a high-value filter for our Dallas market. The late-night dining crowd is underserved by Yelp and Google. If someone searches at 11pm and we can confidently show them what's actually open, that's a conversion moment. This is retention-driving functionality."

**Amir Patel (Architect):** "Clean separation of concerns. hours-utils.ts is a pure utility — no DB dependencies, no side effects. It takes openingHours JSON and returns computed status. The server endpoint pipes it through during the map phase. The client just passes boolean flags. Three layers, each testable independently."

**Sarah Nakamura (Lead Eng):** "The overnight period handling was the tricky part. A restaurant open Friday until 2am technically closes Saturday. The algorithm checks both the current day's periods and the previous day's overnight window. Central Time (America/Chicago) is hardcoded for Dallas — we'll parameterize when we expand to other timezones."

**Jasmine Taylor (Marketing):** "'What's open late near me' is one of the top search intents we see in WhatsApp groups. Adding visible 'Open Late' and 'Weekends' chips makes this searchable without typing. It's a visual discovery aid that drives engagement."

**Nadia Kaur (Security):** "No security concerns. Hours data is read-only from the business schema. The query params are simple boolean flags — no injection surface. The timezone computation is server-side, so clients can't manipulate it."

## Changes

### New: `server/hours-utils.ts` (~115 LOC)
- `computeOpenStatus(openingHours, now?)` — Real-time open/closed computation
  - Handles same-day periods, overnight periods, 24-hour businesses
  - Returns: isOpen, closingTime, nextOpenTime, todayHours
  - Uses America/Chicago timezone for Dallas
- `isOpenLate(openingHours)` — True if any period closes at/after 10pm or after midnight
- `isOpenWeekends(openingHours)` — True if has Saturday or Sunday periods

### Modified: `server/routes-businesses.ts` (323→340 LOC)
- Imports hours-utils functions
- Parses `openNow`, `openLate`, `openWeekends` query params
- Computes dynamic `isOpenNow` from openingHours during data mapping
- Adds `closingTime`, `nextOpenTime`, `todayHours` to response
- Filters results by hours criteria

### Modified: `components/search/DiscoverFilters.tsx` (321→370 LOC)
- New `HoursFilterChips` component with 3 options:
  - "Open Now" (time-outline icon)
  - "Open Late" (moon-outline icon)
  - "Weekends" (calendar-outline icon)
- Purple active state (#6B4EAA) — distinct from dietary green and distance navy
- Exports `HoursFilter` type and `getHoursFilters()` helper

### Modified: `lib/api.ts`
- Added `openNow`, `openLate`, `openWeekends` to fetchBusinessSearch opts
- Appends boolean flags to search URL

### Modified: `app/(tabs)/search.tsx` (711→718 LOC)
- Added `hoursFilters` state (HoursFilter[])
- Renders HoursFilterChips between DistanceChips and SortChips
- Includes hoursFilters in query key for proper cache invalidation
- Passes hours opts to fetchBusinessSearch

## Test Coverage
- 44 tests across 7 describe blocks in `__tests__/sprint447-hours-filter.test.ts`
- Validates: utility functions, server endpoint params, component structure, API client, search wiring, docs

## Metrics
- Server build: ~620kb
- Tables: 32 (unchanged)
