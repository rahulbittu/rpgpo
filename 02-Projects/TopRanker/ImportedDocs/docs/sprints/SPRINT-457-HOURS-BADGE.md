# Sprint 457: Search Card Hours Badge Enhancement

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Enhance search result cards with "closing soon" amber badge variant and complete the hours data pipeline from server to card display. The existing open/closed pill shows binary status — this sprint adds a time-aware "CLOSING SOON" state when a restaurant closes within 60 minutes, plus maps the full hours data (closingTime, nextOpenTime, todayHours) through the API client.

## Team Discussion

**Marcus Chen (CTO):** "The binary open/closed pill misses a critical user scenario: 'Should I go now?' If a restaurant closes in 20 minutes, showing 'OPEN' is technically correct but practically misleading. The 'CLOSING SOON' amber badge gives users actionable information to decide whether they have time for a visit."

**Rachel Wei (CFO):** "This is a trust feature. Nothing destroys trust faster than driving to a restaurant that our app says is 'Open' only to find it closing. The amber warning creates an honest middle ground — 'Yes it's open, but hurry.'"

**Amir Patel (Architect):** "The isClosingSoon helper is pure — takes a time string, returns boolean. No API calls, no state. It parses the HH:MM closing time and compares against current time. The 60-minute threshold is the same one OpeningHoursCard uses for its 'closing soon' badge, so we're consistent."

**Sarah Nakamura (Lead Eng):** "The API mapping gap was subtle. The server was returning closingTime, nextOpenTime, and todayHours since Sprint 447, but mapApiBusiness wasn't extracting them. The search card was already rendering item.closingTime and item.nextOpenTime — they just happened to be undefined. Now the full pipeline is connected."

**Priya Sharma (Frontend):** "The amber pill uses the same shadow glow pattern as the green open pill — just with AMBER color instead of green. Visual consistency with the 'closing soon' badge in OpeningHoursCard."

## Changes

### Modified: `components/search/SubComponents.tsx`
- New: `isClosingSoon(closingTime)` — checks if closing within 60 minutes
- New: `statusPillClosingSoon` style — amber variant with glow
- Updated: Status pill now shows 3 states: OPEN (green), CLOSING SOON (amber), CLOSED (red)

### Modified: `types/business.ts`
- Added `todayHours` field to MappedBusiness interface

### Modified: `lib/api.ts`
- mapApiBusiness now extracts closingTime, nextOpenTime, todayHours from server response

## Test Coverage
- 21 tests across 5 describe blocks
- Validates: isClosingSoon helper, closing soon pill, MappedBusiness type, API mapping, docs
