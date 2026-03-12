# Sprint 99 — UX Polish: Map Fix, Animation Overhaul, Opening Hours

**Date**: 2026-03-08
**Theme**: Production Quality UX
**Story Points**: 13
**Tests Added**: 19 (428 total)

---

## Mission Alignment

A broken map, janky animations, and wall-of-text opening hours undermine user trust.
This sprint fixes the critical IntersectionObserver crash, overhauls all animation curves
for Uber/Grab-quality smoothness, and makes opening hours collapsible.

---

## Team Discussion

**Amir Patel (Architecture)**: "The map crash was a classic stale DOM reference. When
users navigate between tabs, React removes the DOM node but our map instance kept a
reference to it. Google Maps then tried IntersectionObserver on a detached element.
Fix: clear mapInstance on cleanup, check `isConnected` before creation."

**Priya Sharma (Frontend)**: "Animation overhaul across three systems: (1) Press animation
changed from stiff spring (speed 50) to smooth timing-in/gentle-spring-out — feels like
pressing a real button. (2) Card entry now uses staggered delays (60ms per card, capped at
300ms) with 250ms fade+slide — cards cascade in smoothly. (3) Tab bar unified to one
spring config for scale, glow, and opacity — no more shimmy."

**Leo Hernandez (Design)**: "The opening hours was a 7-line wall of text for every business.
Now it shows today's hours with a chevron. Tap to expand all days with LayoutAnimation.
Clean, compact, scannable. The press animation at 0.975 scale is subtle but premium —
you feel it without thinking about it."

**Marcus Chen (CTO)**: "Tab bar scale reduced from 1.18 to 1.12 — less exaggerated,
more professional. Spring config unified: damping 14/stiffness 160 for focus, damping
16/stiffness 140 for unfocus. All three animated properties (scale, glowOpacity, glowScale)
use the same curve so they move as one."

**Sarah Nakamura (Lead Engineer)**: "19 new tests: map cleanup/DOM safety (6), press
animation config (3), stagger calculation (3), tab bar config (3), and opening hours
collapsible (4). All 428 tests passing."

**Nadia Kaur (Cybersecurity)**: "The map fix also prevents potential memory leaks from
orphaned Google Maps instances. Clearing mapInstance.current on cleanup ensures garbage
collection can reclaim the instance and its internal observers."

---

## Changes

### CRITICAL: Map IntersectionObserver Crash
- Added `mapInstance.current = null` and `setMapReady(false)` to cleanup
- Added `isConnected` check before creating map instance
- Prevents crash when tab navigation detaches the DOM element

### Animation System Overhaul
- **Press animation**: Timing down (120ms) + gentle spring up (speed 14, bounciness 2)
- **Card entry stagger**: 60ms delay per card index (capped at 300ms), 250ms fade+slide
- **Tab bar**: Unified spring config (damping 14, stiffness 160) for all animated properties
- **Tab icon scale**: Reduced from 1.18 to 1.12 for subtler feel

### Opening Hours Collapsible
- Shows today's hours + chevron by default
- Tap to expand all 7 days with LayoutAnimation
- Compact display saves ~100px of vertical scroll space per business

### RankedCard Index Prop
- Added `index` prop to RankedCard for stagger calculation
- Passed from FlatList `renderItem({ item, index })`

---

## What's Next (Sprint 100)

Architectural Audit #100 — comprehensive codebase scan (every 5 sprints).
