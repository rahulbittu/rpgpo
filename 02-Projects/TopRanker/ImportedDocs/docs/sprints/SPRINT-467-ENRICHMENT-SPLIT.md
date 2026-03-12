# Sprint 467: Admin Enrichment Route Split

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Split `routes-admin-enrichment.ts` (382 LOC, 95.5% of 400 threshold) into two files: dashboard/gaps (original file, ~200 LOC) and bulk operations (new file, ~190 LOC). This prevents threshold breach and logically separates read-only overview endpoints from write-capable bulk mutation endpoints.

## Team Discussion

**Marcus Chen (CTO):** "The split follows a natural boundary: GET endpoints that read data (dashboard, gaps) vs POST endpoints that mutate data (bulk dietary, bulk hours). This is the right seam. It also sets us up for adding auth middleware more easily — bulk mutations can have stricter auth requirements."

**Amir Patel (Architect):** "Fourth extraction in this cycle. The pattern is now standard: identify threshold, find the natural split boundary, create new file, register in routes.ts, redirect tests. Each file is now well under threshold with room for growth."

**Nadia Kaur (Cybersecurity):** "The split enables per-file auth middleware in the future. Bulk operations that can modify hundreds of records should have stricter auth than read-only dashboard endpoints. This architectural separation makes that possible without refactoring later."

**Sarah Nakamura (Lead Eng):** "The `bulkLog` tag in the new file differentiates log entries from dashboard operations. The `VALID_TAGS` constant was duplicated in two endpoints — now it's a single constant shared across both bulk dietary endpoints."

## Changes

### New: `server/routes-admin-enrichment-bulk.ts` (~190 LOC)
- `registerAdminEnrichmentBulkRoutes(app)` — 3 bulk endpoints:
  - POST /api/admin/enrichment/bulk-dietary
  - POST /api/admin/enrichment/bulk-dietary-by-cuisine
  - POST /api/admin/enrichment/bulk-hours
- Shared `VALID_TAGS` constant, `HoursData` interface
- `bulkLog` tag for operation logging

### Modified: `server/routes-admin-enrichment.ts` (382→200 LOC, -47.6%)
- Removed all bulk endpoints
- Retained: dashboard, hours-gaps, dietary-gaps

### Modified: `server/routes.ts` (2 lines)
- Added import of `registerAdminEnrichmentBulkRoutes`
- Added registration call

### Modified test files (2 files):
- `__tests__/sprint458-bulk-enrichment.test.ts` — redirected to bulk file
- `__tests__/sprint463-bulk-hours.test.ts` — redirected to bulk file

## Test Coverage
- 17 tests across 4 describe blocks (Sprint 467 tests)
- All existing tests pass with redirects
- Full suite: 8,636+ tests passing
