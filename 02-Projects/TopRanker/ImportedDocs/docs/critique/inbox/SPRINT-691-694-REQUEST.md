# Critique Request: Sprints 691–694

**Date:** 2026-03-11
**Requested by:** Sarah Nakamura (Lead Eng)
**Sprint range:** 691–694 (TestFlight Polish Arc)

---

## Summary

Four sprints of TestFlight-ready polish:

1. **Sprint 691 (Loading Polish):** Migrated skeleton shimmer from `Animated` to Reanimated with `Easing.inOut(Easing.ease)` for smoother visual. Added `SkeletonToContent` wrapper that fades + slides content in (350ms, 8px translateY) when data loads.

2. **Sprint 692 (Rating Accessibility):** Added `accessibilityRole="header"` to all dimension labels and step titles in the rating flow. Dimension containers now have dynamic `accessibilityLabel` that announces score state ("Food Quality dimension, scored 4" vs "not yet scored").

3. **Sprint 693 (Refresh Timestamps):** Exposed `dataUpdatedAt` from `useInfiniteSearch` hook. Added last-updated timestamp display to Challenger header. Discover has the plumbing but no UI yet.

4. **Sprint 694 (Deep Link Validation):** Found and fixed ratingReminder sending compound screen path (`business/slug`) instead of separate fields. 36 tests validate all 6 templates use only valid screen values and all 5 handler branches exist.

---

## Questions for Critique

1. **SkeletonToContent wrapping FlatList:** We wrapped the entire FlatList in `SkeletonToContent`. For large lists, does the initial opacity animation on the container affect rendering performance? Should we animate individual items instead?

2. **Reanimated shimmer vs Animated:** We migrated from `Animated.timing` to `withRepeat(withSequence(withTiming))` on Reanimated's UI thread. The visual is smoother but adds Reanimated overhead. Is the migration justified for a simple opacity pulse?

3. **Accessibility: accessible prop on containers:** We added `accessible` to dimension containers which groups children for VoiceOver. This means individual circle score buttons inside may not be independently focusable. Is this the right trade-off for navigation efficiency vs granular control?

4. **Deep link compound path convention:** We fixed ratingReminder to use `{ screen: "business", slug: "..." }` instead of `{ screen: "business/slug" }`. Should we document this convention explicitly so future templates follow the pattern?

5. **Feature freeze without user testing:** We've been in TestFlight polish for 9 sprints (686-694) without a single real user touching the app. The CEO hasn't enabled Developer Mode. Is there a risk of over-polishing without user signal?

---

## Files Changed

- `components/Skeleton.tsx` — Reanimated shimmer + SkeletonToContent
- `components/rate/DimensionScoringStep.tsx` — VoiceOver headers + labels
- `components/rate/VisitTypeStep.tsx` — Header role on title
- `components/rate/RatingReviewStep.tsx` — Header role on review title
- `lib/hooks/useInfiniteSearch.ts` — Exposed dataUpdatedAt
- `lib/notifications.ts` — Fixed ratingReminder data format
- `app/(tabs)/index.tsx` — SkeletonToContent wrapping
- `app/(tabs)/challenger.tsx` — Last-updated timestamp
- `app/(tabs)/search.tsx` — formatTimeAgo import + dataUpdatedAt

---

## Metrics

| Metric | Before (689) | After (694) |
|--------|-------------|-------------|
| Build size | 662.3kb | 662.3kb |
| Tests | 11,934 | 12,022 |
| Test files | 508 | 512 |
