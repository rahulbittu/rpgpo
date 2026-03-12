# Retro 157: Core Loop Consequence Visibility

**Date:** 2026-03-09
**Duration:** 1 sprint
**Story Points:** 8
**Facilitator:** Sarah Nakamura

---

## What Went Well
- **Marcus Chen:** "Finding the SSE mismatch was the highest-value discovery in 10 sprints. Real-time updates were silently broken — now they work."
- **Sarah Nakamura:** "The rating impact banner is 40 lines of client code plus a simple in-memory store. No over-engineering, just consequence visibility."
- **Jasmine Taylor:** "Users can now actually see their vote matter. Rate → see rank change → feel it. That's the core loop working end-to-end."

## What Could Improve
- The SSE mismatch has been present since query keys were refactored — we need a test to catch key mismatches earlier
- Challenger real-time updates still need more work (vote count doesn't refresh immediately on the challenger card itself)
- Native fallback polling at 15s is aggressive for mobile data

## Action Items
- [ ] **Amir:** Consider reducing native polling to 30s to save mobile data
- [ ] **Sarah:** Add challenger-specific SSE event when a vote is cast on a challenge
- [ ] **Priya:** Review impact banner on small screens (iPhone SE)

## Team Morale
**9/10** — This is what forward progress feels like. We went from recovery sprints to shipping a user-visible core loop improvement. The SSE fix alone means every ranking page refreshes in real-time after any rating. Team energy is high.
