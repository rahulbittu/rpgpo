# Sprint 434: Leaderboard SubComponents Extraction

**Date:** 2026-03-10
**Type:** Structural — Code Health
**Story Points:** 3

## Mission

Extract RankedCard and RankDeltaBadge from leaderboard/SubComponents.tsx into a standalone RankedCard.tsx module. SubComponents was at 609 LOC approaching the 650 threshold. After extraction: SubComponents drops to 313 LOC (-48%), RankedCard is 321 LOC. Re-export maintains backward compatibility.

## Team Discussion

**Amir Patel (Architecture):** "This resolves the only medium finding from Audit #44. leaderboard/SubComponents drops from 609→313 (-48%). RankedCard at 321 LOC is a clean standalone module with its own styles. The re-export pattern `export { RankedCard } from './RankedCard'` means zero changes needed in index.tsx."

**Sarah Nakamura (Lead Eng):** "8 test files needed redirection — the most of any extraction sprint. RankedCard touches many features: share buttons (sprint328), bookmarks (sprint351), cuisine display (sprint289), dish badges (sprint324), rank delta (sprint416), low-data honesty (sprint269). All redirected cleanly."

**Marcus Chen (CTO):** "SubComponents files are our canary for complexity. When they approach thresholds, extraction prevents the slow accumulation that makes refactoring painful later. Going from 609→313 gives us headroom for the next 10+ sprints of leaderboard features."

**Priya Sharma (Design):** "RankedCard is the most visually complex component in the app — photo strip, rank badge, dish badges, confidence indicator, share/bookmark buttons, delta animation. Having it in its own file makes future design iterations much easier to scope."

**Nadia Kaur (Security):** "No functional changes. Same component, same behavior, different file location. The re-export ensures all existing import paths continue to work."

## Changes

### New Files
- `components/leaderboard/RankedCard.tsx` (321 LOC) — RankedCard + RankDeltaBadge + all ranked card styles

### Modified Files
- `components/leaderboard/SubComponents.tsx` (609→313 LOC, -48%) — Removed RankedCard, RankDeltaBadge, ranked styles; added re-export
- `tests/sprint328-share-ranked-card.test.ts` — Redirected to RankedCard.tsx
- `tests/sprint351-bookmark-cuisine.test.ts` — Redirected leaderboard source to RankedCard.tsx
- `tests/sprint289-cuisine-display.test.ts` — Split HeroCard test to read from SubComponents
- `tests/sprint341-photo-fallback.test.ts` — Added RankedCard source for cuisine prop test
- `__tests__/sprint416-rankings-animations.test.ts` — Redirected to RankedCard.tsx
- `tests/sprint269-low-data-honesty.test.ts` — Redirected to RankedCard.tsx
- `tests/sprint324-dish-badges.test.ts` — Redirected to RankedCard.tsx
- `tests/sprint337-copy-link-share.test.ts` — Redirected to RankedCard.tsx

### Test Files
- `__tests__/sprint434-leaderboard-extraction.test.ts` — 17 tests: extraction, RankDeltaBadge, re-export, LOC reduction, file health

## Test Results
- **329 files**, **7,799 tests**, all passing
- Server build: **601.1kb**, 31 tables
- 8 test file redirects, 0 test cascades

## File Health After Sprint 434

| File | LOC | Threshold | % | Change | Status |
|------|-----|-----------|---|--------|--------|
| search.tsx | 698 | 900 | 77.6% | = | OK |
| profile.tsx | 690 | 800 | 86.3% | = | WATCH |
| rate/[id].tsx | 554 | 700 | 79% | = | OK |
| business/[id].tsx | 494 | 650 | 76% | = | OK |
| index.tsx | 422 | 600 | 70.3% | = | OK |
| challenger.tsx | 142 | 575 | 25% | = | OK |

**SubComponents health:**
| File | LOC | Extract At | Status |
|------|-----|-----------|--------|
| search/SubComponents.tsx | 396 | 700 | OK |
| leaderboard/SubComponents.tsx | 313 | 650 | OK (was 609) |
| rate/SubComponents.tsx | 593 | 650 | OK |
| rate/RatingExtrasStep.tsx | 514 | 600 | OK |

**All SubComponents files at OK status — no WATCH items remaining.**
