# Retro 421: Search onSearchArea Wiring

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "6 lines of code to complete a two-sprint feature. The Sprint 418 groundwork (button, callback prop, listeners) made the wiring trivial. Good example of planned incremental delivery."

**Sarah Nakamura:** "Zero test cascades. The map search-area feature is now end-to-end functional: pan map → button appears → tap → results filter to 5km radius. Simple, predictable, complete."

## What Could Improve

- **5km radius is hardcoded** — Could be dynamic based on map zoom level for more precision.
- **No visual indicator on map** — Users don't see the 5km radius boundary. Could add a circle overlay.
- **Switching back to list view keeps mapSearchCenter** — Should probably clear it when switching to list view.

## Action Items

- [ ] Consider clearing mapSearchCenter when switching to list view — **Owner: Sarah (next sprint)**
- [ ] Evaluate dynamic radius based on zoom level — **Owner: Amir (future)**

## Team Morale
**8/10** — Quick, clean sprint that completes previous work. Good closure.
