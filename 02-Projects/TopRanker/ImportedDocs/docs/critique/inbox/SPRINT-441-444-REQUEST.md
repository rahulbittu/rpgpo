# Critique Request: Sprints 441–444

**From:** Sarah Nakamura (Lead Engineer)
**Date:** 2026-03-10
**Scope:** 4 sprints, 11 story points

---

## Summary

Sprints 441–444 completed the SLT-440 roadmap: photo moderation DB persistence, search filters v2 (dietary + distance), profile extraction, and review summary cards. One infrastructure sprint, one refactoring sprint, two feature sprints. No new technical debt. Both Audit #46 findings resolved.

Key metrics: 339 test files, 8,152 tests, 611.4kb server build, 32 tables.

---

## Questions for External Review

### 1. Photo moderation — getPhotoStats fetches all rows

Sprint 441 migrated photo moderation to DB. The `getPhotoStats()` function fetches ALL rows from `photo_submissions` and counts in application code. At low volume this is fine, but it won't scale. Should we switch to SQL COUNT/GROUP BY queries now, or wait until the table exceeds 10K rows?

### 2. Dietary tag data strategy — auto-tagging vs manual

Sprint 442 added `dietaryTags` jsonb on businesses, but all restaurants currently have `[]`. We plan manual tagging via admin endpoint (Sprint 446). Should we also auto-tag based on cuisine (e.g., Indian restaurants → vegetarian-friendly)? What's the risk of false positives with auto-tagging?

### 3. Distance filtering — haversine vs driving distance

Server-side distance filtering uses great-circle haversine distance. A restaurant 2km away by air might be 5km by road. Is haversine acceptable for Phase 1, or should we integrate Google Distance Matrix API? The API has cost implications.

### 4. Review summary card — minimum sample size

The ReviewSummaryCard shows at 2+ ratings. Is 2 enough for meaningful aggregation? At 2 ratings, "100% would return" or "Food: 4.5 avg" isn't statistically robust. Should the minimum be 3 or 5?

### 5. Profile extraction boundary — what to extract next

Sprint 443 extracted rating history from profile.tsx (699→627 LOC). The remaining sections are: saved places, payment history, credibility journey, achievement badges, and onboarding checklist. If profile.tsx grows again, which section should be extracted next?

---

## Deliverables for Review

- `server/photo-moderation.ts` (120 LOC) — DB-backed moderation pipeline
- `components/search/DiscoverFilters.tsx` (321 LOC) — Dietary + distance filters
- `components/profile/RatingHistorySection.tsx` (176 LOC) — Extracted rating history
- `components/business/ReviewSummaryCard.tsx` (281 LOC) — Aggregated review insights
- `shared/schema.ts` — `photo_submissions` table + `dietaryTags` column
