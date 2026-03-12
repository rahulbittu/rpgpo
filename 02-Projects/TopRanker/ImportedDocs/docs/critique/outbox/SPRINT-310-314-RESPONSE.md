# Critique Request — Sprints 310-314 External Critique

## Verified wins
- Shared `useDishShortcuts` hook replaced duplicated inline `CUISINE_DISH_MAP` usage across Rankings and BestInSection. That is a real consolidation, not just a rename.
- Dish discovery became an end-to-end loop across multiple surfaces: search → autocomplete → leaderboard → related dishes → search.
- Client-side filtering is justified by the stated scale today: 19 boards now, and the packet says ~50 boards is still easy.
- Related dishes via static lookup avoids unnecessary API latency for the current use case.
- Analytics events were added in Sprint 314.
- Test suite is large and green, and the packet reports 54 tests added across these sprints.

## Contradictions / drift
- You claim the discovery pipeline is “fully client-side except for the initial data fetch,” but `useDishShortcuts` is explicitly using React Query with live entry counts. That is not purely static client-side behavior; it is client logic sitting on top of fetched live data. The architecture description is muddy.
- `useDishShortcuts` is presented as a shared abstraction win, but it fetches **all dish boards for a city and filters by cuisine client-side**. That is abstraction with built-in overfetch. Fine at 19; already acknowledged as questionable at 100+.
- Related dishes are sourced from `CUISINE_DISH_MAP`, while actual dish leaderboards are database-driven. That creates a known split-brain source of truth: discovery UI can omit admin-created boards.
- Sprint 314 added analytics events without any dashboard, alerting, or stated success metric. That is instrumentation theater until someone reads it.
- Architecture Audit #44 is listed in Sprint 310, but the packet provides no findings, decisions, or remediations from that audit. Either it had no impact or the packet is omitting the important part.
- “Live leaderboard” constitution alignment is asserted, but the surrounding design intentionally tolerates static dish relationships and potentially stale client-fetched arrays. The live claim applies to rankings, not to the full discovery graph.

## Unclosed action items
- Resolve the source-of-truth conflict between `CUISINE_DISH_MAP` and database-driven dish boards.
- Define the threshold and trigger for moving dish search/filtering server-side instead of leaving it as a vague “50 is easy, 100+ maybe.”
- Decide whether the API needs a cuisine filter for `useDishShortcuts` rather than continuing city-wide fetch + client filter.
- Define how dish discovery analytics will actually be consumed: dashboard, key funnel metrics, and alerting/monitoring.
- Clarify ownership/responsibility of `DishMatch` in `SearchOverlays`; the packet asks if it is doing too much but gives no decision.
- State a refetch/staleness policy for the client-side discovery flow instead of asking the reviewer to infer one.

## Core-loop focus score
**7/10**

- Strong focus on a real user loop: discover dish → inspect leaderboard → continue exploring.
- Multiple sprints stacked on the same flow instead of scattering effort across unrelated features.
- But too much of the loop depends on static mappings layered over live ranking data, which weakens integrity.
- Analytics were added late and incompletely, so measurement lagged implementation.
- The loop is optimized for current small scale, with several known scaling and freshness questions deferred rather than closed.

## Top 3 priorities for next sprint
1. **Eliminate split-brain dish discovery data**
   - Stop relying on `CUISINE_DISH_MAP` as the authoritative source for related/exposed dishes if admins can create boards outside it.
   - Either derive discovery relationships from API data or add validation that static map and live boards cannot diverge silently.

2. **Close the overfetch path in `useDishShortcuts`**
   - Add a cuisine-filtered API path or equivalent server support.
   - Keep the shared hook, but stop making “shared” mean “fetch everything then trim locally.”

3. **Make analytics actionable**
   - Define the dish discovery funnel and publish a dashboard: autocomplete dish hit rate, leaderboard opens, related-dish clicks, loop continuation.
   - Without this, Sprint 314’s analytics work is unfinished.

**Verdict:** These sprints mostly stayed on one user-facing loop, which is good, but the implementation is carrying an obvious integrity problem: live dish boards are database-driven while discovery relationships remain static-map driven. That is the main contradiction, and it undermines completeness of the feature. The shared hook is a reasonable cleanup, but it currently bakes in overfetch. Analytics exist but are not operationalized. This is decent product progress with unresolved architecture debt, not a finished pipeline.
