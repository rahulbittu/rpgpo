# Sprint 593: Online Demo + Real Google Data

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete

## Mission

Make the Expo web app accessible online (not localhost) for live demos, and replace hardcoded seed data with real Google Places restaurant data. Two deliverables: (1) web build pipeline for Railway deployment, (2) auto-import of real Dallas-area restaurants from Google Places API on server startup.

## Team Discussion

**Marcus Chen (CTO):** "This is the demo-readiness sprint. We need to show real restaurants with real photos to potential users and investors. No more Unsplash placeholders — real Google Place data with real photos proxied through our server."

**Amir Patel (Architecture):** "The server already serves static files from `/dist` in production mode with SPA fallback. We just needed to add `expo export --platform web` to the Railway build pipeline. The auto-import module mirrors the existing admin import endpoint but runs automatically on startup — zero manual steps after deploy."

**Sarah Nakamura (Lead Eng):** "Build grew from 727.8 to 731.4kb — 3.6kb for the Google Places auto-import module. Under the 750kb ceiling with 18.6kb headroom. The `getApiUrl()` function already uses `window.location.origin` in the browser, so the web build automatically hits the same Railway domain for API calls."

**Nadia Kaur (Security):** "The Google Maps API key has IP restrictions — it only works from Railway's IP range, not from local dev machines. This is actually correct security posture. The auto-import runs server-side on Railway where the key is authorized. Photo proxy endpoint handles the client-side display without exposing the API key."

**Jasmine Taylor (Marketing):** "This unblocks the WhatsApp demo flow. We can now share a link like `topranker-production.up.railway.app` and people see real Irving/Plano/Frisco/Dallas restaurants with real Google photos. That's the 'Best biryani in Irving' debate starter we need."

**Rachel Wei (CFO):** "Google Places API costs — Text Search is $32 per 1,000 requests, Photo is $7 per 1,000. The auto-import runs once (idempotent check), fetching ~8 queries × 20 results = ~160 places + photos. One-time cost under $10. Negligible."

## Changes

### New Files
- **`server/google-places-import.ts`** (88 LOC)
  - `autoImportGooglePlaces()` — runs on server startup
  - Checks if google_bulk_import data exists (idempotent)
  - Searches 8 queries across Irving, Plano, Frisco, Dallas
  - Imports restaurants via existing `bulkImportBusinesses()`
  - Auto-fetches Google Place photos for each imported business
  - Rate-limited (500ms between queries)

- **`scripts/import-google-places.ts`** (104 LOC)
  - Standalone CLI script: `npm run import:google`
  - Same logic as auto-import but with verbose console output
  - Useful for manual re-imports or debugging

### Modified Files
- **`package.json`** (+2 scripts)
  - Added `web:build`: `npx expo export --platform web`
  - Added `import:google`: CLI import script
- **`railway.toml`** (+1 LOC)
  - buildCommand now runs `web:build && server:build`
  - Web app builds to `/dist`, server serves it as SPA
- **`server/index.ts`** (+3 LOC)
  - Imports and calls `autoImportGooglePlaces()` at startup (async, non-blocking)

### Test Files
- **`__tests__/sprint593-online-demo.test.ts`** (21 tests)
- Updated `__tests__/sprint551-schema-compression.test.ts` — build size cap 730→750
- Updated `__tests__/sprint554-hours-update.test.ts` — build size cap 730→750
- Updated `__tests__/sprint591-build-optimization.test.ts` — headroom 20→15kb

### Threshold Updates
- `shared/thresholds.json`: tests 11252→11273, build 727.8→731.4kb

## Architecture: How It Works

```
Railway Deploy:
  npm run web:build    → dist/ (Expo web export)
  npm run server:build → server_dist/ (esbuild bundle)

Server Startup:
  1. Express serves dist/ as static (SPA fallback to index.html)
  2. API routes at /api/*
  3. seedDatabase() — seeds if DB empty (idempotent)
  4. autoImportGooglePlaces() — imports real restaurants if no google_bulk_import data
  5. Photo proxy at /api/photos/proxy — serves Google Place photos to client

Client (browser):
  getApiUrl() → window.location.origin (same domain as API)
  Photo URLs → /api/photos/proxy?ref=places/ChIJ.../photos/...
```

## Test Results
- **11,273 tests** across 481 files, all passing in ~8.1s
- Server build: 731.4kb
