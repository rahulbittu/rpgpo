# External Critique Request — Sprints 515-519 External Critique

## Verified wins
- Audit #61 watch file was addressed quickly: `admin/index.tsx` dropped from 603 LOC to 585 LOC in Sprint 516.
- Notification frequency settings shipped across schema/server/client/UI layers, not just as a stub: schema column, endpoints, AsyncStorage persistence, and `FrequencyPicker` UI are listed.
- Weekly digest copy testing shipped with operational controls: predefined variants plus admin seed/stop/monitor endpoint.
- Template editor backend appears materially implemented, not just planned: CRUD store, variable auto-detection, 11 variables, 6 admin endpoints, client API functions, and route registration.
- Test count increased from 9,478 to 9,614 (+136) and test files from 403 to 408 (+5).

## Contradictions / drift
- The sprint scope says “Governance + Admin UX + Notification Operationalization,” but most shipped work is notification-system expansion. Governance is one backlog meeting and one audit result; Admin UX is partial; notification work dominates.
- “Resolved Audit #61 watch file” is technically true but weak in substance: `admin/index.tsx` only moved from 603 to 585 LOC. That is not meaningful decomposition; it is watch-file compliance management.
- Sprint 518 shipped a batch queue, but your own packet says triggers do not call `shouldSendImmediately()` yet. That means core behavior is not wired. This is infrastructure-first drift.
- Sprint 519 is labeled “Admin Notification Template Editor,” but the packet admits there is no admin UI component. What shipped is a backend/API layer, not an editor.
- Metrics say admin endpoints went from `40+` to `44+` while Sprint 517 alone adds an admin endpoint and Sprint 519 adds 6 endpoints. The stated delta `+9` conflicts with the displayed start/end values.
- Over 28 sprints, the subsystem has accumulated delivery tracking, analytics, A/B testing, trigger integration, experiment UI, preferences, evidence persistence, frequency settings, copy experiments, and templates. For a pre-revenue product targeting ~500 users, that is clear scope drift unless notification performance is the primary retention bottleneck. No evidence here shows that.

## Unclosed action items
- Wire triggers into frequency logic; currently the batch queue exists without the decision path using `shouldSendImmediately()`.
- Build the actual admin UI for notification templates; backend-only is incomplete relative to the sprint title.
- Address multiplying in-memory stores (`push-ab-testing.ts`, `notification-templates.ts`, `notification-frequency.ts`). This is not necessarily fatal at 500 users, but it is an explicitly open architectural debt item.
- Reassess `api.ts` at 766 LOC. You already know it is growing steadily from admin client additions; deferring extraction to Sprint 524 is an unclosed maintenance decision.
- Validate and clean up reporting discipline: the admin endpoint metric delta is internally inconsistent.

## Core-loop focus score
**3/10**

- Most work expanded notification/admin capabilities, not the user-facing learning/ranking loop.
- One sprint was governance/admin file reduction with minimal product impact.
- Sprint 518 shipped infrastructure that is not connected to runtime behavior yet.
- Sprint 519 shipped backend for an editor without the editor, which further weakens delivered user value.
- The packet provides no evidence that these notification investments moved activation, retention, or engagement for the core product.
- Test growth is good, but it mostly validates more subsystem surface area, not tighter focus.

## Top 3 priorities for next sprint
1. **Finish wiring what already exists before adding more notification features.** Specifically connect triggers to frequency enforcement and prove the batch queue changes real send behavior.
2. **Ship end-to-end admin workflows instead of backend-only slices.** If “template editor” matters, build the actual UI or stop counting backend plumbing as completed product.
3. **Stop notification-system expansion and redirect effort to the core loop unless there is hard evidence notifications are the primary constraint.** If notifications remain in scope, consolidate persistence strategy and extract `api.ts`/admin surface before adding more endpoints.

**Verdict:** These sprints were productive in output volume but weak in discipline. You are overbuilding a notification/admin subsystem for a pre-revenue, ~500-user target, while shipping partial slices and counting infrastructure as product progress. The biggest issue is not code quality; it is scope drift plus incomplete wiring.
