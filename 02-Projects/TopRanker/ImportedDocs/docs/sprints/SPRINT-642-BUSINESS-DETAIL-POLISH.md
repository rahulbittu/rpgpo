# Sprint 642: Business Detail Action Bar Polish

**Date:** 2026-03-11
**Points:** 2
**Focus:** Upgrade action buttons to icon circle style for business detail

## Mission

The action buttons on the business detail page were flat rectangular buttons. Upgrade to circular icon buttons with labels underneath — a more modern, app-like pattern used by Google Maps, Yelp, and other best-in-class apps.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "The icon circle pattern is instantly recognizable — users know these are tappable actions. The 40x40 circles with border give good touch targets."

**Marcus Chen (CTO):** "Accent buttons (Menu, Order, Reserve) now have a subtle amber background on the circle — they visually pop without being garish."

**Priya Sharma (QA):** "Disabled buttons drop to 0.4 opacity (was 0.5) — slightly more faded to make the enabled ones stand out more."

## Changes

### `components/business/ActionButton.tsx`
- Added `iconCircle` wrapper (40x40, borderRadius: 20, border)
- Added `iconCircleAccent` for accent buttons (amber tint background + border)
- Removed background from the outer button — now transparent with icon circle
- Button padding reduced from 10 to 6 (circle provides the visual weight)
- Label font size: 11 → 10 (tighter under circle)
- Disabled opacity: 0.5 → 0.4

### Test Updates
- `sprint627`: Updated accent style assertion from `actionBtnAccent` to `iconCircleAccent`

## Health
- **Tests:** 11,696 pass (501 files)
- **Build:** 637.9kb
- **ActionButton LOC:** 55 (was 45)
