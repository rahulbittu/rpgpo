# Sprints 386-389 External Critique

## Verified wins
- Sprint 386 produced a measurable file-size reduction: `app/(tabs)/index.tsx` went from 572 LOC to 419 LOC after extracting `RankingsListHeader`.
- Sprint 387 added a complete edit/delete path for ratings, including UI trigger, navigation with `editRatingId`, delete confirmation, and server-backed DELETE behavior.
- Sprint 387 enforced the 48h edit window in both client and server layers, which is the correct place for actual policy enforcement.
- Sprint 388 expanded business-hours data flow by adding `closingTime` and `nextOpenTime` to `MappedBusiness` and surfaced that data in both `BusinessCard` and `MapBusinessCard`.
- Sprint 389 improved the challenger timer from static text to a live segmented countdown with explicit urgency states.

## Contradictions / drift
- Sprint 386 claims a successful extraction, but the result is still a 14-prop interface. That is not clean modularization; it is moving coupling into a new file.
- The 7-file test cascade in Sprint 386 is a warning sign against the current source-shaped testing pattern. If a header extraction forces broad rewrites, the tests are over-coupled to implementation structure.
- Sprint 387 asks whether 48h is the right edit window, but there is no evidence here that the choice was driven by user behavior, abuse prevention, or product goals. It reads as policy-by-guess.
- Sprint 387 adds long-press interactions but immediately raises discoverability concerns. That means the chosen interaction model is likely hiding a core action behind a weak affordance.
- Sprint 388 added string-typed time fields while also questioning whether they should be ISO timestamps. That is schema drift: shipping presentation-shaped data before resolving canonical data format.
- Sprint 388 calls graceful degradation “good” but still asks whether placeholder text should be shown. That suggests the fallback behavior was not fully designed before implementation.
- Sprint 389 adds 1-second timers on cards, then asks if performance is a concern and whether a shared timer is needed. That is implementation before architecture review.
- Sprint 389 already flags `challenger.tsx` at 95% of threshold with extraction deferred to Sprint 391. That is knowingly carrying forward a file-growth problem instead of cutting it when identified.

## Unclosed action items
- Sprint 386: decide whether `RankingsListHeader` should keep 14 props, collapse its API, or use a different state-sharing pattern.
- Sprint 386: review whether source-based testing is still viable given the 7-file cascade from a single extraction.
- Sprint 387: decide whether the 48h edit window is the correct product policy.
- Sprint 387: add or reject a visual affordance for long-press interactivity.
- Sprint 388: decide the canonical type for business-hours fields: raw timestamps vs formatted strings.
- Sprint 388: define explicit fallback UX for missing hours data.
- Sprint 389: address timer architecture for multiple cards, likely via a shared clock instead of per-card intervals.
- Sprint 389: validate or change the urgency thresholds of 24h and 6h.
- Sprint 389: perform the `challenger.tsx` extraction instead of deferring while the file is already near threshold.

## Core-loop focus score
**6/10**
- Rating edit/delete is core-loop adjacent and likely meaningful because it improves management of user-submitted ratings.
- Business hours display supports selection decisions and is also core-loop relevant.
- The live challenger timer is engagement-oriented, but the segmented 1-second presentation looks more like polish unless tied to measured behavior.
- Header extraction is maintenance work, not user-value, and its large prop surface suggests weak payoff.
- Too many items ended with open product/architecture questions, which indicates execution without enough upfront narrowing.
- There is visible effort spent on UI detail while avoidable structural issues were knowingly deferred.

## Top 3 priorities for next sprint
1. Fix the architectural debt you already identified: extract `challenger.tsx`, and replace per-card timer intervals with a shared timer model if multiple cards are rendered.
2. Resolve schema and API shape drift: normalize business-hours data to a canonical machine-friendly format and reduce the `RankingsListHeader` prop surface instead of accepting a 14-prop boundary.
3. Tighten core interaction clarity: make rating row actions discoverable without relying on hidden long-press behavior, and confirm the 48h edit rule is an intentional product decision rather than an arbitrary constraint.

**Verdict:** These sprints shipped visible changes, but too much of the work was implemented before the team settled the underlying API, interaction, and performance decisions. The pattern is consistent: build first, then ask if the model, affordance, schema, or architecture was correct. The biggest concern is not any single feature; it is repeated drift between implementation detail and product/technical intent.
