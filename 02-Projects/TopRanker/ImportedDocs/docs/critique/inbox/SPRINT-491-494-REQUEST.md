# Critique Request: Sprints 491–494

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** Rating extraction, push analytics, search autocomplete, claim V2

## What We Built

### Sprint 491: Rating Route Extraction
- Moved POST/PATCH/DELETE /api/ratings + flag from routes.ts to routes-ratings.ts
- routes.ts reduced 32% (546→369 LOC)
- 12 test files redirected to new file path

### Sprint 492: Push Notification Analytics
- push-analytics.ts: in-memory delivery tracking (success/error by category/city)
- Wired recordPushDelivery into all 4 notification triggers
- Admin endpoint: GET /api/admin/push-analytics with daysBack param

### Sprint 493: Enhanced Search Autocomplete
- search-autocomplete.ts: Levenshtein edit distance, fuzzy matching, typed suggestions
- Dish name matching via database query (getTopDishesForAutocomplete)
- Merged business + dish suggestions ranked by relevance score

### Sprint 494: Business Claim V2
- claim-verification-v2.ts: document metadata, weighted scoring, auto-approve at 70+
- 5 signals: document upload (25), name match (30), address (20), phone (15), multi-doc (10)
- Cross-reference with fuzzy name matching and normalized address/phone

## Questions for Critique

1. **12 test redirects in Sprint 491:** Is source-based testing (readFileSync + toContain) still the right pattern at this scale? Would behavioral tests or import-based tests reduce redirect overhead?

2. **In-memory push analytics:** We chose in-memory for MVP. What's the right trigger to migrate to persistent storage — record count, daily volume, or simply when it matters for production reliability?

3. **Fuzzy autocomplete thresholds:** We use edit distance <= 2 for queries >= 4 chars. Is this too lenient? Could false positives confuse users? Should we A/B test threshold values?

4. **Claim V2 auto-approve at 70:** Is this threshold too aggressive for a business ownership decision? Should we require higher confidence (80+) for auto-approve and route 70-80 to expedited manual review?

5. **storage/businesses.ts at 664/700 LOC:** This is the first storage file to approach threshold. Is the extraction to storage/dishes.ts the right split, or should we organize by query pattern (read-heavy vs write-heavy)?

## Metrics
- 9,122 tests across 383 files
- Server build: 658.1kb
- `as any`: 78 total, 32 client-side
