# SPRINT-280-284 External Critique

## Verified wins
- Sprint 281 shows a measurable cleanup: production `as any` casts reduced from 70 to 57. That is a verified net reduction.
- Sprint 282 delivered a concrete taxonomy expansion: Best In categories went from 15 to 48 across 11 cuisines.
- Sprint 282 also added explicit access points for the new model: `getCategoriesByCuisine`, `getAvailableCuisines`, and `CUISINE_DISPLAY`.
- Sprints 283-284 shipped the same cuisine-picker pattern into both Rankings and Search, which is a real UI consistency win.
- Sprint 284 added a clear containment rule for Search: `'All'` mode limited to top 15 items.

## Contradictions / drift
- The sprint packet mixes governance, type-safety cleanup, taxonomy expansion, and two UI picker rollouts across five sprints. That is not tight core-loop execution; it is parallel workstreams.
- Sprint 281 claims “19 casts eliminated,” but 70 → 57 is a reduction of 13, not 19. Either the baseline, scope, or net number is wrong.
- The cleanup sprint emphasizes `as any` reduction, but the open question still says 34 server-side casts remain. That suggests the work hit easier frontend/local cases while leaving structural typing debt untouched.
- Category expansion from 15 to 48 was immediately followed by two picker implementations, but the packet itself raises scalability concerns about keeping this as a static array. That means the team shipped UI on top of a data model they already suspect will not hold.
- Search file size is now called out at 917 LOC after another feature addition. That is drift against maintainability, not just a “question for review.”
- The anti-requirement violation is now 31 sprints old. Continuing to carry it while asking when to act is governance theater, not engineering control.

## Unclosed action items
- Resolve the cast-reduction accounting discrepancy: 70 → 57 does not support “19 eliminated.”
- Decide ownership and timeline for the remaining 34 server-side `as any` casts, especially `req.user` augmentation vs Stripe typing.
- Break up `app/(tabs)/search.tsx` at 917 LOC. This is already overdue.
- Decide whether Best In taxonomy remains static code or moves toward a managed data model before adding more cities/cuisines.
- Define a rule for cross-cultural dish classification beyond ad hoc slug divergence.
- Close or forcibly remove the 31-sprint anti-requirement violation instead of rolling it forward again.

## Core-loop focus score
**4/10**
- Shipping cuisine selection on Rankings and Search is adjacent to discovery/ranking UX, so there is some core-loop relevance.
- The taxonomy expansion likely supports the same loop, but it also increases content/model complexity before the scalability question is settled.
- Governance sprint work and audit activity dilute product focus.
- Type cleanup is worthwhile, but it is infrastructure work mixed into a feature run rather than a focused quality sprint.
- The 917 LOC Search screen and unresolved anti-requirement issue show weak operational discipline around the core path.

## Top 3 priorities for next sprint
1. **Decompose Search now.** Extract the Best In section and any cuisine-picker/state logic out of `app/(tabs)/search.tsx`; 917 LOC is already beyond reasonable tolerance.
2. **Finish the structural typing debt, not cosmetic cast removal.** Prioritize `req.user` Express augmentation and Stripe imports so the remaining server-side `as any` casts drop for durable reasons.
3. **Stabilize the Best In data model before further expansion.** Set a clear rule for static-code vs managed-data taxonomy and define a repeatable classification policy for cross-cultural dishes.

**Verdict:** There are real shipped outputs here, but the sprint set shows drift and weak closure. The biggest red flags are the inconsistent cast metrics, shipping UI on top of a taxonomy model you already doubt, letting Search bloat to 917 LOC, and carrying a known anti-requirement violation for 31 sprints. The team is delivering features, but not cleaning up the decision debt those features are creating.
