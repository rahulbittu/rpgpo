# Critique Request: Sprints 506–509

**Date:** 2026-03-10
**Requesting Team:** TopRanker Engineering
**Scope:** Admin dashboard analytics, client-side notification tracking, push A/B testing, claim V2 evidence UI

## What We Built

### Sprint 506: Notification Insights Integration
- Wired NotificationInsightsCard into admin dashboard with React Query
- Conditional render when data available, 60s stale time
- Completes the admin visibility layer of notification analytics pipeline

### Sprint 507: Client-Side Notification Analytics
- 3 new event types: notification_received, notification_dismissed, notification_open_reported
- 3 convenience methods on Analytics object
- Wired notificationOpenReported into _layout.tsx notification handler

### Sprint 508: Push Notification A/B Testing Framework
- New server/push-ab-testing.ts (175 LOC) bridging experiment-tracker with push system
- DJB2 hash bucketing for deterministic variant assignment
- Outcome tracking: notification opens recorded as experiment outcomes
- 4 admin endpoints for managing push experiments with Wilson CI dashboards

### Sprint 509: Admin Claim V2 Dashboard
- ClaimEvidence types added to lib/api.ts
- ClaimEvidenceCard component: score bar, match indicators, document list, review notes
- Wired into admin claims tab — evidence renders inline below each pending claim

## Questions for Critique

1. **Push A/B bridge pattern** — Is composition (push-ab-testing sits between triggers and experiment-tracker) the right approach, or should we extend experiment-tracker directly to handle push-specific concerns?

2. **In-memory evidence stores** — Both claim evidence and push experiments use in-memory Maps. We plan PostgreSQL migration in Sprint 513. Is this acceptable for the current beta phase, or should we prioritize persistence earlier?

3. **Admin dashboard LOC** — admin/index.tsx is at 590/600 LOC threshold. Should we extract the claims tab into a separate component before it crosses?

4. **Notification analytics completeness** — notification_received and notification_dismissed events exist but aren't wired yet (need background notification listeners). Is the partial wiring (only open_reported) acceptable, or does it create a misleading analytics picture?

5. **Core loop focus** — Sprints 506-509 were heavily admin/analytics-focused. Are we investing too much in meta-systems vs the rating/ranking core loop?

## Metrics

- **9,383 tests** across 398 files
- **670.1kb** server build
- **60th consecutive A-grade** architectural audit
- **Zero watch files** in file health matrix
