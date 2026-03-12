# Sprint 157 External Critique

## Verified wins
- **SSE query key mismatch fixed** in `lib/use-realtime.ts`, with stated impact on leaderboard, trending, challengers, and business detail refresh behavior.
- **Challengers invalidation on `rating_submitted` added**, which is a concrete missing refresh path now addressed.
- **User-facing consequence surfaced** via `lib/rating-impact.ts`, `app/rate/[id].tsx`, and `app/business/[id].tsx`: business detail now shows a rank-movement banner after rating submission.
- **Test coverage increased** with `tests/sprint157-realtime-consequence.test.ts` and packet claim of **2147 passing tests across 94 files**.

## Contradictions / drift
- The sprint frames the banner as a meaningful product addition, but the implementation is **ephemeral in-memory state with 60s TTL**. That is closer to a temporary UI patch than a durable consequence system.
- The summary says ranking updates were “silently broken since semantic keys refactor,” yet the retro calls this the **highest-value fix in 10 sprints**. That implies a core-loop regression sat undetected for too long. The win is real; the process failure is bigger.
- “Real-time ranking updates” are described broadly, but evidence only cites query invalidation wiring changes plus one new test file. There is **no evidence here of end-to-end verification** that all listed surfaces now update correctly under real SSE events.
- Morale and recovery language in the retro is noise. The packet’s actual content is mostly **bug repair on the ranking feedback loop**, not forward feature progress.

## Unclosed action items
- **No prevention mechanism** for another SSE/query-key drift is listed. Your own question about CI confirms this remains open.
- **No persistence decision** on rating impact state. Current in-memory TTL means the banner can disappear on navigation/app lifecycle, making the feature unreliable.
- **No validation plan** for whether business-detail-only feedback is enough. The question about leaderboard-level indication shows product scope is unresolved.
- If the mismatch existed since a prior refactor, there is **no stated audit of other semantic-key or invalidation paths** beyond the specific fix made this sprint.

## Core-loop focus score
**8/10**
- Fixing broken real-time ranking refresh is directly on the core loop.
- Challengers invalidation on rating submission is also core-loop work.
- The rank-movement banner improves consequence visibility after rating, which supports the loop.
- Score is not higher because much of the sprint is **recovering from a long-lived regression**, not expanding capability.
- The in-memory TTL implementation weakens the reliability of the consequence feedback.
- Lack of a guardrail against repeating the same class of break lowers confidence.

## Top 3 priorities for next sprint
1. **Add a hard guardrail for SSE/query-key alignment.** CI or test-level contract checks are warranted; relying on another code audit is not acceptable after a 10-sprint regression window.
2. **Decide and implement durable consequence-state behavior.** If the banner matters, persist it across navigation/app resume; otherwise admit it is cosmetic and stop treating it as meaningful loop feedback.
3. **Run an explicit audit of all real-time invalidation paths tied to ranking surfaces.** Do not assume this was a one-off mismatch if it survived since the semantic key refactor.

**Verdict:** This sprint fixed an important core-loop break, but it is mostly a late repair of a regression that should not have survived this long. The banner is useful but currently flimsy because its state model is temporary and unreliable. The biggest issue is not the bug itself; it is that there is still no systemic protection against the same drift happening again.
