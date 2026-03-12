# External Critique Request — Sprints 215-219 External Critique

## Verified wins
- Launch/ops scaffolding was added and is specific, not hand-wavy:
  - `scripts/launch-readiness-gate.ts` with 35+ checks
  - `scripts/launch-day-monitor.ts` polling 5 endpoints
  - `scripts/rollback-checklist.ts` with 8 safety checks
  - `docs/INCIDENT-RUNBOOK.md` with SEV tiers and response times
- Admin analytics/reporting moved forward:
  - `GET /api/admin/analytics/launch-metrics`
  - retention event types `retention_day1/3/7`
  - revenue tracking against the stated $247 break-even
- Some modularization happened:
  - `server/routes-admin.ts` reduced from 698 to 536 LOC
  - `server/routes-admin-analytics.ts` extracted with 10 endpoints
- Alert management primitives exist:
  - `server/alerting.ts`
  - `GET /api/admin/alerts`
  - `POST /api/admin/alerts/:id/acknowledge`
- Audit grades stayed at A across Audit #25 and #26 with no critical/high findings.
- Test count increased from 3,855 to 3,968.

## Contradictions / drift
- The largest contradiction is explicit: **“Unconditional GO” without production validation**. The packet says SLT-210 conditions were verified on staging/local and accepted at SLT-215 as sufficient, while also stating Railway deployment was not confirmed. That is not unconditional launch readiness.
- “Launch Day Monitoring” is overstated if **all scripts run locally** and production deployment was not validated. That is tooling existence, not proven operational coverage.
- Alerting work drifted into **alert CRUD/admin surface area before alert generation was wired**. Audit #26 still flags alerting not wired. You built endpoints and acknowledgment flows before proving automatic detection.
- City expansion is partially cosmetic: `shared/city-config.ts` has 7 cities while `lib/city-context.tsx` still hardcodes 5. Audit #26 confirms config is not consumed. That is duplicate config, not expansion.
- Metrics quality is weaker than the sprint framing suggests:
  - “MRR” is estimated from event counts, not Stripe/webhook truth.
  - “Launch metrics” implies business decision support, but one of the headline finance metrics is acknowledged as non-authoritative.
- Repeated deferrals show governance drift:
  - Replit legacy CORS has been deferred for 3 audits.
  - `getBudgetReport` is also 3 audits old.
  - These are no longer normal backlog items; they are unresolved decisions.

## Unclosed action items
- **Wire alerting to perf-monitor** — still open, and this is the key missing piece in the ops stack. Without it, alerting is mostly inert.
- **Wire `city-context.tsx` to `city-config.ts`** — still open; current state is a confirmed dual source of truth.
- **Remove Replit legacy CORS** — deferred for 3 audits. This should not remain “deferred”; either remove it or formally close as WON'T FIX with rationale.
- **PagerDuty integration** — open for Sprint 221; currently weakens any claim of out-of-hours operational readiness.
- **Test consolidation strategy** — “Monitor” is not an action. At 149 files, this is unowned drift unless there is a threshold and plan.
- **Email drip campaigns** — open but not core to the operational issues raised here.
- **`getBudgetReport` still not wired** — called out in risks, but missing from the action item table. That is an untracked stale item.

## Core-loop focus score
**4/10**

- The sprint cluster spent heavily on operational scaffolding and admin tooling, not on the user-facing core loop.
- The one clear core-loop adjacent item is city expansion, but it is incomplete because the new config is not consumed.
- Alerting/admin endpoint work improved internal ops surface area more than player acquisition, activation, or retention mechanics.
- Launch metrics are useful, but instrumentation is not the same as improving the loop.
- Revenue/MRR reporting is undermined by non-source-of-truth estimation.
- The route split is maintenance work; justified, but not core-loop progress.

## Top 3 priorities for next sprint
1. **Close the fake-alerting gap**
   - Wire `perf-monitor` into `server/alerting.ts`.
   - Prove automatic trigger, cooldown, acknowledgment, and incident path end-to-end in the deployed environment.
   - Do PagerDuty only after automatic alert generation is real.

2. **Eliminate config and deployment ambiguity**
   - Make `city-config.ts` the single source of truth and remove hardcoded city state from `city-context.tsx`.
   - Validate the actual production deployment path on Railway, not just local/staging scripts.
   - Until production execution is confirmed, stop describing launch readiness/monitoring as complete.

3. **Force closure on stale 3-audit items**
   - Replit legacy CORS: remove it or mark WON'T FIX with explicit risk acceptance.
   - `getBudgetReport`: wire it or close it.
   - Stop carrying unresolved items as indefinite “deferred”; that is backlog decay, not prioritization.

**Verdict:** These sprints added a lot of operational-looking infrastructure, but too much of it is unproven, unwired, or only local. The biggest issue is not lack of tooling; it is claiming readiness and coverage that the packet itself says were never validated in production. The team is drifting into admin surfaces and scaffolding while leaving core operational truth gaps open: automatic alerts are not real yet, city expansion is split-brained, finance metrics are estimated, and 3-audit-old decisions are still undecided.
