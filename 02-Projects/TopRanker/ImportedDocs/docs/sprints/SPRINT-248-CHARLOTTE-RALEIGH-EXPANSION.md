# Sprint 248 — Charlotte/Raleigh NC Expansion + Seed Data

**Date**: 2026-03-09
**Theme**: North Carolina Market Expansion
**Story Points**: 8
**Tests Added**: 30 (sprint248-charlotte-raleigh-expansion.test.ts)

---

## Mission Alignment

Expanding into Charlotte and Raleigh brings TopRanker to its first East Coast / Eastern Time Zone markets. North Carolina's food scenes are thriving and underserved by trust-weighted ranking systems. Charlotte's South End and NoDa districts and Raleigh's Warehouse District and Glenwood South are ideal for credibility-weighted discovery.

---

## Team Discussion

**Marcus Chen (CTO)**: "This is our first expansion outside Central Time. Adding America/New_York timezone support means our scheduling systems and freshness calculations need to account for the offset. The seed data and city config are straightforward, but downstream we need to verify that tier recalculation cron jobs handle ET correctly."

**Cole Anderson (Backend Lead)**: "I built the Charlotte and Raleigh seed arrays following our established pattern -- 10 businesses each, covering restaurant, cafe, bar, bakery, and bbq categories. Charlotte leans heavy on BBQ (Midwood Smokehouse, Mac's Speed Shop) while Raleigh has the James Beard scene (Beasley's, Poole's Diner). Both cities have distinct neighborhood identities that map well to our discovery UX."

**Sarah Nakamura (Lead Engineer)**: "Cascading test updates were the biggest risk here. Four existing test files referenced '8 cities' or had stats assertions that needed updating. I read every test file before modifying to make sure we caught all the cascade points. The new test file covers 30 cases across seed data validation, city config, seed validator, and integration wiring."

**Jasmine Taylor (Marketing)**: "Charlotte is the 15th largest US city and Raleigh-Durham is one of the fastest growing metros. From a growth perspective, these are high-value expansion targets. The food scenes are also very different from our Texas/Oklahoma/Louisiana/Tennessee base -- more East Coast influence, strong farm-to-table movement, and a booming brewery culture."

**Amir Patel (Architecture)**: "Adding NC to the seed validator's VALID_STATE_CODES was essential -- without it, any future validation runs would reject Charlotte and Raleigh businesses. The planned status is correct for now; we'll promote to beta once we have real business owner signups in those markets."

---

## Changes

### server/seed-cities.ts
- Added `CHARLOTTE_BUSINESSES` array (10 businesses): Midwood Smokehouse, Haberdish, Optimist Hall, The Asbury, Not Just Coffee, Mac's Speed Shop, Amelie's French Bakery, The Broken Spoke, Leah & Louise, Sunflour Baking Company
- Added `RALEIGH_BUSINESSES` array (10 businesses): Beasley's Chicken + Honey, Poole's Diner, The Pit Authentic Barbecue, Brewery Bhavana, Jolie, Sitti, Videri Chocolate Factory, La Farm Bakery, Clyde Cooper's Barbecue, Hummingbird
- Updated `ALL_CITY_BUSINESSES` spread to include both new arrays
- Updated console.log from "8 cities" to "10 cities"

### shared/city-config.ts
- Added Charlotte entry: state NC, timezone America/New_York, status planned, minBusinesses 40
- Added Raleigh entry: state NC, timezone America/New_York, status planned, minBusinesses 30

### server/seed-validator.ts
- Added "NC" to VALID_STATE_CODES array

### Cascading Test Updates
- `tests/sprint218-city-expansion-alerting.test.ts`: planned count 0->2, total 9->11, Charlotte+Raleigh in getPlannedCities
- `tests/sprint234-memphis-nashville-expansion.test.ts`: "8 cities"->"10 cities", planned 0->2, total 9->11
- `tests/sprint224-okc-seed-email-tracking.test.ts`: "8 cities"->"10 cities"
- `tests/sprint229-nola-seed-outreach-history.test.ts`: "8 cities"->"10 cities"

### New Test File
- `tests/sprint248-charlotte-raleigh-expansion.test.ts` — 30 tests across 5 describe blocks

---

## PRD Gap Status

- NC expansion was on the Phase 4 roadmap -- now seeded and configured as planned status
- Next step: business owner outreach in Charlotte and Raleigh markets before promoting to beta
