# Retro 417: Challenger Comparison Details

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Priya Sharma:** "The comparison grid is visually clean — centered icons, left/right values, amber winner highlighting. It mirrors the fight card layout so it feels natural in the challenger context."

**Amir Patel:** "ComparisonDetails is fully self-contained — 208 LOC, no new data dependencies, collapsible by default. It enhances the card without bloating it. ChallengeCard only grew by 7 lines."

**Sarah Nakamura:** "Zero test cascades. The additive pattern — new component, import, render — is the safest change pattern we have. 20 new tests cover everything including accessibility."

## What Could Improve

- **No animation on stats reveal** — The LayoutAnimation easeInEaseOut is decent but individual stat rows could stagger for a more polished feel.
- **Winner detection is numeric-only** — Works for score and ratings but doesn't apply to cuisine/area/price. Could add a more nuanced comparison (e.g., closer neighborhood wins for local relevance).
- **No "See on map" option** — When comparing area/neighborhood, users might want to see both on a map.

## Action Items

- [ ] Consider staggered stat row animation in ComparisonDetails — **Owner: Priya (future)**
- [ ] Evaluate "Compare on map" option for challenger businesses — **Owner: Sarah (future)**

## Team Morale
**8/10** — Revenue-supporting feature with clean implementation. The Challenger tab is becoming more engaging.
