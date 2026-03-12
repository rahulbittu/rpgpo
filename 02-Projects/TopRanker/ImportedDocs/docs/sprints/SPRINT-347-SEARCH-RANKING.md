# Sprint 347: Search Result Ranking Improvements

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Text relevance scoring, profile completeness bonus in search ranking

## Mission
The search ranking algorithm (Sprint 244) uses reputation-weighted scores and Bayesian smoothing but doesn't account for search query relevance or profile completeness. Sprint 347 adds two new signals: text relevance scoring (how well the business name matches the query) and profile completeness (businesses with photos, hours, cuisine, and description rank higher).

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Text relevance is tiered: exact match (1.0), starts-with (0.8), contains (0.5), word-starts-with (0.4). This means searching 'Taj' will prefer 'Taj Mahal' over 'Mahal Taj Kitchen' — intuitive ordering."

**Amir Patel (Architecture):** "The SearchContext is fully optional. Existing callers that don't pass search context get exactly the same behavior as before. Zero breaking changes."

**Marcus Chen (CTO):** "Profile completeness rewards businesses that fill out their listings. A restaurant with photos, hours, and a description should rank above one with just a name. This incentivizes business owners to complete their profiles."

**Jasmine Taylor (Marketing):** "When users search 'biryani' on WhatsApp-shared links, the results should show the most relevant businesses first. Text relevance makes the discovery experience feel smart."

**Priya Sharma (QA):** "26 new tests covering text relevance tiers, profile completeness scoring, SearchContext interface, integration with rankBusinesses, and backwards compatibility. 6,402 total."

**Nadia Kaur (Cybersecurity):** "The text relevance is case-insensitive and handles empty queries gracefully. No regex — just string operations, so no ReDoS risk."

## Changes

### `server/search-ranking-v2.ts` (113→180 LOC)
- **SearchContext interface:** query, hasPhotos, hasHours, hasCuisine, hasDescription
- **textRelevance():** Tiered scoring (1.0 exact, 0.8 starts-with, 0.5 contains, 0.4 word-starts-with, 0 no match)
- **profileCompleteness():** Ratio of filled profile fields (0-1)
- **rankBusinesses():** Now accepts optional `search` context per business
  - Text match: up to 0.3 point boost (relevance * 0.3)
  - Complete profile (≥75%): 0.1 point boost
  - New boost factors: "text_match", "complete_profile"

### Tests
- `tests/sprint347-search-ranking.test.ts` — 26 tests

## Test Results
- **262 test files, 6,402 tests, all passing** (~3.6s)
- **Server build:** 593.7kb (unchanged)

## Constitution Alignment
- **#47:** Specificity creates disruption — text relevance rewards specific matches
- **#9:** Low-data honesty — confidence levels still gate ranking visibility
- **#7:** Fair ranking means anti-gaming — completeness boost is small (0.1) and transparent
