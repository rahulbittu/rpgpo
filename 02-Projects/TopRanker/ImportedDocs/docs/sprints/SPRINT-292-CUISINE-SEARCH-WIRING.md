# Sprint 292: Cuisine Search Wiring

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Connect BestInSection cuisine picker to search results on Discover page

## Mission
When a user selects a cuisine tab (e.g., "Indian", "Mexican") in the Best In section on the Discover page, search results should automatically filter to that cuisine. This connects the UI browsing layer (Sprint 284-289) to the API filtering layer (Sprint 291).

## Team Discussion

**Marcus Chen (CTO):** "This is the UX payoff of five sprints of cuisine plumbing. Tap 🇮🇳 Indian → see only Indian restaurants. No typing required. Category → Cuisine → Dish workflow is now interactive end-to-end."

**Amir Patel (Architecture):** "Clean prop callback pattern: BestInSection fires onCuisineChange, search.tsx tracks selectedCuisine state, React Query key includes it for cache separation, fetchBusinessSearch passes it to the API. Zero coupling between components."

**Sarah Nakamura (Lead Eng):** "One edge case handled: when user starts typing manually, we clear the cuisine filter. This prevents the confusing state where you're searching 'pizza' but still filtered to Indian cuisine."

**Jasmine Taylor (Marketing):** "For the WhatsApp demo video, the flow is now: open Discover → tap Indian → see Indian restaurants ranked. Three taps from app open to 'Best Indian in Dallas'. That's the money shot."

**Priya Sharma (QA):** "11 tests covering the prop interface, state management, query key invalidation, and the manual-typing-clears-cuisine edge case."

## Changes
- `components/search/BestInSection.tsx` — Added `onCuisineChange` optional callback prop; fires on cuisine tab selection
- `app/(tabs)/search.tsx` — Added `selectedCuisine` state; passes to `fetchBusinessSearch` and React Query key; clears on manual text input; wires `onCuisineChange` to BestInSection
- 11 tests in `tests/sprint292-cuisine-search-wiring.test.ts`

## Test Results
- **213 test files, 5,701 tests, all passing** (~3.0s)
