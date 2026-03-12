# Sprints 571-574 External Critique

## Verified wins
- Sprint 571 reduced `search.tsx` from 670 LOC to 588 LOC by extracting `DiscoverSections` (154 LOC). That is a real containment improvement.
- Sprint 572 reused the existing `fetchRatingPhotos` API for `RatingPhotoGallery` instead of adding a new fetch path.
- Sprint 573 shipped a discrete `TierProgressNotification` component (207 LOC) with an explicit threshold constant (`PROXIMITY_THRESHOLD = 0.60`), which is at least a defined rule rather than implicit UI logic.
- Sprint 574 fixed two production-significant mock-data failures: rankings crash from `getMockData` prefix collision, and Discover load failure from missing mock fallback.
- Sprint 574 added mock guards for 7 sub-paths, which is direct evidence the immediate failure mode was addressed.

## Contradictions / drift
- The team shipped four feature sprints, but Sprint 574 had to spend “critical fix” work on mock architecture failures. That is direct evidence feature velocity outpaced integration/governance discipline.
- `getMockData` is acknowledged as `startsWith`-based with ordering dependencies, and two critical bugs already came from path collisions. Continuing to patch it with more guards is drift, not a fix.
- `api.ts` grew from 570 to 575 LOC “to accommodate mock data guards” while also saying extraction is planned in Sprint 576. That is knowingly adding debt to a known-bad hotspot instead of removing it.
- The profile page is described as near threshold at 465/470 LOC, but two profile features were still added directly into that page pattern. The stated concern and implementation choice do not match.
- `DishVoteStreakCard` shipped while the server “doesn't compute it yet.” That means the UI contract exists before the data contract is real. If mock data is carrying the feature, this is not full feature delivery; it is staged UI delivery.
- Sprint 571’s extraction improved `search.tsx`, but there is no equivalent discipline shown for profile despite the same growth pattern being explicitly recognized. Standards appear inconsistent by surface, not by rule.

## Unclosed action items
- Replace or redesign `getMockData`; route-map extraction is the minimum response, but the current packet does not show the underlying ordering-risk is removed.
- Audit all mock paths for remaining prefix collisions and fallback gaps. Two critical bugs were found; there is no evidence of a complete sweep.
- Decide and enforce a rule for page-size/component extraction on `profile.tsx`. The question is still open while the file is already at 465/470 LOC.
- Close the `DishVoteStreakCard` data contract by implementing server-side `dishVoteStreak` computation or removing implication that the feature is fully shipped.
- Resolve whether governance cadence changes from 4+1 to 3+1. The packet asks the question because the current cadence already failed to catch accumulating risk soon enough.
- Follow through on the planned `api.ts`/mock extraction in Sprint 576. Right now it is only a promise used to justify additional growth.

## Core-loop focus score
**6/10**

- Search suggestion history, rating photo gallery, and tier progress are adjacent to user engagement, so this is not random scope.
- Reuse of existing APIs in Sprint 572 kept at least one feature tied to the existing product loop instead of expanding backend surface area.
- But two “critical” fixes in Sprint 574 were infrastructure/mock failures, which means engineering time was pulled off the loop by preventable support debt.
- Shipping `DishVoteStreakCard` before server computation weakens core-loop quality; it optimizes visible progress over end-to-end completeness.
- Profile work is accumulating as add-on cards/notifications. That can support retention, but it also looks like dashboard accretion unless backed by real data contracts and page structure discipline.

## Top 3 priorities for next sprint
1. **Kill the current `getMockData` hazard**
   - Stop adding ordered `startsWith` patches.
   - Move to explicit route mapping or a handler table with deterministic matching.
   - Include a path audit for collisions and missing fallbacks, not just a refactor.

2. **Finish the data contract for shipped profile features**
   - Implement server-side `dishVoteStreak` if the card is considered shipped.
   - Verify `TierProgressNotification` and streak data are backed by real API behavior, not only mocks.
   - Do not treat mock-backed UI as complete delivery.

3. **Enforce extraction rules on growing screens and hotspots**
   - Extract from `profile.tsx` now; waiting for the threshold is arbitrary given the pattern is already known.
   - Extract/mock-isolate `api.ts` now rather than after more guard growth.
   - Convert “planned in Sprint 576” into committed debt retirement with acceptance criteria.

**Verdict:** These sprints produced some real UI output, but the stronger signal is process drift: the team knowingly kept building on a fragile mock-routing setup until it caused two critical failures, then added more guards to the same mechanism while deferring the actual fix. Profile is following the same pattern of recognized growth without decisive extraction. The main issue is not lack of output; it is shipping partial or mock-dependent features while postponing structural corrections until they become urgent.
