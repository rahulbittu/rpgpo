# Retro 419: Profile Activity Feed

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Priya Sharma:** "The timeline dots with score-based colors create an instant visual pattern. Users can glance at their feed and see if they're generally positive (gold/green dots) or mixed. It's honest feedback without being judgmental."

**Amir Patel:** "ActivityFeed at 191 LOC is clean and self-contained. The getActivityIcon function is a pure function that maps score ranges to icon/color pairs. Easy to adjust thresholds if needed."

**Sarah Nakamura:** "profile.tsx grew by just 4 lines. The component handles its own state (showAll toggle), own rendering (ActivityRow), and own styles. Zero coupling to parent state."

## What Could Improve

- **No dish info in the feed** — Ratings with dish context ('Best biryani') could show the dish name for more context.
- **No photos in the feed** — If the rating included a photo, showing a thumbnail would make the feed more visual.
- **INITIAL_SHOW = 5 is hardcoded** — Could be configurable or responsive (show more on larger screens).

## Action Items

- [ ] Consider adding dish name to ActivityRow when available — **Owner: Priya (future)**
- [ ] Evaluate photo thumbnails in activity feed — **Owner: Sarah (future)**

## Team Morale
**9/10** — Clean feature sprint that adds emotional connection to the profile. The timeline pattern is universally understood and immediately useful.
