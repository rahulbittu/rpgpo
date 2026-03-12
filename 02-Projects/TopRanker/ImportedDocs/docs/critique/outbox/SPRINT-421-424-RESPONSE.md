# Critique Request: Sprints 421-424 External Critique

## Verified wins
- Sprint 421 closed the previously started map search wiring with an actual `onSearchArea` callback and center-based filtering. This is a real shipped increment, not just refactor noise.
- Sprint 422 added review sorting in a non-mutating way (`copy + sort`) and split sort chips into a separate component. That is a concrete UX improvement with contained implementation.
- Sprint 423 reused existing `rankDelta` data to ship a weekly summary card quickly, and fixed the `as any` issue mentioned in the packet with a typed `IoniconsName` approach.
- Sprint 424 improved the rate flow with clearer photo guidance, progressive feedback, and thumbnail indexing. Those are concrete UX changes, not vague “polish.”
- Quality signals are stable: 7,675 passing tests, stable server bundle, and no file-health regressions reported.

## Contradictions / drift
- Sprint 423 is the biggest drift: a **weekly** summary is reportedly derived from `rankDelta` that “reflects all-time delta, not necessarily this week's.” That is a naming and data-contract contradiction. If true, the card is semantically wrong.
- Sprint 421 claims completion of “Search this area,” but the implementation is a hardcoded 5km radius. That is wiring, not a fully credible map-search behavior. The feature is shipped in a narrow approximation.
- Sprint 422 presents “Most Weighted” as a product differentiator while the packet itself raises anti-requirement/reverse-engineering risk. That means the team shipped a trust-signal exposure before resolving whether exposing it is acceptable.
- Sprint 424 exposes exact verification boost math while also questioning gaming risk. Same pattern: mechanics were made legible before deciding whether they should be legible.
- The `as any` threshold being exactly 78/78 is not a win; it signals governance drift. “Fixed one” while the cap is fully exhausted means there is no remaining buffer and the threshold has stopped acting as a forcing function.

## Unclosed action items
- Decide whether map search radius should be zoom-dependent instead of fixed at 5km. This is still unresolved and directly affects result relevance.
- Validate whether 5km is acceptable across urban/suburban contexts. No evidence in the packet that this was tested.
- Resolve whether “Most Weighted” violates anti-requirements by exposing ranking logic indirectly.
- Fix weekly summary semantics: either add a time-bounded delta field or rename/remove the feature. Current described data source does not support the label.
- Revisit whether exact photo boost percentages and caps should be user-visible or abstracted to reduce gaming.
- Lower or otherwise rework `as any` thresholds. Sitting at 78/78 and 35/35 means the current limit no longer drives cleanup.

## Core-loop focus score
**6/10**

- 3 of 4 sprints are on the user loop: discover places, evaluate reviews, submit better ratings/photos.
- Sprint 421 and 422 directly improve search and trust evaluation, which are core-loop relevant.
- Sprint 424 supports contribution quality, also core-loop relevant.
- Sprint 423 is weaker: a weekly summary card is adjacent analytics/UI, not core-loop critical.
- Too much of the sprint packet is about exposing internal mechanics (weights, boost math) rather than improving outcome quality safely.
- Core-loop work is undermined by semantic shortcuts: “weekly” using all-time delta is a credibility risk inside the loop.

## Top 3 priorities for next sprint
1. **Fix data truth before adding more UI:** correct the weekly summary so it uses actual time-bounded movement data, or remove/rename it.
2. **Stop exposing rank/verification mechanics without policy:** review and likely blunt both “Most Weighted” and exact photo boost percentages if they create reverse-engineering or gaming risk.
3. **Make map search behavior real, not hardcoded:** tie search radius to zoom or visible region and validate relevance instead of locking to 5km.

**Verdict:** These sprints shipped visible product work, but two of the four features appear to have been released before their underlying semantics/policy were settled. The worst issue is the “weekly” card potentially using all-time delta, which is outright misleading. The rest show a pattern of shortcutting decisions: hardcoded map radius, public weighting sort, exact boost math, and exhausted `as any` thresholds. Shipping happened, but rigor lagged behind it.
