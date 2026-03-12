# Retro 397: Dish Leaderboard Enhancements

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "The three-tier confidence system (Early data / default / High confidence) is a clean implementation of Constitution #9. Users can trust what they see."

**Priya Sharma:** "Zero test cascades. All changes were additive. The dish leaderboard component is well-structured for enhancements."

**Jasmine Taylor:** "Entry counts in chips are exactly what power users want. When deciding between 'Biryani (12)' and 'Butter Chicken (4)', the numbers tell you which ranking is more reliable."

## What Could Improve

- **DishLeaderboardSection.tsx at ~520 LOC** — Getting large. Could benefit from extracting the modal or the entry card.
- **No animation on badge appearance** — High confidence badge pops in without transition.
- **CTA links to search, not directly to rating** — Ideally would deep-link to rate a specific dish.

## Action Items

- [ ] Consider extracting DishSuggestModal from DishLeaderboardSection — **Owner: Priya (future sprint)**
- [ ] Deep-link CTA to dish-specific rating flow — **Owner: Amir (future sprint)**

## Team Morale
**8/10** — Dish leaderboards feel more polished. Good balance of information density and clarity.
