# Sprint 481: Push Notification Triggers for New Categories

**Date:** 2026-03-10
**Duration:** 1 sprint cycle
**Story Points:** 4
**Owner:** Sarah Nakamura (Lead Eng)

## Mission

Implement the push notification trigger functions for the 3 new categories added in Sprint 479: ranking changes, saved business alerts (new ratings), and city highlights. Completes the preference→delivery pipeline.

## Team Discussion

**Sarah Nakamura (Lead Eng):** "Three new async triggers added to notification-triggers.ts. All follow the same pattern: query affected users → check preferences → send push. The file grew from 158 to ~310 LOC but each function is self-contained."

**Amir Patel (Architect):** "The onRankingChange trigger uses a significance threshold (delta >= 2 positions) to avoid notification fatigue. Good UX call. The sendCityHighlightsPush finds the biggest mover of the week — this is the kind of narrative-driven notification that drives re-engagement."

**Marcus Chen (CTO):** "This completes the Sprint 479 preferences pipeline. Users can now opt in to ranking changes, saved business alerts, and city highlights — and the system will actually deliver them. No more preferences without delivery."

**Jasmine Taylor (Marketing):** "City Highlights is the killer feature here. 'Best biryani in Irving just changed' as a push notification is exactly the controversy-driven engagement from our marketing strategy. The push practically writes our re-engagement campaign."

**Nadia Kaur (Cybersecurity):** "All three triggers respect the preference opt-out checks. The rater exclusion in onNewRatingForBusiness (ne condition) prevents users from getting notified about their own ratings. Good data hygiene."

**Rachel Wei (CFO):** "The preference→delivery pipeline is now complete for all 8 notification categories. This is table stakes for any engagement-driven product. The next step is measuring open rates and conversion."

## Changes

### Modified: `server/notification-triggers.ts` (+155 LOC, 158→~313)

**`onRankingChange(businessId, businessName, oldRank, newRank, city)`**
- Triggered after rank recalculation when position changes by >= 2
- Queries distinct raters of the business with push tokens
- Checks `rankingChanges` preference per user
- Sends directional notification: "📈 [Business] moved up. Now #X in [City]"
- Returns count of notifications sent

**`onNewRatingForBusiness(businessId, businessName, ratingMemberId, raterName, score)`**
- Triggered after rating submission
- Queries other members who rated the same business (excludes submitter)
- Checks `savedBusinessAlerts` preference per user
- Sends: "[RaterName] gave it a [score]. See how it affects the ranking."
- Returns count of notifications sent

**`sendCityHighlightsPush(city)`**
- Triggered weekly alongside digest
- Queries rank history for past 7 days, finds biggest mover
- Skips if biggest delta < 2 positions
- Queries all city users with push tokens
- Checks `cityAlerts` preference per user
- Sends: "[Business] climbed/dropped X spots this week"
- Returns count of notifications sent

### New: `__tests__/sprint481-push-triggers.test.ts` (22 tests)
- onRankingChange: structure, params, threshold, preference check, push content
- onNewRatingForBusiness: structure, exclusion, preference check, push content
- sendCityHighlightsPush: structure, week query, biggest mover, preference check
- Module structure: imports, header documentation

## Test Coverage
- 22 new tests, all passing
- Full suite: 8,885 tests across 371 files, all passing in ~4.7s
- Server build: 645.9kb (+5.5kb from trigger functions)
