# Sprint 777 — Offline Resilience

**Date:** 2026-03-12
**Theme:** Wire React Query to NetInfo for offline-aware queries
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **TestFlight readiness:** Beta testers on cellular need graceful offline handling
- **Constitution #9:** Low-data honesty — don't show stale data as current without context

---

## Problem

React Query's `onlineManager` wasn't connected to NetInfo. When the device went offline, queries kept firing, failing, and retrying — wasting battery, generating noise in error logs, and showing error states instead of cached data.

The `NetworkBanner` (Sprint 688) already showed offline status, and `offline-sync-service` (Sprint 667) already queued ratings. But React Query didn't know to pause.

## Fix

Wired `onlineManager.setEventListener()` to `NetInfo.addEventListener()` for native platforms and `window.addEventListener("online"/"offline")` for web. Also added app focus refetch via `AppState.addEventListener`.

Now when offline:
- React Query pauses all queries (no wasted requests)
- Cached data remains visible
- When back online, queries automatically resume
- `NetworkBanner` shows "No internet connection" / "Back online"

---

## Team Discussion

**Derek Okonkwo (Mobile):** "This is the standard React Query + React Native pattern. Without it, going into a tunnel causes a cascade of failed requests and error UI. Now it just shows cached data with the offline banner."

**Sarah Nakamura (Lead Eng):** "Good that we kept the existing NetworkBanner and offline-sync-service. This sprint just wired the missing piece — React Query knowing about connectivity state."

**Amir Patel (Architecture):** "Three layers of offline handling now: (1) onlineManager pauses queries, (2) NetworkBanner shows UI, (3) offline-sync-service queues mutations. Clean separation."

**Marcus Chen (CTO):** "Battery life matters for a food app. Users are walking around restaurants, going in and out of coverage. Pausing queries saves significant battery."

---

## Changes

| File | Change |
|------|--------|
| `lib/query-client.ts` | Wired `onlineManager` to NetInfo + web events, app focus refetch |
| `__tests__/sprint777-offline-resilience.test.ts` | 13 tests |

---

## Tests

- **New:** 13 tests in `__tests__/sprint777-offline-resilience.test.ts`
- **Total:** 13,249 tests across 583 files — all passing
- **Build:** 665.8kb (max 750kb)
