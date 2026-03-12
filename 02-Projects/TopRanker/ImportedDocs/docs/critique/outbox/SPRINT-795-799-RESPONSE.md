# Sprints 795-799 External Critique

## Verified wins
- Sprint 796 closed a concrete audit item: `MAX_TOKENS_PER_MEMBER = 10` with eviction addresses the stated unbounded in-memory growth finding (Audit M1).
- Sprint 797 reduced config drift: moving `FROM_ADDRESS` to `config.emailFrom` is a real cleanup and aligns env-dependent server values behind `config.ts`.
- Sprint 798 added actual readiness signal depth: `/_ready` now includes DB round-trip latency instead of a shallow process-only check.
- Sprint 799 added operational counters and exposed them through `/api/health`, which is a real observability increase.
- The packet consistently reports one remaining open finding only: dev-only LOW in `seed.ts` Unsplash URLs.

## Contradictions / drift
- The packet claims “hardening closure + observability,” but Sprint 795 is mostly process/governance (`SLT-795 meeting, Arch Audit #795, critique request`), not product hardening.
- “Transition to reactive/user-feedback-driven mode” conflicts with the fact that the review questions still surface unresolved design choices on token eviction, public health exposure, logger semantics, timing precision, and route extraction. That is not closure; it is deferred decision-making.
- “All audit findings except one dev-only LOW are closed” is narrower than “obvious gaps before real users touch the app.” Public `/api/health` now exposing `environment`, push stats, and error metadata may be a fresh exposure question outside prior audit closure.
- Claiming 24 consecutive hardening/polish sprints culminating in closure is undercut by `routes.ts at 412/420 LOC` still being near a threshold with a known extraction candidate left undone.
- Observability was added, but no evidence is provided for controls around who can see it, alert thresholds, retention semantics, or whether the counters are reset-on-restart. That is feature addition, not fully closed operational hardening.

## Unclosed action items
- Decide whether public `/api/health` should remain public with `environment`, push stats, and logger counters, or be reduced/admin-gated.
- Decide and document token eviction policy: oldest-token eviction vs LRU by `lastUsed`. Current implementation solves boundedness but may not match actual device activity.
- Resolve logger counter semantics: if suppressed logs still increment counters, define that explicitly as “event counters” rather than “emitted log counters,” or change behavior.
- Decide whether `Date.now()` is acceptable for readiness DB latency or switch to `performance.now()`. Minor, but still open because it is explicitly being asked.
- Extract health/readiness routes if the 420 LOC threshold is real. Sitting at 412/420 after adding more health logic is predictable drift, not closure.
- Validate “reactive mode” readiness with a pre-launch review focused on public diagnostics exposure and operational safety, not just prior security-score completion.

## Core-loop focus score
**6/10**

- Sprint 796 is directly useful hardening tied to a concrete risk; that is focused.
- Sprints 798-799 improve observability, which supports operating the product, but they do not improve the user core loop directly.
- Sprint 795 is governance overhead, not product movement.
- The packet emphasizes milestone/security narrative more than evidence of readiness for user-facing flow under TestFlight.
- Several “Questions for External Review” are unresolved architecture/operations decisions, which weakens claims of closure.
- The work is coherent around backend hardening/observability, but not tightly tied to the actual user-value loop.

## Top 3 priorities for next sprint
1. **Lock down `/api/health` exposure**
   - Remove or gate `environment`, push stats, and log counters unless there is a clear public need.
   - Keep a minimal public liveness response; move detailed diagnostics to admin/auth/internal access.

2. **Finish the push-token policy instead of just bounding it**
   - If active/stale device mix matters, switch from oldest eviction to LRU/last-used eviction and define update semantics.
   - If it does not matter, document why oldest eviction is acceptable and close the question.

3. **Close the “almost at threshold” and semantics debt**
   - Extract health/readiness routes from `routes.ts`.
   - Define logger counters precisely and align implementation/naming with that definition.
   - Treat these as closure tasks before declaring reactive mode, not as optional cleanup.

**Verdict:** This sprint set closed one real audit issue and added useful observability, but the packet overstates closure. You are calling the hardening phase done while still carrying unresolved decisions on public diagnostics exposure, token retention behavior, logger semantics, and route-structure debt. That is not clean transition-to-reactive posture; it is a milestone narrative with remaining operational ambiguity.
