# Critique Request: Sprints 426-429

**Requesting review of:** Sprints 426-429 (MapView extraction, as-any reduction, vote animations, achievements gallery)
**Date:** 2026-03-10
**Requested by:** Sarah Nakamura

## Sprint Summaries

### Sprint 426: MapView Extraction
- Extracted MapView (284 LOC) from search/SubComponents.tsx (660→396 LOC, -40%)
- Includes CITY_COORDS (11 cities), haversineKm utility, Google Maps init, marker management
- Re-export pattern in SubComponents for backward compatibility
- 4 test files redirected to new path

### Sprint 427: `as any` Cast Reduction
- Systematic reduction: 78→57 total, 35→12 client (-21 total, -23 client)
- 3 patterns: IoniconsName type alias, pct() for percentages, `as const` for CSS literals
- 15 files modified, zero functional changes
- Thresholds adjusted: 60 total, 15 client (accounting for comment mentions)

### Sprint 428: Challenger Vote Animations
- VoteAnimation.tsx (148 LOC): AnimatedVoteBar (spring physics), VoteCelebration (scale+fade), VoteCountTicker (bounce)
- Uses Animated API with `useNativeDriver: true` where possible
- Components standalone — not yet wired into ChallengeCard (planned Sprint 431)

### Sprint 429: Profile Achievements Gallery
- AchievementGallery.tsx (265 LOC): Category-grouped (Rating, Exploration, Credibility, Engagement)
- Progress tracking: unearned achievements show 0-100% progress bars
- AchievementsSection reduced to 22 LOC wrapper
- Expand/collapse toggle for hidden categories

## Questions for External Review

1. **Re-export pattern longevity** — Sprint 426 uses `export { MapView } from "./MapView"` in SubComponents for backward compat. Is this pattern sustainable long-term, or should imports be redirected to the actual source to prevent stale indirection?

2. **IoniconsName type alias duplication** — Sprint 427 adds `type IoniconsName = ComponentProps<typeof Ionicons>["name"]` in each file that needs it (~15 files). Should this be a shared export from a central types file, or is per-file better for tree-shaking?

3. **Vote animation components without integration** — Sprint 428 created animation components that aren't yet wired into ChallengeCard. Is shipping standalone animation modules without integration a risk (dead code), or is this acceptable progressive delivery?

4. **Achievement progress computation accuracy** — Sprint 429 computes progress as `Math.min(currentValue / target, 1)`. For tier achievements, it uses ordinal rank (community=0, city=1, etc.). Is ordinal progress (e.g., "33% toward Trusted" when at City tier) misleading vs. credibility score-based progress?

5. **Gallery expand/collapse state** — The gallery defaults to showing only categories with earned achievements. Is this the right default, or should all categories be visible to motivate users toward new goals?

## Metrics

- 325 test files, 7,720 tests, all passing
- Server bundle: 601.1kb (stable 19 sprints)
- 44th consecutive A-grade audit
- All 6 key files at OK status
- `as any`: 57 total (<60), 12 client (<15)
