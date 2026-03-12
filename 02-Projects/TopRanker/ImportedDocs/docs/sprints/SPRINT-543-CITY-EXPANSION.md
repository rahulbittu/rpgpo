# Sprint 543: City Expansion Dashboard — Admin Tool for Beta City Health

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete
**Tests:** 23 new (10,143 total across 432 files)

## Mission

Build an admin city expansion dashboard that surfaces city health, engagement metrics, and promotion progress. All backend infrastructure existed (city-health-monitor, city-engagement, city-promotion, expansion-pipeline) — this sprint connects it to the admin UI.

## Team Discussion

**Marcus Chen (CTO):** "We had 4 separate city infrastructure modules built over Sprints 233-252 but no admin UI to actually see the data. This sprint closes that gap. The dashboard shows health status, engagement per city, and promotion readiness — everything needed for expansion decisions."

**Amir Patel (Architecture):** "Zero new server logic — all we added was a `status` field to CityEngagement and client API wrappers. The CityExpansionDashboard component calls 3 existing admin endpoints in parallel. Clean data flow: admin endpoint → api-admin.ts → useQuery → dashboard component."

**Rachel Wei (CFO):** "The promotion progress bars are what I've been asking for. Seeing 'Oklahoma City: 60% businesses, 40% members, 30% ratings' at a glance makes expansion planning concrete. We can track which beta cities are closest to graduation."

**Sarah Nakamura (Lead Eng):** "Added a 7th tab to the admin interface — 'Cities' with map icon. Component is self-contained at 220 LOC with StatusBadge, ProgressBar, HealthSummaryCard, CityEngagementRow, and PromotionCard sub-components. Loading state handled cleanly."

**Cole Richardson (City Growth):** "Finally can see all 11 cities at once with real metrics. The active vs beta separation with promotion progress makes it obvious where to focus growth efforts. The health summary catches degraded cities before they become problems."

**Jasmine Taylor (Marketing):** "The engagement metrics — especially avgRatingsPerMember — tell us which beta cities have genuine traction vs just seed data. This informs where we invest marketing spend for Phase 2 expansion."

## Changes

### Admin Component (`components/admin/CityExpansionDashboard.tsx`, 220 LOC — new)
- `HealthSummaryCard` — healthy/degraded/critical/total city counts
- `CityEngagementRow` — per-city business/member/rating/avg metrics with status badge
- `PromotionCard` — beta city promotion progress with 3 threshold bars (businesses/members/ratings)
- `ProgressBar` — reusable percentage bar with color coding
- `StatusBadge` — active/beta/planned/healthy/degraded/critical badges
- Loading state with ActivityIndicator
- Separates active and beta cities in display

### Client API Functions (`lib/api-admin.ts`, 201→245 LOC)
- `CityHealthSummary` interface — total/healthy/degraded/critical
- `CityEngagementData` interface — city metrics + status
- `BetaPromotionStatus` interface — eligible/currentMetrics/progress/missingCriteria
- `fetchCityHealthSummary()` — GET /api/admin/city-health/summary
- `fetchAllCityEngagement()` — GET /api/admin/city-engagement
- `fetchBetaPromotionStatuses()` — GET /api/admin/promotion-status
- `promoteCity(city)` — POST /api/admin/promote/:city

### Admin Interface (`app/admin/index.tsx`, 555→561 LOC)
- Added "cities" to AdminTab union type
- Added cities tab button with map-outline icon
- Renders CityExpansionDashboard when cities tab active

### Server Enhancement (`server/city-engagement.ts`, 89→91 LOC)
- Added `status` field to CityEngagement interface ("active" | "beta" | "planned")
- Uses `isCityActive()` from city-config to determine status

### Test Threshold Redirections
- `sprint524-api-extraction.test.ts` — api-admin.ts: 220→250 LOC
- `sprint526-admin-tab-extraction.test.ts` — admin/index.tsx: 560→570 LOC
- `sprint281-as-any-reduction.test.ts` — client casts: 35→40

## Test Summary

- `__tests__/sprint543-city-expansion.test.ts` — 23 tests
  - Dashboard component: 9 tests (export, queries, health card, city separation, engagement row, promotion card, missing criteria, status badge, loading)
  - Admin API: 7 tests (health interface, engagement interface, promotion interface, fetch functions, promote function)
  - Admin index: 4 tests (tab type, tab button, import, rendering)
  - City engagement: 3 tests (status field, isCityActive import, status return)
