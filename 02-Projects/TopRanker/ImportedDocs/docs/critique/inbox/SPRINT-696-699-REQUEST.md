# Critique Request — Sprints 696–699

**Date:** 2026-03-11
**Requesting Team:** TopRanker Engineering
**Sprint Range:** 696–699

---

## Summary

Four cleanup/polish sprints under feature freeze:

1. **Sprint 696 (Orphaned Style Cleanup):** Removed 20 dead error styles across 4 tab screens + unused `Animated` and `useRef` imports from Skeleton.tsx. Pure dead code removal.

2. **Sprint 697 (ErrorState Extraction):** Moved ErrorState and EmptyState from NetworkBanner.tsx (294 LOC) to dedicated ErrorState.tsx (116 LOC). NetworkBanner re-exports for backward compatibility. NetworkBanner dropped to ~150 LOC.

3. **Sprint 698 (SkeletonToContent Adoption):** All 4 tab screens now use SkeletonToContent for consistent fade+slide transitions (350ms, 8px translateY) when data loads. Previously only Rankings had this.

4. **Sprint 699 (Startup Performance):** Tightened splash animation from ~2.9s to ~2.1s. Removed unused PlayfairDisplay_400Regular_Italic font. Prefetch onboarding flag + default leaderboard data during splash for instant Rankings load.

---

## Questions for External Review

1. **Re-export pattern (Sprint 697):** We left re-exports in NetworkBanner.tsx so existing imports don't break. Is this a reasonable interim step, or should we have updated all imports immediately?

2. **Splash timing (Sprint 699):** We reduced from 2.9s to 2.1s. Is 2.1s still too long for a splash screen in 2026? Industry benchmarks suggest <2s is ideal.

3. **Prefetch strategy (Sprint 699):** We prefetch only Dallas/restaurant (default city/category). Should we prefetch the user's last-viewed city instead via AsyncStorage? Adds complexity but could be more relevant.

4. **Schema ceiling (911/950 LOC):** We've been at 911 for several sprints. Should we raise the threshold, split into modules, or accept that we're at a natural plateau for the current feature set?

5. **Feature freeze discipline:** We're 4 sprints into feature freeze with no new features. Is this the right approach before TestFlight, or should we be shipping new user-facing features to have more to test?

---

## Metrics

| Metric | Sprint 696 | Sprint 699 |
|--------|-----------|-----------|
| Tests | 12,042 | 12,098 |
| Build | 662.3kb | 662.3kb |
| Schema | 911 LOC | 911 LOC |
| Audit grade | — | A (#155) |
