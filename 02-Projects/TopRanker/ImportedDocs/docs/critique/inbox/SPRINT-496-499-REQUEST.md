# Critique Request: Sprints 496–499

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** Claim V2 wiring, autocomplete icons, storage extraction, notification open tracking

## What We Built

### Sprint 496: Wire Claim V2 to Admin Routes
- 4 new admin endpoints: document upload, evidence scoring, evidence retrieval, all evidence
- Input sanitization: String().slice() for text, Number() for numeric fields
- Completes claim V2 pipeline from Sprint 494 module to admin API

### Sprint 497: Autocomplete Icon Differentiation
- Type-aware icons in search dropdown: storefront (business) vs restaurant (dish)
- "Dish" badge with amber accent for dish-type suggestions
- Added `type` field to client-side AutocompleteSuggestion

### Sprint 498: storage/businesses.ts Extraction
- Dish function → storage/dishes.ts, Photo functions → new storage/photos.ts
- businesses.ts: 664→555 LOC (-16.4%, 94.9%→79.3% of threshold)
- Re-export pattern for backward compatibility, 1 test file redirected

### Sprint 499: Notification Open Tracking
- recordNotificationOpen() + computeOpenAnalytics() + getNotificationInsights()
- POST /api/notifications/opened (auth required) + GET /api/notifications/insights
- Combined delivery + open analytics with computed open rate per category

## Questions for Critique

1. **Claim V2 auto-approve threshold (70):** SLT-495 flagged this for review. Is 70/100 too aggressive for business ownership decisions? The scoring weights are: document (25), name match (30), address (20), phone (15), multi-doc (10). Should we require 80+ for auto-approve?

2. **Re-export pattern for extractions:** Sprint 498 used re-exports from businesses.ts → photos.ts to avoid updating all consumers. Is this indirection acceptable, or should we always update imports directly?

3. **In-memory notification analytics:** Two stores now (delivery 10K + opens 10K). At what point should we migrate to persistent storage? Is record count the right trigger, or should it be time-based (when we need >7 days of data)?

4. **Autocomplete icon choices:** We chose Ionicons (storefront-outline, restaurant-outline) for type differentiation. Would custom icons or emoji be more recognizable? Is the current approach sufficient for the MVP?

5. **notification-triggers.ts at 89.3%:** Scheduled for extraction in Sprint 504. Should we extract proactively now, or is the 4-sprint buffer reasonable given the extraction overhead?

## Metrics
- 9,219 tests across 388 files
- Server build: 666.1kb
- `as any`: ~80 total, 32 client-side
