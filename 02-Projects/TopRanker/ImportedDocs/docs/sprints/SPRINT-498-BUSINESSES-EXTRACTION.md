# Sprint 498: storage/businesses.ts Extraction

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Extract dish and photo storage functions from storage/businesses.ts to dedicated modules, reducing the file from 664 LOC (94.9% of threshold) to 555 LOC (79.3%). This was flagged as the top extraction target in Arch Audit #57.

## Team Discussion

**Marcus Chen (CTO):** "storage/businesses.ts was our next extraction target at 94.9%. The split is clean: dish functions go to the existing storage/dishes.ts, photo functions to new storage/photos.ts. Businesses.ts re-exports photos for backward compatibility."

**Amir Patel (Architect):** "The pattern matches Sprint 491's route extraction. Move functions to dedicated modules, re-export for compatibility, redirect tests. businesses.ts drops 109 lines — from 94.9% to 79.3% of threshold. Plenty of headroom now."

**Rachel Wei (CFO):** "Clean file health means faster feature delivery. Every time we approach a threshold, we spend a sprint extracting. Keeping files in the 60-80% range gives us 2-3 sprints of growth before the next extraction."

**Sarah Nakamura (Lead Eng):** "The re-export pattern for photos means zero changes needed for existing imports through storage/index.ts. Only routes-businesses.ts needed updating for the dish function — it was doing a direct import."

**Nadia Kaur (Cybersecurity):** "No security surface changes. Same functions, same validation, just different file locations. The extraction is purely organizational."

## Changes

### Modified: `server/storage/businesses.ts` (664 → 555 LOC, -16.4%)
- Removed `getTopDishesForAutocomplete` (moved to dishes.ts)
- Removed 5 photo functions (moved to photos.ts), replaced with re-export
- Cleaned up unused imports: `businessPhotos`, `getTemporalMultiplier`, `trackCacheHit`, `cacheGet`, `cacheSet`

### New: `server/storage/photos.ts` (88 LOC)
- `getBusinessPhotos` — single business photo URLs
- `getBusinessPhotosMap` — batch photo lookup by business IDs
- `insertBusinessPhotos` — bulk photo insert
- `getBusinessesWithoutPhotos` — find businesses missing photos
- `deleteBusinessPhotos` — remove all photos for a business

### Modified: `server/storage/dishes.ts` (443 → 474 LOC)
- Added `getTopDishesForAutocomplete` from businesses.ts

### Modified: `server/routes-businesses.ts`
- Updated dynamic import path from `./storage/businesses` to `./storage/dishes`

### Modified: `__tests__/sprint493-search-autocomplete.test.ts`
- Redirected dish autocomplete tests to read from `storage/dishes.ts`

### New: `__tests__/sprint498-businesses-extraction.test.ts` (16 tests)

## Test Coverage
- 16 new tests, all passing
- 1 test file redirected
- Full suite: 9,197 tests across 387 files, all passing in ~5.1s
- Server build: 664.2kb
