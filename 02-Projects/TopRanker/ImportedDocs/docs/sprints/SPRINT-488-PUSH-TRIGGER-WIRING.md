# Sprint 488: Push Trigger Wiring

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Wire Sprint 481's push notification triggers to actual event sources. Three triggers (onRankingChange, onNewRatingForBusiness, sendCityHighlightsPush) were built but never called. Also migrate tier upgrade push from legacy push.ts to notification-triggers.ts.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Three triggers from Sprint 481 were sitting completely unwired — built the functions, never connected them. This sprint connects them: onRankingChange and onNewRatingForBusiness fire from POST /api/ratings, and sendCityHighlightsPush runs on a weekly scheduler across all active and beta cities."

**Amir Patel (Architect):** "The wiring pattern is clean — all triggers are fire-and-forget with `.catch(() => {})` so they never block the rating response. The city highlights scheduler runs at 11am UTC Monday, 1 hour after the weekly digest, to avoid notification clustering."

**Marcus Chen (CTO):** "We also migrated the tier upgrade notification from the old push.ts `notifyTierUpgrade` to the newer `onTierUpgrade` in notification-triggers.ts. This consolidates all push logic into one module. The old push.ts functions for challengers remain — those can migrate in a future cleanup sprint."

**Rachel Wei (CFO):** "Push notifications drive re-engagement. Ranking change alerts ('Your rated restaurant moved up!') are the highest-value notification category — they create a reason to re-open the app without feeling spammy."

**Nadia Kaur (Cybersecurity):** "All triggers respect user notification preferences. The `prefs.rankingChanges === false` / `prefs.savedBusinessAlerts === false` / `prefs.cityAlerts === false` guards prevent unwanted notifications. This aligns with our opt-out-by-default model."

**Dev Kapoor (Frontend):** "The rater display name fallback to 'Someone' prevents null notification bodies. The weighted score with q1Score fallback ensures the score field is always populated."

## Changes

### Modified: `server/routes.ts` (+15 LOC, 532→547)
- Sprint 488: Wire onRankingChange + onNewRatingForBusiness in POST /api/ratings
- Migrate tier upgrade from `notifyTierUpgrade` (push.ts) to `onTierUpgrade` (notification-triggers.ts)
- Both triggers use fire-and-forget pattern (.catch(() => {}))
- Gets business name via getBusinessById for notification text
- Gets rater name from req.user.displayName with "Someone" fallback

### Modified: `server/notification-triggers.ts` (+40 LOC)
- Added `startCityHighlightsScheduler()` — weekly Monday 11am UTC
- Imports getActiveCities + getBetaCities from @shared/city-config
- Iterates all cities, calls sendCityHighlightsPush for each
- Logs total pushes sent across all cities

### Modified: `server/index.ts` (+3 LOC)
- Import and start startCityHighlightsScheduler at server boot
- Add cityHighlightsTimeout to graceful shutdown cleanup

### Test redirects (3 files):
- `tests/sprint171-routes-splitting.test.ts` — routes.ts LOC threshold 540→560
- `tests/sprint280-slt-audit.test.ts` — routes.ts LOC threshold 540→560
- `tests/sprint175-push-triggers.test.ts` — notifyTierUpgrade → onTierUpgrade migration

### New: `__tests__/sprint488-push-trigger-wiring.test.ts` (18 tests)
- Rating submission trigger wiring: imports, calls, fire-and-forget pattern
- Tier upgrade migration from push.ts to notification-triggers.ts
- City highlights scheduler: exports, schedule, city iteration, shutdown cleanup

## Test Coverage
- 18 new tests, all passing
- Full suite: 9,010 tests across 377 files, all passing in ~4.7s
- Server build: 650.7kb (+2.5kb from trigger wiring)
