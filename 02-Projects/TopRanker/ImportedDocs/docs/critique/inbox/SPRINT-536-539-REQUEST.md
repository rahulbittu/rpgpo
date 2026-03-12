# Critique Request: Sprints 536-539

**Date:** 2026-03-10
**Submitted by:** Marcus Chen (CTO)
**Scope:** Health + Feature Sprint Cycle

## Sprint Summary

| Sprint | Feature |
|--------|---------|
| 536 | Profile page extraction — credibility section to ProfileCredibilitySection (628→446 LOC) |
| 537 | Settings page extraction — notification settings to NotificationSettings (557→301 LOC) |
| 538 | Dish leaderboard UX — visit type filter chips + enhanced photo display (160px) |
| 539 | WhatsApp share deeplinks — "Best In" controversy format sharing |

## Current Metrics

- 10,034 tests across 428 files
- 692.5kb server build
- 66 consecutive A-range arch grades
- 11 cities (5 active TX + 6 beta)
- 40+ admin endpoints

## Questions for External Watcher

1. **Profile extraction was deferred 4 consecutive audits (62-65):** We finally extracted the credibility section in Sprint 536, reducing profile.tsx from 628→446 LOC. Should there be a hard rule (e.g., "3 consecutive Watch flags = mandatory next sprint") rather than relying on SLT roadmap prioritization? Does the 4-audit delay indicate a process gap?

2. **NotificationSettings is a zero-prop component:** Sprint 537 extracted notification toggles into a component that manages its own state, effects, and server sync — requiring zero props from the parent. Is zero-prop extraction a good pattern for self-contained sections, or does it create hidden coupling through the API calls it makes internally?

3. **Dish leaderboard visit type filtering re-ranks server-side on every filter change:** Sprint 538 computes per-business visit-type-specific scores by joining dishVotes → ratings each time a filter is applied. With 50+ entries, this could be slow. Should we pre-compute visit type scores during the recalculation phase and store them, or is real-time computation acceptable at our current scale?

4. **WhatsApp share replaces Copy Link in BusinessActionBar:** Sprint 539 replaced the "Copy Link" action with "WhatsApp" because WhatsApp is our Phase 1 priority channel. Is removing a generic utility (Copy Link) in favor of a platform-specific button the right trade-off? Should we keep both and add a 6th button, or is 5 buttons the right limit for the action bar?

5. **Share domain mismatch (topranker.app vs topranker.com):** lib/sharing.ts generates `https://topranker.app/...` URLs but app.json configures deeplinks for `https://topranker.com/...`. WhatsApp shares will produce links that don't trigger in-app deeplinks. How critical is fixing this before the first WhatsApp group campaign?
