# Sprint 381: Extract BusinessActionBar from Business Detail

**Date:** 2026-03-09
**Type:** Component Extraction / Code Health
**Story Points:** 3

## Mission

Extract the action bar (Call, Website, Maps, Share, Copy Link) from `app/business/[id].tsx` into a self-contained `BusinessActionBar` component. Reduces business detail page complexity and aligns with the proactive extraction pattern established in Sprint 377.

## Team Discussion

**Marcus Chen (CTO):** "business/[id].tsx was at 604 LOC after Sprint 378. The action bar is a clean extraction boundary — 5 handlers, 5 buttons, one style. Good candidate."

**Sarah Nakamura (Lead Eng):** "The extraction pattern is well-established now: extract → props interface → barrel export → redirect tests. Sprint 377 did it for SavedPlacesSection, this follows the same playbook."

**Amir Patel (Architecture):** "BusinessActionBar is fully self-contained — it owns all its handlers and doesn't need callbacks from the parent. That's the cleanest extraction possible. Only concern: business detail still has a handleMaps reference for LocationCard, but that's independent."

**Priya Sharma (Frontend):** "I like that the props are simple scalars — name, slug, weightedScore, phone, website, address, googleMapsUrl. No complex objects or callbacks. Makes it easy to test and reuse."

**Jasmine Taylor (Marketing):** "The Copy Link action in the bar drives our WhatsApp sharing loop. Keeping it visible and accessible is critical for Phase 1 organic growth."

## Changes

### New Files
- `components/business/BusinessActionBar.tsx` (82 LOC) — Extracted action bar with 5 handlers, 5 ActionButtons, self-contained styles

### Modified Files
- `app/business/[id].tsx` — Replaced inline action bar with `<BusinessActionBar>` component, removed ActionButton import and actionBar style (604 → 596 LOC)
- `components/business/SubComponents.tsx` — Added barrel export for BusinessActionBar
- `tests/sprint381-action-bar-extract.test.ts` — 18 tests covering extracted component, parent simplification, barrel export
- `tests/sprint337-copy-link-share.test.ts` — Redirected Copy Link assertions from business detail to BusinessActionBar
- `tests/sprint144-product-validation.test.ts` — Updated orphaned export check: ActionButton → BusinessActionBar

## Test Results
- **288 files**, **6,978 tests**, all passing
- Server build: **599.3kb**, 31 tables

## PRD Gaps
None — component extraction is internal code health.

## Architecture Notes
- business/[id].tsx: 596 LOC (92% of 650 threshold) — comfortable headroom
- profile.tsx: 671 LOC (84% of 800 threshold) — stable after Sprint 377 extraction
- Pattern: proactive extraction when file is at 95%+ for 2 consecutive audits
