# Retrospective — Sprint 269
**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 5
**Facilitator:** Sarah Nakamura

## What Went Well

**Sarah Nakamura:** "The `getRankConfidence` function was already solid from the data layer. Wiring it into three UI surfaces was mechanical — import, call, render badge. The 4-tier system made the conditional styling clean: one style per tier, no complex logic."

**Amir Patel:** "Category-specific thresholds were the right call. Fine dining restaurants need 35 ratings to be 'strong' because they get fewer visits. Fast casual might only need 20. The threshold map is extensible without touching UI code."

**Jasmine Taylor:** "The 'Not enough ratings yet — be one of the first' empty state is perfect marketing copy. It turns a dead end into an invitation. This will be a WhatsApp screenshot moment: 'Hey, this place has no ratings yet, let's be the first!'"

## What Could Improve

- **No animated transitions**: The confidence badge appears/disappears abruptly when a restaurant crosses a threshold. Should animate between tiers.
- **Leaderboard doesn't filter by confidence yet**: A restaurant with 2 provisional ratings can still appear on the leaderboard (if it meets the 3-rater minimum). Consider whether provisional restaurants should be dimmed or footnoted.
- **No tooltip/explainer for confidence tiers**: Users see "Provisional" but may not know what it means. A tap-to-explain interaction would help.

## Action Items
- [ ] SLT-270 + Arch Audit #36 — Sprint 270
- [ ] Confidence tier explainer tooltip — backlog
- [ ] Animated badge transitions — backlog
- [ ] Leaderboard provisional dimming — backlog
- [ ] Challenger card confidence indicators — backlog

## Team Morale: 9/10
Constitution #9 is now fully live. Every score surface in the app communicates data confidence. Users see provisional badges, early indicators, and the empty state drives engagement. The rating system is now honest about what it knows and what it doesn't.
