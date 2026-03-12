# Sprint 237 — Memphis Beta Promotion + Seed Data Validation

**Date**: 2026-03-09
**Theme**: City Expansion Pipeline + Data Integrity
**Story Points**: 8
**Tests Added**: 37 (across new + updated test files)

---

## Mission Alignment

Promoting Memphis to beta status brings our third beta market online, moving us closer
to full Tennessee coverage. The seed data validation module ensures that every city launch
starts with clean, verified data — no invalid phone formats, missing neighborhoods, or
duplicate entries slipping through to production. Trust starts with data integrity.

---

## Team Discussion

**Marcus Chen (CTO)**: "Memphis promotion is a milestone — three beta markets means our
expansion pipeline is proven. The pattern is repeatable: seed data, validate, go beta,
monitor metrics, promote to active. Each step is automated and auditable. The seed
validator is the missing piece that formalizes the 'validate' step we've been doing
manually."

**Cole Anderson (Backend Lead)**: "The seed validator is intentionally strict. Phone format
must be `(XXX)` prefix, zips must be exactly 5 digits, categories must come from our
canonical list. We've seen bad seed data cause downstream issues — wrong area codes that
break our local verification, malformed zips that confuse the map tile layer. This module
catches all of that before a single row hits the database."

**Sarah Nakamura (Lead Engineer)**: "Cascading test updates were the real work here. When
you change a city status, every test that asserts on `getCityStats`, `getPlannedCities`,
or checks Memphis status directly needs updating. We touched sprint 218 and sprint 234
test files. This is exactly why we have these integration-level assertions — they catch
stale assumptions immediately."

**Jasmine Taylor (Marketing)**: "Memphis beta means we need to start our pre-launch
marketing sequence for the Memphis market. We'll activate the beta badge in the city
picker, start collecting early adopter signups, and prep the local business outreach
campaign. Three beta cities also gives us a compelling narrative — 'expanding across the
South' — for our next press push."

**Amir Patel (Architecture)**: "The `VALID_STATE_CODES` array in the seed validator is
intentionally limited to our expansion footprint — TX, OK, LA, TN. As we add states,
we expand this list deliberately rather than accepting any US state code. This prevents
accidental seed data from markets we haven't prepared infrastructure for. The validator
also returns structured results with both errors and warnings, so the pipeline can
distinguish between hard failures and advisory notices."

**Nadia Kaur (Cybersecurity)**: "From a security perspective, the seed validator adds an
input validation layer that prevents injection of malformed data into our business
tables. Phone number regex validation and strict category allowlisting reduce the
surface area for any data-driven attacks. I'd like to see us add the validator as a
required step in the CI pipeline for any seed data changes in future sprints."

---

## Changes

### 1. Memphis Beta Promotion — `shared/city-config.ts`
- Changed Memphis status from `"planned"` to `"beta"`
- Added `launchDate: "2026-03-09"` to Memphis config
- Memphis now appears in `getBetaCities()` (3 total: OKC, NOLA, Memphis)
- `getPlannedCities()` returns only Nashville
- `getCityStats()` reflects: 5 active, 3 beta, 1 planned, 9 total

### 2. Seed Data Validation Module — `server/seed-validator.ts`
- `validateSeedBusiness(biz)` — validates individual business records (name, address, city, state, zip, phone, category, neighborhood)
- `validateSeedDataset(businesses)` — validates entire dataset with duplicate detection and diversity warnings
- `getValidCategories()` — returns canonical category list (12 categories)
- `getValidStateCodes()` — returns supported state codes (TX, OK, LA, TN)
- Uses tagged logger (`SeedValidator`) for structured logging

### 3. Cascading Test Updates
- `tests/sprint218-city-expansion-alerting.test.ts` — Memphis status `"beta"`, stats.beta=3, stats.planned=1, Memphis removed from planned assertions
- `tests/sprint234-memphis-nashville-expansion.test.ts` — Memphis status `"beta"`, getPlannedCities excludes Memphis, getCityStats updated

### 4. New Test File — `tests/sprint237-memphis-beta-seed-validation.test.ts`
- 37 tests across 5 groups: static promotion checks, runtime promotion checks, validator static, validator runtime, integration

---

## PRD Gap Status

- City expansion pipeline: Memphis now beta (3/4 Phase 3 cities online)
- Seed data validation: formalized as reusable module
- Nashville remains planned — next promotion candidate
