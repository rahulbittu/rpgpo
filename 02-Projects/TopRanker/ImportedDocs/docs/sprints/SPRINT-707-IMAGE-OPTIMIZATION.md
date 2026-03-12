# Sprint 707 — Image Loading Optimization

**Date:** 2026-03-11
**Theme:** Performance Polish
**Story Points:** 2

---

## Mission Alignment

Restaurant photos are the #1 visual element across Rankings, Discover, and business detail screens. SafeImage already used expo-image with a 200ms transition, but without explicit cache policy, priority control, or recycling keys. This sprint adds `cachePolicy="memory-disk"`, configurable `priority`, `recyclingKey` for list performance, and `placeholder` support for progressive loading.

---

## Team Discussion

**Derek Liu (Mobile):** "`cachePolicy='memory-disk'` tells expo-image to cache images both in memory (instant redisplay) and on disk (survives app restart). Previously it used the default which varies by platform. Now behavior is consistent across iOS and Android."

**Sarah Nakamura (Lead Eng):** "The new props are all optional with sensible defaults. Existing 14 call sites work without changes. High-traffic lists can now pass `priority='high'` for above-the-fold images and `recyclingKey` for efficient view reuse."

**Amir Patel (Architecture):** "expo-image handles all the heavy lifting — memory-disk caching, HTTP cache headers, and view recycling are built into the library. We just needed to configure the props correctly."

**Priya Sharma (Design):** "The `placeholder` prop opens the door for blur hash placeholders in a future sprint. For now, the 200ms transition fade-in is enough — images appear smooth, not jarring."

---

## Changes

| File | Change |
|------|--------|
| `components/SafeImage.tsx` | Added `cachePolicy="memory-disk"`, `priority`, `recyclingKey`, `placeholder` props |
| `components/SafeImage.tsx` | Added `placeholderContentFit="cover"` |
| `__tests__/sprint707-image-optimization.test.ts` | 17 tests for optimization props + fallback preservation |

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 662.3kb / 750kb (88.3%) |
| Tests | 12,207 pass / 522 files |

---

## What's Next (Sprint 708)

Tab bar active state polish.
