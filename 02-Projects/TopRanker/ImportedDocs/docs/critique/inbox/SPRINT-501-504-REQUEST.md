# Critique Request: Sprints 501–504

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** Client notification wiring, dedup, insights UI, triggers extraction

## What We Built

### Sprint 501: Client Notification Open Wiring
- _layout.tsx: reportNotificationOpened() fires POST to /api/notifications/opened
- Extracts notification identifier + type from Expo response object
- Fire-and-forget pattern (.catch(() => {})) — never blocks navigation

### Sprint 502: Push Notification Deduplication
- Set-based dedup by notificationId:memberId key
- recordNotificationOpen returns boolean (false = duplicate)
- Bounded at 50K dedup entries with FIFO eviction

### Sprint 503: Notification Insights Admin Card
- NotificationInsightsCard component: total sent, open rate, unique openers, delivery rate
- Per-category breakdown table with color-coded rate badges
- Props-based design — receives data, doesn't fetch

### Sprint 504: notification-triggers.ts Extraction
- Event triggers (onRankingChange, onNewRatingForBusiness, sendCityHighlightsPush, startCityHighlightsScheduler) → notification-triggers-events.ts
- Original file: 402→166 LOC (-58.7%)
- 3 test files redirected, re-export for backward compatibility

## Questions for Critique

1. **Fire-and-forget for analytics:** reportNotificationOpened uses .catch(() => {}) — no retry. At what failure rate does this become a data quality problem? Should we batch and retry?

2. **Set-based dedup vs TTL:** The dedup set has no time-based expiration — entries persist until evicted by size. Should we add a 24-hour TTL to allow legitimate re-opens (e.g., notification resurfacing)?

3. **Props-based vs data-fetching component:** NotificationInsightsCard receives data as props. Should admin dashboard components own their data fetching via React Query, or is the separation cleaner?

4. **Re-export pattern accumulation:** Two files now use re-exports after extraction. Is this sustainable, or should we establish a convention to always update direct consumers?

5. **Extraction overhead vs threshold buffer:** notification-triggers.ts went from 89.3% to 36.9%. Is this too aggressive? Should we aim for 60-70% to reduce the number of files while still having headroom?

## Metrics
- 9,296 tests across 393 files
- Server build: 667.0kb
- `as any`: ~80 total, 32 client-side
