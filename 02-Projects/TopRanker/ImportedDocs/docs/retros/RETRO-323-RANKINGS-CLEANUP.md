# Retrospective — Sprint 323

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Subtraction sprints are underrated. We removed a broken feature that was creating visual clutter. The Rankings page now loads with a clean filter hierarchy instead of an overwhelming wall of chip rows."

**Amir Patel:** "The `selectedBestIn` state was a dead code path — set but never consumed by the leaderboard query. Finding and removing dead state is exactly what code health audits should catch. This was technical debt from Sprint 282-283 when the subcategory system was layered on top of the existing flow."

**Sarah Nakamura:** "54 fewer lines. 6 fewer style definitions. 1 fewer state variable. The page went from 646 LOC to 592 LOC. Every line removed is one less thing to maintain, test, and reason about."

## What Could Improve

- **Discover page (search.tsx) may have the same issue** — BestInSection uses getCategoriesByCuisine. Should audit whether that's also redundant with dish shortcuts there.
- **No visual verification** — Sprint was pure code cleanup but we should confirm on device that the layout looks right with only 3 filter rows.
- **Test coverage gap** — No integration test for the actual user flow (tap cuisine → see dish shortcuts appear). String-matching tests don't catch rendering issues.

## Action Items
- [ ] Sprint 324+: Audit Discover page BestInSection for same redundancy
- [ ] Visual verification of Rankings page with 3 filter rows
- [ ] Continue with SLT-320 roadmap (dish leaderboard entry count badges)

## Team Morale: 8/10
Subtraction sprint. Removed a broken feature that was making the Rankings page messy. Constitution principle #76: "Focus often requires subtraction."
