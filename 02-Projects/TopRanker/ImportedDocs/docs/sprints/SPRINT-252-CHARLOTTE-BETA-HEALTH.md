# Sprint 252: Charlotte Beta Promotion + City Health Monitoring

**Date:** 2026-03-09
**Sprint Goal:** Promote Charlotte from planned to beta status and introduce city-level health monitoring for operational visibility.

---

## Mission Alignment

Charlotte graduating to beta brings our beta city count to 5, strengthening our Southeast expansion footprint. The city health monitor gives DevOps real-time visibility into per-city error rates, response times, and business/member/rating counts -- critical infrastructure as we scale beyond Texas.

---

## Team Discussion

**Marcus Chen (CTO):** Charlotte beta promotion is straightforward, but what matters is the cascading test updates. We have 5 test files referencing planned/beta counts -- getting those right is the difference between a green CI and a broken pipeline. The city health monitor is a foundation piece. Once we have Railway deployed, we can wire this into actual request metrics and set up PagerDuty alerts per city.

**Cole Anderson (DevOps):** The city health monitor follows the same in-memory pattern as our alerting module. The three-tier status model (healthy/degraded/critical) maps directly to our runbook escalation levels. Error rate thresholds at 2% and 5% match what we use in production alerting. The admin endpoints give us dashboard integration without needing a separate monitoring stack.

**Sarah Nakamura (Lead Engineer):** The route ordering in routes-admin-health.ts is important -- /summary must register before /:city or Express will match "summary" as a city parameter. I verified the pattern matches how we handle similar conflicts in notification routes. 34 tests total gives us good coverage across static, runtime, and integration layers.

**Nadia Kaur (Cybersecurity):** All three admin health endpoints require authentication via requireAuth middleware. In a future sprint we should add admin-email checks like the other admin routes, but for now the auth gate is sufficient. The health data is in-memory only, so there is no PII exposure risk -- metrics are aggregate city-level counts.

**Amir Patel (Architecture):** The CityHealthMetrics interface is clean. The Omit<> pattern on updateCityHealth keeps the caller from having to compute status or timestamps -- those are derived server-side. The Map-based store is fine for our current scale. If we hit 50+ cities, we should consider a time-series store, but that is a Sprint 270+ concern.

---

## Changes

### 1. Charlotte Beta Promotion
- **File:** `shared/city-config.ts`
- Changed Charlotte status from `"planned"` to `"beta"`
- Added `launchDate: "2026-03-09"`
- Beta cities: 5 (OKC, NOLA, Memphis, Nashville, Charlotte)
- Planned cities: 1 (Raleigh)

### 2. City Health Monitor
- **File:** `server/city-health-monitor.ts` (new)
- `updateCityHealth(city, metrics)` — stores metrics with derived status
- `getCityHealth(city)` — single city lookup
- `getAllCityHealth()` — all tracked cities
- `getHealthySummary()` — aggregate counts by status
- `clearHealthData()` — reset for testing
- Status thresholds: errorRate > 5% = critical, > 2% = degraded, else healthy
- Uses tagged logger: `CityHealth`

### 3. Admin Health Routes
- **File:** `server/routes-admin-health.ts` (new)
- `GET /api/admin/city-health` — all city health data
- `GET /api/admin/city-health/summary` — aggregate summary (registered before /:city)
- `GET /api/admin/city-health/:city` — single city health data
- All endpoints require authentication

### 4. Route Wiring
- **File:** `server/routes.ts`
- Added import and registration of `registerAdminHealthRoutes`

### 5. Cascading Test Updates
- `tests/sprint218-city-expansion-alerting.test.ts` — beta=5, planned=1, Charlotte not in planned
- `tests/sprint234-memphis-nashville-expansion.test.ts` — planned=1, beta=5
- `tests/sprint237-memphis-beta-seed-validation.test.ts` — betaCities=5, planned=1, Charlotte in beta
- `tests/sprint241-nashville-notifications.test.ts` — beta=5, planned=1
- `tests/sprint248-charlotte-raleigh-expansion.test.ts` — Charlotte status "beta"

### 6. New Tests
- **File:** `tests/sprint252-charlotte-beta-city-health.test.ts`
- 34 tests across 5 describe blocks
- Charlotte beta promotion (6), health monitor static (8), health monitor runtime (10), admin routes static (6), integration (4)

---

## PRD Gap Status
- City health monitoring was not in original PRD but is operational infrastructure needed for multi-city scaling
- Charlotte beta promotion advances the NC expansion timeline ahead of schedule
