# Retro 573: Tier Progress Notification

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "The component is entirely self-contained — all tier logic, progress calculation, and null guards are internal. profile.tsx grew by only 7 lines. The PROXIMITY_THRESHOLD constant makes it easy to tune when we want the notification to appear."

**Rachel Wei:** "The notification directly reinforces the core loop behavior. Users who see 'Almost Trusted!' and '42 points away from 0.70x influence' have a concrete goal to work toward. This is gamification done right — transparent, not manipulative."

**Amir Patel:** "No new API calls, no new queries. The component computes everything from props already available on the profile page. Zero backend cost for a high-engagement feature."

## What Could Improve

- **No persistence of dismiss state** — If a user dismisses the notification, it reappears on next mount. Could store dismissal in AsyncStorage with a cooldown (show again after 7 days or next tier change).
- **No A/B test on proximity threshold** — The 0.60 threshold is a best guess. Should experiment with 0.50 vs 0.70 to find the sweet spot.
- **Tip rotation is deterministic** — Based on totalRatings mod tips.length. Could be more dynamic based on which action would actually yield the most points.

## Action Items

- [ ] Sprint 574: Dish vote streak tracking — **Owner: Sarah**
- [ ] Consider AsyncStorage dismiss persistence (future) — **Owner: Amir**
- [ ] A/B test proximity threshold when experiment framework supports it — **Owner: Sarah**

## Team Morale
**9/10** — Clean feature sprint with clear product value. The repo truth audit before this sprint was satisfying — docs now match reality. This is the kind of sprint where engineering and product alignment feels natural.
