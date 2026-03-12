# Critique Request: Sprints 520-524

**Date:** 2026-03-10
**Submitted by:** Marcus Chen (CTO)
**Scope:** Governance + Notification Wiring + Admin UX + Code Extraction

## Sprint Summary

| Sprint | Feature |
|--------|---------|
| 520 | Governance (SLT-520 + Audit #62 + Critique 515-519) |
| 521 | Wire frequency checks into notification triggers |
| 522 | Admin template management UI (TemplateManagerCard) |
| 523 | Experiment results dashboard (ExperimentResultsCard) |
| 524 | api.ts domain extraction to api-admin.ts |

## Current Metrics

- 9,715 tests across 413 files
- 687.4kb server build
- 63 consecutive A-range arch grades
- 11 cities (5 active TX + 6 beta)
- 40+ admin endpoints

## Questions for External Watcher

1. **Admin UI growth vs extraction cadence:** admin/index.tsx went 585→618→622 over 2 sprints (Sprint 522-523), now at 96% of threshold. We're scheduling extraction for Sprint 526. Is this reactive pattern (grow → watch → extract) sustainable, or should we proactively cap admin features until extraction happens first?

2. **api.ts extraction pattern (re-exports):** Sprint 524 extracted 141 LOC from api.ts to api-admin.ts but kept re-exports for backward compatibility. The re-exports add 20 LOC of surface area. Should we migrate consumers directly and remove re-exports, or is the compatibility layer worth keeping?

3. **Codebase health sprint block (526-529):** The SLT-525 roadmap dedicates 4 consecutive sprints to codebase health (admin extraction, search modularization, persistence audit, schema grouping) with zero feature work. Is this the right approach, or should health work be interleaved with features?

4. **search.tsx at 798 LOC:** This is the largest UI file and has complex state coupling (map, filters, results). The extraction is scheduled for Sprint 527 (5 story points). Is this complexity appropriate for a single sprint, or should it be split?

5. **In-memory store debt (3 modules):** push-ab-testing.ts, notification-templates.ts, and notification-frequency.ts queue all use in-memory Maps. For a 500-user pre-revenue product, is this pragmatic simplicity or a reliability risk that should be prioritized higher?
