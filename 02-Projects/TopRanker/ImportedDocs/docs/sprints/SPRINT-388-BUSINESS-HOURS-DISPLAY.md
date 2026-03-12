# Sprint 388: Business Hours Display in Search Cards

**Date:** 2026-03-09
**Type:** UX Enhancement
**Story Points:** 3

## Mission

Show actionable timing info in search cards. Instead of just "OPEN" or "CLOSED", show "Closes at 10 PM" or "Opens at 11 AM" — helping users make real-time dining decisions.

## Team Discussion

**Marcus Chen (CTO):** "Timing info turns our search cards from a static directory into a real-time decision tool. 'Open · Closes 9 PM' tells users they have time; 'Closed · Opens 11 AM' tells them when to come back."

**Priya Sharma (Frontend):** "The status pill already existed. I added inline timing text to the pill for BusinessCard, and appended Open/Closed with timing to the meta line in MapBusinessCard. Minimal visual disruption."

**Amir Patel (Architecture):** "Added closingTime and nextOpenTime to MappedBusiness type. The API can populate these from Google Places data when available. Gracefully degrades — shows nothing if fields are absent."

**Jasmine Taylor (Marketing):** "'Open now' with timing info is a key feature for WhatsApp group posts. When someone asks 'where should we eat tonight?', seeing which places are open and when they close is immediate value."

## Changes

### Modified Files
- `types/business.ts` — Added `closingTime?: string` and `nextOpenTime?: string`
- `components/search/SubComponents.tsx` — Enhanced status pill in BusinessCard with "Closes X" / "Opens X" timing; added open/closed indicator with timing to MapBusinessCard meta line; 3 new styles

### New Files
- `tests/sprint388-business-hours-display.test.ts` — 14 tests

## Test Results
- **294 files**, **7,110 tests**, all passing
- Server build: **599.3kb**, 31 tables
