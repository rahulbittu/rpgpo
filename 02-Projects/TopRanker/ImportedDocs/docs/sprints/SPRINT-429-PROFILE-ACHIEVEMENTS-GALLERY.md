# Sprint 429: Profile Achievements Gallery

**Date:** 2026-03-10
**Type:** Enhancement — Profile UX
**Story Points:** 3

## Mission

Upgrade the flat achievements grid into a category-grouped gallery with progress tracking. Each achievement now shows how close the user is to unlocking it, organized by Rating Milestones, Exploration, Credibility, and Engagement categories. Unearned achievements display progress bars; earned ones show colored badges. Expandable category view lets users explore all 13 achievements.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Clean extraction. AchievementsSection becomes a thin wrapper delegating to AchievementGallery. The existing props interface is unchanged — zero impact on profile.tsx. Gallery is 265 LOC, wrapper is 22 LOC."

**Priya Sharma (Design):** "Category grouping makes the gallery scannable. Users see their strongest area first (earned categories show by default), and can expand to see the full picture. The progress bars on unearned tiles are key — they show 'you're 60% there' which motivates continued activity."

**Amir Patel (Architecture):** "buildAchievements() is a pure function that takes profile stats and returns AchievementDef[] with progress floats. No new API calls, no new state — all derived from existing props. The IoniconsName type alias keeps us clean on the `as any` budget."

**Marcus Chen (CTO):** "This ties back to Constitution #4 — every rating must have visible consequence. The progress bars make that concrete. When you rate your 7th restaurant, the Explorer achievement shows 7/15 progress. That's consequence made visible."

**Nadia Kaur (Security):** "No new data exposure. All achievement computation is client-side from existing profile data. The tier rank mapping is a simple ordinal — no credibility score leakage."

## Changes

### New Files
- `components/profile/AchievementGallery.tsx` (265 LOC) — Category-grouped gallery with AchievementTile, CategorySection, buildAchievements, progress tracking, expand/collapse

### Modified Files
- `components/profile/AchievementsSection.tsx` (288→22 LOC) — Thin wrapper delegating to AchievementGallery
- `tests/sprint393-achievements.test.ts` — Redirected milestone and UI tests to AchievementGallery.tsx

### Test Files
- `__tests__/sprint429-profile-achievements-gallery.test.ts` — 26 tests: exports, categories, progress, tiles, expand/collapse, wrapper, file health

## Test Results
- **325 files**, **7,720 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 0 test cascades (sprint393 redirected cleanly)

## File Health After Sprint 429

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | = | OK |
| profile.tsx | 684 | 800 | 85.5% | = | OK |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 422 | 600 | 70.3% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**All 6 key files at OK status.**
