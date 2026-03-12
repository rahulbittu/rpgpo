# External Critique — Sprints 201-204 External Critique

## Verified wins
- Analytics events now persist beyond process memory via flush-to-PostgreSQL. That closes a real durability gap.
- You avoided creating a duplicate analytics table by detecting the existing `analyticsEvents` table.
- DB backups are automated in GitHub Actions with daily cron and 30-day retention.
- Client beta instrumentation expanded across join, signup, and referral flows with 4 explicit event types.
- Admin dashboard now exposes a beta funnel and active-user windows, which makes the analytics visible instead of purely collected.
- Data retention is no longer undefined: 90 days for analytics, 365 days for invites, plus a purge endpoint with a 30-day floor.
- Batch invite capacity increased from 25 to 100.
- User activity persistence to DB exists via upsert, even if it is not yet the live source of truth.
- Test volume increased materially across these sprints, and the packet claims all tests are passing.

## Contradictions / drift
- The biggest contradiction: Sprint 204 claims “User activity persistence to DB,” but the packet also says middleware still uses in-memory active user tracking. You built persistence without switching the system to use it. That is partial implementation, not completion.
- Sprint 203 adds active-users analytics in admin, but the known issue says the live tracking source is still in-memory. That makes the dashboard’s active-user story architecturally split and potentially inconsistent.
- Sprint 204 claims “Performance validation,” but there are still two performance budget definitions (`lib` vs `server`). A validator against conflicting budgets is not a reliable launch gate.
- Proposed Sprint 206 includes “Wire DB activity tracking in middleware” and “Consolidate performance budgets,” which confirms both Sprint 203/204 deliverables are incomplete in practice.
- You added retention and purge, but also admit “No data export before purge.” That means governance/deletion exists without a safe operator path for preserving data first.
- `routes-admin.ts` keeps absorbing concerns and is now 592 LOC. Adding dashboard analytics and purge logic there increased admin surface coupling instead of reducing it.

## Unclosed action items
- Switch middleware active-user tracking from in-memory to the DB-backed path.
- Remove or reconcile the dual active-user system so admin metrics have one authoritative source.
- Consolidate the two performance budget definitions into one source of truth.
- Decide whether the performance validation endpoint is a diagnostic tool or an actual release gate, then wire it into CI if it is meant to matter.
- Add export capability or an explicit operational safeguard before purge runs.
- Split `routes-admin.ts`; 592 LOC is already the warning sign, not a future problem.
- Document the analytics buffer failure modes/limitations if the architecture remains buffer → periodic flush.

## Core-loop focus score
**6/10**

- Good focus on instrumentation and admin visibility around the referral/signup funnel, which is close to the launch decision loop.
- Persistence and backup work addressed real operational risk, not vanity work.
- But effort drifted into partial systems: DB activity persistence was added without switching runtime usage.
- Performance validation is weakened by contradictory budget definitions, so launch-readiness claims are not yet trustworthy.
- Admin/dashboard work expanded, but some of the underlying metrics are still fed by an inconsistent architecture.
- The sprint output is useful, but too much of it remains “implemented but not authoritative.”

## Top 3 priorities for next sprint
1. **Finish the active-user architecture**
   - Replace in-memory middleware tracking with DB-backed tracking.
   - Make one source of truth for active-user metrics end-to-end.
   - Verify admin dashboard numbers come from that same path.

2. **Unify performance budgets and make validation enforceable**
   - Eliminate the `lib` vs `server` budget split.
   - Define one launch budget set.
   - If the endpoint is supposed to mean anything, wire it into CI or release checks.

3. **Close the analytics operations gap**
   - Add export-before-purge or equivalent operator protection.
   - Document buffer/flush limitations and data-loss scenarios.
   - Confirm the beta funnel covers the actual launch-decision questions, not just event collection.

**Verdict:** These sprints improved analytics durability and observability, but too much is only half-finished. The main problem is architectural inconsistency: DB-backed activity exists while production tracking still relies on memory, and performance “validation” exists while budgets disagree. That means the new dashboards and readiness checks are not yet fully trustworthy. The next sprint should stop adding surfaces and finish the source-of-truth and launch-gate work.
