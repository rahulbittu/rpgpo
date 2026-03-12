# Sprint 737 — Business Detail + Profile Offline-Aware

**Date:** 2026-03-11
**Theme:** Offline UX Completion
**Story Points:** 2

---

## Mission Alignment

Sprint 734 introduced `useOfflineAware` for Rankings, Sprint 736 added it to Discover. This sprint completes the pattern: Business Detail and Profile now show cached data with a stale indicator instead of error states when offline. All 4 major screens are now offline-resilient.

---

## Team Discussion

**Leo Hernandez (Frontend):** "Four screens, four identical patterns. Import `useOfflineAware` + `StaleBanner`, destructure `dataUpdatedAt` from useQuery, replace `isError` with `showError`, add the StaleBanner. Each screen took under 5 minutes."

**Derek Liu (Mobile):** "Business Detail is arguably the most important screen for offline behavior. A user shares a link, someone opens it on the subway, and if they had the business cached from earlier — they see it with a 'Updated 10m ago' banner instead of 'Couldn't load this business'."

**Sarah Nakamura (Lead Eng):** "Profile is the least critical for offline since it requires authentication anyway, but consistency matters. Users shouldn't see different error behavior on different screens."

**Amir Patel (Architecture):** "The `useOfflineAware` hook is a textbook example of a reusable abstraction that emerged from a real need. Three parameters in, three values out. No configuration, no side effects beyond a timer for the stale label."

**Marcus Chen (CTO):** "100% offline-aware coverage across all major screens. Combined with the NetworkBanner, breadcrumbs, and offline sync service, our network resilience story is complete."

---

## Changes

| File | Change |
|------|--------|
| `app/business/[id].tsx` | Wired useOfflineAware + StaleBanner, uses showError instead of isError |
| `app/(tabs)/profile.tsx` | Wired useOfflineAware + StaleBanner, uses showError instead of isError |
| `__tests__/sprint589-business-detail-extraction.test.ts` | Updated LOC threshold (435→445) for offline-aware additions |
| `__tests__/sprint737-business-profile-offline.test.ts` | 18 tests: business (6), profile (6), coverage verification (4), loader (2) |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 663.0kb / 750kb (88.4%) |
| Tests | 12,703 pass / 546 files |

---

## Offline-Aware Coverage

| Screen | Status |
|--------|--------|
| Rankings (index.tsx) | Sprint 734 |
| Discover (search.tsx) | Sprint 736 |
| Business Detail ([id].tsx) | Sprint 737 |
| Profile (profile.tsx) | Sprint 737 |

All 4 major screens: **100% coverage**.

---

## What's Next (Sprint 738)

Further beta polish or feedback-driven iteration.
