# Retro 422: Business Detail Review Sorting

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Amir Patel:** "Clean client-side implementation — zero API changes, zero test cascades. The sortRatings function is simple and covers all four use cases without over-engineering."

**Priya Sharma:** "The 'Most Weighted' sort option is a genuine differentiator. Users can surface reviews from trusted raters with one tap. No other platform offers this."

**Marcus Chen:** "This completes the review section improvements. Distribution chart (existing) + sort controls (new) gives users full control over how they consume community reviews."

## What Could Improve

- **No persistence of sort preference** — Users have to re-select their preferred sort each time they expand reviews. Could save to AsyncStorage.
- **No sort indicator in collapsed state** — When collapsed, the header doesn't hint that sort is available, which may reduce discovery.
- **Sort animation** — Switching sorts could use a subtle transition instead of instant re-render.

## Action Items

- [ ] Consider persisting sort preference in AsyncStorage — **Owner: Amir (future)**
- [ ] Evaluate adding sort icon to collapsed header as a discovery hint — **Owner: Priya (future)**

## Team Morale
**8/10** — Clean enhancement that adds real user value. The "Most Weighted" sort aligns perfectly with our trust-first positioning.
