# Sprint 316: Korean + Thai Cuisine Dish Maps

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Add Korean and Thai cuisines to CUISINE_DISH_MAP with seed data

## Mission
SLT-315 identified Korean and Thai as the next cuisines for CUISINE_DISH_MAP. Both have 2+ seeded restaurants with dishes. Adding them enables dish shortcuts, related dishes, and search matching for 5 new dish leaderboards: Korean BBQ, Bibimbap, Fried Chicken, Pad Thai, Green Curry.

## Team Discussion

**Marcus Chen (CTO):** "Korean BBQ and Pad Thai are two of the most searched dish categories in Dallas. Adding them to the pipeline means those searches now surface structured leaderboards instead of generic business results."

**Amir Patel (Architecture):** "Zero code changes needed in consumers — useDishShortcuts, BestInSection, search autocomplete, and related dishes all pick up new cuisines automatically from CUISINE_DISH_MAP."

**Sarah Nakamura (Lead Eng):** "5 new leaderboards: korean-bbq, bibimbap, fried-chicken, pad-thai, green-curry. 11 new seed dishes across 8 businesses. The multi-word slug matching from Sprint 315 handles 'korean-bbq' → 'korean bbq' automatically."

**Jasmine Taylor (Marketing):** "Korean BBQ is huge in Carrollton/Royal Lane. 'Best Korean BBQ in Dallas' is a WhatsApp campaign waiting to happen. Same with Pad Thai in the Greenville area."

**Priya Sharma (QA):** "21 tests covering: CUISINE_DISH_MAP entries, dish counts, seed leaderboards, seed dish matching, and doc existence."

## Changes
- `shared/best-in-categories.ts` — Added korean (3 dishes) and thai (2 dishes) to CUISINE_DISH_MAP
- `server/seed.ts` — 5 new leaderboard boards (displayOrder 20-24); 11 new seed dishes across Korean and Thai restaurants

## Test Results
- **237 test files, 6,057 tests, all passing** (~3.2s)
