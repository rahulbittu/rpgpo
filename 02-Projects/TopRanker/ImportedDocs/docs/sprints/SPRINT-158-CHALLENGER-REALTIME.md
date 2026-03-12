# Sprint 158: Challenger Real-Time Feedback

**Date:** 2026-03-09
**Story Points:** 3
**Focus:** Close the challenger feedback loop — SSE broadcast on rating

---

## Mission Alignment
Challengers are head-to-head ranking battles. When a user rates a business in a challenge, the vote count should update for ALL viewers in real-time. The `challenger_updated` event was defined but never broadcast.

---

## Team Discussion

**Marcus Chen (CTO):** "The SSE event type was defined but never fired — classic dead code pattern. One line of broadcast fixes the entire challenger real-time experience."

**Sarah Nakamura (Lead Eng):** "We already had double coverage via `rating_submitted` invalidating challengers (Sprint 157), but the dedicated `challenger_updated` event means clients can distinguish between a general rating and a challenger-specific update."

**Amir Patel (Architecture):** "The broadcast is just metadata — the client already knows to invalidate `['challengers']` on both events. But having the explicit event is architecturally correct and enables future challenger-specific UI (toast, animation)."

---

## Changes

### Activate challenger_updated SSE broadcast
- **File:** `server/routes.ts:603`
- Added `broadcast("challenger_updated", { businessId })` after rating submission
- Now fires alongside `rating_submitted` and `ranking_updated`
- Challenger cards refresh via both direct event AND rating_submitted (double coverage)

---

## Test Results
- **2152 tests** across 95 files — all passing, 1.60s
- +5 new tests verifying challenger broadcast chain

---

## Google Maps Audit (Sprint 158 side finding)
- Google Maps is **fully working** on web via @googlemaps/js-api-loader
- API key properly wired through EXPO_PUBLIC_GOOGLE_MAPS_API_KEY
- Comprehensive error handling (missing key, auth failure, API disabled)
- Native fallback message: "Map view is available on web"
- **No fix needed** — this was a false alarm from user's earlier Metro cache issue
