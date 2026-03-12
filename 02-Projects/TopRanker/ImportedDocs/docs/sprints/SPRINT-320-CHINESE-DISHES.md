# Sprint 320: Chinese Cuisine Dish Map + Governance

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Add Chinese cuisine to CUISINE_DISH_MAP; SLT-320 + Audit #46 + Critique

## Mission
Sprint 316 retro identified Chinese as the next cuisine for CUISINE_DISH_MAP — 3 restaurants (Royal China, Sichuan House, Golden Dragon Palace) with dishes but no dish discovery pipeline. This sprint adds dim-sum, peking-duck, and hot-pot, plus governance documents for the Sprint 315-320 cycle.

## Team Discussion

**Marcus Chen (CTO):** "10 cuisines with 26 total dish leaderboards. The pipeline now covers the top 10 cuisines in Dallas dining. Chinese was the biggest gap — Peking Duck and Dim Sum are high-intent searches."

**Rachel Wei (CFO):** "26 SEO pages. Each is a unique landing opportunity. The Chinese additions alone could capture 'Best Dim Sum in Dallas' — a query with real search volume."

**Amir Patel (Architecture):** "CUISINE_DISH_MAP is now 10 entries. The useDishShortcuts hook handles all of them identically. Zero code changes needed for consumers. Architecture audit shows consistent A grades."

**Sarah Nakamura (Lead Eng):** "3 new leaderboards, 5 new seed dishes across 3 restaurants. The slug matching fix from Sprint 315 handles 'dim-sum' → 'dim sum', 'peking-duck' → 'peking duck', and 'hot-pot' → 'hot pot' automatically."

**Jasmine Taylor (Marketing):** "Chinese food is the #2 most-ordered cuisine in Dallas after Mexican. Having dedicated leaderboards means we can target Chinese food communities and WeChat groups in addition to WhatsApp."

**Priya Sharma (QA):** "17 tests covering: CUISINE_DISH_MAP entries, seed data, governance doc existence. Full suite at 6,115 tests."

## Changes
- `shared/best-in-categories.ts` — Added chinese (3 dishes: dim-sum, peking-duck, hot-pot) to CUISINE_DISH_MAP
- `server/seed.ts` — 3 new leaderboard boards (displayOrder 25-27); 5 new seed dishes across Chinese restaurants

## Test Results
- **241 test files, 6,115 tests, all passing** (~3.3s)
