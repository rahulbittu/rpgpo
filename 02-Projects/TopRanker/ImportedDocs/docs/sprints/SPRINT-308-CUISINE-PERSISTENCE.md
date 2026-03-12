# Sprint 308: Cuisine Filter Persistence Across Sessions

**Date:** March 9, 2026
**Story Points:** 2
**Focus:** Persist cuisine filter selection to AsyncStorage on both Rankings and Discover

## Mission
When a user selects "Indian" cuisine and navigates away or closes the app, the filter resets on return. This is frustrating for users who consistently browse one cuisine. Persist the selection to AsyncStorage so it restores on mount.

## Team Discussion

**Marcus Chen (CTO):** "Returning users who browse Indian food shouldn't have to re-select 'Indian' every session. This is a basic UX expectation — filters should be sticky. One AsyncStorage key per surface."

**Amir Patel (Architecture):** "Separate keys: `rankings_cuisine` and `discover_cuisine`. Users might filter differently on each tab — Italian on Rankings, Indian on Discover. The wrapper function saves on set, removes on clear, and uses the raw setter for initial restore to avoid circular writes."

**Sarah Nakamura (Lead Eng):** "Rankings validates the restored value against `availableCuisines` to prevent stale data. If a cuisine is removed from the config, the filter gracefully resets to 'All'."

**Jasmine Taylor (Marketing):** "This is critical for the Indian Dallas launch. Our core users will select 'Indian' once and expect it to stick. Without persistence, every session starts from scratch — that's a drop-off point."

**Priya Sharma (QA):** "12 tests covering: save, remove, restore for both pages; raw setter usage for restore; separate storage keys; no cross-contamination."

## Changes
- `app/(tabs)/index.tsx` — Wrapped `setSelectedCuisine` with AsyncStorage persistence; restore on mount with validation
- `app/(tabs)/search.tsx` — Same pattern with separate `discover_cuisine` key

## Test Results
- **229 test files, 5,922 tests, all passing** (~3.2s)
