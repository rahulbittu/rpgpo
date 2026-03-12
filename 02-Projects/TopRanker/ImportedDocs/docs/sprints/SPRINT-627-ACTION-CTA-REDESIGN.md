# Sprint 627: Business Detail Action CTA Redesign

**Date:** 2026-03-11
**Type:** Core Loop — Decision-to-Action (Phase 2 — UI)
**Story Points:** 3
**Status:** COMPLETE

## Mission

Add Decision-to-Action CTAs to the business detail page. When a business has action URLs (menu, order, pickup, DoorDash, Uber Eats, reservation), show them as prominent accent-colored buttons above the existing Call/Website/Maps/Share row.

## Team Discussion

**Priya Sharma (Design):** "The two-row layout is clean: action CTAs (amber accent, conditionally shown) sit above utility actions (Call, Website, Maps, Share, WhatsApp). This keeps actions subordinate to rankings per CEO directive while making them immediately accessible."

**Sarah Nakamura (Lead Eng):** "ActionButton now accepts an `accent` prop that changes the background to amber-tinted, icon color to AMBER, and label to semibold. The conditional rendering with `{hasActionCTAs && ...}` means the row only appears when at least one action URL exists."

**Amir Patel (Architecture):** "Analytics tracks every CTA tap via `Analytics.actionCTATap(slug, actionType)`. Six action types: menu, order, pickup, doordash, ubereats, reservation. This feeds directly into Sprint 630's attribution tracking."

**Marcus Chen (CTO):** "Zero regression risk — the existing action bar works exactly as before when no action URLs are set. The new row only appears when we populate the fields."

## Changes

### Modified Files
- `components/business/BusinessActionBar.tsx` — Added 6 action CTA props, handlers, conditional action row with accent styling, wrapper layout
- `components/business/ActionButton.tsx` — Added `accent` prop with amber-tinted background, AMBER icon/label colors
- `app/business/[id].tsx` — Passes 6 action URL props to BusinessActionBar
- `lib/analytics.ts` (+3 LOC) — `actionCTATap(slug, actionType)` event

## Verification
- 11,611 tests passing across 496 files
- Server build: 629.9kb (< 750kb ceiling)
- 30 tracked files, 0 threshold violations
