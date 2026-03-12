# Sprint 734 — Offline Mode Graceful Degradation

**Date:** 2026-03-11
**Theme:** Beta UX — Network Resilience
**Story Points:** 2

---

## Mission Alignment

When a beta user loses network connectivity, seeing "Could not load rankings" is a bad experience — especially if the app just loaded the data 30 seconds ago. This sprint adds offline-aware behavior: when a query errors but cached data exists, the app shows the cached data with a "Updated 2m ago — showing cached data" banner instead of an error state.

---

## Team Discussion

**Derek Liu (Mobile):** "The `useOfflineAware` hook is pure logic: given isError, dataUpdatedAt, and hasData, it returns `showError` (true only when no cached data) and `isStale` (true when showing cached data). Simple, testable, reusable."

**Sarah Nakamura (Lead Eng):** "The StaleBanner is intentionally minimal — a single line with a clock icon and relative time. It's informative without being alarming. The user sees 'Updated 5m ago — showing cached data' and knows the data might not be current."

**Amir Patel (Architecture):** "React Query already caches data by default with 10-second staleTime. The offline-aware pattern leverages this: when the refetch fails, the cached data is still in the query cache. We just need to display it instead of showing an error."

**Leo Hernandez (Frontend):** "The Rankings screen is the first consumer, but `useOfflineAware` is a reusable hook. Discover, profile, and business detail can adopt it with minimal changes — just swap `isError` for `showError` and add the StaleBanner."

**Marcus Chen (CTO):** "This is important for the WhatsApp-first strategy. A user taps a shared link on cellular, the app loads, then they go underground on DART. Without this, they'd see an error. With it, they see cached rankings with a timestamp."

---

## Changes

| File | Change |
|------|--------|
| `lib/hooks/useOfflineAware.ts` | New hook: isStale/staleLabel/showError from query state |
| `components/StaleBanner.tsx` | New component: minimal cached data indicator banner |
| `app/(tabs)/index.tsx` | Wired useOfflineAware + StaleBanner into Rankings screen |
| `__tests__/sprint734-offline-graceful.test.ts` | 22 tests: hook logic (6), banner (5), rankings wiring (6), age formatting (4), loader (1) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.7kb / 750kb (88.4%) |
| Tests | 12,665 pass / 544 files |

---

## What's Next (Sprint 735)

Governance sprint: SLT-735, Arch Audit #190, Critique 731-734.
