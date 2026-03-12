# Sprint 233: City Promotion Criteria + Password Validation Fix

**Date:** 2026-03-09
**Sprint Goal:** Automated city promotion gate system and critical password validation mismatch fix
**Story Points:** 13

---

## Mission Alignment

City expansion is central to TopRanker's growth strategy. As beta cities mature, we need an objective, data-driven promotion gate -- not ad-hoc manual decisions. Sprint 233 introduces the City Promotion Criteria system to automate the evaluation of whether a beta city (Oklahoma City, New Orleans) has met the thresholds for full active status.

Additionally, a critical bug was identified where the client-side password validation in signup.tsx required only 6 characters, while the server required 8 characters plus a digit. This mismatch caused users to enter passwords that would be accepted client-side but rejected server-side, resulting in confusing signup failures.

---

## Team Discussion

**Marcus Chen (CTO):** "The promotion criteria system is exactly the kind of operational tooling we've been lacking. Manual city launches don't scale. The threshold-based approach gives us configurable knobs -- we can adjust the bar for different market conditions without code changes. I want to see this wired into the admin dashboard by Sprint 236."

**Sarah Nakamura (Lead Engineer):** "The implementation is clean -- getPromotionStatus returns a full diagnostic with missingCriteria so admins can see exactly what a city still needs. I made sure setPromotionThresholds takes a Partial so you can update one threshold without resetting others. The password fix was straightforward but alarming -- client said 6, server said 8. We need a shared validation module to prevent this class of bugs."

**Cole Anderson (City Growth Lead):** "I set the default thresholds based on our Dallas and Austin launch data: 50 businesses, 100 members, 200 ratings, and 30 days in beta. Oklahoma City is close on businesses but still building the member base. New Orleans has strong engagement per member but needs more time. The admin routes let me check promotion status without bothering engineering."

**Jordan Blake (Compliance):** "City promotion has compliance implications -- when we go active in a new market, our terms of service and data collection notices need to reflect that geography. I want a webhook or event emitted on promotion so legal can be notified. For now, the admin manual trigger is fine since we can coordinate internally."

**Nadia Kaur (Security):** "The password mismatch was a security concern. When client validation is weaker than server validation, users get a false sense of what constitutes a valid password. They might reuse a weak 6-char password elsewhere thinking it was accepted by our system. The fix ensures both sides enforce the same policy: 8+ chars with at least one digit. The admin promotion endpoints should eventually require admin auth middleware -- noted for next sprint."

---

## Changes

### 1. City Promotion Criteria (`server/city-promotion.ts`) -- NEW
- `getPromotionThresholds()` -- returns current threshold configuration
- `setPromotionThresholds(partial)` -- updates thresholds, returns merged result
- `getPromotionStatus(city)` -- evaluates a beta city against thresholds, returns full diagnostic
- `evaluatePromotion(city)` -- boolean convenience wrapper
- `promoteCity(city)` -- mutates CITY_REGISTRY to change status from beta to active
- Default thresholds: 50 businesses, 100 members, 200 ratings, 30 days in beta
- Uses tagged logger (`CityPromotion`)
- Integrates with `getCityEngagement()` for live metrics

### 2. Password Validation Fix (`app/auth/signup.tsx`) -- BUG FIX
- **Before:** Client required 6 characters, server required 8 + digit
- **After:** Client requires 8 characters + at least one digit (matches server)
- Updated placeholder text from "At least 6 characters" to "At least 8 characters with a number"
- Error messages now clearly state both requirements

### 3. Admin Promotion Routes (`server/routes-admin-promotion.ts`) -- NEW
- `GET /api/admin/promotion-status/:city` -- check a city's promotion eligibility
- `POST /api/admin/promote/:city` -- manually promote a beta city to active
- `GET /api/admin/promotion-thresholds` -- view current thresholds
- `PUT /api/admin/promotion-thresholds` -- update thresholds
- Wired into `server/routes.ts` via `registerAdminPromotionRoutes(app)`
- Uses `wrapAsync` for async error handling

### 4. Tests (`tests/sprint233-city-promotion-password-fix.test.ts`)
- City promotion module static analysis (14 tests)
- City promotion runtime: thresholds get/set, promoteCity behavior (6 tests)
- Password validation fix: client/server parity (8 tests)
- Admin promotion routes static analysis (9 tests)
- Integration wiring verification (5 tests)

---

## Files Changed
| File | Action | Lines |
|------|--------|-------|
| `server/city-promotion.ts` | Created | ~95 |
| `server/routes-admin-promotion.ts` | Created | ~55 |
| `app/auth/signup.tsx` | Modified | placeholder text fix |
| `server/routes.ts` | Modified | import + register call |
| `tests/sprint233-city-promotion-password-fix.test.ts` | Created | ~220 |

---

## PRD Gap Status
- City expansion automation: **CLOSED** (promotion criteria system in place)
- Client/server validation parity: **CLOSED** (password rules now match)
- Admin promotion dashboard: OPEN (UI not yet built, endpoints ready)
