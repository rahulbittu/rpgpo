# Retro 414: Profile Tier Progress Improvements

**Date:** 2026-03-09
**Duration:** 1 sprint cycle
**Story Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well

**Priya Sharma:** "The progress bar + milestones + perks preview turns the journey card into a complete motivation unit. Users see where they are, what's next, and why it matters — all in one card."

**Amir Patel:** "Pure functions for perks and milestones make the component easy to test and extend. Adding new milestones or perks is a one-line change. The backward-compatible props mean no breaking changes."

**Sarah Nakamura:** "profile.tsx stayed at 680 LOC — only one line changed. All the complexity lives in the leaf component. Zero test cascades. The extraction pattern continues to pay dividends."

## What Could Improve

- **Milestones are static** — getMilestones uses simple thresholds. In the future, could derive from actual rating patterns (e.g., 'add a photo to your next rating' if user has never uploaded).
- **Perks text is hardcoded** — Could be driven by TIER_WEIGHTS or other data constants for consistency.
- **No animation on progress bar** — The bar renders at its final width. Could animate from 0 like ScoreCountUp does for the credibility score.

## Action Items

- [ ] Consider animated progress bar fill in CredibilityJourney — **Owner: Amir (future)**
- [ ] Evaluate dynamic milestones based on user behavior patterns — **Owner: Sarah (future)**

## Team Morale
**8/10** — Clean enhancement sprint. The journey card now tells a complete story about progression.
