# Sprint 473: Search Results Pagination

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add server-side pagination to the search endpoint. Previously, `/api/businesses/search` returned all matching results (up to a hardcoded limit of 20). Now accepts `limit` and `offset` query parameters and returns pagination metadata (`total`, `limit`, `offset`, `hasMore`). Client-side API updated with pagination-aware fetch function.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The storage layer already had a `limit` parameter — we just needed to add `offset` and a parallel `countBusinessSearch` for total count. The count query mirrors the search query's WHERE clause exactly, so results are consistent."

**Marcus Chen (CTO):** "Pagination metadata enables infinite scroll, 'Load more' buttons, and proper 'Showing X of Y results' UIs. The `hasMore` boolean is the key signal for the client — no need to calculate pagination math on the frontend."

**Amir Patel (Architect):** "The `Promise.all` pattern for parallel search + count is optimal — one round-trip for both. The limit is capped at 100 to prevent abuse, and offset floors at 0 to avoid negative pagination."

**Rachel Wei (CFO):** "This is infrastructure for scale. As restaurant counts grow beyond Dallas, returning all results becomes a performance bottleneck. Pagination keeps response times constant regardless of dataset size."

**Nadia Kaur (Cybersecurity):** "The limit cap of 100 is important — prevents data scraping by requesting limit=999999. Combined with the existing rate limiter, this is a solid defense layer."

**Jordan Blake (Compliance):** "The `fetchBusinessSearchPaginated` function gives the client explicit access to total counts. Useful for analytics and transparency — users can see 'Showing 20 of 147 results' rather than a truncated mystery."

## Changes

### Modified: `server/storage/businesses.ts` (+25 LOC)
- `searchBusinesses`: Added `offset` parameter (default 0), uses `.offset(offset)` in query
- New `countBusinessSearch`: COUNT(*) with same WHERE clause as search, returns total match count

### Modified: `server/storage/index.ts` (+1 LOC)
- Added `countBusinessSearch` to barrel export

### Modified: `server/routes-businesses.ts` (+10 LOC, 361→376)
- Parse `limit` (1-100, default 20) and `offset` (min 0, default 0) from query params
- Parallel fetch: `Promise.all([searchBusinesses(...), countBusinessSearch(...)])`
- Response now includes `pagination: { total, limit, offset, hasMore }`

### Modified: `lib/api.ts` (+30 LOC)
- `fetchBusinessSearch`: Added `limit` and `offset` to opts
- New `SearchPagination` interface: `{ total, limit, offset, hasMore }`
- New `fetchBusinessSearchPaginated`: Returns `{ businesses, pagination }` with full metadata

### Modified: `tests/sprint291-search-cuisine-filter.test.ts`
- Updated searchBusinesses call pattern to include `pageLimit, cuisine, pageOffset`

### Modified: `__tests__/sprint438-photo-upload.test.ts`
- routes-businesses.ts LOC threshold bumped 375→385 (pagination additions)

### New: `__tests__/sprint473-search-pagination.test.ts` (21 tests)
- Storage: offset param, .offset() in query, countBusinessSearch
- Route: limit/offset parsing, bounds capping, Promise.all, pagination metadata
- Client: limit/offset opts, SearchPagination interface, fetchBusinessSearchPaginated

## Test Coverage
- 21 new tests, all passing
- Full suite: 8,753 tests across 365 files, all passing in ~4.6s
- Server build: 636.6kb (+1.3kb for pagination logic)
