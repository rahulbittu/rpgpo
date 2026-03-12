# Sprint 403: Rating History Detail View

**Date:** 2026-03-09
**Type:** Feature Enhancement
**Story Points:** 3

## Mission

Enhance rating history rows with expandable dimension detail view showing per-dimension scores, visit type, would-return indicator, note preview, and "View Business" link. Constitution #4: "Every rating has visible consequence." Users should be able to revisit their past ratings with full dimension context.

## Team Discussion

**Marcus Chen (CTO):** "Rating history was a list of scores and dates. Now it's a list of full experiences. Users can see 'I rated food 5, service 3, vibe 4 at this biryani place last week.' That's the detail that builds understanding of their own rating patterns."

**Priya Sharma (Frontend):** "Tap toggles expansion, long-press still opens edit/delete. The interaction model is clean — two distinct actions for two distinct intents. The expanded section shows visit type badge, dimension scores in boxes, would-return indicator, note preview, and a 'View Business' link."

**Amir Patel (Architecture):** "Dimension labels change based on visit type: Dine-in gets Food/Service/Vibe, Delivery gets Food/Packaging/Value, Takeaway gets Food/Wait Time/Value. This matches our Rating Integrity visit type separation — the competitive advantage."

**Sarah Nakamura (Lead Eng):** "HistoryRow grew from 150 to ~230 LOC. It's still a focused component. Zero test cascades — the existing sprint387 tests check for edit/delete patterns which are preserved. The 'View Business' link replaces the old tap-to-navigate behavior."

## Changes

### Modified Files
- `components/profile/HistoryRow.tsx` — Added expandable detail section with dimension scores, visit type badge, would-return indicator, note preview, "View Business" link. +80 LOC.

### New Files
- `tests/sprint403-rating-history-detail.test.ts` — 18 tests

## Test Results
- **306 files**, **7,332 tests**, all passing
- Server build: **601.1kb**, 31 tables
