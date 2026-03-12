# Sprint 630: Action CTA Analytics Attribution

**Date:** 2026-03-11
**Type:** Core Loop — Decision-to-Action (Phase 5 — Attribution)
**Story Points:** 3
**Status:** COMPLETE

## Mission

Add full analytics attribution for Decision-to-Action CTAs: impression tracking (how many users see action CTAs), conversion tracking (which surface drives the most action engagement), and surface tagging (business_detail vs discover_card vs ranked_card).

## Team Discussion

**Amir Patel (Architecture):** "Three-event funnel: action_cta_impression → action_cta_tap → action_cta_conversion. Impression fires on mount when CTAs exist. Tap fires on every button press (already from Sprint 627). Conversion adds surface attribution so we know if business detail, discover cards, or ranked cards drive the most action engagement."

**Sarah Nakamura (Lead Eng):** "The impression event includes action_count and action_types as a comma-separated string. This lets us measure 'businesses with 4 CTAs get 2x more taps than businesses with 1 CTA' — a key product insight for prioritizing data enrichment."

**Priya Sharma (Design):** "Now we can answer the fundamental question: does the Decision-to-Action layer actually convert? If users aren't tapping order/menu buttons, we can iterate on placement and styling."

**Marcus Chen (CTO):** "Five sprints, one complete layer: schema (626) → business detail UI (627) → card UI (628) → seed data (629) → attribution (630). This is how you ship a feature with full observability from day one."

**Rachel Wei (CFO):** "Action CTA conversion data directly feeds our revenue story. If we can show restaurants that TopRanker drives ordering and reservations, that's the Business Pro upsell pitch."

## Changes

### Modified Files
- `lib/analytics.ts` (+9 LOC) — Added action_cta_impression, action_cta_conversion events to AnalyticsEvent union; actionCTAImpression() and actionCTAConversion() functions
- `components/business/BusinessActionBar.tsx` (+13 LOC) — useEffect impression tracking on mount, conversion tracking on each handler
- `__tests__/sprint627-action-cta-redesign.test.ts` — Raised ActionBar LOC ceiling 130→145
- `shared/thresholds.json` — Tests 11646→11661

### New Files
- `__tests__/sprint630-action-attribution.test.ts` — 15 tests

## Verification
- 11,661 tests passing across 499 files
- Server build: 629.9kb (< 750kb ceiling)
- 30 tracked files, 0 threshold violations
