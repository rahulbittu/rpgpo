# Sprint 567: Rating Velocity Dashboard Widget

**Date:** 2026-03-10
**Story Points:** 3
**Status:** Complete
**Tests:** 21 new (10,695 total across 457 files)

## Mission

Add a rating velocity widget to the business owner dashboard that visualizes weekly rating volume with a mini bar chart, highlights the peak week, and shows a trend badge with velocity change percentage. This gives owners actionable insight into their rating momentum — are ratings accelerating, stable, or declining?

## Team Discussion

**Marcus Chen (CTO):** "Velocity is the one metric owners keep asking about. 'Am I getting more ratings this month?' Now they can see it at a glance. The mini bar chart makes weekly patterns immediately visible — if Friday always spikes, that's useful to know."

**Sarah Nakamura (Lead Eng):** "The widget is self-contained at 169 LOC. It takes three props — weeklyData, velocityChange, and optional delay — and handles all computation internally: totalRatings via reduce, avgPerWeek, and peakWeek identification. The bar chart normalizes heights against maxCount so it scales to any data range."

**Amir Patel (Architecture):** "Dashboard.tsx grew from 492 to 502 LOC — just the import and conditional render block. The widget only appears when weeklyVolume has data, which prevents empty-state rendering for new businesses with no history. The FadeInDown animation with configurable delay keeps the staggered entrance consistent with other dashboard widgets."

**Rachel Wei (CFO):** "Rating velocity is a key engagement metric for Business Pro subscribers. Showing them this data in the dashboard increases perceived value of the $49/month plan. The trend badge — green up arrow for growth, red for decline — is the kind of instant feedback that drives retention."

**Nadia Kaur (Cybersecurity):** "The widget is purely presentational — no new API calls, no new data fetching. It consumes data already available in the analytics payload. No new attack surface."

**Jasmine Taylor (Marketing):** "When we onboard new business owners, the velocity widget is a great talking point. 'See how your ratings are trending week over week' — it makes the dashboard feel like a real analytics tool, not just a list."

## Changes

### New: `components/dashboard/RatingVelocityWidget.tsx` (169 LOC)
- `WeeklyVelocity` interface: week label, count, avgScore
- `RatingVelocityWidgetProps`: weeklyData array, velocityChange percentage, optional delay
- Computes: totalRatings (reduce), avgPerWeek, peakWeek (max count)
- Header: speedometer-outline icon + "Rating Velocity" title + trend badge
- Trend badge: green/red/neutral with arrow icon and percentage
- Mini bar chart: normalized heights, peak bar highlighted in BRAND.colors.amber
- Stats row: Total, Avg/week, Peak (with week label)
- FadeInDown animation with configurable delay
- Returns null when weeklyData is empty

### Modified: `app/business/dashboard.tsx` (492→502 LOC, +10)
- Added import for RatingVelocityWidget
- Renders widget in overview tab after VelocityIndicator
- Conditional: only renders when weeklyVolume.length > 0
- Maps weeklyVolume data to WeeklyVelocity format

### Modified: `shared/thresholds.json`
- Added RatingVelocityWidget.tsx: maxLOC 180, current 169
- Updated dashboard.tsx: current 492→502
- Tests: minCount 10500→10600, currentCount 10630→10695

## Test Summary

- `__tests__/sprint567-velocity-widget.test.ts` — 21 tests
  - Widget component: 12 tests (export, interfaces, props, computations, speedometer icon, trend badge, bar chart, peak highlight, stats row, animation, null guard, LOC)
  - Dashboard integration: 6 tests (import, renders, passes data, passes velocity, conditional render, LOC check)
  - Build + thresholds: 3 tests (widget tracked, dashboard updated, test count)
