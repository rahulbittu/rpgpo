# Sprints 506–509 External Critique

## Verified wins
- Admin notification insights were actually surfaced: `NotificationInsightsCard` is wired into the admin dashboard with React Query and conditional rendering.
- Client analytics surface area increased: 3 notification event types and 3 Analytics convenience methods were added.
- `notificationOpenReported` was wired into the app notification handler in `_layout.tsx`, so at least one notification outcome is being captured end-to-end.
- Push A/B testing is no longer just conceptual: there is a dedicated bridge module, deterministic bucketing, outcome tracking for opens, and 4 admin endpoints.
- Claim V2 evidence is visible in admin: types were added and `ClaimEvidenceCard` renders inline on pending claims.

## Contradictions / drift
- Sprint 506 claims to “complete the admin visibility layer of notification analytics pipeline,” but Sprint 507 explicitly shows the analytics pipeline is only partially wired. Visibility is not completion.
- The packet asks whether notification analytics completeness is acceptable, but the sprint writeup already presents “Client-Side Notification Analytics” as if implemented. It is not complete if `received` and `dismissed` are unwired.
- Outcome tracking for push experiments is based on notification opens, while the underlying notification analytics implementation is acknowledged as partial. That weakens confidence in experiment data quality.
- Heavy emphasis on admin dashboards, analytics, CI dashboards, and evidence UI does not match core-loop focus. The team asks this directly because the drift is obvious.
- “In-memory Maps now, PostgreSQL later” is being used for two separate domains at once: push experiments and claim evidence. That is not a one-off shortcut; it is a repeated persistence deferral pattern.
- `admin/index.tsx` sitting at 590/600 while adding more admin features indicates continued accretion without extraction. The fact that this is being asked now means the limit was treated as advisory, not operational.

## Unclosed action items
- Wire `notification_received` into actual background notification listeners.
- Wire `notification_dismissed` into actual background notification listeners.
- Resolve whether push experiment data and claim evidence can remain in-memory until Sprint 513; right now both are explicitly non-persistent.
- Extract admin claims tab or related admin sections before `admin/index.tsx` crosses the stated 600 LOC threshold.
- Validate whether push experiment outcome reporting is trustworthy given only `open_reported` is wired.
- Decide whether push A/B belongs as a bridge module or as an extension of `experiment-tracker`; the packet still presents this as unsettled architecture.

## Core-loop focus score
**3/10**

- 4 consecutive sprints are mostly admin, analytics, experimentation plumbing, and evidence display.
- Only one item appears adjacent to user-value in the ranking/claim loop: admin claim evidence UI, and even that is still admin-facing.
- Notification analytics and push A/B infra are meta-systems; they do not directly improve the rating/ranking experience described in the packet.
- The sprint packet itself raises core-loop-focus as a concern, which usually means drift is already visible internally.
- Build health metrics and audit grades are strong, but they do not offset product-loop misallocation.

## Top 3 priorities for next sprint
1. **Finish or stop claiming notification analytics.** Wire `received` and `dismissed` end-to-end, or explicitly downgrade reporting so dashboards/experiments are labeled partial.
2. **Stop stacking features on non-persistent state.** If push experiments or claim evidence matter operationally, move persistence up; if they do not, reduce scope and avoid expanding admin dependency on Maps.
3. **Re-center on the actual user loop.** Allocate the next sprint to rating/ranking/claim-resolution flow improvements, not more admin instrumentation.

**Verdict:** These sprints produced real admin and analytics surface area, but the packet overstates completion and underplays drift. The biggest issue is not code quality; it is shipping meta-systems with partial instrumentation, non-persistent backing stores, and growing admin complexity while the core product loop appears untouched for four sprints.
