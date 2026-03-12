# Sprint 187: Restaurant Onboarding Automation

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Bulk restaurant import from Google Places, category normalization, deduplication, auto-photo fetching

---

## Mission Alignment
Core Value #1 (restaurants first) — we can't rank restaurants that aren't in the system. This sprint automates the restaurant discovery pipeline: admin triggers a city search, Google Places returns top restaurants, we deduplicate against existing records, normalize categories, generate slugs, import to database, and auto-fetch photos. One endpoint, one click, 20 restaurants imported with photos.

---

## Team Discussion

**Marcus Chen (CTO):** "The import pipeline is admin-triggered, not automated. That's intentional — we want human oversight on which cities and categories get imported. The endpoint searches Google Places Text Search, normalizes categories, deduplicates by googlePlaceId, generates slugs, and auto-fetches photos. Full pipeline in one API call."

**Sarah Nakamura (Lead Eng):** "searchNearbyRestaurants uses the Places Text Search API with field masks to minimize data transfer. We request only what we need: id, name, address, location, rating, priceLevel, types. The normalizeCategory function maps Google place types to our 6 category system."

**Amir Patel (Architecture):** "The import flow has three deduplication layers: googlePlaceId uniqueness check, slug collision handling with timestamp suffix, and error catching per insert. google-places.ts grew from 143 to ~240 lines — still well within bounds. routes-admin.ts grew by ~55 lines."

**Nadia Kaur (Security):** "Import is admin-only (requireAuth + requireAdmin). No public access. Google API key is server-side only, never exposed to client. Import rate is naturally limited by the API (20 results per search)."

**Rachel Wei (CFO):** "This is the distribution unblock. We can now populate any city in minutes instead of manually seeding. Dallas has 46 businesses, other cities have 8 each. After this sprint, admins can import 20 per city per search. Multiple category searches fill the database quickly."

**Jordan Blake (Compliance):** "Google Places data is public business information — no privacy concerns. We store the googlePlaceId for attribution and deduplication. The dataSource field ('google_bulk_import') provides an audit trail of how each business entered the system."

---

## Changes

### Modified Files
| File | Change |
|------|--------|
| `server/google-places.ts` | searchNearbyRestaurants (Text Search with full metadata), normalizeCategory (Google types → TopRanker categories) |
| `server/storage/businesses.ts` | bulkImportBusinesses (dedup + import), getImportStats, generateSlug |
| `server/storage/index.ts` | Export new functions |
| `server/routes-admin.ts` | POST /api/admin/import-restaurants, GET /api/admin/import-stats |

### API Endpoints (New)
| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| POST | `/api/admin/import-restaurants` | Admin | Bulk import from Google Places |
| GET | `/api/admin/import-stats` | Admin | Import statistics by city/source |

### Import Pipeline
1. Admin sends POST with city + category
2. searchNearbyRestaurants queries Google Places (max 20 results)
3. normalizeCategory maps Google types to TopRanker categories
4. bulkImportBusinesses checks for duplicates, generates slugs, inserts records
5. fetchAndStorePhotos auto-fetches photos for each newly imported business
6. Response includes imported/skipped counts and per-restaurant results

### Deduplication
- Primary: googlePlaceId unique check before insert
- Secondary: Slug collision detection with timestamp suffix
- Tertiary: Per-insert error catching (constraint violations)

### Category Mapping
| Google Type | TopRanker Category |
|-------------|-------------------|
| cafe, coffee_shop | cafe |
| bar, night_club | bar |
| bakery | bakery |
| meal_delivery, meal_takeaway | fast_food |
| (default) | restaurant |

---

## Test Results
- **46 new tests** for restaurant import
- Full suite: **3,039 tests** across 120 files — all passing, <2.0s
