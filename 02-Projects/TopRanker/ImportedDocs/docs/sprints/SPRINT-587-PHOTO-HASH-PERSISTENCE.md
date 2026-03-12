# Sprint 587: Photo Hash DB Persistence

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete

## Mission

Persist SHA-256 content hashes to the `ratingPhotos` table and preload the hash index from DB on server startup. Resolves Audit #585 M1 (photo hash index not persistent — lost on restart).

## Team Discussion

**Amir Patel (Architecture):** "The in-memory hash index was Sprint 583's biggest gap — a server restart wiped all duplicate detection history. Adding `contentHash` as a varchar(64) column on `ratingPhotos` is the minimal persistent solution. The preload joins `ratingPhotos` with `ratings` to reconstruct full `HashEntry` objects including `memberId` and `businessId` for accurate cross-member detection."

**Sarah Nakamura (Lead Eng):** "Three touch points: schema column, write on insert, read on startup. The preload is async and non-blocking — server starts serving immediately while hashes load. If preload fails, it logs an error but doesn't crash the server."

**Nadia Kaur (Security):** "This closes the persistence gap in anti-gaming layer #7. Previously, a restart meant all photo fingerprints were lost. Now the index survives restarts and scales with the DB. Cross-member duplicate detection works correctly from boot because we join to get the original rater's memberId."

**Marcus Chen (CTO):** "Build grew from 721.3kb to 723.0kb — only 2kb headroom left before the 725kb ceiling. SLT-590 needs to address this. The hash persistence itself is clean — resolves a known audit item."

## Changes

### Modified Files
- **`shared/schema.ts`** (+1 LOC)
  - Added `contentHash` varchar(64) column to `ratingPhotos` table
- **`server/photo-hash.ts`** (107→145 LOC, +38)
  - Added `preloadHashIndex()` — reads all hashed photos from DB via inner join with ratings
  - Imports `db`, `ratingPhotos`, `ratings`, `isNotNull`, `eq` from drizzle
- **`server/routes-rating-photos.ts`** (179→180 LOC, +1)
  - Writes `contentHash: dupResult.hash` to `ratingPhotos` on insert
- **`server/index.ts`** (+3 LOC)
  - Imports and calls `preloadHashIndex()` at startup (async, non-blocking)

### Test Files
- **`__tests__/sprint587-photo-hash-persistence.test.ts`** (12 tests)
- Updated `__tests__/sprint583-photo-hash.test.ts` LOC threshold (110→150)

### Threshold Updates
- `shared/thresholds.json`: tests 11132→11146, build 721.3→723.0kb

## Test Results
- **11,146 tests** across 475 files, all passing in ~6.2s
- Server build: 723.0kb
