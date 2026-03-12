# External Critique Request — Sprints 515-519

**Date:** 2026-03-10
**Submitted by:** Marcus Chen (CTO)
**Review scope:** Sprints 515-519 (Governance + Admin UX + Notification Operationalization)

## What We Shipped

### Sprint 515: Governance (SLT-515 + Audit #61)
- SLT backlog meeting with 516-520 roadmap
- Architectural audit #61: A grade (61st consecutive), identified admin/index.tsx at 603 LOC as watch file

### Sprint 516: Admin Claims Tab Extraction
- Extracted ClaimsTabContent component from admin/index.tsx (603→585 LOC)
- Resolved Audit #61 watch file in one sprint

### Sprint 517: Push A/B Weekly Digest Copy Test
- 4 pre-defined copy variants: control, urgency, curiosity, social
- Each targets a different psychological engagement lever
- Added {city} template variable to weekly digest
- Admin endpoint to seed/stop/monitor the experiment

### Sprint 518: Notification Frequency Settings
- Per-category frequency: realtime, daily digest, weekly digest
- Batch queue system with drain-on-schedule pattern
- FrequencyPicker UI component in settings (conditional on category toggle)
- Schema column + server endpoints + AsyncStorage persistence

### Sprint 519: Admin Notification Template Editor
- Server-side template store with CRUD operations
- Variable auto-detection from title/body content
- 11 supported template variables
- 6 admin endpoints + client API functions
- Route registration in main routes.ts

## Metrics

| Metric | Sprint 515 | Sprint 519 | Delta |
|--------|-----------|-----------|-------|
| Tests | 9,478 | 9,614 | +136 |
| Test Files | 403 | 408 | +5 |
| Server Build | 676.7kb | 685.4kb | +8.7kb |
| New Server Modules | — | +4 | — |
| Admin Endpoints | 40+ | 44+ | +9 |

## Questions for the Watcher

1. **Notification system scope:** Over 28 sprints (492-519), we've built: delivery tracking, open analytics, A/B testing, trigger integration, experiment UI, preference granularity, claim evidence persistence, frequency settings, copy experiments, and template editor. Is this notification subsystem proportionate to our stage (pre-revenue, ~500 target users)?

2. **In-memory stores multiplying:** push-ab-testing.ts, notification-templates.ts, notification-frequency.ts all use in-memory Maps. For a 500-user target, is this acceptable or are we deferring essential persistence work?

3. **api.ts at 766 LOC:** Growing 22 LOC/sprint from admin client functions. We planned extraction at Sprint 524. Should we extract sooner?

4. **Batch queue unused:** The frequency batch queue (Sprint 518) exists but triggers don't call shouldSendImmediately() yet. Is building infrastructure before wiring it a pattern we should be concerned about?

5. **Template system without UI:** The template CRUD backend is live but there's no admin UI component. Is backend-first the right order, or should we have built both together?
