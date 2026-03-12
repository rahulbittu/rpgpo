# Sprint 87 — Google Places Photo Pipeline + Brand Hardening

**Date:** 2026-03-08
**Duration:** 1 session
**Story Points:** 13
**Theme:** Close the last major UX gap — real Google Places photos flowing into every screen

---

## Mission Alignment

TopRanker's ranking cards are only as compelling as the photos behind them. Without real business photos, users see amber gradient fallbacks — which are beautiful, but don't drive trust. This sprint closes the biggest remaining PRD gap: a working pipeline from Google Places API → our DB → every photo component.

---

## Team Discussion

**Kai Nakamura (Frontend Lead):** "The navyDark constant was a quick win — four files had `#162940` or `#1A3050` hardcoded. Now every navy gradient value comes from `BRAND.colors`. Zero brand drift possible."

**Sarah Nakamura (QA Lead):** "I wrote the push token validation tests last sprint as an action item — 13 tests covering format validation, length bounds, and the endpoint contract. This sprint we added 21 more tests for the photo pipeline. We're at 265 tests now, sub-500ms."

**Marcus Chen (Backend Lead):** "The Google Places photo fetcher is clean. We call the Places API (New) — `places/{placeId}` with `fields=photos` — get back photo reference names, and store them in `businessPhotos`. The proxy endpoint we built in Sprint 83 already handles the actual image serving. Zero new infrastructure needed."

**Priya Sharma (Architect):** "I like the on-demand fetch pattern in the business detail route. If a business has a `googlePlaceId` but no photos in `businessPhotos`, we fetch inline on first view. Subsequent views hit the cached DB rows. This means we don't need a batch job to populate every business upfront — they self-heal."

**Liam O'Brien (DevOps):** "The `resolvePhotoUrl` function in `lib/api.ts` is the key connector. Photo URLs that start with `places/` get rewritten to `/api/photos/proxy?ref=...` — the frontend never directly hits Google. This means our API key stays server-side and we get 24-hour CDN caching on the proxy responses."

**Jordan Blake (Compliance):** "Good that the API key is never exposed to the client. The proxy endpoint rate-limits at the API level, and we validate that refs start with `places/` to prevent SSRF. Solid security posture."

**Rachel Wei (CFO):** "Google Places API calls cost $0.032 per request for Place Details. With on-demand fetching and DB caching, we only call once per business. For 1,000 businesses across 5 cities, that's ~$32 total. Negligible."

**Jasmine Taylor (Marketing):** "Real photos are a game-changer for social sharing and first impressions. The amber fallback is elegant, but nothing beats seeing the actual restaurant. This should improve our screenshot-to-download conversion."

---

## Changes

### 1. navyDark Brand Constant
- Added `navyDark: "#162940"` to `BRAND.colors` in `constants/brand.ts`
- Replaced hardcoded values in 4 files:
  - `app/(tabs)/challenger.tsx` — gradient background
  - `app/business/enter-challenger.tsx` — hero gradient
  - `app/(tabs)/profile.tsx` — tier card gradient + founding badge
  - `app/referral.tsx` — hero gradient

### 2. Push Token Validation Tests
- Created `tests/push-token.test.ts` — 13 tests
- Covers: valid Expo tokens, alphanumeric tokens, null/undefined/empty rejection, length bounds, type checking
- Validates endpoint contract: 401 unauthenticated, 200 on success, 400 on missing token

### 3. Google Places Photo Fetching Pipeline (MAJOR)

**New file: `server/google-places.ts`**
- `fetchPlacePhotos(placeId, limit)` — Calls Google Places API (New) to get photo references
- `searchPlace(query, city)` — Text search to find Place IDs (for backfilling)
- `fetchAndStorePhotos(businessId, placeId)` — End-to-end: fetch refs → store in DB

**New storage functions in `server/storage/businesses.ts`:**
- `insertBusinessPhotos(businessId, photos[])` — Bulk insert into `businessPhotos`
- `getBusinessesWithoutPhotos(city?, limit)` — LEFT JOIN to find businesses with `googlePlaceId` but no photos
- `deleteBusinessPhotos(businessId)` — For re-fetching stale photos

**New admin endpoint: `POST /api/admin/fetch-photos`**
- Requires admin auth
- Accepts optional `city` and `limit` params
- Finds businesses without photos, calls Google Places API, stores results
- Returns per-business results with photo counts

**On-demand fetch in `GET /api/businesses/:slug`:**
- If business has `googlePlaceId` but no photos in `businessPhotos`, fetches inline
- Non-fatal: failure falls back to existing `photoUrl` or amber gradient

**Frontend URL resolution in `lib/api.ts`:**
- `resolvePhotoUrl()` — Converts `places/...` references to `/api/photos/proxy?ref=...` URLs
- Applied in `mapApiBusiness()` so all photo URLs are resolved before reaching components

### 4. Tests
- `tests/google-places-photos.test.ts` — 21 tests:
  - Photo URL resolution (7 tests): proxy conversion, HTTP passthrough, empty string, custom base URL
  - Photo reference validation (6 tests): format validation, segment checking
  - Admin endpoint contract (4 tests): auth, success response, zero results, city filter
  - Photo proxy contract (4 tests): missing ref, invalid ref, no API key, timeout

---

## Files Changed

| File | Change |
|------|--------|
| `constants/brand.ts` | Added `navyDark` |
| `app/(tabs)/challenger.tsx` | Use `BRAND.colors.navyDark` |
| `app/(tabs)/profile.tsx` | Use `BRAND.colors.navyDark` |
| `app/business/enter-challenger.tsx` | Use `BRAND.colors.navyDark` |
| `app/referral.tsx` | Use `BRAND.colors.navyDark` |
| `server/google-places.ts` | **NEW** — Places API integration |
| `server/storage/businesses.ts` | Added 3 new storage functions |
| `server/storage/index.ts` | Export new functions |
| `server/routes.ts` | Admin fetch-photos endpoint + on-demand fetch |
| `lib/api.ts` | `resolvePhotoUrl()` for Places reference → proxy URL |
| `tests/push-token.test.ts` | **NEW** — 13 tests |
| `tests/google-places-photos.test.ts` | **NEW** — 21 tests |

---

## Quality Gates

- [x] 265 tests passing (22 files) — sub-500ms
- [x] Zero TypeScript errors (`tsc --noEmit`)
- [x] Zero hardcoded navyDark hex values
- [x] Photo proxy validates refs server-side (no SSRF)
- [x] API key stays server-side only
- [x] On-demand fetch is non-fatal (graceful degradation)

---

## PRD Gaps Closed

- ~~Google Places photo fetching~~ → DONE (Pipeline: fetch → store → proxy → display)
- ~~navyDark brand constant~~ → DONE
- ~~Push token integration test~~ → DONE
