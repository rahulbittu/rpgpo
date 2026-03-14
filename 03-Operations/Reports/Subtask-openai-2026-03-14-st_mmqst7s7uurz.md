# Subtask Output — Audit Operating Summary
## Model: gpt-4o
## Stage: audit
## Date: 2026-03-14

### Key Points from TopRanker's Technical Profile and Recent Progress

1. **Technical Profile:**
   - **Frontend:** Utilizes Expo Router with React Native, TypeScript, and React 19.
   - **Backend:** Built with Express.js 5 and a REST API.
   - **Database:** Employs PostgreSQL with 34 tables managed via Drizzle ORM.
   - **Authentication:** Implements Passport.js for local and Google OAuth.
   - **State Management:** Uses React Query.
   - **Caching:** Utilizes Redis through ioredis.
   - **Testing Framework:** Conducts testing with Vitest, covering 10,827 tests across 616 files with an average execution time of ~2.7 seconds.
   - **Source Files:** Contains 1,054 TypeScript/TSX files.
   - **Payments:** Integrated with Stripe for payment processing.
   - **Notifications:** Supports push notifications and email drip campaigns.

2. **Product Architecture Highlights:**
   - Implements a credibility-weighted voting system with tiers from New Member to Top Judge.
   - Features a Bayesian scoring engine with temporal decay for recency-weighted scores.
   - Includes a rating integrity system with mechanisms for abuse detection and anti-gaming.
   - Facilitates challenger events for head-to-head business competitions.
   - Incorporates an A/B experiment framework.
   - Provides business claims verification and GDPR deletion workflows.
   - Offers an analytics dashboard with event tracking.
   - Features a badge/gamification system with 15 perks.

3. **Market Footprint:**
   - Actively operates in 5 Texas cities: Dallas, Austin, Houston, San Antonio, and Fort Worth.
   - Currently in beta in 6 additional cities.
   - Focuses on categories such as restaurants, cafes, bars, bakeries, street food, and fast food.

4. **Governance Posture:**
   - Operates as a child office under RPGPO, which governs privacy, approvals, logging, access control, human sovereignty, and risk classification.
   - TopRanker manages its product-specific governance.
