# Retro 442: Search Filters v2 — Dietary Tags + Distance

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Feature that directly addresses user requests. The dietary + distance combination is powerful: 'Find halal restaurants within 3km' is exactly how our Phase 1 users think. The implementation leverages existing schema (lat/lng) and adds minimal new data (dietaryTags jsonb)."

**Priya Sharma:** "The green active state for dietary chips was the right design choice — it's instantly distinguishable from price (amber) and sort (navy). The DistanceChips hiding when no location is smart UX — no confusion, no dead buttons."

**Amir Patel:** "Server-side distance filtering via haversine keeps the architecture clean. The client sends lat/lng/maxDistance, server computes distances and filters. Each response includes `distanceKm` for display. No client-side haversine duplication needed for the filtered results."

## What Could Improve

- **No dietary tag data yet** — The column exists but all businesses have `[]`. Need a data enrichment sprint or admin endpoint to tag restaurants. Indian restaurants especially need vegetarian/halal tags.
- **Distance precision** — haversine is great-circle distance, not driving distance. A restaurant 2km away might be 5km by road. Consider noting 'as the crow flies' or integrating Google Distance Matrix later.
- **DiscoverFilters growing** — 208→321 LOC. Still manageable, but if more filter types are added (hours picker, rating minimum), consider extracting to separate filter component files.

## Action Items

- [ ] Begin Sprint 443 (Profile extraction — rating history section) — **Owner: Sarah**
- [ ] Plan dietary tag enrichment for Phase 1 restaurants — **Owner: Jasmine**
- [ ] Consider admin endpoint for dietary tag management — **Owner: Sarah**

## Team Morale
**8/10** — Solid feature sprint. Dietary filters especially resonate with the team's understanding of our target demographic. Eager to see user engagement data once tags are populated.
