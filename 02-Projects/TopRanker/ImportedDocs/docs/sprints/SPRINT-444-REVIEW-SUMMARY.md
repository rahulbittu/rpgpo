# Sprint 444: Business Page Review Summary Cards

**Date:** 2026-03-10
**Type:** Feature
**Story Points:** 3

## Mission

Add a Review Summary Card to the business detail page that aggregates rating data into visual insights: visit type breakdown, would-return percentage, rating recency, and dimension averages. Users should see an at-a-glance summary of what the ratings reveal.

## Team Discussion

**Marcus Chen (CTO):** "This is the 'so what' card. Individual ratings are granular — the summary card tells the story. 'This restaurant is mostly dine-in rated, 85% would return, and food scores 4.3 average.' That's the insight users need to decide whether to visit."

**Rachel Wei (CFO):** "Critical for the rating credibility narrative. When users see visit type breakdown, they understand why we separate dine-in from delivery. When they see dimension averages, they see the structured scoring advantage over 'rate 1-5 stars'. This card makes the system visible."

**Amir Patel (Architecture):** "Standalone component at 281 LOC with 4 pure computation functions: `getVisitTypeBreakdown`, `getWouldReturnPct`, `getRecentCount`, `getDimensionAverages`. All use `useMemo` for performance — no unnecessary recomputation. The card self-hides below 2 ratings to avoid meaningless summaries."

**Priya Sharma (Design):** "The card uses navy for visit type chips, green for high would-return, amber for high dimension scores. Three visual sections: visit types (chip row), stats (would-return + recency bubbles), dimension grid. All icons are Ionicons for consistency."

**Sarah Nakamura (Lead Eng):** "Integration is minimal: 1 import + 1 render line in business/[id].tsx. The component receives the existing `ratings` array — no new API calls. business/[id].tsx grows only 4 lines (504→508, still 78.2% of 650 threshold)."

## Changes

### New Files
- `components/business/ReviewSummaryCard.tsx` (281 LOC) — Aggregated review insights card

### Modified Files
- `app/business/[id].tsx` (504→508 LOC) — Import + render ReviewSummaryCard

### Component API
```typescript
interface ReviewSummaryCardProps {
  ratings: ReviewRating[];
}
// Self-hides when ratings.length < 2
```

### Aggregation Functions
| Function | Purpose | Output |
|----------|---------|--------|
| `getVisitTypeBreakdown` | Count + % per visit type | `{ type, label, icon, count, pct }[]` |
| `getWouldReturnPct` | % of raters who would return | `number \| null` |
| `getRecentCount` | Ratings in last N days | `number` |
| `getDimensionAverages` | Average per scoring dimension | `{ label, avg, icon }[]` |

## Test Results
- **339 files**, **~8,160 tests**, all passing
- Server build: **611.4kb**, 32 tables

## File Health
| File | LOC | Threshold | % | Status |
|------|-----|-----------|---|--------|
| business/[id].tsx | 508 | 650 | 78.2% | OK |
| ReviewSummaryCard.tsx | 281 | — | — | New |
