# Sprint 298: Cuisine-Specific Seed Data Validation

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Ensure every cuisine has ≥3 businesses in seed data for leaderboard eligibility

## Mission
The leaderboard minimum is 3 unique raters + 1 dine-in. By analogy, a cuisine leaderboard needs at least 3 restaurants to be meaningful. Several cuisines (mediterranean, chinese, italian, korean, thai, vietnamese) had fewer than 3. Add restaurants to bring all cuisines to the minimum.

## Team Discussion

**Marcus Chen (CTO):** "A cuisine leaderboard with 1-2 entries isn't a leaderboard — it's a list. Every cuisine must have at least 3 to be debatable, which is the core thesis."

**Amir Patel (Architecture):** "7 new businesses: Golden Dragon Palace (chinese), Nonna's Trattoria (italian), Seoul BBQ House (korean), Thai Orchid Garden (thai), Pho 95 (vietnamese), Istanbul Grill (mediterranean), Shawarma Point (mediterranean). All in Dallas metro."

**Sarah Nakamura (Lead Eng):** "Total seed businesses: 47 → 54. All new entries have full required fields: name, slug, cuisine, category, weightedScore, lat/lng, photoUrl."

**Jasmine Taylor (Marketing):** "Now every cuisine can have a 'Best X in Dallas' WhatsApp debate. 'Best dim sum' with 3 contenders, 'Best Korean BBQ' with 3 contenders. Each is a potential community conversation."

**Priya Sharma (QA):** "16 tests: 10 per-cuisine minimum checks, total count, no duplicate slugs, new business existence, and cuisine distribution assertions."

## Changes
- `server/seed.ts` — Added 7 new businesses across 6 cuisines (chinese +1, italian +1, korean +1, thai +1, vietnamese +1, mediterranean +2)
- 16 tests in `tests/sprint298-cuisine-seed-validation.test.ts`

## Seed Data Summary (54 businesses)
| Cuisine | Count | Status |
|---------|-------|--------|
| Mexican | 9 | ✅ |
| American | 8 | ✅ |
| Indian | 5 | ✅ |
| Japanese | 3 | ✅ |
| Chinese | 3 | ✅ (was 2) |
| Italian | 3 | ✅ (was 2) |
| Korean | 3 | ✅ (was 2) |
| Thai | 3 | ✅ (was 2) |
| Vietnamese | 3 | ✅ (was 2) |
| Mediterranean | 3 | ✅ (was 1) |

## Test Results
- **219 test files, 5,783 tests, all passing** (~3.0s)
