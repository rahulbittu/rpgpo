# Sprint 446: Dietary Tag Enrichment + Admin Endpoint

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Build admin endpoints for managing dietary tags on businesses, including auto-enrichment based on cuisine type. This enables the operations team to efficiently tag businesses and improves search filter accuracy from Sprint 442's dietary filter feature.

## Team Discussion

**Marcus Chen (CTO):** "Dietary filtering in Sprint 442 was the right call, but it's only useful if businesses actually have tags. This sprint closes that gap with admin tooling. The auto-enrich endpoint is the key — mapping Indian→vegetarian, Middle Eastern→halal gives us instant coverage for our core Dallas market."

**Rachel Wei (CFO):** "Coverage metrics matter here. The stats endpoint gives us a dashboard number: what percentage of active businesses have dietary tags? That's a KPI we can track weekly. Right now it's probably near zero — auto-enrichment should jump us to 30-40% based on cuisine data."

**Amir Patel (Architect):** "Clean module isolation. `routes-admin-dietary.ts` is self-contained with its own log tag, validation constants, and cuisine mapping. No schema changes needed — we're using the `dietaryTags` jsonb column from Sprint 442. The dry-run mode on auto-enrich is smart defensive design."

**Sarah Nakamura (Lead Eng):** "Four endpoints covering the full CRUD cycle plus intelligence. Stats for monitoring, PUT for manual tagging, auto-enrich for bulk operations, and list with filter for the admin UI. Tag validation against VALID_TAGS prevents garbage data. The Set-based merge in auto-enrich prevents duplicates."

**Jasmine Taylor (Marketing):** "When we do WhatsApp outreach for Indian restaurants in Irving, being able to say 'we automatically tag vegetarian options' is a selling point. Restaurant owners care about being discoverable for dietary preferences — it's a real search behavior."

**Nadia Kaur (Security):** "Admin-only endpoints are properly scoped under `/api/admin/dietary/`. The tag validation whitelist (VALID_TAGS) prevents injection of arbitrary strings into the jsonb column. Dry-run default on auto-enrich is the right safety posture."

## Changes

### New: `server/routes-admin-dietary.ts` (~160 LOC)
- **GET /api/admin/dietary/stats** — Tag coverage overview (total, tagged, untagged, coveragePct, tagCounts)
- **PUT /api/admin/dietary/:businessId** — Set dietary tags for a business with validation
- **POST /api/admin/dietary/auto-enrich** — Suggest/apply tags based on CUISINE_TAG_SUGGESTIONS mapping
- **GET /api/admin/dietary/businesses** — List businesses with filter param (tagged/untagged/all)
- VALID_TAGS: vegetarian, vegan, halal, gluten_free
- CUISINE_TAG_SUGGESTIONS: indian→vegetarian, thai→gluten_free, middle_eastern→halal, mediterranean→vegetarian, japanese→gluten_free, mexican→gluten_free, vegan→[vegan,vegetarian], vegetarian→[vegetarian]
- Dry-run mode (default) for auto-enrich — preview before applying
- Set-based merge to prevent duplicate tags

### Modified: `server/routes.ts`
- Added import of `registerAdminDietaryRoutes`
- Added `registerAdminDietaryRoutes(app)` call

## Test Coverage
- 38 tests across 6 describe blocks in `__tests__/sprint446-dietary-enrichment.test.ts`
- Validates: file structure, endpoint registration, auto-enrichment logic, tag validation, routes wiring, sprint docs

## Metrics
- Server build: ~616kb
- Tables: 32 (unchanged)
- Admin endpoints: 44+ (was 40+)
