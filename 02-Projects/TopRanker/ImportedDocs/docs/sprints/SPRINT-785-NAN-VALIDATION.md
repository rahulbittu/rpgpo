# Sprint 785 — NaN Validation on Numeric Query Params

**Date:** 2026-03-12
**Theme:** Prevent NaN from silently breaking distance calculations
**Story Points:** 1 (hardening)

---

## Mission Alignment

- **Data integrity:** NaN in distance calculations silently filters out all results
- **Defensive input handling:** Boundary validation at the route layer, not deep in the pipeline

---

## Problem

`server/routes-businesses.ts` used `parseFloat()` on user-provided query params (`lat`, `lng`, `maxDistance`) without checking for NaN. If a client sends `?lat=abc`:

1. `parseFloat("abc")` → `NaN`
2. NaN passes `!= null` check in search-result-processor
3. `haversineKm(NaN, ...)` → `NaN` distance for every result
4. `NaN <= maxDistanceKm` → `false` for every result
5. **All results silently filtered out** — empty search with no error

## Fix

Added explicit `isNaN()` guards that fall back to `undefined` for invalid numeric params, preventing NaN from entering the pipeline.

---

## Team Discussion

**Amir Patel (Architecture):** "This is a textbook boundary validation fix. parseFloat returns NaN for any non-numeric string — that's a JavaScript footgun. The isNaN guard at the route level prevents it from propagating through the entire search pipeline."

**Derek Okonkwo (Mobile):** "On iOS, location services occasionally return placeholder values during permission prompts. If those hit the API as malformed strings, this guard prevents a broken search."

**Nadia Kaur (Cybersecurity):** "Input validation at the system boundary is the right pattern. We already use sanitizeNumber in the rating flow — this applies the same principle to search params."

**Sarah Nakamura (Lead Eng):** "Silent empty results are worse than an error. At least with undefined lat/lng, we skip distance filtering and return all results — which is the correct degradation."

---

## Changes

| File | Change |
|------|--------|
| `server/routes-businesses.ts` | Added isNaN() checks on lat/lng/maxDistance parseFloat results |
| `__tests__/sprint785-nan-validation.test.ts` | 7 tests |

---

## Tests

- **New:** 7 tests in `__tests__/sprint785-nan-validation.test.ts`
- **Total:** 13,316 tests across 590 files — all passing
- **Build:** 666.2kb (max 750kb)
