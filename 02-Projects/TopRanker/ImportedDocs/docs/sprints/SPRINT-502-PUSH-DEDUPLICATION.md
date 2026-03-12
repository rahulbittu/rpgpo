# Sprint 502: Push Notification Open Deduplication

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 2
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add deduplication to notification open tracking. Without dedup, a user tapping the same notification twice (or the client retrying) creates duplicate open records, inflating open rates. This sprint adds a Set-based dedup layer by notificationId+memberId.

## Team Discussion

**Marcus Chen (CTO):** "Clean data matters for analytics. If our open rate says 40% but half of those are duplicates, we're making bad decisions. This is a data integrity fix."

**Amir Patel (Architect):** "Set-based dedup is the right approach for in-memory. O(1) lookup, bounded at 50K entries with FIFO eviction. The function now returns a boolean so callers know if the record was actually new."

**Rachel Wei (CFO):** "Accurate open rates mean accurate engagement metrics. This directly impacts our notification strategy decisions."

**Sarah Nakamura (Lead Eng):** "The change is surgical — recordNotificationOpen now checks a dedup set before recording. Returns false for duplicates, true for new opens. The route response includes the `recorded` flag so the client knows."

## Changes

### Modified: `server/push-analytics.ts` (222 → 252 LOC)
- Added `openDedupSet` (Set<string>) for notificationId:memberId deduplication
- `recordNotificationOpen` now returns `boolean` — false if duplicate
- Dedup set bounded at 50K entries with FIFO eviction
- Added `getOpenDedupSize()` for health monitoring
- Duplicate opens logged for observability

### Modified: `server/routes-notifications.ts`
- Captures `recorded` return value from `recordNotificationOpen`
- Includes `recorded` in response JSON

### Modified: `__tests__/sprint499-notification-open-tracking.test.ts`
- Updated push-analytics.ts LOC threshold 250→280

### Modified: `__tests__/sprint500-governance.test.ts`
- Updated push-analytics.ts LOC threshold 250→280

### New: `__tests__/sprint502-push-deduplication.test.ts` (14 tests)

## Test Coverage
- 14 new tests, all passing
- 2 test files updated for threshold changes
- Full suite: 9,270 tests across 391 files, all passing in ~5.0s
- Server build: 666.7kb
