# Sprint 453: Business Detail Hours Display

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Surface dynamic hours data on the business detail page. Sprint 447 added server-side `computeOpenStatus` for search filtering, but the single-business endpoint still returned the static `isOpenNow` field. This sprint adds dynamic hours computation to the individual business endpoint and enhances the OpeningHoursCard to display server-computed closing/opening times.

## Team Discussion

**Marcus Chen (CTO):** "The hours display gap was subtle but important. Search results showed dynamic open status (computed in real-time from openingHours periods), but clicking into a business detail showed the static isOpenNow flag from the database. If a restaurant closed 5 minutes ago, search would correctly show 'Closed' but the detail page would still show 'Open'. This sprint closes that inconsistency."

**Amir Patel (Architect):** "The fix is minimal — we reuse the same computeOpenStatus from hours-utils that the search endpoint already calls. The single-business endpoint now returns closingTime, nextOpenTime, and todayHours alongside the dynamic isOpenNow. The OpeningHoursCard accepts these as optional props and prefers them over client-side parsing."

**Rachel Wei (CFO):** "Hours accuracy is a trust signal. When a user drives to a restaurant that our app says is open, but it's actually closed — that's a trust-destroying experience. Dynamic hours computation eliminates the stale-data problem entirely."

**Sarah Nakamura (Lead Eng):** "The OpeningHoursCard already had solid client-side hour parsing (Sprint 359/407). But it relied on parsing weekday_text strings which is fragile. The server-computed values from the periods array are more reliable. We use a fallback pattern: prefer server data, fall back to client parsing."

**Priya Sharma (Frontend):** "The effectiveStatusText useMemo is clean — it checks server data first, then falls back to the existing status.statusText. No visual changes to the card layout, just more accurate status text."

## Changes

### Modified: `server/routes-businesses.ts` (340→348 LOC)
- Single-business endpoint now calls `computeOpenStatus` on the business's openingHours
- Returns `isOpenNow` (dynamic), `closingTime`, `nextOpenTime`, `todayHours` in response

### Modified: `components/business/OpeningHoursCard.tsx` (269→280 LOC)
- New optional props: `closingTime`, `nextOpenTime`, `todayHours`
- `effectiveStatusText` useMemo: prefers server-computed status over client-parsed
- Falls back to existing `status.statusText` when server data unavailable

### Modified: `app/business/[id].tsx` (537→543 LOC)
- Passes `closingTime`, `nextOpenTime`, `todayHours` from business data to OpeningHoursCard

## Test Coverage
- 20 tests across 4 describe blocks
- Validates: card props, server endpoint, wiring, docs
