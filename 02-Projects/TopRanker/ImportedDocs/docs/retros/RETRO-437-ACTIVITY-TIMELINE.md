# Retro 437: Profile Activity Timeline

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Clean feature delivery — 344 LOC for a unified timeline that merges 3 data sources. The date grouping gives the timeline a polished feel without overengineering. Bookmark-to-rating feedback loop is a subtle but valuable engagement mechanism."

**Priya Sharma:** "Type badges (Rated/Saved/Earned) with score-based coloring make the timeline scannable. The summary counts in the header give users a quick activity snapshot. Design review was straightforward — consistent with existing ActivityFeed patterns."

**Amir Patel:** "Profile.tsx grew only 9 LOC (+1.3%). The component is self-contained — no new contexts, hooks, or API calls. Pure function architecture (buildEvents) makes it easy to test and extend with new event types later."

## What Could Improve

- **No filter by event type** — Users can't filter to see only ratings or only bookmarks. Should consider adding filter chips in a future sprint.
- **Achievement timestamps may be approximate** — `earnedAt` is set when badges are evaluated, not when the qualifying action happened. Could lead to slightly out-of-order events.
- **Old ActivityFeed is dead code** — Still exists but no longer rendered. Should remove in a cleanup sprint or repurpose.

## Action Items

- [ ] Begin Sprint 438 (Business page photo gallery v2) — **Owner: Sarah**
- [ ] Consider timeline filter chips in future UX sprint — **Owner: Priya**
- [ ] Audit ActivityFeed.tsx for removal or repurposing — **Owner: Amir**

## Team Morale
**8/10** — Second user-facing feature in a row (after search relevance). Team feels productive with the balanced roadmap.
