# Sprints 426-429 External Critique

## Verified wins
- Sprint 426 achieved a real extraction: `MapView` moved to its own 284 LOC file and `search/SubComponents.tsx` dropped from 660 LOC to 396 LOC. That is concrete modularization.
- Sprint 427 shows measurable `as any` reduction: 78→57 total and 35→12 client. The stated thresholds are now met: 57 `<60`, 12 `<15`.
- Sprint 429 appears to have reduced wrapper bloat: `AchievementsSection` is now 22 LOC with gallery logic moved into `AchievementGallery.tsx` (265 LOC).
- Regression safety looks intact at the packet level: 325 test files / 7,720 tests passing, and 4 test files were explicitly redirected for the MapView move.
- Sprint 428 produced actual UI animation components rather than just a plan: `VoteAnimation.tsx` exists at 148 LOC with named subcomponents and stated use of `useNativeDriver: true` where possible.

## Contradictions / drift
- Sprint 428 is the clearest drift. The sprint is framed as “Challenger Vote Animations,” but the packet admits the components are “not yet wired into ChallengeCard.” That means no user-facing loop improvement shipped.
- “Zero functional changes” in Sprint 427 is fine for debt work, but it also means one full sprint in this packet did not improve the product loop at all.
- Sprint 426 preserves backward compatibility via re-export, but that also undercuts the extraction outcome if callers stay on `SubComponents`. The code moved; dependency direction may not have.
- The `as any` threshold change is weakly framed. You reduced casts, but also adjusted thresholds “accounting for comment mentions.” That reads like metric tuning to fit the result unless the counting method changed in a durable, documented way.
- Sprint 429 adds progress bars for unearned achievements, but the packet itself questions whether tier progress is misleading. Shipping a progress UI while uncertainty remains about what progress means is product-definition drift.
- Across 426-429, only 429 is clearly integrated into an end-user surface. 426 is internal structure, 427 is type cleanup, 428 is not wired, 429 is shipped UI. That is weak concentration on the core loop.

## Unclosed action items
- Sprint 428 integration is explicitly unclosed: vote animations are planned to be wired into `ChallengeCard` in Sprint 431.
- Sprint 426 import migration is unresolved: re-export exists for backward compatibility, but there is no stated plan to retire indirection and redirect imports to the real source.
- Sprint 427 type alias strategy is unresolved: `IoniconsName` duplication across files has not been decided as local vs shared.
- Sprint 429 progress semantics are unresolved: ordinal tier progress may be misleading, and the correct model is still an open question.
- Sprint 429 default gallery visibility is unresolved: “earned only” default vs showing all categories remains undecided.

## Core-loop focus score
**4/10**

- Only one sprint in the packet clearly shipped a user-visible feature in-product: the achievements gallery.
- One sprint is pure internal refactor (MapView extraction), one is pure type debt reduction (`as any`), and one is unintegrated UI parts (vote animations).
- The most directly core-loop-relevant work, vote animations, did not reach the actual interaction surface (`ChallengeCard`), so it delivered no loop impact yet.
- Test stability and audit grades are good hygiene, but they do not compensate for limited shipped loop movement.
- The packet shows solid maintenance discipline, but weak end-to-end delivery on search/voting/profile behavior that users actually experience.

## Top 3 priorities for next sprint
1. **Finish the vote-animation integration into `ChallengeCard`.** Until this is wired to the live vote action, Sprint 428 is mostly dead inventory.
2. **Close the MapView extraction by migrating imports off the `SubComponents` re-export and setting a removal plan.** Otherwise the architecture stays half-migrated.
3. **Resolve achievement progress semantics before expanding the gallery further.** If ordinal tier progress is misleading, fix the model now rather than building more UI on top of a questionable metric.

**Verdict:** This packet shows competent cleanup and some modularization, but too much of it is indirect or unfinished. The biggest miss is Sprint 428: you spent a sprint on vote animations and shipped no actual voting improvement. Sprint 426 is only half-done if the re-export remains indefinitely, and Sprint 429 may be exposing progress math you do not fully trust. Net: disciplined maintenance, weak core-loop delivery, and too many open decisions left trailing behind shipped code.
