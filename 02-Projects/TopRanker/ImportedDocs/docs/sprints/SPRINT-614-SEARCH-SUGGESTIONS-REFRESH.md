# Sprint 614: Search Suggestions Periodic Refresh

**Date:** 2026-03-11
**Story Points:** 2
**Owner:** Amir Patel
**Status:** Done

## Mission

Search suggestions are pre-built on startup but never refresh. As new businesses and ratings arrive, the suggestions become stale. Add periodic refresh from the database every 30 minutes, and build suggestions from DB on startup instead of relying on manual calls.

## Team Discussion

**Amir Patel (Architecture):** "The suggestion index was a write-once-on-startup Map. Now it rebuilds every 30 minutes from the database. The `refreshSuggestionsFromDb` function queries distinct cities, then fetches business names, categories, and neighborhoods per city to rebuild the index."

**Cole Anderson (Search):** "This was a known gap from Sprint 256. The suggestions module had `buildSuggestionIndex` but nothing called it with real data from the DB on startup. The periodic refresh ensures new businesses appear in search suggestions within 30 minutes of being added."

**Marcus Chen (CTO):** "Server build went from 730.0→733.4kb (+3.4kb) for the new DB queries and interval logic. Well within the 750kb ceiling. This is the kind of infrastructure improvement that makes the product feel alive — users see fresh suggestions."

**Sarah Nakamura (Lead Eng):** "The `startSuggestionRefresh` function runs the initial build immediately, then sets a 30-minute interval. The `stopSuggestionRefresh` function is available for graceful shutdown. Clean lifecycle management."

## Changes

### Modified: `server/search-suggestions.ts` (71→117 LOC, +46)
- Added `refreshSuggestionsFromDb()` — queries DB for all cities and businesses, rebuilds index
- Added `startSuggestionRefresh()` — initial build + 30-min interval
- Added `stopSuggestionRefresh()` — cleanup for graceful shutdown
- REFRESH_INTERVAL_MS = 30 minutes

### Modified: `server/index.ts` (+3 LOC)
- Calls `startSuggestionRefresh()` during server startup, after hash preloads

### Updated: `shared/thresholds.json`
- Build size: 730.0→733.4kb

## Metrics

| Metric | Before | After | Delta |
|--------|--------|-------|-------|
| search-suggestions.ts LOC | 71 | 117 | +46 |
| Server Build | 730.0kb | 733.4kb | +3.4kb |
| Tests | 11,327 | 11,327 | 0 |
| Build Ceiling | 750kb | 750kb | 0 |
| Headroom | 20.0kb | 16.6kb | -3.4kb |
