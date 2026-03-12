# Sprints 441–444 External Critique

## Verified wins
- Photo moderation persistence landed in DB via `photo_submissions` table in `shared/schema.ts` and DB-backed pipeline in `server/photo-moderation.ts`.
- Search filters v2 shipped with dietary and distance filtering in `components/search/DiscoverFilters.tsx`.
- Profile refactor happened: rating history was extracted into `components/profile/RatingHistorySection.tsx`, and `profile.tsx` reportedly dropped from 699 LOC to 627 LOC.
- Review aggregation UI shipped in `components/business/ReviewSummaryCard.tsx`.
- The sprint packet names concrete artifacts for each roadmap item rather than vague completion claims.

## Contradictions / drift
- “No new technical debt” is not credible against the packet itself. You explicitly call out `getPhotoStats()` fetching all rows and counting in application code. That is debt now, not later.
- The roadmap is described as “completed,” but dietary tags are structurally incomplete: `dietaryTags` exists and all restaurants currently have `[]`. That is schema completion without data usefulness.
- Search filters v2 includes dietary filtering, but with all tags empty the dietary filter is effectively non-functional or near-non-functional at launch.
- “Both Audit #46 findings resolved” is asserted with no evidence in the packet. There is nothing here tying deliverables to those findings.
- The review summary card shipped, but the team is still undecided on minimum sample size. That means a core display threshold was not settled before release.
- The profile extraction result is modest relative to remaining scope: 72 LOC removed from a 699 LOC file while several large sections remain. This is partial cleanup, not a strong refactor milestone.

## Unclosed action items
- Replace `getPhotoStats()` full-row fetch/counting with SQL aggregation or explicitly set and track a threshold-based trigger. Right now the issue is known and unresolved.
- Populate `dietaryTags`; the schema alone does not complete the feature. Manual admin tagging is deferred to Sprint 446.
- Decide whether cuisine-based auto-tagging will exist and define error tolerance/override rules before mixing inferred and manual tags.
- Settle distance semantics in product terms: straight-line approximation vs route distance. Current implementation and user expectation can diverge.
- Set a minimum sample size for `ReviewSummaryCard`; 2 ratings is a product decision still under question, not a closed item.
- Define the next extraction target from `profile.tsx` before the file regrows and the current refactor benefit is lost.

## Core-loop focus score
**6/10**
- Search and review surfaces are core-loop adjacent, but dietary filtering is undermined by empty data.
- Distance filtering affects discovery, so that is real core-loop work.
- Photo moderation persistence is operational infrastructure, necessary but not directly core-loop improving.
- Profile extraction is maintenance/refactoring, not user-loop advancement.
- Review summary cards help conversion/decision-making, but the weak sample-size definition reduces trust.
- Across four sprints, too much of the output is “shipped but not fully usable/settled.”

## Top 3 priorities for next sprint
1. Make dietary filtering real: ship a tagging path with actual populated `dietaryTags`, admin workflow, and clear precedence between manual and inferred tags.
2. Close known correctness/performance gaps before volume grows: fix `getPhotoStats()` with SQL aggregation and define a firm policy for review-summary minimum sample size.
3. Clarify discovery semantics: explicitly label or document distance as straight-line if keeping haversine for Phase 1, and avoid implying driving distance.

**Verdict:** The packet overstates completion. You shipped several surfaces, but at least two are only partially real: dietary filtering has no usable data, and review summaries lack a settled trust threshold. Calling this “no new technical debt” is false while knowingly shipping app-side counting over all moderation rows. The main pattern here is feature-shell completion without fully closing data, semantics, or scaling decisions.
