# Sprint 628: Card Action Quick-Links

**Date:** 2026-03-11
**Type:** Core Loop — Decision-to-Action (Phase 3 — Cards)
**Story Points:** 3
**Status:** COMPLETE

## Mission

Add compact action quick-link icons (call, directions, order/menu) to discover cards and ranked cards. Users can act directly from any card in the feed without opening the business detail page.

## Team Discussion

**Priya Sharma (Design):** "The quick-action icons sit right-aligned next to the Rate CTA on discover cards, and in their own row on ranked cards. 28px circular buttons with subtle tertiary backgrounds — they don't compete with the score or rank badge but they're immediately tappable."

**Sarah Nakamura (Lead Eng):** "Conditional rendering throughout — phone icon only shows if item.phone exists, directions only if lat/lng, order/menu only if those URLs are set. Zero visual change for businesses without this data. The cardActionsRow uses space-between to push Rate left and quick actions right."

**Amir Patel (Architecture):** "Analytics tracks every quick-action tap with source suffix — call_card, directions_card, order_card for discover; call_ranked, directions_ranked, order_ranked for rankings. This lets us compare action adoption across card types in Sprint 630's attribution dashboard."

**Marcus Chen (CTO):** "This completes the three-tier action CTA rollout: Sprint 626 (data layer), Sprint 627 (business detail page), Sprint 628 (cards). Every surface where a user sees a business now has immediate action access."

## Changes

### Modified Files
- `components/search/SubComponents.tsx` — Added cardActionsRow, quickActions container, 3 conditional quick-action buttons (call, directions, order/menu) with analytics
- `components/leaderboard/RankedCard.tsx` — Added quickActionsRow with same 3 conditional actions, +Linking/Platform imports
- `shared/thresholds.json` — Tests 11611→11630

### New Files
- `__tests__/sprint628-card-action-quicklinks.test.ts` — 19 tests

## Verification
- 11,630 tests passing across 497 files
- Server build: 629.9kb (< 750kb ceiling)
- 30 tracked files, 0 threshold violations
