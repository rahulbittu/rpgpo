# Sprint 401: Profile Stats Dashboard

**Date:** 2026-03-09
**Type:** Feature
**Story Points:** 5

## Mission

Add a profile stats dashboard showing rating activity heatmap (last 30 days), score distribution histogram, and most-rated businesses. Constitution #9: "New users see progress immediately." Constitution #4: "Every rating has visible consequence." Users should see their rating patterns and impact at a glance.

## Team Discussion

**Marcus Chen (CTO):** "The profile has achievements (Sprint 393) and stats rows (Sprint 358), but no visual analytics. A heatmap shows *when* you rate, a distribution shows *how* you rate, and most-rated businesses show *where* you rate. Three dimensions of self-awareness."

**Rachel Wei (CFO):** "This drives retention. When users see their own rating patterns — 15 active days last month, average score 3.8 — they start tracking themselves. That's habit formation."

**Amir Patel (Architecture):** "Built as an extracted component (ProfileStatsCard.tsx, ~280 LOC) to keep profile.tsx under threshold. All computation is client-side via useMemo from existing ratingHistory data. Zero new API calls, zero server changes."

**Priya Sharma (Frontend):** "Three sub-components: ActivityHeatmap (30-day grid with 4 intensity levels), ScoreDistribution (5-bar histogram), MostRatedBusinesses (top 3 by frequency with average score). Minimum 3 ratings required to show meaningful stats."

**Sarah Nakamura (Lead Eng):** "profile.tsx grew from 731 to 739 LOC (92.4% of 800 threshold). That's 1 import + 6 lines of JSX. The component extraction strategy is paying off — we added a significant feature with minimal parent growth."

**Jasmine Taylor (Marketing):** "The heatmap is the shareable element. 'I rated 15 days this month on TopRanker!' is exactly the kind of achievement content our WhatsApp groups love."

## Changes

### New Files
- `components/profile/ProfileStatsCard.tsx` — Extracted stats dashboard with ActivityHeatmap, ScoreDistribution, MostRatedBusinesses. ~280 LOC.
- `tests/sprint401-profile-stats.test.ts` — 22 tests

### Modified Files
- `app/(tabs)/profile.tsx` — Import + render ProfileStatsCard. +8 LOC (731→739).

## Test Results
- **304 files**, **7,296 tests**, all passing
- Server build: **601.1kb**, 31 tables
