# Sprint 344: City Promotion Pipeline Refresh

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Progress percentages, promotion history, batch status endpoint

## Mission
The city promotion pipeline (Sprint 233) evaluates beta cities for promotion to active status. Sprint 344 adds three missing pieces: per-criterion progress percentages for dashboard visualization, a promotion history audit log, and a batch endpoint to check all beta cities at once.

## Team Discussion

**Cole Anderson (City Growth):** "The progress percentages are the piece we've been missing. Instead of a boolean 'eligible: false', admins now see 'businesses: 40%, members: 65%, ratings: 20%, daysInBeta: 80%' — they can see exactly where each city needs growth."

**Sarah Nakamura (Lead Eng):** "The batch endpoint runs all beta city checks in parallel with Promise.all. For 6 beta cities, that's 6 concurrent engagement queries instead of 6 sequential admin clicks."

**Marcus Chen (CTO):** "Promotion history is a governance requirement. When we promote a city, we need to know when it happened and what the metrics looked like at that moment. This is the audit trail we were missing."

**Jordan Blake (Compliance):** "The history log records promotedAt timestamp and metricsAtPromotion. If we ever need to justify a promotion decision to investors or for legal review, this is the evidence."

**Amir Patel (Architecture):** "Server build went from 590.5kb to 593.7kb — the 3.2kb increase is entirely from the new promotion logic. Still well under the 700kb threshold."

**Rachel Wei (CFO):** "The progress percentages will go straight into our investor dashboard. 'Oklahoma City is at 72% readiness for full launch' is a much better story than 'it's still in beta.'"

## Changes

### `server/city-promotion.ts` (102→137 LOC)
- Added `progress` field to PromotionStatus: businesses, members, ratings, daysInBeta, overall (all 0-100)
- Added `PromotionHistoryEntry` interface: city, promotedAt, metricsAtPromotion
- `promoteCity()` now accepts optional metrics param, records to history log
- New `getAllBetaPromotionStatus()`: batch check all beta cities in parallel
- New `getPromotionHistory()`: returns copy of history log

### `server/routes-admin-promotion.ts` (55→77 LOC)
- `GET /api/admin/promotion-status` — batch status for all beta cities
- `GET /api/admin/promotion-history` — promotion audit log
- `POST /api/admin/promote/:city` now captures metrics at promotion time

### Tests
- `tests/sprint344-promotion-refresh.test.ts` — 27 tests covering:
  - Progress percentage calculations (per-criterion and overall)
  - Promotion history interface, push on promote, copy semantics
  - Batch status endpoint, parallel execution, null filtering
  - Admin routes for new endpoints
  - Backwards compatibility with existing endpoints

## Test Results
- **260 test files, 6,352 tests, all passing** (~3.6s)
- **Server build:** 593.7kb (+3.2kb from promotion logic)

## Constitution Alignment
- **#9:** Low-data honesty — progress percentages show exactly where each city stands
- **#15:** One source of truth — promotion history is the audit trail
- **#1:** Restaurants first — promotion gates ensure cities meet quality thresholds before launch
