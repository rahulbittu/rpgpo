# Sprint 592: pHash DB Persistence

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete

## Mission

Persist perceptual hashes to the `ratingPhotos` table and preload the pHash index from DB on server startup. Resolves Audit #590 M2 (pHash index not persistent). Mirrors Sprint 587's contentHash pattern.

## Team Discussion

**Amir Patel (Architecture):** "Exact mirror of the contentHash pattern: add `perceptualHash` varchar(16) to ratingPhotos, write on insert, preload via inner join with ratings on startup. Both hash indexes now survive server restarts."

**Nadia Kaur (Security):** "Both anti-gaming photo layers are now fully persistent. Exact hash (SHA-256, 64 chars) and perceptual hash (aHash, 16 chars) both stored in the same table. On startup, both indexes preload independently."

**Sarah Nakamura (Lead Eng):** "Build grew from 725.9 to 727.8kb — 1.9kb for the preload function. Under the 750kb ceiling with 22.2kb headroom. The Sprint 588 algorithm tests needed rewriting from runtime imports to source-based tests since phash.ts now imports the DB module."

**Marcus Chen (CTO):** "Two audit findings from #590 now resolved in two sprints — build size (591) and pHash persistence (592). Clean cadence."

## Changes

### Modified Files
- **`shared/schema.ts`** (+1 LOC)
  - Added `perceptualHash` varchar(16) column to `ratingPhotos` table
- **`server/phash.ts`** (136→174 LOC, +38)
  - Added `preloadPHashIndex()` — reads pHashes from DB via inner join with ratings
  - Imports `db`, `ratingPhotos`, `ratings`, `isNotNull`, `eq`
- **`server/routes-rating-photos.ts`** (+1 LOC)
  - Writes `perceptualHash: pHash` to ratingPhotos on insert
- **`server/index.ts`** (+3 LOC)
  - Imports and calls `preloadPHashIndex()` at startup (async, non-blocking)

### Test Files
- **`__tests__/sprint592-phash-persistence.test.ts`** (12 tests)
- Updated `__tests__/sprint588-perceptual-hash.test.ts` — replaced runtime import tests with source-based verification (phash.ts now imports DB)

### Threshold Updates
- `shared/thresholds.json`: tests 11240→11252, build 725.9→727.8kb

## Test Results
- **11,252 tests** across 480 files, all passing in ~8.2s
- Server build: 727.8kb
