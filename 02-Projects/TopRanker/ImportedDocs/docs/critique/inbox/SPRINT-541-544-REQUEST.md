# Critique Request: Sprints 541-544

**Date:** 2026-03-10
**Submitted by:** Marcus Chen (CTO)
**Scope:** Feature Sprint Cycle (Photo Gallery, Receipt Verification, City Dashboard, Search Autocomplete)

## Sprint Summary

| Sprint | Feature |
|--------|---------|
| 541 | Business photo gallery — approval pipeline wiring + PhotoDetail metadata + community count |
| 542 | Receipt verification OCR prep — receiptAnalysis table (996 LOC schema) + admin review pipeline |
| 543 | City expansion dashboard — admin UI with health, engagement, promotion tracking for beta cities |
| 544 | Search autocomplete — in-memory popular query tracker + PopularQueriesPanel with social proof |

## Current Metrics

- 10,175 tests across 433 files
- 705.7kb server build
- 67 consecutive A-range arch grades
- 11 cities (5 active TX + 6 beta)
- 43+ admin endpoints
- Schema at 996/1000 LOC (at capacity)

## Questions for External Watcher

1. **Schema at 996/1000 LOC — is compression the right next step?** Sprint 542 added the receiptAnalysis table, pushing schema to 99.6% of capacity. The proposed fix is extracting index definitions to a separate file. But Drizzle ORM requires table definitions and indexes in the same file for migration generation. Is there a better compression strategy that doesn't fight the ORM, or should we accept 1000 LOC as a hard limit and use in-memory patterns for all future tracking needs?

2. **Photo approval pipeline was silently broken:** Sprint 541 discovered that approvePhoto() was marking photos as "approved" but never inserting them into businessPhotos — meaning community photos were approved but invisible. This bug existed since Sprint 441. Is our test strategy (source-based `toContain` checks) insufficient for catching behavioral bugs? Should we add integration tests that verify end-to-end flows (submit photo → moderate → approve → appears in gallery)?

3. **In-memory query tracker vs DB persistence trade-off:** Sprint 544 chose in-memory tracking to avoid schema growth. The consequence is popular queries reset on server restart. For a feature that provides "social proof" in search, is data loss on restart acceptable? At what scale does this become a user trust issue (users see "14 searches" one hour, then 0 the next)?

4. **City expansion dashboard adds a 6th admin tab:** Sprint 543 added a "cities" tab to the admin dashboard (admin/index.tsx now at 561/650 LOC). The admin surface now has: overview, claims, flags, challengers, users, cities. At what point should the admin dashboard be split into separate route-based pages rather than growing as tabs in a single file?

5. **Server build at 705.7kb — are we adding modules too fast?** The build grew 13.2kb in 4 sprints. Receipt analysis (197 LOC), search query tracker (141 LOC), city expansion routes, and admin receipt routes all contributed. Each module is well-isolated but the aggregate is growing. Should we consider code-splitting the server (e.g., separate admin bundle), or is a monolithic server build acceptable until we hit a specific threshold?
