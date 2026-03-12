# External Critique Request — Sprints 230-234 External Critique

## Verified wins
- Outreach history moved from in-memory to PostgreSQL in Sprint 231. This directly resolves a prior audit finding and is corroborated by Audit #29.
- Test count increased from 4,222 to 4,394 across the block: +172 tests, +5 files.
- City engagement metrics were added with concrete per-city outputs: signup count, rating count, active users.
- Email ID mapping closed an observability gap by correlating Resend `email_id` to internal tracking IDs.
- Auto-gate promotion criteria now exist and are configurable by city; this is a real step toward removing manual promotion decisions.
- Memphis and Nashville were added to config and seeded, showing the city launch path is being reused rather than improvised each time.

## Contradictions / drift
- You fixed one in-memory store in Sprint 231, then added/kept more in-memory state elsewhere: email tracking, A/B testing, and a new expansion pipeline store. That is not resolution; it is lateral movement of the same class of risk.
- Sprint 233 claims “auto-gate removes subjective promotion decisions,” but the packet also says no city has actually been auto-promoted yet. So the operational claim is ahead of validation.
- Sprint 234 frames Tennessee expansion as a validated repeatable launch pattern, while also admitting there is no Tennessee competitive analysis. Repetition is not validation.
- Admin experiment management was shipped with no access control, while the stated benefit is “marketing self-serve capability.” In practice, the packet says any authenticated user can hit admin endpoints. That is not self-serve marketing; that is missing authorization.
- Expansion lifecycle logic is split between `server/city-promotion-gate.ts` and `server/expansion-pipeline.ts`, while the request itself questions whether they should be unified. That suggests architecture drift was introduced before service boundaries were settled.
- Proposed Sprint 236 shifts to rate limit dashboards and abuse alerts even though the most obvious governance gap in this block is still admin RBAC and the most obvious persistence gap is still in-memory lifecycle/experiment state.

## Unclosed action items
- City seed scaffolding script — due Sprint 236, not done.
- Extract city count to shared constant — due Sprint 235, explicitly may carry forward; this is already slipping.
- Draft Nashville market entry messaging — due Sprint 236, not done.
- Monthly async SLT check-in format — due Sprint 236, not done.
- Rate limit dashboard design spec — due Sprint 236, not done, while the next sprint proposes building the dashboard.
- Expansion pipeline persistence schema — planned Sprint 238; until then, core lifecycle tracking remains in-memory.
- Tennessee competitive landscape analysis — planned Sprint 237; expansion is proceeding ahead of market diligence.
- Audit carry-forwards remain open: no DB backup cron, no CDN, recurring email module sprawl.

## Core-loop focus score
**6/10**

- The block does reinforce the city-growth loop: measure engagement, track outreach, seed new cities, define promotion criteria.
- Fixing outreach history persistence was directly aligned with operating the loop more reliably.
- But two sprints diverted into admin experimentation and UI before access control was in place.
- Core lifecycle capabilities are fragmented across separate modules and partly in-memory, which weakens operational reliability.
- Tennessee expansion happened before competitive analysis and before auto-gate was proven on a real city, so execution ran ahead of validation.
- The proposed next sprint drifts further into platform/admin work without first closing the security and persistence gaps introduced in this block.

## Top 3 priorities for next sprint
1. **Add RBAC to admin experiment endpoints and UI immediately.** Any authenticated-user access to admin controls is a basic control failure and should outrank dashboard work.
2. **Prove the city lifecycle end-to-end with integration tests and one real promotion path.** Do not treat auto-gate as done until a city moves through the full seeded/beta/active flow under test and, ideally, in production.
3. **Stop adding in-memory operational state for core workflows.** Either persist expansion pipeline/experiment state now or freeze further lifecycle/admin complexity until persistence is defined and implemented.

**Verdict:** This block produced real infrastructure gains, but it also shows a recurring pattern: resolve one audit-class weakness, then reintroduce the same weakness in a neighboring module. The biggest problem is not lack of output; it is claiming operational maturity too early—auto-promotion is “done” before use, expansion is “validated” before market analysis, and admin tooling ships before authorization. Next sprint should close control and persistence gaps, not add more dashboards.
