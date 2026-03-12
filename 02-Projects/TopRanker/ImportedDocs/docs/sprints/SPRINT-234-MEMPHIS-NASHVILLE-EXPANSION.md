# Sprint 234: Memphis + Nashville Expansion

**Date:** 2026-03-09
**Sprint Duration:** 1 day
**Story Points:** 13
**Owner:** Cole Anderson (City Growth Lead)

---

## Mission

Expand TopRanker's geographic footprint into Tennessee with Memphis and Nashville seed data, city configuration entries, and a reusable expansion pipeline module to track city lifecycle stages.

---

## Team Discussion

**Marcus Chen (CTO):** Tennessee is our first out-of-Texas-and-adjacent expansion. Memphis and Nashville give us two very different market profiles — Memphis is smaller, BBQ-heavy, music-driven, while Nashville is booming with a younger food scene. The expansion pipeline module is the right abstraction here. We need a repeatable playbook, not ad-hoc city launches.

**Cole Anderson (City Growth):** I've been working with local contacts in both cities. Memphis has a tight-knit food community centered on Beale Street and Cooper-Young. Nashville's scene is more spread out — Broadway for tourists, East Nashville and 12South for locals. Ten businesses each gives us a solid seed to test market fit before we ramp up outreach.

**Sarah Nakamura (Lead Eng):** From an engineering perspective, the expansion pipeline module gives us in-memory stage tracking with transition history. This is intentionally lightweight — no DB dependency — so we can iterate fast. When we're ready to persist this, we migrate to Drizzle. The test suite covers all stage transitions, edge cases, and history tracking at 40+ tests.

**Amir Patel (Architecture):** I reviewed the module design. The stage progression (seed -> planned -> beta -> active) maps cleanly to our city-config status field. The pipeline module tracks transitions with timestamps and optional notes, which gives us audit trail capability without database overhead. The tagged logger pattern keeps observability consistent.

**Jasmine Taylor (Marketing):** Memphis and Nashville are both strong brand markets for us. Memphis has the BBQ and blues angle — very authentic, very trust-driven. Nashville has the hot chicken phenomenon and a massive tourist flow. When we go beta in these cities, I want to lead with "locals trust TopRanker" messaging. The seed businesses we picked are all genuine local institutions, not chains.

---

## Changes

### 1. Memphis Seed Data (`server/seed-cities.ts`)
- Added `MEMPHIS_BUSINESSES` array with 10 businesses
- Neighborhoods: Beale Street, Cooper-Young, Midtown Memphis, Downtown Memphis
- Categories: restaurant, bakery, cafe, bar, street_food, fast_food
- Area code: (901), addresses with "Memphis, TN"
- Notable: Central BBQ, Gus's Fried Chicken, Rendezvous, Blues City Cafe

### 2. Nashville Seed Data (`server/seed-cities.ts`)
- Added `NASHVILLE_BUSINESSES` array with 10 businesses
- Neighborhoods: Broadway, East Nashville, 12South, The Gulch
- Categories: restaurant, bakery, cafe, bar, street_food, fast_food
- Area code: (615), addresses with "Nashville, TN"
- Notable: Prince's Hot Chicken, Hattie B's, Biscuit Love, Robert's Western World

### 3. City Config (`shared/city-config.ts`)
- Added Memphis: state TN, timezone America/Chicago, coords (35.1495, -90.049), planned, minBusinesses 30
- Added Nashville: state TN, timezone America/Chicago, coords (36.1627, -86.7816), planned, minBusinesses 40
- Total cities: 9 (5 active, 2 beta, 2 planned)

### 4. Expansion Pipeline (`server/expansion-pipeline.ts`)
- New module tracking city expansion stages: seed -> planned -> beta -> active
- Functions: getExpansionPipeline, getCityStage, setCityStage, advanceCityStage, getExpansionHistory, getAllExpansionHistory, clearExpansionHistory, getExpansionStats
- In-memory store with StageTransition records (city, fromStage, toStage, timestamp, note)
- Tagged logger: log.tag("ExpansionPipeline")

### 5. Test Updates
- Updated `sprint218-city-expansion-alerting.test.ts`: Memphis/Nashville in planned checks, stats.planned=2, stats.total=9
- Updated `sprint224-okc-seed-email-tracking.test.ts`: "8 cities" reference
- Updated `sprint229-nola-seed-outreach-history.test.ts`: "8 cities" reference
- New `sprint234-memphis-nashville-expansion.test.ts`: 40+ tests covering seed data, city config, pipeline runtime, integration wiring

---

## PRD Gap Status

- Tennessee expansion was identified in SLT backlog (Sprint 150) as Phase 3 target
- Memphis and Nashville enter as "planned" — will promote to beta once outreach confirms 30/40 businesses respectively
- Expansion pipeline module provides trackable lifecycle for future city launches
