# Sprint 511: Wire Push A/B into Notification Triggers

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 3
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Connect the push A/B testing framework (Sprint 508) to all 4 notification trigger categories. Each trigger now checks for an active experiment before sending, using variant content if available or falling back to default copy.

## Team Discussion

**Marcus Chen (CTO):** "The A/B framework existed but wasn't connected to any real notification flow. Now all 4 trigger categories — weekly digest, ranking change, new rating, city highlights — check for active experiments. One admin API call to create an experiment and every subsequent notification uses the variant."

**Rachel Wei (CFO):** "First experiment I want: weekly digest copy test. Control: 'Your weekly rankings update'. Treatment: 'Rankings changed — see who moved up in {city}'. The template variable system makes it easy to keep notifications personalized."

**Amir Patel (Architect):** "Clean wiring pattern: each trigger calls getNotificationVariant(memberId, category). If null (no active experiment), uses the original hardcoded copy. If a variant is returned, uses the variant's title/body with template variable replacement. Zero behavioral change when no experiments are running."

**Sarah Nakamura (Lead Eng):** "Template variables are category-specific: weeklyDigest supports {firstName}, rankingChange supports {emoji}/{business}/{direction}, etc. The replacement happens at send time so the same variant definition works for different member contexts."

**Jasmine Taylor (Marketing):** "Now I can create a push experiment through the admin API and immediately start testing different notification copy across all users. The DJB2 hash bucketing means consistent variant assignment — no flicker."

## Changes

### Modified: `server/notification-triggers.ts` (167→177 LOC)
- Added import: getNotificationVariant from push-ab-testing
- sendWeeklyDigestPush: checks for "weeklyDigest" A/B variant, supports {firstName} template variable
- Includes experimentId + variant name in push data payload when A/B active

### Modified: `server/notification-triggers-events.ts` (251→265 LOC)
- Added import: getNotificationVariant from push-ab-testing
- onRankingChange: checks for "rankingChange" A/B variant, supports {emoji}, {business}, {direction}, {newRank}, {oldRank}, {city} templates
- onNewRatingForBusiness: checks for "newRating" A/B variant, supports {business}, {rater}, {score} templates
- sendCityHighlightsPush: checks for "cityHighlights" A/B variant, supports {city}, {business}, {direction}, {delta} templates

### New: `__tests__/sprint511-push-ab-wiring.test.ts` (21 tests)

## Test Coverage
- 21 new tests, all passing
- Full suite: 9,425 tests across 400 files, all passing in ~5.2s
- Server build: 672.8kb
