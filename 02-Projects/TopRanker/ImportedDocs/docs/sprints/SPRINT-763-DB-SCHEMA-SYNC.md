# Sprint 763 — Railway DB Schema Sync

**Date:** 2026-03-12
**Theme:** Sync missing columns to production Railway PostgreSQL
**Story Points:** 1 (P0 — production data)

---

## Mission Alignment

- **Ship quality (Constitution #1):** The production DB was missing 5 columns (`serves_breakfast`, `serves_lunch`, `serves_dinner`, `serves_beer`, `serves_wine`), causing 500 errors on `/api/leaderboard`, `/api/trending`, and `/api/businesses/search`.

---

## Root Cause

Schema columns were added to `shared/schema.ts` but never pushed to the Railway PostgreSQL instance. The code's Drizzle ORM queries selected these columns, producing `column "serves_breakfast" does not exist` (PostgreSQL error 42703).

**The fix:** Ran `ALTER TABLE businesses ADD COLUMN IF NOT EXISTS` for all 5 missing boolean columns with `DEFAULT false`.

**Verification:** `curl https://topranker.io/api/leaderboard?city=Dallas&category=restaurant&limit=3` returned 200 with full restaurant data including the new columns.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "This is exactly the Sprint 625 pattern repeating — schema changes in code without DB migration. We need drizzle-kit push as part of the deploy pipeline, not a manual step."

**Amir Patel (Architecture):** "The ALTER TABLE approach is safer for production than drizzle-kit push, which wanted to drop the session table. For targeted fixes, manual SQL is the right call."

**Marcus Chen (CTO):** "topranker.io is live. Leaderboard, search, trending — all returning data. This was the last blocker."

**Nadia Kaur (Cybersecurity):** "All 5 columns are boolean NOT NULL DEFAULT false — no data exposure risk. The columns are informational only, not used in auth or access control."

---

## Changes

| File | Change |
|------|--------|
| Railway PostgreSQL | Added 5 columns: `serves_breakfast`, `serves_lunch`, `serves_dinner`, `serves_beer`, `serves_wine` |

---

## Tests

- **New:** 7 tests in `__tests__/sprint763-db-schema-sync.test.ts`
- **Total:** 13,144 tests across 570 files — all passing

---

## Health Metrics

| Metric | Value |
|--------|-------|
| Build size | 665.1kb / 750kb (88.7%) |
| Tests | 13,144 / 570 files |
| topranker.io | LIVE — all APIs returning 200 |
