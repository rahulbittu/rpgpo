# Sprint 329: Seed Data Enrichment

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Ensure every dish leaderboard has at least 5 entries for content density

## Mission
Many dish leaderboards had 0-2 entries because the seed matching logic only populated entries when a business had a dish name matching the leaderboard slug. Leaderboards with no matching dishes (e.g., "enchilada", "falafel") appeared empty. This sprint adds a fallback enrichment step: after dynamic matching, if a leaderboard has fewer than 5 entries, fill remaining slots with Dallas businesses using deterministic selection.

## Design Reference
**Before:** 27 leaderboards, many with 0-2 entries (only businesses with matching dish names)
**After:** 27 leaderboards, each with minimum 5 entries

**Enrichment logic:**
1. After dynamic matching, check `uniqueBizIds.length < MIN_ENTRIES`
2. Calculate `remaining = MIN_ENTRIES - uniqueBizIds.length`
3. Filter candidate businesses: Dallas only, not already used
4. Deterministic offset: `(displayOrder * 3) % candidates.length` — ensures different businesses per leaderboard
5. Insert fallback entries with descending scores (4.0, 3.75, 3.5...) and decreasing rating counts

## Team Discussion

**Marcus Chen (CTO):** "Empty leaderboards are worse than no leaderboards. A user tapping 'Best Enchilada in Dallas' and seeing nothing destroys trust. Even seed data needs to feel populated."

**Amir Patel (Architecture):** "The deterministic offset avoids all leaderboards getting the same fallback businesses. `displayOrder * 3` creates a varied rotation across the 10 seeded Dallas businesses. The scores descend from 4.0 to differentiate from 'real' matched entries which start at 4.5."

**Sarah Nakamura (Lead Eng):** "This only affects the seed function — no production query changes. The enrichment entries are legitimate seed data, just not name-matched. When real users rate dishes, these entries get replaced by actual community data."

**Jasmine Taylor (Marketing):** "Every leaderboard now has content for the WhatsApp demo. 'Best dim sum in Dallas — 5 restaurants ranked.' That's a shareable headline."

**Priya Sharma (QA):** "13 tests verifying: MIN_ENTRIES = 5, candidate filtering, deterministic selection, correct rank positions, descending scores, all 27 boards present."

**Rahul Pitta (CEO):** "Constitution #9: Low-data honesty. These are seed entries with lower scores than matched entries. Honest about being early data, but not empty."

## Changes
- `server/seed.ts` — Added enrichment loop after dish leaderboard matching. When a leaderboard has fewer than 5 entries, fills remaining slots from Dallas businesses using deterministic selection. +16 LOC.

## Test Results
- **250 test files, 6,233 tests, all passing** (~3.4s)
- **Server build:** 607.4kb (under 700kb threshold)
