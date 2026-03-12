# SLT Backlog Meeting — Sprint 260
**Date:** March 9, 2026
**Attendees:** Marcus Chen (CTO), Rachel Wei (CFO), Amir Patel (Architecture), Sarah Nakamura (Lead Eng), Rahul Pitta (CEO)
**Facilitator:** Marcus Chen

## Opening — CEO Statement

Rahul: "We adopted the Constitution this sprint cycle. 82 principles. The rating system IS the product. We've been building meta-systems — helpfulness voting, confidence labelers, moderation queues — when we should have been building the core loop. Best In Dallas categories are finally in the UI. Now we need to build what the Rating Integrity doc demands: visit type separation, dimensional scoring, verification boosts. That is Phase 1. Everything else is secondary."

## Agenda

### 1. Constitution Adoption Review
- 82 principles formalized in docs/CONSTITUTION.md
- Rating Integrity System saved to docs/architecture/RATING-INTEGRITY-SYSTEM.md
- Marketing Strategy saved to docs/architecture/MARKETING-STRATEGY.md
- Category Expansion framework in docs/strategy/CATEGORY-EXPANSION.md
- All 4 docs now in Claude's persistent memory

### 2. Anti-Requirement Violations
- Sprint 253: Built business-responses (owner reply to reviews) — Rating Integrity Part 10 says "DO NOT allow restaurant to respond to ratings in V1"
- Sprint 257: Built review-helpfulness (helpful/not-helpful voting) — Rating Integrity Part 10 says "DO NOT build helpful/not helpful upvote for ratings"
- **CEO Decision:** Both modules stay in codebase but are NOT exposed in production UI. They can be activated in V2 after the core rating integrity system is proven. No API routes should be publicly accessible.

### 3. Current State Assessment
- 5,151 tests across 184 files
- 11 cities: 5 active TX + 6 beta
- Best In Dallas: 15 sub-categories live in Rankings + Discover UI
- Core loop: rate → consequence → ranking works end-to-end
- Rating Integrity Phase 1 NOT started — this is the #1 priority

### 4. Sprint Roadmap 261-265

| Sprint | Focus | Constitution Principle |
|--------|-------|----------------------|
| 261 | Rating Integrity Phase 1a: Visit type selection + dimension gating | #3 Structured scoring, Rating Integrity Parts 3-4 |
| 262 | Rating Integrity Phase 1b: Score calculation engine + composite scores | Rating Integrity Part 6 |
| 263 | Rating Integrity Phase 1c: Business owner self-rating block + minimum thresholds | Rating Integrity Part 5 Layer 5, Part 6 Step 7 |
| 264 | Best In wiring: category filter → leaderboard API + rating confirmation | #47 Specificity, #4 Consequence |
| 265 | SLT Q2 Mid-Sprint Review + Arch Audit #35 | Process |

### 5. Revenue Update (Rachel Wei)
Rachel: "Pre-revenue. Focus is entirely on proving the core loop with real users. Marketing budget for Phase 1 is $500-1,000. No paid features until we have 500 active users and 1,000 ratings. Constitution #36: product-market fit before aggressive scaling."

### 6. Architecture Assessment (Amir Patel)
Amir: "The codebase is clean but we have 11+ in-memory stores. Redis migration was on the roadmap but Rating Integrity Phase 1 takes priority. In-memory stores are fine at current scale (0 users). The real architectural risk is the rating schema — we need visit_type, dimensional scores, composite_score columns before we can implement the score calculation engine."

### 7. Action Items
- [ ] Rating Integrity Phase 1a starts Sprint 261 — Sarah
- [ ] Disable business-responses and review-helpfulness routes from public access — Sprint 261 — Amir
- [ ] Schema migration plan for visit_type + dimensional scores — Sprint 261 — Marcus
- [ ] Marketing Phase 1 prep: CEO personal seed of 15 restaurants — Rahul (ongoing)

## Closing
Marcus: "The Constitution gives us clarity. Rating Integrity doc gives us the spec. Marketing Strategy gives us the go-to-market. Category Expansion gives us the gates. Four governing documents, one core loop: rate → consequence → ranking. Let's execute."
