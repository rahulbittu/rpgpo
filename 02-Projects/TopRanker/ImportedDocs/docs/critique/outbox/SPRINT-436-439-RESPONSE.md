# Sprints 436–439 External Critique

## Verified wins
- Four user-facing features were shipped in the stated scope: multi-signal search relevance, unified activity timeline, photo upload with moderation, and dimension tooltips.
- The work is tied to concrete files/components, not vague claims:
  - `server/search-ranking-v2.ts`
  - `components/profile/ActivityTimeline.tsx`
  - `components/business/PhotoUploadSheet.tsx`
  - `components/rate/VisitTypeStep.tsx`
  - `server/routes-businesses.ts`
- The request identifies specific implementation details rather than hand-waving:
  - search weights are explicitly defined
  - fuzzy matching threshold is explicitly defined
  - bookmark ordering uses `savedAt`
  - moderation queue uses in-memory `Map`
- Test/build status is reported with exact numbers: 334 test files, 7,985 tests, 608.6kb server build, SubComponents OK.

## Contradictions / drift
- “All four directly strengthen the discovery → rate → consequence core loop” is overstated. Activity timeline and photo upload are consequence/community features; they are not direct core-loop improvements in the same way search and rating UX are.
- The search design appears internally misaligned with the stated concern: if text match is 50%, then yes, exact-name dominance is structurally likely. Asking whether that might happen suggests the weighting was shipped without resolved product intent.
- Fuzzy matching at 4+ characters conflicts with common short restaurant-intent queries explicitly named in the packet (`bbq`, `pub`, `dim`). That is drift against real query behavior.
- Photo upload was shipped while the moderation queue is known to be non-durable. That is feature-first drift over operational correctness.
- Tooltip copy is described as strengthening the rating flow, but the examples are explicitly cuisine-specific. That fits “Indian Dallas First,” but it also narrows reuse; the packet frames this as a general UX improvement while the implementation is phase-specific.

## Unclosed action items
- Decide whether search ranking should reduce text-match dominance and increase rating-volume/quality influence.
- Revisit fuzzy matching cutoff for 3-character tokens with constrained edit distance.
- Decide whether bookmarks should have lower visual prominence than ratings/achievements in the activity timeline.
- Resolve photo moderation persistence; current in-memory queue is an acknowledged loss-on-restart risk and is not actually closed.
- Decide whether tooltip examples should remain Indian-specific or become conditional/generic by restaurant context.
- Sprint 441 DB migration is named, but until that lands, photo upload moderation is only partially implemented.

## Core-loop focus score
**6/10**

- Search relevance is a direct discovery-loop improvement.
- Dimension tooltips are a direct rating-flow improvement.
- Activity timeline is adjacent to the core loop, but mostly post-action engagement, not core-loop throughput.
- Photo upload is even further from the core loop unless photos materially improve discovery or trust; that evidence is not provided.
- Shipping a non-persistent moderation queue weakens the quality of the user-facing photo feature.
- A 4-sprint, 11-point packet spent meaningful attention on secondary engagement while open ranking and durability questions remain.

## Top 3 priorities for next sprint
1. **Fix photo moderation persistence before expanding photo usage**
   - Replace the in-memory moderation queue with durable storage.
   - If that is not immediate, restrict or disable photo upload rather than pretending the workflow is production-safe.

2. **Tighten search ranking around actual restaurant query behavior**
   - Rebalance weights so exact text match does not swamp quality signals.
   - Test 3-character fuzzy matching with strict edit distance for high-frequency short queries.

3. **Reduce signal mixing in the activity timeline**
   - De-emphasize bookmarks relative to ratings/achievements, or separate them visually.
   - Do not present all actions as equally meaningful if they are not.

**Verdict:** This packet shows real shipping output, but the narrative overclaims core-loop impact and underplays unresolved product/operational flaws. Search shipped with obvious weighting and fuzzy-match doubts still open, and photo upload shipped with a moderation queue that loses data on restart. The main problem is not lack of work; it is shipping partially resolved behavior and then describing it as strategically aligned.
