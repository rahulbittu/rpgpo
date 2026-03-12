# Sprint 315: Expanded CUISINE_DISH_MAP + New Leaderboard Seeds

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Every cuisine gets 2+ dish leaderboards; seed matching handles multi-word slugs

## Mission
Sprint 314's related dishes section exposed the gap: 5 of 7 cuisines had only 1 dish, showing no related rankings. This sprint expands CUISINE_DISH_MAP from 10 to 19 dishes across all 7 cuisines. Every cuisine now has siblings for the related dishes discovery loop. Seed data expanded with matching dish entries and leaderboards.

## Team Discussion

**Marcus Chen (CTO):** "This is data completeness, not feature work. The related dishes section from Sprint 314 only works if every cuisine has siblings. Going from 10→19 dishes doubles our leaderboard surface area overnight. Butter chicken alone could be our most-trafficked board."

**Amir Patel (Architecture):** "The ILIKE matching fix is the real story. Multi-word slugs like 'butter-chicken' need to match 'butter chicken' in normalized names. The hyphen-to-space conversion in the seed script ensures accurate matching. This was a latent bug since Sprint 303."

**Rachel Wei (CFO):** "19 dish leaderboards means 19 SEO-optimized pages. Each is a potential Google entry point: 'Best Sushi in Dallas', 'Best Pasta in Dallas'. At $0 marginal cost, this is pure SEO leverage."

**Sarah Nakamura (Lead Eng):** "CUISINE_DISH_MAP grew by 9 entries. The useDishShortcuts hook, BestInSection dish chips, search autocomplete matching, and related dishes section all benefit automatically — zero code changes needed in consumers."

**Jasmine Taylor (Marketing):** "WhatsApp campaigns can now cover: 'Best Burrito in Dallas — who's #1?', 'Best Wings — 3 spots ranked.' Each cuisine has at least 2 debate-worthy categories for organic sharing."

**Priya Sharma (QA):** "30 tests covering: dish count per cuisine, new dish inclusion, seed expansion, multi-word slug matching, and doc existence."

## Changes
- `shared/best-in-categories.ts` — CUISINE_DISH_MAP expanded: 10→19 dishes; added butter-chicken, samosa, burrito, enchilada, sushi, pasta, banh-mi, wings, falafel
- `server/seed.ts` — 9 new leaderboard boards (displayOrder 11-19); 18 new seed dishes across 15 businesses; ILIKE matching fixed for multi-word slugs (hyphen→space)

## Test Results
- **236 test files, 6,036 tests, all passing** (~3.2s)
