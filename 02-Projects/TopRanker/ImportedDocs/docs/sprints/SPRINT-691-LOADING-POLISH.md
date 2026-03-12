# Sprint 691 — Loading Polish

**Date:** 2026-03-11
**Theme:** Smoother Skeleton Shimmer + Content Transitions
**Story Points:** 2

---

## Mission Alignment

First impressions on TestFlight matter. The loading experience — from tap to content — should feel fluid and intentional. This sprint upgrades the skeleton shimmer from basic Animated opacity to Reanimated-powered easing, and adds a `SkeletonToContent` wrapper that smoothly fades and slides content in when data arrives.

---

## Team Discussion

**Marcus Chen (CTO):** "The shimmer is one of those things people notice subconsciously. The old shimmer used linear timing with the legacy Animated API — it pulsed mechanically. The new one uses `Easing.inOut(Easing.ease)` via Reanimated — it breathes. That's the kind of polish that makes people think 'this app feels good.'"

**Sarah Nakamura (Lead Eng):** "SkeletonBlock now uses Reanimated's `withRepeat` + `withSequence` instead of `Animated.loop`. The shimmer cycles between 0.25 and 0.65 opacity over 1400ms (700ms per half-cycle). More subtle than the old 0.3-0.7 range at 1200ms."

**Dev Sharma (Mobile):** "The `SkeletonToContent` wrapper is the real win. Instead of the content just appearing (jarring on slow connections), it fades in and slides up 8px over 350ms with `Easing.out(Easing.cubic)`. It's the difference between a loading state and a loading experience."

**Priya Sharma (Frontend):** "Rankings is the first screen to use SkeletonToContent. The FlatList content is wrapped in it. Other screens can adopt it incrementally — just import and wrap."

---

## Changes

| File | Change |
|------|--------|
| `components/Skeleton.tsx` | Replaced Animated API with Reanimated for shimmer |
| `components/Skeleton.tsx` | Added `SkeletonToContent` transition wrapper component |
| `app/(tabs)/index.tsx` | Wrapped FlatList in `SkeletonToContent` for smooth transition |

### Shimmer Comparison

| Property | Before | After |
|----------|--------|-------|
| API | `Animated.timing` | `withRepeat(withSequence(withTiming))` |
| Opacity range | 0.3 → 0.7 | 0.25 → 0.65 |
| Cycle duration | 1200ms | 1400ms |
| Easing | Linear | `Easing.inOut(Easing.ease)` |
| Thread | JS thread | UI thread (Reanimated) |

### SkeletonToContent Props

| Prop | Type | Description |
|------|------|-------------|
| `visible` | `boolean` | When true, content fades in |
| `children` | `ReactNode` | The content to reveal |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 11,955 pass / 509 files |

---

## What's Next (Sprint 692)

Rating flow accessibility — VoiceOver support and Dynamic Type for the rating submission flow.
