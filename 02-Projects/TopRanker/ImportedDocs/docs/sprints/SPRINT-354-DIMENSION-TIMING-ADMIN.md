# Sprint 354: Admin Dashboard Dimension Timing Display

**Date:** March 9, 2026
**Story Points:** 3
**Focus:** Server-side dimension timing store + admin dashboard display for rating flow performance metrics

## Mission
Sprint 343 added client-side per-dimension timing analytics. This sprint creates the server-side infrastructure to collect and aggregate that timing data, plus a visual display in the admin dashboard showing how long users spend on each rating dimension.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Two new endpoints: POST for clients to report timing, GET for admin to view aggregates. The in-memory store caps at 1,000 entries to prevent unbounded growth. Visit-type breakdown shows if delivery users rate faster than dine-in users."

**Marcus Chen (CTO):** "This is product intelligence. If users consistently spend 1 second on Food Quality but 5 seconds on Would Return, that tells us the return question might need clarification. Data-driven UX decisions."

**Amir Patel (Architecture):** "Server build grew from 593.8kb to 596.3kb — the timing store and aggregation logic is the bulk of it. Still well under our 700kb threshold."

**Rachel Wei (CFO):** "The timing data helps us understand rating quality. If users rush through in <2s total, those ratings might be low-signal. If they spend 15+ seconds, the flow might be too complex."

**Priya Sharma (QA):** "27 new tests covering the in-memory store, API endpoints, dashboard hook, display UI, and styles. 6,536 total."

**Nadia Kaur (Cybersecurity):** "The POST endpoint requires auth but not admin — any logged-in user can submit timing. The GET endpoint requires admin. Input validation sanitizes values with Math.max(0) and Math.round."

## Changes

### `server/routes-admin-analytics.ts` (+60 LOC)
- **DimensionTimingEntry** interface: q1Ms, q2Ms, q3Ms, returnMs, totalMs, visitType, ts
- **recordDimensionTiming()**: Appends to capped in-memory log (1,000 entries max)
- **getDimensionTimingAggregates()**: Computes averages overall and per visit type
- **POST /api/analytics/dimension-timing**: Authenticated endpoint to record timing data
- **GET /api/admin/analytics/dimension-timing**: Admin-only endpoint for aggregates

### `app/admin/dashboard.tsx` (+50 LOC)
- **DimensionTimingData** interface with byVisitType breakdown
- **useDimensionTiming** hook: Fetches from admin endpoint
- **Rating Dimension Timing section**: 4 cards (Food Quality, Dim 2, Dim 3, Would Return) with proportional bar, total time row, visit type breakdown
- **11 new styles**: timingSubtitle, timingGrid, timingCard, timingValue, timingLabel, timingBarBg, timingBarFill, timingTotalRow/Label/Value, timingVisitTypes, timingVtRow/Label/Value

### `tests/sprint354-dimension-timing-admin.test.ts` (NEW — 27 tests)
- Server timing store (6 tests)
- API endpoints (6 tests)
- Dashboard hook (4 tests)
- Dashboard UI (8 tests)
- Dashboard styles (3 tests)

## Test Results
- **268 test files, 6,536 tests, all passing** (~3.7s)
- **Server build:** 596.3kb (was 593.8kb — +2.5kb from timing store + endpoints)
