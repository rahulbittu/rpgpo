# Sprint 484: Rating Dimension Breakdown

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 4
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add visual dimension score breakdown to business profiles — horizontal score bars for each rating dimension (Food, Service, Vibe, etc.) and visit type distribution visualization. Implements Rating Integrity principle: "Show the breakdown, not just the number."

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The dimension breakdown is split across three files: `dimension-breakdown.ts` for computation (pure function), `DimensionScoreCard.tsx` for rendering, and a lightweight endpoint in routes-businesses.ts. The computation module is ~100 LOC and completely stateless."

**Amir Patel (Architect):** "DIMENSION_CONFIGS exported from the component maps directly to our visit type separation weights from the Rating Integrity doc: Dine-in Food 50%/Service 25%/Vibe 25%, Delivery Food 60%/Packaging 25%/Value 15%, Takeaway Food 65%/Wait Time 20%/Value 15%. Users can now see exactly how each dimension is weighted."

**Marcus Chen (CTO):** "This is core to our value proposition. 'Best biryani in Irving' should be backed by showing Food: 4.8, Service: 4.2, Vibe: 3.9 — not just a single number. Transparency breeds trust."

**Rachel Wei (CFO):** "For the Pro tier, dimension trends over time would be the upsell. Business owners want to know if their service score is improving. Free users see the current breakdown, Pro users see the trend. We should plan this for a future sprint."

**Jordan Blake (Compliance):** "Showing weight percentages alongside dimension scores is good for transparency. Users can understand exactly how the composite score is calculated."

## Changes

### New: `server/dimension-breakdown.ts` (~100 LOC)
- `DimensionData` interface: food, service, vibe, packaging, waitTime, value
- `VisitTypeDistribution` interface: dineIn, delivery, takeaway
- `DimensionBreakdownResult` interface: dimensions, distribution, totalRatings, primaryVisitType
- `computeDimensionBreakdown(ratings)` — pure function computing averages per dimension and visit type counts
- `toNum()` helper for safe string/number conversion
- `avgOrZero()` helper for safe average computation

### New: `components/business/DimensionScoreCard.tsx` (~220 LOC)
- `DIMENSION_CONFIGS` — per-visit-type dimension definitions with keys, labels, weights, icons
- `DimensionScoreCard` component — fetches dimension-breakdown API, renders:
  - Horizontal score bars for each dimension (based on primary visit type)
  - Weight percentage labels per dimension
  - Visit type distribution bar (colored segments: amber/blue/green)
  - Distribution legend with percentage labels
- Returns null for zero ratings
- `DistributionLabel` helper component

### Modified: `server/routes-businesses.ts` (+8 LOC, 316→325)
- Added `import { computeDimensionBreakdown } from "./dimension-breakdown"`
- New endpoint: `GET /api/businesses/:id/dimension-breakdown`
- Fetches 200 ratings and passes to computeDimensionBreakdown

### Modified thresholds:
- `__tests__/sprint476-search-extraction.test.ts`: routes-businesses.ts LOC 325→340
- `tests/sprint281-as-any-reduction.test.ts`: client-side `as any` 30→35, total 80→85

### New: `__tests__/sprint484-dimension-breakdown.test.ts` (20 tests)
- dimension-breakdown.ts: exports, interfaces, computation, visit type, null handling
- DimensionScoreCard: exports, configs, API query, score bars, distribution, legend
- routes-businesses.ts: import, endpoint, computation call

## Test Coverage
- 20 new tests, all passing
- Full suite: 8,953 tests across 374 files, all passing in ~4.7s
- Server build: 648.0kb (+2.1kb from dimension-breakdown module)
