# Sprint 771 — API URL Consistency

**Date:** 2026-03-12
**Theme:** Fix all API URL references to use topranker.io
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **Single source of truth (Constitution #15):** Multiple files referenced `topranker.com` as the API URL, but the live production domain is `topranker.io`.

---

## Problem

`lib/app-env.ts` had `getApiBaseUrl()` returning `https://topranker.com` for production and `https://staging.topranker.com` for preview. Neither domain is configured. The live domain is `topranker.io`.

## Fix

Updated both production and preview URLs to `https://topranker.io`.

---

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Three separate URL configurations (eas.json, query-client.ts, app-env.ts) — we've now fixed all three to use topranker.io."

**Marcus Chen (CTO):** "The topranker.com domain is registered but not configured. Until we set up DNS for it, everything should point to topranker.io."

---

## Changes

| File | Change |
|------|--------|
| `lib/app-env.ts` | Production and preview URLs → `https://topranker.io` |

---

## Tests

- **New:** 7 tests in `__tests__/sprint771-api-url-consistency.test.ts`
- **Total:** 13,196 tests across 578 files — all passing
