# Retro 447: Hours-Based Search Filter

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Replacing the static isOpenNow with dynamic computation is a real quality improvement. Users were seeing 'Open Now' for businesses that were clearly closed. Now we compute from actual period data in real-time. The fallback to the static field for businesses without hours data ensures no regression."

**Amir Patel:** "hours-utils.ts is a textbook utility module. Pure functions, no side effects, timezone-aware. The overnight period handling covers the edge case that most hours-parsing implementations miss — a restaurant that's open Friday night until Saturday 2am. The three-layer architecture (utility → server → client) makes each layer independently testable."

**Rachel Wei:** "Three new filter dimensions that map to real user intents. 'Open Now' is the most obvious, but 'Open Late' is our differentiator. No major competitor surfaces late-night availability as a first-class filter chip. This is a discovery pattern that drives repeat usage."

**Jasmine Taylor:** "The purple color scheme for hours chips is visually distinct from dietary (green) and distance (navy). Users can immediately see which filter category they're adjusting. The icon choices (time, moon, calendar) are intuitive."

## What Could Improve

- **No openingHours data for most businesses** — Seed data doesn't include openingHours periods. Until Google Places import populates this field, the Open Now filter falls back to the static boolean. Need a Sprint 449+ task to backfill hours data.
- **Hardcoded to Central Time** — Works for Dallas but will need parameterization when we expand to OKC, NOLA, etc. (all currently Central Time, but future cities may not be).
- **DiscoverFilters growing** — Now at ~370 LOC with 4 chip components. If Sprint 449 adds more filter types, should extract each chip row into its own file.

## Action Items

- [ ] Begin Sprint 448 (Review summary city comparison) — **Owner: Sarah**
- [ ] Plan Google Places hours data backfill for existing businesses — **Owner: Marcus**
- [ ] Monitor DiscoverFilters LOC — extract if exceeds 400 LOC — **Owner: Amir**

## Team Morale
**9/10** — Good delivery. Real-time hours computation replaces a known data quality issue. The filter chip pattern is well-established and the team is comfortable extending it. Sprint 446-447 back-to-back gave us admin tooling + user-facing search improvements in the same cycle.
