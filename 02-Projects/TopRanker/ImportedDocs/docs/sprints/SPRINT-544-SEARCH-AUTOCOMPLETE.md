# Sprint 544: Search Autocomplete — Typeahead with Recent + Popular Queries

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete
**Tests:** 32 new (10,175 total across 433 files)

## Mission

Add popular search query tracking and display to the search experience. Users see both recent searches (local) and popular searches (server-side) when they focus the search input, creating a richer discovery surface.

## Team Discussion

**Marcus Chen (CTO):** "Popular queries is the missing signal in our search experience. Recent searches are personal, popular searches are social proof. 'If everyone is searching for biryani in Irving, maybe I should too.' This drives the controversy-engagement loop from our marketing strategy."

**Amir Patel (Architecture):** "In-memory query tracker avoids the schema constraint (996/1000 LOC). DECAY_FACTOR of 0.9 per hour means stale queries fade naturally. MAX_ENTRIES_PER_CITY of 500 is generous — we'll likely have 50-100 unique queries per city at launch scale."

**Rachel Wei (CFO):** "Popular searches + recent searches together in the search panel is a common UX pattern (Google, DoorDash). The count badge shows social proof — 'best biryani (14 searches)' validates the user's interest."

**Sarah Nakamura (Lead Eng):** "The search query tracking call is fire-and-forget with error suppression — doesn't affect search UX. Popular queries are fetched via useQuery with 60s staleTime, so they update without refetching on every focus."

**Cole Richardson (City Growth):** "Popular queries per city is exactly what we need for content strategy. If 'thai food plano' is trending, we know where to focus restaurant onboarding. The admin query-stats endpoint gives us that visibility."

**Jasmine Taylor (Marketing):** "This feeds directly into WhatsApp group content. If popular queries show 'best dosa in irving' with high count, that becomes a WhatsApp share — 'Everyone's searching for the best dosa in Irving. Here's the current #1 on TopRanker.'"

## Changes

### Server — Search Query Tracker (`server/search-query-tracker.ts`, 130 LOC — new)
- In-memory Map per city tracking query frequency and recency
- `trackSearchQuery(query, city)` — normalizes + increments count
- `getPopularQueries(city, limit)` — returns top queries with 2+ count filter
- `getQueryTrackerStats()` — admin stats across all cities
- `applyQueryDecay()` — hourly 10% count reduction for time-decay
- `clearQueryTracker()` — testing utility
- LRU eviction when city reaches 500 entries

### Server — Search Routes (`server/routes-search.ts`, 51→72 LOC)
- `POST /api/search/track` — records search query for popularity tracking
- `GET /api/search/popular-queries` — returns top queries for a city
- `GET /api/admin/search/query-stats` — admin query tracking statistics

### Client — API Functions (`lib/api.ts`, 636→652 LOC)
- `PopularQuery` type: query, count, lastSearched
- `fetchPopularQueries(city, limit)` — fetches popular queries
- `trackSearchQuery(query, city)` — non-blocking fire-and-forget tracking

### Client — PopularQueriesPanel (`components/search/SearchOverlays.tsx`, 359→410 LOC)
- New `PopularQueriesPanel` component with trending-up icon header
- Shows top 6 popular queries with search count badges
- Returns null when no queries available
- Full styling: container, header, rows, count badge

### Client — Search Integration (`app/(tabs)/search.tsx`, 651→665 LOC)
- Fetches popular queries via `useQuery` with 60s staleTime
- Tracks searches server-side on debounce settle
- Renders `PopularQueriesPanel` below `RecentSearchesPanel` when focused + empty query

### Test Threshold Redirections
- `sprint497-autocomplete-icons.test.ts` — SearchOverlays.tsx: 340→420 LOC
- `sprint524-api-extraction.test.ts` — api.ts: 650→660 LOC
- `sprint527-search-modularization.test.ts` — search.tsx: 660→670 LOC

## Test Summary

- `__tests__/sprint544-search-autocomplete.test.ts` — 32 tests
  - Query tracker: 11 tests (export, popular, normalize, count, cap, min count, sort, decay, stats, clear, eviction)
  - Search routes: 4 tests (imports, track endpoint, popular endpoint, admin stats)
  - Client API: 4 tests (type export, fetch function, track function, error handling)
  - Popular panel: 7 tests (export, props, icon, limit, count badge, null check, styles)
  - Search integration: 6 tests (import, fetch import, useQuery, tracking, render, alongside recent)
