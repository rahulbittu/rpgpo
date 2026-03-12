# Sprint 244 — Search Ranking v2 (Reputation-Weighted)

**Date**: 2026-03-09
**Theme**: Core Algorithm — Credibility-Weighted Rankings
**Story Points**: 13
**Tests Added**: 38 (sprint244-search-ranking-v2.test.ts)

---

## Mission Alignment

TopRanker's entire value proposition rests on one claim: our rankings are trustworthy because
not all votes are equal. Until now, that claim lived in the PRD but not in the code — rankings
used simple averages. Search Ranking v2 makes the mission real. Member reputation scores now
directly influence vote weight: a rating from a Platinum-tier reviewer with a 95 reputation
carries more influence than a rating from a brand-new account. Bayesian smoothing prevents
one-rating businesses from leapfrogging established ones. Recency boost ensures stale listings
don't dominate. This is the algorithmic backbone of trust.

---

## Team Discussion

**Marcus Chen (CTO)**: "This is the most important algorithm we ship. Everything else — the UI,
the business dashboard, the challenger mode — sits on top of ranking quality. The weighted score
formula is deliberately simple: reputation factor times recency factor, Bayesian-smoothed. Simple
means auditable, which means trustworthy. We can explain to any user or regulator exactly how a
business's score was computed. The admin weight-tuning endpoints let us iterate on coefficients
without redeploying. When we go multi-city at scale, we'll add per-city weight profiles, but the
core algorithm is production-ready today."

**Amir Patel (Architecture)**: "The module is pure computation — zero DB coupling, zero side
effects beyond logger output. calculateWeightedScore takes an array of RatingInput structs and
returns numbers. rankBusinesses composes that with confidence levels and boost factor detection.
The admin routes are a thin HTTP layer with three endpoints. This is exactly the separation of
concerns we need: the algorithm doesn't know about Express, the routes don't know about
Bayesian math. When we wire this to real DB queries in the next sprint, the algorithm module
stays untouched — we just build the data layer that feeds it RatingInput arrays."

**Sarah Nakamura (Lead Engineer)**: "38 tests across four groups. The static tests verify
structural contracts — exports, logger tag, default weight values. The runtime tests cover the
full algorithmic surface: empty ratings, single rating, reputation weighting verification,
recency boost verification, Bayesian smoothing behavior, confidence level thresholds, rank
ordering, all three boost factors, immutability of getRankingWeights, and partial update
semantics for setRankingWeights. The integration tests confirm the wiring between routes.ts,
routes-admin-ranking.ts, and search-ranking-v2.ts. Every public function is exercised."

**Rachel Wei (CFO)**: "This directly impacts our competitive moat. Yelp uses opaque algorithms
that businesses can't understand. Google uses signals they won't disclose. Our approach is
radically transparent: your score is weighted by your reputation, period. That's the story we
tell investors, regulators, and users. The Bayesian smoothing is particularly important for the
business side — it prevents a single 5-star review from putting a new listing at the top,
which protects our credibility with established businesses paying for Business Pro. Trust is
revenue."

**Jasmine Taylor (Marketing)**: "The confidence levels — low, medium, high — are a marketing
goldmine. We can surface 'Verified ranking: based on 47 trusted reviews' on business cards.
The boost factors tell a story too: 'Recently active', 'Reviewed by top-rated members'. These
are trust signals that no other platform surfaces. When we build the search results UI, I want
each result card to show the confidence badge and at least one boost factor. That's how we
differentiate from Yelp's star average."

**Cole Anderson (City Growth)**: "The ratingCountFloor of 10 for 'high' confidence is calibrated
for our current city launch strategy. In Dallas and Austin, our top businesses have 15-30 ratings,
so 10 is the right threshold. As we expand to Nashville and beyond, we may need per-city thresholds
since new cities start with fewer ratings. The admin weight-tuning endpoint lets us adjust this
without code changes, which is crucial for city-by-city rollout. I also like the authority_rated
boost — it rewards businesses that attract our most engaged community members."

---

## Changes

### New Files
- `server/search-ranking-v2.ts` — Reputation-weighted ranking algorithm: calculateWeightedScore, getConfidenceLevel, rankBusinesses, getRankingWeights, setRankingWeights
- `server/routes-admin-ranking.ts` — 3 admin API endpoints for ranking weight management
- `tests/sprint244-search-ranking-v2.test.ts` — 38 tests across 4 groups

### Modified Files
- `server/routes.ts` — Import and register admin ranking routes

---

## API Endpoints Added

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/admin/ranking/weights` | Current ranking weight configuration |
| PUT | `/api/admin/ranking/weights` | Update ranking weights (partial) |
| GET | `/api/admin/ranking/confidence-levels` | Confidence level definitions with thresholds |

---

## Algorithm Overview

### Weighted Score Formula

For each rating:
```
repFactor = 0.5 + (reputationScore / 100) * reputationWeight
recencyFactor = 1 + (max(0, 30 - daysAgo) / 30) * recencyBoost
weight = repFactor * recencyFactor
```

Weighted average is then Bayesian-smoothed:
```
bayesian = (weightedAvg * n + prior * strength) / (n + strength)
```

### Default Weights

| Parameter | Default | Description |
|-----------|---------|-------------|
| reputationWeight | 0.6 | Reputation influence on vote weight |
| recencyBoost | 0.15 | Boost for ratings within 30 days |
| ratingCountFloor | 10 | Minimum ratings for "high" confidence |
| bayesianPrior | 3.5 | Prior average for Bayesian smoothing |
| bayesianStrength | 5 | Virtual prior rating count |

### Boost Factors

| Factor | Trigger |
|--------|---------|
| high_volume | ratingCount >= ratingCountFloor |
| authority_rated | Any rating from member with reputation >= 80 |
| recent_activity | Any rating within last 7 days |

---

## PRD Gaps Addressed

- Credibility-weighted ranking algorithm (core product differentiator)
- Admin-tunable ranking parameters
- Confidence level system for ranking transparency
- Boost factor detection for search result UI signals
