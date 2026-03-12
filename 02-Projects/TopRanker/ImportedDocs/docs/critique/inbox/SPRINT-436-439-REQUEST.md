# Critique Request: Sprints 436–439

**From:** Sarah Nakamura (Lead Engineer)
**Date:** 2026-03-10
**Scope:** 4 sprints, 11 story points

---

## Summary

Sprints 436–439 delivered four user-facing features: multi-signal search relevance scoring, unified activity timeline (ratings + bookmarks + achievements), community photo upload with moderation, and dimension tooltips in the rating flow. All four directly strengthen the discovery → rate → consequence core loop.

Key metrics: 334 test files, 7,985 tests, 608.6kb server build, all SubComponents at OK status.

---

## Questions for External Review

### 1. Multi-signal search relevance — weight balance

Sprint 436 uses: text match 50%, category/cuisine 20%, completeness 15%, rating volume 15%. Is the text match weight too dominant? A restaurant with a perfect name match but low ratings would rank higher than a highly-rated restaurant with a partial name match. Should volume have more weight?

### 2. Fuzzy matching threshold — 4-character minimum

The Levenshtein fuzzy matching only activates for tokens >= 4 characters. This means 3-letter queries like "bbq", "pub", or "dim" (as in dim sum) get no typo tolerance. Is this the right cutoff? Should we lower to 3 characters with max edit distance of 1?

### 3. Activity timeline — bookmark timestamps vs activity relevance

Bookmarks are included in the timeline with their `savedAt` timestamp. But saving a bookmark is a low-signal action compared to rating (which requires structured input). Should bookmarks have lower visual prominence, or is equal treatment correct for user engagement?

### 4. Photo upload — moderation queue persistence

The photo moderation queue (photo-moderation.ts) stores submissions in an in-memory Map. A server restart loses all pending submissions. Sprint 441 plans DB migration. Is the current state acceptable for beta, or should we block photo upload until persistence is in place?

### 5. Dimension tooltip examples — specificity vs generality

The tooltip examples reference specific dishes ("Was the biryani flavorful?", "Was the naan fresh?"). These are culturally specific to Indian cuisine, which is our Phase 1 target. Should examples be more generic for non-Indian restaurants, or is specificity the right choice for our "Indian Dallas First" strategy?

---

## Deliverables for Review

- `server/search-ranking-v2.ts` (~260 LOC) — Multi-signal relevance functions
- `components/profile/ActivityTimeline.tsx` (344 LOC) — Unified timeline
- `components/business/PhotoUploadSheet.tsx` (349 LOC) — Upload flow
- `components/rate/VisitTypeStep.tsx` (216 LOC) — Dimension tooltips
- `server/routes-businesses.ts` (282 LOC) — Photo upload endpoint
