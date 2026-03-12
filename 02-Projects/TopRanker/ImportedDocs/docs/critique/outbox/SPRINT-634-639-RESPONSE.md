# Sprints 634-639 External Critique

## Verified wins
- Sprint 634 documents a concrete, repeatable fix pattern for the FlatList/ScrollView padding mismatch and names affected styles/components. That is a real UI consistency correction.
- Sprint 635 includes two specific shipped changes: blue-dot user location marker and first-fix auto-pan, plus a measurable spacing change in filters.
- Sprint 636 shipped actual OG endpoints with defined routes and dimensions, and wired prerender middleware to use them. That is implementation, not just intent.
- Sprint 637 replaced one progress indicator pattern with another more explicit step model. This is a concrete UX change.
- Sprint 638 added a compact quick-stats row and removed one dead import. Small, but verified from the packet.
- Sprint 639 changed ranking logic materially by adding a proximity signal and rebalancing all seven weights.

## Contradictions / drift
- The packet says these six sprints address “CEO visual feedback + feature additions,” but the set is unfocused: alignment polish, map UX, OG infrastructure, rating-step visuals, profile stats, and search ranking are not one coherent sprint arc.
- The stated CEO mandate is “remove before adding,” yet Sprints 635, 636, 638, and 639 are additive. Only minor simplification is shown, and the packet itself admits Profile still has 13+ sections.
- Sprint 634 claims “Alignment Fix Complete,” but the review question still asks for a better architectural approach to prevent the same class of bug. That means the issue is patched, not resolved structurally.
- Sprint 636 ships SVG OG images while the packet already acknowledges major platform rendering unreliability. Shipping a known-fragile format for OG is drift from distribution reliability.
- Sprint 639 changes all seven relevance weights, but the packet provides no validation framework, no offline evaluation, no guardrails for non-local intent. That is algorithm tuning without evidence.
- Across six sprints, there is repeated UI refinement, but no evidence of simplification outcomes beyond one dead import and one compact row. This does not match a strong “simplify” mandate.

## Unclosed action items
- OG image reliability is unresolved. Yes, add PNG output or rasterized delivery. Tradeoff: more server CPU/storage/cache complexity, but SVG-only OG is not dependable enough for link previews. Reliability should win.
- Proximity weighting is unresolved. 8% is arbitrary from the packet. Validate with segmented evaluation: local-intent vs non-local-intent queries, click/save/rating downstream behavior, and regression checks on known good result sets.
- The spacing/padding bug class is unresolved architecturally. The current `marginHorizontal: -16` pattern is a workaround. Standardize page gutters in shared layout primitives or list wrappers instead of hand-fixing component by component.
- Profile simplification is unresolved. The packet explicitly states 13+ sections remain despite the mandate. This should be treated as an open product debt item, not deferred by adding more profile content.
- Auto-pan behavior on first location acquisition needs product validation. The packet confirms implementation, not whether it improves or disrupts map use.
- Rebalanced relevance weights need documentation/versioning if they are going to keep changing; otherwise ranking drift becomes hard to track.

## Core-loop focus score
**4/10**
- Only Sprint 639 clearly touches the discovery/relevance loop in a core way.
- Sprint 635 has some core-loop adjacency via map usability, but it is mostly UI polish.
- Sprint 637 and 638 are secondary UX improvements, not core-loop leverage.
- Sprint 636 is distribution/share infrastructure, useful but not core-loop execution.
- The six-sprint batch lacks a single measurable through-line tied to finding, evaluating, and rating places better.

## Top 3 priorities for next sprint
1. **Close the simplification gap on Profile**
   - Cut or consolidate sections aggressively until the section count materially drops.
   - Stop adding profile surface area until the mandate is actually met.

2. **Make OG images production-safe**
   - Serve PNG/rasterized OG images for social crawlers, keep SVG only as an internal rendering source if needed.
   - Test actual preview behavior on major platforms instead of assuming standards compliance.

3. **Put ranking changes behind evidence**
   - Define evaluation for proximity weighting by intent segment and geography.
   - Add guardrails before further weight tuning; otherwise you are just moving numbers around.

**Verdict:** This sprint set shipped real work, but it is strategically messy. The biggest problem is drift: a simplification mandate produced more additions, a “complete” layout fix is still a workaround, and a ranking overhaul shipped without proof. The next sprint should stop broad feature scatter and close the unresolved structural/product debts.
