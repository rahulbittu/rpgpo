# Sprint 162: TypeScript Strict Mode — Zero Server Errors

**Date:** 2026-03-09
**Story Points:** 5
**Focus:** Fix all 11 server-side TypeScript errors

---

## Mission Alignment
Type safety prevents runtime bugs. Every `as any` or type mismatch is a potential crash in production. Fixing these strengthens the core loop's reliability.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "11 server-side TS errors down to zero. The biggest win is fixing `parsed.data.score` — the schema moved to q1Score/q2Score/q3Score but the sanitization line was still using the old property name."

**Amir Patel (Architecture):** "The experiment routes were sync functions wrapped in wrapAsync (which expects async). Three `async` keywords added, three type errors gone."

**Marcus Chen (CTO):** "The tier-staleness id type was `number` when the schema uses `string`. This could have caused silent data loss in the staleness checker."

---

## Changes

### Rating Sanitization Fix
- **File:** `server/routes.ts:585-587`
- Changed `parsed.data.score` → sanitize q1Score, q2Score, q3Score individually
- Fixed broadcast payload: removed hardcoded `city: "Dallas"`, use businessId

### Experiment Route Type Fixes
- **File:** `server/routes-experiments.ts:123,140,184`
- Added `async` to 3 sync handlers wrapped in wrapAsync

### Admin Route Type Fix
- **File:** `server/routes-admin.ts:160`
- Cast `req.params.id` to string for webhook replay

### Tier Staleness Type Fix
- **File:** `server/tier-staleness.ts:128`
- Changed return type `id: number` → `id: string` to match schema

### Members Pioneer Query Fix
- **File:** `server/storage/members.ts:152,168`
- Fixed QueryResult destructuring for db.execute result

### Server Response-Time Type Fix
- **File:** `server/index.ts:347`
- Fixed res.end override type casting

---

## Test Results
- **2171 tests** across 97 files — all passing, 1.63s
- Updated 2 tests that depended on old broadcast payload format

---

## TypeScript Status
- **Server errors:** 11 → 0 ✅
- **Test/lib errors:** ~130 remaining (mostly test files + React Native type quirks)
- **CI impact:** Server builds cleanly with `tsc --noEmit` filtering server/ only
