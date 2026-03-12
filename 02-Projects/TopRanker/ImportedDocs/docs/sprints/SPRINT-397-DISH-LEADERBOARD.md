# Sprint 397: Dish Leaderboard Enhancements

**Date:** 2026-03-09
**Type:** Feature Enhancement
**Story Points:** 5

## Mission

Enhance dish leaderboard cards with entry counts in chips, high-confidence badges for well-rated dishes, and a "Rate this dish" CTA to drive rating submissions. Constitution #47: "Specificity creates disruption. 'Best biryani in Irving' > 'Best restaurant in Dallas'."

## Team Discussion

**Marcus Chen (CTO):** "Dish leaderboards are our specificity weapon. 'Best biryani in Irving' is what makes us different from Yelp. This sprint makes the leaderboards more informative and more actionable."

**Priya Sharma (Frontend):** "Three enhancements: (1) Entry count badges in chips so users see how many restaurants compete, (2) 'High confidence' badge when a dish has 10+ ratings — transparent data quality, (3) A 'Rate this dish' CTA below entries to drive the rating loop."

**Amir Patel (Architecture):** "The high confidence badge at 10+ ratings aligns with our Rating Integrity system. Constitution #9: 'Low-data honesty mandatory.' We show 'Early data' below 5, nothing at 5-9, and 'High confidence' at 10+. Three tiers of data transparency."

**Sarah Nakamura (Lead Eng):** "All changes are additive — no structural modifications. The component grew by ~30 lines (new JSX + styles). No test cascades."

**Jasmine Taylor (Marketing):** "Entry count in chips is a subtle but powerful signal. When someone sees 'Biryani (12)' they understand 12 restaurants compete. That's social proof the ranking is meaningful."

## Changes

### Modified Files
- `components/DishLeaderboardSection.tsx` — Added entry count badges in chips (chipCount styles), high-confidence badge (10+ ratings), "Rate this dish" CTA. +30 LOC.

### New Files
- `tests/sprint397-dish-leaderboard.test.ts` — 16 tests

## Test Results
- **301 files**, **7,233 tests**, all passing
- Server build: **601.1kb**, 31 tables
