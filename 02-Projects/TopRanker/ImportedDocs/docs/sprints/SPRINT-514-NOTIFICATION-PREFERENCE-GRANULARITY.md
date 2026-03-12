# Sprint 514: Notification Preference Granularity

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 5
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Add per-category notification preferences for claim updates and new ratings. Every push notification trigger now respects a dedicated user preference toggle. Users have granular control over exactly which notifications they receive.

## Team Discussion

**Marcus Chen (CTO):** "Before this sprint, onClaimDecision had no preference check — claim owners always received push notifications. And onNewRatingForBusiness reused the savedBusinessAlerts toggle, which is conceptually different. Now each category has its own toggle."

**Rachel Wei (CFO):** "10 notification preference toggles. Users get fine-grained control without being overwhelmed. The settings UI groups them logically: personal (tier, claim), social (challenger, ratings), digest (weekly, city), and marketing."

**Amir Patel (Architect):** "The backward compatibility for newRatings is well-handled: checks newRatings first, then falls back to savedBusinessAlerts if newRatings is undefined (existing users who haven't toggled the new setting). No breaking change for existing users."

**Sarah Nakamura (Lead Eng):** "Added type field to push data payloads for tier upgrade and claim decision notifications. This enables the client-side analytics to categorize opens more precisely."

**Jasmine Taylor (Marketing):** "10 toggles is the right balance. Users who complain about 'too many notifications' can now disable exactly the categories they don't want. This should reduce opt-out and improve engagement on the categories users do care about."

## Changes

### Modified: `app/settings.tsx`
- Added 2 new preference keys: claimUpdates, newRatings
- Added 2 new SettingRow toggles in notification section
- Total notification toggles: 8 → 10

### Modified: `server/notification-triggers.ts`
- onClaimDecision: now checks claimUpdates preference before sending
- onTierUpgrade: added type field to push data payload
- onClaimDecision: added type field to push data payload

### Modified: `server/notification-triggers-events.ts`
- onNewRatingForBusiness: checks newRatings preference with backward compatibility fallback to savedBusinessAlerts

### New: `__tests__/sprint514-notification-preference-granularity.test.ts` (14 tests)

## Test Coverage
- 14 new tests, all passing
- Full suite: 9,478 tests across 403 files, all passing in ~5.1s
- Server build: 676.7kb
