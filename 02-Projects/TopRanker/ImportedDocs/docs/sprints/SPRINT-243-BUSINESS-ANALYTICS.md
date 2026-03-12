# Sprint 243 — Business Analytics Dashboard for Claimed Owners

**Date**: 2026-03-09
**Theme**: Owner Empowerment — Business Analytics
**Story Points**: 13
**Tests Added**: 36 (sprint243-business-analytics.test.ts)

---

## Mission Alignment

Business owners who claim their listing need visibility into how their business is performing
on the platform. Without analytics, owners are flying blind — they cannot see how many people
view their listing, where traffic comes from, or how they compare to competitors. The business
analytics dashboard gives claimed owners the data they need to understand their presence,
which directly supports retention and our Business Pro revenue stream ($49/mo). Trust is a
two-way street: users trust our rankings, and owners trust that claiming their listing gives
them real value.

---

## Team Discussion

**Marcus Chen (CTO)**: "This is a revenue-critical feature. Business Pro subscribers pay $49/mo
and analytics is the headline value proposition. We need this to be fast, accurate, and
extensible. The in-memory approach is fine for MVP — we're tracking view events, not complex
aggregations. When we hit scale, we'll move to a dedicated analytics store with time-series
bucketing. For now, the 10K event cap with FIFO eviction gives us a reasonable rolling window."

**Rachel Wei (CFO)**: "Business Pro is projected to be 40% of our revenue by Q3. Analytics
is the number one feature request from our beta business owners. Every day we don't have this,
we're leaving money on the table. The trends endpoint — 7d vs 30d comparison — is exactly what
small business owners ask for. They want to know 'am I doing better this week than last month?'
That's the hook that keeps them paying."

**Sarah Nakamura (Lead Engineer)**: "The architecture follows our established in-memory pattern:
unshift/pop FIFO queue, capped at MAX_EVENTS, tagged logger, zero DB coupling. The analytics
module is a pure data aggregation layer — it takes recorded events and computes metrics on the
fly. Five API endpoints cover the three owner-facing views (overview, sources, trends) and two
admin views (top businesses, platform stats). The routes file is a thin HTTP layer that delegates
entirely to the analytics module."

**Cole Anderson (QA)**: "36 tests across four groups: static analysis for the analytics module
(10 tests covering exports, constants, and logger usage), runtime tests for all six exported
functions (14 tests including edge cases like empty businesses and limit defaults), static
analysis for the routes file (8 tests for all five endpoints), and integration tests (4 tests
verifying the wiring between routes.ts, routes-owner-dashboard.ts, and business-analytics.ts).
Every public function is tested with both happy path and edge cases."

**Jasmine Taylor (Marketing)**: "We need to think about how we present analytics to owners in
the marketing funnel. 'See exactly who's viewing your business' is a powerful conversion hook.
The source breakdown — search vs direct vs challenger vs referral — tells a story about where
their visibility is coming from. When we launch the owner dashboard UI, I want the onboarding
flow to walk them through each metric with context. 'Your business appeared in 47 searches this
week' is much more compelling than a raw number table."

**Amir Patel (Architecture)**: "Clean separation of concerns. business-analytics.ts is a
standalone analytics engine with no external dependencies beyond logger. routes-owner-dashboard.ts
is the HTTP adapter. Neither module touches the database. When we add persistence, the migration
path is straightforward: replace the in-memory viewEvents array with a time-series table, keep
the same aggregation logic, and the API surface stays identical. The MAX_EVENTS cap prevents
memory bloat, and the FIFO eviction ensures we always have the most recent data."

---

## Changes

### New Files
- `server/business-analytics.ts` — Analytics engine: recordView, getBusinessMetrics, getTopBusinesses, getViewSources, getAnalyticsStats, clearAnalyticsEvents
- `server/routes-owner-dashboard.ts` — 5 API endpoints for owner and admin analytics
- `tests/sprint243-business-analytics.test.ts` — 36 tests across 4 groups

### Modified Files
- `server/routes.ts` — Import and register owner dashboard routes

---

## API Endpoints Added

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/owner/analytics/:businessId` | Business metrics with period query param (7d/30d/90d) |
| GET | `/api/owner/analytics/:businessId/sources` | View source breakdown (search/direct/challenger/referral) |
| GET | `/api/owner/analytics/:businessId/trends` | 7d vs 30d trend comparison |
| GET | `/api/admin/analytics/top-businesses` | Top businesses by view count (admin only) |
| GET | `/api/admin/analytics/stats` | Platform-wide analytics stats (admin only) |

---

## BusinessMetrics Schema

| Field | Type | Description |
|-------|------|-------------|
| businessId | string | Business identifier |
| views | number | Total views in period |
| uniqueVisitors | number | Distinct visitor count |
| ratingsReceived | number | New ratings in period (DB-backed, future) |
| averageRating | number | Average rating (DB-backed, future) |
| searchAppearances | number | Views from search results |
| profileClicks | number | Direct profile visits |
| bookmarks | number | Bookmark count (DB-backed, future) |
| challengerAppearances | number | Appearances in challenger battles |
| period | string | Time period (7d/30d/90d) |

---

## PRD Gaps Addressed

- Business owner analytics dashboard (backend infrastructure)
- Owner-facing API surface for claimed business insights
- Admin analytics overview for platform health monitoring
