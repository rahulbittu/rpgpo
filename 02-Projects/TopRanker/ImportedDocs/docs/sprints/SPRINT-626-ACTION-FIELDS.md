# Sprint 626: Decision-to-Action Layer — Schema + API

**Date:** 2026-03-11
**Type:** Core Loop — Decision-to-Action (Phase 1)
**Story Points:** 5
**Status:** COMPLETE

## Mission

Add action URL fields to the businesses schema and API — the foundation for the Decision-to-Action layer. Users should be able to act on their decisions (order, call, navigate, reserve) directly from TopRanker.

## Team Discussion

**Marcus Chen (CTO):** "This is the infrastructure sprint. 6 new URL columns in the businesses table: menuUrl, orderUrl, pickupUrl, doordashUrl, uberEatsUrl, reservationUrl. Combined with the existing phone, website, and googleMapsUrl, we now have 9 possible action types per business."

**Amir Patel (Architecture):** "The schema change is backward-compatible — all nullable text fields. The PUT /api/businesses/:slug/actions endpoint is owner-gated, meaning business owners who claim their listing can set their own action URLs. Admin can override."

**Sarah Nakamura (Lead Eng):** "The full pipeline is wired: schema → storage (updateBusinessActions) → route → ApiBusiness type → mapApiBusiness → MappedBusiness. Frontend components can now access these fields on any business card."

**Jasmine Taylor (Marketing):** "This is key for the value prop to business owners. 'Claim your listing on TopRanker → set your order/menu/reservation links → drive direct traffic from rankings.' It's the first revenue signal beyond subscriptions."

**Rachel Wei (CFO):** "Attribution tracking on these action links will be Sprint 630. For now, we're laying the data layer. But even before tracking, having 'Order Pickup' or 'View Menu' on ranked cards makes TopRanker feel like a complete decision engine."

## Changes

### Schema
- `shared/schema.ts` (+7 LOC) — Added 6 action URL columns to businesses table: menuUrl, orderUrl, pickupUrl, doordashUrl, uberEatsUrl, reservationUrl

### Server
- `server/routes-businesses.ts` (+28 LOC) — PUT /api/businesses/:slug/actions endpoint with owner/admin auth, field validation
- `server/storage/businesses.ts` (+12 LOC) — updateBusinessActions function

### Client Types
- `lib/api.ts` (+12 LOC) — Action fields in ApiBusiness interface + mapApiBusiness mapping
- `types/business.ts` (+9 LOC) — Action fields + phone/website/googleMapsUrl in MappedBusiness

## Verification
- 11,583 tests passing across 495 files
- Server build: 629.9kb (< 750kb ceiling)
- 30 tracked files, 0 threshold violations
- schema.ts: 905/960 LOC (94.3%)
- api.ts: 558/570 LOC (97.9%)
