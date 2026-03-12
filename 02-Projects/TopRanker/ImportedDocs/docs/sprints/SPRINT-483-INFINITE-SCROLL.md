# Sprint 483: Infinite Scroll for Search Results

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 4
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Implement infinite scroll for search results using React Query's useInfiniteQuery and the pagination API from Sprint 473. Users see initial results immediately, then load more as they scroll — no "Load More" button needed.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The key architectural decision was extracting `useInfiniteSearch` as a custom hook rather than embedding useInfiniteQuery directly in search.tsx. The hook wraps all the pagination logic, page flattening, and next-page computation. The search screen just calls the hook and passes handleLoadMore to FlatList."

**Amir Patel (Architect):** "useInfiniteQuery with getNextPageParam is the right pattern. Pages are accumulated in memory and flattened. The offset-based pagination from Sprint 473 maps cleanly to pageParam. 20 items per page is a good default — enough for 4-5 screens of content on initial load."

**Marcus Chen (CTO):** "This completes the search infrastructure arc: Sprint 473 (server pagination), Sprint 483 (client infinite scroll). Users no longer see all results at once. They see 20, scroll, see 20 more. This is better for both UX and server load."

**Jasmine Taylor (Marketing):** "Infinite scroll keeps users engaged longer. They don't hit a wall of 'no more results' — they keep scrolling and discovering. The footer message 'All 47 results loaded' is a nice touch that shows we're not hiding content."

**Rachel Wei (CFO):** "Reduced initial payload (20 vs all) means faster Time-to-Interactive. This directly impacts our conversion funnel — users who see results faster are more likely to tap into a business."

## Changes

### New: `lib/hooks/useInfiniteSearch.ts` (~95 LOC)
- `useInfiniteSearch(query, city, cuisine, opts)` — wraps useInfiniteQuery
- `InfiniteSearchOpts` interface: dietary, lat/lng, distance, hours filters
- `UseInfiniteSearchResult` interface: businesses, pagination state, fetchNextPage
- PAGE_SIZE = 20, initialPageParam = 0
- `getNextPageParam`: returns next offset if hasMore, undefined otherwise
- Flattens pages via `data.pages.flatMap(page => page.businesses)`
- Returns totalCount from first page

### New: `components/search/InfiniteScrollFooter.tsx` (~70 LOC)
- `InfiniteScrollFooter` component for FlatList ListFooterComponent
- Loading state: ActivityIndicator + "Loading more results..."
- End state: "All N results loaded" or "End of results"
- Returns null when nothing to display

### Modified: `app/(tabs)/search.tsx` (+12/-4 LOC)
- Imports useInfiniteSearch and InfiniteScrollFooter
- Replaced useQuery + fetchBusinessSearch with useInfiniteSearch hook
- Added handleLoadMore callback (guards with hasNextPage && !isFetchingNextPage)
- FlatList gains onEndReached={handleLoadMore}, onEndReachedThreshold={0.5}
- FlatList gains ListFooterComponent with InfiniteScrollFooter

### Modified: `tests/sprint292-cuisine-search-wiring.test.ts`
- Updated "passes selectedCuisine" test to check useInfiniteSearch instead of fetchBusinessSearch
- Updated "includes selectedCuisine in query key" test for new hook

### Modified: `tests/sprint295-slt-audit.test.ts`
- Updated "passes to API" test to check useInfiniteSearch pattern

### New: `__tests__/sprint483-infinite-scroll.test.ts` (23 tests)
- useInfiniteSearch: imports, PAGE_SIZE, pageParam, getNextPageParam, flattening, totalCount, interface
- InfiniteScrollFooter: exports, loading state, end state, null return
- Search screen: imports, hook usage, handleLoadMore, FlatList props

## Test Coverage
- 23 new tests, all passing
- Full suite: 8,933 tests across 373 files, all passing in ~4.7s
- Server build: 645.9kb (unchanged — client-only sprint)
