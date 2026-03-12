# Sprint 288: Cuisine Types + Mock Data Update

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Complete cuisine data flow — add cuisine to API types, MappedBusiness, and mock data

## Mission
Ensure `cuisine` flows through the entire stack: schema → seed → API response → client type → UI. Sprint 286 added the database column, this sprint ensures the type system and mock data are consistent.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Three type files updated: `ApiBusiness`, `MappedBusiness`, and `mapApiBusiness`. Now cuisine flows cleanly from Drizzle schema through the API to the frontend."

**Dev Kapoor (Backend):** "The `ApiBusiness.cuisine` is `string | null` — matches the nullable schema column. `MappedBusiness.cuisine` is optional since older data may not have it."

**Priya Sharma (QA):** "Mock data updated — all 10 businesses now have cuisine tags: american (4), japanese (3), italian (2), vietnamese (1). This matches the actual restaurant identities."

**Marcus Chen (CTO):** "Small sprint but important — type safety across the stack prevents runtime errors. The cuisine field is now a first-class citizen everywhere."

## Changes
- `lib/api.ts` — Added `cuisine: string | null` to `ApiBusiness`, pass through in `mapApiBusiness`
- `types/business.ts` — Added `cuisine?: string | null` to `MappedBusiness`
- `lib/mock-data.ts` — Added `cuisine` to all 10 mock businesses
- 5 tests in `tests/sprint288-cuisine-types.test.ts`

## Test Results
- **209 test files, 5,653 tests, all passing** (~3.0s)
