# External Critique Request — Sprints 401-404

**Date:** 2026-03-09
**Requesting:** Independent review of Sprints 401-404
**Reviewer:** External watcher (ChatGPT)

---

## Sprint 401: Profile Stats Dashboard

**Summary:** New extracted `ProfileStatsCard` component (280 LOC) showing activity heatmap (last 30 days, 4 intensity levels), score distribution histogram (5 bars), and most-rated businesses (top 3). All computed client-side from ratingHistory. profile.tsx grew +8 LOC to 739/800.

**Questions:**
1. The heatmap uses 4 intensity levels (0, 1, 2, 3+). Should these thresholds be different for power users who might rate 10+ times per day?
2. Score distribution rounds to nearest integer. Is that the right granularity or should we use 0.5 buckets?
3. "Most Rated" shows top 3 by frequency. Should we also show "Highest Rated" or "Most Improved"?

---

## Sprint 402: Business Photo Gallery Improvements

**Summary:** Enhanced `PhotoGallery.tsx` with photo count badge, "1 of N" index on featured image, "See all" overlay on last grid image (Instagram-style), community photo label, and "Add your photo" CTA linking to rating flow. All `as any` replaced with `pct()`.

**Questions:**
1. The "Add your photo" CTA links to the full rating flow, not a standalone photo upload. Is that friction or appropriate UX?
2. Community photo count prop exists but isn't populated from the API. Is the prop premature?
3. "See all" overlay implies a fullscreen gallery view that doesn't exist yet. Is this misleading?

---

## Sprint 403: Rating History Detail View

**Summary:** Enhanced `HistoryRow.tsx` with expandable detail section on tap: visit type badge, dimension scores (3 boxes with visit-type-specific labels), would-return indicator, note preview, "View Business" link. Tap now toggles expansion (previously navigated to business page).

**Questions:**
1. Changing tap behavior from "navigate to business" to "expand detail" breaks the old interaction model. Is this a UX regression for users who tapped to navigate?
2. Dimension scores show raw q1/q2/q3 without explaining what they mean. Should we show the labels (e.g., "Food: 4, Service: 3") instead of just numbers?
3. The "View Business" link is an explicit action in the detail view. Is it discoverable enough or should there still be a swipe/gesture shortcut?

---

## Sprint 404: Discover Trending Section Refresh

**Summary:** Extracted `TrendingSection` from `search.tsx` (752→688 LOC, -64). Enhanced with photo thumbnails, score + rank + category meta row, and "this week" time context on delta badges. Zero test cascades.

**Questions:**
1. Only 3 trending businesses shown (API limit). Should there be a "See all trending" link?
2. The trending section returns null when `trending.length === 0`. Should there be an empty state ("No trending businesses this week")?
3. Photo thumbnails are 44x44px. Is that large enough to be recognizable or too small to be useful?
