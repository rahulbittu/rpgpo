# Sprint 508: Push Notification A/B Testing Framework

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Build a framework to A/B test push notification content (title/body variants). Bridges the existing experiment infrastructure (hash bucketing, Wilson CI dashboards) with the push notification system. Enables data-driven decisions about notification copy, framing, and engagement.

## Team Discussion

**Marcus Chen (CTO):** "We've had experiment infrastructure since Sprint 142 and push notifications since Sprint 251, but they've been separate systems. This sprint connects them — now we can run controlled experiments on notification content and measure open rates per variant with statistical rigor."

**Rachel Wei (CFO):** "The business case is clear: notification open rates directly impact re-engagement. If we can improve open rates by 5% through better copy, that's measurable retention lift. And we get Wilson confidence intervals to know when results are real, not noise."

**Amir Patel (Architect):** "Clean bridge pattern: push-ab-testing.ts sits between triggers and the push sender. It doesn't replace either — triggers call getNotificationVariant() to get A/B content, and opens flow through recordPushExperimentOpen() back to experiment-tracker. Both systems stay independent."

**Sarah Nakamura (Lead Eng):** "The DJB2 hash bucketing ensures deterministic assignment — same member always sees the same variant. No randomness means reproducible results and no flicker between variants."

**Jasmine Taylor (Marketing):** "First experiment I want to run: weekly digest copy. 'Your weekly rankings update' vs 'Rankings changed — see who moved up'. Hypothesis: action-oriented copy increases opens by 10%+."

**Nadia Kaur (Security):** "Reviewed the hash bucketing — DJB2 with memberId:experimentId concatenation provides uniform distribution. No PII leakage since we only log the first 8 chars of member IDs."

## Changes

### New: `server/push-ab-testing.ts` (175 LOC)
- PushNotificationVariant type: name, title, body
- PushNotificationExperiment type: id, description, category, variants, active status
- DJB2 hash bucketing for deterministic variant assignment
- createPushExperiment() — register new notification experiment
- getNotificationVariant() — assign member to variant + record exposure
- recordPushExperimentOpen() — track opens as experiment outcomes
- deactivatePushExperiment() — stop assigning new variants
- listPushExperiments(), getPushExperiment(), getPushExperimentCount()

### Modified: `server/routes-notifications.ts` (82→89 LOC)
- Added import: recordPushExperimentOpen from push-ab-testing
- Wired: on non-duplicate notification open, calls recordPushExperimentOpen(memberId, category)

### Modified: `server/routes-admin-experiments.ts` (72→103 LOC)
- Added 4 admin endpoints for push experiments:
  - GET /api/admin/push-experiments — list all with Wilson CI dashboards
  - GET /api/admin/push-experiments/:id — single experiment with dashboard
  - POST /api/admin/push-experiments — create new experiment
  - POST /api/admin/push-experiments/:id/deactivate — stop experiment

### New: `__tests__/sprint508-push-ab-testing.test.ts` (22 tests)

## Test Coverage
- 22 new tests, all passing
- Full suite: 9,361 tests across 397 files, all passing in ~5.1s
- Server build: 670.1kb
