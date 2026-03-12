# Sprint 219 — Admin Route Split + Alert Endpoints

**Date:** 2026-03-09
**Story Points:** 8
**Status:** Complete

## Mission Alignment

Sprint 219 addresses the longest-standing architectural concern: routes-admin.ts exceeding the 700 LOC split threshold. Analytics routes (198 LOC) are extracted to routes-admin-analytics.ts, reducing the main file from 698 to 536 LOC. Alert management endpoints expose the Sprint 218 alerting module to the admin dashboard. This is the architectural cleanup sprint before SLT-220.

## Team Discussion

**Amir Patel (Architecture):** "routes-admin.ts hit 698 LOC — 2 lines from the split threshold we set at Audit #22. The analytics routes were the obvious extraction target: 10 endpoints, self-contained, no cross-dependencies with the rest of the admin module. The split drops the main file to 536 LOC, buying us ~30 sprints of headroom at current growth rate."

**Marcus Chen (CTO):** "Module decomposition is how you maintain velocity as the codebase grows. The extracted file imports its own dependencies, registers its own routes, and the main file calls `registerAdminAnalyticsRoutes(app)` — one line. Clean separation of concerns."

**Sarah Nakamura (Lead Eng):** "The hardest part of a file split is the test updates. Six test files referenced routes-admin.ts for analytics content. Each needed surgical edits — only the analytics-checking describe blocks get redirected to routes-admin-analytics.ts. Non-analytics checks stay pointing at routes-admin.ts. Every test passes."

**Nadia Kaur (Security):** "The alert endpoints — `GET /api/admin/alerts` and `POST /api/admin/alerts/:id/acknowledge` — follow the same security pattern as all admin routes: requireAuth + requireAdmin + rate limiting. The alerts endpoint returns recent alerts, stats, and rules. Acknowledgment is per-alert by ID."

**Rachel Wei (CFO):** "The alert dashboard gives us real-time visibility into production health. Combined with the launch-day monitor, the SLT can see both automated alerts and manual health checks. That's the operational maturity investors look for."

**David Okonkwo (VP Product):** "The admin dashboard can now show an alerts panel: recent alerts, severity counts, unacknowledged count. When alerting wires to PagerDuty in Phase 2, the same data feeds both the dashboard and the on-call system."

**Jordan Blake (Compliance):** "Alert acknowledgment creates an audit trail — who saw what, when. For compliance, this proves the team is actively monitoring production and responding to incidents within SLA."

**Leo Hernandez (Design):** "The admin alerts panel should use the same visual language as our severity levels: red for critical, amber for warning, blue for info. That's consistent with our brand system and matches the incident runbook."

## Deliverables

### Admin Route Split
- **Extracted:** `server/routes-admin-analytics.ts` (198 LOC)
  - 10 analytics endpoints: funnel, dashboard, hourly, daily, active-users, beta-funnel, purge, retention-policy, export, launch-metrics
- **Reduced:** `server/routes-admin.ts` from 698 → 536 LOC (-162 LOC, -23%)
- **Integration:** `registerAdminAnalyticsRoutes(app)` called from main admin routes
- **Test updates:** 6 test files updated to read from correct source file

### Alert Management Endpoints
- `GET /api/admin/alerts` — returns recent alerts, stats, rules (requires auth + admin)
- `POST /api/admin/alerts/:id/acknowledge` — acknowledge alert by ID (returns 404 if not found)

## Tests

- 25 new tests in `tests/sprint219-admin-split-alerts.test.ts`
- Full suite: **3,970+ tests across 149 files, all passing**
