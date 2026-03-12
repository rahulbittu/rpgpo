# Retrospective — Sprint 308

**Date:** March 9, 2026
**Duration:** 1 session
**Story Points:** 2
**Facilitator:** Sarah Nakamura

## What Went Well

**Marcus Chen:** "Simple, high-impact UX fix. AsyncStorage persistence is a pattern we already use for banner dismissal, recent searches, and city selection. Cuisine filter is a natural addition."

**Amir Patel:** "The wrapper pattern — `setSelectedCuisine` wraps `setSelectedCuisineRaw` with side effects — is clean. The raw setter is only used for initial restore to avoid writing back the value we just read."

**Sarah Nakamura:** "Validation on restore is important. Rankings checks against `availableCuisines` so stale cuisines don't cause broken states. Discover trusts the value since cuisine chips render dynamically."

## What Could Improve

- **No cross-tab sync** — If user changes cuisine on Rankings, Discover doesn't know. Should they sync? Current decision: no, separate preferences per surface.
- **No expiration** — Persisted cuisine never expires. If a user hasn't visited in months, their last cuisine might not be relevant. Consider a 30-day TTL.
- **Discover doesn't validate** — Unlike Rankings, Discover doesn't check if the restored cuisine is still valid. Should add the same validation.

## Action Items
- [ ] Sprint 309: Dish rating flow — rate specific dish from leaderboard
- [ ] Future: Add validation to Discover cuisine restore
- [ ] Future: Consider TTL for persisted preferences

## Team Morale: 8/10
Quick win that directly improves returning user experience.
