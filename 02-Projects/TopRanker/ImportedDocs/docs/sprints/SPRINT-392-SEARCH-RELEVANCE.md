# Sprint 392: Search Result Relevance Scoring

**Date:** 2026-03-09
**Type:** Feature
**Story Points:** 5

## Mission

Wire the unused Sprint 347 relevance scoring functions (`textRelevance`, `profileCompleteness`) into the search endpoint. When users search, results now rank by text match quality + profile completeness + weighted score, not just weighted score alone. Add a "Relevant" sort chip that appears when a search query is active.

## Team Discussion

**Marcus Chen (CTO):** "We built the relevance functions in Sprint 347 but never wired them in. This sprint closes that gap. 'Best biryani in Irving' should surface exact name matches first, not just highest-rated restaurants that happen to contain the word."

**Amir Patel (Architecture):** "The scoring formula is: textRelevance * 0.6 + profileCompleteness * 0.2 + normalizedWeightedScore * 0.2. Text match dominates because that's what the user is searching for. Complete profiles and high ratings are tiebreakers."

**Priya Sharma (Frontend):** "The 'Relevant' sort chip only appears when there's an active search query — no point showing it for browsing. When the query clears, it disappears and the user's previous sort preference resumes."

**Sarah Nakamura (Lead Eng):** "Server re-sorts results by relevanceScore after DB fetch. The DB still returns by weightedScore first (up to 20 results), then we re-rank in memory. No SQL changes needed."

**Jasmine Taylor (Marketing):** "This directly improves the 'Best biryani in Irving' use case. When someone searches 'biryani', exact matches like 'Biryani Pot' should appear before 'Royal India' even if Royal India has a higher score."

**Nadia Kaur (Security):** "Input sanitization was already in place from the storage layer (max 100 chars, LIKE wildcards stripped). No new injection vectors introduced."

## Changes

### Modified Files
- `server/routes-businesses.ts` — Added relevance scoring to search endpoint using textRelevance + profileCompleteness. Re-sorts by relevanceScore when query present.
- `types/business.ts` — Added `relevanceScore?: number` to MappedBusiness
- `components/search/DiscoverFilters.tsx` — Added "relevant" to SortChips type, `showRelevant` conditional prop
- `app/(tabs)/search.tsx` — Added "relevant" sort case in useMemo, passes `showRelevant` to SortChips
- `lib/hooks/useSearchPersistence.ts` — Added "relevant" to SortType union

### New Files
- `tests/sprint392-search-relevance.test.ts` — 20 tests

## Test Results
- **297 files**, **7,164 tests**, all passing
- Server build: **600.7kb**, 31 tables
