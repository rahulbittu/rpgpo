# Sprint 442: Search Filters v2 — Dietary Tags + Distance

**Date:** 2026-03-10
**Type:** Feature
**Story Points:** 3

## Mission

Add dietary tag filtering (vegetarian, vegan, halal, gluten-free) and distance-based filtering to the Discover search experience. These are the two most-requested filter types from Phase 1 users who need to find restaurants matching dietary restrictions within a radius.

## Team Discussion

**Marcus Chen (CTO):** "This completes the filter trilogy: we already have category/cuisine and price. Dietary tags and distance round out the discovery experience for our Indian Dallas First audience. Halal and vegetarian are critical for our target demographic."

**Rachel Wei (CFO):** "Dietary filters directly address user feedback. WhatsApp group members specifically asked 'Can I find vegetarian restaurants near me?' This is a retention feature — users who can't find what they need don't come back."

**Amir Patel (Architecture):** "Clean implementation: `dietaryTags` is a jsonb column with default empty array, so existing businesses get `[]` and need enrichment over time. Server-side haversine filtering uses the existing lat/lng fields. No new tables, no new indexes required — the jsonb column uses GIN if needed later."

**Sarah Nakamura (Lead Eng):** "Key changes: (1) `DietaryTagChips` in DiscoverFilters.tsx with 4 tags and leaf/nutrition/checkmark/ban icons, (2) `DistanceChips` with 1/3/5/10km options that only shows when location is available, (3) Server parses `dietary`, `lat`, `lng`, `maxDistance` query params, (4) `haversineKm()` utility for server-side distance calc, (5) API client passes new params, (6) search.tsx wires state + query key."

**Priya Sharma (Design):** "Dietary chips use green (#2D8F4E) for active state instead of amber — it's the universal 'healthy/dietary' color. Distance chips use navy, consistent with sort chips. Both scroll horizontally when space is tight. DistanceChips hide entirely until user grants location — no dead buttons."

**Nadia Kaur (Security):** "Lat/lng are parsed server-side with `parseFloat` — NaN values are safely handled as undefined. Dietary tags are sanitized through `sanitizeString` before splitting. No SQL injection risk since dietary filtering is done in application code, not SQL."

## Changes

### Modified Files
- `shared/schema.ts` (+1 LOC) — Added `dietaryTags` jsonb column to businesses table
- `components/search/DiscoverFilters.tsx` (208→321 LOC) — `DietaryTagChips` + `DistanceChips` + styles
- `server/routes-businesses.ts` (282→323 LOC) — `haversineKm()`, dietary/distance query params + filtering
- `lib/api.ts` (+7 LOC) — `fetchBusinessSearch` extended with opts for dietary/lat/lng/maxDistance
- `app/(tabs)/search.tsx` (698→711 LOC) — State for dietaryTags + distanceFilter, wired to query

### New Components
| Component | Props | Description |
|-----------|-------|-------------|
| `DietaryTagChips` | `activeTags`, `onTagToggle` | 4 dietary tag chips with icons, multi-select |
| `DistanceChips` | `activeDistance`, `onDistanceChange`, `hasLocation` | 4 distance options, only shown with location |

### Server API Changes
```
GET /api/businesses/search
  Existing: ?q=&city=&category=&cuisine=
  New:      ?dietary=vegetarian,halal&lat=32.8&lng=-96.7&maxDistance=5
  Response: { ...business, distanceKm: 2.3 }
```

## Test Results
- **337 files**, **~8,090 tests**, all passing
- Server build: **611.4kb**, 32 tables
- search.tsx: 711 LOC (79% of 900 threshold)
- DiscoverFilters.tsx: 321 LOC

## File Health
| File | LOC | Threshold | % | Status |
|------|-----|-----------|---|--------|
| search.tsx | 711 | 900 | 79% | OK |
| DiscoverFilters.tsx | 321 | — | — | OK |
| routes-businesses.ts | 323 | — | — | OK |
