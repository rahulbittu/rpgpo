# Sprint 232 — Email ID Mapping + Admin A/B Experiment UI

**Date:** 2026-03-09
**Story Points:** 5
**Status:** Complete
**Facilitator:** Sarah Nakamura

---

## Mission Alignment

Sprint 232 closes the email analytics gap. Email ID mapping connects Resend webhook events to internal tracking IDs. Admin experiment endpoints enable marketing to create, monitor, and complete A/B experiments from the dashboard.

---

## Team Discussion

**Sarah Nakamura (Lead Engineering):** Email ID mapping is the missing bridge. Resend sends email_id in webhooks, we store tracking IDs internally. The bidirectional map resolves both directions — given a Resend ID, get the tracking ID, and vice versa. FIFO eviction at 2,000 entries keeps memory bounded without needing external storage.

**Jasmine Taylor (Marketing):** Admin experiment endpoints mean I can create A/B tests from the dashboard, monitor variant assignments, and declare winners — all without touching code. Four clean REST endpoints cover the full lifecycle: list experiments, inspect a single one, create new experiments, and complete with a winner. This unblocks the Nashville email campaign work entirely.

**Marcus Chen (CTO):** Four new admin endpoints follow our REST pattern. GET list, GET single, POST create, POST complete. Clean, RESTful, behind auth+admin. The routes-admin-experiments module keeps experiment admin logic separate from the main routes file — same pattern we used for city engagement admin.

**Rachel Wei (CFO):** A/B test optimization drives engagement metrics. Better email subjects lead to more opens, more opens lead to more ratings, more ratings lead to more revenue. The experiment endpoints give marketing self-service capability, which reduces engineering overhead per campaign cycle.

**Nadia Kaur (Cybersecurity):** Admin endpoints are behind requireAuth + requireAdmin middleware. No public access to experiment data. The requireAdmin check verifies role === "admin" on the authenticated user object. Same pattern as all our other admin routes — no new attack surface.

**Amir Patel (Architecture):** email-id-mapping.ts is 62 lines. routes-admin-experiments.ts is 80 lines. Both under 100 LOC. The mapping module uses two plain Maps with FIFO eviction — no external dependencies. The admin routes import from email-ab-testing and email-tracking, composing existing modules rather than duplicating logic.

---

## Deliverables

### Email ID Mapping (`server/email-id-mapping.ts`)
- `registerEmailMapping(trackingId, resendId)` — stores bidirectional mapping with FIFO eviction at 2,000 entries
- `getTrackingIdFromResend(resendId)` — resolves internal tracking ID from Resend email_id
- `getResendIdFromTracking(trackingId)` — reverse lookup, Resend email_id from internal tracking ID
- `getMappingStats()` — returns current mapping count and max capacity
- `clearMappings()` — clears both maps (testing helper)
- Used by `routes-webhooks.ts` to resolve Resend webhook email_id to internal tracking ID

### Admin Experiment Routes (`server/routes-admin-experiments.ts`)
- GET `/api/admin/experiments` — list all active experiments with stats and email stats
- GET `/api/admin/experiments/:id` — single experiment with stats, 404 if not found
- POST `/api/admin/experiments` — create new experiment with name and variants
- POST `/api/admin/experiments/:id/complete` — complete experiment with winner variant
- All routes behind `requireAuth` + `requireAdmin` middleware
- Imports from `email-ab-testing` and `email-tracking` for experiment and stats data

### Integration Wiring
- `routes.ts` imports and registers `registerAdminExperimentRoutes`
- `routes-webhooks.ts` imports `getTrackingIdFromResend` for webhook event resolution

---

## Tests

- **25 new tests** in `tests/sprint232-email-id-mapping-admin-experiments.test.ts`
  - 7 email ID mapping static tests
  - 4 email ID mapping runtime tests
  - 8 admin experiment route static tests
  - 4 integration wiring tests
  - 2 runtime clearing/lookup edge cases
- **Full suite:** 4,289+ tests across 162 files
