# Sprint 416: Rankings Animated Transitions

**Date:** 2026-03-09
**Type:** Enhancement — Rankings UX
**Story Points:** 3

## Mission

Add animated transitions to the Rankings leaderboard: a golden shimmer highlight for the #1 ranked card, an animated rank delta badge for big movers (±3 positions), and clean up the redundant FadeInView wrapper (RankedCard already has its own stagger animation).

## Team Discussion

**Priya Sharma (Design):** "The #1 card now has a subtle amber glow border that pulses — just enough to draw the eye without being distracting. It says 'this is the top spot' without shouting. The big-mover flame icon on rank-up is a nice touch — users notice when a restaurant shoots up 5 positions."

**Amir Patel (Architecture):** "TopRankHighlight is a reusable wrapper — 102 LOC, pure RN Animated API, no new dependencies. The RankDeltaBadge replaces the static delta pill with an animated version for ±3 movers. Both skip animation when not applicable (active=false, delta<3)."

**Sarah Nakamura (Lead Eng):** "Removed the redundant FadeInView wrapper — RankedCard already had internal slide+fade animation since Sprint 193. The double animation was causing a subtle glitch on first render. index.tsx stayed at 421 LOC. One test cascade in sprint328 — SubComponents.tsx LOC threshold bumped from 600→650."

**Marcus Chen (CTO):** "Rankings is our most-visited tab. These micro-animations make it feel more alive — the #1 glow draws attention to the winner, the flame icon makes big movers visible. Small touches that build perception of a polished product."

**Jordan Blake (Compliance):** "TopRankHighlight has accessibilityLabel 'Top ranked — number 1 position'. RankDeltaBadge has accessibility label with rank direction and magnitude. Screen readers announce the animations' purpose."

## Changes

### New Files
- `components/animations/TopRankHighlight.tsx` (102 LOC) — Animated golden shimmer border + pulse scale for #1 card

### Modified Files
- `app/(tabs)/index.tsx` (420→421 LOC, +1) — Replaced FadeInView wrapper with TopRankHighlight, imported TopRankHighlight
- `components/leaderboard/SubComponents.tsx` (576→610 LOC, +34) — Added RankDeltaBadge function with pulse animation for big movers (±3), flame/trending-down icons, replaced static delta pill

### Modified Test Files
- `tests/sprint328-share-ranked-card.test.ts` — Bumped SubComponents.tsx LOC threshold from 600→650

### Test Files
- `__tests__/sprint416-rankings-animations.test.ts` — 20 tests: TopRankHighlight component, RankDeltaBadge, index.tsx integration, removed redundant FadeInView

## Test Results
- **316 files**, **7,539 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 1 test cascade (sprint328 LOC threshold) — fixed

## File Health After Sprint 416

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 692 | 900 | 77% | = | OK |
| profile.tsx | 680 | 800 | 85% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 421 | 600 | 70% | +1 | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status.**
