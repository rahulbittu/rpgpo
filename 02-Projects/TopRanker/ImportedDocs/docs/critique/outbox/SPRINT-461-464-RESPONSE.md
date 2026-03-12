# Critique Request: Sprints 461–464 External Critique

## Verified wins
- Sprint 461 shipped the P0 extraction in `RatingExport` and preserved compatibility via re-exports. That is a real delivery, not just planning.
- Sprint 463 added an admin bulk hours endpoint with at least structural validation for `open.day` and `open.time`.
- Sprint 464 shipped note sentiment indicators, and the implementation scope is explicit: 53 hardcoded keywords for short restaurant notes.
- Visit-type receipt prompts were included in sprint scope and appear to have shipped as part of the covered work.

## Contradictions / drift
- `RatingExtrasStep.tsx` was allowed to grow from 515→582 LOC across three sprints while extraction is now called P0. That is reactive, not controlled. The team saw the growth and still let it continue.
- Re-exports are being used again (`RatingExport` after `DiscoverFilters` in sprint 456), but there is no stated migration owner, expiry date, or cleanup trigger. That is a compatibility bridge with no bridge-removal plan.
- The bulk hours endpoint affects user-facing open/closed badges, yet validation only checks types, not semantic ranges. Calling it “admin-only” does not match the impact of bad data on end users.
- The sentiment feature is presented as UX-only, but the known false-positive/false-negative cases (`not bad`, sarcasm) are obvious enough to affect trust. “Indicator only” does not eliminate product risk if users read it as a judgment.
- Enrichment endpoint auth is now the third consecutive critique cycle with the same finding. At this point this is no longer an open question; it is unresolved security drift.

## Unclosed action items
- Decide whether re-exports are temporary or permanent, and attach a removal condition if temporary. Right now they are unmanaged debt.
- Add semantic validation to bulk hours (`day` range, time format/range). Structural typing alone is insufficient for user-facing business logic.
- Address `RatingExtrasStep.tsx` growth with an actual extraction plan, not just a P0 label after the file has already drifted upward for three sprints.
- Either add auth middleware to admin enrichment endpoints or explicitly record accepted risk with owner and review date. Repeating the critique item without a decision is process failure.
- Define trust boundaries for note sentiment: either constrain the UI to clearly low-confidence wording or improve the heuristic enough to avoid obvious phrase-level errors.

## Core-loop focus score
**6/10**

- Work shipped on user-adjacent flows: export extraction, receipt prompts, hours, and sentiment. This is not random side work.
- But too much of the sprint packet is about implementation debt created while shipping: re-exports, oversized file growth, shallow validation.
- The admin bulk hours work touches the core user experience indirectly, yet the validation quality does not match that importance.
- Sentiment indicators are peripheral unless they clearly improve the main note/review workflow; the packet provides no evidence of that impact.
- Repeated unresolved auth findings dilute focus. Leaving security issues open across three review cycles is operational drift.

## Top 3 priorities for next sprint
1. Resolve admin enrichment auth: implement middleware or formally accept the risk with owner, rationale, and deadline. Stop carrying this forward as an unowned critique.
2. Harden bulk hours validation to semantic correctness before more bad data enters the system: valid day range, valid 24h time format, and reject impossible values.
3. Put expiration on compatibility re-exports and extract `RatingExtrasStep.tsx` now, with named consumers/tasks rather than another sprint of incremental file growth.

**Verdict:** The sprint delivered features, but the packet shows a team repeatedly choosing “ship now, define boundaries later.” The problem is not isolated shortcuts; it is the lack of closure on known debt and known security risk. The clearest evidence is the third straight auth finding, unmanaged re-export patterns, and a P0 extraction only after several sprints of predictable file growth.
