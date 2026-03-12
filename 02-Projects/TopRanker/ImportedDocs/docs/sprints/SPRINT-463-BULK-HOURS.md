# Sprint 463: Admin Enrichment Bulk Hours Update

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add bulk hours update endpoint to the admin enrichment API. Currently hours data must be set business-by-business via the general PUT endpoint. This sprint adds POST /api/admin/enrichment/bulk-hours for batch updating opening hours across multiple businesses, with validation, dry run support, and source tracking (manual vs. Google Places import).

## Team Discussion

**Marcus Chen (CTO):** "Hours data is structured JSON — more complex than dietary tags. The validation chain needs to ensure periods have valid day numbers and time strings. A bad hours object could corrupt business display. The 50-business batch limit (vs 100 for dietary) reflects this higher risk."

**Amir Patel (Architect):** "Good safety design: source tracking ('manual', 'google_places', 'import') gives audit trail for how hours data entered the system. If Google Places data turns out to be wrong for a region, we can query by source to identify affected businesses."

**Rachel Wei (CFO):** "Hours coverage is our second-biggest enrichment gap after dietary tags. When Jasmine sends a WhatsApp campaign for 'Best late-night biryani in Irving,' the hours data needs to be correct. Bulk import from Google Places closes this gap at scale."

**Sarah Nakamura (Lead Eng):** "The endpoint validates period structure: each period must have open.day (0-6) and open.time (HHMM). Close is optional for 24-hour businesses. The response includes hadHours flag so ops can see which businesses gained hours vs. which had theirs replaced."

**Jasmine Taylor (Marketing):** "Hours accuracy directly affects the 'OPEN NOW' / 'CLOSING SOON' badges from Sprint 457. Wrong hours → wrong badges → broken trust. This bulk endpoint lets ops fix hours data quickly when users report errors."

**Jordan Blake (Compliance):** "Source tracking is important for data provenance. If we show Google Places hours and they're wrong, we need to know the source for dispute resolution. The 'manual' vs 'google_places' vs 'import' distinction provides that traceability."

## Changes

### Modified: `server/routes-admin-enrichment.ts` (310→382 LOC)
- POST /api/admin/enrichment/bulk-hours — batch update opening hours
  - Accepts businessIds[], hoursData (structured hours JSON), source, dryRun
  - 50-business batch limit (lower than dietary's 100 due to data complexity)
  - Source validation: manual, google_places, import
  - Period structure validation: open.day (number), open.time (string)
  - Returns hadHours flag + periodsCount per business
  - Caps response at 50 entries

## Test Coverage
- 20 tests across 5 describe blocks
- Validates: endpoint, input validation, structure validation, response, docs
