# Sprint 554: Business Hours Owner Update — Claimed Owner Hours Editing

**Date:** 2026-03-10
**Story Points:** 5
**Status:** Complete
**Tests:** 30 new (10,415 total across 443 files)

## Mission

Claimed business owners need to update their operating hours. The schema already has `openingHours` (jsonb), `isOpenNow`, and `hoursLastUpdated` fields, but no owner-facing edit endpoint or UI existed. This sprint adds a PUT endpoint for hours updates, an API client function, and a HoursEditor component in the owner dashboard.

## Team Discussion

**Marcus Chen (CTO):** "Hours accuracy is table stakes for a business listing. Letting owners self-serve their hours reduces our manual data entry burden and improves trust. The owner verification check ensures only claimed business owners can edit."

**Amir Patel (Architecture):** "The endpoint follows our ownership pattern: auth → verify ownerId match → update. No new schema changes needed — openingHours and hoursLastUpdated already exist. Build went from 707.1→708.7kb, minimal impact."

**Sarah Nakamura (Lead Eng):** "7 threshold redirections this sprint — businesses.ts (×4), api.ts (×2), dashboard.tsx (×1). The redirect volume is high because multiple governance sprints track these files. The centralized threshold config from Retro 550 would reduce this."

**Rachel Wei (CFO):** "Self-serve hours editing is a Business Pro feature driver. Owners who claim their business and update hours are more likely to convert to the $49/mo Pro plan."

**Cole Richardson (City Growth):** "Hours data quality varies by city. Irving/Plano restaurants often have accurate Google Places hours, but beta city data can be stale. Owner updates fix that gap."

**Jasmine Taylor (Marketing):** "The owner dashboard is now more actionable — analytics, hours, QR code. Each feature gives owners a reason to claim and return to their dashboard."

**Nadia Kaur (Security):** "The ownership check in updateBusinessHours compares ownerId at the storage layer, not just at the route level. Defense in depth — even if someone bypasses the route auth, the storage function rejects non-owners."

## Changes

### Server — Hours Update Endpoint (`server/routes-owner-dashboard.ts` — 57→81 LOC)
- `PUT /api/owner/businesses/:businessId/hours` — requireAuth + wrapAsync
- Validates: auth token, openingHours object, periods array if present
- Returns 401 (no auth), 400 (bad body), 403 (not owner), 200 (success + timestamp)
- Logs update via OwnerDashboard logger

### Server — Storage Function (`server/storage/businesses.ts` — 584→599 LOC)
- `updateBusinessHours(businessId, ownerId, openingHours)` → boolean
- Verifies ownerId matches business.ownerId before update
- Sets openingHours (jsonb) and hoursLastUpdated (timestamp)

### Client — API Function (`lib/api.ts` — 678→691 LOC)
- `HoursUpdate` interface: weekday_text + periods
- `updateBusinessHours(businessId, openingHours)` → PUT request

### Client — HoursEditor Component (`app/business/dashboard.tsx` — 489→569 LOC)
- `HoursEditor` component with DAY_NAMES constant (Sun-Sat)
- Edit/Save toggle with create-outline/checkmark icons
- TextInput for each day in edit mode, text display otherwise
- useMutation with invalidateQueries on success
- Alert feedback on save/error, Cancel button
- Rendered in overview tab after Pro card
- 9 new styles: hoursCard, hoursHeader, hoursRow, hoursInput, etc.

### Test Redirections (7 total)
- businesses.ts: sprint498, sprint500, sprint505, sprint549 — 600→620
- api.ts: sprint524 (680→700), sprint548 (690→700)
- dashboard.tsx: sprint532 (500→580)

## Test Summary

- `__tests__/sprint554-hours-update.test.ts` — 30 tests
  - Server route: PUT endpoint, requireAuth, body validation, periods array check, 403 on non-owner, success response, logging
  - Storage: function export, ownerId verify, fields updated, boolean return
  - Client API: HoursUpdate interface, weekday_text + periods, PUT method
  - Dashboard UI: HoursEditor, DAY_NAMES, edit toggle, useMutation, TextInput, cancel, success alert, query invalidation, styles, rendered in overview
  - Storage index: re-export
  - File health: dashboard <580, routes <90, api <700, build <715kb
