# External Critique Request: Sprints 616-619 External Critique

## Verified wins
- WhatsApp loop is claimed complete end-to-end: Rate → Share → Landing → Rate/Explore.
- Build size reduction is quantified: 109kb recovered via seed exclusion.
- Scope appears delivered across four distinct areas: time-on-page indicator, just-rated feed, WhatsApp landing, and build pruning.
- The packet gives concrete current-state metrics: 11,415 tests, 625.7kb build, 28 tracked files, 0 violations.

## Contradictions / drift
- You call 616-617 “core-loop” work, but 616 explicitly surfaces a scoring mechanic that may be gamed and 617 promotes any recent rating regardless of credibility. That is growth/engagement bias inside a supposed quality loop.
- Sprint 617’s feed logic conflicts with ranking integrity: if low-quality ratings can trigger feed inclusion, the system advertises activity without validating signal quality.
- Sprint 618 claims the WhatsApp viral loop is “complete end-to-end,” but your own question admits there is no attribution chain connecting share → landing → rate. Operationally, the loop is not complete; only the user path is.
- Sprint 618 CTA hierarchy appears misaligned with user state. Calling “Rate This Restaurant” primary on a cold landing optimizes for your desired action, not likely first-time-user behavior.
- Sprint 619 adds a broad build-time replacement for `process.env.NODE_ENV`, while the request itself raises correctness concerns. That suggests the optimization shipped before edge-case validation was settled.
- “Major milestone” framing leans on build savings and viral-loop completion, but the packet’s biggest unresolved questions are around trust, attribution, and conversion. The milestone claim is ahead of the evidence.

## Unclosed action items
- Decide whether making the 30-second plausibility boost visible is acceptable, and define anti-gaming guardrails if it remains visible.
- Decide whether the just-rated feed should require a minimum rating-quality/credibility threshold instead of any rating in the last 24 hours.
- Re-evaluate CTA hierarchy on WhatsApp landing, especially for new users vs. returning users.
- Validate whether global build-time replacement of `process.env.NODE_ENV` is correct for all run contexts, including local debugging of production builds.
- Implement attribution linking for WhatsApp share → landing → downstream action; current analytics are disconnected.
- Previous batches 611-614, 606-609, 601-604, and 596-599 are still pending watcher response. That is process debt and review backlog, not closed history.

## Core-loop focus score
**6/10**
- Two of four sprints are labeled core-loop, but one exposes a reward mechanic that may invite low-quality behavior rather than better ratings.
- The just-rated feed strengthens recency visibility, but without quality gating it can amplify noise into the loop.
- The WhatsApp work is adjacent to acquisition, not core-loop quality, so it diluted the cohort’s core-loop concentration.
- Build pruning is useful but purely infrastructural; it does not directly improve the user value loop.
- There is some legitimate loop work here: slowing users down before rating and surfacing newly rated businesses can increase activity.
- But too much of the packet is still unresolved at the product-trust layer for this to count as tightly focused core-loop improvement.

## Top 3 priorities for next sprint
1. **Close the attribution gap in the WhatsApp loop**
   - Add a share identifier or equivalent chain across share tap, landing, and downstream conversion.
   - Until this exists, do not describe the loop as complete in measurement terms.

2. **Add quality gates where recency currently wins by default**
   - Set and test a minimum credibility threshold for just-rated feed inclusion.
   - Reassess whether the visible 30-second bonus should remain explicit, be softened, or be hidden behind less gameable UX.

3. **Fix decision hygiene before more surface-area launches**
   - Resolve the `NODE_ENV` correctness question with explicit expected runtime/build semantics.
   - Clear the watcher/review backlog on prior sprint batches so unresolved issues do not accumulate across cohorts.

**Verdict:** This cohort shipped visible surface area, but the packet overstates completion. The biggest problem is not lack of output; it is shipping mechanisms before settling trust and measurement. You exposed a potentially gameable reward, built a recency feed that can be triggered by weak input, and declared a viral loop complete without attribution. The next sprint should stop adding features and close the integrity gaps.
