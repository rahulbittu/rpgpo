# Sprints 391-394 External Critique

## Verified wins
- Sprint 391: A real extraction happened. `app/(tabs)/challenger.tsx` dropped from 544 LOC to 142 LOC, with `ChallengeCard.tsx` created at 320 LOC. That is a meaningful separation of concerns, even if the extracted component is still large.
- Sprint 391: Test fallout was at least acknowledged and handled: 4 test cascade files updated.
- Sprint 392: Search relevance was actually wired into the endpoint, not just discussed. Re-sorting occurs when a query is present, and the “Relevant” sort chip is conditionally shown.
- Sprint 393: Achievements were shipped using existing profile data, which avoids adding new data dependencies.
- Sprint 394: Claim verification form now captures more structured intent from users: business email, website URL, and preferred verification method.

## Contradictions / drift
- Sprint 391 calls the extraction a major cleanup, but the extracted `ChallengeCard.tsx` is still 320 LOC. This is improvement, not completion. You moved complexity; you did not meaningfully finish decomposition.
- Sprint 391 frames “largest single extraction in project history” as a quality signal. It is not. Size of extraction is vanity unless follow-on simplification happened. The packet provides no evidence that it did.
- Sprint 392 adds a “Relevant” chip only when query exists, but also asks whether the UI should auto-switch to Relevant on query entry. That means the sort model is still undecided after implementation. Product behavior was shipped before the interaction contract was settled.
- Sprint 392 uses server-side re-sorting after DB fetch of up to 20 results. That is acceptable as a stopgap, but it means “relevance” is only applied to a truncated candidate set, not the full search space. This can produce false confidence in ranking quality.
- Sprint 393 adds 13 milestones across 4 categories, but the packet gives no evidence of prioritization, visibility rules, or whether users can actually act on them. This looks like feature surface expansion without proof it strengthens the core loop.
- Sprint 394 adds a preferred verification method selector while explicitly admitting some options are not actually delivered yet. That is direct UX dishonesty, not just technical debt.
- Sprint 394 stores multiple fields in a pipe-separated `verificationMethod` string while simultaneously collecting richer structured inputs. That is schema drift: the product is becoming more structured while persistence stays intentionally opaque.

## Unclosed action items
- Define whether `ChallengeCard.tsx` is an endpoint of extraction or an intermediate step. If intermediate, split it further; if not, document a component-size standard and stop pretending extraction alone solved maintainability.
- Decide and document the search sort interaction model: default sort with query, whether auto-switch occurs, and whether the chip reflects actual active ranking.
- Validate the relevance approach against actual search outcomes. The packet contains weights but no evidence they were tuned or measured.
- Resolve whether relevance stays as post-fetch application logic or moves into SQL. Leaving this ambiguous means ranking quality and scalability remain half-done.
- For achievements, decide whether all 13 should be visible, capped, progressive, or segmented. Right now quantity shipped exceeds clarity of presentation strategy.
- Decide whether achievements remain hardcoded or become server-driven. As written, tunability is an open product/engineering debt.
- Stop offering verification methods that do not exist yet, or relabel them as “preferred contact channel” rather than actual method.
- Replace pipe-separated packing with dedicated columns or another structured format before more claim verification logic accretes around a brittle encoding.
- Decide whether business-email/domain matching is required, optional, or only a risk signal. It is currently an unimplemented anti-fraud idea with no policy.

## Core-loop focus score
**5/10**

- Sprint 392 is the clearest core-loop work: search relevance can directly improve discovery quality.
- Sprint 394 also touches a meaningful funnel step, but the implementation undercuts itself by promising unsupported verification paths.
- Sprint 391 is mostly maintainability work. Useful, but indirect to the user loop.
- Sprint 393 looks the most off-loop in this packet: more profile decoration without evidence it drives creation, discovery, conversion, or retention.
- Across the four sprints, there is too much “shipped but not resolved”: ranking behavior, component decomposition endpoint, achievements strategy, and verification truthfulness.
- The packet contains implementation details, but very little evidence of outcome validation against user behavior or business metrics.

## Top 3 priorities for next sprint
1. **Fix claim verification honesty and data model**
   - Remove or relabel unsupported verification options immediately.
   - Stop packing structured verification inputs into a pipe-separated text field.
   - Define the fraud/risk policy for domain matching before adding more form complexity.

2. **Finish the search relevance contract**
   - Decide the query→sort behavior and make UI/backend behavior consistent.
   - Validate the current weight formula with observed result quality instead of debating weights abstractly.
   - If relevance matters, ensure ranking is applied to the right candidate set, not just whatever 20 rows were fetched first.

3. **Stop partial cleanup and partial feature expansion**
   - Either continue decomposing `ChallengeCard.tsx` or set a clear standard for when extraction is “done.”
   - For achievements, cut scope or add a clear visibility/progression strategy; do not keep expanding hardcoded milestone surface area without a product purpose.

**Verdict:** This sprint block made real changes, but too much of it is half-resolved. Search relevance is the strongest core-loop move, yet even that shipped without a settled interaction model or evidence the ranking is correct. Claim verification is worse: the form now implies capabilities you do not provide and stores richer inputs in a brittle string hack. ChallengeCard extraction improved file shape but did not actually finish decomposition. Achievements look like the weakest use of sprint capacity unless you can prove they move behavior.
