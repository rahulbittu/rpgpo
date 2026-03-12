# Sprint 333: Database Migration Verification Tooling

**Date:** March 9, 2026
**Story Points:** 5
**Focus:** Prevent schema gaps — verify all Drizzle tables exist in target database

## Mission
Sprint 320 discovered that 6 dish-related tables were defined in the Drizzle schema but never pushed to Railway production — a gap that existed for 159 sprints. This sprint creates a verification script that checks all schema tables against the database and reports/fixes missing ones. This must never happen again.

## Design Reference
**The problem:** `drizzle-kit push` sometimes fails silently (interactive prompts, existing table conflicts). Tables defined in schema.ts may not exist in production.

**The solution:** `scripts/verify-schema.ts` — a standalone script that:
1. Reads all table names from a hardcoded list (matching schema.ts)
2. Queries `information_schema.tables` for existing tables
3. Reports missing tables with clear output
4. Supports `--fix` flag to run `drizzle-kit push` automatically

**Usage:**
```bash
npm run db:verify          # Check only — exit 1 if tables missing
npm run db:verify -- --fix # Check + create missing tables
```

## Team Discussion

**Marcus Chen (CTO):** "The Railway schema gap was a 159-sprint blind spot. We had dish tables in the schema, dish seeding in seed.ts, dish queries in routes.ts, but the tables didn't exist in production. This script is a gate: run it before every deploy."

**Amir Patel (Architecture):** "The script checks all 31 tables defined in shared/schema.ts. It also reports extra tables that aren't in the schema (drift detection). Credentials are masked in output. Exit code 1 on failure for CI integration."

**Sarah Nakamura (Lead Eng):** "The EXPECTED_TABLES list must be maintained manually when new tables are added. Added a test that cross-references pgTable declarations in schema.ts against the verification list."

**Nadia Kaur (Security):** "The script masks DATABASE_URL credentials in console output. Uses standard pg Pool connection. No credentials logged."

**Priya Sharma (QA):** "16 tests verifying: script exists, npm script configured, EXPECTED_TABLES defined, all schema tables covered (cross-reference test), dish tables specifically included, exit codes, credential masking."

**Rahul Pitta (CEO):** "This is infrastructure that prevents silent failures. Constitution #15: One source of truth. The schema IS the truth — the database must match it."

## Changes
- `scripts/verify-schema.ts` — NEW: Database schema verification script. Checks all 31 tables, reports missing/extra, supports --fix. 108 LOC.
- `package.json` — Added `db:verify` npm script.

## Test Results
- **253 test files, 6,277 tests, all passing** (~3.5s)
- **Server build:** 607.4kb (under 700kb threshold)
