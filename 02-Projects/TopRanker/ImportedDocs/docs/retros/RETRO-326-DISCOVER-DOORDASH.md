# Retrospective — Sprint 326

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "The DoorDash pattern is now our standard across both main pages. Consistent navigation patterns reduce cognitive load for users."

**Amir Patel:** "Minimal code change — just moved existing JSX from fixed position into ListHeaderComponent. No new components, no new state, no architectural changes. +2 LOC net."

**Jasmine Taylor:** "Content visibility improved on Discover page. The first restaurant card appears higher on screen. This matters for WhatsApp demo videos — users see restaurants, not filters."

## What Could Improve

- **Map view still has separate filter handling** — When in map view, filter chips aren't visible. Could add inline filters to the split list section.
- **Sticky filter chips on scroll** — Same as Rankings, DoorDash makes filter chips sticky at the top after initial scroll. Sprint 327 addresses this.
- **search.tsx at 963 LOC** — 37 lines from 1000 threshold. The DoorDash pattern redesign (extracting filter components) could reduce this further.

## Action Items
- [ ] Sprint 327: Sticky cuisine chips on scroll (DoorDash category bar)
- [ ] Future: Extract filter chips into a shared FilterBar component
- [ ] Future: Add inline filters to map view split list section

## Team Morale: 9/10
Both main pages now follow the same DoorDash pattern. The app feels professional and consistent. Constitution #10: "Premium feel, free access."
