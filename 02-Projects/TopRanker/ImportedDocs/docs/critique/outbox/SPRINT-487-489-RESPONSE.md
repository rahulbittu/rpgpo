# Sprints 487–489 External Critique

## Verified wins
- Dashboard analytics pipeline appears fully closed in scope: computation (478) → API (486) → UI (487).
- Dashboard UI integration is concrete, not vague: `SparklineChart`, `VolumeBarChart`, and `VelocityIndicator` were wired into the owner dashboard.
- `DimensionScoreCard` was also wired into the public business profile after `ScoreBreakdown`, which is an actual shipped surface-area increase.
- Push wiring is specific and plausibly complete for this slice: `onRankingChange` and `onNewRatingForBusiness` now hit `POST /api/ratings`.
- Tier upgrade trigger was migrated out of `legacy push.ts` into `notification-triggers.ts`, which reduces at least one obvious legacy split-brain.
- Search loading state improved from a generic skeleton to a layout-matching `SearchResultsSkeleton`; this is a real UX refinement, not just refactor noise.

## Contradictions / drift
- You call the analytics path “end-to-end,” but your own open question on `DashboardData` suggests the contract was expanded opportunistically and may now be carrying unrelated concerns. That is delivery, but also coupling drift.
- “All triggers use fire-and-forget pattern (`.catch(() => {})`)” directly conflicts with reliability. You added more trigger wiring while intentionally making failures invisible at the call site. That is operational drift, not just an implementation detail.
- Migrating tier upgrade into `notification-triggers.ts` reduced legacy usage, but the file is now `397/450 LOC` with 8 functions and is explicitly nearing a limit you are tracking. You moved debt rather than clearly paying it down.
- Search skeleton “matching search results layout” is only true for the current layout. Hardcoding 4 cards means the implementation is coupled to one presentation mode and will drift as soon as list density or view mode changes.
- You added a new scheduler one hour after the weekly digest without presenting any user-outcome reason for that timing. That looks like shipping mechanics, not product-loop thinking.

## Unclosed action items
- Stop swallowing trigger failures silently. At minimum, failed fire-and-forget executions need logging/telemetry; otherwise trigger coverage is unverifiable in production.
- Decide whether `DashboardData` is one interface or multiple view-model slices. The current question means the boundary is not settled.
- Resolve whether `SearchResultsSkeleton` should be configurable by view mode or derived from the actual search layout. Current hardcoding is a known future mismatch.
- Reassess city highlights scheduling relative to weekly digest cadence. The spacing is arbitrary in the packet and may stack notifications.
- Split or justify `notification-triggers.ts` before it crosses the informal ceiling you are already monitoring.

## Core-loop focus score
**6/10**

- Dashboard chart integration is core-loop adjacent because it improves understanding of ranking/performance, but it is not the ranking/review acquisition loop itself.
- Push trigger wiring is closer to core-loop impact, but the silent failure pattern undercuts trust in whether the loop actually executes.
- Search skeleton work is mostly polish. It improves perceived speed, but it does not materially deepen the ranking/review/results loop.
- This sprint mixed delivery, debt migration, and UX polish instead of pushing one critical flow hard.
- The clearest loop-relevant work here is the trigger wiring; the rest is supportive, not central.

## Top 3 priorities for next sprint
1. **Make trigger failures observable**
   - Replace `.catch(() => {})` with structured logging/telemetry and basic failure counts.
   - If internal trigger functions already `try/catch`, prove it and standardize the contract; otherwise this setup is blind.

2. **Stabilize boundaries before adding more dashboard/search fields**
   - Split `DashboardData` into smaller slices if the owner dashboard, analytics, and review-related data are evolving independently.
   - Do the same kind of boundary check for `notification-triggers.ts`; one more sprint of additions likely turns “still fine” into “avoidable mess.”

3. **Tie UX placeholders and notification timing to actual product behavior**
   - Make search skeletons view-aware or layout-derived so they do not immediately go stale.
   - Reevaluate Monday 10am/11am notification stacking with an explicit rule, not convenience timing.

**Verdict:** Real work shipped, but too much of it is fragile at the edges. The biggest issue is not missing features; it is that you are wiring more product behavior while keeping failures invisible, growing catch-all interfaces/files, and hardcoding presentation assumptions you already know will drift.
