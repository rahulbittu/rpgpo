# Sprint 603: Leaderboard Confidence Indicators on HeroCard

**Date:** 2026-03-11
**Owner:** Sarah Nakamura (Lead Eng)
**Points:** 2
**Status:** Complete

## Mission

Add confidence indicators (VERIFIED / PROVISIONAL RANK / EARLY RANKING) to the HeroCard (#1 ranked business), matching the existing pattern in RankedCard. Ensures Constitution principle #9 (low-data honesty) applies to ALL ranking positions, not just #2+.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The #1 ranked business had no confidence indicator — just a crown badge and rating count. If a restaurant reaches #1 with only 4 ratings (provisional), users see it presented identically to a #1 with 40 ratings (high confidence). That violates our low-data honesty principle."

**Marcus Chen (CTO):** "This is especially critical for our Dallas launch. Early leaderboards will have many businesses with few ratings. Showing 'PROVISIONAL RANK' on the #1 card tells users honestly that rankings will shift as more ratings come in. That builds trust."

**James Park (Frontend):** "Reused the exact same pattern from RankedCard — `getRankConfidence()` with category-specific thresholds. Green shield-checkmark for established/strong, amber hourglass for provisional/early. Placed inline in the heroStripRow2 next to rating count."

**Amir Patel (Architecture):** "Clean implementation — one import addition (`getRankConfidence`, `RANK_CONFIDENCE_LABELS`), one IIFE in JSX, two new styles. Zero state changes, zero API changes."

## Changes

### Modified Files
- `components/leaderboard/SubComponents.tsx` — Added confidence pill to HeroCard (heroStripRow2). Imports `getRankConfidence` and `RANK_CONFIDENCE_LABELS` from lib/data.ts. Added `heroConfPill` and `heroConfPillText` styles.

### UX Detail

**HeroCard (Rank #1) now shows:**
- Rating count: "X weighted ratings"
- Confidence pill: VERIFIED (green, established/strong) or PROVISIONAL RANK / EARLY RANKING (amber)
- HOT badge: still shown for ≥50 ratings

**Confidence thresholds (category-specific):**
- Restaurant: provisional <3, early <10, established <25, strong ≥25
- Fine dining: provisional <5, early <15, established <35, strong ≥35

## Metrics

- **Server build:** 730.0kb (unchanged — client-only change)
- **Tests:** 11,325 passing (484 files)
