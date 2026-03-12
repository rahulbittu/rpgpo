# Retrospective — Sprint 271
**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "The score engine already had `computeDecayFactor` since Sprint 262. Wiring it into `recalculateBusinessScore` was a clean swap. The hard work was done in Phase 1b — Phase 3a just connected the dots."

**Amir Patel:** "The fallback pattern — use compositeScore when available, rawScore otherwise — handles the migration cleanly. We don't need to backfill 267+ columns on old ratings. The system naturally transitions as new ratings come in."

**Marcus Chen:** "Every step in Part 6 of the Rating Integrity doc is now live. Composite score, effective weight, temporal decay, weighted average. The formula from the doc is the formula in the code. No approximations."

## What Could Improve

- **Old step-function `getTemporalMultiplier` still exists**: It's in `shared/credibility.ts` and still imported by `server/storage/helpers.ts`. Not used for scoring anymore but could cause confusion. Should be deprecated or removed.
- **No backfill for compositeScore on pre-Sprint-267 ratings**: Old ratings use rawScore for the business score calculation. Over time this becomes less relevant (decay handles it), but a one-time backfill would make scores more accurate immediately.
- **Score breakdown doesn't show freshness indicator**: Users don't know that older ratings count less. A "freshness" indicator or "most recent rating was X days ago" could add transparency.

## Action Items
- [ ] Sprint 272: Bayesian prior for low-data restaurants — Amir
- [ ] Deprecate getTemporalMultiplier (mark as legacy) — backlog
- [ ] Backfill compositeScore on pre-267 ratings — backlog
- [ ] Freshness indicator on score breakdown — backlog

## Team Morale: 9/10
Phase 3a complete. The temporal decay formula from the Rating Integrity doc is now live in both the business score calculation and the score breakdown API. Scores now naturally reflect restaurant quality trends over time. The integrity pipeline is end-to-end: write-time integrity (composite, effective weight) → read-time decay → display-time confidence badges.
