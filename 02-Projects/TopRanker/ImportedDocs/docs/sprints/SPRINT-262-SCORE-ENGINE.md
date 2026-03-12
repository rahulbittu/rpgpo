# Sprint 262 — Score Calculation Engine (Rating Integrity Phase 1b)

**Date**: 2026-03-09
**Theme**: Rating Integrity Phase 1b
**Story Points**: 8
**Tests Added**: 5194 total passing

---

## Mission Alignment

Built the exact formula that computes every number on the leaderboard. Rating Integrity Part 6 implemented in `shared/score-engine.ts`. The math is the product.

---

## Changes

- **`computeComposite`**: visit-type-weighted dimension scores
- **`computeEffectiveWeight`**: credibility x verification boost x gaming multiplier
- **`computeDecayFactor`**: exponential decay (lambda=0.003, ~50% at 7.5 months)
- **`computeRestaurantScore`**: weighted average with per-visit-type breakdown
- **`meetsLeaderboardThreshold`**: 3 raters + 1 dine-in + weighted sum >= 0.5
- **Tiebreaker**: score diff > 0.05 wins, else more weighted raters
- **Food ALWAYS has highest weight**: 50% (dine-in), 60% (delivery), 65% (takeaway)

---

## Team Discussion

**Sarah Nakamura (Lead Eng)**: "43 tests covering every step of the calculation. The math is the product."

**Amir Patel (Architecture)**: "Shared module — can be used server-side for ranking and client-side for display. Clean separation."

**Marcus Chen (CTO)**: "Temporal decay with lambda=0.003 means a 2-year-old rating only counts 11%. Restaurants that improved recently will rise."

**Rachel Wei (CFO)**: "The leaderboard threshold (3 raters, 1 dine-in, weighted sum >= 0.5) prevents gaming through fake accounts. 5 community-tier accounts only sum to 0.50 — barely meets threshold."

**Nadia Kaur (Cybersecurity)**: "Gaming multiplier flows through the same pipeline. A flagged rating at 0.05x is mathematically irrelevant without being deleted."

**Derek Washington (Revenue)**: "Score breakdown by visit type is a premium data point. 'This place is better dine-in than delivery' is information users will pay for."

---

## Tests

- 5194 passing
- Core loop: YES — this IS rate -> consequence -> ranking made mathematical
