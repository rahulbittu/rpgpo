# Critique Request — Sprints 706–709

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 706–709

---

## Summary

Four interaction/visual polish sprints under feature freeze:

1. **Sprint 706 (Haptic Consistency):** Replaced direct `Haptics.selectionAsync()` in all 4 tabs with centralized `hapticPullRefresh()` (Medium impact) and `hapticPress()` (Light impact) from `lib/audio.ts`. All functions guard for web platform.

2. **Sprint 707 (Image Optimization):** Enhanced SafeImage with `cachePolicy="memory-disk"`, configurable `priority` (low/normal/high), `recyclingKey` for list performance, and `placeholder` support. All 14 existing call sites backward compatible.

3. **Sprint 708 (Tab Bar Polish):** Added spring-animated 4px amber indicator dot below active tab icon. Dot springs in/out synchronized with existing icon scale and glow animations.

4. **Sprint 709 (Error Boundary):** Replaced emoji warning with branded Ionicons icon in amber circle, added reassuring copy ("your data is safe"), `__DEV__`-guarded error details, and "Go Home" fallback button with safe navigation.

---

## Questions for External Review

1. **Haptic intensity (Sprint 706):** We use Medium for pull-to-refresh and Light for buttons. Should we also add haptics to card taps, bookmark toggles, or rating score changes? Where's the line between polished and annoying?

2. **Image cache strategy (Sprint 707):** `memory-disk` is aggressive caching. Should we set max cache size or expiration? expo-image handles eviction internally, but should we tune it?

3. **Tab dot size (Sprint 708):** 4px at -6px below icon. Is this visible enough on smaller screens? Should we test on iPhone SE?

4. **Error boundary navigation (Sprint 709):** We use `require("expo-router").router.replace()` inside the class component's click handler. Is there a safer pattern for navigation in error recovery scenarios?

5. **Feature freeze assessment:** 15 sprints of polish. What's the risk of over-polishing before getting user feedback? Should we have shipped to beta 10 sprints ago?

---

## Metrics

| Metric | Sprint 706 | Sprint 709 |
|--------|-----------|-----------|
| Tests | 12,190 | 12,238 |
| Build | 662.3kb | 662.3kb |
| Audit grade | — | A (#165) |
