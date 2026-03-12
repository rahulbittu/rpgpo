# Sprint 276: Score Trend Sparkline

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Visual score history on business detail page using SVG sparkline

## Mission
Show how a restaurant's score has changed over time. A rising score means improving quality. A declining score means a restaurant is slipping. The sparkline makes this visible at a glance, building on the rank_history data already being collected.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The rank_history table already stores weighted_score per business per snapshot. Sprint 276 adds a GET endpoint that returns the last 90 snapshots, and a ScoreTrendSparkline component that renders an SVG path from the data. The trend indicator shows up/down/stable based on the last two data points."

**Amir Patel (Architecture):** "The sparkline is a pure SVG path — no charting library needed. We compute the path coordinates client-side from the API data. The SVG renders natively in React Native web. The component self-fetches its data like ScoreBreakdown."

**Marcus Chen (CTO):** "This is the visual complement to the Bayesian prior. Users can see not just the current score but the trajectory. A restaurant with a rising sparkline and a 7.5 score is more interesting than one with a flat 7.5. Movement tells a story."

**Jasmine Taylor (Marketing):** "Score trends are WhatsApp gold. 'Check out this restaurant — their score has been climbing for 3 months!' That's a shareable insight that no other platform shows. The sparkline is visual, compact, and immediately understandable."

## Changes

### Server — Score Trend API
- **`server/routes-score-breakdown.ts`**:
  - `GET /api/businesses/:id/score-trend`: Returns up to 90 score snapshots from rank_history
  - Ordered by date ascending for sparkline rendering
  - Returns `{ date, score }` array

### Client — ScoreTrendSparkline Component
- **`components/business/ScoreTrendSparkline.tsx`** (NEW):
  - Fetches from score-trend API
  - SVG sparkline with BRAND amber stroke
  - Trend direction pill: up (green), down (red), stable (neutral)
  - Current score display with snapshot count
  - Returns null for <2 data points
  - Card styles matching ScoreBreakdown

### Client — Business Page Integration
- **`app/business/[id].tsx`**:
  - Imports and renders ScoreTrendSparkline after ScoreBreakdown

### Tests
- **16 new tests** in `tests/sprint276-score-trend-sparkline.test.ts`
- Component tests: export, API fetch, SVG path, trend indicators, score display, null guard, brand colors
- API tests: endpoint, rankHistory query, ordering, limit, field selection
- Integration tests: import and rendering on business page

## Test Results
- **197 test files, 5,452 tests, all passing** (~2.9s)
- +16 new tests from Sprint 276
- 0 regressions
