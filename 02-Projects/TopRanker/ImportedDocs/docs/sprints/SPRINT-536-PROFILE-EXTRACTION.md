# Sprint 536: Profile Page Extraction — Credibility Section LOC Reduction

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 24 new (9,946 total across 425 files)

## Mission

Extract the credibility card, stats rows, getting started prompt, and growth prompt from `app/(tabs)/profile.tsx` into a standalone `ProfileCredibilitySection` component. This addresses the 4-consecutive-audit watch item (profile.tsx at 628/700 LOC) by reducing it to 446 LOC.

## Team Discussion

**Marcus Chen (CTO):** "This was the top health item from SLT-535. Profile.tsx was flagged in audits #62-65 without resolution. Going from 628 to 446 LOC gives us 254 lines of headroom before the 700 threshold — that's breathing room for at least 2 more feature additions."

**Amir Patel (Architecture):** "Clean extraction. The credibility card, stats row, enhanced stats, getting started card, and growth prompt were all self-contained UI with no cross-dependencies to other profile sections. The component takes 11 props — all primitive types or simple arrays. No state management leaked."

**Sarah Nakamura (Lead Eng):** "The extraction pattern matches our prior work (RatingHistorySection Sprint 443, SavedPlacesSection Sprint 377). Props interface is explicit, styles are co-located. profile.tsx drops 4 unused imports: ScoreCountUp, TIER_WEIGHTS, pct, TYPOGRAPHY."

**Rachel Wei (CFO):** "Health sprint, but directly enables the SLT-535 roadmap. With profile.tsx now healthy, we can focus the next 3 sprints on features: settings extraction (537), dish leaderboard (538), WhatsApp sharing (539)."

**Jasmine Taylor (Marketing):** "The credibility card is the first thing users see on their profile. Extracting it into a standalone component means we can iterate on the tier progression UX independently — important for the WhatsApp sharing screenshots we're planning."

## Changes

### New Files
| File | LOC | Purpose |
|------|-----|---------|
| `components/profile/ProfileCredibilitySection.tsx` | 246 | Credibility card, stats rows, getting started, growth prompt |

### Modified Files
| File | Before | After | Delta |
|------|--------|-------|-------|
| `app/(tabs)/profile.tsx` | 628 | 446 | -182 |

### What Was Extracted
- Credibility card (score display, tier name, progress bar, next-tier hint)
- Getting started card (shown for 0-rating users)
- Growth prompt (shown for users with ratings who haven't reached top tier)
- Stats row (ratings, places, categories, days, badges)
- Enhanced stats row (weight, streak, avg given, joined date)
- 19 associated styles (credibilityCard, credScore*, credWeight*, credProgress*, statsRow, statBox*, statNum, statLabel, enhancedStats*, gettingStarted*, growthPrompt*)

### Removed from profile.tsx
- `nextTierMap`, `nextRange`, `scoreRange`, `progressToNext` computations (moved to component)
- Imports: `ScoreCountUp`, `TIER_WEIGHTS`, `TIER_SCORE_RANGES`, `pct`, `TYPOGRAPHY`

## Test Summary

- `__tests__/sprint536-profile-extraction.test.ts` — 24 tests
  - Component: 12 tests (export, attribution, credibility card, ScoreCountUp, progress bar, getting started, growth prompt, stats row, enhanced stats, tier props, next tier, LOC)
  - Integration: 5 tests (import, render with props, no inline cred styles, no inline stats styles, no getting started styles, removed imports)
  - LOC reduction: 2 tests (under 500, reduced by 150+)
  - Docs: 5 tests (sprint header, team discussion, LOC numbers, component mention, retro sections)
