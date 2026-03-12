# Sprint 667: Offline Rating Queue

**Date:** 2026-03-11
**Points:** 5
**Focus:** Queue ratings when offline, auto-sync when connectivity returns

## Mission

Restaurant visits often have poor cell service. When a user submits a rating offline, instead of showing an error, we now queue the rating in AsyncStorage and automatically submit it when connectivity returns. This uses the existing offline-sync foundation from Sprints 119/122.

## Team Discussion

**Amir Patel (Architecture):** "The offline-sync.ts foundation was built for exactly this use case. We wire queueAction() into the mutation's onError handler for network failures, and add a sync service that processes the queue on app foreground."

**Sarah Nakamura (Lead Eng):** "The sync service listens for AppState 'active' events. When the user reopens the app, it automatically tries to submit any queued ratings. Max 3 retries with silent drop if server returns 4xx."

**Marcus Chen (CTO):** "This is critical for the restaurant use case. Dallas restaurants often have poor cell service inside. Users shouldn't lose their rating because of a dead zone."

**Nadia Kaur (Cybersecurity):** "Queued ratings include the full payload (scores, visit type, dish, note) but NOT photos or receipts. Those upload async anyway. The queue is stored in AsyncStorage — encrypted at rest on iOS."

## Changes

### `lib/hooks/useRatingSubmit.ts` (+15 LOC)
- Network error handler now queues rating via `queueAction()` + `persistQueue()`
- Error message changed: "Your rating has been saved and will submit automatically when you're back online"

### `lib/offline-sync-service.ts` (NEW — 85 LOC)
- `processSyncQueue()` — loads queue from AsyncStorage, tries each pending action, marks completed/failed
- `initSyncService()` — subscribes to AppState changes, triggers sync on foreground
- `getPendingSyncCount()` — returns count for UI badge display
- Network errors stop the queue (retry later), server errors mark as failed

### `app/_layout.tsx` (+4 LOC)
- Added `initSyncService()` call on mount

### `app.json`
- Added `expo-apple-authentication` plugin (Sprint 664)

### `package.json`
- Added `expo-apple-authentication` dependency

## Sync Flow

```
User rates offline → queueAction() → AsyncStorage
                                        ↓
App comes to foreground → initSyncService()
                                        ↓
processSyncQueue() → apiRequest("POST", "/api/ratings", payload)
                                        ↓
Success → markCompleted() → persistQueue()
Network error → stop, retry on next foreground
Server error → markFailed() → drop after 3 retries
```

## Health
- **Tests:** 11,697 pass (501 files)
- **Build:** 655.5kb (server unchanged — client-only changes)
