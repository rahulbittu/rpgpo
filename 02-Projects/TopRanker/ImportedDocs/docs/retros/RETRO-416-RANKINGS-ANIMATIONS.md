# Retro 416: Rankings Animated Transitions

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Priya Sharma:** "The #1 glow and big-mover flame create visual hierarchy in the rankings list. Users can instantly spot the winner and see which restaurants are climbing. The animations are subtle — no casino-style flashing."

**Amir Patel:** "TopRankHighlight is reusable for any future 'highlight this item' pattern. RankDeltaBadge cleanly replaces the static pill with an animated version. Both components respect the 'skip when inactive' pattern."

**Sarah Nakamura:** "Removing the redundant FadeInView wrapper fixed a double-animation glitch we hadn't noticed. The card entrance is now cleaner — just the internal stagger, no external wrapper fighting it."

## What Could Improve

- **SubComponents.tsx grew to 610 LOC** — The RankDeltaBadge added 34 lines. If more components are added, consider extracting into a separate file (e.g., RankBadges.tsx).
- **TopRankHighlight pulse is always-on** — Could be performance-conscious and stop the animation after a few cycles or when the card scrolls off screen.
- **Big mover threshold (±3) is hardcoded** — Could be a constant or even dynamic based on leaderboard size.

## Action Items

- [ ] Monitor SubComponents.tsx growth — consider extraction at 650 LOC — **Owner: Amir**
- [ ] Evaluate stopping TopRankHighlight animation when off-screen — **Owner: Sarah (future)**

## Team Morale
**8/10** — Satisfying UX polish sprint. Rankings tab feels more alive and responsive.
