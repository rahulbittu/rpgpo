# Sprints 371-374 External Critique

## Verified wins
- `ChallengerTip` extraction is a real cleanup win: component moved out of `app/(tabs)/challenger.tsx` into `components/challenger/ChallengerTip.tsx`.
- Search cards gained concrete UI additions in `components/search/SubComponents.tsx`: Google rating display, NEW badge, and claimed indicator.
- Breadcrumb navigation was added in `app/business/[id].tsx`.
- Admin dashboard got a quick links section in `app/admin/dashboard.tsx`.
- Test/build hygiene appears stable: 6,874 tests passing, server bundle unchanged at 599.3kb, Arch Audit #57 still Grade A.

## Contradictions / drift
- The biggest drift is acknowledged in the packet: `MappedBusiness` now includes `googleRating?: number` and `isClaimed?: boolean`, but “the server doesn't populate them yet.” That is classic zombie typing. UI capability was added ahead of data reality.
- Sprint 372 added search-card enhancements, but the packet only verifies defensive display logic, not actual data flow. If backend population is absent, the Google rating and claimed state are mostly speculative UI.
- Breadcrumb category navigation may be dead-on-arrival. The packet explicitly questions whether search even reads `{ category: business.category }`. Shipping navigation without verifying the destination contract is drift, not completion.
- The summary frames these four sprints as “client-side polish and extraction,” but two decisions are not polish issues; they are product semantics issues: showing a competitor/external rating next to TopRanker, and labeling low-rating businesses as NEW. Those need product validation, not just UI implementation.
- “NEW badge for 1-4 ratings” is weakly justified. The packet admits the rating count may already communicate the same thing. That suggests feature layering without clear user need.
- Admin quick links are static cards with no live counts. For an admin dashboard, that risks becoming decorative navigation rather than an operational surface.

## Unclosed action items
- Verify whether search actually consumes the breadcrumb `{ category: business.category }` param. If not, this is an unclosed broken flow.
- Either wire `googleRating` and `isClaimed` from the backend or remove/defer the type extensions. Leaving unused optional fields is unresolved tech drift.
- Resolve the product position on showing Google ratings beside TopRanker ratings. The packet raises a trust/confidence risk and provides no answer.
- Validate the NEW badge threshold and necessity. Current implementation is arbitrary until supported by user behavior or product intent.
- Decide whether admin quick links need live counts, especially for Moderation Queue. Right now the feature is incomplete as an admin workflow aid.

## Core-loop focus score
**4/10**

- Work shipped, but much of it is peripheral polish rather than strengthening the main rank/search/detail decision loop.
- `ChallengerTip` extraction is maintainability work, not core-loop improvement.
- Search card enhancements touch the loop, but backend non-support for new fields undercuts their actual user impact.
- Breadcrumb navigation could help discovery, but only if the destination filter works; currently that is uncertain.
- Admin quick links are outside the user core loop entirely.
- Stable tests/builds are good, but they do not offset weak closure on feature contracts.

## Top 3 priorities for next sprint
1. **Close the broken contracts.** Confirm and fix category-param handling in search, and either populate `googleRating`/`isClaimed` from the backend or remove the dead fields.
2. **Decide the rating story.** Make an explicit product decision on whether Google ratings should coexist with TopRanker scores. If kept, define the rationale and presentation so divergence does not silently erode trust.
3. **Cut or justify low-signal UI.** Reassess the NEW badge and static admin cards; keep only what changes user/admin behavior, not what merely decorates screens.

**Verdict:** These four sprints produced visible UI movement, but too much of it is half-closed. The extracted component is fine, but the meaningful changes have contract gaps: new typed fields without backend data, navigation without confirmed destination support, and product-facing badges/ratings without a settled rationale. This is polish-first delivery with unresolved semantics underneath.
