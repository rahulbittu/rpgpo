# Sprint 257: Review Helpfulness Voting + Constitution + Strategy Docs

**Date:** March 9, 2026
**Story Points:** 13
**Sprint Lead:** Sarah Nakamura

---

## Summary

Sprint 257 delivered a review helpfulness voting system, formalized the TopRanker Constitution (82 principles), and saved three governing documents to the repository. The helpfulness voting system feeds directly into reputation-v2's `helpful_votes` signal (weight 0.10), strengthening the core credibility loop. A core loop audit was conducted before feature work began, identifying 3 P0 issues for Sprint 258.

### Deliverables

- **Review helpfulness voting system** (`server/review-helpfulness.ts`) with Wilson score lower bound calculation
- **7 API endpoints** for helpfulness votes (`routes-review-helpfulness.ts`) — cast vote, retract, get counts, get user votes, top helpful reviews, helpful ratio, bulk counts
- **Reputation-v2 integration** — `helpful_votes` signal at weight 0.10 feeds into credibility weighting
- **TopRanker Constitution** saved to `docs/CONSTITUTION.md` — 82 principles governing all product decisions
- **Marketing Strategy** saved to `docs/architecture/MARKETING-STRATEGY.md` — Indian Dallas First GTM plan
- **Rating Integrity System** spec saved to `docs/architecture/RATING-INTEGRITY-SYSTEM.md`
- **ARCHITECTURE.md** updated with references to all governing documents
- **Core loop audit** identified 3 P0 issues to fix in Sprint 258

### Files Changed (8)

| File | Status | Description |
|------|--------|-------------|
| `server/review-helpfulness.ts` | NEW | Helpfulness voting logic, Wilson score lower bound |
| `server/routes-review-helpfulness.ts` | NEW | 7 API endpoints for helpfulness votes |
| `server/review-helpfulness.test.ts` | NEW | Tests for helpfulness voting system |
| `docs/CONSTITUTION.md` | NEW | 82 principles — the TopRanker Constitution |
| `docs/architecture/MARKETING-STRATEGY.md` | NEW | Indian Dallas First GTM strategy |
| `docs/architecture/RATING-INTEGRITY-SYSTEM.md` | NEW | Anti-gaming and integrity layers spec |
| `docs/ARCHITECTURE.md` | MODIFIED | References to governing documents added |
| `shared/credibility.ts` | MODIFIED | helpful_votes signal integration |

### Tests

- **5085 tests** passing across **182 files**
- New tests cover vote casting, retraction, Wilson score calculation, bulk counts, and edge cases

---

## Team Discussion

### Marcus Chen (CTO)

> The Constitution adoption is the most important thing we've done in months. We've had implicit principles guiding development, but having 82 explicit principles means every PR can be evaluated against a shared standard. I want to see "Constitution #N" references in every sprint doc going forward. On the audit side, the ARCHITECTURE.md schema drift is my P0 — four missing tables is unacceptable for a document that's supposed to be the source of truth. I'll own that fix in Sprint 258.

### Jasmine Taylor (Marketing)

> Having the Marketing Strategy formalized in `docs/architecture/MARKETING-STRATEGY.md` means our GTM plan is no longer locked in slide decks. Indian Dallas First is the beachhead — we've got density, community trust dynamics, and a population that's deeply engaged with local business reviews. The Constitution's principle around "rankings must reflect local reality, not aggregated averages" (Principle #37) directly supports our hyper-local launch strategy. Every feature we build should ask: does this work for a family in Plano deciding where to eat Saturday night?

### Amir Patel (Architecture)

> The core loop audit surfaced three P0s that we cannot ship around. First, `confidenceLevel` is computed in reputation-v2 but never exposed in the API — our frontend trust badges are decorative, not data-driven. Second, the tier namespace collision between reputation-v2's 6-tier system and production's 4-tier system means we could assign a user "Gold" in one path and "Silver" in another. Third, ARCHITECTURE.md is missing 4 tables that we added over the last 15 sprints. These aren't nice-to-haves — they're structural integrity issues. Constitution #12 says "audit before you build." We audited. Now we fix.

### Sarah Nakamura (Lead Eng)

> The Wilson score lower bound pattern was already proven in `server/experiment-tracker.ts` for A/B experiment confidence intervals. Reusing it for review helpfulness was clean — same math, different domain. The lower bound ensures that a review with 3 helpful votes out of 3 doesn't outrank a review with 95 out of 100. This is exactly the kind of statistical rigor the Constitution demands (Principle #64: "Every ranking must be defensible with math, not vibes"). The 7 endpoints follow our standard REST patterns, and the test coverage is solid.

### Nadia Kaur (Security)

> The Rating Integrity System doc (`docs/architecture/RATING-INTEGRITY-SYSTEM.md`) formalizes our anti-gaming layers in one place. Previously, our defenses were scattered across middleware, rate limiters, and ad-hoc checks. Now we have a documented layered defense: velocity limits, device fingerprinting, review age weighting, cross-reference anomaly detection, and the new helpfulness voting as a community-driven quality signal. Constitution Principle #71 — "Trust is earned through transparency; gaming is defeated through layered defense" — is now backed by architecture, not just intent.

### Jordan Blake (Compliance)

> The Constitution creates an accountability framework that goes beyond code review. When a stakeholder asks "why does this business rank #3 instead of #1?", we can point to specific principles and the math behind them. This is critical for regulatory conversations — the FTC's endorsement guidelines require that rankings reflect genuine consumer experience. Constitution Principle #1 ("Rankings must be trustworthy or they are worthless") and Principle #4 ("No pay-to-play, ever") are not just ideals — they're compliance commitments. I want to schedule a full team walkthrough in Sprint 259 to make sure every engineer can articulate why these principles matter.

---

## Core Loop Question

**Did this sprint strengthen rate -> consequence -> ranking?**

**YES.** Helpfulness voting directly feeds credibility weighting, creating a virtuous data loop. When users vote reviews as helpful, those reviewers gain `helpful_votes` signal weight (0.10) in reputation-v2, which increases their credibility score, which increases the weight of their future ratings in the ranking algorithm. This is Constitution #64 in action: defensible math creating a self-reinforcing trust system.

---

## P0 Audit Findings (Sprint 258 Fixes)

1. **Confidence not in API** — `confidenceLevel` computed but not returned in leaderboard, search, or business endpoints
2. **Tier namespace collision** — reputation-v2 6-tier vs production 4-tier creates inconsistent user-facing tier assignments
3. **ARCHITECTURE.md schema drift** — 4 tables added in recent sprints not reflected in the schema section

Constitution adoption means every sprint must now ask: "Did this strengthen rate -> consequence -> ranking?"
