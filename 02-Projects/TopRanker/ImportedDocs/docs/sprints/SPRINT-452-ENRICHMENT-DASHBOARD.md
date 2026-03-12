# Sprint 452: Admin Enrichment Dashboard

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Create an admin enrichment dashboard that provides aggregated visibility into dietary tag coverage and hours data completeness across all active businesses. Ops team needs metrics to track enrichment progress without running ad-hoc queries.

## Team Discussion

**Marcus Chen (CTO):** "We built dietary admin endpoints in Sprint 446 and hours computation in Sprint 447, but there's no single view showing overall enrichment health. The ops team is flying blind — they don't know which cities need attention, how many businesses are missing both dietary and hours data, or what the overall coverage looks like. This dashboard closes that gap."

**Rachel Wei (CFO):** "Enrichment coverage directly impacts search quality. If 60% of businesses are missing hours data, the openNow filter returns incomplete results. Marketing can't promote 'Open Late Indian in Irving' if we don't know which restaurants are actually open late. This dashboard tells us where to invest enrichment time."

**Amir Patel (Architect):** "Three endpoints is the right granularity: one overview dashboard, two drill-down gap lists (hours and dietary). The gap endpoints support city filtering so ops can work city-by-city. We reuse the hours-utils functions from Sprint 447 for characteristics like openLate and openWeekends counts."

**Sarah Nakamura (Lead Eng):** "The dashboard aggregates in application code rather than complex SQL. For our current scale (under 500 active businesses), this is appropriate. When we scale, we can add caching or materialized views. The per-city breakdown sorts by total business count so the most important cities appear first."

**Jasmine Taylor (Marketing):** "This is exactly what I need. Before any WhatsApp campaign, I need to verify that the businesses in that city actually have complete data. A campaign promoting 'Open Late restaurants' that links to empty filter results would damage trust."

**Nadia Kaur (Cybersecurity):** "The endpoints query active businesses only — no risk of exposing deactivated or flagged business data. The missingBoth list caps at 50 entries to prevent large response payloads."

## Changes

### New: `server/routes-admin-enrichment.ts` (~155 LOC)
- GET /api/admin/enrichment/dashboard — full enrichment overview
  - Dietary: tagged/untagged counts, coverage %, tag distribution
  - Hours: present/missing counts, coverage %, openLate/openWeekends/24hr counts, avg periods
  - Per-city breakdown with dietary and hours coverage %
  - missingBoth: businesses lacking both dietary tags AND hours data
- GET /api/admin/enrichment/hours-gaps — businesses with missing hours (optional city filter)
- GET /api/admin/enrichment/dietary-gaps — businesses with missing dietary tags (optional city filter)

### Modified: `server/routes.ts`
- Import and register `registerAdminEnrichmentRoutes`

## Test Coverage
- 24 tests across 5 describe blocks
- Validates: structure, dashboard metrics, gap endpoints, route wiring, docs
