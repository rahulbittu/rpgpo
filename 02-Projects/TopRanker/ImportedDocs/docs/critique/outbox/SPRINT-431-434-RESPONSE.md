# Critique Request: Sprints 431–434 External Critique

## Verified wins
- Sprint 431 closed the main dead-code risk from Sprint 428 by wiring vote animation components into `ChallengeCard`. That is a real integration step, not just standalone component accumulation.
- Sprint 434 reduced `components/leaderboard/SubComponents.tsx` from 609 LOC to 313 LOC by extracting `RankedCard` into a standalone module. That is a measurable decomposition win.
- `RatingExport.tsx` was isolated into its own component instead of adding another ~165 LOC directly into `Profile.tsx`. That contained blast radius even though `Profile.tsx` still grew slightly.
- The packet provides concrete artifact-level outputs for all four sprints rather than vague “improvements,” which makes the work auditable.

## Contradictions / drift
- The packet claims animation integration completeness as a win, but the open question admits `VoteCelebration` is only triggered on vote submission. That means the integration is partial, not complete.
- “All SubComponents at OK status” conflicts with the explicit re-export debt concern. If re-export indirection already needs a migration threshold discussion, status is not clean OK; it is at least conditional/watch.
- The summary mixes core product work with structural cleanup, but only one item clearly strengthens the main user loop. Photo metadata polish and re-export-based extraction are secondary work.
- `Profile.tsx` is presented as under control because it only moved 684→690 LOC, but that masks continued upward drift over 10 sprints. WATCH status is not evidence of control; it is evidence of unresolved growth.
- CSV export avoided backend work, but the packet itself lists missing completeness properties: full dataset access, memory scaling, and audit trail. That is acceptable as a shortcut, not as a settled long-term direction.

## Unclosed action items
- Define whether `VoteCelebration` should trigger on page load for recently-decided challengers. This was explicitly raised and remains unresolved.
- Set and enforce a re-export migration rule. Audit #45 proposes threshold 3, but no decision is recorded.
- Decide whether CSV export is intentionally a client-side MVP or whether a streamed server export is now on the roadmap. Current implementation leaves known limitations unaddressed.
- Decide whether `Profile.tsx` gets proactive extraction now or continues under WATCH. The trend is known; no action is committed.
- Validate whether `PhotoMetadataBar` complexity is justified by actual lightbox usage. The packet asks the question but provides no usage evidence.

## Core-loop focus score
**5/10**
- Vote animation integration is core-loop adjacent and likely the strongest user-facing loop improvement in the set.
- CSV export is peripheral utility, not core loop.
- Photo metadata bar is polish on a likely secondary interaction, with no usage evidence provided.
- RankedCard extraction is maintainability work, not user-loop work.
- Across 4 sprints / 10 points, too much capacity went to support/polish/structure versus directly improving ranking, voting, or challenge resolution.
- The packet shows delivery discipline, but not tight prioritization around the primary product loop.

## Top 3 priorities for next sprint
1. Resolve vote animation behavior fully: define and implement the `VoteCelebration` trigger policy for page load vs submit-only, and stop calling the integration “complete” until that is done.
2. Make an explicit architecture decision on CSV export: keep client-side as bounded MVP with documented limits, or schedule a server-streamed export path. Do not leave it in ambiguous “maybe later” state.
3. Stop re-export debt from quietly normalizing: if threshold 3 is the rule, adopt it now and create the migration plan before a third case lands.

**Verdict:** These sprints delivered real code, but the packet overstates completion and cleanliness. The biggest pattern is “implemented enough to ship, deferred the policy decision”: partial animation integration, CSV export with known structural limits, re-export debt with no enforced threshold, and `Profile.tsx` growth under passive WATCH. This is acceptable only if next sprint converts these open questions into decisions; otherwise it is drift disguised as incremental progress.
