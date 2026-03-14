# RPGPO Builder Prompt — Manual Execution Required
## Check for Missing Indexes
## Stage: audit
## Reason: Claude CLI had no output for 180s (hung)
## Duration: 180s
## Output received: 0 bytes, 1 lines
## Working Directory: /Users/rpgpo/Projects/RPGPO/02-Projects/TopRanker/source-repo
## Target Files: 03-Operations/Reports/TopRanker-Operating-Summary.md

Examine the database schema and identify any tables that may benefit from additional indexes.

## Reference Files

### 03-Operations/Reports/TopRanker-Operating-Summary.md
# TopRanker Operating Summary
## RPGPO Flagship Mission Report
### Generated: 2026-03-12

---

## 1. What TopRanker Is

TopRanker is a community-ranked local business leaderboard. Users rate restaurants, cafes, bars, bakeries, street food, and fast food using a **credibility-weighted voting system** — higher-credibility members have more influence on rankings. Live challenger events let businesses compete head-to-head.

**Core loop:** Rate → Consequence → Ranking (every rating shifts the leaderboard).

---

## 2. Technical Profile

| Dimension | Detail |
|-----------|--------|
| Frontend | Expo Router (React Native), TypeScript, React 19 |
| Backend | Express.js 5, REST API |
| Database | PostgreSQL, 34 tables via Drizzle ORM |
| Auth | Passport.js (local + Google OAuth) |
| State | React Query |
| Cache | Redis (ioredis) |
| Testing | Vitest — 10,827 tests across 616 files (~2.7s) |
| Source files | 1,054 TypeScript/TSX |
| Payments | Stripe (pluggable) |
| Notifications | Push + email drip campaigns |

---

## 3. Product Architecture Highlights

- **Credibility tiers:** New Member → Regular → Trusted → Top Judge (vote weights 0.10x–1.00x)
- **Bayesian scoring engine** with temporal decay (recency-weighted)
- **Rating integrity system** with abuse detection and anti-gaming logic
- **Challenger events** — head-to-head business competition
- **A/B experiment framework** baked in
- **Business claims verification** flow
- **GDPR deletion** workflows
- **Analytics dashboard** and event tracking
- **Badge/gamification system** (15 perks)

---

## 4. Market Footprint

- **Active:** 5 Texas cities (Dallas, Austin, Houston, San Antonio, Fort Worth)
- **Beta:** 6 additional cities
- Category focus: restaurants, cafes, bars, bakeries, street food, fast food

---

## 5. Governance Posture

TopRanker operates as a **child office** under RPGPO:
- **RPGPO governs:** privacy, approvals, logging, access control, human sovereignty, risk classification
- **TopRanker governs:** produc

