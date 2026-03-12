# Retro 639: Proximity Signal

**Date:** 2026-03-11
**Duration:** 15 min
**Points:** 3
**Facilitator:** Sarah Nakamura

## What Went Well
- **Sarah Nakamura:** "Clean algorithm addition. The decay curve feels natural and avoids over-penalizing distant businesses."
- **Marcus Chen:** "8% weight is conservative — proximity enhances but doesn't dominate. A 5-star restaurant 10km away still outranks a 3-star one next door."
- **Amir Patel:** "All 7 signals now sum correctly. Weight rebalancing was proportional."

## What Could Improve
- Need to wire userLocation from the frontend search request to the server-side search handler.
- Should test with real Dallas coordinates to validate the decay curve feels right.

## Action Items
- [ ] Wire user location from search.tsx → API request → search handler → SearchContext (Owner: Sarah)
- [ ] Verify proximity doesn't over-boost mediocre nearby restaurants vs. excellent distant ones (Owner: Priya)

## Team Morale
8/10 — Proximity is a meaningful search improvement. Algorithm work is satisfying when it has clear user benefit.
