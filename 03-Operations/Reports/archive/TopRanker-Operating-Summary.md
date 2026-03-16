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
- **TopRanker governs:** product philosophy, implementation style, user value, positioning, domain workflows
- **Conflict rule:** RPGPO wins on privacy/approval/access/risk; TopRanker wins on product-specific decisions
- TopRanker maintains its own **82-principle constitution** and **core values doc**

---

## 6. Documentation & Process Maturity

- 814 sprint docs, 779 retros, 139 meeting notes, 129 architecture audits
- Constitution (82 principles), architecture doc, API reference, tier semantics, rating integrity spec, tech debt tracker
- 4-phase operating protocol: Audit → Decide → Implement → Report

---

## 7. Current State Assessment

**Strengths:**
- Deep, well-tested codebase (10K+ tests, strong coverage)
- Thoughtful anti-gaming and credibility mechanics
- Rich documentation and institutional memory
- Modular architecture (shared schema, pluggable providers)

**Open Questions (from Synthesis doc):**
- What are the most important current priorities?
- What growth experiment should happen first?
- What product bottleneck matters most right now?

---

## 8. Three Highest-Leverage Next Actions

### Action 1: Define the Weekly Execution Target
**Why:** TopRanker has massive infrastructure but no visible current sprint or active priorities inside RPGPO. Defining one clear weekly goal (e.g., "improve onboarding conversion" or "launch in a new city") would convert latent capability into forward motion.
**How:** Review latest sprint docs and retros in the source repo, identify the single most impactful incomplete objective, and set it as this week's target in the dashboard state.

### Action 2: Run First Growth Experiment
**Why:** The product is live in 11 cities with a built-in A/B framework but no RPGPO-tracked growth experiment running. The cold-start problem (getting initial ratings density in new cities) is likely the binding constraint on expansion.
**How:** Use the Growth Strategist role to design one small, measurable experiment — e.g., a targeted outreach campaign in one beta city, a referral incentive test, or a local influencer partnership. Document hypothesis, metric, and timeline.

### Action 3: Produce a Technical Health Snapshot
**Why:** The codebase is large (1,054 files, 139 server files). Understanding current tech debt, test gaps, and deployment status gives Rahul a decision-quality picture of what's shippable now vs. what needs work before the next push.
**How:** Run the test suite, review TECH-DEBT.md, audit the latest architecture audit docs, and produce a one-page health report with: test pass rate, known debt items, deployment readiness, and top 3 technical risks.

---

*This summary was produced by RPGPO Board of AI (Builder/CTO + Chief of Staff roles) operating under constitutional governance. No destructive changes were made. Source: imported TopRanker repo, governance docs, and synthesis notes.*
