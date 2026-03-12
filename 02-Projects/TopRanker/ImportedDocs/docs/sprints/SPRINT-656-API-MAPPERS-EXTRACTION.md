# Sprint 656: Extract API Mapping Functions

**Date:** 2026-03-11
**Points:** 2
**Focus:** Extract mapApiBusiness, mapApiRating, resolvePhotoUrl from api.ts to lib/api-mappers.ts — addressing Audit #110 M2 finding

## Mission

api.ts was at 98% ceiling (560/570 LOC) — flagged as M2 in Audit #110. The mapping functions (mapApiBusiness, mapApiRating, resolvePhotoUrl) are the largest block of code in the file and have a clear extraction boundary. Extract them to `lib/api-mappers.ts` while maintaining re-exports from api.ts for backwards compatibility.

## Team Discussion

**Amir Patel (Architecture):** "The extraction is clean — 77 lines moved out. api.ts drops from 560 to 483 LOC (85% ceiling). We've bought significant headroom for new API endpoints."

**Sarah Nakamura (Lead Eng):** "Re-exports from api.ts ensure no import changes needed in consuming files. The 5 structural tests needed updates to point to api-mappers.ts instead of api.ts for mapping checks."

**Marcus Chen (CTO):** "This follows the same pattern as Sprint 651 (useSearchActions extraction). Extract when at ceiling, re-export for compatibility, update structural tests."

**Nadia Kaur (Cybersecurity):** "No security changes. The mapping functions are pure data transformers with no side effects."

## Changes

### `lib/api-mappers.ts` (NEW — 87 LOC)
- `resolvePhotoUrl()` — photo URL proxy resolution
- `mapApiBusiness()` — ApiBusiness → MappedBusiness mapping
- `mapApiRating()` — ApiRating → MappedRating mapping

### `lib/api.ts` (560 → 483 LOC)
- Removed inline mapping functions
- Added import + re-export: `import { mapApiBusiness, mapApiRating } from "./api-mappers"; export { mapApiBusiness, mapApiRating };`
- Removed unused `CredibilityTier` import

### Test Updates
- `sprint288`: reads api-mappers.ts for cuisine mapping check
- `sprint457`: reads api-mappers.ts for hours field mapping checks
- `sprint548`: reads api-mappers.ts for photo field mapping checks
- `sprint562`: api.ts LOC ceiling 575→490
- `sprint626`: reads api-mappers.ts for action field mapping checks, LOC 570→490

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 646.8kb (no change)
- **api.ts:** 483 LOC (ceiling 490) — 99% → will lower ceiling in next sprint
