# Sprint 699 — App Startup Performance

**Date:** 2026-03-11
**Theme:** Time-to-Interactive Optimization
**Story Points:** 3

---

## Mission Alignment

First impression speed matters for App Store reviews and user retention. The animated splash ran ~2.9s before content was reachable — fine for cinematic effect, but too long when users just want rankings. This sprint tightens splash timing to ~2.1s, removes an unused font variant, and prefetches initial data during the splash so Rankings loads instantly.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Three changes, all additive to perceived speed: splash 2.9s → 2.1s shaves 800ms off time-to-interactive. Removing PlayfairDisplay_400Regular_Italic is one fewer font to download — it was imported but never used in any component. And the leaderboard prefetch means Rankings data is already cached when the tab renders."

**Amir Patel (Architecture):** "The prefetch uses `queryClient.prefetchQuery` with the same query key the Rankings tab uses — `['leaderboard', 'Dallas', 'restaurant', null, null, null]`. When the tab mounts, React Query finds cached data and skips the network request entirely. Zero-flicker first load."

**Derek Liu (Mobile):** "Splash still feels premium — the animation phases are the same, just tighter. Crown bounce, logo track-in, tagline reveal — all there. The exit zoom went from 500ms to 400ms. Users won't notice it's shorter, they'll just notice the app feels faster."

**Marcus Chen (CTO):** "Time-to-interactive is the #1 App Store perception metric. Sub-2.5s total startup is competitive with top apps. The onboarding prefetch is smart — we were doing an AsyncStorage read after the splash finished, now it runs in parallel."

**Priya Sharma (Design):** "I was worried faster would feel rushed, but the spring physics still land naturally. The crown still bounces, the tagline still slides up. It's tighter, not truncated."

**Nadia Kaur (Security):** "No new network calls or storage patterns — just moved existing ones earlier. The prefetch is fire-and-forget, same as the existing query pattern. No security surface change."

---

## Changes

| File | Change |
|------|--------|
| `app/_layout.tsx` | Tightened splash from ~2.9s to ~2.1s (all phase delays reduced) |
| `app/_layout.tsx` | Removed unused `PlayfairDisplay_400Regular_Italic` (9 → 8 fonts) |
| `app/_layout.tsx` | Prefetch onboarding flag during splash (parallel, not sequential) |
| `app/_layout.tsx` | Prefetch default leaderboard data during splash for instant Rankings load |
| `__tests__/sprint699-startup-performance.test.ts` | 20 tests for timing, fonts, prefetch, preservation |

---

## Performance Impact

| Metric | Before | After |
|--------|--------|-------|
| Splash duration | ~2.9s | ~2.1s |
| Font variants loaded | 10 | 9 |
| Rankings first-load | Network fetch on mount | Prefetched during splash |
| Onboarding check | Sequential after splash | Parallel during splash |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,098 pass / 516 files |

---

## What's Next (Sprint 700)

SLT meeting + Architectural Audit #155 (every-5-sprint governance).
