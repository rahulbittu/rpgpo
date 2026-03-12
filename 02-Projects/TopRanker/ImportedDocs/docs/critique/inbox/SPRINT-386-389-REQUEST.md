# Critique Request: Sprints 386-389

**Date:** 2026-03-09
**Requesting Team:** TopRanker Engineering
**Sprints Covered:** 386-389
**Test Count:** 295 files, 7,128 tests

---

## Sprint 386: RankingsListHeader Extraction

Extracted ListHeaderComponent from `app/(tabs)/index.tsx` into `components/leaderboard/RankingsListHeader.tsx`. Reduced index.tsx from 572 → 419 LOC (70% of 600 threshold). 14-prop interface. 7 test files required cascade updates.

**Questions for review:**
1. 14 props feels like a lot. Should we use a context or reduce the prop surface?
2. The test cascade (7 files) is the largest we've hit. Is the source-based testing pattern scaling well, or should we reconsider?

## Sprint 387: Rating Edit/Delete

Added long-press action row to HistoryRow component. Edit navigates back to rate page with `editRatingId` param. Delete shows Alert confirmation, then calls DELETE endpoint. 48h edit window enforced client-side AND server-side.

**Questions for review:**
1. 48h window — too short? Too long? Most platforms use "edit anytime" for reviews.
2. Long-press discovery — should there be a visual hint that rows are interactive?

## Sprint 388: Business Hours Display

Added `closingTime` and `nextOpenTime` fields to MappedBusiness type. Enhanced BusinessCard status pill with timing text. Added open/closed indicator to MapBusinessCard.

**Questions for review:**
1. Fields are string-typed — should they be ISO timestamps with client-side formatting?
2. Graceful degradation is good, but should we show placeholder text when hours data is unavailable?

## Sprint 389: Challenger Round Timer

Replaced static text countdown with live DD:HH:MM:SS segmented timer. 1-second intervals. Urgency colors: green (>24h), amber (<24h), red (<6h).

**Questions for review:**
1. 1-second intervals on multiple cards — performance concern? Should we use a shared timer?
2. The urgency thresholds (6h, 24h) — are these the right breakpoints for user behavior?
3. challenger.tsx is now at 95% of threshold — extraction scheduled for Sprint 391. Should ChallengeCard be the extraction target?
