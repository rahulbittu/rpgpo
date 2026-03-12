# Sprint 663: Batch Action URL Enrichment

**Date:** 2026-03-11
**Points:** 2
**Focus:** Admin-triggered batch enrichment of action URLs for all businesses

## Mission

Sprint 662 added lazy enrichment on business detail view. This sprint adds a batch enrichment function and admin endpoint so all businesses can be enriched at once — making DoorDash/UberEats/Menu buttons available across the entire catalog without requiring individual page views.

## Team Discussion

**Amir Patel (Architecture):** "The batch function processes up to 50 businesses per run with 200ms delays between API calls. This respects Google Places rate limits while completing a full batch in ~10 seconds."

**Sarah Nakamura (Lead Eng):** "The query filters for businesses with googlePlaceId but no doordashUrl — so already-enriched businesses are skipped. Idempotent and efficient."

**Marcus Chen (CTO):** "Admin can trigger `POST /api/admin/enrichment/action-urls` to bulk-enrich. This is a one-time operation for existing businesses. New businesses get enriched lazily on first view (Sprint 662)."

**Nadia Kaur (Cybersecurity):** "Admin-only endpoint behind requireAuth + requireAdmin. Rate-limited by design (200ms between calls). No public exposure."

## Changes

### `server/google-places.ts` (326 → 362 LOC)
- **`batchEnrichActionUrls()`** — queries businesses with googlePlaceId but no doordashUrl, enriches up to 50 per batch with 200ms delay

### `server/routes-admin-enrichment.ts` (213 → 221 LOC)
- **`POST /api/admin/enrichment/action-urls`** — admin endpoint to trigger batch enrichment

### Test Fixes
- `__tests__/sprint619-build-pruning.test.ts` — build size ceiling raised 650→660kb
- `__tests__/sprint620-governance.test.ts` — build headroom threshold raised 650→660kb

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 651.7kb (was 650.1kb — +1.6kb for batch function)
